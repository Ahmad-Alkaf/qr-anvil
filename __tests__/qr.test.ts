import { describe, expect, it } from "vitest";
import {
  buildQRData,
  DEFAULT_STYLE,
  parseStyle,
  QR_TYPES,
  qrGenerateSchema,
  serializeStyle,
  TRACKABLE_TYPES,
} from "@/lib/qr";

describe("qrGenerateSchema", () => {
  it("applies defaults to a minimal URL request", () => {
    const parsed = qrGenerateSchema.parse({ type: "URL", content: "https://example.com" });
    expect(parsed).toEqual({
      type: "URL",
      content: "https://example.com",
      foregroundColor: "#000000",
      backgroundColor: "#FFFFFF",
      size: 300,
      errorCorrection: "M",
      dotType: "square",
      cornerSquareType: "square",
      cornerDotType: "square",
      logoSize: 0.5,
      logoMargin: 0.01,
      logoOverscan: 0,
      logoUrl: null,
      isDirect: true,
    });
  });

  it("accepts every QR type", () => {
    for (const type of QR_TYPES) {
      expect(qrGenerateSchema.safeParse({ type, content: "x" }).success, type).toBe(true);
    }
  });

  it("rejects an unknown type", () => {
    expect(qrGenerateSchema.safeParse({ type: "BITCOIN", content: "x" }).success).toBe(false);
  });

  it("requires non-empty content of at most 4000 characters", () => {
    expect(qrGenerateSchema.safeParse({ type: "URL", content: "" }).success).toBe(false);
    expect(qrGenerateSchema.safeParse({ type: "URL" }).success).toBe(false);
    expect(qrGenerateSchema.safeParse({ type: "URL", content: "a".repeat(4000) }).success).toBe(true);
    expect(qrGenerateSchema.safeParse({ type: "URL", content: "a".repeat(4001) }).success).toBe(false);
  });

  it("only accepts six-digit hex colors for the foreground", () => {
    const base = { type: "URL", content: "x" };
    expect(qrGenerateSchema.safeParse({ ...base, foregroundColor: "#1a2B3c" }).success).toBe(true);
    expect(qrGenerateSchema.safeParse({ ...base, foregroundColor: "#FFF" }).success).toBe(false);
    expect(qrGenerateSchema.safeParse({ ...base, foregroundColor: "red" }).success).toBe(false);
    expect(qrGenerateSchema.safeParse({ ...base, foregroundColor: "#GGGGGG" }).success).toBe(false);
    expect(qrGenerateSchema.safeParse({ ...base, foregroundColor: "transparent" }).success).toBe(false);
  });

  it("allows a transparent background but no other keyword", () => {
    const base = { type: "URL", content: "x" };
    expect(qrGenerateSchema.safeParse({ ...base, backgroundColor: "transparent" }).success).toBe(true);
    expect(qrGenerateSchema.safeParse({ ...base, backgroundColor: "#00ff00" }).success).toBe(true);
    expect(qrGenerateSchema.safeParse({ ...base, backgroundColor: "white" }).success).toBe(false);
  });

  it("limits the size to 100..2000", () => {
    const base = { type: "URL", content: "x" };
    expect(qrGenerateSchema.safeParse({ ...base, size: 100 }).success).toBe(true);
    expect(qrGenerateSchema.safeParse({ ...base, size: 2000 }).success).toBe(true);
    expect(qrGenerateSchema.safeParse({ ...base, size: 99 }).success).toBe(false);
    expect(qrGenerateSchema.safeParse({ ...base, size: 2001 }).success).toBe(false);
    expect(qrGenerateSchema.safeParse({ ...base, size: "300" }).success).toBe(false);
  });

  it("validates error correction and shape options", () => {
    const base = { type: "URL", content: "x" };
    expect(qrGenerateSchema.safeParse({ ...base, errorCorrection: "H" }).success).toBe(true);
    expect(qrGenerateSchema.safeParse({ ...base, errorCorrection: "X" }).success).toBe(false);
    expect(qrGenerateSchema.safeParse({ ...base, dotType: "classy-rounded" }).success).toBe(true);
    expect(qrGenerateSchema.safeParse({ ...base, dotType: "triangle" }).success).toBe(false);
    expect(qrGenerateSchema.safeParse({ ...base, cornerSquareType: "extra-rounded" }).success).toBe(true);
    expect(qrGenerateSchema.safeParse({ ...base, cornerSquareType: "rounded" }).success).toBe(false);
    expect(qrGenerateSchema.safeParse({ ...base, cornerDotType: "dot" }).success).toBe(true);
    expect(qrGenerateSchema.safeParse({ ...base, cornerDotType: "extra-rounded" }).success).toBe(false);
  });

  it("requires isDirect to be a boolean when given", () => {
    const base = { type: "URL", content: "x" };
    expect(qrGenerateSchema.safeParse({ ...base, isDirect: false }).success).toBe(true);
    expect(qrGenerateSchema.safeParse({ ...base, isDirect: "false" }).success).toBe(false);
  });

  it("accepts safe logo data and rejects unsupported logo values", () => {
    const base = { type: "URL", content: "x" };
    expect(
      qrGenerateSchema.safeParse({
        ...base,
        logoUrl: "data:image/webp;base64,UklGRg==",
      }).success
    ).toBe(true);
    expect(
      qrGenerateSchema.safeParse({
        ...base,
        logoUrl: "data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=",
      }).success
    ).toBe(false);
    expect(qrGenerateSchema.safeParse({ ...base, logoUrl: "https://example.com/logo.png" }).success).toBe(false);
  });

  it("limits the logo size to 10..70 percent", () => {
    const base = { type: "URL", content: "x" };
    expect(qrGenerateSchema.safeParse({ ...base, logoSize: 0.1 }).success).toBe(true);
    expect(qrGenerateSchema.safeParse({ ...base, logoSize: 0.7 }).success).toBe(true);
    expect(qrGenerateSchema.safeParse({ ...base, logoSize: 0.09 }).success).toBe(false);
    expect(qrGenerateSchema.safeParse({ ...base, logoSize: 0.71 }).success).toBe(false);
  });

  it("limits the logo margin to 0..4 percent of the QR width", () => {
    const base = { type: "URL", content: "x" };
    expect(qrGenerateSchema.safeParse({ ...base, logoMargin: 0 }).success).toBe(true);
    expect(qrGenerateSchema.safeParse({ ...base, logoMargin: 0.04 }).success).toBe(true);
    expect(qrGenerateSchema.safeParse({ ...base, logoMargin: -0.005 }).success).toBe(false);
    expect(qrGenerateSchema.safeParse({ ...base, logoMargin: 0.045 }).success).toBe(false);
  });

  it("limits logo zoom to 0..50 percent", () => {
    const base = { type: "URL", content: "x" };
    expect(qrGenerateSchema.safeParse({ ...base, logoOverscan: 0 }).success).toBe(true);
    expect(qrGenerateSchema.safeParse({ ...base, logoOverscan: 0.5 }).success).toBe(true);
    expect(qrGenerateSchema.safeParse({ ...base, logoOverscan: -0.01 }).success).toBe(false);
    expect(qrGenerateSchema.safeParse({ ...base, logoOverscan: 0.51 }).success).toBe(false);
  });
});

describe("TRACKABLE_TYPES", () => {
  it("contains only the types whose payload is an http(s) URL", () => {
    expect([...TRACKABLE_TYPES].sort()).toEqual(["PDF", "URL", "WHATSAPP"]);
  });
});

describe("serializeStyle / parseStyle", () => {
  it("round-trips every combination", () => {
    const style = {
      dotType: "classy",
      cornerSquareType: "dot",
      cornerDotType: "dot",
      logoSize: 0.58,
      logoMargin: 0.025,
      logoOverscan: 0.12,
    } as const;
    expect(serializeStyle(style)).toBe("classy/dot/dot/0.58/0.025/0.12");
    expect(parseStyle(serializeStyle(style))).toEqual(style);
  });

  it("falls back to squares for missing or legacy values", () => {
    expect(parseStyle(null)).toEqual(DEFAULT_STYLE);
    expect(parseStyle(undefined)).toEqual(DEFAULT_STYLE);
    expect(parseStyle("")).toEqual(DEFAULT_STYLE);
    expect(parseStyle("legacy")).toEqual(DEFAULT_STYLE);
    expect(parseStyle("bogus/x/y")).toEqual(DEFAULT_STYLE);
  });

  it("keeps the valid parts of a partial value", () => {
    expect(parseStyle("dots")).toEqual({
      dotType: "dots",
      cornerSquareType: "square",
      cornerDotType: "square",
      logoSize: 0.5,
      logoMargin: 0.01,
      logoOverscan: 0,
    });
    expect(parseStyle("rounded/extra-rounded")).toEqual({
      dotType: "rounded",
      cornerSquareType: "extra-rounded",
      cornerDotType: "square",
      logoSize: 0.5,
      logoMargin: 0.01,
      logoOverscan: 0,
    });
    // A dot-type value in the corner slot is not valid there.
    expect(parseStyle("square/dots/dots")).toEqual(DEFAULT_STYLE);
  });

  it("uses the default for an unsafe saved logo size", () => {
    expect(parseStyle("dots/dot/dot/0.9").logoSize).toBe(0.5);
    expect(parseStyle("dots/dot/dot/not-a-number").logoSize).toBe(0.5);
  });

  it("uses the default for a missing or unsafe saved logo margin", () => {
    expect(parseStyle("dots/dot/dot/0.5").logoMargin).toBe(0.01);
    expect(parseStyle("dots/dot/dot/0.5/0.2").logoMargin).toBe(0.01);
    expect(parseStyle("dots/dot/dot/0.5/not-a-number").logoMargin).toBe(0.01);
  });

  it("uses zero for a missing or unsafe saved logo zoom", () => {
    expect(parseStyle("dots/dot/dot/0.5/0.01").logoOverscan).toBe(0);
    expect(parseStyle("dots/dot/dot/0.5/0.01/0.6").logoOverscan).toBe(0);
    expect(parseStyle("dots/dot/dot/0.5/0.01/not-a-number").logoOverscan).toBe(0);
  });
});

describe("buildQRData", () => {
  it("passes URL, PDF, and plain text through unchanged", () => {
    expect(buildQRData("URL", "https://example.com/a?b=c&d=e")).toBe("https://example.com/a?b=c&d=e");
    expect(buildQRData("PDF", "https://example.com/file.pdf")).toBe("https://example.com/file.pdf");
    expect(buildQRData("PLAIN_TEXT", 'Hello; "world", \\n')).toBe('Hello; "world", \\n');
  });

  describe("WIFI", () => {
    it("builds a WPA string", () => {
      const content = JSON.stringify({ ssid: "HomeNet", password: "secret123", encryption: "WPA" });
      expect(buildQRData("WIFI", content)).toBe("WIFI:T:WPA;S:HomeNet;P:secret123;;");
    });

    it("defaults the encryption to WPA", () => {
      const content = JSON.stringify({ ssid: "HomeNet", password: "pw" });
      expect(buildQRData("WIFI", content)).toBe("WIFI:T:WPA;S:HomeNet;P:pw;;");
    });

    it("omits the password for open networks", () => {
      const content = JSON.stringify({ ssid: "Cafe", password: "ignored", encryption: "nopass" });
      expect(buildQRData("WIFI", content)).toBe("WIFI:T:nopass;S:Cafe;;");
    });

    it("adds the hidden flag", () => {
      const content = JSON.stringify({ ssid: "Hidden", password: "pw", encryption: "WEP", hidden: true });
      expect(buildQRData("WIFI", content)).toBe("WIFI:T:WEP;S:Hidden;P:pw;H:true;;");
    });

    it("escapes the special characters of the WIFI format", () => {
      const content = JSON.stringify({ ssid: 'My;Net:"x",y\\z', password: 'p;a:s"s,w\\d' });
      expect(buildQRData("WIFI", content)).toBe(
        'WIFI:T:WPA;S:My\\;Net\\:\\"x\\"\\,y\\\\z;P:p\\;a\\:s\\"s\\,w\\\\d;;',
      );
    });

    it("returns non-JSON content unchanged", () => {
      expect(buildQRData("WIFI", "WIFI:T:WPA;S:raw;P:x;;")).toBe("WIFI:T:WPA;S:raw;P:x;;");
    });

    it("ignores non-string field values", () => {
      const content = JSON.stringify({ ssid: 42, password: { a: 1 } });
      expect(buildQRData("WIFI", content)).toBe("WIFI:T:WPA;S:;P:;;");
    });
  });

  describe("VCARD", () => {
    it("builds a full vCard 3.0", () => {
      const content = JSON.stringify({
        firstName: "Ada",
        lastName: "Lovelace",
        org: "Analytical Engines",
        title: "Mathematician",
        phone: "+44 20 7946 0000",
        email: "ada@example.com",
        url: "https://example.com",
        address: "1 Example St, London",
      });
      expect(buildQRData("VCARD", content).split("\n")).toEqual([
        "BEGIN:VCARD",
        "VERSION:3.0",
        "N:Lovelace;Ada",
        "FN:Ada Lovelace",
        "ORG:Analytical Engines",
        "TITLE:Mathematician",
        "TEL:+44 20 7946 0000",
        "EMAIL:ada@example.com",
        "URL:https://example.com",
        "ADR:;;1 Example St\\, London",
        "END:VCARD",
      ]);
    });

    it("omits empty optional fields and has no trailing space in FN", () => {
      const content = JSON.stringify({ firstName: "Ada", lastName: "", org: "", phone: "" });
      expect(buildQRData("VCARD", content).split("\n")).toEqual([
        "BEGIN:VCARD",
        "VERSION:3.0",
        "N:;Ada",
        "FN:Ada",
        "END:VCARD",
      ]);
    });

    it("escapes backslash, semicolon, comma, and newline", () => {
      const content = JSON.stringify({
        firstName: "A;B",
        lastName: "C,D\\E",
        address: "Line 1\nLine 2",
      });
      const lines = buildQRData("VCARD", content).split("\n");
      expect(lines).toContain("N:C\\,D\\\\E;A\\;B");
      expect(lines).toContain("FN:A\\;B C\\,D\\\\E");
      expect(lines).toContain("ADR:;;Line 1\\nLine 2");
      // The escaped newline must not split the vCard into an extra line.
      expect(lines.at(-1)).toBe("END:VCARD");
      expect(lines).toHaveLength(6);
    });

    it("returns non-JSON content unchanged", () => {
      expect(buildQRData("VCARD", "BEGIN:VCARD")).toBe("BEGIN:VCARD");
    });
  });

  describe("EMAIL", () => {
    it("builds a bare mailto from a plain address", () => {
      expect(buildQRData("EMAIL", "ada@example.com")).toBe("mailto:ada@example.com");
    });

    it("adds URL-encoded subject and body", () => {
      const content = JSON.stringify({ email: "ada@example.com", subject: "Hello World", body: "Line 1\nLine 2 & more" });
      expect(buildQRData("EMAIL", content)).toBe(
        "mailto:ada@example.com?subject=Hello%20World&body=Line%201%0ALine%202%20%26%20more",
      );
    });

    it("adds only the body when there is no subject", () => {
      const content = JSON.stringify({ email: "ada@example.com", body: "Hi" });
      expect(buildQRData("EMAIL", content)).toBe("mailto:ada@example.com?body=Hi");
    });

    it("has no query string when subject and body are empty", () => {
      const content = JSON.stringify({ email: "ada@example.com", subject: "", body: "" });
      expect(buildQRData("EMAIL", content)).toBe("mailto:ada@example.com");
    });
  });

  describe("SMS", () => {
    it("builds smsto from a plain number", () => {
      expect(buildQRData("SMS", "+15551234567")).toBe("smsto:+15551234567");
    });

    it("appends the message after a colon", () => {
      const content = JSON.stringify({ phone: "+15551234567", message: "Hi there" });
      expect(buildQRData("SMS", content)).toBe("smsto:+15551234567:Hi there");
    });

    it("omits the message part when empty", () => {
      const content = JSON.stringify({ phone: "+15551234567", message: "" });
      expect(buildQRData("SMS", content)).toBe("smsto:+15551234567");
    });
  });

  describe("WHATSAPP", () => {
    it("keeps only digits of a plain number", () => {
      expect(buildQRData("WHATSAPP", "+1 (555) 123-4567")).toBe("https://wa.me/15551234567");
    });

    it("adds a URL-encoded message", () => {
      const content = JSON.stringify({ phone: "+49 170 1234567", message: "Hello & welcome!" });
      expect(buildQRData("WHATSAPP", content)).toBe("https://wa.me/491701234567?text=Hello%20%26%20welcome!");
    });

    it("omits the text query when the message is empty", () => {
      const content = JSON.stringify({ phone: "491701234567", message: "" });
      expect(buildQRData("WHATSAPP", content)).toBe("https://wa.me/491701234567");
    });
  });

  it("returns the content for unknown types", () => {
    expect(buildQRData("UNKNOWN" as never, "abc")).toBe("abc");
  });
});
