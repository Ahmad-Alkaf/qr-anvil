'use client';

import Link from 'next/link';
import {useState} from 'react';
import {Menu, X} from 'lucide-react';
import {UserButton, SignInButton, SignUpButton, useAuth} from '@clerk/nextjs';
import {cn} from '@/lib/utils';
import {SITE_NAME} from '@/lib/constants';
import {Logo} from '@/components/brand/mark';

const navLinks = [
	{href: '/qr-types', label: 'QR Types'},
	{href: '/qr-code-scanner', label: 'Scanner'},
	{href: '/guides', label: 'Guides'},
	{href: '/support', label: 'Support Me'},
	{href: '/about', label: 'About'}
];

export function Header() {
	const [mobileOpen, setMobileOpen] = useState(false);
	const {isLoaded, isSignedIn} = useAuth();
	const showSignedOutActions = !isLoaded || !isSignedIn;

	return (
		<header className="sticky top-0 z-50 border-b backdrop-blur-lg border-gray-800/60 bg-gray-950/80">
			<div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
				{/* Logo */}
				<Link
						href="/"
						aria-label={`${SITE_NAME} home`}
						className="group flex items-center">
						<Logo
							tagline
							className="[&>svg]:transition-transform [&>svg]:duration-300 group-hover:[&>svg]:scale-110"
						/>
					</Link>

				{/* Desktop Nav */}
				<nav className="hidden items-center gap-1 md:flex">
					{navLinks.map(link => (
						<Link
							key={link.href}
							href={link.href}
							className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white">
							{link.label}
						</Link>
					))}
				</nav>

				{/* CTA / Auth */}
				<div className="hidden items-center gap-3 md:flex">
					{showSignedOutActions ? (
						<>
							<SignInButton>
								<button className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
									Sign In
								</button>
							</SignInButton>
							<SignUpButton>
								<button className="rounded-xl border border-gray-700 px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:border-gray-600 hover:bg-gray-800 hover:text-white">
									Sign Up
								</button>
							</SignUpButton>
							<Link
								href="/#generator"
								className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark">
								Create QR Code
							</Link>
						</>
					) : (
						<>
							<Link
								href="/dashboard"
								className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
								Dashboard
							</Link>
							<UserButton
								appearance={{
									elements: {
										avatarBox: 'h-9 w-9'
									}
								}}
							/>
						</>
					)}
				</div>

				{/* Mobile menu button */}
				<button
					onClick={() => setMobileOpen(!mobileOpen)}
					className="inline-flex items-center justify-center rounded-lg p-2 text-gray-600 hover:bg-gray-100 md:hidden dark:text-gray-400 dark:hover:bg-gray-800"
					aria-label="Toggle menu">
					{mobileOpen ? (
						<X className="h-5 w-5" />
					) : (
						<Menu className="h-5 w-5" />
					)}
				</button>
			</div>

			{/* Mobile Nav */}
			<div
				className={cn(
					'overflow-hidden border-t border-gray-200/60 transition-all duration-300 md:hidden dark:border-gray-800/60',
					mobileOpen ? 'max-h-96' : 'max-h-0 border-t-0'
				)}>
				<nav className="space-y-1 px-4 py-3">
					{navLinks.map(link => (
						<Link
							key={link.href}
							href={link.href}
							onClick={() => setMobileOpen(false)}
							className="block rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white">
							{link.label}
						</Link>
					))}
					{showSignedOutActions ? (
						<div className="grid grid-cols-2 gap-2 pt-2">
							<SignInButton>
								<button
									onClick={() => setMobileOpen(false)}
									className="rounded-xl border border-gray-300 px-4 py-2.5 text-center text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
									Sign In
								</button>
							</SignInButton>
							<SignUpButton>
								<button
									onClick={() => setMobileOpen(false)}
									className="rounded-xl border border-primary px-4 py-2.5 text-center text-sm font-medium text-primary transition-colors hover:bg-primary/10">
									Sign Up
								</button>
							</SignUpButton>
							<Link
								href="/#generator"
								onClick={() => setMobileOpen(false)}
								className="col-span-2 rounded-xl bg-primary px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-primary-dark">
								Create QR
							</Link>
						</div>
					) : (
						<Link
							href="/dashboard"
							onClick={() => setMobileOpen(false)}
							className="block rounded-lg px-4 py-2.5 text-sm font-medium text-primary">
							Dashboard
						</Link>
					)}
				</nav>
			</div>
		</header>
	);
}
