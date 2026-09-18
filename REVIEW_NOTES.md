# Enchantiica — review & improvement log

This file is the running record of every self-review pass on the site: what was
checked, what was found, and what changed as a result. Newest pass at the bottom.

## How each pass was run

Every pass combines an automated sweep with a manual visual review.

**Automated sweep** (Playwright + headless Chromium, `scratchpad/audit.js`):

* Loads all 15 URLs (12 pages plus three product variants and an invalid
  product id) at **375 px, 820 px and 1366 px** widths.
* Fails on any console error, page error or failed request; horizontal
  overflow (`scrollWidth > innerWidth`); pages without exactly one `<h1>`;
  images without `alt`; placeholders without an accessible label; and a body
  that is still hidden after the entry transition.
* Runs **axe-core 4** (WCAG 2.0/2.1 A + AA + best-practice rules) on every
  page at desktop width.
* Checks every internal link resolves to a real file, every `product.html?id=`
  link resolves to a catalogue entry, and every `#anchor` target exists.
* Drives the real UI: filter + sort + chip removal on the shop, quick add to
  bag, variant price switching, quantity stepper, gallery thumbnails, cart
  quantity / remove / promo / checkout note, category sub-navigation,
  contact-form validation, newsletter validation, page-transition navigation,
  mobile burger menu (open, focus, Escape), mobile filter drawer, tap-target
  height on mobile, and the `prefers-reduced-motion` path.

**Manual visual review**: full-page and viewport screenshots of every page at
mobile and desktop (plus tablet and a 960 px "narrow desktop" spot check),
read one by one for alignment, spacing, hierarchy, contrast and on-brand feel.

**Limits of the environment**: only Chromium is installed here, so Firefox and
Safari were not executed. The CSS deliberately uses only widely supported
features (flexbox, grid, custom properties, `aspect-ratio`, `<details>`,
`IntersectionObserver`, `backdrop-filter` with the `-webkit-` prefix and a
solid-colour fallback) and avoids vendor-specific hacks. Web fonts are loaded
from Google Fonts with system fallbacks; in this sandbox the font CDN was
intermittently blocked, so some screenshots show fallback fonts — that is the
sandbox, not the site.

---

## Pass 1 — end-to-end functional & layout check

**Scope:** every page, every viewport, every interaction listed above.

### Found & fixed

| # | Area | Issue | Fix |
|---|------|-------|-----|
| 1 | Build | Per-page scripts (`shop.js`, `product.js`, `cart-page.js`) were never injected — the footer template substituted the wrong placeholder, so the shop grid, product page and bag rendered empty. | Fixed the page assembler; verified each page now loads its script. |
| 2 | Category pages | Sub-category pills and the page heading sat outside the shop root, so the script never found them: the active pill was not highlighted and clicking a pill reloaded the page. | `shop.js` now looks them up from the document and filters in place; the heading and `<title>` update to the selected sub-category. |
| 3 | Mobile nav | Horizontal overflow on **every page** at 375 px and 820 px (scrollWidth 705 px on a 375 px screen), and the open drawer was only 128 px tall. Root cause: `backdrop-filter` on the sticky header made it the containing block for the `position: fixed` drawer. | Moved the frosted background to a `.header::before` pseudo-element. Drawer is now full-height and overflow is gone on all 45 page/viewport combinations. |
| 4 | Mobile nav | The burger button was underneath the open drawer, so there was no visible control to close it (only Escape / overlay tap). | Header actions get `position: relative; z-index` above the drawer; the burger animates to an X and closes the menu. |
| 5 | Mobile header | Logo icon was flex-shrunk to zero width; announcement bar wrapped to two lines. | `flex-shrink: 0` on the icon, smaller logo under 480 px, "Follow us" part of the announcement hidden under 560 px. |
| 6 | Product cards | "Choose options" / "Add to bag" buttons overflowed the card on 2-column mobile grids (clipped on the right). | Card footer stacks vertically under 600 px with a full-width button; slightly tighter card padding and title size. |
| 7 | Shop sidebar | Filter groups rendered with browser-default `fieldset` borders and inset legends. | Global fieldset/legend reset. |
| 8 | Shop toolbar | On mobile, "Filters" and "Sort by" wrapped onto separate lines. | Toolbar stacks count above a single Filters + Sort row; sort label visually hidden on small screens. |
| 9 | Cart (mobile) | Promo input + Apply button overflowed the summary card; 96 px placeholders were cramped. | `min-width: 0; flex: 1` on the input; smaller placeholder typography for the `media--sm` variant. |
| 10 | Product page | Breadcrumb `<nav>` and `<ol>` both carried the layout class (double margin); title was oversized for a PDP; price looked light next to it; current-page crumb wrapped awkwardly on mobile. | Single class on the `<ol>`, PDP-specific title clamp, larger/heavier price, current crumb hidden under 600 px, reduced top padding. |
| 11 | About page | Large gap between the "How it began" eyebrow and its heading (`.prose h2` top margin). | `.eyebrow + h2` resets the margin. |
| 12 | Home | Testimonial quotes were set too large for a 3-column grid, producing tall, narrow columns. | Quote size reduced to 1.25 rem. |
| 13 | Narrow desktop | At 900–1100 px the six nav links plus logo were tight. | Reduced nav gap, letter-spacing and logo size in that range (verified at 960 px: no overflow). |
| 14 | Accessibility (axe) | `aria-label` on plain `<span>` star ratings (prohibited attribute); gallery thumbnails used `role="list"` with button children (invalid); announcement bar was outside any landmark. | Stars use `role="img"`; thumbnails are a `role="group"`; announcement bar is a labelled `region`. axe now reports **0 violations** on every page. |
| 15 | Resilience | If `main.js` ever failed to load, the JS-only entry transition would leave the page invisible. | A delayed CSS keyframe reveals the page after 1.2 s regardless; removed as soon as the script marks the page ready. |

### Checked and OK

* No console or page errors on any page at any width.
* All 60+ internal links, product links and in-page anchors resolve.
* Exactly one `<h1>` per page; every placeholder has an accessible label.
* Reduced-motion: all reveal/transition styles are disabled and content is
  fully visible immediately.
* Keyboard: skip link, focus-visible rings, drawer focus trap and Escape,
  arrow keys on variant radio group, `<details>` accordions.
* Cart persists across reloads and syncs between tabs (`storage` event).

**Result of the re-run after fixes:** 0 layout, console, link or axe issues
across 15 URLs × 3 viewports; all scripted interactions pass.

---
