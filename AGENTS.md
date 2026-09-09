Before work in this repository, read `../AGENTS.md` for shared organization and shell rules. If this repository is checked out alone, report that the shared file is unavailable. For work that needs the organization deploy plan, obtain that file before you proceed.

## Architecture

**QR Anvil** — a free QR code generator built with Next.js 16, React 19, Tailwind CSS 4, Clerk auth, and Prisma (PostgreSQL via `@prisma/adapter-pg`).

### Key flows

- **QR generation is client-side.** The `qr-code-styling` library renders QR codes in the browser (canvas/SVG). The server API (`/api/qr/generate`) only persists metadata and, for tracked QR codes, generates a short code. It does NOT generate images.
- **Direct vs Tracked QR codes.** Direct QR encodes content directly (no server round-trip needed for the data). Tracked QR encodes a redirect URL (`/r/[shortCode]`) that goes through the server, enabling scan analytics and editable destinations.
- **Redirect route** at `src/app/r/[shortCode]/route.ts` handles tracked QR scans: looks up destination, 302-redirects, then logs scan data with `after()` (geo from Cloudflare or Vercel headers via `src/lib/request.ts`, UA parsing, truncated IP).
- **Download formats:** PNG/SVG generated client-side via `qr-code-styling`, PDF wraps a PNG using `pdf-lib` — all in the browser (`src/lib/qr-export.ts`).
- **Dashboard detail page** (`/dashboard/qr-codes/[id]`) re-renders the stored QR code for download and lets the owner edit the name and, for tracked codes, the destination URL (PATCH `/api/qr/[id]`).

### Deployment

- Host: **Coolify** with the repository `Dockerfile` (Next.js `output: "standalone"`). The entrypoint runs `prisma migrate deploy` and then `node server.js`. Health check: `/api/health`.
- `NEXT_PUBLIC_*` variables must be marked "Available at build time" in Coolify. See `README.md` for the full table.
- Package manager is **npm** (`package-lock.json`). Do not add pnpm or yarn lock files.

### Tests

`npm test` runs Vitest on `__tests__/` (QR data builder, request helpers, short codes). Add a test when you change `src/lib/qr.ts` or `src/lib/request.ts`.

### Brand

- Product name is **QR Anvil** (two words in copy; `qr-anvil` in file names and the domain `qr-anvil.com`, apex only, no www). The repository folder is `qr-anvil/`.
- The mark ("Cleft Corner") lives in `src/lib/brand.ts` as `MARK_PATH`. `src/components/brand/mark.tsx` renders it (`Mark`, `Logo`). `npm run icons` regenerates `public/logo/*`, both `favicon.ico` files, and `../kaflabs/qr-anvil-icon.png` from that path. Never hand-edit the PNGs.
- Header tagline is `BRAND_TAGLINE` in `src/lib/brand.ts`. The SEO tagline is separate (`SITE_TAGLINE` in `src/lib/seo.ts`).

### Auth & users

- Clerk handles authentication. Middleware in `src/proxy.ts` protects `/dashboard(.*)` routes.
- Users are synced to the DB via Clerk webhooks (`/api/webhooks/clerk`) using Svix verification.
- `src/lib/auth.ts` provides `getCurrentUser()` to look up the DB user from the Clerk session.
- Users must be logged in to use non-URL QR types (Wi-Fi, vCard, Email, SMS, WhatsApp, PDF, Plain Text).
- Users must be logged in to download in non-PNG formats (SVG, PDF).

### Data layer

- Prisma schema at `prisma/schema.prisma`. Generated client output goes to `src/generated/prisma/` (do NOT edit generated files).
- Models: `User`, `QRCode` (with `QRType` enum), `Scan`, and `QRGenEvent`.
- DB connection uses the `PrismaPg` adapter with `DATABASE_URL` env var.

### Project structure

- `src/components/qr/` — QR generator form (`qr-generator.tsx`), live preview (`qr-preview.tsx`), type-specific input fields (`qr-type-fields.tsx`)
- `src/lib/qr.ts` — Zod validation schema (`qrGenerateSchema`) and `buildQRData()` which converts structured input into QR-encodable strings (WIFI:, VCARD, mailto:, smsto:, etc.)
- `src/lib/constants.ts` — `QR_TYPE_INFO` and app constants
- Path alias: `@/*` maps to `./src/*`

### Styling

- Tailwind CSS 4 with `@tailwindcss/postcss`. Custom CSS variables for colors (`--color-primary`, etc.) defined in `globals.css`.
- Fonts: Outfit (sans) + Fraunces (serif), loaded via `next/font/google`.
- Utility: `cn()` from `src/lib/utils.ts` (clsx + tailwind-merge).

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
