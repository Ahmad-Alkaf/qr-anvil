import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { ensureUser } from "@/lib/auth";
import { QR_TYPES } from "@/lib/qr";
import { checkReservationCreationRateLimit } from "@/lib/rate-limit";
import {
  ReservationError,
  reserveTrackedQRCode,
} from "@/lib/tracked-reservation";

const reservationSchema = z.object({
  type: z.enum(QR_TYPES),
  content: z.string().min(1, "Content is required").max(4000),
});

export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { success } = await checkReservationCreationRateLimit(clerkId);
    if (!success) {
      return NextResponse.json(
        { error: "Too many tracked QR reservations. Please try again later." },
        { status: 429 }
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = reservationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: z.treeifyError(parsed.error) },
        { status: 400 }
      );
    }

    const user = await ensureUser(clerkId);
    if (!user) {
      return NextResponse.json(
        { error: "No email found for your account" },
        { status: 400 }
      );
    }

    const reservation = await reserveTrackedQRCode(user.id, parsed.data);
    return NextResponse.json(reservation, { status: 201 });
  } catch (error) {
    if (error instanceof ReservationError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.code === "INVALID_DESTINATION" ? 400 : 503 }
      );
    }
    console.error("Tracked QR reservation error:", error);
    return NextResponse.json(
      { error: "Failed to reserve tracked QR code" },
      { status: 500 }
    );
  }
}
