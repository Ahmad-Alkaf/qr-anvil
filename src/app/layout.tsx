import type {Metadata, Viewport} from 'next';
import {Fraunces, Outfit} from 'next/font/google';
import {ClerkProvider} from '@clerk/nextjs';
import {dark} from '@clerk/ui/themes';
import './globals.css';
import {Header} from '@/components/layout/header';
import {Footer} from '@/components/layout/footer';
import {JsonLd} from '@/components/seo/json-ld';
import {SITE_DESCRIPTION, SITE_NAME, SITE_URL} from '@/lib/constants';
import {
	jsonLdGraph,
	organizationJsonLd,
	SITE_TAGLINE,
	webSiteJsonLd
} from '@/lib/seo';

const outfit = Outfit({
	variable: '--font-outfit',
	subsets: ['latin'],
	display: 'swap'
});

const fraunces = Fraunces({
	variable: '--font-fraunces',
	subsets: ['latin'],
	style: ['normal', 'italic'],
	display: 'swap'
});

const DEFAULT_TITLE = `Free QR Code Generator | ${SITE_NAME}`;

// Optional. Set NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION at build time to prove
// ownership in Google Search Console without a DNS record.
const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

export const metadata: Metadata = {
	metadataBase: new URL(SITE_URL),
	title: {
		default: DEFAULT_TITLE,
		template: `%s | ${SITE_NAME}`
	},
	description: SITE_DESCRIPTION,
	applicationName: SITE_NAME,
	keywords: [
		'QR code generator',
		'free QR code generator',
		'create QR code',
		'custom QR code',
		'QR code maker',
		'tracked QR code',
		'dynamic QR code',
		'QR code with analytics',
		'Wi-Fi QR code',
		'vCard QR code'
	],
	authors: [{name: 'KafLabs', url: 'https://kaflabs.com'}],
	creator: 'KafLabs',
	publisher: 'KafLabs',
	category: 'technology',
	classification: 'QR code generator',
	referrer: 'strict-origin-when-cross-origin',
	formatDetection: {
		telephone: false,
		email: false,
		address: false
	},
	icons: {
		icon: [
			{url: '/favicon.ico', sizes: 'any'},
			{url: '/logo/icon-96.png', sizes: '96x96', type: 'image/png'},
			{url: '/logo/icon-192.png', sizes: '192x192', type: 'image/png'}
		],
		apple: [{url: '/logo/icon-192.png', sizes: '192x192', type: 'image/png'}],
		shortcut: '/favicon.ico'
	},
	appleWebApp: {
		capable: true,
		title: SITE_NAME,
		statusBarStyle: 'black-translucent'
	},
	openGraph: {
		type: 'website',
		locale: 'en_US',
		url: SITE_URL,
		siteName: SITE_NAME,
		title: `Free QR Code Generator — ${SITE_TAGLINE}`,
		description: SITE_DESCRIPTION
	},
	twitter: {
		card: 'summary_large_image',
		title: `${SITE_NAME} — Free QR Code Generator`,
		description: SITE_DESCRIPTION
	},
	alternates: {
		canonical: '/'
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			'max-video-preview': -1,
			'max-image-preview': 'large',
			'max-snippet': -1
		}
	},
	...(googleVerification
		? {verification: {google: googleVerification}}
		: {})
};

export const viewport: Viewport = {
	themeColor: '#C45B28',
	colorScheme: 'dark',
	width: 'device-width',
	initialScale: 1
};

export default function RootLayout({
	children
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			data-scroll-behavior="smooth"
			className={`dark ${outfit.variable} ${fraunces.variable} h-full antialiased`}>
			<head>
				{/* Site-wide entities. Pages add their own nodes (FAQ, HowTo, breadcrumbs). */}
				<JsonLd data={jsonLdGraph(organizationJsonLd(), webSiteJsonLd())} />
			</head>
			<body className="min-h-full flex flex-col font-sans">
				<ClerkProvider appearance={{theme: dark}}>
					<Header />
					<main className="flex-1">{children}</main>
					<Footer />
				</ClerkProvider>
			</body>
		</html>
	);
}
