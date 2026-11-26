import { describe, expect, it, vi } from "vitest";
import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "@/lib/constants";

// The about page reads site stats from the database at render time. The
// metadata does not need it.
vi.mock("@/lib/stats", () => ({
  getSiteStats: async () => null,
  formatCount: String,
}));

const PAGES: { path: string; load: () => Promise<{ metadata: Metadata }> }[] = [
  { path: "/about", load: () => import("@/app/about/page") },
  { path: "/support", load: () => import("@/app/support/page") },
  { path: "/privacy", load: () => import("@/app/privacy/page") },
  { path: "/terms", load: () => import("@/app/terms/page") },
];

describe("static page metadata", () => {
  // Without its own openGraph object, a page shows the og:url and og:title of
  // the home page from the root layout.
  it.each(PAGES)("$path has its own Open Graph URL and title", async ({ path, load }) => {
    const { metadata } = await load();
    const title = typeof metadata.title === "string" ? metadata.title : (metadata.title as { absolute: string }).absolute;

    expect(metadata.alternates?.canonical).toBe(path);
    expect(metadata.openGraph).toMatchObject({
      url: `${SITE_URL}${path}`,
      title,
      siteName: SITE_NAME,
      images: [{ url: "/opengraph-image" }],
    });
    expect(metadata.twitter).toMatchObject({ card: "summary_large_image", title });
  });

  // The root title template adds "| QR Anvil". A page title that already has
  // the brand must be absolute, or the brand shows two times.
  it.each(PAGES)("$path does not repeat the brand in the title", async ({ load }) => {
    const { metadata } = await load();
    if (typeof metadata.title === "string") {
      expect(metadata.title).not.toContain(SITE_NAME);
    } else {
      expect(metadata.title).toHaveProperty("absolute");
    }
  });
});
