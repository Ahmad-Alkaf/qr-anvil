import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { parseStyle, qrPatchSchema, serializeStyle } from "@/lib/qr";

async function loadOwnedQRCode(id: string) {
  const { userId } = await auth();
  if (!userId) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true },
  });
  if (!user) {
    return { error: NextResponse.json({ error: "User not found" }, { status: 404 }) };
  }

  const qrCode = await prisma.qRCode.findUnique({ where: { id } });
  if (!qrCode || qrCode.userId !== user.id) {
    return { error: NextResponse.json({ error: "Not found" }, { status: 404 }) };
  }

  return { qrCode };
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const result = await loadOwnedQRCode(id);
  if ("error" in result) return result.error;

  await prisma.qRCode.delete({ where: { id } });

  return NextResponse.json({ success: true });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const result = await loadOwnedQRCode(id);
  if ("error" in result) return result.error;
  const { qrCode } = result;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = qrPatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: z.treeifyError(parsed.error) },
      { status: 400 }
    );
  }

  if (parsed.data.destinationUrl !== undefined && qrCode.isDirect) {
    return NextResponse.json(
      { error: "Cannot set destination URL on a Direct QR code" },
      { status: 400 }
    );
  }

  const currentStyle = parseStyle(qrCode.style);
  const style = serializeStyle({
    dotType: parsed.data.dotType ?? currentStyle.dotType,
    cornerSquareType:
      parsed.data.cornerSquareType ?? currentStyle.cornerSquareType,
    cornerDotType: parsed.data.cornerDotType ?? currentStyle.cornerDotType,
    logoSize: parsed.data.logoSize ?? currentStyle.logoSize,
    logoMargin: parsed.data.logoMargin ?? currentStyle.logoMargin,
    logoOverscan: parsed.data.logoOverscan ?? currentStyle.logoOverscan,
  });

  const updated = await prisma.qRCode.update({
    where: { id },
    data: {
      name:
        parsed.data.name === undefined
          ? qrCode.name
          : parsed.data.name || null,
      destinationUrl: parsed.data.destinationUrl ?? qrCode.destinationUrl,
      foregroundColor:
        parsed.data.foregroundColor ?? qrCode.foregroundColor,
      backgroundColor:
        parsed.data.backgroundColor ?? qrCode.backgroundColor,
      size: parsed.data.size ?? qrCode.size,
      errorCorrection:
        parsed.data.errorCorrection ?? qrCode.errorCorrection,
      style,
      logoUrl:
        parsed.data.logoUrl === undefined ? qrCode.logoUrl : parsed.data.logoUrl,
    },
    select: {
      id: true,
      name: true,
      destinationUrl: true,
      foregroundColor: true,
      backgroundColor: true,
      size: true,
      errorCorrection: true,
      style: true,
      logoUrl: true,
      updatedAt: true,
    },
  });

  return NextResponse.json(updated);
}
