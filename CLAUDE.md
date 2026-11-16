# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Kade Smiley's personal site, `kadesmiley.github.io/me/` — a deliberately simple, pre-MySpace-style personal homepage meant to replace social media: a place for Kade (and people checking in on him) to see photos, essays, book reviews, projects, and what he's up to. It's separate from his portfolio/research site (`kadesmiley.github.io`, its own repo).

Plain hand-written HTML + one CSS file + a few tiny JS files. No build step, no framework, no package manager. **Kade edits these files by hand and is learning as he goes — keep everything readable, commented, and simple. Prefer copy-paste-able blocks over clever abstractions.** Don't introduce a build tool, framework, or generator unless he asks.

## Running it

- **Preview:** VS Code's **Live Server** extension → "Go Live" (bottom bar). Auto-refreshes on save.
- Double-clicking `index.html` mostly works, but the home page's timeline won't load — browsers block `fetch()` from `file://`. Use Live Server.
- **Publish:** `git add -A`, `git commit -m "..."`, `git push`. GitHub Pages serves `main` / root as-is; `.nojekyll` turns off Jekyll so nothing is processed. Live ~1 minute after pushing.

## Paths: always relative

This is a GitHub **project** site, served under `/me/`, not at the domain root. A root-absolute path like `/css/style.css` would resolve to `kadesmiley.github.io/css/style.css` — the *portfolio* site — and break. So every link/src is relative:
- `index.html` (root): `css/style.css`, `media-corner/to-read/`, `./`
- one folder deep (`elsewhere/`): `../css/style.css`, `../`
- two folders deep (every room page, e.g. `media-corner/to-read/`): `../../css/style.css`, `../../coffee-table/photo-album/`, `../../`

(The portfolio repo uses root-absolute paths; don't copy that convention here.)

## Structure

The site is organized like rooms of a house: each sidebar group is a piece of furniture, and each page under it is its own folder.

```
index.html                              Home: ONLY the full-screen cabin picture matching the visitor's time of day (door → living room)
living-room/index.html                  Full-screen living room picture; each piece of furniture is a clickable spot → a room page. Not in the sidebar.
images/scenes/living-room.webp          Inside screenshot (lossless WebP, 1920×1080)
images/scenes/outside/                  18 F2 screenshots (lossless WebP, 1920×1080), named by the real time they stand for: HH-MM.webp
coffee-table/photo-album/index.html     Photo Album (was gallery/): square grid, click a photo for a popup with caption
coffee-table/photo-album/photos/        Photos (~1600px long edge, JPEG)
coffee-table/life-logbook/index.html    Life Logbook: dated events as a dot timeline, built by js/timeline.js from logbook.txt (YYYY-MM-DD | event)
media-corner/reviews/index.html         Reviews landing page — NOT in the sidebar, only reached by clicking the book on the reading table. Full-screen: living room darkened behind the real book-and-quill picture, links "Books" + "Movies & TV"
images/book-and-quill.png               Kade's book-and-quill screenshot (from Desktop/bk.JPG) with the background made transparent
images/pages/                           In-game screenshots, one per room page (lossless WebP 1920×1080): photo-album, life-logbook, notebook, projects, reviews (Book + Movie & TV + the book page), to-read, to-watch, recipes
images/pages/elsewhere/                 7 outside shots for Find Me Elsewhere, HH-MM.webp: 05-30 (tick 23500), 07-00 (1000), 12-00 (6000), 17-00 (11000), 18-00 (12000), 19-30 (13500), 20-00 (14000, moon) — the last covers the night
media-corner/books/index.html           Book reviews — boxes built by js/recipes.js                           Reads recipes.txt (Title/Serves/Time, Ingredients: + lines, Steps: + lines, Notes:) into recipe boxes
js/reviews.js from media-corner/books/reviews.txt
media-corner/movies-tv/index.html       Movie & TV reviews — built by js/reviews.js from media-corner/movies-tv/reviews.txt
media-corner/to-read/index.html         To-Read Pile: built by js/lists.js from list.txt (Title | Author per line)
media-corner/to-watch/index.html        To-Watch List: built by js/lists.js from list.txt (Title | Movie/Show per line)
kitchen/recipes/index.html              Recipes — boxes built by js/recipes.js from kitchen/recipes/recipes.txt
crafts-table/notebook/index.html        Notebook (was essays/): essays/notes, each links to a PDF saved in that folder
crafts-table/projects/index.html        Projects (crochet, Arduino, anything), one box each
elsewhere/index.html                    "Find Me Elsewhere" — links to other profiles; a has-backdrop room page whose backdrop changes with time of day
map/                                    Old, unlinked map page — not in the nav
css/style.css                           The only stylesheet
js/theme.js                             Light/dark toggle
js/timeline.js                          Builds a dot timeline from a text file (ul.timeline[data-file]) — the Life Logbook
js/gallery.js                           The photo album's click-to-enlarge popup
js/scene.js                             ?edit helper: click corners on a cabin picture to get a ready-to-paste --shape outline
js/reviews.js                           Reads a page's reviews.txt and builds the review boxes
js/lists.js                             Builds a simple list from a text file (ul.text-list[data-file]) — To-Read / To-Watch
js/nametags.js                          Floating Minecraft-style name tags from each hotspot's data-label
fonts/Monocraft.ttf                     Free Minecraft-style font (SIL OFL; license in fonts/Monocraft-LICENSE.txt) for the name tags
js/daylight.js                          On page load, sets img[data-daylight] to the shot for the visitor's time (home cabin; Find Me Elsewhere backdrop)
js/menu.js                              ☰ Menu / ✕ Close button for the see-through sidebar; starts open or closed per the button's aria-expanded
```

Every page is one folder + `index.html` so URLs are clean (`/me/media-corner/to-read/`).

**Sidebar:** each page repeats the same `<aside class="sidebar">` markup (only the `./` / `../` / `../../` prefixes, which link has `class="active"`, and which group has `open` differ). Groups are `<details><summary>` dropdowns — no JS. The group containing the current page gets the `open` attribute so it starts expanded. Sidebar order: **Inside** (→ living-room/), then groups Coffee Table, Media Corner (was Bookshelf), Crafts Table, Kitchen, then Find Me Elsewhere. Media Corner lists Book Reviews, Movie & TV Reviews, To-Read Pile, To-Watch List (the Reviews book page is deliberately left out). There is no "Home" item — the "Digital Cabin" title links outside (root). Adding/renaming a page = edit the sidebar in all twelve pages.

## Theme

- Dark is the default. Each `<html>` has `data-theme="dark"`; the inline `<script>` in `<head>` swaps in a saved choice from `localStorage` before paint; `theme.js` flips it on click and saves it.
- In `style.css`, `:root` holds the **dark** values and `html[data-theme="light"]` overrides them (the reverse of the portfolio site, because dark is default). With JS off, the site is dark.
- All colors are variables at the top of `style.css`. Never hardcode a color in a rule — add or reuse a variable.
  - Kade's palette: Jet Black `#012a36`, deliberately darkened to `#00161d` for `--bg` at Kade's request (`--surface`/`--border` are tuned a step lighter from that), and `--accent` = `--sidebar-bg` `#29274c` (main accent + sidebar, with light `--sidebar-text`). `--accent-2` Deep Lilac `#7e52a0`, `--accent-3` Lilac `#d295bf`, `--accent-4` Pastel Petal `#e6bccd`. Same in both themes; used for box edges and timeline dots (Lilac).
  - `--accent-text` — links and headings. Dark mode uses the sidebar's pale lavender text color `#e8e7f7` (Kade's choice; Space Indigo itself is nearly invisible on the dark background); light mode uses Space Indigo.
  - Default box edge and the timeline's connecting line are Deep Lilac (`--accent-2`); timeline dots are Lilac (`--accent-3`). `--star` is Lilac in dark, Deep Lilac in light.
  - `--bg`, `--surface`, `--text`, `--text-muted`, `--border`, `--star` — differ per theme.
- Shapes are square: no `border-radius` anywhere except the timeline dots.

## Components

- **`.box`** — the one content building block: square `--surface` panel with a 6px colored left edge. Color variants `.box.c2` / `.c3` / `.c4` set `--box-color` to `--accent-2/3/4`; plain `.box` uses `--accent-2` (Deep Lilac). Home timeline = plain, elsewhere links = c3, reviews = c4, projects = c3, essays = plain — just defaults to play with.
- **`.lead-word`** — an inline `<span>` at title size (the home page's "Welcome"), so a heading-sized first word shares a line with the sentence after it instead of being a separate `<h1>` block.
- **`.meta`** — small muted line under a title (date, author, rating). **`.stars`** colors ★☆ ratings.
- **Gallery** — Instagram-style: `.gallery` is `repeat(4, 1fr)` with a 4px gap (2px on phones); tiles are forced square with `aspect-ratio: 1/1` + `object-fit: cover` so differently shaped photos still make an even grid (never rely on an image's natural dimensions for a uniform grid). Each `<figure>` holds a link to the full image wrapping the thumbnail, plus a `<figcaption>` that's hidden on the grid. `gallery.js` intercepts clicks and shows the full image + caption in a single reused `<dialog class="lightbox">`; any click or Esc closes it. Without JS the link just opens the image file. **Tag filtering is on hold** (Kade felt there were too many categories) — it was `data-tags="..."` on each figure plus generated filter buttons; rebuild along those lines if it comes back.
- **Timeline → Life Logbook** — the home page's old "Incidents and Occurrences" timeline is gone; its `timeline.txt` entries moved to `coffee-table/life-logbook/logbook.txt` and `timeline.txt` was deleted. `timeline.js` now fills any `ul.timeline[data-file]` (`YYYY-MM-DD | event` per line, `#` lines skipped, **new lines at the bottom, shown newest first**). Same dot/line CSS as before (dot `li::before` `--accent-3`, line `li:not(:last-child)::after` `--accent-2`, dates as "Oct 18, 2026"). Kade's floated idea for later: spacing dots by the days between dates.

- **Scenes (the cabin pictures)** — Kade is building the cabin in Minecraft; screenshots become clickable pictures. `.scene` is a `position: relative` wrapper around an `<img>`; each `<a class="hotspot">` is absolutely positioned with `style="--x; --y; --w; --h"`, all **percentages of the picture** so it scales. Hotspots are invisible until hover/focus (outline + `--hotspot-glow` + a `<span>` label); on `hover: none` devices they show a faint outline always. `.hotspot.highlight` is the style Kade wants everywhere: no outline, no visible label (an `aria-label` instead), and it fills translucent white (`--highlight-glow`) on hover — faintly lit always on touch devices. It's sized to the **whole picture** and cut to `clip-path: var(--shape)`, a polygon of corners in **percent of the picture** (screenshot px ÷ 19.2 / ÷ 10.8); clip-path also limits clicks, so outlines can overlap their boxes freely. Kade rejected rough 4-corner outlines ("literally squares"): blocks seen from above show **six corners** (top face + two sides), so outlines must follow every visible face, with notches where something in front hides part of a block (desk in front of the crafting table, barrel in front of the stove, chair over the low shelf). They were traced from 3–4× zoom crops with real pixel coordinates printed on the grid, then checked by drawing the outlines as bright lines over the screenshot and by headless-Edge screenshots of `?edit`. **Name tags:** every hotspot with `data-label` gets a `.nametag` `<span>` (Monocraft font, white on `--nametag-bg`) inserted right after it and placed over the top-middle of its outline (from `--shape`, by `nametags.js`). Kade wants them **only on hover and completely still** — shown via `.hotspot:hover + .nametag`, `pointer-events: none` so they never steal the hover; always shown on `hover: none` devices. **Outline accuracy:** Claude's by-eye tracing from zoom crops was still not good enough for Kade; the plan is for Kade to trace them with `?edit` (magnifier lens with crosshair, corner dots, Backspace undo, Esc clear) or to paint a color mask of the screenshot that Claude converts to polygons. The front door's lower-left corner is notched because the porch bench's armrest covers it. `scene.js ?edit`: 4× magnifier with crosshair follows the mouse, each click adds a corner (dot shown), the shape previews as you go, the `--shape: polygon(...)` line is printed at the bottom; Backspace undoes, Esc clears. Home = outside of cabin (door → living room). Living room clickable things, all `.hotspot.highlight`: red book on coffee table → Photo Album, brown book on coffee table → Life Logbook, book on the crafts desk → Notebook, crafting table → Projects, **book on the reading table (media corner) → Reviews**, low shelf → To-Read Pile, **wall shelf behind the reading table → To-Watch List**, stove → Recipes. The tall bookshelf and the dresser link nowhere now — their traced outlines are kept in HTML comments in case they get pages. Kade traces/fixes the outlines with `?edit`; the Reviews outline started as a rough guess to be retraced. More rooms may come later.
- **Day/night outside** — Kade took 18 F2 screenshots from one fixed camera spot with `/time set` (tick 0 = 6:00 AM, 1000 ticks = 1 hour). Mapping (file → tick): 04-30→22500, 05-00→23000, 05-30→23500, 06-00→0, 06-30→500, 07-00→1000, 09-00→3000, 12-00→6000, 15-00→9000, 17-00→11000, 17-30→11500, 18-00→12000, then dusk/night 18-30, 19-00, 19-30, 20-00, 21-00, 00-00 — one planned dusk/night time was skipped and Kade didn't know which, so those six are a best guess from the moon (night shots look alike anyway). Stored as **lossless WebP** (Kade wants max quality; ~2 MB each vs ~4.5 MB PNG). The times live in `data-times` on the `<img>`; `daylight.js` picks the latest time ≤ now **once on load** (Kade explicitly does NOT want blending or live changes); before the first time of day it uses the last (night). Earlier attempts — 144 video frames and hourly looping clips from a 20-min recording — were dropped: video was softer, Complementary Reimagined's wind never repeats so loops showed a seam, and sunrise/sunset clips visibly rewound the light. Kade declined re-recording frozen-time clips. F2 colors were checked against the video and match; no color correction applied.

- **Full-screen layout (home + living room)** — `<body class="fullscreen">`: the cabin `.scene` sits in a full-screen `.hero` (100svh, overflow hidden). To fill any screen without misaligning hotspots, the scene is sized `max(100vw, 177.78svh)` × `max(100svh, 56.25vw)` (16:9 cover) and centered — never use `object-fit: cover` on the img, since that crops the picture but not the hotspot coordinates. The sidebar is `position: fixed`, transparent, white text with a dark `text-shadow` (`--overlay-*` vars), and starts hidden: `menu.js` (loaded right after the `<aside>` to avoid a flash) adds `menu-closed` to body; the `.menu-toggle` button and Esc toggle it. Without JS it stays open. The living room works the same, plus an `.overlay-back` "← Back" link pinned top-right (same look as the Menu button, same `history.back()` onclick as `.back-link`). Neither page has a `<main>`; the home page has no `<main>` — Kade removed the welcome text and timeline so the page is only the house.
- **`.mc-book`** (Reviews landing) — Kade wants the **real Minecraft book-and-quill screen**, not a CSS imitation ("don't make your own when it's a specific reference"). The page is `body.fullscreen` (Menu + Back like the living room): `.hero` shows `living-room.webp`, `.gui-dim` darkens it (`--gui-dim`, like Minecraft's menu dimming), and `main.book-view` centers `.mc-book`, whose background is `images/book-and-quill.png` (`aspect-ratio: 454/550`; the picture already contains "Page 1 of 1"). `container-type: size` + `cqh` units size the text to the book. Title "Reviews", then the two underlined links **centered and stacked** (Kade tried side by side first), Monocraft font, `--book-ink`, blue `--book-link-hover`. The background was removed by flood-filling dull-gray pixels in from the edges (stops at the red-brown frame), then keeping only the piece connected to the page.
- **Reviews from text files** — Kade writes reviews in plain text (Notepad / github.com on a phone), not HTML. Each review page has `<div class="review-list" data-file="reviews.txt" data-kind="book|watch">`; `reviews.js` fetches it (`cache: "no-store"`, so needs Live Server, not file://), drops `#` lines (the template/instructions at the top of each file are `#` comments), splits entries on lines of `---`, reads `Key: value` lines (books: Title, Author, Date finished, Stars; watch: Title, Type, Season, Date watched, Stars), and treats everything after `Review:` as the review (blank line = new paragraph). Stars 0–5 → ★/☆. New entries go at the **bottom** of the file; the page shows them newest first (reversed). Text is inserted with `textContent` (no HTML in reviews). Boxes: books `box c4`, movies/shows `box c3`.
- **Everything Kade adds regularly is a text file** (Notepad or github.com on a phone, no HTML): reviews (`reviews.txt`, see above), To-Read/To-Watch (`list.txt`, `Title | extra` per line, kept in file order; `lists.js` with `data-style="by"` → "Title by Author", `"paren"` → "Title (show)"), Life Logbook (`logbook.txt`), Recipes (`recipes.txt`: `---`-separated; `Ingredients:` and `Steps:` start sections of one item per line, leading `-`/`1.` stripped, steps numbered by an `<ol>`; `Notes:` = paragraphs; newest at the bottom, shown first). Each file starts with `#` instructions/template. The Crafts Table pages (Notebook = PDF essays, Projects) are still hand-written HTML for now — Kade will decide later.
- **Room-page sidebar** — on `has-backdrop` pages the sidebar is the same see-through style as the full-screen pages (a dark translucent `--overlay-panel` background, darker than the picture — white text + shadow, `--overlay-hover`), but it **starts open** and stays in the normal column beside the content. Each room page has `<button class="menu-toggle" aria-expanded="true">✕ Close</button>` before the sidebar and loads `menu.js` right after `</aside>`; `menu.js` reads `aria-expanded` to decide the starting state (full-screen pages use `"false"` → start hidden). `.has-backdrop.menu-closed .sidebar { display: none }` lets the content take the full width; `main` gets `padding-top: 4.5em` to clear the corner button. Note: browsers can cache an old `menu.js` — hard-refresh if behavior looks stale.
- **In-game backdrops (`body.has-backdrop`)** — every room page (not home/living room/elsewhere) starts with `<img class="page-backdrop" src="../../images/pages/<page>.webp" alt="">`: Kade's F2 screenshot standing at that object, `position: fixed; object-fit: cover; z-index: -2`, darkened by `body.has-backdrop::before` (`--gui-dim`, z-index -1). The h1, intro and back link directly on it use `--overlay-text` + dark text-shadow; boxes keep their surface. A real `<img>` is used rather than a CSS `url()` in a custom property (relative URLs there resolve unreliably). The Reviews book page uses `reviews.webp` behind the book instead of the living room. (A tiled / single giant crafting-table texture was tried on Projects and rejected in favor of these.) (A plain darkened book-paper background was tried on Photo Album and rejected.)
- **`.back-link`** — "← Back" at the top of every normal (non-full-screen) page. Inline `onclick` does `history.back()` when `document.referrer` is on this site; otherwise it follows its `href` (room pages → `../../living-room/`, elsewhere → `../`).

Each page's `<main>` has an HTML comment explaining how to add an entry (photo/essay/review/project) — keep those up to date if the markup changes.

## Mobile

One breakpoint, `@media (max-width: 700px)` at the bottom of `style.css`: the sidebar stops being a sticky column and becomes a block across the top with the top-level links/groups wrapping in a row; an opened group takes a full row (`li:has(details[open])`) so its pages list underneath.
