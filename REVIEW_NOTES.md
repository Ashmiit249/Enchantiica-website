# Enchantiica — review & improvement log

This file is the running record of every self-review pass on the site: what was
checked, what was found, and what changed as a result. Newest pass at the bottom.

## How each pass was run

Every pass combines an automated sweep with a manual visual review.

**Automated sweep** (Playwright + headless Chromium, `tools/audit.js` — see `tools/README.md` to run it yourself, including in Firefox and WebKit):

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

## Pass 2 — design polish, performance, accessibility, UX friction

Reviewed as two separate critiques: a **design reviewer** (alignment,
whitespace, hierarchy, "does it feel premium") and a **performance /
accessibility reviewer** (page weight, wasted work, WCAG, keyboard flow).
Contrast ratios were computed for every foreground/background pair in the
palette rather than eyeballed.

### Design polish

| # | Issue | Fix |
|---|-------|-----|
| 1 | Home bestsellers grid showed eight crystals and no jewellery — the first eight flagged products in catalogue order were all crystals. Weak first impression for a jewellery brand. | Bestsellers are now ordered by review count, giving a natural mix (pendant, bracelets, kit, tumblestone, sleep set, earrings…). |
| 2 | Collection cards: titles sat at different heights because two captions wrapped to two lines and two didn't. | Captions reserve two lines so all four titles align. Overlay gradient lightened slightly (0.72 → 0.68) so it reads as warm ink, not grey. |
| 3 | Filter sidebar group dividers were drawn as fieldset borders, which browsers interrupt at the legend — the line broke around each title. A `box-shadow` and a floated legend were both tried; each has its own legend quirks (the shadow still sits on the legend's midline; a floated legend let the first checkbox float up beside it). | Groups are now `<div role="group" aria-labelledby>` with an `<h3>` title — identical semantics for assistive tech, none of the legend rendering rules. |
| 4 | Sticky header overlapped the top of the mobile **filter** drawer, hiding the close button behind the header (taps never reached it). | Filter drawer and its overlay now sit above the header (`z-index` 110/105); verified the close button is clickable at 375 px. |
| 5 | Hover state missing on product-page "Helps with" tag links — they looked static. | Tag links get a hover state (deeper blush, ink text). |

### Performance / efficiency

| # | Issue | Fix |
|---|-------|-----|
| 6 | Requested 8 web-font files, but Jost 300 and Cormorant italic 500 are never used. | Font request trimmed to the 6 weights/styles actually used (Cormorant 400/500/600 + italic 400, Jost 400/500). |
| 7 | 10 CSS rule sets were defined but unused (`btn--ghost`, `btn--gold`, `section--ink`, `tag--gold`, `tag--outline`, `container--wide`, timeline styles). | Removed. `media--wide` kept because it is documented as an image-swap ratio. |
| 8 | Price sorting recomputed each product's variant price range inside the comparator (O(n log n) lookups). | Minimum prices are computed once per page load. |
| 9 | Page weight check: `styles.css` ≈ 12 KB gzipped, all JS ≈ 24 KB gzipped (of which the catalogue is 11 KB). No images, no third-party scripts, fonts with `display=swap`. Scroll handler is passive + rAF-throttled; reveal observer unobserves after firing; grids render with a single `innerHTML` write. | No change needed. |

### Accessibility

| # | Issue | Fix |
|---|-------|-----|
| 10 | Form-control borders (`#D9CCC5`) were 1.6:1 against white — below the 3:1 non-text contrast minimum (WCAG 1.4.11). | New `--control` token (`#96877D`, 3.4:1) for input, select, textarea, checkbox, quantity stepper, variant and pill borders. Decorative card borders stay light. |
| 11 | Placeholder text in inputs was 3.7:1. | Uses the muted text token (5.3:1). |
| 12 | Cart list re-rendered on every change, dropping keyboard focus from the +/− button the user had just activated; the whole list was also an `aria-live` region, so every change re-announced everything. | Focus is restored to the equivalent control after each render; a dedicated visually-hidden live region announces concise messages ("Quantity of X is now 2"). |
| 13 | Removing a filter chip deleted the focused element with no focus management. | Focus moves to the results count (which is itself live), so screen-reader users hear the new count. |
| 14 | Mobile filter drawer did not trap Tab, so keyboard focus could wander behind the overlay. | Shared `trapFocus()` helper now used by both the nav drawer and the filter drawer. |
| 15 | Quantity steppers and the active-filter chip row carried `aria-label` on plain `<div>`s (prohibited without a role). | Both are `role="group"`. |
| 16 | Links that open Instagram in a new tab did not say so. | Visually-hidden "(opens in a new tab)" appended to every `target="_blank"` link. |
| 17 | Tap targets under 24 px on mobile (WCAG 2.5.8): logo (22 px), breadcrumb links, "312 reviews" link, tag links, footer link lists (16 px), footer Instagram link and the drawer's secondary links (22 px). | Logo gets vertical padding; breadcrumb, rating, tag, footer and drawer links are inline-block with padding (≥ 26 px). Inline links inside sentences are exempt and unchanged. |

### UX friction

| # | Issue | Fix |
|---|-------|-----|
| 18 | Bag page with items had no way back to shopping except the header. | "Continue shopping" link under the item list. |
| 19 | Sub-category pill clicks on category pages did a full page reload. | Filter in place, URL and heading update, no reload. |
| 20 | **Mobile visual sweep:** the home testimonials used the generic 3-column grid, which is 2 columns on phones — with card padding that left ~100 px for text, so quotes wrapped one word per line. (Missed by the automated sweep: nothing overflowed, it just looked broken.) | Testimonials have their own grid: one column under 720 px, three above. |

### Verification

Automated sweep re-run after all of the above: **0 issues** — no console errors,
no overflow, 0 axe violations on every page, all links/anchors/product ids
resolve, and all scripted interactions pass, including the new pass-2 checks
(focus retained after cart re-render, live-region announcement, filter-drawer
focus trap, chip removal focus, bestsellers mix of crystals and jewellery,
24 px tap targets on mobile). Visual sweep of every page at mobile width at
successive scroll offsets followed (see Pass 3 for anything it turned up).

---

## Pass 3 — mobile sweep, spacing rhythm, page weight

**Scope:** every page captured at 375 px at successive scroll offsets (≈90
viewport-sized screenshots) and read end to end; desktop spot checks of page
heads and the footer; a fresh look at what each page loads.

### Design reviewer

| # | Issue | Fix |
|---|-------|-----|
| 1 | Pages with a page-head banner (shop, categories, bag, help pages) stacked the banner's bottom padding on top of the following section's top padding — a ~7.5 rem gap between the title and the content on desktop. | `.page-head + .section` uses a reduced top padding, so the rhythm matches the rest of the site. |
| 2 | FAQ groups were spaced as legal-policy sections (extra border plus two lots of 4 rem padding), which read as a double divider and a large empty gap on phones. | FAQ groups use their own spacing and keep an anchor scroll margin for the pill navigation. |
| 3 | Footer on phones stacked four columns vertically — two full screens of links before the copyright line. | Link lists sit in two columns from phone width (brand block spans the row), three columns on tablet, four on desktop. |

### Performance reviewer

| # | Issue | Fix |
|---|-------|-----|
| 4 | The 45 KB catalogue (`products.js`) was loaded on About, Contact, FAQ, Shipping, Returns and Privacy, where nothing reads it. | Only pages with product grids, the product page and the bag load it. The other pages load `cart.js` + `main.js` only (badge, nav, forms). |
| 5 | Re-checked: no layout thrash on scroll (single passive listener, rAF-throttled class toggle), no timers, no polling; `cart:change` is the only cross-module event; product grids render in one write; fonts use `display=swap` with preconnect. | No change needed. |

### Accessibility / UX reviewer

| # | Issue | Fix |
|---|-------|-----|
| 6 | Added an HTML validator (`html-validate`, recommended ruleset) to the toolkit. It found: unescaped `&` in several `<title>`s and one link label; `<th>` cells without `scope`; the announcement bar as a `div[role=region]` where a native element exists. | Titles are escaped by the page assembler; `&amp;` in the link; `scope="col"` on every table header; announcement bar is a `<section aria-label>`. All 12 pages now validate clean, with one deliberate exception below. |
| 7 | The validator prefers a native `<progress>` for the free-delivery bar. | Kept the ARIA `role="progressbar"` `div`: styling `<progress>` consistently needs `::-webkit-progress-*` / `::-moz-progress-bar` vendor pseudo-elements, which this project avoids. The ARIA version exposes the same value/min/max to assistive tech. |

Otherwise nothing new: the pass-2 fixes held up across the mobile sweep. Checked
specifically: FAQ pill navigation lands with the group heading clear of the
sticky header; empty-bag state offers two clear next steps; review form on
the product page is fully labelled; every "opens in a new tab" link says so.

### Verification

Automated sweep re-run: **0 issues** (15 URLs × 3 viewports, axe clean,
links/anchors clean, all interactions pass). HTML validation: clean apart from
the documented `<progress>` preference. Visual re-check of the footer (phone),
FAQ (phone) and shop/FAQ page heads (desktop) confirmed the spacing changes.

---

## Pass 4 — final design and performance critique

**Scope:** fresh automated sweep on the finished site, HTML validation, a last
desktop read of the pages not re-checked in pass 3 (jewellery category, returns),
and packaging the audit so it can be re-run outside this environment.

| # | Reviewer | Issue | Fix |
|---|----------|-------|-----|
| 1 | Design | Numbered step badges (About "How every order is made", Returns "How to start a return"): Cormorant's old-style numerals looked faint inside the 36 px circle, and on the Returns page the step titles sat ~2 rem below their badges because the generic `.prose h3` top margin leaked into the list. | Numerals set in the body face at a legible size; step headings inside `.prose` reset their top margin; badge optically centred on the title line. Verified on both pages. |
| 2 | Performance | Nothing further: the site ships no images, no third-party scripts, ~12 KB CSS and ≤ 24 KB JS (gzipped) per page, and pages without products no longer load the catalogue. | — |
| 3 | Tooling | The audit only existed in this sandbox, so the "tested in Chrome, Safari and Firefox" claim could not be reproduced by anyone else, and Firefox/WebKit could not be run here at all. | `tools/audit.js` + `tools/README.md` added: the same sweep, runnable locally with `BROWSER=firefox` or `BROWSER=webkit` via Playwright. Not part of the site build. Run end-to-end from the repo (`node tools/audit.js`, Chromium): 0 issues. |

### Verification

Automated sweep on the finished site: **0 issues**. HTML validation clean (bar
the documented `<progress>` preference). Step badges re-checked visually on
About and Returns.

---

## Pass 5 — confirmation pass

Full automated sweep (15 URLs × 3 viewports, axe, links, all interactions)
re-run on the committed site: **0 issues**. A final read-through of the
screenshots from passes 3 and 4 found nothing further worth changing, so the
review loop stops here.

## Summary of the loop

| Pass | Focus | Items fixed |
|------|-------|-------------|
| 1 | Functional & layout, every page/viewport/interaction | 15 |
| 2 | Design polish, performance, accessibility, UX friction | 20 |
| 3 | Mobile sweep, spacing rhythm, page weight, HTML validation | 7 |
| 4 | Final critique, tooling | 1 (+ tooling) |
| 5 | Confirmation | 0 |

**Known limits.** Firefox and Safari were not executed in this environment
(Chromium only); `tools/README.md` explains how to run the identical sweep in
both. Web fonts come from Google Fonts — offline, the system fallbacks
(Georgia / Helvetica) are used and the layout has been checked with them too.

---

## Localisation update — Dubai

Not a review pass, but logged here so the history is complete. The brief
initially read as a UK shop; the business is based in Dubai, so the site was
localised end to end:

* **Currency:** all 43 products repriced in UAE dirhams (rounded to natural
  retail figures, e.g. the Rose Quartz Heart Pendant is AED 175). Prices show
  as "AED 175", fils only when a discount produces them ("AED 157.50"). Shop
  price bands are now under AED 50 / 50–100 / 100–200 / over 200.
* **Delivery:** free across the UAE over AED 250 (AED 20 standard, AED 35
  Dubai express same/next day), GCC and international rates, cash on delivery
  with a AED 10 fee, UAE public holidays, Gulf Standard Time cut-off.
* **Sizing:** ring variants are US sizes 5–9 with a US / EU / UK conversion
  table in the FAQ.
* **Legal:** UAE PDPL (Federal Decree-Law 45/2021) instead of UK GDPR, UAE
  Data Office instead of the ICO, 5-year VAT record keeping, prices inclusive
  of 5% UAE VAT, UAE Consumer Protection Law (Federal Law 15/2020), governing
  law and courts of Dubai.
* **Copy:** "wrapped with love in Dubai", studio based in Dubai, delivers
  across the UAE and GCC, hours in GST (UTC+4), reviewer and testimonial
  names reflect a Dubai customer base.

Automated sweep, HTML validation and the audit's price assertions were
updated for AED and re-run: see the verification line below.
**Verification after localisation:** automated sweep 0 issues (price and
delivery assertions now check for AED and "free UAE delivery"), HTML
validation unchanged, no remaining sterling or UK references in the site
files (the UK column in the ring-size conversion table is intentional).
Prices and review scores now use lining numerals so "AED 210" no longer reads
like "2I0" in Cormorant's old-style figures.

## Content update — WhatsApp and new products

* **WhatsApp** (+971 55 586 3001) added as a `wa.me` link with a pre-filled
  greeting: floating button on every page (inside an `aside` landmark), first
  card on the contact page, footer, and the mobile menu. The toast notification
  moves above the button on phones.
* **Five new crystal products:** Raw Stone Chunk (rough), Crystal Tree, Selenite
  Charging Disc, Crystal Pyramid and Crystal Tower (shapes). Chunks, trees,
  pyramids and towers are "choose your stone" products: a `variantCrystals`
  map drives the product page's meaning block and eyebrow, and the shop's
  crystal filter matches any of the offered stones. Tumblestones already had
  their own sub-category; towers now come in six stones across three listings.
* **Fixed along the way:** the toast used `left: 50%` + `translateX(-50%)`,
  which caps a fixed element's shrink-to-fit width at half the viewport — on
  phones the message wrapped one word per line. It is now centred with
  `left/right: 0; margin-inline: auto; width: fit-content`.
* Automated sweep re-run after the changes: see the line below.

**Verification:** automated sweep after these changes: 0 issues across all pages, viewports and interactions (48 products, filters and bestsellers checks are dynamic); HTML validation unchanged.

## Feature update — dropdown menus and crystal guide

* **Navigation:** Shop, Crystals and Jewellery now open a dropdown on hover
  (desktop, `hover: hover` devices only) and on keyboard focus (`:focus-within`,
  so Tab walks into the menu links; Escape closes). The Shop menu has two
  columns: browse links and shop-by-intention links. In the mobile drawer the
  same menus become accordions with a 44 px chevron toggle (`aria-expanded`,
  `aria-controls`). A parent link is marked current when a sub-page is open.
* **Crystal guide (`crystal-meanings.html`):** one entry per stone (16), each
  with colour, chakra, meaning, four benefits, how to use, a pairing tip, a
  labelled image placeholder and a "Shop <stone> (n)" link that filters the
  shop. Rendered from the same `CRYSTALS` data the product pages use, so the two
  never disagree; the shop's crystal filter now also finds stones inside sets.
  Product pages gained the same benefits list and a link into the guide.
* Linked from the Crystals menu, footer, mobile drawer, home "shop by
  intention", the crystals category page and the FAQ.
* **Verification:** automated sweep (now 16 URLs, plus hover / keyboard / Escape / drawer-accordion checks): 0 issues. HTML validation unchanged. Fixed on the way: Escape now closes a keyboard-opened menu (a dismissed state overrides `:focus-within`), the drawer accordion needed higher-specificity overrides than the desktop positioning, and the guide tip cards were h3s directly under the h1.

## Feature update — search

* **Header search** on every page: a magnifier button opens a panel below the
  header with a search field; suggestions appear as you type (top six products
  with thumbnail, stone, type and price, plus matching crystal-guide entries),
  "See all n results" and Enter go to `shop.html?q=…`. Arrow keys move through
  suggestions, Escape and clicking outside close it, `/` opens it. The form
  works without JavaScript (a plain GET to the shop page).
* **Shop page** understands `?q=`: results keep search ranking under the
  "Featured" sort and still respect the sidebar filters; a removable "Search:
  …" chip and a search box at the top of the filters mirror the query; the
  count reads "13 products for “rose quartz”"; the empty state suggests what to
  type.
* Matching is shared (`searchProducts()` in `products.js`): tokenised, every
  word must match, name hits rank above stone/type hits above intention/
  description hits. Pages without the catalogue load it on demand when search
  opens, so the light help/legal pages stay light.
* **Verification:** automated sweep (16 URLs × 3 viewports, plus new checks for
  the search panel opening with focus, live suggestions, the crystal-guide
  suggestion, arrow-key navigation, submitting to the shop, the search chip,
  the sidebar box mirroring the query, the empty state, clearing the chip, and
  on-demand catalogue loading on a page without `products.js`): **0 issues**.
  HTML validation clean apart from the documented `<progress>` preference —
  it did catch the sidebar search form having no submit control (WCAG H32),
  now a visually-hidden submit button so Enter works for everyone.
* **Note on the test environment:** two audit runs were invalidated by a stale
  static server holding port 8080 and serving an older build (163 phantom
  issues). Test servers are now started on port 8099 and the scripts take a
  `BASE` environment variable.
