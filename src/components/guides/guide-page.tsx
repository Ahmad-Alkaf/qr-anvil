import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  Lightbulb,
} from "lucide-react";
import { JsonLd } from "@/components/seo/json-ld";
import { KAFLABS_URL, SITE_NAME, SITE_URL } from "@/lib/constants";
import {
  GUIDE_PAGES,
  GUIDES_LAST_MODIFIED,
  type GuideDefinition,
} from "@/lib/guide-content";
import {
  breadcrumbJsonLd,
  faqJsonLd,
  howToJsonLd,
  jsonLdGraph,
  webPageJsonLd,
} from "@/lib/seo";

export function GuidePage({ guide }: { guide: GuideDefinition }) {
  const path = `/guides/${guide.slug}`;
  const jsonLdNodes: Record<string, unknown>[] = [
    webPageJsonLd({
      path,
      name: guide.title,
      description: guide.description,
    }),
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Guides", path: "/guides" },
      { name: guide.h1, path },
    ]),
    {
      "@type": "Article",
      headline: guide.h1,
      description: guide.description,
      mainEntityOfPage: `${SITE_URL}${path}`,
      dateModified: GUIDES_LAST_MODIFIED.toISOString(),
      author: { "@type": "Organization", name: "KafLabs", url: KAFLABS_URL },
      publisher: { "@type": "Organization", name: "KafLabs", url: KAFLABS_URL },
      inLanguage: "en",
    },
    faqJsonLd(guide.faqs),
  ];

  if (guide.howToSteps) {
    jsonLdNodes.push(
      howToJsonLd(guide.h1, guide.howToSteps, guide.description),
    );
  }

  const relatedGuides = guide.relatedSlugs
    .map((slug) => GUIDE_PAGES[slug])
    .filter((item): item is GuideDefinition => Boolean(item));

  return (
    <>
      <JsonLd data={jsonLdGraph(...jsonLdNodes)} />

      <article className="py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <nav
            aria-label="Breadcrumb"
            className="text-sm text-gray-500 dark:text-gray-400"
          >
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/" className="hover:text-primary">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href="/guides" className="hover:text-primary">
                  Guides
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-gray-900 dark:text-white" aria-current="page">
                {guide.h1}
              </li>
            </ol>
          </nav>

          <header className="mt-8 border-b border-gray-200 pb-10 dark:border-gray-800">
            <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-primary">
              <span className="rounded-full bg-primary-50 px-3 py-1 dark:bg-primary/10">
                {guide.category} guide
              </span>
              <span className="inline-flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                <BookOpen className="h-4 w-4" aria-hidden="true" />
                {guide.readMinutes} minute read
              </span>
            </div>
            <h1 className="mt-5 max-w-3xl font-heading text-4xl font-extrabold text-gray-900 sm:text-5xl dark:text-white">
              {guide.h1}
            </h1>
            <p className="mt-5 max-w-3xl text-xl leading-relaxed text-gray-600 dark:text-gray-300">
              {guide.description}
            </p>
          </header>

          <div className="mx-auto mt-10 max-w-3xl">
            <div className="space-y-4 text-lg leading-relaxed text-gray-700 dark:text-gray-300">
              {guide.intro.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            <aside className="mt-8 rounded-2xl border border-primary/20 bg-primary-50 p-6 dark:bg-primary/10">
              <p className="font-heading text-xl font-bold text-gray-900 dark:text-white">
                Use {SITE_NAME}
              </p>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                {guide.primaryLink.description}
              </p>
              <Link
                href={guide.primaryLink.href}
                className="mt-4 inline-flex items-center gap-2 font-semibold text-primary hover:underline"
              >
                {guide.primaryLink.label}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </aside>

            <div className="mt-14 space-y-14">
              {guide.sections.map((section, sectionIndex) => (
                <section
                  key={section.heading}
                  aria-labelledby={`guide-section-${sectionIndex}`}
                >
                  <h2
                    id={`guide-section-${sectionIndex}`}
                    className="font-heading text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white"
                  >
                    {section.heading}
                  </h2>

                  {section.paragraphs && (
                    <div className="mt-5 space-y-4 leading-relaxed text-gray-600 dark:text-gray-400">
                      {section.paragraphs.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>
                  )}

                  {section.steps && (
                    <ol className="mt-6 space-y-5">
                      {section.steps.map((step, stepIndex) => (
                        <li key={step.title} className="flex items-start gap-4">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                            {stepIndex + 1}
                          </span>
                          <div className="pt-0.5">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {step.title}
                            </h3>
                            <p className="mt-1 leading-relaxed text-gray-600 dark:text-gray-400">
                              {step.text}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  )}

                  {section.bullets && (
                    <ul className="mt-6 space-y-3">
                      {section.bullets.map((bullet) => (
                        <li key={bullet} className="flex items-start gap-3">
                          <CheckCircle2
                            className="mt-1 h-5 w-5 shrink-0 text-primary"
                            aria-hidden="true"
                          />
                          <span className="leading-relaxed text-gray-600 dark:text-gray-400">
                            {bullet}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {section.note && (
                    <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-300/40 bg-amber-50 p-4 text-sm leading-relaxed text-amber-950 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-100">
                      <Lightbulb className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                      <p>{section.note}</p>
                    </div>
                  )}
                </section>
              ))}
            </div>

            <section aria-labelledby="faq-heading" className="mt-16">
              <h2
                id="faq-heading"
                className="font-heading text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white"
              >
                Frequently Asked Questions
              </h2>
              <div className="mt-6 space-y-4">
                {guide.faqs.map((faq) => (
                  <details
                    key={faq.q}
                    className="group rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
                  >
                    <summary className="cursor-pointer px-6 py-4 font-semibold text-gray-900 dark:text-white">
                      {faq.q}
                    </summary>
                    <p className="px-6 pb-5 leading-relaxed text-gray-600 dark:text-gray-400">
                      {faq.a}
                    </p>
                  </details>
                ))}
              </div>
            </section>

            {guide.sources && guide.sources.length > 0 && (
              <section aria-labelledby="sources-heading" className="mt-14">
                <h2
                  id="sources-heading"
                  className="font-heading text-xl font-bold text-gray-900 dark:text-white"
                >
                  Official Sources
                </h2>
                <ul className="mt-4 space-y-3">
                  {guide.sources.map((source) => (
                    <li key={source.href}>
                      <a
                        href={source.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-start gap-2 text-sm text-primary hover:underline"
                      >
                        {source.label}
                        <ExternalLink className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <section
            aria-labelledby="related-guides-heading"
            className="mt-16 border-t border-gray-200 pt-10 dark:border-gray-800"
          >
            <div className="flex items-center justify-between gap-4">
              <h2
                id="related-guides-heading"
                className="font-heading text-2xl font-bold text-gray-900 dark:text-white"
              >
                Related Guides
              </h2>
              <Link
                href="/guides"
                className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
              >
                All guides
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {relatedGuides.map((related) => (
                <Link
                  key={related.slug}
                  href={`/guides/${related.slug}`}
                  className="group rounded-2xl border border-gray-200 bg-white p-5 transition-colors hover:border-primary/40 dark:border-gray-800 dark:bg-gray-900"
                >
                  <span className="text-sm font-semibold text-primary">
                    {related.category}
                  </span>
                  <h3 className="mt-2 font-heading text-lg font-bold text-gray-900 group-hover:text-primary dark:text-white">
                    {related.h1}
                  </h3>
                </Link>
              ))}
            </div>
          </section>

          <Link
            href="/guides"
            className="mt-10 inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-primary dark:text-gray-400"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to all guides
          </Link>
        </div>
      </article>
    </>
  );
}
