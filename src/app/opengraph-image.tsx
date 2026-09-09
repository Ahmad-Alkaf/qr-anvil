import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/constants";
import { BRAND_ORANGE, BRAND_TAGLINE, MARK_PATH, MARK_VIEWBOX } from "@/lib/brand";

export const alt = `${SITE_NAME} — Free QR Code Generator`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "72px 88px",
          background: "linear-gradient(135deg, #030712 0%, #0e1116 60%, #1b2028 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 700 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <svg width="56" height="56" viewBox={MARK_VIEWBOX}>
              <path d={MARK_PATH} fill={BRAND_ORANGE} fillRule="evenodd" />
            </svg>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", fontSize: 40, fontWeight: 700, lineHeight: 1 }}>
                <span style={{ color: BRAND_ORANGE }}>QR</span>
                <span style={{ marginLeft: 10 }}>Anvil</span>
              </div>
              <div
                style={{
                  marginTop: 10,
                  fontSize: 18,
                  fontWeight: 400,
                  fontStyle: "italic",
                  color: "#9ca3af",
                }}
              >
                {BRAND_TAGLINE}
              </div>
            </div>
          </div>
          <div style={{ marginTop: 40, fontSize: 64, fontWeight: 800, lineHeight: 1.1 }}>
            Free QR Code Generator
          </div>
          <div style={{ marginTop: 24, fontSize: 30, color: "#9ca3af", lineHeight: 1.4 }}>
            Create, customize, and track QR codes for URLs, Wi-Fi, vCards, and more.
          </div>
        </div>
        <svg width="300" height="300" viewBox={MARK_VIEWBOX}>
          <path d={MARK_PATH} fill={BRAND_ORANGE} fillRule="evenodd" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
