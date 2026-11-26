import { describe, expect, it } from "vitest";
import { clerkFrontendApiHost, contentSecurityPolicy } from "@/lib/csp";

const key = (type: "live" | "test", host: string) =>
  `pk_${type}_${Buffer.from(`${host}$`).toString("base64")}`;

function directives(policy: string): Record<string, string[]> {
  return Object.fromEntries(
    policy.split("; ").map((part) => {
      const [name, ...values] = part.split(" ");
      return [name, values];
    }),
  );
}

describe("clerkFrontendApiHost", () => {
  it("reads the host from a live and a test publishable key", () => {
    expect(clerkFrontendApiHost(key("live", "clerk.qr-anvil.com"))).toBe("clerk.qr-anvil.com");
    expect(clerkFrontendApiHost(key("test", "fine-cat-12.clerk.accounts.dev"))).toBe(
      "fine-cat-12.clerk.accounts.dev",
    );
  });

  it("falls back to the production host without a valid key", () => {
    expect(clerkFrontendApiHost(undefined)).toBe("clerk.qr-anvil.com");
    expect(clerkFrontendApiHost("pk_live_")).toBe("clerk.qr-anvil.com");
    expect(clerkFrontendApiHost(`pk_live_${Buffer.from("a b;c$").toString("base64")}`)).toBe(
      "clerk.qr-anvil.com",
    );
  });
});

describe("contentSecurityPolicy", () => {
  const prod = directives(
    contentSecurityPolicy({ clerkPublishableKey: key("live", "clerk.qr-anvil.com"), dev: false }),
  );

  it("allows Clerk, Turnstile, and the Cloudflare Web Analytics beacon", () => {
    expect(prod["script-src"]).toEqual(
      expect.arrayContaining([
        "https://clerk.qr-anvil.com",
        "https://challenges.cloudflare.com",
        "https://static.cloudflareinsights.com",
      ]),
    );
    expect(prod["connect-src"]).toEqual(["'self'", "https://clerk.qr-anvil.com"]);
    expect(prod["img-src"]).toContain("https://img.clerk.com");
    expect(prod["worker-src"]).toContain("blob:");
    expect(prod["frame-src"]).toContain("https://challenges.cloudflare.com");
  });

  it("blocks plugins, base changes, foreign form posts, and framing", () => {
    expect(prod["object-src"]).toEqual(["'none'"]);
    expect(prod["base-uri"]).toEqual(["'self'"]);
    expect(prod["form-action"]).toEqual(["'self'"]);
    expect(prod["frame-ancestors"]).toEqual(["'none'"]);
  });

  it("adds eval and the dev server socket only in development", () => {
    expect(prod["script-src"]).not.toContain("'unsafe-eval'");
    expect(prod["connect-src"]).not.toContain("ws:");
    const dev = directives(contentSecurityPolicy({ clerkPublishableKey: undefined, dev: true }));
    expect(dev["script-src"]).toContain("'unsafe-eval'");
    expect(dev["connect-src"]).toContain("ws:");
  });
});
