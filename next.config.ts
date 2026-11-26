import type { NextConfig } from "next";
import { contentSecurityPolicy } from "./src/lib/csp";

// Built once at build time. NEXT_PUBLIC_* variables are available then (Coolify:
// "Available at build time"), so the policy names the correct Clerk host.
const csp = contentSecurityPolicy({
  clerkPublishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  dev: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  // Self-contained server bundle for the Docker image (Coolify).
  output: "standalone",
  poweredByHeader: false,
  images: {
    formats: ["image/webp", "image/avif"],
    remotePatterns: [{ protocol: "https", hostname: "img.clerk.com" }],
  },
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "Content-Security-Policy", value: csp },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        {
          key: "Permissions-Policy",
          value: "camera=(self), microphone=(), geolocation=(), payment=()",
        },
        {
          key: "Strict-Transport-Security",
          value: "max-age=31536000; includeSubDomains",
        },
      ],
    },
  ],
};

export default nextConfig;
