import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GuidePage } from "@/components/guides/guide-page";
import { GUIDE_PAGES, GUIDE_SLUGS } from "@/lib/guide-content";
import { pageSocialMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return GUIDE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = GUIDE_PAGES[slug];

  if (!guide) return {};

  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: `/guides/${guide.slug}` },
    ...pageSocialMetadata({
      path: `/guides/${guide.slug}`,
      title: guide.title,
      description: guide.description,
      type: "article",
    }),
  };
}

export default async function GuideRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = GUIDE_PAGES[slug];

  if (!guide) notFound();

  return <GuidePage guide={guide} />;
}
