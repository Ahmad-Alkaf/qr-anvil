import { SITE_URL } from "@/lib/constants";
import type { MetadataRoute } from "next";

// Private or transient routes. Short redirect links (/r/) are excluded so
// that user destinations are not indexed under our domain.
const DISALLOW = [
  "/dashboard",
  "/api/",
  "/r/",
  "/sign-in",
  "/sign-up",
  "/pricing",
];

// AI assistants and answer engines. They are allowed the same public pages
// as search engines so QR Anvil can be cited as a source.
const AI_CRAWLERS = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot",
  "Applebot-Extended",
  "Bingbot",
  "DuckAssistBot",
  "Amazonbot",
  "meta-externalagent",
  "cohere-ai",
  "YouBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOW },
      { userAgent: AI_CRAWLERS, allow: "/", disallow: DISALLOW },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
