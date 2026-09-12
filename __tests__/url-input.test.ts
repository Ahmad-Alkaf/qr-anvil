import { describe, expect, it } from "vitest";
import { addHttpsPrefix } from "@/lib/url-input";

describe("addHttpsPrefix", () => {
  it("adds https:// when the first typed character is not h", () => {
    expect(addHttpsPrefix("a")).toBe("https://a");
  });

  it("does not change input that starts with h", () => {
    expect(addHttpsPrefix("h")).toBe("h");
    expect(addHttpsPrefix("https://example.com")).toBe("https://example.com");
    expect(addHttpsPrefix("HTTP://example.com")).toBe("HTTP://example.com");
  });

  it("does not add a prefix to an empty value", () => {
    expect(addHttpsPrefix("")).toBe("");
  });
});
