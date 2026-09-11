import {
	Link as LinkIcon,
	Wifi,
	Contact,
	Mail,
	MessageSquare,
	MessageCircle,
	FileText,
	Type,
	Zap,
	ImagePlus,
	BarChart3,
	Shield,
	ArrowRight,
	ChevronDown
} from 'lucide-react';
import Link from 'next/link';
import {QRGenerator} from '@/components/qr/qr-generator';
import {JsonLd} from '@/components/seo/json-ld';
import {SiteStatsStrip} from '@/components/stats/site-stats-strip';
import {SITE_DESCRIPTION, SITE_NAME} from '@/lib/constants';
import {getSiteStats} from '@/lib/stats';
import {
	faqJsonLd,
	howToJsonLd,
	jsonLdGraph,
	webApplicationJsonLd,
	webPageJsonLd
} from '@/lib/seo';

const qrTypes = [
	{
		icon: LinkIcon,
		label: 'URL',
		slug: 'url',
		description: 'Link to any website'
	},
	{
		icon: Wifi,
		label: 'Wi-Fi',
		slug: 'wifi',
		description: 'Share network access'
	},
	{
		icon: Contact,
		label: 'vCard',
		slug: 'vcard',
		description: 'Digital business card'
	},
	{
		icon: Mail,
		label: 'Email',
		slug: 'email',
		description: 'Open a ready-to-send email'
	},
	{
		icon: MessageSquare,
		label: 'SMS',
		slug: 'sms',
		description: 'Send text messages'
	},
	{
		icon: MessageCircle,
		label: 'WhatsApp',
		slug: 'whatsapp',
		description: 'Open a WhatsApp chat'
	},
	{
		icon: FileText,
		label: 'PDF',
		slug: 'pdf',
		description: 'Link to documents'
	},
	{
		icon: Type,
		label: 'Plain Text',
		slug: 'plain-text',
		description: 'Show a note or message'
	}
];

const features = [
	{
		icon: Zap,
		title: 'Ready in Seconds',
		description:
			'Add your information and get a QR code that is ready to download and share.'
	},
	{
		icon: ImagePlus,
		title: 'Put Your Logo at the Center',
		description:
			'Add a logo or brand image. QR Anvil protects the pattern around it and prepares it for reliable scans.'
	},
	{
		icon: BarChart3,
		title: 'See What Gets Scanned',
		description:
			'Use a Tracked QR code to see scan totals, places, devices, and times.'
	},
	{
		icon: Shield,
		title: 'Your Data Stays Private',
		description:
			'Direct QR codes are made on your device. We do not save their information unless you sign in.'
	}
];

const howItWorks = [
	{
		step: '1',
		title: 'Choose What to Share',
		description:
			'Select what kind of QR code you need: URL, Wi-Fi, vCard, Email, SMS, WhatsApp, PDF, or Plain Text.'
	},
	{
		step: '2',
		title: 'Choose How It Works',
		description:
			'Choose the colors, pattern, and center logo. Use Direct for a simple code, or Tracked to count scans and change the link later.'
	},
	{
		step: '3',
		title: 'Download & Share',
		description:
			'Download a PNG, SVG, or PDF. Add it to a sign, menu, card, package, or screen.'
	}
];

const comparison = [
	{
		feature: 'What happens after a scan',
		direct: 'Opens the saved information',
		tracked: 'Opens your link and counts the scan'
	},
	{
		feature: 'Best for',
		direct: 'Simple sharing and offline use',
		tracked: 'Campaigns, menus, and printed links'
	},
	{
		feature: 'Scan analytics',
		direct: 'No',
		tracked: 'Country, city, device, browser, and time'
	},
	{
		feature: 'Edit destination after printing',
		direct: 'No',
		tracked: 'Yes, any time'
	},
	{
		feature: 'Works offline when scanned',
		direct: 'Yes, for Wi-Fi, vCard, and text',
		tracked: 'Needs internet'
	},
	{
		feature: 'Account required',
		direct: 'No for URL, yes for other types',
		tracked: 'Yes, free'
	}
];

const faqs = [
	{
		q: 'What is the difference between Direct and Tracked QR codes?',
		a: 'Direct QR codes store your content in the image itself, so scanning opens it instantly with no redirect. Tracked QR codes store a short QR Anvil redirect link. The redirect lets QR Anvil count scans, record location, device, and time, and lets you change the destination URL after the code is printed.'
	},
	{
		q: `Is ${SITE_NAME} really free?`,
		a: `Yes. ${SITE_NAME} is free to use with no watermark. URL QR codes and PNG downloads work without an account. A free account unlocks all 8 QR types, SVG and PDF downloads, Tracked mode, and the analytics dashboard.`
	},
	{
		q: 'Can I add my logo to a QR code?',
		a: 'Yes. Upload a PNG, JPG, or WebP image and QR Anvil puts it in the center. It resizes the image, clears the pattern behind it, and uses Maximum scan recovery. Always test the downloaded code before you print it.'
	},
	{
		q: 'What QR code types are supported?',
		a: `${SITE_NAME} supports 8 types: URL, Wi-Fi, vCard (contact), Email, SMS, WhatsApp, PDF, and Plain Text. URL is available without an account. Sign in to use the other types.`
	},
	{
		q: 'Can I edit a QR code after printing it?',
		a: 'Yes, if you create a Tracked QR code. You can change the destination URL at any time from the dashboard, and the printed code keeps working.'
	},
	{
		q: 'How do scan analytics work?',
		a: 'When someone scans a Tracked QR code, the phone opens a short QR Anvil link that redirects to your destination. QR Anvil records the scan with country, city, device type, operating system, browser, and timestamp, and shows the results in your dashboard. Direct QR codes do not have analytics because they do not redirect.'
	},
	{
		q: 'Which download formats are available?',
		a: 'PNG, SVG, and PDF. PNG is available to everyone. SVG and PDF require a free account. All three files are generated in your browser.'
	},
	{
		q: 'What does Scan Reliability do?',
		a: 'This setting helps a QR code work when part of it is damaged, dirty, or covered. A higher setting adds more protection, but it also makes the pattern more detailed. Use Recommended for most QR codes. Use Maximum for small prints or if you put a logo on the code.'
	},
	{
		q: `Does ${SITE_NAME} add a watermark or expire QR codes?`,
		a: `No. ${SITE_NAME} never adds a watermark. Direct QR codes never expire because the content is inside the image. Tracked QR codes keep working as long as they exist in your dashboard.`
	}
];

// Refresh the prerendered page periodically so the stats do not stay
// frozen at build time.
export const revalidate = 1800;

export default async function HomePage() {
	const stats = await getSiteStats();

	const jsonLd = jsonLdGraph(
		webPageJsonLd({
			path: '/',
			name: `${SITE_NAME}: Free QR Code Generator`,
			description: SITE_DESCRIPTION
		}),
		webApplicationJsonLd(),
		howToJsonLd(
			`How to create a QR code with ${SITE_NAME}`,
			howItWorks.map(step => `${step.title}. ${step.description}`),
			'Create a free custom QR code in three steps.'
		),
		faqJsonLd(faqs)
	);

	return (
		<>
			<JsonLd data={jsonLd} />

			{/* Hero Section */}
			<section
				aria-labelledby="hero-heading"
				className="relative overflow-hidden bg-linear-to-br from-primary-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
				<div className="relative mx-auto max-w-7xl px-4 pb-16 pt-20 sm:px-6 sm:pb-24 sm:pt-28 lg:px-8">
					<div className="text-center">
						<div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-50 px-4 py-1.5 text-sm font-medium text-primary dark:border-primary/30 dark:bg-primary/10">
							<Zap className="h-3.5 w-3.5" />
							Free to Use — No Credit Card Needed
						</div>
						<h1
							id="hero-heading"
							className="font-heading text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl dark:text-white">
							Free QR Code Generator
							<br />
							<span className="text-primary">
								Custom and Ready in Seconds
							</span>
						</h1>
						<p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
							Create a custom QR code for a link, Wi-Fi password,
							contact card, message, or PDF. Choose a style,
							add your logo, download it, and share it. Use a
							Tracked code to count scans and update the link later.
						</p>
					</div>

					{/* Inline QR Generator */}
					<div className="mx-auto mt-12 max-w-3xl rounded-2xl border border-gray-200 bg-white p-6 shadow-xl sm:p-8 dark:border-gray-800 dark:bg-gray-900">
						<QRGenerator />
					</div>
				</div>
			</section>

			{/* Stats (hidden when the database is unavailable) */}
			{stats && (
				<SiteStatsStrip
					userCount={stats.userCount}
					qrCount={stats.qrCount}
					scanCount={stats.scanCount}
				/>
			)}

			{/* What is QR Anvil (entity definition for search and AI answers) */}
			<section
				aria-labelledby="what-is-heading"
				className="py-16">
				<div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
					<h2
						id="what-is-heading"
						className="font-heading text-3xl font-bold text-gray-900 dark:text-white">
						What is {SITE_NAME}?
					</h2>
					<p className="mt-4 text-lg leading-relaxed text-gray-600 dark:text-gray-400">
						{SITE_NAME} helps you turn links, Wi-Fi access, contact
						details, messages, PDFs, and text into QR codes. Choose
						your colors, add a logo, download a PNG, SVG, or PDF,
						and share it anywhere. Tracked codes can count scans and let you
						change a link after you print the code. There is no
						watermark, expiry, or credit card requirement.
					</p>
				</div>
			</section>

			{/* QR Types Grid */}
			<section
				aria-labelledby="types-heading"
				className="pb-20">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="text-center">
						<h2
							id="types-heading"
							className="font-heading text-3xl font-bold text-gray-900 dark:text-white">
							A QR Code for Every Task
						</h2>
						<p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
							Help people open, join, save, read, or reply with one scan.
						</p>
					</div>
					<div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-4">
						{qrTypes.map(qr => (
							<Link
								key={qr.slug}
								href={`/qr-types/${qr.slug}`}
								className="group flex flex-col items-center rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900 dark:hover:border-primary/30">
								<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary transition-colors group-hover:bg-primary group-hover:text-white dark:bg-primary/10">
									<qr.icon className="h-6 w-6" />
								</div>
								<h3 className="mt-3 text-sm font-semibold text-gray-900 dark:text-white">
									{qr.label} QR Code
								</h3>
								<p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
									{qr.description}
								</p>
							</Link>
						))}
					</div>
					<div className="mt-8 text-center">
						<Link
							href="/qr-types"
							className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
							Compare all QR code types
							<ArrowRight className="h-4 w-4" />
						</Link>
					</div>
				</div>
			</section>

			{/* How It Works */}
			<section
				aria-labelledby="how-heading"
				className="bg-gray-50 py-20 dark:bg-gray-900/50">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="text-center">
						<h2
							id="how-heading"
							className="font-heading text-3xl font-bold text-gray-900 dark:text-white">
							How to Create a QR Code
						</h2>
						<p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
							Three simple steps to create your QR code
						</p>
					</div>
					<ol className="mt-12 grid gap-8 md:grid-cols-3">
						{howItWorks.map(item => (
							<li
								key={item.step}
								className="relative rounded-2xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900">
								<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-white">
									{item.step}
								</div>
								<h3 className="mt-4 font-heading text-lg font-semibold text-gray-900 dark:text-white">
									{item.title}
								</h3>
								<p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
									{item.description}
								</p>
							</li>
						))}
					</ol>
				</div>
			</section>

			{/* Features */}
			<section
				aria-labelledby="features-heading"
				className="py-20">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="text-center">
						<h2
							id="features-heading"
							className="font-heading text-3xl font-bold text-gray-900 dark:text-white">
							Everything You Need
						</h2>
						<p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
							Powerful features to create, customize, and track
							your QR codes
						</p>
					</div>
					<div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
						{features.map(feature => (
							<div
								key={feature.title}
								className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
								<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary dark:bg-primary/10">
									<feature.icon className="h-5 w-5" />
								</div>
								<h3 className="mt-4 font-heading text-lg font-semibold text-gray-900 dark:text-white">
									{feature.title}
								</h3>
								<p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
									{feature.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Direct vs Tracked comparison */}
			<section
				aria-labelledby="compare-heading"
				className="bg-gray-50 py-20 dark:bg-gray-900/50">
				<div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
					<div className="text-center">
						<h2
							id="compare-heading"
							className="font-heading text-3xl font-bold text-gray-900 dark:text-white">
							Direct vs Tracked QR Codes
						</h2>
						<p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
							Direct is a static QR code. Tracked is a dynamic QR
							code. Pick the one that fits your use.
						</p>
					</div>
					<div className="mt-12 overflow-x-auto rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
						<table className="w-full text-left text-sm">
							<thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500 dark:bg-gray-800/60 dark:text-gray-400">
								<tr>
									<th scope="col" className="px-6 py-3">
										Feature
									</th>
									<th scope="col" className="px-6 py-3">
										Direct
									</th>
									<th scope="col" className="px-6 py-3">
										Tracked
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-200 dark:divide-gray-800">
								{comparison.map(row => (
									<tr key={row.feature}>
										<th
											scope="row"
											className="px-6 py-3 font-medium text-gray-900 dark:text-white">
											{row.feature}
										</th>
										<td className="px-6 py-3 text-gray-600 dark:text-gray-400">
											{row.direct}
										</td>
										<td className="px-6 py-3 text-gray-600 dark:text-gray-400">
											{row.tracked}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</section>

			{/* Support */}
			<section
				id="support"
				aria-labelledby="support-heading"
				className="py-20">
				<div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
					<h2
						id="support-heading"
						className="font-heading text-3xl font-bold text-gray-900 dark:text-white">
						Support {SITE_NAME}
					</h2>
					<p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
						{SITE_NAME} is free to use. If you find it useful,
						consider supporting the project to help keep it running
						and growing.
					</p>
					<Link
						href="/support"
						className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark">
						Support Me
						<ArrowRight className="h-4 w-4" />
					</Link>
				</div>
			</section>

			{/* FAQ */}
			<section
				aria-labelledby="faq-heading"
				className="bg-gray-50 py-20 dark:bg-gray-900/50">
				<div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
					<div className="text-center">
						<h2
							id="faq-heading"
							className="font-heading text-3xl font-bold text-gray-900 dark:text-white">
							Frequently Asked Questions
						</h2>
					</div>
					<div className="mt-12 space-y-4">
						{faqs.map(faq => (
							<details
								key={faq.q}
								className="group rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
								<summary className="flex cursor-pointer items-center justify-between px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white [&::-webkit-details-marker]:hidden">
									<h3 className="text-sm font-semibold">
										{faq.q}
									</h3>
									<ChevronDown className="h-4 w-4 shrink-0 text-gray-400 transition-transform group-open:rotate-180" />
								</summary>
								<div className="px-6 pb-4">
									<p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
										{faq.a}
									</p>
								</div>
							</details>
						))}
					</div>
				</div>
			</section>

			{/* CTA */}
			<section
				aria-labelledby="cta-heading"
				className="py-20">
				<div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
					<h2
						id="cta-heading"
						className="font-heading text-3xl font-bold text-gray-900 sm:text-4xl dark:text-white">
						Ready to Create Your QR Code?
					</h2>
					<p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
						Create a useful QR code now. It is free.
					</p>
					<Link
						href="/#generator"
						className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-semibold text-white shadow-lg transition-all hover:bg-primary-dark hover:shadow-xl">
						Create Your QR Code
						<ArrowRight className="h-5 w-5" />
					</Link>
				</div>
			</section>
		</>
	);
}
