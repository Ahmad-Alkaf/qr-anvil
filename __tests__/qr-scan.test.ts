import {describe, expect, it} from 'vitest';
import {getCameraErrorMessage, getSafeWebUrl} from '@/lib/qr-scan';

describe('getSafeWebUrl', () => {
	it('allows HTTP and HTTPS links', () => {
		expect(getSafeWebUrl('https://example.com/scan?q=1')).toBe(
			'https://example.com/scan?q=1'
		);
		expect(getSafeWebUrl('http://example.com')).toBe('http://example.com/');
	});

	it('rejects unsafe schemes and plain text', () => {
		expect(getSafeWebUrl('javascript:alert(1)')).toBeNull();
		expect(getSafeWebUrl('data:text/html,unsafe')).toBeNull();
		expect(getSafeWebUrl('This is plain text')).toBeNull();
	});
});

describe('getCameraErrorMessage', () => {
	it('gives a useful message for blocked permission', () => {
		expect(getCameraErrorMessage({name: 'NotAllowedError'})).toContain(
			'Allow camera access'
		);
	});

	it('gives a useful message when no camera exists', () => {
		expect(getCameraErrorMessage({name: 'NotFoundError'})).toContain(
			'No camera was found'
		);
	});
});
