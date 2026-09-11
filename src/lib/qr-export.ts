/**
 * Browser-only helpers that render a QR code to a file and trigger a
 * download. The server never generates images.
 */
import {
  DEFAULT_LOGO_OVERSCAN,
  DEFAULT_LOGO_MARGIN,
  DEFAULT_LOGO_SIZE,
  type QRDotType,
  type QRCornerSquareType,
  type QRCornerDotType,
} from "./qr";
import { applySmoothLogoSize, getLogoOptions } from "./qr-styling-options";

export type DownloadFormat = "png" | "svg" | "pdf";
export type ErrorCorrection = "L" | "M" | "Q" | "H";

export const EXPORT_SIZE = 600;

export interface RenderOptions {
  data: string;
  format: DownloadFormat;
  fgColor: string;
  bgColor: string;
  errorCorrection: ErrorCorrection;
  dotType: QRDotType;
  cornerSquareType: QRCornerSquareType;
  cornerDotType: QRCornerDotType;
  logoImage?: string | null;
  logoSize?: number;
  logoMargin?: number;
  logoOverscan?: number;
  size?: number;
}

export async function renderQRBlob(options: RenderOptions): Promise<Blob> {
  const { default: QRCodeStyling } = await import("qr-code-styling");
  const size = options.size ?? EXPORT_SIZE;
  const qrMargin = 8;

  const qr = new QRCodeStyling({
    width: size,
    height: size,
    type: "svg",
    data: options.data,
    margin: qrMargin,
    dotsOptions: { color: options.fgColor, type: options.dotType },
    cornersSquareOptions: { color: options.fgColor, type: options.cornerSquareType },
    cornersDotOptions: { color: options.fgColor, type: options.cornerDotType },
    backgroundOptions: { color: options.bgColor },
    qrOptions: { errorCorrectionLevel: options.errorCorrection },
    ...getLogoOptions(options.logoImage),
  });

  const container = document.createElement("div");
  qr.append(container);
  const rawSvg = await qr.getRawData("svg");
  if (!rawSvg) throw new Error("Failed to generate SVG");

  const svg = container.querySelector("svg");
  if (!svg) throw new Error("Failed to generate SVG");
  if (options.logoImage) {
    applySmoothLogoSize(svg, {
      logoSize: options.logoSize ?? DEFAULT_LOGO_SIZE,
      logoMargin: options.logoMargin ?? DEFAULT_LOGO_MARGIN,
      logoOverscan: options.logoOverscan ?? DEFAULT_LOGO_OVERSCAN,
    });
  }

  const svgBlob = serializeSvg(svg);
  if (options.format === "svg") return svgBlob;

  const png = await createPngFromSvg(svgBlob, size);
  if (options.format === "png") return png;

  return createPdfFromPng(png);
}

function serializeSvg(svg: SVGSVGElement): Blob {
  const source = new XMLSerializer().serializeToString(svg);
  return new Blob(
    [`<?xml version="1.0" standalone="no"?>\r\n${source}`],
    { type: "image/svg+xml" },
  );
}

async function createPngFromSvg(svgBlob: Blob, size: number): Promise<Blob> {
  const objectUrl = URL.createObjectURL(svgBlob);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const nextImage = new Image();
      nextImage.onload = () => resolve(nextImage);
      nextImage.onerror = () => reject(new Error("Failed to render PNG"));
      nextImage.src = objectUrl;
    });
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Failed to render PNG");
    context.drawImage(image, 0, 0, size, size);

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => blob ? resolve(blob) : reject(new Error("Failed to render PNG")),
        "image/png",
      );
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function createPdfFromPng(pngBlob: Blob): Promise<Blob> {
  const { PDFDocument } = await import("pdf-lib");
  const pdfDoc = await PDFDocument.create();
  const pngBytes = new Uint8Array(await pngBlob.arrayBuffer());
  const pngImage = await pdfDoc.embedPng(pngBytes);
  const padding = 40;
  const pageW = pngImage.width + padding * 2;
  const pageH = pngImage.height + padding * 2;
  const page = pdfDoc.addPage([pageW, pageH]);
  page.drawImage(pngImage, {
    x: padding,
    y: padding,
    width: pngImage.width,
    height: pngImage.height,
  });
  const pdfBytes = await pdfDoc.save();
  return new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
