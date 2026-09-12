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
import {
  checkRateLimit,
  checkReservationCreationRateLimit,
} from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request";
import {
  activateTrackedQRCode,
  reserveTrackedQRCode,
} from "@/lib/tracked-reservation";

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

      const reservationLimit = await checkReservationCreationRateLimit(
        user.clerkId
      );
      if (!reservationLimit.success) {
        return NextResponse.json(
          { error: "Too many tracked QR reservations. Please try again later." },
          { status: 429 }
        );
      }

      const destinationUrl = buildQRData(type, content);
      if (!/^https?:\/\//i.test(destinationUrl)) {
        return NextResponse.json(
          { error: "Tracked QR codes need a full http(s) URL" },
          { status: 400 }
        );
      }

      // Keep this legacy endpoint safe. New clients reserve and activate in two
      // explicit requests, but old clients still get a permanently claimed code.
      const reservation = await reserveTrackedQRCode(user.id, { type, content });
      const created = await activateTrackedQRCode(
        reservation.reservationId,
        user.id,
        parsed.data
      );

      return NextResponse.json(created);
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
