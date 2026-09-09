import { MARK_PATH, MARK_VIEWBOX, BRAND_TAGLINE } from "@/lib/brand";
import { cn } from "@/lib/utils";

/** The QR Anvil mark. Inherits `currentColor`, so set a text colour on it. */
export function Mark({ className }: { className?: string }) {
  return (
    <svg
      viewBox={MARK_VIEWBOX}
      fill="currentColor"
      fillRule="evenodd"
      aria-hidden="true"
      className={cn("size-8 shrink-0", className)}
    >
      <path d={MARK_PATH} />
    </svg>
  );
}

/**
 * Mark plus wordmark, with an optional tagline line under the name,
 * in the same lockup structure as the SetupForge header.
 */
export function Logo({
  size = "md",
  tagline = false,
  className,
}: {
  size?: "sm" | "md" | "lg";
  tagline?: boolean;
  className?: string;
}) {
  const mark = size === "lg" ? "size-12" : size === "sm" ? "size-7" : tagline ? "size-10" : "size-8";
  const text = size === "lg" ? "text-3xl" : size === "sm" ? "text-base" : tagline ? "text-2xl" : "text-xl";
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <Mark className={cn(mark, "text-primary")} />
      <span className="flex flex-col leading-none">
        <span className={cn("font-heading font-bold tracking-tight", text)}>
          <span className="text-primary">QR</span>
          <span className="text-gray-900 dark:text-white"> Anvil</span>
        </span>
        {tagline && (
          <span className="mt-1 font-heading text-xs font-normal italic tracking-normal text-gray-500 dark:text-gray-400">
            {BRAND_TAGLINE}
          </span>
        )}
      </span>
    </span>
  );
}
