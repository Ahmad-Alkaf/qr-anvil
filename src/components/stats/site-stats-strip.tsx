'use client';

import {QrCode, ScanLine, UsersRound, type LucideIcon} from 'lucide-react';
import {useEffect, useRef, useState} from 'react';
import {formatCount, formatCountParts} from '@/lib/format-count';

interface SiteStatsStripProps {
	qrCount: number;
	userCount: number;
	scanCount: number;
}

interface StatItem {
	icon: LucideIcon;
	label: string;
	value: number;
}

const ANIMATION_DURATION_MS = 1400;

function easeOutQuint(progress: number): number {
	return 1 - (1 - progress) ** 5;
}

export function SiteStatsStrip({
	qrCount,
	userCount,
	scanCount
}: SiteStatsStripProps) {
	const sectionRef = useRef<HTMLDivElement>(null);
	const [progress, setProgress] = useState(1);

	useEffect(() => {
		const section = sectionRef.current;
		if (!section) return;

		const reducedMotion = window.matchMedia(
			'(prefers-reduced-motion: reduce)'
		).matches;
		if (reducedMotion) return;

		let animationFrame = 0;
		const observer = new IntersectionObserver(
			entries => {
				if (!entries[0]?.isIntersecting) return;

				observer.disconnect();
				const startTime = performance.now();

				const animate = (time: number) => {
					const elapsed = time - startTime;
					const nextProgress = Math.min(elapsed / ANIMATION_DURATION_MS, 1);
					setProgress(easeOutQuint(nextProgress));

					if (nextProgress < 1) {
						animationFrame = requestAnimationFrame(animate);
					}
				};

				setProgress(0);
				animationFrame = requestAnimationFrame(animate);
			},
			{threshold: 0.35}
		);

		observer.observe(section);

		return () => {
			observer.disconnect();
			cancelAnimationFrame(animationFrame);
		};
	}, []);

	const stats: StatItem[] = [
		{icon: UsersRound, label: 'users', value: userCount},
		{icon: QrCode, label: 'QR codes created', value: qrCount},
		{icon: ScanLine, label: 'scans tracked', value: scanCount}
	];

	return (
		<section
			aria-label="Usage statistics"
			className="border-y border-gray-200 bg-white py-6 sm:py-8 dark:border-gray-800 dark:bg-gray-950">
			<div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
				<div
					ref={sectionRef}
					className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 shadow-sm dark:border-gray-800 dark:bg-gray-900/70">
					<div
						aria-hidden="true"
						className="absolute inset-x-0 top-0 h-1 origin-left bg-primary motion-reduce:transform-none"
						style={{transform: `scaleX(${progress})`}}
					/>

					<div className="grid grid-cols-3 divide-x divide-gray-200 dark:divide-gray-800">
						{stats.map((stat, index) => {
							const statProgress = Math.max(
								0,
								Math.min(1, progress * 1.15 - index * 0.075)
							);
							const displayedCount = Math.floor(stat.value * statProgress);
							const {value, suffix} = formatCountParts(displayedCount);

							return (
								<div
									key={stat.label}
									className="flex min-w-0 flex-col items-center justify-center gap-2 px-2 py-5 text-center sm:flex-row sm:gap-4 sm:px-6 sm:py-6 sm:text-left">
									<div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary sm:flex dark:bg-primary/15">
										<stat.icon className="h-5 w-5" strokeWidth={2.25} />
									</div>
									<div className="min-w-0">
										<p
											aria-hidden="true"
											className="font-heading flex items-start justify-center text-2xl font-bold leading-none tracking-tight text-gray-900 tabular-nums sm:justify-start sm:text-3xl dark:text-white">
											<span>{value}</span>
											<span>{suffix}</span>
											<sup
												className="ml-0.5 text-sm font-bold leading-none text-primary transition duration-300 sm:text-base"
												style={{
													opacity: statProgress > 0.82 ? 1 : 0,
													transform: `translateY(${statProgress > 0.82 ? 0 : 4}px)`
												}}>
												+
											</sup>
										</p>
										<span className="sr-only">{formatCount(stat.value)}</span>
										<p className="mt-1 text-xs leading-tight text-gray-500 sm:text-sm dark:text-gray-400">
											{stat.label}
										</p>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			</div>
		</section>
	);
}
