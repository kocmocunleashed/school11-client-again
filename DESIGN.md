# School 11 field notebook

Families can reach the calendar, programs, admissions and school contacts from the first screen. The school crest, Mongolian wordmark and current page indicator anchor the navigation. The campus photograph comes from the school's CMS and sits inside a paper frame on a mathematics grid.

## Colour and type

Ink (#17274B) and blue (#2449B4) carry headings and actions. Pencil yellow (#FFCD40), mint (#A8E3C7) and coral (#FFAC93) mark quick links and subjects. Golos Text is self-hosted and includes Mongolian Cyrillic. A printed photo caption, ruler and π sticker give the home page its school character.

## Page structure

The home page leads with everyday destinations and the news board. School facts, subjects, medalists, history and podcasts follow. Each inner page has a breadcrumb and an illustrated cover. Controls, body text and information cards sit on a level baseline.

## Implementation

The public theme and responsive layouts live in `src/styles/notebook.css`. Shared component structure is in `src/styles/public.css`. CMS content, image settings, page projections and the separate admin interface support both published and local preview content. The mobile menu uses a native modal dialog.
