# School 11 field notebook

Families can reach the calendar, programs, admissions and school contacts from the first screen. The school crest, Mongolian wordmark and current page indicator anchor the navigation. The campus photograph comes from the school's CMS and appears on the same squared paper as the other page headers.

## Colour and type

Public reading surfaces use warm paper (#FAF9F2) and white. Headings use ink (#17274B), actions use blue (#2449B4), and selected controls use a pale blue tint (#E9EFFC). Blue Lucide icons identify the family quick links. Page titles and outline illustrations use the same ink colour on squared paper. Golos Text is self-hosted and includes Mongolian Cyrillic. The caption identifies the city.

## Page structure

The home page leads with everyday destinations and a news board pairing one illustrated story with a dated reading list. School facts, subjects, medalists, history and podcasts follow. Each inner page opens with its title and a Lucide illustration. Controls, body text and information cards sit on a level baseline.

## Implementation

The public theme and responsive layouts live in `src/styles/notebook.css`. Shared component structure is in `src/styles/public.css`. CMS content, image settings, page projections and the separate admin interface support both published and local preview content. On phones, courses, news and admissions sit in one row beneath the crest. The labeled menu opens the full six-page directory. The typography and copy review follows [Unslop by Damir Sokolovsky](https://github.com/heydamir/unslop).
