/**
 * Content-Security-Policy for all responses (set in next.config.ts).
 *
 * The pages are prerendered, so scripts cannot get a per-request nonce:
 * `script-src` keeps 'unsafe-inline' for the inline Next.js payload scripts,
 * as in the Next.js guide "Content Security Policy > Without Nonces". The
 * policy still blocks scripts, fetches, frames, and images from other hosts,
 * plugins, <base> changes, form posts to other origins, and framing.
 *
 * Third-party hosts:
 * - Clerk Frontend API (scripts, API calls) and img.clerk.com (avatars).
 *   Clerk starts web workers from blob: URLs.
 * - challenges.cloudflare.com: Clerk bot protection (Turnstile) on sign-up.
 * - static.cloudflareinsights.com: the Cloudflare Web Analytics beacon that
 *   the Cloudflare edge adds to each page. It posts to /cdn-cgi/rum on this
 *   origin ('self').
 *
 * No imports with the "@/" alias: next.config.ts imports this file.
 */

const FALLBACK_CLERK_FRONTEND_API = "clerk.qr-anvil.com";

/**
 * Host of the Clerk Frontend API, from the publishable key. The key is
 * "pk_<live|test>_" + base64("<host>$"), for example clerk.qr-anvil.com in
 * production and <id>.clerk.accounts.dev for a development instance.
 */
export function clerkFrontendApiHost(publishableKey: string | undefined): string {
  const encoded = publishableKey?.split("_")[2];
  if (!encoded) return FALLBACK_CLERK_FRONTEND_API;
  const host = Buffer.from(encoded, "base64").toString("utf8").replace(/\$$/, "");
  return /^[a-z0-9.-]+$/i.test(host) ? host : FALLBACK_CLERK_FRONTEND_API;
}

export function contentSecurityPolicy(opts: {
  clerkPublishableKey: string | undefined;
  dev: boolean;
}): string {
  const clerk = `https://${clerkFrontendApiHost(opts.clerkPublishableKey)}`;
  const turnstile = "https://challenges.cloudflare.com";
  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    // React needs eval only in development (error stacks).
    "script-src": [
      "'self'",
      "'unsafe-inline'",
      ...(opts.dev ? ["'unsafe-eval'"] : []),
      clerk,
      turnstile,
      "https://static.cloudflareinsights.com",
    ],
    "connect-src": ["'self'", clerk, ...(opts.dev ? ["ws:"] : [])],
    "img-src": ["'self'", "data:", "blob:", "https://img.clerk.com"],
    "style-src": ["'self'", "'unsafe-inline'"],
    "font-src": ["'self'", "data:"],
    "worker-src": ["'self'", "blob:"],
    "frame-src": ["'self'", turnstile],
    "media-src": ["'self'", "blob:"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
  };
  // No upgrade-insecure-requests: HSTS already forces HTTPS, every asset URL
  // is relative or https, and the same policy then works on a local
  // http://localhost production build for tests.
  return Object.entries(directives)
    .map(([name, values]) => `${name} ${values.join(" ")}`)
    .join("; ");
}
