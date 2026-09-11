import { KAFLABS_URL, SITE_NAME, SITE_URL, SUPPORT_EMAIL } from "@/lib/constants";
import { QR_TYPE_PAGE_LIST } from "@/lib/qr-type-content";
import { FEATURE_LIST, SITE_SUMMARY, SITE_TAGLINE } from "@/lib/seo";

/**
 * Builders for /llms.txt and /llms-full.txt.
 *
 * llms.txt is a plain Markdown file that tells AI assistants what a site is
 * and where its important pages are (https://llmstxt.org). The full variant
 * inlines the page content so an assistant can answer without crawling.
 */

const HOME_FAQS = [
  {
    q: "What is the difference between Direct and Tracked QR codes?",
    a: "Direct QR codes store the content in the image itself, so scanning opens it instantly with no redirect. Tracked QR codes store a short QR Anvil redirect link. The redirect lets QR Anvil count scans, record country, city, device, browser, and time, and lets the owner change the destination URL after the code is printed.",
  },
  {
    q: "Is QR Anvil free?",
    a: "Yes. QR Anvil is free to use with no watermark. URL QR codes and PNG downloads work without an account. A free account unlocks all 8 QR types, SVG and PDF downloads, Tracked QR codes, and the analytics dashboard.",
  },
  {
    q: "Which download formats are available?",
    a: "PNG, SVG, and PDF. All three are generated in the browser.",
  },
  {
    q: "Can I add a logo to a QR code?",
    a: "Yes. QR Anvil accepts PNG, JPG, and WebP logos. It resizes the logo, protects the QR pattern behind it, and uses the highest error correction level.",
  },
  {
    q: "Where are QR codes generated?",
    a: "QR Anvil renders each QR image in the browser. Anonymous URL QR content and logos stay in the browser. For signed-in users, QR Anvil saves the content, logo, and design settings so the dashboard can render the same code again.",
  },
  {
    q: "What does error correction do?",
    a: "Error correction lets a QR code scan even when part of it is damaged or covered. Level L recovers 7 percent, M 15 percent, Q 25 percent, and H 30 percent of the code. Higher levels make the code denser but more robust.",
  },
];

function heading(level: number, text: string) {
  return `${"#".repeat(level)} ${text}`;
}

export function buildLlmsTxt(): string {
  const lines: string[] = [
    heading(1, SITE_NAME),
    "",
    `> ${SITE_NAME}: ${SITE_TAGLINE}. ${SITE_SUMMARY}`,
    "",
    `Canonical URL: ${SITE_URL}`,
    `Maker: KafLabs (${KAFLABS_URL})`,
    `Support: ${SUPPORT_EMAIL}`,
    `Pricing: free, no watermark. Optional donations at ${SITE_URL}/support`,
    "",
    heading(2, "Key facts"),
    "",
    ...FEATURE_LIST.map((f) => `- ${f}`),
    "",
    heading(2, "Pages"),
    "",
    `- [Home and QR code generator](${SITE_URL}/): create a QR code in the browser, choose Direct or Tracked mode, download PNG, SVG, or PDF.`,
    `- [All QR code types](${SITE_URL}/qr-types): overview of the 8 supported types.`,
    ...QR_TYPE_PAGE_LIST.map(
      (p) => `- [${p.h1}](${SITE_URL}/qr-types/${p.slug}): ${p.definition}`
    ),
    `- [About](${SITE_URL}/about): mission and the Direct versus Tracked model.`,
    `- [Support the project](${SITE_URL}/support): donations keep ${SITE_NAME} free.`,
    `- [Privacy policy](${SITE_URL}/privacy)`,
    `- [Terms of service](${SITE_URL}/terms)`,
    "",
    heading(2, "Optional"),
    "",
    `- [Full content for language models](${SITE_URL}/llms-full.txt): every page's definitions, steps, and FAQ answers in one file.`,
    `- [Sitemap](${SITE_URL}/sitemap.xml)`,
    "",
  ];
  return lines.join("\n");
}

export function buildLlmsFullTxt(): string {
  const lines: string[] = [
    heading(1, `${SITE_NAME}: full reference for language models`),
    "",
    `> ${SITE_SUMMARY}`,
    "",
    `Canonical URL: ${SITE_URL}`,
    `Maker: KafLabs (${KAFLABS_URL})`,
    `Support: ${SUPPORT_EMAIL}`,
    "",
    heading(2, "How QR Anvil works"),
    "",
    "1. Choose a QR code type: URL, Wi-Fi, vCard, Email, SMS, WhatsApp, PDF, or Plain Text.",
    "2. Enter the content. Choose Direct mode (content stored in the image) or Tracked mode (short redirect link with scan analytics and an editable destination).",
    "3. Customize colors, dot style, corner style, and add a center logo. QR Anvil uses Maximum error correction when a logo is present.",
    "4. Download as PNG, SVG, or PDF. The image is rendered in the browser.",
    "",
    "Account rules: URL QR codes and PNG downloads need no account. A free account is required for the other 7 types, SVG and PDF downloads, Tracked mode, and the analytics dashboard. QR Anvil saves the logo and design settings for signed-in users.",
    "",
    heading(2, "Features"),
    "",
    ...FEATURE_LIST.map((f) => `- ${f}`),
    "",
    heading(2, "General FAQ"),
    "",
    ...HOME_FAQS.flatMap((f) => [heading(3, f.q), "", f.a, ""]),
  ];

  for (const p of QR_TYPE_PAGE_LIST) {
    lines.push(
      heading(2, p.h1),
      "",
      `URL: ${SITE_URL}/qr-types/${p.slug}`,
      "",
      `**Definition.** ${p.definition}`,
      "",
      p.content,
      "",
      heading(3, "Use cases"),
      "",
      ...p.useCases.map((u) => `- ${u}`),
      "",
      heading(3, `How to create a ${p.label} QR code`),
      "",
      ...p.steps.map((s, i) => `${i + 1}. ${s}`),
      "",
      heading(3, "FAQ"),
      "",
      ...p.faqs.flatMap((f) => [`**${f.q}**`, "", f.a, ""])
    );
  }

  return lines.join("\n");
}
