import { z } from "zod";

export const QR_TYPES = [
  "URL",
  "WIFI",
  "VCARD",
  "EMAIL",
  "SMS",
  "WHATSAPP",
  "PDF",
  "PLAIN_TEXT",
] as const;

export type QRTypeValue = (typeof QR_TYPES)[number];

/** QR types whose payload is an http(s) URL and can go through the redirect. */
export const TRACKABLE_TYPES: ReadonlySet<QRTypeValue> = new Set<QRTypeValue>([
  "URL",
  "PDF",
  "WHATSAPP",
]);

export const DOT_TYPES = [
  "square",
  "dots",
  "rounded",
  "extra-rounded",
  "classy",
  "classy-rounded",
] as const;
export const CORNER_SQUARE_TYPES = ["square", "dot", "extra-rounded"] as const;
export const CORNER_DOT_TYPES = ["square", "dot"] as const;

export type QRDotType = (typeof DOT_TYPES)[number];
export type QRCornerSquareType = (typeof CORNER_SQUARE_TYPES)[number];
export type QRCornerDotType = (typeof CORNER_DOT_TYPES)[number];

export const LOGO_SIZE_MIN = 0.1;
export const LOGO_SIZE_MAX = 0.7;
export const DEFAULT_LOGO_SIZE = 0.5;
export const LOGO_MARGIN_MIN = 0;
export const LOGO_MARGIN_MAX = 0.04;
export const DEFAULT_LOGO_MARGIN = 0.01;
export const LOGO_OVERSCAN_MIN = 0;
export const LOGO_OVERSCAN_MAX = 0.5;
export const DEFAULT_LOGO_OVERSCAN = 0;

export interface QRStyle {
  dotType: QRDotType;
  cornerSquareType: QRCornerSquareType;
  cornerDotType: QRCornerDotType;
  logoSize: number;
  logoMargin: number;
  logoOverscan: number;
}

export const DEFAULT_STYLE: QRStyle = {
  dotType: "square",
  cornerSquareType: "square",
  cornerDotType: "square",
  logoSize: DEFAULT_LOGO_SIZE,
  logoMargin: DEFAULT_LOGO_MARGIN,
  logoOverscan: DEFAULT_LOGO_OVERSCAN,
};

const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;
const LOGO_DATA_URL = /^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/;

export const qrGenerateSchema = z.object({
  type: z.enum(QR_TYPES),
  content: z.string().min(1, "Content is required").max(4000),
  foregroundColor: z.string().regex(HEX_COLOR).default("#000000"),
  backgroundColor: z
    .union([z.string().regex(HEX_COLOR), z.literal("transparent")])
    .default("#FFFFFF"),
  size: z.number().min(100).max(2000).default(300),
  errorCorrection: z.enum(["L", "M", "Q", "H"]).default("M"),
  dotType: z.enum(DOT_TYPES).default("square"),
  cornerSquareType: z.enum(CORNER_SQUARE_TYPES).default("square"),
  cornerDotType: z.enum(CORNER_DOT_TYPES).default("square"),
  logoSize: z
    .number()
    .min(LOGO_SIZE_MIN)
    .max(LOGO_SIZE_MAX)
    .default(DEFAULT_LOGO_SIZE),
  logoMargin: z
    .number()
    .min(LOGO_MARGIN_MIN)
    .max(LOGO_MARGIN_MAX)
    .default(DEFAULT_LOGO_MARGIN),
  logoOverscan: z
    .number()
    .min(LOGO_OVERSCAN_MIN)
    .max(LOGO_OVERSCAN_MAX)
    .default(DEFAULT_LOGO_OVERSCAN),
  logoUrl: z
    .string()
    .max(750_000)
    .regex(LOGO_DATA_URL, "Logo must be a PNG, JPG, or WebP image")
    .nullable()
    .default(null),
  // Direct: content encoded directly in QR (fast, no analytics)
  // Tracked: QR points to redirect URL (enables analytics + editable destination)
  isDirect: z.boolean().default(true),
});

export type QRGenerateInput = z.infer<typeof qrGenerateSchema>;

/** Serialize the visual options into the single `style` column. */
export function serializeStyle(style: QRStyle): string {
  return `${style.dotType}/${style.cornerSquareType}/${style.cornerDotType}/${style.logoSize}/${style.logoMargin}/${style.logoOverscan}`;
}

/** Parse the `style` column. Unknown or legacy values use safe defaults. */
export function parseStyle(value: string | null | undefined): QRStyle {
  if (!value) return DEFAULT_STYLE;
  const [
    dot,
    cornerSquare,
    cornerDot,
    logoSizeValue,
    logoMarginValue,
    logoOverscanValue,
  ] = value.split("/");
  const has = (list: readonly string[], v: string | undefined) =>
    v !== undefined && list.includes(v);
  const parsedLogoSize = Number(logoSizeValue);
  const logoSize =
    Number.isFinite(parsedLogoSize) &&
    parsedLogoSize >= LOGO_SIZE_MIN &&
    parsedLogoSize <= LOGO_SIZE_MAX
      ? parsedLogoSize
      : DEFAULT_LOGO_SIZE;
  const parsedLogoMargin = Number(logoMarginValue);
  const logoMargin =
    Number.isFinite(parsedLogoMargin) &&
    parsedLogoMargin >= LOGO_MARGIN_MIN &&
    parsedLogoMargin <= LOGO_MARGIN_MAX
      ? parsedLogoMargin
      : DEFAULT_LOGO_MARGIN;
  const parsedLogoOverscan = Number(logoOverscanValue);
  const logoOverscan =
    Number.isFinite(parsedLogoOverscan) &&
    parsedLogoOverscan >= LOGO_OVERSCAN_MIN &&
    parsedLogoOverscan <= LOGO_OVERSCAN_MAX
      ? parsedLogoOverscan
      : DEFAULT_LOGO_OVERSCAN;
  return {
    dotType: has(DOT_TYPES, dot) ? (dot as QRDotType) : "square",
    cornerSquareType: has(CORNER_SQUARE_TYPES, cornerSquare)
      ? (cornerSquare as QRCornerSquareType)
      : "square",
    cornerDotType: has(CORNER_DOT_TYPES, cornerDot)
      ? (cornerDot as QRCornerDotType)
      : "square",
    logoSize,
    logoMargin,
    logoOverscan,
  };
}

function escapeVCard(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function escapeWifi(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/:/g, "\\:")
    .replace(/,/g, "\\,")
    .replace(/"/g, '\\"');
}

function parseJson(content: string): Record<string, unknown> | null {
  try {
    const parsed: unknown = JSON.parse(content);
    return parsed && typeof parsed === "object"
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

function str(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export function buildQRData(type: QRTypeValue, content: string): string {
  switch (type) {
    case "URL":
    case "PDF":
    case "PLAIN_TEXT":
      return content;
    case "WIFI": {
      const parsed = parseJson(content);
      if (!parsed) return content;
      const ssid = escapeWifi(str(parsed.ssid));
      const encryption = str(parsed.encryption) || "WPA";
      const parts = [`T:${encryption}`, `S:${ssid}`];
      if (encryption !== "nopass") {
        parts.push(`P:${escapeWifi(str(parsed.password))}`);
      }
      if (parsed.hidden) parts.push("H:true");
      return `WIFI:${parts.join(";")};;`;
    }
    case "VCARD": {
      const parsed = parseJson(content);
      if (!parsed) return content;
      const firstName = escapeVCard(str(parsed.firstName));
      const lastName = escapeVCard(str(parsed.lastName));
      return [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `N:${lastName};${firstName}`,
        `FN:${[firstName, lastName].filter(Boolean).join(" ")}`,
        parsed.org ? `ORG:${escapeVCard(str(parsed.org))}` : "",
        parsed.title ? `TITLE:${escapeVCard(str(parsed.title))}` : "",
        parsed.phone ? `TEL:${escapeVCard(str(parsed.phone))}` : "",
        parsed.email ? `EMAIL:${escapeVCard(str(parsed.email))}` : "",
        parsed.url ? `URL:${escapeVCard(str(parsed.url))}` : "",
        parsed.address ? `ADR:;;${escapeVCard(str(parsed.address))}` : "",
        "END:VCARD",
      ]
        .filter(Boolean)
        .join("\n");
    }
    case "EMAIL": {
      const parsed = parseJson(content);
      if (!parsed) return `mailto:${content}`;
      const email = str(parsed.email) || content;
      const query: string[] = [];
      if (parsed.subject) {
        query.push(`subject=${encodeURIComponent(str(parsed.subject))}`);
      }
      if (parsed.body) {
        query.push(`body=${encodeURIComponent(str(parsed.body))}`);
      }
      return `mailto:${email}${query.length ? `?${query.join("&")}` : ""}`;
    }
    case "SMS": {
      const parsed = parseJson(content);
      if (!parsed) return `smsto:${content}`;
      const phone = str(parsed.phone) || content;
      const message = parsed.message ? `:${str(parsed.message)}` : "";
      return `smsto:${phone}${message}`;
    }
    case "WHATSAPP": {
      const parsed = parseJson(content);
      const rawPhone = parsed ? str(parsed.phone) || content : content;
      const phone = rawPhone.replace(/[^0-9]/g, "");
      const message =
        parsed && parsed.message
          ? `?text=${encodeURIComponent(str(parsed.message))}`
          : "";
      return `https://wa.me/${phone}${message}`;
    }
    default:
      return content;
  }
}
