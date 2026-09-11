import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Globe, Smartphone, Monitor, Clock, Zap, BarChart3 } from "lucide-react";
import { buildQRData, parseStyle } from "@/lib/qr";
import { SITE_URL } from "@/lib/constants";
import { QRCodeActions } from "./qr-code-actions";

const RECENT_LIMIT = 50;

export default async function QRCodeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true },
  });
  if (!user) notFound();

  const qrCode = await prisma.qRCode.findUnique({
    where: { id, userId: user.id },
    include: {
      scans: {
        orderBy: { scannedAt: "desc" },
        take: RECENT_LIMIT,
      },
      _count: { select: { scans: true } },
    },
  });

  if (!qrCode) notFound();

  const [countries, devices, browsers] = await Promise.all([
    prisma.scan.groupBy({
      by: ["country"],
      where: { qrCodeId: qrCode.id },
      _count: { _all: true },
      orderBy: { _count: { country: "desc" } },
      take: 5,
    }),
    prisma.scan.groupBy({
      by: ["device"],
      where: { qrCodeId: qrCode.id },
      _count: { _all: true },
      orderBy: { _count: { device: "desc" } },
    }),
    prisma.scan.groupBy({
      by: ["browser"],
      where: { qrCodeId: qrCode.id },
      _count: { _all: true },
      orderBy: { _count: { browser: "desc" } },
      take: 5,
    }),
  ]);

  const totalScans = qrCode._count.scans;
  const style = parseStyle(qrCode.style);
  const qrData = qrCode.isDirect
    ? buildQRData(qrCode.type, qrCode.content)
    : `${SITE_URL}/r/${qrCode.shortCode}`;
  const errorCorrection = (["L", "M", "Q", "H"] as const).includes(
    qrCode.errorCorrection as "L" | "M" | "Q" | "H"
  )
    ? (qrCode.errorCorrection as "L" | "M" | "Q" | "H")
    : "M";

  return (
    <div>
      <Link
        href="/dashboard/qr-codes"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to QR Codes
      </Link>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="truncate font-heading text-2xl font-bold text-gray-900 dark:text-white">
            {qrCode.name || `${qrCode.type} QR Code`}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {qrCode.isDirect ? "Direct" : "Tracked"} &middot; {qrCode.type} &middot; Created{" "}
            {qrCode.createdAt.toLocaleDateString("en-US")}
            {qrCode.shortCode && (
              <>
                {" "}&middot; Redirect: <code className="text-primary">{`${SITE_URL}/r/${qrCode.shortCode}`}</code>
              </>
            )}
          </p>
        </div>
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary dark:bg-primary/10">
          {qrCode.isDirect ? <Zap className="h-8 w-8" /> : <BarChart3 className="h-8 w-8" />}
        </div>
      </div>

      <QRCodeActions
        id={qrCode.id}
        type={qrCode.type}
        qrData={qrData}
        isDirect={qrCode.isDirect}
        name={qrCode.name}
        destinationUrl={qrCode.destinationUrl}
        fgColor={qrCode.foregroundColor}
        bgColor={qrCode.backgroundColor}
        errorCorrection={errorCorrection}
        style={style}
        logoImage={qrCode.logoUrl}
      />

      {qrCode.isDirect ? (
        <p className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
          Direct QR codes encode the content itself, so scans do not pass through
          our server and cannot be counted. Create a Tracked QR code to get
          analytics.
        </p>
      ) : (
        <>
          {/* Total scans */}
          <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Scans</p>
            <p className="mt-1 text-4xl font-bold text-gray-900 dark:text-white">
              {totalScans}
            </p>
          </div>

          {totalScans === 0 ? (
            <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
              No scans yet. Share your QR code to start collecting analytics.
            </p>
          ) : (
            <>
              <div className="mt-8 grid gap-6 md:grid-cols-3">
                {/* Countries */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                      Top Countries
                    </h3>
                  </div>
                  <div className="mt-4 space-y-3">
                    {countries.map((row) => (
                      <div key={row.country ?? "unknown"} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {row.country ?? "Unknown"}
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {row._count._all}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Devices */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                      Devices
                    </h3>
                  </div>
                  <div className="mt-4 space-y-3">
                    {devices.map((row) => {
                      const device = row.device ?? "Unknown";
                      const pct = Math.round((row._count._all / totalScans) * 100);
                      return (
                        <div key={device}>
                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                              {device === "Mobile" ? (
                                <Smartphone className="h-3 w-3" />
                              ) : (
                                <Monitor className="h-3 w-3" />
                              )}
                              {device}
                            </span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {pct}%
                            </span>
                          </div>
                          <div className="mt-1 h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800">
                            <div
                              className="h-2 rounded-full bg-primary"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Browsers */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                      Browsers
                    </h3>
                  </div>
                  <div className="mt-4 space-y-3">
                    {browsers.map((row) => (
                      <div key={row.browser ?? "unknown"} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {row.browser ?? "Unknown"}
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {row._count._all}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent scans table */}
              <div className="mt-8">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                  <Clock className="h-4 w-4 text-primary" />
                  Recent Scans
                  {totalScans > RECENT_LIMIT && (
                    <span className="font-normal text-gray-500 dark:text-gray-400">
                      (last {RECENT_LIMIT})
                    </span>
                  )}
                </h3>
                <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                      <tr>
                        <th className="px-4 py-3">Location</th>
                        <th className="px-4 py-3">Device</th>
                        <th className="px-4 py-3">Browser</th>
                        <th className="px-4 py-3">Time (UTC)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                      {qrCode.scans.map((scan) => (
                        <tr key={scan.id} className="bg-white dark:bg-gray-900">
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                            {[scan.city, scan.country].filter(Boolean).join(", ") || "—"}
                          </td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                            {scan.device || "—"} / {scan.os || "—"}
                          </td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                            {scan.browser || "—"}
                          </td>
                          <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                            {scan.scannedAt.toISOString().replace("T", " ").slice(0, 16)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
