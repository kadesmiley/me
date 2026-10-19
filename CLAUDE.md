# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Kade Smiley's personal site, `kadesmiley.github.io/me/` — a deliberately simple, pre-MySpace-style personal homepage meant to replace social media: a place for Kade (and people checking in on him) to see photos, essays, book reviews, projects, and what he's up to. It's separate from his portfolio/research site (`kadesmiley.github.io`, its own repo).

Plain hand-written HTML + one CSS file + three tiny JS files. No build step, no framework, no package manager. **Kade edits these files by hand and is learning as he goes — keep everything readable, commented, and simple. Prefer copy-paste-able blocks over clever abstractions.** Don't introduce a build tool, framework, or generator unless he asks.

## Running it

- **Preview:** VS Code's **Live Server** extension → "Go Live" (bottom bar). Auto-refreshes on save.
- Double-clicking `index.html` mostly works, but the home page's timeline won't load — browsers block `fetch()` from `file://`. Use Live Server.
- **Publish:** `git add -A`, `git commit -m "..."`, `git push`. GitHub Pages serves `main` / root as-is; `.nojekyll` turns off Jekyll so nothing is processed. Live ~1 minute after pushing.

## Paths: always relative

This is a GitHub **project** site, served under `/me/`, not at the domain root. A root-absolute path like `/css/style.css` would resolve to `kadesmiley.github.io/css/style.css` — the *portfolio* site — and break. So every link/src is relative:
- `index.html` (root): `css/style.css`, `gallery/`, `./`
- pages in subfolders: `../css/style.css`, `../gallery/`, `../`

(The portfolio repo uses root-absolute paths; don't copy that convention here.)

## Structure

```
index.html            Home: "Welcome" intro + the timeline (timeline.txt)
timeline.txt          "Incidents and Occurrences" entries — edited from phone via github.com
gallery/index.html    Instagram-style square grid; click a photo for a popup with caption
gallery/photos/       Photos (~1600px long edge, JPEG)
essays/index.html     List of essays; each links to a PDF saved in essays/
reviews/index.html    Book reviews, one box each
projects/index.html   Projects, one box each
elsewhere/index.html  "Find Me Elsewhere" — links to other profiles (portfolio, eBird, Instagram)
css/style.css         The only stylesheet
js/theme.js           Light/dark toggle
js/timeline.js        Loads timeline.txt into the home page timeline
js/gallery.js         The click-to-enlarge popup
```

Every page is one folder + `index.html` so URLs are clean (`/me/gallery/`).

**Sidebar:** each page repeats the same `<aside class="sidebar">` markup (only the `./` vs `../` prefixes and which link has `class="active"` differ). Adding/renaming a tab = edit the sidebar in all six pages.

## Theme

- Dark is the default. Each `<html>` has `data-theme="dark"`; the inline `<script>` in `<head>` swaps in a saved choice from `localStorage` before paint; `theme.js` flips it on click and saves it.
- In `style.css`, `:root` holds the **dark** values and `html[data-theme="light"]` overrides them (the reverse of the portfolio site, because dark is default). With JS off, the site is dark.
- All colors are variables at the top of `style.css`. Never hardcode a color in a rule — add or reuse a variable.
  - Kade's palette: Jet Black `#012a36`, deliberately darkened to `#00161d` for `--bg` at Kade's request (`--surface`/`--border` are tuned a step lighter from that), and `--accent` = `--sidebar-bg` `#29274c` (main accent + sidebar, with light `--sidebar-text`). `--accent-2` Deep Lilac `#7e52a0`, `--accent-3` Lilac `#d295bf`, `--accent-4` Pastel Petal `#e6bccd`. Same in both themes; used for box edges and timeline dots (Lilac).
  - `--accent-text` — links, headings, and the default box edge. Space Indigo `#29274c` is nearly invisible on the dark background, so dark mode uses Pastel Petal; light mode uses Space Indigo itself. `--star` is Lilac in dark, Deep Lilac in light.
  - `--bg`, `--surface`, `--text`, `--text-muted`, `--border`, `--star` — differ per theme.
- Shapes are square: no `border-radius` anywhere except the timeline dots.

## Components

- **`.box`** — the one content building block: square `--surface` panel with a 6px colored left edge. Color variants `.box.c2` / `.c3` / `.c4` set `--box-color` to `--accent-2/3/4`; plain `.box` uses `--accent-text`. Home timeline = plain, elsewhere links = c3, reviews = c4, projects = c3, essays = plain — just defaults to play with.
- **`.lead-word`** — an inline `<span>` at title size (the home page's "Welcome"), so a heading-sized first word shares a line with the sentence after it instead of being a separate `<h1>` block.
- **`.meta`** — small muted line under a title (date, author, rating). **`.stars`** colors ★☆ ratings.
- **Gallery** — Instagram-style: `.gallery` is `repeat(3, 1fr)` with a 4px gap (2px on phones); tiles are forced square with `aspect-ratio: 1/1` + `object-fit: cover` so differently shaped photos still make an even grid (never rely on an image's natural dimensions for a uniform grid). Each `<figure>` holds a link to the full image wrapping the thumbnail, plus a `<figcaption>` that's hidden on the grid. `gallery.js` intercepts clicks and shows the full image + caption in a single reused `<dialog class="lightbox">`; any click or Esc closes it. Without JS the link just opens the image file. **Tag filtering is on hold** (Kade felt there were too many categories) — it was `data-tags="..."` on each figure plus generated filter buttons; rebuild along those lines if it comes back.
- **Timeline ("Incidents and Occurrences")** — replaced an earlier "What I've been up to" status box (`now.txt`/`now.js`, removed), since the timeline does the same job. `timeline.js` fetches `timeline.txt` (`cache: "no-store"` so edits show up immediately), skipping blank lines and `#` comments; one `YYYY-MM-DD | text` line per entry, newest first, in file order. Each becomes an `<li>` in `ul.timeline` with a `.timeline-date` span (shown as "Oct 18, 2026"). The dot is `li::before` (round, `--accent-3`), the connecting line is `li:not(:last-child)::after`. Entries are **evenly spaced** (`padding-bottom` on each `li`) — Kade's floated idea for later is spacing them proportionally to the days between dates, which would mean setting each `li`'s padding from the date difference in `timeline.js`.

Each page's `<main>` has an HTML comment explaining how to add an entry (photo/essay/review/project) — keep those up to date if the markup changes.

## Mobile

One breakpoint, `@media (max-width: 700px)` at the bottom of `style.css`: the sidebar stops being a sticky column and becomes a block across the top with the nav links wrapping in a row.
