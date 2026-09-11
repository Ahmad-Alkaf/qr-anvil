import {describe, expect, it} from 'vitest';
import {formatCount, formatCountParts} from '@/lib/format-count';

describe('formatCount', () => {
	it('adds a plus sign to small counts', () => {
		expect(formatCount(42)).toBe('42+');
	});

	it('rounds hundreds down to a safe milestone', () => {
		expect(formatCount(147)).toBe('140+');
		expect(formatCount(999)).toBe('990+');
	});

	it('uses compact milestones for thousands and millions', () => {
		expect(formatCount(1_299)).toBe('1.2K+');
		expect(formatCount(27_999)).toBe('27K+');
		expect(formatCount(1_999_999)).toBe('1.9M+');
	});

	it('returns separate display parts for the raised plus treatment', () => {
		expect(formatCountParts(12_345)).toEqual({value: '12', suffix: 'K'});
	});
});
