import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import {
  qrGenerateSchema,
  buildQRData,
  serializeStyle,
  TRACKABLE_TYPES,
} from "@/lib/qr";
import { prisma } from "@/lib/prisma";
import { ensureUser } from "@/lib/auth";
import { generateShortCode } from "@/lib/shortcode";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request";
import { SITE_URL } from "@/lib/constants";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req.headers) || "anonymous";
    const { success } = await checkRateLimit(ip);
    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = qrGenerateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: z.treeifyError(parsed.error) },
        { status: 400 }
      );
    }

    const {
      type,
      content,
      foregroundColor,
      backgroundColor,
      size,
      errorCorrection,
      dotType,
      cornerSquareType,
      cornerDotType,
      logoSize,
      logoMargin,
      logoOverscan,
      logoUrl,
      isDirect,
    } = parsed.data;
    const style = serializeStyle({
      dotType,
      cornerSquareType,
      cornerDotType,
      logoSize,
      logoMargin,
      logoOverscan,
    });

    const { userId } = await auth();

    // Non-URL types require authentication
    if (type !== "URL" && !userId) {
      return NextResponse.json(
        { error: "Sign in required to use this QR code type" },
        { status: 401 }
      );
    }

    // Tracked QR codes are only valid for types that produce HTTP URLs
    if (!isDirect && !TRACKABLE_TYPES.has(type)) {
      return NextResponse.json(
        { error: "This QR type does not support tracked mode" },
        { status: 400 }
      );
    }

    // Tracked QR codes require authentication
    if (!isDirect && !userId) {
      return NextResponse.json(
        { error: "Sign in required to create Tracked QR codes" },
        { status: 401 }
      );
    }

    const user = userId ? await ensureUser(userId) : null;

    if (!isDirect) {
      if (!user) {
        return NextResponse.json(
          { error: "No email found for your account" },
          { status: 400 }
        );
      }

      const destinationUrl = buildQRData(type, content);
      if (!/^https?:\/\//i.test(destinationUrl)) {
        return NextResponse.json(
          { error: "Tracked QR codes need a full http(s) URL" },
          { status: 400 }
        );
      }

      const MAX_RETRIES = 10;
      let shortCode: string | null = null;
      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        const candidate = generateShortCode();
        const exists = await prisma.qRCode.findUnique({
          where: { shortCode: candidate },
          select: { id: true },
        });
        if (!exists) {
          shortCode = candidate;
          break;
        }
      }
      if (!shortCode) {
        return NextResponse.json(
          { error: "Failed to generate unique short code. Please try again." },
          { status: 500 }
        );
      }

      const created = await prisma.qRCode.create({
        data: {
          userId: user.id,
          type,
          content,
          foregroundColor,
          backgroundColor,
          errorCorrection,
          size,
          style,
          logoUrl,
          isDirect: false,
          shortCode,
          destinationUrl,
        },
        select: { id: true, shortCode: true },
      });

      return NextResponse.json({
        id: created.id,
        qrData: `${SITE_URL}/r/${created.shortCode}`,
      });
    }

    // Direct mode: save to the account when signed in
    if (user) {
      const created = await prisma.qRCode.create({
        data: {
          userId: user.id,
          type,
          content,
          foregroundColor,
          backgroundColor,
          errorCorrection,
          size,
          style,
          logoUrl,
          isDirect: true,
        },
        select: { id: true },
      });
      return NextResponse.json({ saved: true, id: created.id });
    }

    return NextResponse.json({ saved: false });
  } catch (error) {
    console.error("QR generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate QR code" },
      { status: 500 }
    );
  }
}
