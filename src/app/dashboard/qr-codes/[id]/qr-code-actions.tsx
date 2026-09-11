"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Loader2, Save, AlertCircle, CheckCircle2 } from "lucide-react";
import { QRPreview } from "@/components/qr/qr-preview";
import type { QRStyle } from "@/lib/qr";
import {
  renderQRBlob,
  downloadBlob,
  type DownloadFormat,
  type ErrorCorrection,
} from "@/lib/qr-export";

interface QRCodeActionsProps {
  id: string;
  type: string;
  qrData: string;
  isDirect: boolean;
  name: string | null;
  destinationUrl: string | null;
  fgColor: string;
  bgColor: string;
  errorCorrection: ErrorCorrection;
  style: QRStyle;
  logoImage: string | null;
}

const FORMATS: { format: DownloadFormat; label: string }[] = [
  { format: "png", label: "PNG" },
  { format: "svg", label: "SVG" },
  { format: "pdf", label: "PDF" },
];

const inputClass =
  "w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white";

export function QRCodeActions(props: QRCodeActionsProps) {
  const router = useRouter();
  const [downloading, setDownloading] = useState<DownloadFormat | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const [name, setName] = useState(props.name ?? "");
  const [destinationUrl, setDestinationUrl] = useState(props.destinationUrl ?? "");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function handleDownload(format: DownloadFormat) {
    if (downloading) return;
    setDownloading(format);
    setDownloadError(null);
    try {
      const blob = await renderQRBlob({
        data: props.qrData,
        format,
        fgColor: props.fgColor,
        bgColor: props.bgColor,
        errorCorrection: props.errorCorrection,
        dotType: props.style.dotType,
        cornerSquareType: props.style.cornerSquareType,
        cornerDotType: props.style.cornerDotType,
        logoImage: props.logoImage,
        logoSize: props.style.logoSize,
        logoMargin: props.style.logoMargin,
        logoOverscan: props.style.logoOverscan,
      });
      downloadBlob(blob, `qr-anvil-${props.type.toLowerCase()}.${format}`);
    } catch {
      setDownloadError("Failed to render the QR code. Please try again.");
    } finally {
      setDownloading(null);
    }
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setSaveMessage(null);
    try {
      const body: Record<string, string> = { name: name.trim() };
      if (!props.isDirect) body.destinationUrl = destinationUrl.trim();

      const res = await fetch(`/api/qr/${props.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const detail =
          data?.details?.properties?.destinationUrl?.errors?.[0] ??
          data?.details?.properties?.name?.errors?.[0];
        setSaveMessage({
          ok: false,
          text: detail || data.error || "Failed to save changes",
        });
        return;
      }
      setSaveMessage({ ok: true, text: "Saved" });
      router.refresh();
    } catch {
      setSaveMessage({ ok: false, text: "Failed to save changes" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[auto_1fr]">
      {/* Preview and download */}
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <QRPreview
          value={props.qrData}
          size={200}
          fgColor={props.fgColor}
          bgColor={props.bgColor}
          level={props.errorCorrection}
          dotType={props.style.dotType}
          cornerSquareType={props.style.cornerSquareType}
          cornerDotType={props.style.cornerDotType}
          logoImage={props.logoImage}
          logoSize={props.style.logoSize}
          logoMargin={props.style.logoMargin}
          logoOverscan={props.style.logoOverscan}
        />
        <div className="flex gap-2">
          {FORMATS.map(({ format, label }) => (
            <button
              key={format}
              type="button"
              onClick={() => handleDownload(format)}
              disabled={!!downloading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:border-primary hover:text-primary disabled:opacity-50 dark:border-gray-700 dark:text-gray-300"
            >
              {downloading === format ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Download className="h-3.5 w-3.5" />
              )}
              {label}
            </button>
          ))}
        </div>
        {downloadError && (
          <p role="alert" className="text-xs text-red-600 dark:text-red-400">
            {downloadError}
          </p>
        )}
      </div>

      {/* Edit form */}
      <form
        onSubmit={handleSave}
        className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"
      >
        <div>
          <label
            htmlFor="qr-name"
            className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Name
          </label>
          <input
            id="qr-name"
            type="text"
            maxLength={255}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={`${props.type} QR Code`}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            A label for your dashboard. It is not encoded in the QR code.
          </p>
        </div>

        {!props.isDirect && (
          <div>
            <label
              htmlFor="qr-destination"
              className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Destination URL
            </label>
            <input
              id="qr-destination"
              type="url"
              required
              maxLength={2048}
              value={destinationUrl}
              onChange={(e) => setDestinationUrl(e.target.value)}
              placeholder="https://example.com"
              className={inputClass}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Change where scans go without reprinting the QR code. The change
              applies to the next scan.
            </p>
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save changes
          </button>
          {saveMessage && (
            <span
              role="status"
              className={`inline-flex items-center gap-1 text-sm ${
                saveMessage.ok
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {saveMessage.ok ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              {saveMessage.text}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
