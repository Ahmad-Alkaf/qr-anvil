"use client";

import { useState, useCallback, useRef } from "react";
import {
  Loader2,
  Zap,
  BarChart3,
  LogIn,
  Lock,
  ChevronDown,
  FileImage,
  FileCode2,
  FileText,
  Square,
  Link as LinkIcon,
  Wifi,
  Contact,
  Mail,
  MessageSquare,
  MessageCircle,
  Type,
  Circle,
  RectangleHorizontal,
  Diamond,
  Sparkles,
  Gem,
  AlertCircle,
  AlertTriangle,
  ImagePlus,
  X,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import NextLink from "next/link";
import { QRPreview } from "./qr-preview";
import { QRTypeFields } from "./qr-type-fields";
import {
  buildQRData,
  DEFAULT_LOGO_OVERSCAN,
  DEFAULT_LOGO_MARGIN,
  DEFAULT_LOGO_SIZE,
  LOGO_MARGIN_MAX,
  LOGO_MARGIN_MIN,
  LOGO_OVERSCAN_MAX,
  LOGO_OVERSCAN_MIN,
  LOGO_SIZE_MAX,
  LOGO_SIZE_MIN,
  TRACKABLE_TYPES,
  type QRTypeValue,
  type QRDotType,
  type QRCornerSquareType,
  type QRCornerDotType,
} from "@/lib/qr";
import { cn } from "@/lib/utils";
import { getPreparedLogoSize } from "@/lib/qr-styling-options";
import {
  renderQRBlob,
  downloadBlob,
  EXPORT_SIZE,
  type DownloadFormat,
  type ErrorCorrection,
} from "@/lib/qr-export";

interface QRGeneratorProps {
  defaultType?: QRTypeValue;
  compact?: boolean;
}

const QR_TYPE_OPTIONS: { value: QRTypeValue; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: "URL", label: "URL", icon: LinkIcon },
  { value: "WIFI", label: "Wi-Fi", icon: Wifi },
  { value: "VCARD", label: "vCard", icon: Contact },
  { value: "EMAIL", label: "Email", icon: Mail },
  { value: "SMS", label: "SMS", icon: MessageSquare },
  { value: "WHATSAPP", label: "WhatsApp", icon: MessageCircle },
  { value: "PDF", label: "PDF", icon: FileText },
  { value: "PLAIN_TEXT", label: "Text", icon: Type },
];

const DOT_STYLES: { value: QRDotType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: "square", label: "Square", icon: Square },
  { value: "dots", label: "Dots", icon: Circle },
  { value: "rounded", label: "Rounded", icon: RectangleHorizontal },
  { value: "extra-rounded", label: "Smooth", icon: Gem },
  { value: "classy", label: "Classy", icon: Diamond },
  { value: "classy-rounded", label: "Elegant", icon: Sparkles },
];

const CORNER_SQUARE_STYLES: { value: QRCornerSquareType; label: string }[] = [
  { value: "square", label: "Square" },
  { value: "dot", label: "Dot" },
  { value: "extra-rounded", label: "Rounded" },
];

const CORNER_DOT_STYLES: { value: QRCornerDotType; label: string }[] = [
  { value: "square", label: "Square" },
  { value: "dot", label: "Dot" },
];

const LOGO_FILE_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
const MAX_LOGO_FILE_SIZE = 5 * 1024 * 1024;
const MAX_LOGO_DATA_URL_LENGTH = 750_000;
const MAX_PREVIEW_LOGO_SIDE = 768;
const STORED_LOGO_SIDES = [1536, 1280, 1024, 768, 640, 512] as const;
const STORED_LOGO_QUALITIES = [0.98, 0.94, 0.9, 0.86, 0.78, 0.7] as const;

interface PreparedLogo {
  preview: string;
  master: string;
  stored: string;
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      typeof reader.result === "string"
        ? resolve(reader.result)
        : reject(new Error("The image could not be read."));
    reader.onerror = () => reject(new Error("The image could not be read."));
    reader.readAsDataURL(blob);
  });
}

function loadLogoImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new window.Image();
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Choose a valid PNG, JPG, or WebP image."));
    };
    image.src = objectUrl;
  });
}

async function prepareLogoVariant(
  image: HTMLImageElement,
  maxSide: number,
  qualities: readonly number[],
  maxDataUrlLength = MAX_LOGO_DATA_URL_LENGTH,
) {
  const preparedSize = getPreparedLogoSize(
    image.naturalWidth,
    image.naturalHeight,
    maxSide,
  );
  const canvas = document.createElement("canvas");
  canvas.width = preparedSize.width;
  canvas.height = preparedSize.height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("The image could not be prepared.");
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  const makeBlob = (type: "image/png" | "image/webp", quality?: number) =>
    new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("The image could not be prepared."))),
        type,
        quality
      );
    });

  const pngDataUrl = await blobToDataUrl(await makeBlob("image/png"));
  if (pngDataUrl.length <= maxDataUrlLength) return pngDataUrl;

  for (const quality of qualities) {
    const dataUrl = await blobToDataUrl(await makeBlob("image/webp", quality));
    if (dataUrl.length <= maxDataUrlLength) return dataUrl;
  }

  throw new Error("This image is too detailed. Choose a simpler or smaller image.");
}

async function prepareLogo(file: File): Promise<PreparedLogo> {
  if (!LOGO_FILE_TYPES.has(file.type)) {
    throw new Error("Choose a PNG, JPG, or WebP image.");
  }
  if (file.size > MAX_LOGO_FILE_SIZE) {
    throw new Error("The image must be 5 MB or smaller.");
  }

  const [image, originalDataUrl] = await Promise.all([
    loadLogoImage(file),
    blobToDataUrl(file),
  ]);
  const preview = await prepareLogoVariant(
    image,
    MAX_PREVIEW_LOGO_SIDE,
    [],
    Number.POSITIVE_INFINITY,
  );

  if (originalDataUrl.length <= MAX_LOGO_DATA_URL_LENGTH) {
    return {
      preview,
      master: originalDataUrl,
      stored: originalDataUrl,
    };
  }

  for (const maxSide of STORED_LOGO_SIDES) {
    try {
      const stored = await prepareLogoVariant(
        image,
        maxSide,
        STORED_LOGO_QUALITIES,
      );
      return {
        preview,
        master: originalDataUrl,
        stored,
      };
    } catch {
      // Try the next size until the best safe stored copy is found.
    }
  }

  throw new Error("This image is too detailed. Choose a simpler or smaller image.");
}

/* ── Component ── */

export function QRGenerator({ defaultType = "URL", compact = false }: QRGeneratorProps) {
  const { isSignedIn } = useUser();
  const [content, setContent] = useState("");
  const [type, setType] = useState<QRTypeValue>(defaultType);
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const [transparentBg, setTransparentBg] = useState(false);
  const [isDirect, setIsDirect] = useState(true);
  const [downloadingFormat, setDownloadingFormat] = useState<DownloadFormat | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorCorrection, setErrorCorrection] = useState<ErrorCorrection>("M");
  const [dotType, setDotType] = useState<QRDotType>("square");
  const [cornerSquareType, setCornerSquareType] = useState<QRCornerSquareType>("square");
  const [cornerDotType, setCornerDotType] = useState<QRCornerDotType>("square");
  const [logoMasterImage, setLogoMasterImage] = useState<string | null>(null);
  const [logoPreviewImage, setLogoPreviewImage] = useState<string | null>(null);
  const [logoStoredImage, setLogoStoredImage] = useState<string | null>(null);
  const [logoSize, setLogoSize] = useState(DEFAULT_LOGO_SIZE);
  const [logoMargin, setLogoMargin] = useState(DEFAULT_LOGO_MARGIN);
  const [logoOverscan, setLogoOverscan] = useState(DEFAULT_LOGO_OVERSCAN);
  const [logoName, setLogoName] = useState("");
  const [logoError, setLogoError] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Remember what was already saved so that downloading the same QR code in
  // several formats does not create duplicate records or short codes.
  const savedRef = useRef<{ key: string; qrData: string } | null>(null);

  const effectiveBgColor = transparentBg ? "transparent" : bgColor;
  const hasLargeLogo = logoSize > DEFAULT_LOGO_SIZE;

  // Preview always shows the actual content so users can verify their input.
  // The tracked redirect URL is created server-side only at download time.
  const qrData = content ? buildQRData(type, content) : "";

  const handleDownload = useCallback(async (format: DownloadFormat) => {
    if (!content || downloadingFormat) return;
    if (!isDirect && !isSignedIn) return;

    setDownloadingFormat(format);
    setError(null);

    try {
      const payload = {
        type,
        content,
        foregroundColor: fgColor,
        backgroundColor: effectiveBgColor,
        size: EXPORT_SIZE,
        errorCorrection,
        dotType,
        cornerSquareType,
        cornerDotType,
        logoSize,
        logoMargin,
        logoOverscan,
        logoUrl: logoStoredImage,
        isDirect,
      };
      const saveKey = JSON.stringify(payload);

      let qrDataToEncode: string;

      if (savedRef.current?.key === saveKey) {
        qrDataToEncode = savedRef.current.qrData;
      } else {
        // Anonymous counter: records only the QR type, never the content.
        fetch("/api/qr/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type }),
        }).catch(() => {});

        if (isDirect) {
          qrDataToEncode = buildQRData(type, content);
          // Save to the account when signed in. Failure does not block the download.
          if (isSignedIn) {
            fetch("/api/qr/generate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: saveKey,
            }).catch(() => {});
          }
        } else {
          // Tracked: create the record and get the redirect URL
          const res = await fetch("/api/qr/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: saveKey,
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok || typeof data.qrData !== "string") {
            setError(data.error || "Failed to create the Tracked QR code. Please try again.");
            return;
          }
          qrDataToEncode = data.qrData;
        }

        savedRef.current = { key: saveKey, qrData: qrDataToEncode };
      }

      const blob = await renderQRBlob({
        data: qrDataToEncode,
        format,
        fgColor,
        bgColor: effectiveBgColor,
        errorCorrection,
        dotType,
        cornerSquareType,
        cornerDotType,
        logoImage: logoMasterImage,
        logoSize,
        logoMargin,
        logoOverscan,
      });
      downloadBlob(blob, `qr-anvil-${type.toLowerCase()}.${format}`);
    } catch {
      setError("Failed to generate the QR code. Please try again.");
    } finally {
      setDownloadingFormat(null);
    }
  }, [type, content, fgColor, effectiveBgColor, errorCorrection, isDirect, isSignedIn, downloadingFormat, dotType, cornerSquareType, cornerDotType, logoMasterImage, logoStoredImage, logoSize, logoMargin, logoOverscan]);

  const handleContentChange = useCallback((value: string) => {
    setContent(value);
    setError(null);
  }, []);

  const handleLogoChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;

    setLogoError(null);
    try {
      const prepared = await prepareLogo(file);
      setLogoMasterImage(prepared.master);
      setLogoPreviewImage(prepared.preview);
      setLogoStoredImage(prepared.stored);
      setLogoName(file.name);
      setErrorCorrection("H");
    } catch (logoUploadError) {
      setLogoError(
        logoUploadError instanceof Error
          ? logoUploadError.message
          : "The image could not be prepared."
      );
    }
  }, []);

  const removeLogo = useCallback(() => {
    setLogoMasterImage(null);
    setLogoPreviewImage(null);
    setLogoStoredImage(null);
    setLogoName("");
    setLogoError(null);
  }, []);

  const showSignInPrompt = !isDirect && !isSignedIn;
  const needsLoginForType = type !== "URL" && !isSignedIn;
  const needsLoginForFormat = !isSignedIn;

  return (
    <>
      <div
        id="generator"
        className={cn(
          "grid gap-8",
          compact ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2"
        )}
      >
        {/* Left: Form */}
        <div className="space-y-5">
          {/* QR Type selector */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              QR Type
            </label>
            <div className="flex flex-wrap gap-1.5">
              {QR_TYPE_OPTIONS.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    if (value !== type) {
                      setType(value);
                      setContent("");
                      setError(null);
                      if (!TRACKABLE_TYPES.has(value)) setIsDirect(true);
                    }
                  }}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                    type === value
                      ? "bg-primary text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Type-specific fields */}
          <QRTypeFields key={type} type={type} onChange={handleContentChange} />

          {/* QR Mode */}
          {TRACKABLE_TYPES.has(type) && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              QR Mode
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsDirect(true)}
                className={cn(
                  "flex items-center gap-2 rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition-all",
                  isDirect
                    ? "border-primary bg-primary-50 text-primary dark:bg-primary/10"
                    : "border-gray-200 text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:text-gray-400"
                )}
              >
                <Zap className="h-4 w-4" />
                <div>
                  <div>Direct</div>
                  <div className="text-xs font-normal opacity-70">Open right away</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setIsDirect(false)}
                className={cn(
                  "flex items-center gap-2 rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition-all",
                  !isDirect
                    ? "border-primary bg-primary-50 text-primary dark:bg-primary/10"
                    : "border-gray-200 text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:text-gray-400"
                )}
              >
                <BarChart3 className="h-4 w-4" />
                <div>
                  <div>Tracked</div>
                  <div className="text-xs font-normal opacity-70">Analytics enabled</div>
                </div>
              </button>
            </div>
            {!isDirect && isSignedIn && (
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Tracked QR codes redirect through our server. This enables scan analytics and lets you change the destination later.
              </p>
            )}
            {showSignInPrompt && (
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
                <LogIn className="h-4 w-4 shrink-0" />
                <span>
                  <NextLink href="/sign-in" className="font-semibold underline hover:no-underline">
                    Sign in
                  </NextLink>{" "}
                  to create Tracked QR codes with analytics.
                </span>
              </div>
            )}
          </div>
          )}

          {/* Dot Style */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Pattern Style
            </label>
            <div className="grid grid-cols-6 gap-1.5">
              {DOT_STYLES.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setDotType(value)}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-xl border-2 px-2 py-2 text-[10px] font-medium transition-all",
                    dotType === value
                      ? "border-primary bg-primary-50 text-primary dark:bg-primary/10"
                      : "border-gray-200 text-gray-500 hover:border-gray-300 dark:border-gray-700 dark:text-gray-400"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Corner Style */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="bg-color"
                className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Outer Corners
              </label>
              <div className="flex gap-1.5">
                {CORNER_SQUARE_STYLES.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setCornerSquareType(value)}
                    className={cn(
                      "flex-1 rounded-lg border-2 px-2 py-1.5 text-[10px] font-medium transition-all",
                      cornerSquareType === value
                        ? "border-primary bg-primary-50 text-primary dark:bg-primary/10"
                        : "border-gray-200 text-gray-500 hover:border-gray-300 dark:border-gray-700 dark:text-gray-400"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Inner Corners
              </label>
              <div className="flex gap-1.5">
                {CORNER_DOT_STYLES.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setCornerDotType(value)}
                    className={cn(
                      "flex-1 rounded-lg border-2 px-2 py-1.5 text-[10px] font-medium transition-all",
                      cornerDotType === value
                        ? "border-primary bg-primary-50 text-primary dark:bg-primary/10"
                        : "border-gray-200 text-gray-500 hover:border-gray-300 dark:border-gray-700 dark:text-gray-400"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Center logo */}
          <div>
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Center Logo
              </label>
              <span className="text-[11px] font-medium text-primary">Free for every QR code</span>
            </div>
            <input
              ref={logoInputRef}
              type="file"
              accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
              onChange={handleLogoChange}
              className="sr-only"
              aria-label="Upload a center logo"
            />
            {logoMasterImage ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-xl border border-primary/25 bg-primary-50 p-3 dark:bg-primary/10">
                  <span
                    aria-hidden="true"
                    className="h-12 w-12 shrink-0 rounded-lg border border-gray-200 bg-white bg-contain bg-center bg-no-repeat dark:border-gray-700"
                    style={{ backgroundImage: `url(${logoPreviewImage ?? logoMasterImage})` }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                      {logoName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Maximum scan recovery is on.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-primary hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:hover:bg-gray-900"
                  >
                    Replace
                  </button>
                  <button
                    type="button"
                    onClick={removeLogo}
                    aria-label="Remove logo"
                    className="rounded-lg p-1.5 text-gray-500 hover:bg-white hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:hover:bg-gray-900"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="rounded-xl border border-gray-200 px-3 py-3 dark:border-gray-700">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <label
                      htmlFor="logo-size"
                      className={cn(
                        "text-xs font-semibold",
                        hasLargeLogo
                          ? "text-amber-700 dark:text-amber-300"
                          : "text-gray-700 dark:text-gray-300",
                      )}
                    >
                      Logo size
                    </label>
                    <output
                      htmlFor="logo-size"
                      className={cn(
                        "min-w-32 rounded-md px-2 py-1 text-center text-xs font-semibold tabular-nums",
                        hasLargeLogo
                          ? "bg-amber-100/80 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300"
                          : "bg-primary-50 text-primary dark:bg-primary/10",
                      )}
                    >
                      {Math.round(logoSize * 100)}% of center area
                    </output>
                  </div>
                  <input
                    id="logo-size"
                    type="range"
                    min={LOGO_SIZE_MIN * 100}
                    max={LOGO_SIZE_MAX * 100}
                    step={1}
                    value={logoSize * 100}
                    onChange={(event) => setLogoSize(Number(event.target.value) / 100)}
                    aria-valuetext={`${Math.round(logoSize * 100)} percent of the center area`}
                    aria-describedby={
                      hasLargeLogo ? "logo-size-warning" : undefined
                    }
                    className={cn(
                      "h-2 w-full cursor-pointer",
                      hasLargeLogo ? "accent-amber-500" : "accent-primary",
                    )}
                  />
                  <div aria-hidden="true" className="mt-1 flex justify-between text-[11px] text-gray-400 dark:text-gray-500">
                    <span>Smaller</span>
                    <span>Larger</span>
                  </div>
                  {hasLargeLogo && (
                    <p
                      id="logo-size-warning"
                      role="status"
                      className="mt-2 flex items-start gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-300"
                    >
                      <AlertTriangle
                        className="mt-0.5 h-3.5 w-3.5 shrink-0"
                        aria-hidden="true"
                      />
                      <span>
                        Large logo can reduce scan reliability. Test the QR
                        code before you use it.
                      </span>
                    </p>
                  )}
                  <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <label
                        htmlFor="logo-margin"
                        className="text-xs font-semibold text-gray-700 dark:text-gray-300"
                      >
                        Logo margin
                      </label>
                      <output
                        htmlFor="logo-margin"
                        className="min-w-32 rounded-md bg-primary-50 px-2 py-1 text-center text-xs font-semibold tabular-nums text-primary dark:bg-primary/10"
                      >
                        {Number((logoMargin * 100).toFixed(1))}% of QR width
                      </output>
                    </div>
                    <input
                      id="logo-margin"
                      type="range"
                      min={LOGO_MARGIN_MIN * 100}
                      max={LOGO_MARGIN_MAX * 100}
                      step={0.1}
                      value={logoMargin * 100}
                      onChange={(event) => setLogoMargin(Number(event.target.value) / 100)}
                      aria-valuetext={`${Number((logoMargin * 100).toFixed(1))} percent of the QR width on each side`}
                      className="h-2 w-full cursor-pointer accent-primary"
                    />
                    <div aria-hidden="true" className="mt-1 flex justify-between text-[11px] text-gray-400 dark:text-gray-500">
                      <span>None</span>
                      <span>More</span>
                    </div>
                  </div>
                  <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <label
                        htmlFor="logo-zoom"
                        className="text-xs font-semibold text-gray-700 dark:text-gray-300"
                      >
                        Logo zoom
                      </label>
                      <output
                        htmlFor="logo-zoom"
                        className="min-w-32 rounded-md bg-primary-50 px-2 py-1 text-center text-xs font-semibold tabular-nums text-primary dark:bg-primary/10"
                      >
                        {Math.round(logoOverscan * 100)}%
                      </output>
                    </div>
                    <input
                      id="logo-zoom"
                      type="range"
                      min={LOGO_OVERSCAN_MIN * 100}
                      max={LOGO_OVERSCAN_MAX * 100}
                      step={1}
                      value={logoOverscan * 100}
                      onChange={(event) =>
                        setLogoOverscan(Number(event.target.value) / 100)
                      }
                      aria-valuetext={`${Math.round(logoOverscan * 100)} percent zoom`}
                      className="h-2 w-full cursor-pointer accent-primary"
                    />
                    <div aria-hidden="true" className="mt-1 flex justify-between text-[11px] text-gray-400 dark:text-gray-500">
                      <span>None</span>
                      <span>More</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className="flex w-full items-center gap-3 rounded-xl border-2 border-dashed border-gray-300 px-4 py-3 text-left transition-colors hover:border-primary hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:border-gray-700 dark:hover:bg-primary/10"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary dark:bg-primary/10">
                  <ImagePlus className="h-4 w-4" />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-gray-900 dark:text-white">
                    Add your logo
                  </span>
                  <span className="block text-xs text-gray-500 dark:text-gray-400">
                    PNG, JPG, or WebP, up to 5 MB
                  </span>
                </span>
              </button>
            )}
            <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
              We resize the image and protect the pattern around it. Test the downloaded code before you print it.
            </p>
            {logoError && (
              <p role="alert" className="mt-2 text-xs text-red-600 dark:text-red-400">
                {logoError}
              </p>
            )}
          </div>

          {/* Colors */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="fg-color"
                className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Foreground Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="fg-color"
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="h-10 w-10 cursor-pointer rounded-lg border border-gray-300 dark:border-gray-700"
                />
                <input
                  type="text"
                  aria-label="Foreground color hex value"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm uppercase dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Background Color
              </label>
              <div
                role="group"
                aria-label="Background fill"
                className="grid grid-cols-2 rounded-lg bg-gray-100 p-1 dark:bg-gray-800"
              >
                <button
                  type="button"
                  onClick={() => setTransparentBg(false)}
                  aria-pressed={!transparentBg}
                  className={cn(
                    "flex min-h-8 items-center justify-center gap-1.5 rounded-md border px-2 text-xs font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 dark:focus-visible:ring-offset-gray-800",
                    !transparentBg
                      ? "border-primary bg-white text-primary shadow-sm dark:bg-gray-900"
                      : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="h-3.5 w-3.5 rounded-sm border border-gray-400 bg-white dark:border-gray-500"
                    style={{ backgroundColor: bgColor }}
                  />
                  Color
                </button>
                <button
                  type="button"
                  onClick={() => setTransparentBg(true)}
                  aria-pressed={transparentBg}
                  className={cn(
                    "flex min-h-8 items-center justify-center gap-1.5 rounded-md border px-2 text-xs font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 dark:focus-visible:ring-offset-gray-800",
                    transparentBg
                      ? "border-primary bg-white text-primary shadow-sm dark:bg-gray-900"
                      : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="h-3.5 w-3.5 rounded-sm border border-gray-400 dark:border-gray-500"
                    style={{
                      backgroundColor: "white",
                      backgroundImage:
                        "conic-gradient(#cbd5e1 25%, white 0 50%, #cbd5e1 0 75%, white 0)",
                      backgroundSize: "7px 7px",
                    }}
                  />
                  Transparent
                </button>
              </div>
              <div className={cn("mt-2 flex items-center gap-2", transparentBg && "opacity-40")}>
                <input
                  id="bg-color"
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  disabled={transparentBg}
                  className="h-10 w-10 cursor-pointer rounded-lg border border-gray-300 dark:border-gray-700"
                />
                <input
                  type="text"
                  aria-label="Background color hex value"
                  value={transparentBg ? "transparent" : bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  disabled={transparentBg}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm uppercase dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Error Correction */}
          <div>
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <label
                htmlFor="error-correction"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Scan Reliability
              </label>
              {logoMasterImage && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                  <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                  Locked by logo
                </span>
              )}
            </div>
            <div className="relative">
              <select
                id="error-correction"
                value={errorCorrection}
                onChange={(e) => setErrorCorrection(e.target.value as ErrorCorrection)}
                disabled={!!logoMasterImage}
                aria-describedby="error-correction-help"
                className="w-full appearance-none rounded-xl border border-gray-300 bg-white py-2.5 pl-4 pr-11 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-100 disabled:font-medium disabled:text-gray-500 disabled:shadow-none disabled:opacity-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:disabled:border-gray-700 dark:disabled:bg-gray-800/70 dark:disabled:text-gray-400"
              >
                <option value="L">Basic (7% recovery)</option>
                <option value="M">Recommended (15% recovery)</option>
                <option value="Q">Strong (25% recovery)</option>
                <option value="H">Maximum (30% recovery)</option>
              </select>
              <span className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-gray-500 dark:text-gray-400">
                <ChevronDown className="h-4 w-4" aria-hidden="true" />
              </span>
            </div>
            {logoMasterImage ? (
              <p
                id="error-correction-help"
                role="status"
                className="mt-2 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50/60 px-3 py-2 text-xs font-medium text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/15 dark:text-amber-300"
              >
                <AlertTriangle
                  className="mt-0.5 h-4 w-4 shrink-0"
                  aria-hidden="true"
                />
                <span>
                  Maximum (30% recovery) is required because the logo covers part
                  of the QR pattern.
                </span>
              </p>
            ) : (
              <p
                id="error-correction-help"
                className="mt-1 text-xs text-gray-500 dark:text-gray-400"
              >
                A higher setting helps the code scan if part of it is damaged or
                covered. Use Maximum for small prints.
              </p>
            )}
          </div>

          {/* Download buttons */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Download
            </label>
            {showSignInPrompt ? (
              <NextLink
                href="/sign-in"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-dark"
              >
                <LogIn className="h-4 w-4" />
                Sign in to Create a Tracked QR Code
              </NextLink>
            ) : needsLoginForType ? (
              <NextLink
                href="/sign-in"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-dark"
              >
                <LogIn className="h-4 w-4" />
                Sign in to Download
              </NextLink>
            ) : (
              <div className="grid grid-cols-3 gap-2.5">
                {([
                  {
                    format: "png" as const,
                    label: "PNG",
                    sub: "Best for sharing",
                    icon: FileImage,
                    locked: false,
                    bg: "bg-amber-600/20 hover:bg-amber-600/30 dark:bg-amber-500/15 dark:hover:bg-amber-500/25",
                    activeBg: "bg-amber-600/30 dark:bg-amber-500/25",
                  },
                  {
                    format: "svg" as const,
                    label: "SVG",
                    sub: "Best for design",
                    icon: FileCode2,
                    locked: needsLoginForFormat,
                    bg: "bg-emerald-600/20 hover:bg-emerald-600/30 dark:bg-emerald-500/15 dark:hover:bg-emerald-500/25",
                    activeBg: "bg-emerald-600/30 dark:bg-emerald-500/25",
                  },
                  {
                    format: "pdf" as const,
                    label: "PDF",
                    sub: "Print",
                    icon: FileText,
                    locked: needsLoginForFormat,
                    bg: "bg-rose-600/20 hover:bg-rose-600/30 dark:bg-rose-500/15 dark:hover:bg-rose-500/25",
                    activeBg: "bg-rose-600/30 dark:bg-rose-500/25",
                  },
                ] as const).map(({ format, label, sub, icon: Icon, locked, bg, activeBg }) => {
                  const isActive = downloadingFormat === format;
                  const isDisabled = !content || !!downloadingFormat;

                  if (locked) {
                    return (
                      <NextLink
                        key={format}
                        href="/sign-in"
                        title={`Sign in to download ${label}`}
                        className="group flex flex-col items-center gap-2 rounded-xl bg-gray-200 px-4 py-4 text-center opacity-50 transition-all hover:opacity-70 dark:bg-gray-800"
                      >
                        <Lock className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                        <div>
                          <div className="text-sm font-semibold text-gray-500 dark:text-gray-400">{label}</div>
                          <div className="text-[11px] text-gray-400 dark:text-gray-500">{sub}</div>
                        </div>
                      </NextLink>
                    );
                  }

                  return (
                    <button
                      key={format}
                      type="button"
                      onClick={() => handleDownload(format)}
                      disabled={isDisabled}
                      className={cn(
                        "group flex flex-col items-center gap-2 rounded-xl px-4 py-4 text-center shadow-sm transition-all duration-200",
                        "disabled:cursor-not-allowed disabled:opacity-40",
                        !isDisabled && "active:scale-[0.97] hover:shadow-md",
                        isActive ? activeBg : bg
                      )}
                    >
                      {isActive ? (
                        <Loader2 className="h-5 w-5 animate-spin text-gray-700 dark:text-gray-200" />
                      ) : (
                        <Icon className="h-5 w-5 text-gray-700 dark:text-gray-200" />
                      )}
                      <div>
                        <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">{label}</div>
                        <div className="text-[11px] text-gray-500 dark:text-gray-400">{sub}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
            {error && (
              <p
                role="alert"
                className="mt-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </p>
            )}
          </div>
        </div>

        {/* Right: Preview */}
        <div className="flex items-center justify-center">
          <QRPreview
            value={qrData}
            size={compact ? 200 : 280}
            fgColor={fgColor}
            bgColor={effectiveBgColor}
            level={errorCorrection}
            dotType={dotType}
            cornerSquareType={cornerSquareType}
            cornerDotType={cornerDotType}
            logoImage={logoPreviewImage}
            logoSize={logoSize}
            logoMargin={logoMargin}
            logoOverscan={logoOverscan}
          />
        </div>
      </div>
    </>
  );
}
