"use client";

import { useEffect, useRef, useState } from "react";
import {
  DEFAULT_LOGO_OVERSCAN,
  DEFAULT_LOGO_MARGIN,
  DEFAULT_LOGO_SIZE,
  type QRDotType,
  type QRCornerSquareType,
  type QRCornerDotType,
} from "@/lib/qr";
import {
  applySmoothLogoSize,
  getLogoOptions,
} from "@/lib/qr-styling-options";
import { beginPreviewFade } from "@/lib/qr-preview-transition";

export type { QRDotType, QRCornerSquareType, QRCornerDotType };

interface QRPreviewProps {
  value: string;
  size?: number;
  fgColor?: string;
  bgColor?: string;
  level?: "L" | "M" | "Q" | "H";
  dotType?: QRDotType;
  cornerSquareType?: QRCornerSquareType;
  cornerDotType?: QRCornerDotType;
  logoImage?: string | null;
  logoSize?: number;
  logoMargin?: number;
  logoOverscan?: number;
}

type QRCodeStylingCtor = typeof import("qr-code-styling").default;

export function QRPreview({
  value,
  size = 256,
  fgColor = "#000000",
  bgColor = "#FFFFFF",
  level = "M",
  dotType = "square",
  cornerSquareType = "square",
  cornerDotType = "square",
  logoImage = null,
  logoSize = DEFAULT_LOGO_SIZE,
  logoMargin = DEFAULT_LOGO_MARGIN,
  logoOverscan = DEFAULT_LOGO_OVERSCAN,
}: QRPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [QRStyling, setQRStyling] = useState<QRCodeStylingCtor | null>(null);

  useEffect(() => {
    let active = true;
    import("qr-code-styling").then((mod) => {
      if (active) setQRStyling(() => mod.default);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (!QRStyling || !value) {
      return;
    }

    let cancelled = false;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const transition = beginPreviewFade(container, reducedMotion);
    const nextFrame = document.createElement("div");
    nextFrame.style.width = `${size}px`;
    nextFrame.style.height = `${size}px`;

    const qr = new QRStyling({
      width: size,
      height: size,
      type: "svg",
      data: value,
      margin: 4,
      dotsOptions: { color: fgColor, type: dotType },
      cornersSquareOptions: { color: fgColor, type: cornerSquareType },
      cornersDotOptions: { color: fgColor, type: cornerDotType },
      backgroundOptions: { color: bgColor },
      qrOptions: { errorCorrectionLevel: level },
      ...getLogoOptions(logoImage),
    });

    qr.append(nextFrame);
    void qr
      .getRawData("svg")
      .then(() => {
        if (cancelled) return;
        const svg = nextFrame.querySelector("svg");
        if (svg && logoImage) {
          applySmoothLogoSize(svg, {
            logoSize,
            logoMargin,
            logoOverscan,
          });
        }
        transition.commit(nextFrame);
      })
      .catch(() => {
        if (!cancelled) transition.cancel(true);
      });

    return () => {
      cancelled = true;
      transition.cancel();
    };
  }, [QRStyling, value, size, fgColor, bgColor, level, dotType, cornerSquareType, cornerDotType, logoImage, logoSize, logoMargin, logoOverscan]);

  if (!value) {
    return (
      <div
        className="flex items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50"
        style={{ width: size, height: size }}
      >
        <p className="px-4 text-center text-sm text-gray-400 dark:text-gray-500">
          Enter content to generate a QR code
        </p>
      </div>
    );
  }

  return (
    <div
      className="inline-flex rounded-2xl p-4 shadow-lg"
      style={{ backgroundColor: bgColor === "transparent" ? "transparent" : bgColor }}
    >
      <div
        ref={containerRef}
        className="relative opacity-100 transition-opacity duration-150 ease-out motion-reduce:transition-none"
        style={{ width: size, height: size }}
      />
    </div>
  );
}
