# School 11 — original Mongolian frontend redesign

An independent redesign in a new folder, based on the data and application logic in `../school11-alt`. The two source projects are untouched.

## CMS and backend

The original CMS is integrated with the redesign. See [CMS_SETUP.md](./CMS_SETUP.md) for database setup, new migrations, the editing map, and verification details. `/admin/mock` previews all managed content locally; `/admin/login` uses the original authenticated backend. Hall of Fame records and homepage/About text now have editors.

## Run locally

```sh
bun install
bun run dev --port 3011
```

Open http://localhost:3011. Production: `bun run build`, then `bun run start --port 3011`.

## Styling

Tailwind CSS v4 runs through `@tailwindcss/postcss`. `src/app/globals.css` is the single stylesheet entry point, with explicit theme, base, components, and utilities layers. Utilities in JSX override the shared component styles.

- `src/styles/theme.css` maps the school's colors, fonts, and fluid spacing to Tailwind tokens, such as `text-school-ink`, `font-ui`, and `pt-school-3`.
- `src/styles/base.css` keeps the existing reset and CSS variables. Tailwind Preflight is intentionally omitted to preserve the current typography and native form controls.
- `src/styles/public.css` and `src/styles/admin.css` use `@apply` for shared styles. Each references the theme so Next.js can compile imported stylesheets independently. One-off layouts also use utilities directly in JSX.
- Custom CSS remains for the dimensional “11”, orbital artwork, gradients, and keyframe animations. Existing media queries retain their exact breakpoints, including reduced-motion behavior.

Use literal Tailwind class names so source detection can find them. For conditional styling, select complete class strings instead of constructing utility names dynamically.

## Scope

- Original responsive Mongolian homepage, school information, academic catalog, achievement timeline, news index and reader, admissions interface, navigation and footer.
- Student-yearbook direction: sunflower yellow, ultramarine, pink paper, and Cyrillic Golos Text. A pointer-responsive dimensional “11”, campus postcard, and tilted academic panels give the public site its own identity. The sculpture uses CSS transforms, not a WebGL dependency. Reduced-motion preferences are respected.
- Existing Supabase adapters, API routes, PDF guide, admin screens, and local admin demo retained. No environment secrets copied from the source.
- Mobile menu traps keyboard focus, closes with Escape, and restores focus. News dialogs have equivalent keyboard behavior. Achievement years support arrow keys, Home and End.

## Content and inspiration

Phillips Exeter Academy (https://exeter.edu/) and Highgate School (https://www.highgateschool.org.uk/) informed only the information hierarchy: school identity, academics, school life, news, and admissions. No school copy, branding, images or source code was taken from those sites. The visual composition and Mongolian homepage copy are original.

The logo and campus photograph were inherited from the source project. The photograph carries an iKon watermark; retain its attribution and confirm publication permission or replace it with a school-owned photograph before launch. It has not been represented as newly commissioned photography.

Fallback news, teachers, timelines, statistics, contact information and the inherited admissions PDF are preview content and require school review. A Mongolian preview notice is displayed when fallback news is in use. Do not publish sample achievements as verified facts. Configure Supabase with the existing environment variables to use approved school content. The admissions result API requires its backend configuration; local preview does not fabricate admission decisions.

Public navigation intentionally excludes the admin area, empty social links, and the inherited decorative game. All public text uses Mongolian; the location is Ulaanbaatar, Mongolia.

## Checks

```sh
bun run lint
bun run typecheck
bun test
bun run check:secrets
bun run build
```

## Public data caching and upload compression

The live Next.js app caches its shared public dataset for five minutes using
Next's Data Cache. Server-rendered pages and `/api/site-data` reuse cached public
data under the same invalidation tag (Next may emit separate entries per bundle).
The key includes the Supabase project URL, and only successful public reads enter
the cache. Database errors keep the existing 503 behavior; a missing optional
Hall of Fame migration still permits the other content to load without caching
that partial result. Unconfigured browser-local demos bypass this cache.

Successful public CMS saves, deletes and publish toggles expire the data tag with
`revalidateTag(tag, { expire: 0 })`. The next public read fetches fresh data. Browser
refreshes and admin APIs retain `no-store`, so there is no second CDN/browser JSON
cache delaying edits. The existing focus/navigation refresh and mock CMS remain
unchanged. Application results, sessions, uploads and audit logs never enter the
public cache. Changes made directly in Supabase are picked up by the five-minute
background revalidation; prolonged upstream failures can retain the last successful
cached value. A failed cache invalidation is logged without changing a successful
database save into a reported failure.

The public queries select explicit fields, preserving complete article bodies,
translations, bios, filters, nested courses/achievements and attribution. Admin
queries keep their full records. If adding a new public collection field, include it in
`src/lib/data/public-selects.ts` as well as the public type/UI.

Uploads use the existing browser WebP encoder at 88% quality with high-quality
resizing: portraits up to 800px, news/achievement images up to 1600px, and hero
images up to 2560px on their longest side (1600px if encoding exceeds 4 MiB).
Images are never enlarged. Logos fitting the upload budget and all PDFs keep
their original bytes; animated WebP and already suitably sized WebP are preserved.
Oversized logos still use the resize path to retain their upload compatibility.
If conversion is unavailable or larger, the original file is
uploaded subject to the existing server limits. Transparent backgrounds are
preserved. New images use one-year storage cache headers and new UUID filenames
for every replacement; PDFs retain a one-hour TTL. Existing stored files and
pasted external image links are not modified.

Text compression remains provided by Next.js/Vercel (gzip/Brotli negotiation),
without custom compression middleware or a new dependency. The existing Vercel
request-size limit still applies to uploads; this change does not alter PDF limits
or introduce a new upload transport.

After building, run `bun run test:cache` for a production-server integration test
against an ephemeral loopback Supabase fixture. It overrides database/auth settings,
does not contact the real database, and checks cache reuse across SSR/API requests,
all CMS invalidation paths, failure recovery, private results, and upload caching.
Use a normal deployment/preview to verify Vercel-specific cache behavior and the
negotiated `Content-Encoding` header; local integration does not emulate Vercel's CDN.

## Hall of Fame

When configured, records come from the `hall_of_fame` CMS table. The bundled JSON is used only to seed the database or show an unconfigured preview. The homepage shows up to 12 featured named highlights; `/achievements#hall-of-fame` exposes all 172 source records (42 international, 130 national) with search by name, competition, medal or year and scope filters. One source record has no name and is imported as an unpublished draft. These are records, not a claim of 172 unique people: a student can appear in both source categories. Homepage highlights avoid repeating the same displayed name.

`src/lib/data/hall-of-fame.json` is the original attributed seed snapshot retrieved on 2026-09-05 from the public school Hall of Fame's `ouom.json` and `uom.json` at https://www.famhall.school11.edu.mn/. Its medal records currently extend through 2024. Names and medal facts come from that source, not sample generation. Portrait URLs follow the source site's rendered paths; failed images become initials. Years omitted by the source are explicitly labeled as unspecified. No live data synchronization is implied.

The original React implementation provides horizontal touch/trackpad and keyboard scrolling, previous/next controls, and automatic scrolling while visible. Hovering or focusing pauses motion; manual navigation pauses autoplay. A pause/resume control is available, and reduced-motion preference disables autoplay. Autoplay stops at the end rather than duplicating accessible content. Additional medals expand on demand.
