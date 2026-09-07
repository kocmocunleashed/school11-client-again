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

## Hall of Fame

When configured, records come from the `hall_of_fame` CMS table. The bundled JSON is used only to seed the database or show an unconfigured preview. The homepage shows up to 12 featured named highlights; `/achievements#hall-of-fame` exposes all 172 source records (42 international, 130 national) with search by name, competition, medal or year and scope filters. One source record has no name and is imported as an unpublished draft. These are records, not a claim of 172 unique people: a student can appear in both source categories. Homepage highlights avoid repeating the same displayed name.

`src/lib/data/hall-of-fame.json` is the original attributed seed snapshot retrieved on 2026-09-05 from the public school Hall of Fame's `ouom.json` and `uom.json` at https://www.famhall.school11.edu.mn/. Its medal records currently extend through 2024. Names and medal facts come from that source, not sample generation. Portrait URLs follow the source site's rendered paths; failed images become initials. Years omitted by the source are explicitly labeled as unspecified. No live data synchronization is implied.

The original React implementation provides horizontal touch/trackpad and keyboard scrolling, previous/next controls, and automatic scrolling while visible. Hovering or focusing pauses motion; manual navigation pauses autoplay. A pause/resume control is available, and reduced-motion preference disables autoplay. Autoplay stops at the end rather than duplicating accessible content. Additional medals expand on demand.
