import { SITE_URL } from "@/lib/constants";
import { QR_TYPE_SLUGS } from "@/lib/qr-type-content";
import { CONTENT_LAST_MODIFIED } from "@/lib/seo";
import type { MetadataRoute } from "next";

// lastModified is a fixed date so crawlers can trust it. A value that changes
// on every build tells search engines nothing. Bump CONTENT_LAST_MODIFIED in
// src/lib/seo.ts when public copy changes.
//
// Not listed on purpose: /pricing (redirects to /support), /sign-in, /sign-up,
// /dashboard, /r/*.
export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: CONTENT_LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/qr-types`,
      lastModified: CONTENT_LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/support`,
      lastModified: CONTENT_LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: CONTENT_LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: CONTENT_LAST_MODIFIED,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: CONTENT_LAST_MODIFIED,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const qrTypePages: MetadataRoute.Sitemap = QR_TYPE_SLUGS.map((slug) => ({
    url: `${SITE_URL}/qr-types/${slug}`,
    lastModified: CONTENT_LAST_MODIFIED,
    changeFrequency: "monthly" as const,
    priority: 0.9,
  }));

  return [...staticPages, ...qrTypePages];
}
