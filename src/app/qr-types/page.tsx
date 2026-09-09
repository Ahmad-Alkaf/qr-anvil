import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Contact,
  FileText,
  Link as LinkIcon,
  Mail,
  MessageCircle,
  MessageSquare,
  Type,
  Wifi,
  type LucideIcon,
} from "lucide-react";
import { JsonLd } from "@/components/seo/json-ld";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { TRACKABLE_TYPES } from "@/lib/qr";
import { QR_TYPE_PAGE_LIST } from "@/lib/qr-type-content";
import { breadcrumbJsonLd, jsonLdGraph, webPageJsonLd } from "@/lib/seo";

const TITLE = "QR Code Types — URL, Wi-Fi, vCard, Email, SMS, WhatsApp, PDF, Text";
const DESCRIPTION =
  "Compare the 8 QR code types you can create for free with QR Anvil. Learn what each type does, when to use it, and whether it works offline.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "QR code types",
    "types of QR codes",
    "what can a QR code do",
    "QR code use cases",
    "static vs dynamic QR code",
  ],
  alternates: { canonical: "/qr-types" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/qr-types`,
    type: "website",
  },
  twitter: { title: TITLE, description: DESCRIPTION },
};

const ICONS: Record<string, LucideIcon> = {
  url: LinkIcon,
  wifi: Wifi,
  vcard: Contact,
  email: Mail,
  sms: MessageSquare,
  whatsapp: MessageCircle,
  pdf: FileText,
  "plain-text": Type,
};

// Types whose content is read fully on the phone, with no link to open.
const OFFLINE_TYPES = new Set(["wifi", "vcard", "sms", "plain-text", "email"]);

// Plain-language result of a scan, for the comparison table.
const ON_SCAN: Record<string, string> = {
  url: "Opens a web page",
  wifi: "Joins the Wi-Fi network",
  vcard: "Saves a contact card",
  email: "Opens a ready-to-send email",
  sms: "Opens a ready-to-send text message",
  whatsapp: "Opens a WhatsApp chat",
  pdf: "Opens a PDF document",
  "plain-text": "Shows the text on screen",
};

export default function QRTypesIndexPage() {
  const jsonLd = jsonLdGraph(
    webPageJsonLd({
      path: "/qr-types",
      name: TITLE,
      description: DESCRIPTION,
      type: "CollectionPage",
    }),
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "QR Code Types", path: "/qr-types" },
    ]),
    {
      "@type": "ItemList",
      name: `QR code types supported by ${SITE_NAME}`,
      numberOfItems: QR_TYPE_PAGE_LIST.length,
      itemListElement: QR_TYPE_PAGE_LIST.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: p.h1,
        description: p.definition,
        url: `${SITE_URL}/qr-types/${p.slug}`,
      })),
    }
  );

  return (
    <>
      <JsonLd data={jsonLd} />

      <div className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="mx-auto max-w-3xl text-sm text-gray-500 dark:text-gray-400">
            <ol className="flex items-center gap-2">
              <li>
                <Link href="/" className="hover:text-primary">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-gray-900 dark:text-white" aria-current="page">
                QR Code Types
              </li>
            </ol>
          </nav>

          <div className="mx-auto mt-6 max-w-3xl text-center">
            <h1 className="font-heading text-4xl font-extrabold text-gray-900 dark:text-white">
              Every QR Code Type You Can Create
            </h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              Choose what you want people to do after they scan. They can open
              a link, join Wi-Fi, save a contact, start a message, view a PDF,
              or read text. Select a type to make your code.
            </p>
          </div>

          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {QR_TYPE_PAGE_LIST.map((p) => {
              const Icon = ICONS[p.slug];
              return (
                <li key={p.slug}>
                  <Link
                    href={`/qr-types/${p.slug}`}
                    className="group flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary transition-colors group-hover:bg-primary group-hover:text-white dark:bg-primary/10">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h2 className="mt-4 font-heading text-lg font-semibold text-gray-900 dark:text-white">
                      {p.label} QR Code
                    </h2>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                      {p.definition}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                      Create {p.label} QR code
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Comparison table */}
          <section aria-labelledby="compare-types-heading" className="mx-auto mt-20 max-w-4xl">
            <h2
              id="compare-types-heading"
              className="text-center font-heading text-2xl font-bold text-gray-900 dark:text-white"
            >
              Which QR Code Type Should I Use?
            </h2>
            <div className="mt-8 overflow-x-auto rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500 dark:bg-gray-800/60 dark:text-gray-400">
                  <tr>
                    <th scope="col" className="px-6 py-3">Type</th>
                    <th scope="col" className="px-6 py-3">What happens after a scan</th>
                    <th scope="col" className="px-6 py-3">Works offline</th>
                    <th scope="col" className="px-6 py-3">Tracked mode</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {QR_TYPE_PAGE_LIST.map((p) => (
                    <tr key={p.slug}>
                      <th scope="row" className="px-6 py-3 font-medium text-gray-900 dark:text-white">
                        <Link href={`/qr-types/${p.slug}`} className="hover:text-primary">
                          {p.label}
                        </Link>
                      </th>
                      <td className="px-6 py-3 text-gray-600 dark:text-gray-400">
                        {ON_SCAN[p.slug]}
                      </td>
                      <td className="px-6 py-3 text-gray-600 dark:text-gray-400">
                        {OFFLINE_TYPES.has(p.slug) ? "Yes" : "No, opens a link"}
                      </td>
                      <td className="px-6 py-3 text-gray-600 dark:text-gray-400">
                        {TRACKABLE_TYPES.has(p.qrType) ? "Yes" : "Direct only"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
              Direct QR codes open the saved information. Tracked QR codes
              count scans and let you change the link later.{" "}
              <Link href="/#compare-heading" className="text-primary hover:underline">
                Compare Direct and Tracked
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
