import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Laptop,
  QrCode,
  ScanLine,
  Smartphone,
  Wifi,
  type LucideIcon,
} from "lucide-react";
import { JsonLd } from "@/components/seo/json-ld";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { GUIDE_PAGES } from "@/lib/guide-content";
import { breadcrumbJsonLd, jsonLdGraph, webPageJsonLd } from "@/lib/seo";

const TITLE = "QR Code Guides: Create, Scan, and Share";
const DESCRIPTION =
  "Use clear QR code guides for creating, scanning, Windows Wi-Fi connections, Android cameras, and Direct or Tracked code selection.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/guides" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/guides`,
    type: "website",
  },
  twitter: { title: TITLE, description: DESCRIPTION },
};

const GUIDE_ORDER = [
  "how-to-create-a-qr-code",
  "how-to-scan-a-qr-code",
  "connect-to-wifi-with-qr-code-windows",
  "how-to-scan-a-qr-code-on-android",
  "how-to-scan-a-qr-code-on-windows",
  "direct-vs-tracked-qr-codes",
] as const;

const GUIDE_ICONS: Record<(typeof GUIDE_ORDER)[number], LucideIcon> = {
  "how-to-create-a-qr-code": QrCode,
  "how-to-scan-a-qr-code": ScanLine,
  "connect-to-wifi-with-qr-code-windows": Wifi,
  "how-to-scan-a-qr-code-on-android": Smartphone,
  "how-to-scan-a-qr-code-on-windows": Laptop,
  "direct-vs-tracked-qr-codes": BookOpen,
};

export default function GuidesPage() {
  const guides = GUIDE_ORDER.map((slug) => GUIDE_PAGES[slug]);
  const jsonLd = jsonLdGraph(
    webPageJsonLd({
      path: "/guides",
      name: TITLE,
      description: DESCRIPTION,
      type: "CollectionPage",
    }),
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Guides", path: "/guides" },
    ]),
    {
      "@type": "ItemList",
      name: `${SITE_NAME} QR code guides`,
      numberOfItems: guides.length,
      itemListElement: guides.map((guide, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: guide.h1,
        description: guide.description,
        url: `${SITE_URL}/guides/${guide.slug}`,
      })),
    },
  );

  return (
    <>
      <JsonLd data={jsonLd} />

      <div className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav
            aria-label="Breadcrumb"
            className="mx-auto max-w-3xl text-sm text-gray-500 dark:text-gray-400"
          >
            <ol className="flex items-center gap-2">
              <li>
                <Link href="/" className="hover:text-primary">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-gray-900 dark:text-white" aria-current="page">
                Guides
              </li>
            </ol>
          </nav>

          <header className="mx-auto mt-7 max-w-3xl text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary dark:bg-primary/10">
              <BookOpen className="h-7 w-7" aria-hidden="true" />
            </div>
            <h1 className="mt-5 font-heading text-4xl font-extrabold text-gray-900 sm:text-5xl dark:text-white">
              QR Code Guides
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-gray-600 dark:text-gray-400">
              Learn how to create, test, scan, and share QR codes. Each guide
              gives direct steps and explains the important limits.
            </p>
          </header>

          <ul className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {guides.map((guide) => {
              const Icon = GUIDE_ICONS[guide.slug as (typeof GUIDE_ORDER)[number]];

              return (
                <li key={guide.slug}>
                  <Link
                    href={`/guides/${guide.slug}`}
                    className="group flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-colors hover:border-primary/40 dark:border-gray-800 dark:bg-gray-900"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary transition-colors group-hover:bg-primary group-hover:text-white dark:bg-primary/10">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <span className="text-xs font-semibold text-gray-400">
                        {guide.readMinutes} min
                      </span>
                    </div>
                    <p className="mt-5 text-sm font-semibold text-primary">
                      {guide.category}
                    </p>
                    <h2 className="mt-2 font-heading text-xl font-bold text-gray-900 group-hover:text-primary dark:text-white">
                      {guide.h1}
                    </h2>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                      {guide.description}
                    </p>
                    <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                      Read guide
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <section className="mx-auto mt-16 max-w-3xl rounded-2xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900">
            <h2 className="font-heading text-2xl font-bold text-gray-900 dark:text-white">
              Ready to Make a QR Code?
            </h2>
            <p className="mt-3 text-gray-600 dark:text-gray-400">
              Create a code for a link, Wi-Fi network, contact, message, PDF,
              or plain text.
            </p>
            <Link
              href="/#generator"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              Open the generator
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </section>
        </div>
      </div>
    </>
  );
}
