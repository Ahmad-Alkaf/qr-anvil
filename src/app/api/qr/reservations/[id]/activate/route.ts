import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { ensureUser } from "@/lib/auth";
import { qrGenerateSchema } from "@/lib/qr";
import { checkReservationMutationRateLimit } from "@/lib/rate-limit";
import {
  activateTrackedQRCode,
  ReservationError,
} from "@/lib/tracked-reservation";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { success } = await checkReservationMutationRateLimit(clerkId);
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

    const user = await ensureUser(clerkId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { id } = await params;
    const created = await activateTrackedQRCode(id, user.id, parsed.data);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    if (error instanceof ReservationError) {
      const status =
        error.code === "NOT_FOUND"
          ? 404
          : error.code === "INVALID_DESTINATION"
            ? 400
            : 409;
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status }
      );
    }
    console.error("Tracked QR activation error:", error);
    return NextResponse.json(
      { error: "Failed to create tracked QR code" },
      { status: 500 }
    );
  }
}
