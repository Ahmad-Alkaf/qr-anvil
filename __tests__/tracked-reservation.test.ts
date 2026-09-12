import { beforeEach, describe, expect, it, vi } from "vitest";
import type { QRGenerateInput } from "@/lib/qr";

const mocks = vi.hoisted(() => {
  const transactionClient = {
    trackedQRReservation: {
      findFirst: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    qRCode: { create: vi.fn() },
  };

  return {
    transactionClient,
    prisma: {
      $transaction: vi.fn(
        async (callback: (tx: typeof transactionClient) => unknown) =>
          callback(transactionClient)
      ),
      trackedQRReservation: {
        updateMany: vi.fn(),
        create: vi.fn(),
        findFirst: vi.fn(),
      },
      qRCode: { findUnique: vi.fn() },
    },
  };
});

vi.mock("@/lib/prisma", () => ({ prisma: mocks.prisma }));

import {
  activateTrackedQRCode,
  getReservationExpiry,
  isReservationExpired,
  TRACKED_RESERVATION_TTL_MS,
} from "@/lib/tracked-reservation";

const input: QRGenerateInput = {
  type: "URL",
  content: "https://example.com/destination",
  foregroundColor: "#000000",
  backgroundColor: "#FFFFFF",
  size: 300,
  errorCorrection: "M",
  dotType: "square",
  cornerSquareType: "square",
  cornerDotType: "square",
  logoSize: 0.5,
  logoMargin: 0.01,
  logoOverscan: 0,
  logoUrl: null,
  isDirect: false,
};

describe("tracked QR reservation lifecycle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.transactionClient.trackedQRReservation.updateMany.mockResolvedValue({
      count: 1,
    });
  });

  it("uses a one-hour lease and expires at the boundary", () => {
    const now = new Date("2026-09-12T10:00:00.000Z");
    const expiresAt = getReservationExpiry(now);

    expect(expiresAt.getTime() - now.getTime()).toBe(
      TRACKED_RESERVATION_TTL_MS
    );
    expect(isReservationExpired(expiresAt, new Date(expiresAt.getTime() - 1))).toBe(
      false
    );
    expect(isReservationExpired(expiresAt, expiresAt)).toBe(true);
  });

  it("activates the exact reserved short code and removes draft data", async () => {
    const now = new Date("2026-09-12T10:00:00.000Z");
    mocks.transactionClient.trackedQRReservation.findFirst.mockResolvedValue({
      id: "reservation-1",
      shortCode: "Exact123",
      userId: "user-1",
      type: "URL",
      destinationUrl: input.content,
      expiresAt: new Date(now.getTime() + 60_000),
      activatedAt: null,
    });
    mocks.transactionClient.qRCode.create.mockResolvedValue({ id: "qr-1" });
    mocks.transactionClient.trackedQRReservation.update.mockResolvedValue({});

    const result = await activateTrackedQRCode(
      "reservation-1",
      "user-1",
      input,
      now
    );

    expect(mocks.transactionClient.qRCode.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          shortCode: "Exact123",
          destinationUrl: input.content,
        }),
      })
    );
    expect(mocks.transactionClient.trackedQRReservation.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          destinationUrl: null,
          type: null,
          activatedQRCodeId: "qr-1",
        }),
      })
    );
    expect(result.qrData).toContain("/r/Exact123");
  });

  it("tombstones an expired claim without creating a QR code", async () => {
    const now = new Date("2026-09-12T10:00:00.000Z");
    mocks.transactionClient.trackedQRReservation.findFirst.mockResolvedValue({
      id: "reservation-1",
      shortCode: "Expired1",
      userId: "user-1",
      type: "URL",
      destinationUrl: input.content,
      expiresAt: new Date(now.getTime() - 1),
      activatedAt: null,
    });
    mocks.transactionClient.trackedQRReservation.update.mockResolvedValue({});

    await expect(
      activateTrackedQRCode("reservation-1", "user-1", input, now)
    ).rejects.toMatchObject({ code: "EXPIRED" });

    expect(mocks.transactionClient.qRCode.create).not.toHaveBeenCalled();
    expect(mocks.transactionClient.trackedQRReservation.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: null,
          type: null,
          destinationUrl: null,
          expiredAt: now,
        }),
      })
    );
  });

  it("returns the first result when activation is retried", async () => {
    const now = new Date("2026-09-12T10:00:00.000Z");
    mocks.transactionClient.trackedQRReservation.findFirst.mockResolvedValue({
      id: "reservation-1",
      shortCode: "Stable12",
      userId: "user-1",
      type: null,
      destinationUrl: null,
      expiresAt: new Date(now.getTime() - 1),
      activatedAt: now,
      activatedQRCodeId: "qr-1",
    });

    const result = await activateTrackedQRCode(
      "reservation-1",
      "user-1",
      input,
      now
    );

    expect(result).toMatchObject({ id: "qr-1" });
    expect(result.qrData).toContain("/r/Stable12");
    expect(mocks.transactionClient.qRCode.create).not.toHaveBeenCalled();
  });

  it("returns one result when a concurrent request already claimed the row", async () => {
    const now = new Date("2026-09-12T10:00:00.000Z");
    const reserved = {
      id: "reservation-1",
      shortCode: "Claimed1",
      userId: "user-1",
      type: "URL",
      destinationUrl: input.content,
      expiresAt: new Date(now.getTime() + 60_000),
      activatedAt: null,
      activatedQRCodeId: null,
    };
    mocks.transactionClient.trackedQRReservation.findFirst
      .mockResolvedValueOnce(reserved)
      .mockResolvedValueOnce({
        shortCode: reserved.shortCode,
        activatedAt: now,
        activatedQRCodeId: "qr-first",
      });
    mocks.transactionClient.trackedQRReservation.updateMany.mockResolvedValue({
      count: 0,
    });

    const result = await activateTrackedQRCode(
      reserved.id,
      reserved.userId,
      input,
      now
    );

    expect(result).toMatchObject({ id: "qr-first" });
    expect(result.qrData).toContain("/r/Claimed1");
    expect(mocks.transactionClient.qRCode.create).not.toHaveBeenCalled();
  });

  it("rejects activation when the preview destination changed", async () => {
    const now = new Date("2026-09-12T10:00:00.000Z");
    mocks.transactionClient.trackedQRReservation.findFirst.mockResolvedValue({
      id: "reservation-1",
      shortCode: "Stable12",
      userId: "user-1",
      type: "URL",
      destinationUrl: "https://example.com/old",
      expiresAt: new Date(now.getTime() + 60_000),
      activatedAt: null,
    });

    await expect(
      activateTrackedQRCode("reservation-1", "user-1", input, now)
    ).rejects.toMatchObject({
      code: "DESTINATION_MISMATCH",
    });
    expect(mocks.transactionClient.qRCode.create).not.toHaveBeenCalled();
  });
});
