# QR Anvil

Free QR code generator with scan analytics. A [KafLabs](https://kaflabs.com) product.

[Open QR Anvil](https://qr-anvil.com) · [View source](https://github.com/Ahmad-Alkaf/qr-anvil)

![QR Anvil home page with its QR generator and public source link](docs/screenshots/home.jpg)

- Next.js 16, React 19, Tailwind CSS 4
- Clerk (auth), Prisma 7 + PostgreSQL (data)
- QR images are generated in the browser with `qr-code-styling`. The server only stores metadata and serves the `/r/[shortCode]` redirect for Tracked QR codes.

## Design decisions

- QR images and downloads are rendered in the browser. The server stores metadata, not generated images.
- Direct codes contain the content itself. Tracked codes use a short redirect so the destination can change after printing and scans can be counted.
- Clerk manages accounts. Prisma and PostgreSQL store saved codes and scan history.
- Shared validation keeps the QR content formats consistent across the generator and API.

## Local development

```bash
npm install
cp .env.example .env        # fill in the values
npx prisma migrate dev      # creates the schema in your local PostgreSQL
npm run dev
```

Open <http://localhost:3000>.

Useful scripts:

| Script | Purpose |
|---|---|
| `npm run build` | `prisma generate` + `next build` |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:migrate` | Create and apply a migration in development |
| `npm run db:deploy` | Apply pending migrations (production) |
| `npm run db:studio` | Prisma Studio |

## Environment variables

See `.env.example`. `NEXT_PUBLIC_*` values are inlined into the client bundle at **build** time. All other values are read at **run** time.

| Variable | When | Note |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | build | Canonical origin, for example `https://qr-anvil.com`. Tracked QR codes embed it forever. |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | build | Clerk production instance |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` etc. | build | `/sign-in`, `/sign-up`, `/dashboard`, `/dashboard` |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | build | Optional. Google Search Console HTML-tag verification token. Leave empty to skip the meta tag. |
| `DATABASE_URL` | run | PostgreSQL connection string |
| `CLERK_SECRET_KEY` | run | Clerk production instance |
| `CLERK_WEBHOOK_SECRET` | run | Clerk webhook endpoint `/api/webhooks/clerk` (events `user.created`, `user.updated`, `user.deleted`) |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | run | Optional. Without them the public API routes have no rate limit. |

## Deploy on Coolify

The repository ships a multi-stage `Dockerfile` that builds a Next.js standalone image. On start the container runs `prisma migrate deploy` and then the server.

1. **Database.** Create a PostgreSQL resource in Coolify (or use a managed provider). Copy its connection string.
2. **Application.** New resource, source = this repository, build pack = **Dockerfile**, port **3000**.
3. **Environment variables.** Add every row from the table above. For each `NEXT_PUBLIC_*` variable tick **"Available at build time"** (Coolify passes them as `--build-arg`). Runtime variables need no build flag.
4. **Domain.** The canonical host is the apex `https://qr-anvil.com` (no www). Set it as the Coolify domain and in `NEXT_PUBLIC_SITE_URL`. Let Coolify issue the certificate. Redirect `www.qr-anvil.com` to the apex with a 301.
5. **Health check.** Path `/api/health`, port 3000. It returns 200 only when the database answers.
6. **Clerk.** In the Clerk dashboard create the production instance, add the domain, and register the webhook `https://<domain>/api/webhooks/clerk`. Paste its signing secret into `CLERK_WEBHOOK_SECRET`.
7. **Deploy.** Watch the logs: the first lines show the migrations being applied.

### Scan location (country and city)

The redirect route reads location from proxy headers:

- Cloudflare in front of Coolify: `cf-ipcountry` is always sent. For city data enable the managed transform **"Add visitor location headers"**, which sends `cf-ipcity`.
- Vercel: `x-vercel-ip-country`, `x-vercel-ip-city`.
- No proxy that adds location headers: country and city stay empty. Device, OS, browser, and time are still recorded.

Client IPs are read from `cf-connecting-ip`, then `x-forwarded-for`, then `x-real-ip`. Stored scan IPs are truncated (last IPv4 octet removed).

### After deploy

- Sign up, create a Tracked QR code, scan it, and check the analytics row in the dashboard.
- Open `/sitemap.xml`, `/robots.txt`, `/manifest.webmanifest`, `/opengraph-image`, `/api/health`.
- Footer links to the kaflabs.com privacy and terms pages open.

## Project structure

- `src/app/` routes (App Router). `src/app/r/[shortCode]/route.ts` is the redirect.
- `src/components/qr/` generator UI, live preview, per-type input fields.
- `src/lib/qr.ts` validation schema and `buildQRData()` (WIFI:, vCard, mailto:, smsto:, wa.me).
- `src/lib/qr-export.ts` browser-side PNG/SVG/PDF rendering.
- `src/lib/request.ts` client IP and geo header helpers.
- `prisma/schema.prisma` and `prisma/migrations/`. The generated client goes to `src/generated/prisma/` (ignored by git).

## Checks and license

Run `npm run typecheck`, `npm run lint`, and `npm test` before submitting a change.
Vitest checks QR content building, request helpers, and short codes. Account and scan flows also need checks with local service settings.

The source is public under [PolyForm Noncommercial 1.0.0](LICENSE). See the license for permitted uses and conditions.
