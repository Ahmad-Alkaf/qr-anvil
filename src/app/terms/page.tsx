import {SITE_NAME, LEGAL_EMAIL, KAFLABS_TERMS_URL} from '@/lib/constants';
import {pageSocialMetadata} from '@/lib/seo';
import type {Metadata} from 'next';

const TITLE = 'Terms of Service';
const DESCRIPTION = `${SITE_NAME} Terms of Service — read our terms and conditions for using the QR code generator platform.`;

export const metadata: Metadata = {
	title: TITLE,
	description: DESCRIPTION,
	alternates: {canonical: '/terms'},
	...pageSocialMetadata({path: '/terms', title: TITLE, description: DESCRIPTION})
};

// Keep this date equal to the day the wording last changed.
const LAST_UPDATED = 'September 2, 2026';

export default function TermsPage() {
	return (
		<div className="py-20">
			<div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
				<h1 className="font-heading text-4xl font-extrabold text-gray-900 dark:text-white">
					Terms of Service
				</h1>
				<p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
					Last updated: {LAST_UPDATED}
				</p>
				<p className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
					{SITE_NAME} is a product of KafLabs. These terms are a
					product-specific supplement to the{' '}
					<a
						href={KAFLABS_TERMS_URL}
						target="_blank"
						rel="noopener"
						className="text-primary hover:underline">
						KafLabs Terms of Service
					</a>
					, which apply to all KafLabs products.
				</p>

				<div className="mt-10 space-y-8 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
					<section>
						<h2 className="text-lg font-semibold text-gray-900 dark:text-white">
							1. Acceptance of Terms
						</h2>
						<p className="mt-3">
							By accessing or using {SITE_NAME} (&quot;the
							Service&quot;), you agree to be bound by these Terms
							of Service. If you do not agree to these terms,
							please do not use the Service.
						</p>
					</section>

					<section>
						<h2 className="text-lg font-semibold text-gray-900 dark:text-white">
							2. Description of Service
						</h2>
						<p className="mt-3">
							{SITE_NAME} provides a free QR code generation
							service that allows users to create, customize, and
							track QR codes. QR code images are generated in your
							browser. Some features require a free account.
						</p>
					</section>

					<section>
						<h2 className="text-lg font-semibold text-gray-900 dark:text-white">
							3. User Accounts
						</h2>
						<p className="mt-3">
							Some features require an account. You are
							responsible for maintaining the security of your
							account credentials. You must provide accurate
							information when creating an account.
						</p>
					</section>

					<section>
						<h2 className="text-lg font-semibold text-gray-900 dark:text-white">
							4. Acceptable Use
						</h2>
						<p className="mt-3">You agree not to use the Service to:</p>
						<ul className="mt-2 list-inside list-disc space-y-1">
							<li>
								Generate QR codes that link to malicious,
								illegal, or harmful content
							</li>
							<li>
								Distribute malware, phishing links, or
								fraudulent content
							</li>
							<li>Violate any applicable laws or regulations</li>
							<li>
								Infringe on intellectual property rights of
								others
							</li>
							<li>
								Attempt to circumvent rate limits or access
								controls
							</li>
						</ul>
						<p className="mt-3">
							We may disable Tracked QR codes or accounts that
							violate these rules.
						</p>
					</section>

					<section>
						<h2 className="text-lg font-semibold text-gray-900 dark:text-white">
							5. QR Code Data &amp; Tracked QR Codes
						</h2>
						<p className="mt-3">
							Direct QR codes encode content directly and do not
							pass through our servers. Tracked QR codes redirect
							through our servers to enable scan analytics. We
							record scan data (truncated IP address, approximate
							location, device type, browser, and time) for
							Tracked QR codes as described in our Privacy Policy.
							Tracked QR codes depend on the Service being
							available; if the Service or your account is
							discontinued, Tracked QR codes stop redirecting.
						</p>
					</section>

					<section>
						<h2 className="text-lg font-semibold text-gray-900 dark:text-white">
							6. Limitation of Liability
						</h2>
						<p className="mt-3">
							The Service is provided &quot;as is&quot; without
							warranties of any kind. {SITE_NAME} shall not be
							liable for any indirect, incidental, or
							consequential damages arising from your use of the
							Service, including loss caused by printed QR codes
							that stop working.
						</p>
					</section>

					<section>
						<h2 className="text-lg font-semibold text-gray-900 dark:text-white">
							7. Modifications
						</h2>
						<p className="mt-3">
							We may modify these terms at any time. Changes are
							published on this page with an updated date at the
							top. Continued use after changes constitutes
							acceptance.
						</p>
					</section>

					<section>
						<h2 className="text-lg font-semibold text-gray-900 dark:text-white">
							8. Contact
						</h2>
						<p className="mt-3">
							For questions about these Terms, contact us at{' '}
							<a
								href={`mailto:${LEGAL_EMAIL}`}
								className="text-primary hover:underline">
								{LEGAL_EMAIL}
							</a>
							.
						</p>
					</section>
				</div>
			</div>
		</div>
	);
}
