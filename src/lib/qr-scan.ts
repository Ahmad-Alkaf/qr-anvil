export function getSafeWebUrl(value: string): string | null {
	try {
		const url = new URL(value);
		return url.protocol === 'https:' || url.protocol === 'http:'
			? url.href
			: null;
	} catch {
		return null;
	}
}

export function getCameraErrorMessage(error: unknown): string {
	const name =
		typeof error === 'object' && error !== null && 'name' in error
			? String(error.name)
			: '';

	switch (name) {
		case 'NotAllowedError':
		case 'PermissionDeniedError':
			return 'Camera access is blocked. Allow camera access in your browser settings, then try again.';
		case 'NotFoundError':
		case 'DevicesNotFoundError':
			return 'No camera was found. Connect a camera or upload a QR code image.';
		case 'NotReadableError':
		case 'TrackStartError':
			return 'The camera is in use by another app. Close that app, then try again.';
		case 'OverconstrainedError':
		case 'ConstraintNotSatisfiedError':
			return 'The browser could not use the selected camera. Try another camera or upload an image.';
		default:
			return 'The camera could not start. Check browser permission, then try again or upload an image.';
	}
}
