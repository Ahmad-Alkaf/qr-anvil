import type {Metadata} from 'next';
import Link from 'next/link';
import {Camera, ImageUp, LockKeyhole, ScanLine} from 'lucide-react';
import {QRScanner} from '@/components/qr/qr-scanner';
import {JsonLd} from '@/components/seo/json-ld';
import {SITE_NAME, SITE_URL} from '@/lib/constants';
import {faqJsonLd, howToJsonLd, jsonLdGraph, webPageJsonLd} from '@/lib/seo';

const title = 'QR Code Scanner - Scan QR Codes Online Free';
const description =
	'Scan a QR code online with your camera or upload an image. This free QR scanner works in your browser and does not upload your scan.';

export const metadata: Metadata = {
	title,
	description,
	alternates: {canonical: '/qr-code-scanner'},
	openGraph: {
		type: 'website',
		url: `${SITE_URL}/qr-code-scanner`,
		title: `${title} | ${SITE_NAME}`,
		description
	},
	twitter: {
		card: 'summary_large_image',
		title: `${title} | ${SITE_NAME}`,
		description
	}
};

const steps = [
	{
		icon: Camera,
		title: 'Choose a scan method',
		text: 'Use your camera for a printed code, or upload a clear image or screenshot.'
	},
	{
		icon: ScanLine,
		title: 'Show the full QR code',
		text: 'Keep the code flat, well lit, and fully inside the camera frame or image.'
	},
	{
		icon: LockKeyhole,
		title: 'Check the result',
		text: 'Read the decoded content before you copy it or choose to open a web link.'
	}
];

const faqs = [
	{
		q: 'Can I scan a QR code without an app?',
		a: 'Yes. Open this page in a modern browser, select Use camera, and allow camera access. You can also upload an image or screenshot that contains a QR code.'
	},
	{
		q: 'Does QR Anvil upload my camera view or image?',
		a: 'No. The QR code is read in your browser. QR Anvil does not send your camera view, uploaded image, or decoded content to its server.'
	},
	{
		q: 'Why can the scanner not read my QR code?',
		a: 'Use bright, even light and keep the full QR code visible. Clean the camera lens, avoid glare, and move the camera slowly until the code is sharp. For an image, use the original file instead of a small or blurred copy.'
	},
	{
		q: 'Is it safe to open a link from a QR code?',
		a: 'A QR code can contain an unsafe link. Check the displayed address before you open it. QR Anvil never opens a scanned link without your action.'
	}
];

export default function QRCodeScannerPage() {
	const jsonLd = jsonLdGraph(
		webPageJsonLd({
			path: '/qr-code-scanner',
			name: `${SITE_NAME} QR Code Scanner`,
			description
		}),
		{
			'@type': 'WebApplication',
			name: `${SITE_NAME} QR Code Scanner`,
			url: `${SITE_URL}/qr-code-scanner`,
			description,
			applicationCategory: 'UtilityApplication',
			operatingSystem: 'Any',
			browserRequirements: 'Requires JavaScript and a modern web browser.',
			isAccessibleForFree: true,
			inLanguage: 'en'
		},
		howToJsonLd(
			'How to scan a QR code online',
			steps.map(step => `${step.title}. ${step.text}`),
			'Scan a QR code with a camera or an image in your web browser.'
		),
		faqJsonLd(faqs)
	);

	return (
		<>
			<JsonLd data={jsonLd} />
			<section
				aria-labelledby="scanner-heading"
				className="relative overflow-hidden border-b border-gray-800 bg-gray-950">
				<div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(196,91,40,0.16),transparent_40%)]" />
				<div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:px-8 lg:py-24">
					<div className="max-w-xl">
						<h1
							id="scanner-heading"
							className="font-heading text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
							QR Code Scanner
						</h1>
						<p className="mt-6 text-lg leading-8 text-gray-300">
							Scan a QR code online with your camera, or read one from an image. The result stays on your device until you choose what to do with it.
						</p>
						<div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-sm text-gray-400">
							<span className="inline-flex items-center gap-2">
								<LockKeyhole className="h-4 w-4 text-emerald-400" aria-hidden="true" />
								Private browser scan
							</span>
							<span className="inline-flex items-center gap-2">
								<ImageUp className="h-4 w-4 text-primary-light" aria-hidden="true" />
								Camera or image
							</span>
						</div>
					</div>
					<QRScanner />
				</div>
			</section>

			<section aria-labelledby="how-to-scan" className="py-16 sm:py-20">
				<div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
					<h2 id="how-to-scan" className="font-heading text-3xl font-bold text-white">
						How to scan a QR code online
					</h2>
					<ol className="mt-9 grid gap-8 border-t border-gray-800 pt-8 md:grid-cols-3">
						{steps.map((step, index) => (
							<li key={step.title} className="flex gap-4 md:block">
								<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary-light">
									<step.icon className="h-5 w-5" aria-hidden="true" />
								</div>
								<div className="md:mt-5">
									<h3 className="font-semibold text-white">
										{index + 1}. {step.title}
									</h3>
									<p className="mt-2 text-sm leading-6 text-gray-400">{step.text}</p>
								</div>
							</li>
						))}
					</ol>
				</div>
			</section>

			<section aria-labelledby="device-help" className="bg-gray-900/50 py-16 sm:py-20">
				<div className="mx-auto grid max-w-5xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.72fr_1.28fr] lg:px-8">
					<div>
						<h2 id="device-help" className="font-heading text-3xl font-bold text-white">
							Scan on your device
						</h2>
						<p className="mt-4 leading-7 text-gray-400">
							Use a current browser. Camera scanning needs a secure HTTPS connection and browser permission.
						</p>
					</div>
					<div className="divide-y divide-gray-800 border-y border-gray-800">
						<article className="py-6">
							<h3 className="font-semibold text-white">Android phone or tablet</h3>
							<p className="mt-2 text-sm leading-6 text-gray-400">
								Open this page in Chrome. Select Use camera, allow access, and point the rear camera at the code. To scan a screenshot, select Upload image.
							</p>
						</article>
						<article className="py-6">
							<h3 className="font-semibold text-white">iPhone or iPad</h3>
							<p className="mt-2 text-sm leading-6 text-gray-400">
								Open this page in Safari. Select Use camera and allow access. If the code is in Photos, select Upload image and choose the picture.
							</p>
						</article>
						<article className="py-6">
							<h3 className="font-semibold text-white">Windows, Mac, or Chromebook</h3>
							<p className="mt-2 text-sm leading-6 text-gray-400">
								Open this page in Chrome, Edge, or Safari. Allow camera access and hold the code in front of the webcam, or upload a saved image.
							</p>
						</article>
					</div>
				</div>
			</section>

			<section aria-labelledby="scan-safety" className="py-16 sm:py-20">
				<div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
					<h2 id="scan-safety" className="font-heading text-3xl font-bold text-white">
						Camera permission and scan safety
					</h2>
					<div className="mt-6 space-y-5 text-base leading-7 text-gray-400">
						<p>
							Your browser controls camera permission. QR Anvil starts the camera only after you select Use camera. Stop it at any time with the Stop camera button or by leaving the page.
						</p>
						<p>
							A QR code can contain text, contact data, or a link. Read the result before you use it. The scanner shows web links as an optional button and never opens them automatically.
						</p>
						<p>
							Need to make a code instead? Use the free{' '}
							<Link href="/#generator" className="font-medium text-primary-light underline decoration-primary/40 underline-offset-4 hover:text-white">
								QR code generator
							</Link>.
						</p>
					</div>
				</div>
			</section>

			<section aria-labelledby="scanner-faq" className="bg-gray-900/50 py-16 sm:py-20">
				<div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
					<h2 id="scanner-faq" className="font-heading text-3xl font-bold text-white">
						QR scanner questions
					</h2>
					<div className="mt-8 divide-y divide-gray-800 border-y border-gray-800">
						{faqs.map(faq => (
							<details key={faq.q} className="group py-5">
								<summary className="cursor-pointer list-none pr-8 font-semibold text-white marker:hidden">
									{faq.q}
								</summary>
								<p className="mt-3 leading-7 text-gray-400">{faq.a}</p>
							</details>
						))}
					</div>
				</div>
			</section>
		</>
	);
}
