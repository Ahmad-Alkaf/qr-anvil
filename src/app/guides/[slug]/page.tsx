import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GuidePage } from "@/components/guides/guide-page";
import { SITE_URL } from "@/lib/constants";
import { GUIDE_PAGES, GUIDE_SLUGS } from "@/lib/guide-content";

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

  const url = `${SITE_URL}/guides/${guide.slug}`;

  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: `/guides/${guide.slug}` },
    openGraph: {
      title: guide.title,
      description: guide.description,
      url,
      type: "article",
    },
    twitter: {
      title: guide.title,
      description: guide.description,
    },
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
