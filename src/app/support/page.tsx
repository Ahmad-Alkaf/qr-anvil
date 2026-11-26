import type { Metadata } from "next";
import Link from "next/link";
import { Heart, ArrowRight } from "lucide-react";
import { SITE_NAME } from "@/lib/constants";
import { pageSocialMetadata } from "@/lib/seo";

const TITLE = `Support ${SITE_NAME}`;
const DESCRIPTION = `${SITE_NAME} is free for everyone. Support the project to help keep it running.`;

export const metadata: Metadata = {
  // Absolute: the root template would add "| QR Anvil" a second time.
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/support" },
  ...pageSocialMetadata({ path: "/support", title: TITLE, description: DESCRIPTION }),
};

export default function SupportPage() {
  return (
    <div className="py-20">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-pink-100 dark:bg-pink-900/30">
          <Heart className="h-8 w-8 text-pink-500" />
        </div>

        <h1 className="mt-6 font-heading text-4xl font-extrabold text-gray-900 dark:text-white">
          Support {SITE_NAME}
        </h1>

        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
          {SITE_NAME} is free to use — no paywalls. If you find it useful, consider
          supporting the project to help cover hosting costs and fund new features.
        </p>

        <div className="mt-10 rounded-2xl border border-gray-200 bg-white p-8 text-left dark:border-gray-800 dark:bg-gray-900">
          <h2 className="font-heading text-xl font-bold text-gray-900 dark:text-white">
            What you get
          </h2>
          <ul className="mt-4 space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <li>URL QR codes without an account</li>
            <li>All 8 QR types with a free account</li>
            <li>PNG downloads (SVG and PDF with sign-in)</li>
            <li>Full color customization</li>
            <li>Tracked QR codes with scan analytics</li>
          </ul>
        </div>

        <p className="mt-8 text-sm text-gray-500 dark:text-gray-400">
          Sharing {SITE_NAME} with others is the best way to support me!
        </p>

        <Link
          href="/#generator"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark"
        >
          Create a QR Code
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
