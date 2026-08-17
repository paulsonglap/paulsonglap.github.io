# Songlap — Photography Portfolio

Static site. No build step, no framework — plain HTML, CSS, and vanilla JS.
Deploys directly to GitHub Pages from the repo root.

## Structure

```
index.html                Homepage — hero slideshow + 9 photo galleries
contact/index.html        Contact page
community/index.html      "Coming soon" page, built on the same hero
                           slideshow + glass-card shell as the other pages

css/main.css               Shared styles: tokens, header, cursor, hero, galleries, footer
css/contact.css            Contact-page-only overrides (hero card layout, muted background)

js/main.js                 All site behaviour — cursor, hero slideshow, the gallery
                            masonry layout, the scroll reveal, social links, and more
                            (each piece is a separate, commented function)

images/hero/                10 hero slideshow images (shared by all three pages)
images/gallery/<category>/  One folder per gallery, e.g. images/gallery/animal/
images/brand/                Logo files, favicons

favicon.ico, site.webmanifest, robots.txt, sitemap.xml
```

Each page is self-contained HTML with its own copy of the header/footer
markup (there are only three pages, so this is simpler and more reliable
than templating). If you change the header or footer, make the same edit
in all three files — `index.html`, `contact/index.html`,
`community/index.html`.

## How the photo galleries actually work

This is the part most likely to need editing later, so it's worth
understanding how it fits together before changing anything.

**The images are real `<figure>` elements baked into `index.html`** — one
per photo, not assembled by JavaScript. This is deliberate: it's faster to
load, works with JavaScript disabled, and is friendlier to search engines
than building the gallery markup in the browser on every visit.

**But the *layout* — where each photo lands on screen — is computed by
JavaScript, not CSS.** `initMasonryGrids()` in `js/main.js` runs once the
page loads and does the following for every `.masonry-grid` (there's one
per gallery section):

1. Reads each photo's true aspect ratio from the `width`/`height`
   attributes already on its `<img>` tag (no need to wait for the actual
   image file to download).
2. Walks the photos **in the order they appear in the HTML**, and for
   each one, places it into whichever column is currently the shortest —
   i.e. true masonry packing, the same idea Pinterest uses. A photo
   marked `gallery-item--wide` (see below) is placed across whichever
   *pair* of adjacent columns is shortest instead of a single column.
3. Sets that photo's exact pixel width, height, and position directly as
   inline styles.

This means **the order of `<figure>` blocks in the HTML directly controls
the order photos are packed into the grid** — reordering a gallery is as
simple as cutting and pasting `<figure>` blocks into a new order in the
file; nothing else needs to change. It also means column widths aren't
fixed by CSS — they're recalculated from each grid's actual on-screen
width, so the layout adapts correctly at any viewport size, including
between the named breakpoints.

Column count by viewport width (defined in `initMasonryGrids` — keep this
in sync with the equivalent breakpoints in `main.css` if you ever change
one): under 640px → 1 column, 640–1023px → 2 columns, 1024px and up → 3
columns.

### The exact markup for one photo

```html
<figure class="gallery-item" tabindex="0">
  <img src="images/gallery/green/new-photo.webp"
       alt="A plain-language description of what's actually in the shot"
       width="1800" height="1200" loading="lazy" decoding="async">
  <figcaption class="gallery-item__overlay">Photo Title</figcaption>
</figure>
```

Notes on each piece:
- **`alt`** describes the photo's actual visual content, for screen
  readers and search engines — it is never shown visually.
  **`figcaption`** is the visible title, shown on hover/focus/tap; it's
  set in Papyrus and is a separate, more evocative piece of text (see
  the existing captions for the tone — short, a little poetic, never
  just the filename).
- **`width`/`height`** must be the photo's real pixel dimensions — get
  these from the file itself (`identify photo.webp`, or any image
  inspector/editor). They're load-bearing twice over: the masonry script
  uses them to compute the photo's aspect ratio, and the browser uses
  them to reserve the right amount of space before the file finishes
  downloading.
- **`tabindex="0"`** makes the photo keyboard-focusable, so keyboard
  users (not just mouse/touch) can reach the hover-revealed caption.
- **`loading="lazy" decoding="async"`** — keep these on every gallery
  photo; they're a meaningful chunk of the site's real-world performance
  given how many images are on the homepage.

### Adding a photo

1. Drop the image file into `images/gallery/<category>/` — WebP, long
   edge around 1800px (see "Image sizing" below).
2. Copy an existing `<figure>` block in that category's `<section>` and
   update the `src`, `alt`, `width`, `height`, and caption text as shown
   above. Place it wherever in the block you want it to fall in the
   packing order (see above — order matters).

### Removing a photo

Delete its `<figure>` block and the underlying file in
`images/gallery/<category>/`. Nothing else references it.

### Rearranging photos within a gallery

Cut and paste `<figure>` blocks into the order you want. That's the
entire operation — the masonry script re-derives layout from HTML order
every time the page loads, so there's no separate ordering data to keep
in sync.

### Featuring a photo at double width

Add `gallery-item--wide` to the figure's class list:

```html
<figure class="gallery-item gallery-item--wide" tabindex="0">
```

This only takes effect at 2+ columns (tablet and desktop); on mobile
(1 column) a wide photo just renders at the normal single-column width,
since there's no second column for it to span. Used sparingly — a
handful per gallery — and works best on a genuinely wide/landscape photo
rather than a square or portrait one, since the image itself is never
cropped to fit (see below).

Currently-featured photos (10 total, roughly one per category):
Night Watch, Ember Horizon, Soft Giant, Homeward at Dusk, Forest Light,
Burning Hills, River and Tower, Crossing at Blue Hour, Terracotta Domes,
Smoke Study III.

### Adding a whole new gallery category

1. New folder in `images/gallery/<new-category>/` with its photos.
2. Copy an entire existing `<section class="gallery-section">` block in
   `index.html` (there are nine near-identical ones already) as a
   template, and update: the `id`, the heading text, the `##/09` count
   label (and bump every other section's count now that there are 10),
   and its `<figure>` blocks.
3. Add a matching entry to the `.side-nav` block near the top of
   `index.html` — copy an existing `<div class="side-nav__item">`, give
   it a new icon (simple inline SVG, matching the existing icons'
   style), and point its `data-target` and `href="#id"` at the new
   section's `id`.

No photo ever gets cropped to a forced shape — every image keeps its
real aspect ratio, however tall or wide that is. This is why the layout
can't be done in plain CSS Grid or CSS columns; both would either force
uniform cell shapes or be unable to pack variable-height items without
gaps. If you're curious why it's built this way rather than something
simpler, the comment above `initMasonryGrids` in `main.js` explains the
history (it went through a couple of iterations that had real, visible
bugs before landing here).

### Image sizing

Photos in this handoff are capped at long-edge 1800px (hero images at
2400px), re-encoded as WebP. Keep new additions in the same range — a
24MP file straight off a camera is 15–30× heavier than it needs to be at
the sizes this layout actually displays photos, and the gap only shows up
as slower loading for visitors.

## The scroll reveal animation

Each gallery section fades/blurs/zooms/slides into place as it's
scrolled into view — and reverses the same way if you scroll back up
past it. Unlike a typical CSS-transition reveal, this one is tied
directly to scroll position rather than running on a timer: `main.js`'s
`initGalleryScrollReveal()` computes, on every scroll frame, how far a
section has moved through a fixed on-screen zone and sets its
opacity/blur/transform straight from that fraction — so the animation's
speed always matches your actual scroll speed, and stopping mid-scroll
freezes it exactly where it is.

If this ever needs tuning, everything is in one place — the constants at
the top of `initGalleryScrollReveal()`:
- `MAX_BLUR`, `MAX_TRANSLATE`, `MAX_SCALE` — how blurred/offset/enlarged
  a section is at the very start of its reveal.
- `startAt` / `endAt` inside `update()` — where on screen the reveal
  begins and ends. Currently: begins the instant a section's top edge
  reaches the bottom of the viewport, completes once that edge has
  scrolled up to the vertical middle of the viewport (half a
  viewport-height of scroll distance).

## Header, footer, and the three pages

The header shows the logo (no text — it's baked into the logo image
itself) and two stacked buttons, always linking to the *other* two pages.
Homepage: "Get in Touch" → contact page, "Now-a-days..." → the community
page. Contact page: "View Work" → homepage, "Now-a-days..." → community
page. Community page: "View Work" → homepage, "Get in Touch" → contact
page. The footer shows a small icon + "SONGLAP" wordmark (no buttons),
the social icon row, and the copyright line.

`community/index.html` reuses the same hero markup as the homepage/contact
pages — full-bleed slideshow (`hero--muted`, same dimmed treatment as
contact), scrim, and a centered `.glass` card — around a single
"Coming soon…" line. No side nav (it has no in-page sections to jump to,
same as contact) and no page-specific CSS file needed; everything it uses
already lives in `main.css`. Ready to have real content dropped into that
card later without needing to touch anything else on the site.

## Header scroll effect

Once you scroll past the hero, the header gets a frosted-glass backdrop
behind it. On tablet and desktop that backdrop fades out toward the
middle of the header (blurred at the edges, clear in the center, ratio
1:1.5:1 on tablet and 1:3:1 on desktop) — this is a CSS mask on a
`::before` pseudo-element behind the header's actual content, specifically
so the logo and buttons themselves stay fully visible no matter where the
mask fades. On mobile the backdrop is uniform edge-to-edge instead (no
room for a meaningful gradient on a narrow screen). All of this lives in
the `.site-header` rules near the top of `main.css`.

## Social links — single source of truth

All five social links (Instagram, Flickr, Behance, Facebook,
Shutterstock) are defined once, as the `SOCIAL_LINKS` array near the top
of `main.js`, and rendered into every `<ul data-social-list>` found on
the page (the footer on all three pages, and the contact page's expanded
"Social Presence" list) by `renderSocialLists()`. To add, remove, or
reorder a platform, edit that one array — every place it's shown updates
automatically. Use `data-social-list="expanded"` for a list that should
show the platform name next to its icon (like the contact page), or a
bare `data-social-list` for icon-only (like the footer).

## Local preview

No server needed — open `index.html` directly in a browser, or for a
closer match to how GitHub Pages will serve it:

```
python3 -m http.server 8000
```
then visit `http://localhost:8000/`.

## Deployment

Push to the `songlap/songlap.github.io` repo's default branch — GitHub
Pages serves the root automatically for a `<user>.github.io` repo, no
config needed. `robots.txt` and `sitemap.xml` already point at
`https://songlap.github.io`, and list all three pages.

## Notable decisions made while building this

- **Video Gallery**: mentioned in early planning, but no video footage
  was ever provided, so it isn't built. Adding one later is a copy-paste
  job following the same `<section class="gallery-section">` pattern the
  photo galleries use.
- **Single dark theme**: no light mode or toggle — the reference design
  was dark-only throughout, so that's what's shipped.
- **No lightbox / click-to-enlarge** on gallery photos — never
  requested. Worth considering later if visitors will want to view
  photos larger than the grid shows them.
- **Papyrus caption font**: not a licensed web font, so it's referenced
  directly (`font-family: Papyrus, ...`) rather than loaded — it renders
  as actual Papyrus on systems that have it installed (macOS, some
  Windows Office installs) and falls back to the browser's generic
  decorative font elsewhere.
- **Community page**: the *shell* now matches the rest of the site (hero
  slideshow + glass card, same as contact) so it no longer looks like a
  bare placeholder — but the actual content is still just "Coming soon…"
  per the brief; what eventually goes in that card hasn't been decided.
