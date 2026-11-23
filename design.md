# School 11 design direction

## Intent

Bold, playful, and graceful. A contemporary Mongolian school yearbook with
confident typography, sunflower yellow, cobalt blue, and genuine school imagery.
The user's reference is inspiration for craft and consistency, not a template
to repeat across every section. Keep the expressive oversized 11, campus
postcard, occasional pink accents, rounded actions, and generous breathing room.

The reference memory card establishes a precise detail language: paper surface,
one-pixel navy outline, four-pixel solid cobalt offset shadow, yellow quote marker,
comfortable reading text, and a small yellow rule beside the attribution.
Apply that language selectively to editorial cards. Functional calendars,
accordions, forms, and navigation retain familiar shapes and behavior.

## Scope and source of truth

This file governs the public routes, admin, and loading, error, and missing-page
states. Admin uses the same palette, headings, controls, and paper surfaces. Keep
tables, forms, and status messages easy to scan. Read this file before UI changes
or reviews, and include it in every delegated design brief.
User corrections take precedence; update this file when the direction changes.

Shared tokens live in `src/styles/base.css`. Public component rules live in
`src/styles/public.css`. Admin, calendar, timeline, staff profiles, and footer
use their own stylesheets with the same tokens.
Reuse existing components before creating new ones. No new UI library is needed.

## School marks and Home

Use the supplied 1947–2027 mark in the header and beside the anniversary plan.
The header uses the short name “Нийслэлийн 11-р сургууль” to leave room for
navigation. Use the school seal as the default footer, admin, and browser mark.
The CMS can set the footer and signed-in admin logo.
Keep “Нүүр” as a text link in the public menus. The masthead and footer seal also
link home.

## Palette

| Token | Value | Role |
| --- | --- | --- |
| `--blue` | `#2149c6` | Brand blue, actions, editorial shadows |
| `--blue-deep` | `#16349b` | Hover and strong blue text |
| `--blue-soft` | `#ececff` | Lavender section background |
| `--ink` | `#19233b` | Headings, body text, strong outlines |
| `--slate` | `#55586b` | Supporting text on light backgrounds |
| `--paper` | `#faf9f5` | Reading surfaces and default page |
| `--gold` | `#ffdd2d` | Hero, selected states, small markers |
| `--pink` | `#f5a1bd` | Occasional playful illustration/paper accent |
| `--line` | `#d5d2c9` | Quiet dividers, not primary card outlines |
| `--card-shadow` | `4px 4px 0 var(--blue)` | Editorial paper depth |
| `--card-padding` | `clamp(20px, 2.5vw, 28px)` | Reading-card inset |
| `--section-space` | `clamp(52px, 7vw, 96px)` | Major section rhythm |
| `--font-reading` | `system-ui, sans-serif` | Comfortable Cyrillic paragraphs |

Use navy on yellow/pink/lavender/paper and paper or white on cobalt/navy.
Yellow is an accent or surface, not small text on light paper. Pink is a supporting
accent, never a new theme for an entire route. Status colors retain their meaning.
Use tokens rather than slightly different hand-picked versions of these colors.

## Typography and rhythm

- Roboto Condensed is the existing display, navigation, label, and action face.
  Preserve the Cyrillic font loading in `src/app/layout.tsx`.
- Readable prose uses `--font-reading`, normally 16px with 1.65 line height.
  Supporting metadata is at least 14px. Dense calendar dates may be smaller.
- The home hero remains the largest type. Inner-page titles scale from about
  44px to 80px, section headings from 34px to 60px, card titles from 22px to 28px.
  Condensed headings are bold, with close but readable tracking and balanced wraps.
- Major sections use `--section-space`. Headings have 28–40px separation from
  content. Cards use 20–28px internal space and 20–28px grid gaps.
- Text stays straight. Restrained tilt belongs to decorative postcards/stickers,
  never reading paragraphs, schedule rows, forms, or navigation.

## Eyebrows and supporting text

An eyebrow is a short label above a heading. Start with the heading. Add an
eyebrow only if it identifies something the heading leaves implicit, such as
“Хүндэт самбар” on the medalists section, or communicates a meaningful status.
Remove labels that repeat the heading, such as “Тухайн жилийн онцлох үйл явдал”
above the event title. Leave out repeated school slogans and captions such as
“Он сонгож сургуулийн түүхтэй танилцаарай.” when the controls already explain what to do.
Keep useful dates, categories, error messages, and accessible control labels.

## Component language

- **Editorial cards** — paper, navy outline, square corners, solid blue offset.
  Memories, news, podcasts, archive photographs, and selected informational panels
  share these details. Do not put a shadow on every nested element.
- **Color blocks** — use yellow/blue for key missions and calls to action,
  lavender for quiet collections, and occasional pink for a supporting accent.
  Let varied layouts and color blocks preserve the playful pacing.
- **Actions** — rounded primary/secondary buttons, minimum 44px target. Primary
  blue on light backgrounds, navy on yellow. Text links have clear hover/focus.
  Circular arrow/play controls remain circular; do not square them to match cards.
- **Information markers** — compact yellow label, number, quote marker, or short
  yellow attribution rule. Number only genuine ordered items such as the 14 plans.
- **Navigation and filters** — strong active state, readable labels, sufficient
  target size, wrapping on narrow screens. Do not style noninteractive cards as links.
- **Schedules and accordions** — quiet paper, clear dividers, yellow selected/open
  cues. Preserve all dates, descriptions, keyboard controls, and empty states.
- **Photos** — authentic school media, correct aspect ratios and honest captions.
  Keep sample memories visibly labeled; never invent testimonial identities.

## Responsive and accessible behavior

Check 1440px desktop, 768px tablet, and 390px/320px phones. Use fluid containers,
single-column reading cards on phones, and deliberate row gaps. Preserve room for
offset shadows inside the viewport. No horizontal page scrolling or clipped text.
The 14-item mobile plan can use a compact ruled list instead of 14 tall cards.
Keep controls at least 44px where practical; seven-column phone calendar dates
use the available width and retain at least 44px height.

Use a visible focus ring with light/dark separation. Maintain normal-text contrast
of at least 4.5:1. Hover only changes interactive objects. Motion is short and subtle,
with reduced-motion support. Keep native link/button/details semantics and labels.

## Agent completion gate

1. Read this file, `AGENTS.md`, relevant components, and their actual styles first.
2. Preserve content, data flows, school identity, and user-requested removals.
3. Prefer token and component edits over another layer of global overrides.
4. Inspect representative desktop/mobile renders, plus interactive changed states.
5. Run relevant checks with Bun. Report observed issues and honest review scores.
6. Keep design changes in a separate reversible commit. Baseline tag for this
   refresh is `before-design-refresh`; revert the refresh commit to undo it.

Avoid corporate dashboard blandness, uniform card grids for every section,
ornate cream/gold heritage styling, excessive pill shapes, blurred shadows,
glass effects, gratuitous decoration, and extra palette variations.
