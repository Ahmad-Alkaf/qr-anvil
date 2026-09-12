import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import { GUIDE_SLUGS } from "@/lib/guide-content";
import { QR_TYPE_SLUGS } from "@/lib/qr-type-content";

const STATIC_PATHS = [
  "/",
  "/qr-types",
  "/guides",
  "/qr-code-scanner",
  "/support",
  "/about",
  "/privacy",
  "/terms",
];

describe("sitemap", () => {
  it("includes every public canonical page once", () => {
    const paths = sitemap().map(({ url }) => {
      const path = new URL(url).pathname;
      return path === "/" ? path : path.replace(/\/$/, "");
    });
    const expectedPaths = [
      ...STATIC_PATHS,
      ...QR_TYPE_SLUGS.map((slug) => `/qr-types/${slug}`),
      ...GUIDE_SLUGS.map((slug) => `/guides/${slug}`),
    ];

    expect(paths).toHaveLength(22);
    expect(new Set(paths).size).toBe(paths.length);
    expect(paths.sort()).toEqual(expectedPaths.sort());
  });

  it("uses the latest public content date", () => {
    const modificationDates = sitemap().map(({ lastModified }) =>
      new Date(lastModified as string | Date).toISOString(),
    );

    expect(new Set(modificationDates)).toEqual(
      new Set(["2026-09-12T00:00:00.000Z"]),
    );
  });
});
