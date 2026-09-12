import { NextResponse, after } from "next/server";
import { prisma } from "@/lib/prisma";
import { anonymizeIp, getClientIp, getGeo } from "@/lib/request";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { getReservedRedirect } from "@/lib/tracked-reservation";

export const dynamic = "force-dynamic";

/** Small self-contained page shown to people who scan a deleted or unknown code. */
function notFoundPage(): NextResponse {
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex"><title>QR code not found | ${SITE_NAME}</title>
<style>body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;font-family:system-ui,sans-serif;background:#030712;color:#e5e7eb;text-align:center;padding:24px}
h1{font-size:1.5rem;margin:0 0 8px}p{color:#9ca3af;margin:0 0 20px}a{color:#C45B28;font-weight:600;text-decoration:none}</style></head>
<body><div><h1>This QR code is no longer active</h1><p>The link behind it was removed or never existed.</p><a href="${SITE_URL}">Create your own QR code with ${SITE_NAME}</a></div></body></html>`;
  return new NextResponse(html, {
    status: 404,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ shortCode: string }> }
) {
  const { shortCode } = await params;

  let qr = await prisma.qRCode.findUnique({
    where: { shortCode },
    select: { id: true, destinationUrl: true },
  });

  if (!qr) {
    const reservedDestination = await getReservedRedirect(shortCode);
    if (reservedDestination) {
      // Draft scans prove that the reserved QR works, but they are not analytics.
      return redirectResponse(reservedDestination);
    }

    // Activation can finish between the first active lookup and the reservation
    // lookup. Check once more so that scan does not see a temporary 404.
    qr = await prisma.qRCode.findUnique({
      where: { shortCode },
      select: { id: true, destinationUrl: true },
    });
  }

  // Only allow http(s) redirects to prevent open redirects to javascript:, data:, etc.
  const dest = qr?.destinationUrl;
  if (!qr || !dest || !/^https?:\/\//i.test(dest)) return notFoundPage();

  // Log the scan after the response is sent so the redirect is not delayed.
  const headers = new Headers(req.headers);
  after(() => logScan(qr.id, headers).catch(console.error));

  return redirectResponse(dest);
}

function redirectResponse(destination: string): NextResponse {
  return NextResponse.redirect(destination, {
    status: 302,
    // Short links are private redirects. Keep them and their destinations out
    // of search results under our domain.
    headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" },
  });
}

async function logScan(qrCodeId: string, headers: Headers) {
  const ip = anonymizeIp(getClientIp(headers));
  const userAgent = headers.get("user-agent") || "";
  const referer = headers.get("referer") || null;
  const { country, city } = getGeo(headers);

  const device = /Mobile|Android|iPhone|iPad/i.test(userAgent)
    ? "Mobile"
    : "Desktop";
  const os = parseOS(userAgent);
  const browser = parseBrowser(userAgent);

  await prisma.scan.create({
    data: {
      qrCodeId,
      ip,
      country,
      city,
      device,
      os,
      browser,
      referer,
    },
  });
}

function parseOS(ua: string): string {
  if (/Windows/i.test(ua)) return "Windows";
  if (/iPhone|iPad|iPod/i.test(ua)) return "iOS";
  if (/Mac OS X|macOS/i.test(ua)) return "macOS";
  if (/Android/i.test(ua)) return "Android";
  if (/CrOS/i.test(ua)) return "ChromeOS";
  if (/Linux/i.test(ua)) return "Linux";
  return "Unknown";
}

function parseBrowser(ua: string): string {
  if (/SamsungBrowser\//i.test(ua)) return "Samsung Internet";
  if (/UCBrowser\//i.test(ua) || /UCWEB/i.test(ua)) return "UC Browser";
  if (/OPR\//i.test(ua) || /Opera/i.test(ua)) return "Opera";
  if (/Vivaldi\//i.test(ua)) return "Vivaldi";
  if (/YaBrowser\//i.test(ua)) return "Yandex";
  if (/Brave/i.test(ua)) return "Brave";
  if (/Edg(e|A|iOS)?\//i.test(ua)) return "Edge";
  if (/Firefox\//i.test(ua) || /FxiOS\//i.test(ua)) return "Firefox";
  if (/CriOS\//i.test(ua)) return "Chrome";
  if (/Chrome\//i.test(ua) && !/Chromium/i.test(ua)) return "Chrome";
  if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) return "Safari";
  return "Unknown";
}
