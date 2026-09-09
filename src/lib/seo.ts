import { KAFLABS_URL, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/constants";
import type { QRTypeFaq } from "@/lib/qr-type-content";

/**
 * Structured data (schema.org JSON-LD) and shared SEO facts.
 *
 * Search engines use these objects for rich results. AI assistants use them
 * to identify what QR Anvil is, who makes it, and what each page is about.
 */

/** Date the public copy last changed. Update it when the wording changes. */
export const CONTENT_LAST_MODIFIED = new Date("2026-09-07");

export const SITE_TAGLINE = "Free QR Codes Made Simple";

/** One-paragraph description reused by structured data and llms.txt. */
export const SITE_SUMMARY =
  `${SITE_NAME} is a free online QR code generator made by KafLabs. It creates QR codes for URLs, Wi-Fi networks, vCard contacts, email, SMS, WhatsApp, PDF documents, and plain text. QR codes are rendered in the browser and can be downloaded as PNG, SVG, or PDF. Tracked QR codes add scan analytics (country, city, device, browser, time) and an editable destination URL that can be changed after the code is printed.`;

export const FEATURE_LIST = [
  "8 QR code types: URL, Wi-Fi, vCard, Email, SMS, WhatsApp, PDF, Plain Text",
  "Direct QR codes with no redirect and no server round trip",
  "Tracked QR codes with scan analytics and editable destination URL",
  "Custom foreground and background colors",
  "Dot, corner square, and corner dot styles",
  "Error correction levels L, M, Q, and H",
  "PNG, SVG, and PDF downloads",
  "Client-side generation so QR content stays in the browser",
  "Free to use, no watermark",
];

const ORGANIZATION_ID = `${KAFLABS_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const APP_ID = `${SITE_URL}/#app`;

export function organizationJsonLd() {
  return {
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: "KafLabs",
    url: KAFLABS_URL,
    logo: `${SITE_URL}/logo/icon-512.png`,
    brand: {
      "@type": "Brand",
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/logo/icon-512.png`,
    },
  };
}

export function webSiteJsonLd() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: SITE_NAME,
    alternateName: `${SITE_NAME} QR Code Generator`,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: "en",
    publisher: { "@id": ORGANIZATION_ID },
  };
}

export function webApplicationJsonLd() {
  return {
    "@type": ["WebApplication", "SoftwareApplication"],
    "@id": APP_ID,
    name: SITE_NAME,
    alternateName: SITE_TAGLINE,
    url: SITE_URL,
    description: SITE_SUMMARY,
    applicationCategory: "UtilityApplication",
    applicationSubCategory: "QR code generator",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript. Works in any modern browser.",
    isAccessibleForFree: true,
    inLanguage: "en",
    image: `${SITE_URL}/opengraph-image`,
    featureList: FEATURE_LIST,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    author: { "@id": ORGANIZATION_ID },
    publisher: { "@id": ORGANIZATION_ID },
  };
}

export function faqJsonLd(faqs: QRTypeFaq[]) {
  return {
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };
}

export type BreadcrumbItem = { name: string; path: string };

export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

export function howToJsonLd(name: string, steps: string[], description?: string) {
  return {
    "@type": "HowTo",
    name,
    description,
    totalTime: "PT1M",
    estimatedCost: { "@type": "MonetaryAmount", currency: "USD", value: "0" },
    tool: { "@type": "HowToTool", name: `${SITE_NAME} QR code generator` },
    step: steps.map((text, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: `Step ${index + 1}`,
      text,
    })),
  };
}

export function webPageJsonLd(opts: {
  path: string;
  name: string;
  description: string;
  type?: "WebPage" | "AboutPage" | "CollectionPage" | "ContactPage";
}) {
  return {
    "@type": opts.type ?? "WebPage",
    "@id": `${SITE_URL}${opts.path}#webpage`,
    url: `${SITE_URL}${opts.path}`,
    name: opts.name,
    description: opts.description,
    inLanguage: "en",
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": APP_ID },
    dateModified: CONTENT_LAST_MODIFIED.toISOString(),
  };
}

/**
 * Wrap one or more schema.org objects in a single @graph so a page emits one
 * script tag and the objects can reference each other by @id.
 */
export function jsonLdGraph(...nodes: Record<string, unknown>[]) {
  return { "@context": "https://schema.org", "@graph": nodes };
}

/** Escape characters that would let the JSON break out of the script tag. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
