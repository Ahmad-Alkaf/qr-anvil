import {
  DEFAULT_LOGO_OVERSCAN,
  LOGO_OVERSCAN_MAX,
  LOGO_SIZE_MAX,
} from "./qr";

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface LogoLayoutOptions {
  safeRect: Rect;
  canvasWidth: number;
  canvasHeight: number;
  logoSize: number;
  logoMargin: number;
  logoOverscan: number;
}

interface ApplyLogoOptions {
  logoSize: number;
  logoMargin: number;
  logoOverscan: number;
}

const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

function roundLayoutValue(value: number) {
  return Math.round(value * 1_000_000) / 1_000_000;
}

function makeRect(x: number, y: number, width: number, height: number): Rect {
  return {
    x: roundLayoutValue(x),
    y: roundLayoutValue(y),
    width: roundLayoutValue(width),
    height: roundLayoutValue(height),
  };
}

export function getPreparedLogoSize(
  sourceWidth: number,
  sourceHeight: number,
  maxSide: number,
) {
  const scale = Math.min(1, maxSide / Math.max(sourceWidth, sourceHeight));

  return {
    width: Math.max(1, Math.floor(sourceWidth * scale)),
    height: Math.max(1, Math.floor(sourceHeight * scale)),
  };
}

export function getLogoCropRect(
  width: number,
  height: number,
  logoOverscan = DEFAULT_LOGO_OVERSCAN,
) {
  const overscan = 1 + Math.min(LOGO_OVERSCAN_MAX, Math.max(0, logoOverscan));
  const croppedWidth = width * overscan;
  const croppedHeight = height * overscan;

  return makeRect(
    (width - croppedWidth) / 2,
    (height - croppedHeight) / 2,
    croppedWidth,
    croppedHeight,
  );
}

export function getLogoLayout({
  safeRect,
  canvasWidth,
  canvasHeight,
  logoSize,
  logoMargin,
  logoOverscan,
}: LogoLayoutOptions) {
  const sizeScale = Math.min(1, Math.max(0, logoSize / LOGO_SIZE_MAX));
  const frameWidth = safeRect.width * sizeScale;
  const frameHeight = safeRect.height * sizeScale;
  const frameRect = makeRect(
    (canvasWidth - frameWidth) / 2,
    (canvasHeight - frameHeight) / 2,
    frameWidth,
    frameHeight,
  );
  const cropRect = getLogoCropRect(
    frameRect.width,
    frameRect.height,
    logoOverscan,
  );
  const imageRect = makeRect(
    frameRect.x + cropRect.x,
    frameRect.y + cropRect.y,
    cropRect.width,
    cropRect.height,
  );
  const margin = canvasWidth * logoMargin;
  const protectedRect = makeRect(
    frameRect.x - margin,
    frameRect.y - margin,
    frameRect.width + margin * 2,
    frameRect.height + margin * 2,
  );

  return { frameRect, imageRect, protectedRect };
}

function appendRect(parent: SVGElement, rect: Rect, fill?: string) {
  const element = document.createElementNS(SVG_NAMESPACE, "rect");
  element.setAttribute("x", String(rect.x));
  element.setAttribute("y", String(rect.y));
  element.setAttribute("width", String(rect.width));
  element.setAttribute("height", String(rect.height));
  if (fill) element.setAttribute("fill", fill);
  parent.appendChild(element);
}

export function applySmoothLogoSize(
  svg: SVGSVGElement,
  options: ApplyLogoOptions,
) {
  const image = svg.querySelector("image");
  if (!image) return;

  const safeRect = {
    x: Number.parseFloat(image.getAttribute("x") ?? "0"),
    y: Number.parseFloat(image.getAttribute("y") ?? "0"),
    width: Number.parseFloat(image.getAttribute("width") ?? "0"),
    height: Number.parseFloat(image.getAttribute("height") ?? "0"),
  };
  if (safeRect.width <= 0 || safeRect.height <= 0) return;

  const viewBox = svg.viewBox.baseVal;
  const canvasWidth =
    viewBox.width || Number.parseFloat(svg.getAttribute("width") ?? "0");
  const canvasHeight =
    viewBox.height || Number.parseFloat(svg.getAttribute("height") ?? "0");
  if (canvasWidth <= 0 || canvasHeight <= 0) return;

  const layout = getLogoLayout({
    safeRect,
    canvasWidth,
    canvasHeight,
    logoSize: options.logoSize,
    logoMargin: options.logoMargin,
    logoOverscan: options.logoOverscan,
  });

  image.setAttribute("x", String(layout.imageRect.x));
  image.setAttribute("y", String(layout.imageRect.y));
  image.setAttribute("width", String(layout.imageRect.width));
  image.setAttribute("height", String(layout.imageRect.height));

  const defs = svg.querySelector("defs");
  const dotClipPath = svg.querySelector<SVGClipPathElement>(
    'clipPath[id^="clip-path-dot-color-"]',
  );
  const dotColorRect = svg.querySelector<SVGElement>(
    'rect[clip-path*="clip-path-dot-color-"]',
  );
  if (!defs || !dotClipPath || !dotColorRect) {
    throw new Error("The QR logo protection area could not be created.");
  }

  const cropId = `${dotClipPath.id}-logo-crop`;
  const cropPath = document.createElementNS(SVG_NAMESPACE, "clipPath");
  cropPath.setAttribute("id", cropId);
  cropPath.setAttribute("clipPathUnits", "userSpaceOnUse");
  appendRect(cropPath, layout.frameRect);
  defs.appendChild(cropPath);
  image.setAttribute("clip-path", `url(#${cropId})`);

  const maskId = `${dotClipPath.id}-logo-protection`;
  const mask = document.createElementNS(SVG_NAMESPACE, "mask");
  mask.setAttribute("id", maskId);
  mask.setAttribute("maskUnits", "userSpaceOnUse");
  mask.setAttribute("maskContentUnits", "userSpaceOnUse");
  mask.setAttribute("x", "0");
  mask.setAttribute("y", "0");
  mask.setAttribute("width", String(canvasWidth));
  mask.setAttribute("height", String(canvasHeight));
  mask.setAttribute("style", "mask-type:luminance");
  appendRect(mask, makeRect(0, 0, canvasWidth, canvasHeight), "white");
  appendRect(mask, layout.protectedRect, "black");
  defs.appendChild(mask);
  dotColorRect.setAttribute("mask", `url(#${maskId})`);
}

export function getLogoOptions(logoImage: string | null | undefined) {
  if (!logoImage) return {};

  return {
    image: logoImage,
    imageOptions: {
      hideBackgroundDots: false,
      imageSize: LOGO_SIZE_MAX,
      margin: 0,
      saveAsBlob: true,
    },
  };
}
