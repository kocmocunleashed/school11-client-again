# School 11 Web

React SPA for the public School 11 website and a small password-protected admin CMS. Production deploys to Vercel as static files in `dist` plus `/api` serverless functions. The Bun server in `src/index.ts` is for local development only.

The public and admin apps have separate browser entrypoints:

- `src/frontend.tsx` imports only the public `App`.
- `src/admin.tsx` imports `AdminApp` and `AdminLogin`.

This keeps admin UI code out of the public bundle while Vercel rewrites `/admin/*` to `admin.html`.

## Tech Stack

- Bun
- React + TypeScript
- Tailwind CSS
- Supabase Database and Storage
- Vercel static hosting and `/api` functions

## Local Setup

1. Install Bun.
2. Copy `.env.example` to `.env`.
3. Fill in Supabase and admin values.
4. Install dependencies:

```bash
bun install
```

5. Start local development:

```bash
bun run dev
```

The local Bun server serves the SPA and mirrors the Vercel `/api` routes through shared handlers.

## Required Env Vars

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_PASSWORD=
ADMIN_SESSION_SECRET=
ADMIN_SESSION_VERSION=
SITE_URL=
NODE_ENV=
```

`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are browser-safe public values. `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD`, and `ADMIN_SESSION_SECRET` are server-only and must never be exposed to browser code. Use a long unique admin password and an `ADMIN_SESSION_SECRET` of at least 32 characters.

`ADMIN_SESSION_VERSION` defaults to `1`. Increase it to revoke all active admin cookies without changing the signing secret.

`SITE_URL` controls build-time canonical URLs, sitemap URLs, Open Graph URLs, robots sitemap references, and JSON-LD `url`. Keep it as `https://school11-client-again.vercel.app` until the real custom domain is ready, then set it to the production HTTPS origin before building.

## Commands

```bash
bun run dev                  # local Bun dev server
bun run build                # build static output to dist
bun run typecheck            # TypeScript check
bun test                     # unit tests
bun run check:secrets        # scan tracked text files for obvious committed secrets
bun run check                # secret scan + typecheck + build
bun run start                # production-style Bun server
bun run supabase:storage     # create required public storage buckets
bun run supabase:seed-achievements
```

## Supabase Migrations

Apply the SQL files in `supabase/migrations` in timestamp order using the Supabase dashboard, Supabase CLI, or your deployment workflow.

Important migration notes:

- `application_results` is intentionally not directly readable by `anon` or `authenticated`.
- Public application lookup goes through `/api/check-application`, which uses the server-only service role key and returns a narrow response.
- Demo application result rows are removed by `20260605000000_secure_application_results.sql`; production data should be imported through the admin CMS or an environment-specific seed/import.
- Persistent serverless rate limits require the `rate_limits` migration and the `check_rate_limit` RPC. Without Supabase service-role env, the app falls back to in-memory limits for local/dev only.
- Admin audit logging requires the `admin_audit_logs` migration. Audit rows store action/resource, a short hashed IP, truncated user-agent, and minimal metadata only.

Production must run all migrations in timestamp order. Do not rewrite old migrations for production fixes; add forward-only migrations.

## Storage Buckets

Run:

```bash
bun run supabase:storage
```

Expected public buckets:

- `documents`: PDFs only, max 10 MB
- `news-images`, `teacher-photos`, `achievement-images`, `site-assets`: JPEG/PNG/WebP only, max 5 MB

Buckets stay public because the current app stores and renders public URLs.

## Admin CMS

Admin login is available at `/admin/login`.

Set:

- `ADMIN_PASSWORD`: long, unique password
- `ADMIN_SESSION_SECRET`: random secret with at least 32 characters
- `ADMIN_SESSION_VERSION`: bump this value to revoke all active admin sessions

Admin sessions use a signed HttpOnly cookie. Admin API responses are `no-store`, and mutating admin routes validate same-origin requests.

## Vercel Deployment

Vercel should use:

- Install command: `bun install`
- Build command: `bun run build`
- Output directory: `dist`

The `/api` directory is the canonical production API surface. Do not add Next.js `app/api` routes; this is not a Next.js project.

CI runs in `.github/workflows/ci.yml` on push and pull requests:

- `bun install --frozen-lockfile`
- `bun run typecheck`
- `bun run build`
- `bun test`

## Security Notes

- Never commit real `.env` values.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to frontend code.
- Keep `application_results` locked from direct anonymous/authenticated selects.
- Persistent Supabase-backed rate limits are used when service-role env and the migration are present. In-memory rate limits are best-effort and only acceptable for local/dev fallback.
- Do not add permissive CORS for admin routes.
- Keep `/admin` noindexed. Vercel also sends `X-Robots-Tag: noindex, nofollow` for `/admin/:path*`.
- Current CSP uses `img-src 'self' data: blob: https:` so admins can paste external HTTPS image links. Tightening this requires replacing pasted arbitrary image URLs with an allowlist of approved image/storage domains.
- `.gitignore` excludes local env files. Keep `.env.example` placeholder-only and run `bun run check:secrets` before publishing changes.

## Production Checklist

Before launch:

- Apply all Supabase migrations in timestamp order.
- Confirm `20260605000000_secure_application_results.sql` has run and `application_results` is not readable by `anon` or `authenticated`.
- Confirm no demo/test `application_results` rows exist in production.
- Confirm `rate_limits` and `admin_audit_logs` exist and are not readable/writable by `anon` or `authenticated`.
- Rotate deployment secrets and keep `SUPABASE_SERVICE_ROLE_KEY` server-only.
- Set `ADMIN_PASSWORD` to a long unique value.
- Set `ADMIN_SESSION_SECRET` to at least 32 random characters.
- Set `ADMIN_SESSION_VERSION` and increase it whenever all admin sessions should be revoked.
- Set `SITE_URL` to the final HTTPS origin.
- Configure the required Supabase Storage buckets.
- Run `bun run check` and `bun test`.
- Submit `/sitemap.xml` for the final domain.

## Troubleshooting

- Missing Supabase env: check `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and server-only `SUPABASE_SERVICE_ROLE_KEY`.
- Admin login returns 500: confirm `ADMIN_PASSWORD` is set and `ADMIN_SESSION_SECRET` is at least 32 characters.
- Admin mutation returns 403: submit from the same site origin; cross-origin requests are rejected.
- Upload rejected: confirm the bucket and file type match the storage rules above.
- Application lookup returns not found: codes must be exactly 8 uppercase alphanumeric characters and must exist in `application_results`.
- Supabase direct select from `application_results` works with anon/authenticated: re-apply the latest migrations and confirm the revoke migration ran.
