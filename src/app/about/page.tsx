import type {Metadata} from 'next';
import {QrCode, BarChart3, Users} from 'lucide-react';
import {SITE_NAME} from '@/lib/constants';
import {getSiteStats, formatCount} from '@/lib/stats';

export const metadata: Metadata = {
	title: `About ${SITE_NAME}`,
	description: `${SITE_NAME} is a modern QR code generator built for speed, simplicity, and powerful analytics. Learn about our mission.`,
	alternates: {canonical: '/about'}
};

// Refresh the prerendered page periodically so the stats do not stay
// frozen at build time.
export const revalidate = 1800;

export default async function AboutPage() {
	const siteStats = await getSiteStats();

	const stats = siteStats
		? [
				{icon: QrCode, label: 'QR Codes Created', value: formatCount(siteStats.qrCount)},
				{icon: Users, label: 'Users', value: formatCount(siteStats.userCount)},
				{icon: BarChart3, label: 'Scans Tracked', value: formatCount(siteStats.scanCount)}
			]
		: [];
	return (
		<div className="py-20">
			<div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
				<div className="text-center">
					<h1 className="font-heading text-4xl font-extrabold text-gray-900 dark:text-white">
						About {SITE_NAME}
					</h1>
					<p className="mt-6 text-lg leading-relaxed text-gray-600 dark:text-gray-400">
						{SITE_NAME} &nbsp;was built with a simple mission: make QR
						code creation fast, beautiful, and insightful. Whether
						you need a quick Direct QR code for your restaurant menu
						or a Tracked QR code with full scan analytics for your
						marketing campaign, we&apos;ve got you covered.
					</p>
				</div>

				{stats.length > 0 && (
					<div className="mt-16 grid grid-cols-3 gap-8">
						{stats.map(stat => (
							<div
								key={stat.label}
								className="flex flex-col items-center rounded-2xl border border-gray-200 bg-white p-6 text-center dark:border-gray-800 dark:bg-gray-900">
								<stat.icon className="h-8 w-8 text-primary" />
								<p className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">
									{stat.value}
								</p>
								<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
									{stat.label}
								</p>
							</div>
						))}
					</div>
				)}

				<div className="mt-16 space-y-8 text-gray-600 dark:text-gray-400">
					<div>
						<h2 className="font-heading text-2xl font-bold text-gray-900 dark:text-white">
							Our Approach
						</h2>
						<p className="mt-4 leading-relaxed">
							We believe QR codes should be simple to create but
							powerful when you need them to be. That&apos;s why
							we built two distinct modes:
						</p>
						<ul className="mt-4 list-inside list-disc space-y-2">
							<li>
								<strong>Direct QR codes</strong> — encode your
								content directly into the QR image. No redirect,
								no latency, no server dependency. Perfect for
								Wi-Fi passwords, contact cards, and menus.
							</li>
							<li>
								<strong>Tracked QR codes</strong> — route
								through our redirect server to capture scan
								analytics (location, device, time) and allow you
								to edit the destination URL after printing.
							</li>
						</ul>
					</div>

					<div>
						<h2 className="font-heading text-2xl font-bold text-gray-900 dark:text-white">
							Built for Performance
						</h2>
						<p className="mt-4 leading-relaxed">
							{SITE_NAME} is built on Next.js with server-side
							rendering for lightning-fast page loads, optimized
							for SEO, and designed to work beautifully on any
							device. QR codes are generated client-side in your
							browser for instant, private output.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
