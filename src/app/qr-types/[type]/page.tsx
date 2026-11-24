import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ChevronDown } from "lucide-react";
import { QRGenerator } from "@/components/qr/qr-generator";
import { JsonLd } from "@/components/seo/json-ld";
import { SITE_NAME } from "@/lib/constants";
import { QR_TYPE_PAGES, QR_TYPE_SLUGS } from "@/lib/qr-type-content";
import {
  breadcrumbJsonLd,
  faqJsonLd,
  howToJsonLd,
  jsonLdGraph,
  pageSocialMetadata,
  webPageJsonLd,
} from "@/lib/seo";

export async function generateStaticParams() {
  return QR_TYPE_SLUGS.map((type) => ({ type }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ type: string }>;
}): Promise<Metadata> {
  const { type } = await params;
  const page = QR_TYPE_PAGES[type];
  if (!page) return {};

  return {
    title: page.title,
    description: page.description,
    keywords: page.keywords,
    alternates: { canonical: `/qr-types/${type}` },
    ...pageSocialMetadata({
      path: `/qr-types/${type}`,
      title: page.title,
      description: page.description,
    }),
  };
}

export default async function QRTypePage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  const page = QR_TYPE_PAGES[type];
  if (!page) notFound();

  const shortName = page.h1.replace(" Generator", "");

  const jsonLd = jsonLdGraph(
    webPageJsonLd({
      path: `/qr-types/${type}`,
      name: page.title,
      description: page.description,
    }),
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "QR Code Types", path: "/qr-types" },
      { name: page.h1, path: `/qr-types/${type}` },
    ]),
    howToJsonLd(`How to create a ${page.label} QR code`, page.steps, page.description),
    faqJsonLd(page.faqs)
  );

  return (
    <>
      <JsonLd data={jsonLd} />

      <div className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav
            aria-label="Breadcrumb"
            className="mx-auto max-w-3xl text-sm text-gray-500 dark:text-gray-400"
          >
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/" className="hover:text-primary">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href="/qr-types" className="hover:text-primary">
                  QR Code Types
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-gray-900 dark:text-white" aria-current="page">
                {page.label}
              </li>
            </ol>
          </nav>

          {/* Header */}
          <div className="mx-auto mt-6 max-w-3xl text-center">
            <h1 className="font-heading text-4xl font-extrabold text-gray-900 dark:text-white">
              {page.h1}
            </h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              {page.description}
            </p>
          </div>

          {/* Generator */}
          <div className="mx-auto mt-12 max-w-3xl rounded-2xl border border-gray-200 bg-white p-6 shadow-xl sm:p-8 dark:border-gray-800 dark:bg-gray-900">
            <QRGenerator defaultType={page.qrType} />
          </div>

          {/* Definition + content */}
          <section aria-labelledby="about-heading" className="mx-auto mt-16 max-w-3xl">
            <h2
              id="about-heading"
              className="font-heading text-2xl font-bold text-gray-900 dark:text-white"
            >
              What is a {shortName}?
            </h2>
            <p className="mt-4 text-lg font-medium leading-relaxed text-gray-800 dark:text-gray-200">
              {page.definition}
            </p>
            <p className="mt-4 leading-relaxed text-gray-600 dark:text-gray-400">
              {page.content}
            </p>
          </section>

          {/* Use cases */}
          <section aria-labelledby="use-cases-heading" className="mx-auto mt-16 max-w-3xl">
            <h2
              id="use-cases-heading"
              className="font-heading text-2xl font-bold text-gray-900 dark:text-white"
            >
              When to Use a {shortName}
            </h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {page.useCases.map((useCase) => (
                <li
                  key={useCase}
                  className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {useCase}
                </li>
              ))}
            </ul>
          </section>

          {/* Steps */}
          <section aria-labelledby="steps-heading" className="mx-auto mt-16 max-w-3xl">
            <h2
              id="steps-heading"
              className="font-heading text-2xl font-bold text-gray-900 dark:text-white"
            >
              How to Create a {shortName} with {SITE_NAME}
            </h2>
            <ol className="mt-6 space-y-4">
              {page.steps.map((step, index) => (
                <li key={step} className="flex items-start gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                    {index + 1}
                  </span>
                  <p className="pt-1 leading-relaxed text-gray-600 dark:text-gray-400">
                    {step}
                  </p>
                </li>
              ))}
            </ol>
          </section>

          {/* FAQ */}
          <section aria-labelledby="faq-heading" className="mx-auto mt-16 max-w-3xl">
            <h2
              id="faq-heading"
              className="font-heading text-2xl font-bold text-gray-900 dark:text-white"
            >
              {shortName} FAQ
            </h2>
            <div className="mt-6 space-y-4">
              {page.faqs.map((faq) => (
                <details
                  key={faq.q}
                  className="group rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
                >
                  <summary className="flex cursor-pointer items-center justify-between px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white [&::-webkit-details-marker]:hidden">
                    <h3 className="text-sm font-semibold">{faq.q}</h3>
                    <ChevronDown className="h-4 w-4 shrink-0 text-gray-400 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="px-6 pb-4">
                    <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                      {faq.a}
                    </p>
                  </div>
                </details>
              ))}
            </div>
          </section>

          {/* Internal links */}
          <section aria-labelledby="other-types-heading" className="mx-auto mt-16 max-w-3xl">
            <h2
              id="other-types-heading"
              className="font-heading text-2xl font-bold text-gray-900 dark:text-white"
            >
              Other QR Code Types
            </h2>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {QR_TYPE_SLUGS.filter((s) => s !== type).map((slug) => {
                const p = QR_TYPE_PAGES[slug];
                return (
                  <Link
                    key={slug}
                    href={`/qr-types/${slug}`}
                    className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:border-primary/30 hover:text-primary dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
                  >
                    {p.label} QR Code
                    <ArrowRight className="ml-auto h-4 w-4" />
                  </Link>
                );
              })}
              <Link
                href="/qr-types"
                className="flex items-center gap-2 rounded-xl border border-primary/30 bg-primary-50 px-4 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-white dark:bg-primary/10"
              >
                All QR code types
                <ArrowRight className="ml-auto h-4 w-4" />
              </Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
