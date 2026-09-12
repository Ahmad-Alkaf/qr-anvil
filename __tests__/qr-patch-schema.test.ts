import { describe, expect, it } from "vitest";
import { qrPatchSchema } from "@/lib/qr";

const DESIGN_KEYS = [
  "foregroundColor",
  "backgroundColor",
  "size",
  "errorCorrection",
  "dotType",
  "cornerSquareType",
  "cornerDotType",
  "logoSize",
  "logoMargin",
  "logoOverscan",
  "logoUrl",
] as const;

describe("qrPatchSchema", () => {
  it("keeps absent design keys absent so a partial update does not reset the design", () => {
    const parsed = qrPatchSchema.parse({
      name: "asdf asdf",
      destinationUrl: "https://qr-anvil.com",
    });

    for (const key of DESIGN_KEYS) {
      expect(parsed, `${key} must stay absent`).not.toHaveProperty(key);
    }
    expect(Object.keys(parsed).sort()).toEqual(["destinationUrl", "name"]);
  });

  it("keeps the design untouched when only the destination changes", () => {
    const parsed = qrPatchSchema.parse({
      destinationUrl: "https://qr-anvil.com/new",
    });

    expect(Object.keys(parsed)).toEqual(["destinationUrl"]);
  });

  it("keeps design values that the body supplies", () => {
    const parsed = qrPatchSchema.parse({
      foregroundColor: "#112233",
      backgroundColor: "transparent",
      size: 512,
      errorCorrection: "H",
      dotType: "dots",
      cornerSquareType: "dot",
      cornerDotType: "dot",
      logoSize: 0.3,
      logoMargin: 0.02,
      logoOverscan: 0.2,
    });

    expect(parsed).toMatchObject({
      foregroundColor: "#112233",
      backgroundColor: "transparent",
      size: 512,
      errorCorrection: "H",
      dotType: "dots",
      cornerSquareType: "dot",
      cornerDotType: "dot",
    });
  });

  it("allows an explicit null logo so the owner can remove the logo", () => {
    const parsed = qrPatchSchema.parse({ logoUrl: null });
    expect(parsed).toHaveProperty("logoUrl", null);
  });

  it("rejects an invalid design value", () => {
    expect(qrPatchSchema.safeParse({ foregroundColor: "red" }).success).toBe(false);
    expect(qrPatchSchema.safeParse({ size: 10 }).success).toBe(false);
  });
});
