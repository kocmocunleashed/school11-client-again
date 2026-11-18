# School 11 field notebook

Families can reach the calendar, programs, admissions and school contacts from the first screen. The school crest, Mongolian wordmark and current page indicator anchor the navigation. The campus photograph comes from the school's CMS and sits inside a paper frame on a mathematics grid.

## Colour and type

Ink (#17274B) and blue (#2449B4) carry headings and actions. Blue Lucide icons identify the family quick links. Pencil yellow (#FFCD40) highlights the headline, and mint (#A8E3C7) frames the campus print. Golos Text is self-hosted and includes Mongolian Cyrillic. A printed photo caption, ruler and π sticker give the home page its school character.

## Page structure

The home page leads with everyday destinations and the news board. School facts, subjects, medalists, history and podcasts follow. Each inner page opens with its title and a Lucide illustration. Controls, body text and information cards sit on a level baseline.

## Implementation

The public theme and responsive layouts live in `src/styles/notebook.css`. Shared component structure is in `src/styles/public.css`. CMS content, image settings, page projections and the separate admin interface support both published and local preview content. Mobile navigation keeps the section links in view beneath the school crest. The typography and copy review follows [Unslop by Damir Sokolovsky](https://github.com/heydamir/unslop).
