export const SITE_NAME = "QR Anvil";
// Canonical origin. Tracked QR codes embed it, so set NEXT_PUBLIC_SITE_URL
// at build time in production (see Dockerfile).
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
).replace(/\/+$/, "");
// All KafLabs products share the kaflabs.com contact addresses.
export const SUPPORT_EMAIL = "support@kaflabs.com";
export const PRIVACY_EMAIL = "privacy@kaflabs.com";
export const LEGAL_EMAIL = "legal@kaflabs.com";

// KafLabs is the parent brand. Product footers link to the shared legal pages.
export const KAFLABS_URL = "https://kaflabs.com";
export const KAFLABS_PRIVACY_URL = "https://kaflabs.com/privacy";
export const KAFLABS_TERMS_URL = "https://kaflabs.com/terms";

export const SITE_DESCRIPTION =
  "Create free QR codes for links, Wi-Fi, contacts, messages, PDFs, and more. Customize the design, download your code, and track scans when you need to.";

export const QR_TYPE_INFO = {
  URL: {
    label: "URL",
    description: "Open any website or web page",
    icon: "Link",
    slug: "url",
  },
  WIFI: {
    label: "Wi-Fi",
    description: "Let guests join your Wi-Fi",
    icon: "Wifi",
    slug: "wifi",
  },
  VCARD: {
    label: "vCard",
    description: "Save your contact details",
    icon: "Contact",
    slug: "vcard",
  },
  EMAIL: {
    label: "Email",
    description: "Open a ready-to-send email",
    icon: "Mail",
    slug: "email",
  },
  SMS: {
    label: "SMS",
    description: "Open a ready-to-send text",
    icon: "MessageSquare",
    slug: "sms",
  },
  WHATSAPP: {
    label: "WhatsApp",
    description: "Start a WhatsApp chat",
    icon: "MessageCircle",
    slug: "whatsapp",
  },
  PDF: {
    label: "PDF",
    description: "Open a menu, guide, or document",
    icon: "FileText",
    slug: "pdf",
  },
  PLAIN_TEXT: {
    label: "Plain Text",
    description: "Show a note, code, or short message",
    icon: "Type",
    slug: "plain-text",
  },
} as const;
