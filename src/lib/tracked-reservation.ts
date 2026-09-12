import { prisma } from "@/lib/prisma";
import {
  buildQRData,
  serializeStyle,
  TRACKABLE_TYPES,
  type QRGenerateInput,
  type QRTypeValue,
} from "@/lib/qr";
import { generateShortCode } from "@/lib/shortcode";
import { SITE_URL } from "@/lib/constants";

export const TRACKED_RESERVATION_TTL_MS = 60 * 60 * 1000;
const MAX_SHORT_CODE_ATTEMPTS = 10;

export type ReservationErrorCode =
  | "NOT_FOUND"
  | "EXPIRED"
  | "ALREADY_ACTIVE"
  | "DESTINATION_MISMATCH"
  | "INVALID_DESTINATION"
  | "SHORT_CODE_UNAVAILABLE";

export class ReservationError extends Error {
  constructor(
    public readonly code: ReservationErrorCode,
    message: string
  ) {
    super(message);
    this.name = "ReservationError";
  }
}

export interface ReservationInput {
  type: QRTypeValue;
  content: string;
}

export interface ReservationResult {
  reservationId: string;
  shortCode: string;
  shortUrl: string;
  qrData: string;
  expiresAt: Date;
}

export function getReservationExpiry(now = new Date()): Date {
  return new Date(now.getTime() + TRACKED_RESERVATION_TTL_MS);
}

export function isReservationExpired(
  expiresAt: Date,
  now = new Date()
): boolean {
  return expiresAt.getTime() <= now.getTime();
}

export function getTrackedDestination({
  type,
  content,
}: ReservationInput): string {
  if (!TRACKABLE_TYPES.has(type)) {
    throw new ReservationError(
      "INVALID_DESTINATION",
      "This QR type does not support tracked mode"
    );
  }

  const destination = buildQRData(type, content);
  try {
    const url = new URL(destination);
    if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error();
  } catch {
    throw new ReservationError(
      "INVALID_DESTINATION",
      "Tracked QR codes need a full http(s) URL"
    );
  }

  return destination;
}

export function reservationMatchesInput(
  reservedType: QRTypeValue | null,
  reservedDestination: string | null,
  input: ReservationInput
): boolean {
  if (!reservedType || !reservedDestination || reservedType !== input.type) {
    return false;
  }

  return reservedDestination === getTrackedDestination(input);
}

function resultFromRecord(record: {
  id: string;
  shortCode: string;
  expiresAt: Date;
}): ReservationResult {
  const shortUrl = `${SITE_URL}/r/${record.shortCode}`;
  return {
    reservationId: record.id,
    shortCode: record.shortCode,
    shortUrl,
    qrData: shortUrl,
    expiresAt: record.expiresAt,
  };
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

async function clearExpiredReservations(now: Date): Promise<void> {
  await prisma.trackedQRReservation.updateMany({
    where: {
      activatedAt: null,
      expiredAt: null,
      expiresAt: { lte: now },
    },
    data: {
      userId: null,
      type: null,
      destinationUrl: null,
      expiredAt: now,
    },
  });
}

export async function reserveTrackedQRCode(
  userId: string,
  input: ReservationInput,
  now = new Date()
): Promise<ReservationResult> {
  const destinationUrl = getTrackedDestination(input);
  const expiresAt = getReservationExpiry(now);

  // This also removes private data from abandoned reservations. Claims remain.
  await clearExpiredReservations(now);

  for (let attempt = 0; attempt < MAX_SHORT_CODE_ATTEMPTS; attempt++) {
    const shortCode = generateShortCode();
    const legacyCode = await prisma.qRCode.findUnique({
      where: { shortCode },
      select: { id: true },
    });
    if (legacyCode) continue;

    try {
      const reservation = await prisma.trackedQRReservation.create({
        data: {
          shortCode,
          userId,
          type: input.type,
          destinationUrl,
          expiresAt,
        },
        select: { id: true, shortCode: true, expiresAt: true },
      });
      return resultFromRecord(reservation);
    } catch (error) {
      if (isUniqueConstraintError(error)) continue;
      throw error;
    }
  }

  throw new ReservationError(
    "SHORT_CODE_UNAVAILABLE",
    "Failed to reserve a unique short code. Please try again."
  );
}

export async function renewTrackedQRCode(
  reservationId: string,
  userId: string,
  input: ReservationInput,
  now = new Date()
): Promise<ReservationResult> {
  const destinationUrl = getTrackedDestination(input);
  const expiresAt = getReservationExpiry(now);

  return prisma.$transaction(async (tx) => {
    const reservation = await tx.trackedQRReservation.findFirst({
      where: { id: reservationId, userId },
    });
    if (!reservation) {
      throw new ReservationError("NOT_FOUND", "Reservation not found");
    }
    if (reservation.activatedAt) {
      throw new ReservationError(
        "ALREADY_ACTIVE",
        "This tracked QR code is already active"
      );
    }
    if (isReservationExpired(reservation.expiresAt, now)) {
      await tx.trackedQRReservation.update({
        where: { id: reservation.id },
        data: {
          userId: null,
          type: null,
          destinationUrl: null,
          expiredAt: now,
        },
      });
      return { kind: "expired" as const };
    }

    const updated = await tx.trackedQRReservation.update({
      where: { id: reservation.id },
      data: {
        type: input.type,
        destinationUrl,
        expiresAt,
      },
      select: { id: true, shortCode: true, expiresAt: true },
    });
    return { kind: "updated" as const, reservation: updated };
  }).then((result) => {
    if (result.kind === "expired") {
      throw new ReservationError(
        "EXPIRED",
        "This reservation expired. Create a new tracked preview."
      );
    }
    return resultFromRecord(result.reservation);
  });
}

export async function activateTrackedQRCode(
  reservationId: string,
  userId: string,
  input: QRGenerateInput,
  now = new Date()
): Promise<{ id: string; shortUrl: string; qrData: string }> {
  if (input.isDirect) {
    throw new ReservationError(
      "INVALID_DESTINATION",
      "Tracked activation requires tracked mode"
    );
  }

  const destinationUrl = getTrackedDestination(input);
  const style = serializeStyle({
    dotType: input.dotType,
    cornerSquareType: input.cornerSquareType,
    cornerDotType: input.cornerDotType,
    logoSize: input.logoSize,
    logoMargin: input.logoMargin,
    logoOverscan: input.logoOverscan,
  });

  const outcome = await prisma.$transaction(async (tx) => {
    const reservation = await tx.trackedQRReservation.findFirst({
      where: { id: reservationId, userId },
    });
    if (!reservation) return { kind: "not-found" as const };
    if (reservation.activatedAt && reservation.activatedQRCodeId) {
      // Activation is idempotent. A client can safely retry after a lost response.
      return {
        kind: "created" as const,
        id: reservation.activatedQRCodeId,
        shortCode: reservation.shortCode,
      };
    }
    if (reservation.activatedAt) return { kind: "active" as const };
    if (isReservationExpired(reservation.expiresAt, now)) {
      await tx.trackedQRReservation.update({
        where: { id: reservation.id },
        data: {
          userId: null,
          type: null,
          destinationUrl: null,
          expiredAt: now,
        },
      });
      return { kind: "expired" as const };
    }
    if (
      !reservationMatchesInput(
        reservation.type as QRTypeValue | null,
        reservation.destinationUrl,
        input
      )
    ) {
      return { kind: "mismatch" as const };
    }

    // Claim the row before the QR record is created. PostgreSQL locks the row
    // for this conditional update. A concurrent request gets count 0 after the
    // first transaction commits and then returns that transaction's result.
    const claim = await tx.trackedQRReservation.updateMany({
      where: {
        id: reservation.id,
        userId,
        activatedAt: null,
        expiredAt: null,
        expiresAt: { gt: now },
      },
      data: { activatedAt: now },
    });
    if (claim.count === 0) {
      const activated = await tx.trackedQRReservation.findFirst({
        where: { id: reservation.id, userId },
        select: {
          shortCode: true,
          activatedAt: true,
          activatedQRCodeId: true,
        },
      });
      if (activated?.activatedAt && activated.activatedQRCodeId) {
        return {
          kind: "created" as const,
          id: activated.activatedQRCodeId,
          shortCode: activated.shortCode,
        };
      }
      return { kind: "active" as const };
    }

    const qrCode = await tx.qRCode.create({
      data: {
        userId,
        type: input.type,
        content: input.content,
        foregroundColor: input.foregroundColor,
        backgroundColor: input.backgroundColor,
        errorCorrection: input.errorCorrection,
        size: input.size,
        style,
        logoUrl: input.logoUrl,
        isDirect: false,
        shortCode: reservation.shortCode,
        destinationUrl,
      },
      select: { id: true },
    });

    await tx.trackedQRReservation.update({
      where: { id: reservation.id },
      data: {
        type: null,
        destinationUrl: null,
        activatedQRCodeId: qrCode.id,
      },
    });

    return {
      kind: "created" as const,
      id: qrCode.id,
      shortCode: reservation.shortCode,
    };
  }).catch(async (error) => {
    if (isUniqueConstraintError(error)) {
      // Two activation requests can race. The transaction that committed first
      // owns the result, so return that same active code to the second request.
      const activated = await prisma.trackedQRReservation.findFirst({
        where: {
          id: reservationId,
          userId,
          activatedAt: { not: null },
          activatedQRCodeId: { not: null },
        },
        select: {
          shortCode: true,
          activatedQRCodeId: true,
        },
      });
      if (activated?.activatedQRCodeId) {
        return {
          kind: "created" as const,
          id: activated.activatedQRCodeId,
          shortCode: activated.shortCode,
        };
      }
    }
    throw error;
  });

  switch (outcome.kind) {
    case "not-found":
      throw new ReservationError("NOT_FOUND", "Reservation not found");
    case "active":
      throw new ReservationError(
        "ALREADY_ACTIVE",
        "This tracked QR code is already active"
      );
    case "expired":
      throw new ReservationError(
        "EXPIRED",
        "This reservation expired. Create a new tracked preview."
      );
    case "mismatch":
      throw new ReservationError(
        "DESTINATION_MISMATCH",
        "Update the tracked preview before you create this QR code"
      );
    case "created": {
      const shortUrl = `${SITE_URL}/r/${outcome.shortCode}`;
      return { id: outcome.id, shortUrl, qrData: shortUrl };
    }
  }
}

export async function getReservedRedirect(shortCode: string, now = new Date()) {
  return prisma.$transaction(async (tx) => {
    const reservation = await tx.trackedQRReservation.findUnique({
      where: { shortCode },
      select: {
        id: true,
        destinationUrl: true,
        expiresAt: true,
        activatedAt: true,
      },
    });
    if (!reservation || reservation.activatedAt || !reservation.destinationUrl) {
      return null;
    }
    if (isReservationExpired(reservation.expiresAt, now)) {
      await tx.trackedQRReservation.update({
        where: { id: reservation.id },
        data: {
          userId: null,
          type: null,
          destinationUrl: null,
          expiredAt: now,
        },
      });
      return null;
    }
    return reservation.destinationUrl;
  });
}
