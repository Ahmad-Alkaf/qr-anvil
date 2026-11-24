import { describe, expect, it } from "vitest";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { OG_IMAGE_ALT, pageSocialMetadata } from "@/lib/seo";

describe("pageSocialMetadata", () => {
  const { openGraph, twitter } = pageSocialMetadata({
    path: "/guides/how-to-scan-a-qr-code",
    title: "How to Scan a QR Code",
    description: "Scan steps.",
    type: "article",
  });

  // A page openGraph or twitter object replaces the root layout object, so
  // the helper must give back the shared image, site name, and card type.
  it("keeps the shared Open Graph image and site fields", () => {
    expect(openGraph).toMatchObject({
      type: "article",
      url: `${SITE_URL}/guides/how-to-scan-a-qr-code`,
      siteName: SITE_NAME,
      locale: "en_US",
      title: "How to Scan a QR Code",
      description: "Scan steps.",
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: OG_IMAGE_ALT,
          type: "image/png",
        },
      ],
    });
  });

  it("uses the large image card for Twitter", () => {
    expect(twitter).toMatchObject({
      card: "summary_large_image",
      title: "How to Scan a QR Code",
      images: [{ url: "/opengraph-image" }],
    });
  });

  it("uses the website type by default", () => {
    const { openGraph: og } = pageSocialMetadata({
      path: "/qr-types",
      title: "QR Code Types",
      description: "Types.",
    });
    expect(og).toMatchObject({ type: "website" });
  });
});
