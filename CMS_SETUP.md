# CMS and backend compatibility

The redesign uses the original Supabase tables, admin sessions, rate limits, audit logging, API route shapes and upload buckets. It adds editable Hall of Fame records, page copy, logos, and course-section management. Original projects are untouched.

## Connect the existing database

1. In this folder, copy `.env.example` to `.env.local` and supply the same Supabase project and admin credentials as the original site. Keep the service-role/secret key server-side. Either supported key naming convention works:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` or `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SECRET_KEY` or `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_PASSWORD`
   - `ADMIN_SESSION_SECRET` (at least 32 characters)
   - `ADMIN_SESSION_VERSION`
   - `SITE_URL` (the actual origin, including port for local development)
2. For an existing original database, apply only the new pending migrations, in order:
   - `supabase/migrations/20260907000000_redesign_cms.sql`
   - `supabase/migrations/20260907000100_seed_hall_of_fame.sql`
   Use your existing Supabase migration workflow or SQL Editor. Do not rerun the original seed migrations over an existing school database. For a fresh project, the original migrations are included and must run first in filename order.
3. Run `bun run supabase:storage` if the original upload buckets do not already exist. This provisions the same public asset buckets using the server-side key. No new bucket is needed for portraits or logos.
4. Restart the app: `bun run dev --port 3011`.
5. Open `/admin/login`. `/admin/mock` is a separate browser-local demo and does not log in to or write to Supabase.

These migrations have been tested locally with PostgreSQL-compatible PGlite. No live migration or upload was performed because no project credentials were present.

## Vercel deployment

Set the Vercel Root Directory to `school11-redesign` when deploying this repository (or `.` if this folder is the repository root). Use the Next.js preset and `bun run build`. Set the credentials above in the Production environment, and Preview too if needed, then redeploy. `ADMIN_SESSION_SECRET` is required and must contain at least 32 characters; `ADMIN_SESSION_VERSION` is optional and defaults to `1`. Set `SITE_URL` to the public HTTPS origin. Do not set `NODE_ENV=development` on Vercel.

Apply the two pending redesign migrations to Supabase before serving the deployment; a Vercel build does not apply database migrations. Existing databases must also have the original schema and security migrations.

The inherited upload endpoint sends multipart files through a Vercel Function. Vercel limits request bodies to 4.5 MB, so keep individual uploads below 4 MB to leave room for multipart overhead, even though the app currently allows 5 MB images and 10 MB PDFs. Larger files require a future direct-to-storage upload flow.

## Editing map

| Admin area | Data | Public result |
| --- | --- | --- |
| News Manager | `news`, existing categories | Homepage and news reader; draft records stay hidden |
| Teachers Manager | `teachers` | All active teachers on About |
| Achievements | `achievement_years`, `achievements` | Timeline and About history; only published child achievements appear |
| Хүндэт самбар | `hall_of_fame` | Portraits, names, medal rows, source links, publish/feature flags, display order |
| Courses | `course_sections`, `course_items` | Homepage pathways and course catalog; inactive sections/items stay hidden |
| Application Codes | `application_results` | Code lookup, with accepted/pending/waitlisted/rejected/incomplete states |
| School Settings | `school_settings` | Name, contact details, statistics, social links, hero photo, logo, admissions PDF, homepage/About copy |

Shared content refreshes on navigation and when returning to the public tab. Existing server-rendered content is retained if a background refresh temporarily fails. Initial server fetch failures show the existing error state. An empty published collection is empty; production never substitutes sample records after deletion/unpublishing.

## Hall of Fame import

The imported archive contains 172 records, including one record with no name. That record is retained as an unpublished draft labeled “Нэр тодруулаагүй”; enter a verified name before publishing it. The remaining source records are published initially. Source IDs are unique, and rerunning the seed does not overwrite CMS edits or republish records.

Add/remove medal rows in the editor. Use the existing `achievement-images` upload bucket for portraits. “Нүүр хуудсанд онцлох” controls homepage eligibility; “Эрэмбэ” controls order. Full Hall of Fame search covers all published records. Missing photos use initials. Original source attribution is retained for imported records.

## Preview mode

Without Supabase public credentials, sample site content is used and explicitly labeled. `/admin/mock` stores edits under `school11-redesign:mock-admin:v1`. All public surfaces read that demo state, including settings, teachers, courses, achievements and Hall of Fame. Demo application codes are looked up only in that browser. None of this can override configured live content.

## Verification performed

- Build, lint, secret scan, existing tests and CMS integration tests.
- Draft/active filtering, empty-state preservation, settings propagation, Hall of Fame CRUD, application-status validation and unauthorized API access.
- Public payload excludes application records and private notes.
- New migrations, 172-record seed, rerun safety, original-row preservation, public read policy, denied anonymous writes and database medal validation tested in local PGlite.
- Browser: admin Hall of Fame creation/publication and settings text edit visible on public pages.

Before production, verify actual Supabase credentials, apply pending migrations, then test a real upload, admin login and a known application code against your own project.
