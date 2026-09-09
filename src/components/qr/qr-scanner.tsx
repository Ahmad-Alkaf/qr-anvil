'use client';

import {
	Camera,
	Check,
	Clipboard,
	ExternalLink,
	ImageUp,
	LoaderCircle,
	RotateCcw,
	ShieldCheck,
	Square
} from 'lucide-react';
import {ChangeEvent, useEffect, useRef, useState} from 'react';
import type {IScannerControls} from '@zxing/browser';
import {getCameraErrorMessage, getSafeWebUrl} from '@/lib/qr-scan';

type ScannerState = 'idle' | 'camera' | 'image' | 'result' | 'error';

const MAX_IMAGE_SIZE = 15 * 1024 * 1024;

export function QRScanner() {
	const videoRef = useRef<HTMLVideoElement>(null);
	const controlsRef = useRef<IScannerControls | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [state, setState] = useState<ScannerState>('idle');
	const [message, setMessage] = useState(
		'Choose the camera or upload a QR code image.'
	);
	const [result, setResult] = useState('');
	const [copied, setCopied] = useState(false);

	function stopCamera() {
		controlsRef.current?.stop();
		controlsRef.current = null;
	}

	useEffect(() => {
		return () => stopCamera();
	}, []);

	function showResult(value: string, activeControls?: IScannerControls) {
		activeControls?.stop();
		stopCamera();
		setResult(value);
		setCopied(false);
		setState('result');
		setMessage('QR code read. Check the content before you use it.');
	}

	async function startCamera() {
		stopCamera();
		setResult('');
		setCopied(false);

		if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
			setState('error');
			setMessage(
				'Camera scanning needs HTTPS or localhost. Open the secure site or upload an image.'
			);
			return;
		}

		setState('camera');
		setMessage('Starting the camera. Your browser may ask for permission.');

		try {
			const {BrowserQRCodeReader} = await import('@zxing/browser');
			const reader = new BrowserQRCodeReader(undefined, {
				delayBetweenScanAttempts: 150,
				delayBetweenScanSuccess: 750
			});
			const controls = await reader.decodeFromConstraints(
				{
					audio: false,
					video: {
						facingMode: {ideal: 'environment'},
						width: {ideal: 1280},
						height: {ideal: 720}
					}
				},
				videoRef.current ?? undefined,
				(scanResult, _error, activeControls) => {
					if (scanResult) showResult(scanResult.getText(), activeControls);
				}
			);
			controlsRef.current = controls;
			setMessage('Point the camera at a QR code. Keep the code inside the frame.');
		} catch (error) {
			stopCamera();
			setState('error');
			setMessage(getCameraErrorMessage(error));
		}
	}

	async function scanImage(event: ChangeEvent<HTMLInputElement>) {
		const file = event.target.files?.[0];
		event.target.value = '';
		if (!file) return;

		stopCamera();
		setResult('');
		setCopied(false);

		if (!file.type.startsWith('image/')) {
			setState('error');
			setMessage('Choose an image file, such as PNG, JPG, or WebP.');
			return;
		}

		if (file.size > MAX_IMAGE_SIZE) {
			setState('error');
			setMessage('The image is larger than 15 MB. Choose a smaller image.');
			return;
		}

		setState('image');
		setMessage('Reading the QR code from your image.');
		const imageUrl = URL.createObjectURL(file);

		try {
			const {BrowserQRCodeReader} = await import('@zxing/browser');
			const scanResult = await new BrowserQRCodeReader().decodeFromImageUrl(
				imageUrl
			);
			showResult(scanResult.getText());
		} catch {
			setState('error');
			setMessage(
				'No QR code was found. Use a clear image with the full code visible, then try again.'
			);
		} finally {
			URL.revokeObjectURL(imageUrl);
		}
	}

	async function copyResult() {
		try {
			await navigator.clipboard.writeText(result);
			setCopied(true);
		} catch {
			setMessage('Copy did not work. Select the content and copy it manually.');
		}
	}

	function resetScanner() {
		stopCamera();
		setResult('');
		setCopied(false);
		setState('idle');
		setMessage('Choose the camera or upload a QR code image.');
	}

	const safeWebUrl = result ? getSafeWebUrl(result) : null;
	const isWorking = state === 'image';

	return (
		<div className="overflow-hidden rounded-3xl border border-gray-700 bg-gray-950 shadow-2xl shadow-black/20">
			<div className="relative aspect-4/3 overflow-hidden bg-black sm:aspect-video">
				<video
					ref={videoRef}
					aria-label="Live camera preview"
					className={`h-full w-full object-cover transition-opacity ${state === 'camera' ? 'opacity-100' : 'opacity-0'}`}
					muted
					playsInline
				/>

				{state !== 'camera' && (
					<div className="absolute inset-0 flex flex-col items-center justify-center bg-[radial-gradient(circle_at_center,#1f2937_0,#030712_68%)] px-6 text-center">
						{state === 'result' ? (
							<div className="flex h-20 w-20 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/10 text-emerald-300">
								<Check className="h-10 w-10" aria-hidden="true" />
							</div>
						) : isWorking ? (
							<LoaderCircle
								className="h-14 w-14 animate-spin text-primary-light motion-reduce:animate-none"
								aria-hidden="true"
							/>
						) : (
							<div className="relative h-36 w-36 text-primary-light sm:h-44 sm:w-44">
								<Square
									className="h-full w-full stroke-[0.7]"
									aria-hidden="true"
								/>
								<div className="absolute inset-9 grid grid-cols-3 gap-1.5 sm:inset-11">
									{Array.from({length: 9}, (_, index) => (
										<span
											key={index}
											className={`${[1, 3, 4, 8].includes(index) ? 'bg-primary-light' : 'bg-gray-600'} rounded-[2px]`}
										/>
									))}
								</div>
							</div>
						)}
					</div>
				)}

				{state === 'camera' && (
					<div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20">
						<div className="h-52 w-52 rounded-2xl border-2 border-white shadow-[0_0_0_999px_rgba(0,0,0,0.35)] sm:h-64 sm:w-64" />
					</div>
				)}
			</div>

			<div className="border-t border-gray-800 p-5 sm:p-6">
				<p
					role="status"
					aria-live="polite"
					className={`${state === 'error' ? 'text-amber-300' : 'text-gray-300'} min-h-6 text-sm leading-6`}>
					{message}
				</p>

				{result && (
					<div className="mt-4 rounded-xl border border-gray-700 bg-gray-900 p-4">
						<p className="text-xs font-medium text-gray-400">Scanned content</p>
						<p className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap break-words text-sm leading-6 text-white">
							{result}
						</p>
						<div className="mt-4 flex flex-wrap gap-2">
							<button
								type="button"
								onClick={copyResult}
								className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-950 outline-none hover:bg-gray-200 focus-visible:ring-2 focus-visible:ring-primary-light">
								{copied ? (
									<Check className="h-4 w-4" aria-hidden="true" />
								) : (
									<Clipboard className="h-4 w-4" aria-hidden="true" />
								)}
								{copied ? 'Copied' : 'Copy content'}
							</button>
							{safeWebUrl && (
								<a
									href={safeWebUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-gray-600 px-4 py-2 text-sm font-semibold text-white outline-none hover:bg-gray-800 focus-visible:ring-2 focus-visible:ring-primary-light">
									Open link
									<ExternalLink className="h-4 w-4" aria-hidden="true" />
								</a>
							)}
						</div>
						{safeWebUrl && (
							<p className="mt-3 text-xs leading-5 text-amber-200">
								Open the link only if you know and trust its destination.
							</p>
						)}
					</div>
				)}

				<div className="mt-5 grid gap-3 sm:grid-cols-2">
					{state === 'camera' ? (
						<button
							type="button"
							onClick={resetScanner}
							className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-white outline-none hover:bg-primary-dark focus-visible:ring-2 focus-visible:ring-primary-light focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950 sm:col-span-2">
							<Square className="h-5 w-5 fill-current" aria-hidden="true" />
							Stop camera
						</button>
					) : state === 'result' ? (
						<button
							type="button"
							onClick={resetScanner}
							className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-white outline-none hover:bg-primary-dark focus-visible:ring-2 focus-visible:ring-primary-light focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950 sm:col-span-2">
							<RotateCcw className="h-5 w-5" aria-hidden="true" />
							Scan another code
						</button>
					) : (
						<>
							<button
								type="button"
								onClick={startCamera}
								disabled={isWorking}
								className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-white outline-none hover:bg-primary-dark focus-visible:ring-2 focus-visible:ring-primary-light focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950 disabled:cursor-wait disabled:opacity-50">
								<Camera className="h-5 w-5" aria-hidden="true" />
								Use camera
							</button>
							<button
								type="button"
								onClick={() => fileInputRef.current?.click()}
								disabled={isWorking}
								className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-gray-600 px-5 py-3 font-semibold text-white outline-none hover:bg-gray-800 focus-visible:ring-2 focus-visible:ring-primary-light focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950 disabled:cursor-wait disabled:opacity-50">
								<ImageUp className="h-5 w-5" aria-hidden="true" />
								Upload image
							</button>
						</>
					)}
					<input
						ref={fileInputRef}
						type="file"
						accept="image/*"
						onChange={scanImage}
						className="sr-only"
						aria-label="Upload a QR code image"
					/>
				</div>

				<div className="mt-5 flex items-start gap-2 border-t border-gray-800 pt-5 text-xs leading-5 text-gray-400">
					<ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
					<span>Scanning stays in this browser. QR Anvil does not upload your camera view or image.</span>
				</div>
			</div>
		</div>
	);
}
