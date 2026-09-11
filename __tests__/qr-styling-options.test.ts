import QRCodeStyling from "qr-code-styling";
import { describe, expect, it } from "vitest";
import {
  getLogoCropRect,
  getLogoLayout,
  getLogoOptions,
  getPreparedLogoSize,
} from "@/lib/qr-styling-options";

describe("getLogoOptions", () => {
  it("does not replace qr-code-styling defaults when there is no logo", () => {
    const hadWindow = "window" in globalThis;
    const originalWindow = globalThis.window;
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {},
    });

    try {
      expect(
        () => new QRCodeStyling({ data: "", ...getLogoOptions(null) }),
      ).not.toThrow();
    } finally {
      if (hadWindow) {
        Object.defineProperty(globalThis, "window", {
          configurable: true,
          value: originalWindow,
        });
      } else {
        Reflect.deleteProperty(globalThis, "window");
      }
    }
  });

  it("reserves the safe center area when there is a logo", () => {
    expect(
      getLogoOptions("data:image/png;base64,abc").imageOptions?.imageSize,
    ).toBe(0.7);
  });

  it("keeps background dots for the exact protection mask", () => {
    expect(getLogoOptions("data:image/png;base64,abc")).toEqual({
      image: "data:image/png;base64,abc",
      imageOptions: {
        hideBackgroundDots: false,
        imageSize: 0.7,
        margin: 0,
        saveAsBlob: true,
      },
    });
  });

  it("does not overscan a logo by default", () => {
    expect(getLogoCropRect(500, 200, 0)).toEqual({
      x: 0,
      y: 0,
      width: 500,
      height: 200,
    });
  });

  it("applies the selected logo zoom", () => {
    expect(getLogoCropRect(500, 200, 0.1)).toEqual({
      x: -25,
      y: -10,
      width: 550,
      height: 220,
    });
    expect(getLogoCropRect(500, 200, 0.2)).toEqual({
      x: -50,
      y: -20,
      width: 600,
      height: 240,
    });
    expect(getLogoCropRect(500, 200, 0.5)).toEqual({
      x: -125,
      y: -50,
      width: 750,
      height: 300,
    });
  });

  it("keeps a wide 40 percent logo inside the safe center area", () => {
    const layout = getLogoLayout({
      safeRect: { x: 70, y: 119, width: 140, height: 42 },
      canvasWidth: 280,
      canvasHeight: 280,
      logoSize: 0.4,
      logoMargin: 0,
      logoOverscan: 0,
    });

    expect(layout.frameRect).toEqual({
      x: 100,
      y: 128,
      width: 80,
      height: 24,
    });
    expect(layout.imageRect).toEqual(layout.frameRect);
  });

  it("adds the selected margin to the protected QR area", () => {
    const layout = getLogoLayout({
      safeRect: { x: 70, y: 119, width: 140, height: 42 },
      canvasWidth: 280,
      canvasHeight: 280,
      logoSize: 0.4,
      logoMargin: 0.04,
      logoOverscan: 0,
    });

    expect(layout.protectedRect).toEqual({
      x: 88.8,
      y: 116.8,
      width: 102.4,
      height: 46.4,
    });
  });

  it("keeps more pixels without enlarging a small source", () => {
    expect(getPreparedLogoSize(512, 512, 768)).toEqual({
      width: 512,
      height: 512,
    });
    expect(getPreparedLogoSize(2400, 1200, 768)).toEqual({
      width: 768,
      height: 384,
    });
  });

  it("changes the visible logo width at every one percent step", () => {
    const options = {
      safeRect: { x: 72.5, y: 72.5, width: 135, height: 135 },
      canvasWidth: 280,
      canvasHeight: 280,
      logoMargin: 0.01,
      logoOverscan: 0,
    };
    const widths = [0.5, 0.51, 0.52].map(
      (logoSize) => getLogoLayout({ ...options, logoSize }).frameRect.width,
    );

    expect(widths[1]).toBeGreaterThan(widths[0]);
    expect(widths[2]).toBeGreaterThan(widths[1]);
  });
});
