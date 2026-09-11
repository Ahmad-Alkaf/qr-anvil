export interface CountParts {
	value: string;
	suffix: '' | 'K' | 'M';
}

function formatCompactCount(count: number, unit: number, suffix: 'K' | 'M'): CountParts {
	const compactCount = count / unit;
	const precision = compactCount < 10 ? 1 : 0;
	const factor = 10 ** precision;
	const roundedDown = Math.floor(compactCount * factor) / factor;

	return {
		value: roundedDown.toFixed(precision).replace(/\.0$/, ''),
		suffix
	};
}

/**
 * Formats a public counter as a conservative milestone. The value is always
 * rounded down so the trailing plus sign never overstates the real total.
 */
export function formatCountParts(count: number): CountParts {
	const safeCount = Math.max(0, Math.floor(count));

	if (safeCount >= 1_000_000) {
		return formatCompactCount(safeCount, 1_000_000, 'M');
	}

	if (safeCount >= 1_000) {
		return formatCompactCount(safeCount, 1_000, 'K');
	}

	if (safeCount >= 100) {
		return {value: String(Math.floor(safeCount / 10) * 10), suffix: ''};
	}

	return {value: String(safeCount), suffix: ''};
}

export function formatCount(count: number): string {
	const {value, suffix} = formatCountParts(count);
	return `${value}${suffix}+`;
}
