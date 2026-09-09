import Link from "next/link";
import { Logo } from "@/components/brand/mark";
import { SITE_NAME, KAFLABS_URL, KAFLABS_PRIVACY_URL, KAFLABS_TERMS_URL, SUPPORT_EMAIL } from "@/lib/constants";

const footerLinks = {
  "QR Code Types": [
    { href: "/qr-types", label: "All QR code types" },
    { href: "/qr-types/url", label: "URL QR Code" },
    { href: "/qr-types/wifi", label: "Wi-Fi QR Code" },
    { href: "/qr-types/vcard", label: "vCard QR Code" },
    { href: "/qr-types/email", label: "Email QR Code" },
    { href: "/qr-types/sms", label: "SMS QR Code" },
    { href: "/qr-types/whatsapp", label: "WhatsApp QR Code" },
    { href: "/qr-types/pdf", label: "PDF QR Code" },
    { href: "/qr-types/plain-text", label: "Plain Text QR Code" },
  ],
  Guides: [
    { href: "/guides", label: "All guides" },
    { href: "/qr-code-scanner", label: "QR code scanner" },
    { href: "/guides/how-to-create-a-qr-code", label: "Create a QR code" },
    { href: "/guides/how-to-scan-a-qr-code", label: "Scan a QR code" },
    {
      href: "/guides/connect-to-wifi-with-qr-code-windows",
      label: "Windows Wi-Fi QR code",
    },
    {
      href: "/guides/direct-vs-tracked-qr-codes",
      label: "Direct vs Tracked",
    },
  ],
  Company: [
    { href: "/about", label: "About" },
    { href: "/support", label: "Support Me" },
  ],
};

const legalLinks = [
  { href: KAFLABS_PRIVACY_URL, label: "Privacy Policy" },
  { href: KAFLABS_TERMS_URL, label: "Terms of Service" },
];

const linkClass =
  "text-sm text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" aria-label={`${SITE_NAME} home`} className="inline-flex">
              <Logo size="sm" />
            </Link>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Make useful QR codes for links, Wi-Fi, contacts, messages, and more.
            </p>
            <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
              A{" "}
              <a
                href={KAFLABS_URL}
                target="_blank"
                rel="noopener"
                className="underline decoration-gray-400/40 underline-offset-2 transition-colors hover:text-gray-900 dark:hover:text-white"
              >
                KafLabs
              </a>{" "}
              product
            </p>
          </div>

          {/* Internal links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                {category}
              </h3>
              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className={linkClass}>
                      {link.label}
                    </Link>
                  </li>
                ))}
                {category === "Company" && (
                  <li>
                    <a href={`mailto:${SUPPORT_EMAIL}`} className={linkClass}>
                      Email support
                    </a>
                  </li>
                )}
              </ul>
            </div>
          ))}

          {/* Legal (shared KafLabs pages) */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Legal
            </h3>
            <ul className="mt-4 space-y-3">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener"
                    className={linkClass}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-200 pt-8 dark:border-gray-800">
          <p className="text-center text-sm text-gray-400 dark:text-gray-500">
            &copy; {new Date().getFullYear()}{" "}
            <a
              href={KAFLABS_URL}
              target="_blank"
              rel="noopener"
              className="transition-colors hover:text-gray-900 dark:hover:text-white"
            >
              KafLabs
            </a>
            . All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
