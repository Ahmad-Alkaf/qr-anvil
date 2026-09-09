import {SITE_NAME, PRIVACY_EMAIL, KAFLABS_PRIVACY_URL} from '@/lib/constants';
import type {Metadata} from 'next';

export const metadata: Metadata = {
	title: 'Privacy Policy',
	description: `${SITE_NAME} Privacy Policy — learn how we collect, use, and protect your data.`,
	alternates: {canonical: '/privacy'}
};

// Keep this date equal to the day the wording last changed.
const LAST_UPDATED = 'September 7, 2026';

export default function PrivacyPage() {
	return (
		<div className="py-20">
			<div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
				<h1 className="font-heading text-4xl font-extrabold text-gray-900 dark:text-white">
					Privacy Policy
				</h1>
				<p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
					Last updated: {LAST_UPDATED}
				</p>
				<p className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
					{SITE_NAME} is a product of KafLabs. This page is a
					product-specific supplement to the{' '}
					<a
						href={KAFLABS_PRIVACY_URL}
						target="_blank"
						rel="noopener"
						className="text-primary hover:underline">
						KafLabs Privacy Policy
					</a>
					, which applies to all KafLabs products.
				</p>

				<div className="mt-10 space-y-8 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
					<section>
						<h2 className="text-lg font-semibold text-gray-900 dark:text-white">
							1. Information We Collect
						</h2>
						<p className="mt-3">
							We collect the following types of information:
						</p>
						<ul className="mt-2 list-inside list-disc space-y-1">
							<li>
								<strong>Account information:</strong> name,
								email address, and profile image provided
								through our authentication provider (Clerk) when
								you sign in with an email address or a
								third-party account.
							</li>
							<li>
								<strong>QR code data (signed-in users):</strong>{' '}
								the content you encode in your QR codes and the
								customization settings, stored so you can find
								and download them again in your dashboard. QR
								codes made without an account are not stored.
							</li>
							<li>
								<strong>
									Scan analytics (Tracked QR codes only):
								</strong>{' '}
								a truncated IP address, approximate location
								(country and city, when the network provides
								it), device type, operating system, browser,
								referrer, and timestamp of each scan.
							</li>
							<li>
								<strong>Usage counters:</strong> an anonymous
								record of the QR code type each time a code is
								downloaded. It contains no content and no
								account identifier.
							</li>
						</ul>
					</section>

					<section>
						<h2 className="text-lg font-semibold text-gray-900 dark:text-white">
							2. How We Use Your Information
						</h2>
						<ul className="mt-3 list-inside list-disc space-y-1">
							<li>To provide and maintain the Service</li>
							<li>To manage your account</li>
							<li>
								To provide scan analytics for Tracked QR codes
							</li>
							<li>
								To improve the Service and develop new features
							</li>
							<li>
								To prevent abuse and enforce our Terms of
								Service
							</li>
						</ul>
						<p className="mt-3">
							Account emails such as sign-in verification are
							sent by our authentication provider on our behalf.
						</p>
					</section>

					<section>
						<h2 className="text-lg font-semibold text-gray-900 dark:text-white">
							3. Direct vs Tracked QR Codes
						</h2>
						<p className="mt-3">
							<strong>Direct QR codes</strong> encode your content
							directly in the QR image. No data passes through our
							servers when these codes are scanned. We have no
							visibility into Direct QR code usage.
						</p>
						<p className="mt-3">
							<strong>Tracked QR codes</strong> redirect through
							our servers, which allows us to record scan data.
							This data is used solely to provide scan analytics to
							the QR code owner. The IP address is truncated
							before it is stored (the last part of the address is
							removed), so a scan cannot be linked to a single
							device.
						</p>
					</section>

					<section>
						<h2 className="text-lg font-semibold text-gray-900 dark:text-white">
							4. Data Sharing
						</h2>
						<p className="mt-3">
							We do not sell your personal information. We share
							data only with:
						</p>
						<ul className="mt-2 list-inside list-disc space-y-1">
							<li>
								<strong>Service providers:</strong> Clerk
								(authentication), our hosting and database
								providers, and, when enabled, Upstash (request
								rate limiting, which processes a truncated form
								of your IP address)
							</li>
							<li>
								<strong>Legal requirements:</strong> when
								required by law or to protect our rights
							</li>
						</ul>
					</section>

					<section>
						<h2 className="text-lg font-semibold text-gray-900 dark:text-white">
							5. Data Retention
						</h2>
						<p className="mt-3">
							Account data, QR codes, and scan analytics are
							retained for as long as your account exists. When you
							delete your account, your account record, your QR
							codes, and their scan data are deleted. Tracked QR
							codes stop working at that
							point. Anonymous usage counters contain no personal
							data and are kept.
						</p>
					</section>

					<section>
						<h2 className="text-lg font-semibold text-gray-900 dark:text-white">
							6. Security
						</h2>
						<p className="mt-3">
							Data is encrypted in transit (TLS). Authentication
							is handled by Clerk; we never see or store your
							password. However, no method of transmission over the
							Internet is 100% secure.
						</p>
					</section>

					<section>
						<h2 className="text-lg font-semibold text-gray-900 dark:text-white">
							7. Your Rights
						</h2>
						<p className="mt-3">You have the right to:</p>
						<ul className="mt-2 list-inside list-disc space-y-1">
							<li>
								Access, update, or delete your account from the
								dashboard settings page
							</li>
							<li>
								Delete individual QR codes and their scan data
								from your dashboard
							</li>
							<li>Request a copy of the data we hold about you</li>
						</ul>
					</section>

					<section>
						<h2 className="text-lg font-semibold text-gray-900 dark:text-white">
							8. Cookies
						</h2>
						<p className="mt-3">
							We use only essential cookies, set by Clerk, for
							authentication and session management. We do not use
							advertising or third-party analytics cookies. You can
							control cookies through your browser settings.
						</p>
					</section>

					<section>
						<h2 className="text-lg font-semibold text-gray-900 dark:text-white">
							9. Contact
						</h2>
						<p className="mt-3">
							For privacy-related inquiries, contact us at{' '}
							<a
								href={`mailto:${PRIVACY_EMAIL}`}
								className="text-primary hover:underline">
								{PRIVACY_EMAIL}
							</a>
							.
						</p>
					</section>
				</div>
			</div>
		</div>
	);
}
