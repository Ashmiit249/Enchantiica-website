# Enchantiica — crystal & crystal jewellery storefront

A complete, dependency-free, multi-page e-commerce front end for **Enchantiica**,
a Dubai-based crystal and crystal-jewellery shop
(Instagram: [@enchantiica](https://www.instagram.com/enchantiica)).

Prices are in UAE dirhams (AED), delivery copy covers Dubai / UAE / GCC /
international with cash on delivery, ring sizes are US, and the legal pages
reference UAE data-protection and consumer law.

Plain HTML, CSS and vanilla JavaScript. There is no build step: open `index.html`
in a browser, or upload the folder to any static host (Netlify, Vercel, GitHub
Pages, Cloudflare Pages, cPanel, S3…).

> Payments are **not** connected. The bag, promo codes, contact form, newsletter
> and review form all run in the browser only. The bag is saved to
> `localStorage` so it survives reloads.

---

## Running it locally

Any static server works. For example:

```bash
# Python
python3 -m http.server 8080
# or Node
npx serve .
```

Then open <http://localhost:8080>. Opening `index.html` directly from disk
(`file://`) also works; the only thing that needs the network is Google Fonts,
which falls back to system fonts if offline.

---

## File structure

```
.
├── index.html          Home — hero, collections, bestsellers, intentions, story, reviews, newsletter, Instagram strip
├── shop.html           All products — filter sidebar (category, type, price, crystal, "good for") + sort
├── crystals.html       Category page — tumblestones, rough, packs, shapes (sub-category pills)
├── jewellery.html      Category page — necklaces, bracelets, earrings, rings (sub-category pills)
├── product.html        Product template — rendered from js/products.js via ?id=<product-id>
├── cart.html           Bag — quantities, remove, promo code, free-delivery progress, demo checkout
├── about.html          Brand story, values, founder note, process, Instagram CTA
├── contact.html        Contact form (front-end validation) + shop info + @enchantiica
├── faq.html            FAQ accordions (orders, care, sizing guide, returns)
├── shipping.html       Delivery rates, processing times, tracking, customs
├── returns.html        Returns policy and how to return
├── privacy.html        Privacy policy, cookies and terms (#privacy, #cookies, #terms)
├── favicon.svg
├── css/
│   └── styles.css      Single stylesheet — design tokens at the top, sections numbered 1–16
├── js/
│   ├── products.js     ★ Product catalogue, crystal meanings, intentions, shared render helpers
│   ├── cart.js         localStorage cart store (window.Cart) — emits "cart:change"
│   ├── main.js         Header, mobile nav, page transitions, scroll reveal, toast, forms, bestsellers
│   ├── shop.js         Filtering / sorting / URL sync for shop and category pages
│   ├── product.js      Product page renderer (gallery, variants, meaning, related, reviews)
│   └── cart-page.js    Bag page renderer
├── images/             Empty — drop your photos here (see below)
├── tools/              Optional: the automated audit script used for the review passes (not needed to deploy)
├── README.md           This file
└── REVIEW_NOTES.md     Running log of the review-and-improve passes
```

Every page loads `products.js`, `cart.js` and `main.js`. Shop/category pages add
`shop.js`; the product page adds `product.js`; the bag adds `cart-page.js`.
All scripts are `defer`red and the site is readable without JavaScript
(product grids, the product page and the bag need it, and say so).

---

## Where to swap in real photos

Every image on the site is currently a **labelled placeholder block**
(`<div class="ph" role="img" aria-label="Image placeholder: …">`) sized to the
exact aspect ratio the real photo will occupy, so layouts won't shift when you
add photos.

### 1. Product photos (shop grid, product page, bag, related products)

Product images come from **one place**: `js/products.js`. Each product has an
`image` field that is currently empty:

```js
{
  id: 'rose-quartz-pendant',
  name: 'Rose Quartz Heart Pendant Necklace',
  ...
  image: ''      // ← put the photo path here
}
```

Set it to the photo's path and the placeholder is replaced everywhere
automatically:

```js
  image: 'images/products/rose-quartz-pendant.jpg'
```

Recommended: **4:5 portrait** (e.g. 1200 × 1500 px), JPEG or WebP, under
~200 KB. The `<img>` is rendered with `loading="lazy"`, `decoding="async"` and
`object-fit: cover`, so slightly different ratios are cropped rather than
stretched.

The product page gallery shows four views (Front, Detail, Worn, Packaging).
Today only the first uses `image`; the others stay as placeholders. To add
more angles, extend the `VIEWS` array and the `mediaHTML` calls in
`js/product.js` (search for `VIEWS`).

### 2. Static photos in the HTML pages

Find the placeholder block and replace the inner `<div class="ph">…</div>`
with an `<img>` that has the class `media__img`. Keep the outer
`<div class="media media--…">` wrapper — it sets the aspect ratio and crops.

Before:

```html
<div class="media media--hero media--lg">
  <div class="ph" role="img" aria-label="Image placeholder: Hero — model wearing the Rose Quartz Heart Pendant">
    …
  </div>
</div>
```

After:

```html
<div class="media media--hero media--lg">
  <img class="media__img" src="images/hero.jpg" alt="Model wearing the Rose Quartz Heart Pendant" width="1200" height="1500">
</div>
```

| Page | Placeholder (aria-label) | Ratio class | Suggested size |
|------|--------------------------|-------------|----------------|
| index.html | Hero — model wearing the Rose Quartz Heart Pendant | `media--hero` (4:5) | 1200 × 1500 |
| index.html | Crystals / Jewellery / Crystal packs / Bestsellers collection | `media--tall` (3:4) | 900 × 1200 |
| index.html | Founder at the studio wrapping an order | `media--portrait` (4:5) | 1200 × 1500 |
| index.html | Instagram post 1–6 | `media--square` (1:1) | 600 × 600 |
| crystals.html | Crystals charging on a windowsill in moonlight | `media--portrait` | 1200 × 1500 |
| jewellery.html | Close-up of gold-plated pendant and bracelets | `media--portrait` | 1200 × 1500 |
| about.html | The Enchantiica studio — crystals laid out on linen | `media--portrait` | 1200 × 1500 |
| about.html | Founder portrait | `media--round` (1:1, circular) | 600 × 600 |

Available ratio modifiers: `media--portrait` (4:5), `media--tall` (3:4),
`media--square` (1:1), `media--wide` (16:9), `media--round` (circle).
Add `media--lg` for the larger corner radius used on feature images.

### 3. Instagram strip

The six tiles on the home page all link to
`https://www.instagram.com/enchantiica`. Replace each tile's placeholder with a
square photo as above, or point individual tiles at specific posts by changing
the `href`.

---

## Editing content

* **Products, prices, variants, tags, descriptions** — `js/products.js`. Each
  product needs a unique `id` (used in URLs), `category` (`crystals` or
  `jewellery`), `sub` (one of the keys in `CATEGORIES`), `crystal` (a key in
  `CRYSTALS`), `helps` (keys in `INTENTIONS`), a `price`, and optionally
  `variants` + a `prices` map for per-variant pricing.
* **Crystal meanings** shown on product pages — the `CRYSTALS` object in the
  same file.
* **Choose-your-stone products** (Raw Stone Chunk, Crystal Tree, Crystal
  Pyramid, Crystal Tower) — give the product a `variantCrystals` map from each
  variant option to a crystal id. The product page's meaning block, eyebrow
  and the shop's crystal filter then follow the chosen stone.
* **WhatsApp number** — appears in the floating button, footer, mobile menu and
  contact page. It is written into each HTML file as a `wa.me` link
  (`https://wa.me/971555863001`) plus the display text `+971 55 586 3001`;
  a project-wide find-and-replace on both strings changes it everywhere.
* **Free-delivery threshold, delivery cost, promo codes** — top of `js/cart.js`
  (AED 250 threshold, AED 20 standard). The delivery table, cash-on-delivery
  fee and timings on `shipping.html` / `faq.html` are plain text — keep them
  in step if you change the constants.
* **Currency** — `formatPrice()` in `js/products.js` (`Intl.NumberFormat`,
  AED with the code shown as a prefix). Price bands for the shop filter are
  in `js/shop.js`.
* **Colours, fonts, spacing** — the `:root` tokens at the top of
  `css/styles.css`.
* **Header / footer / announcement bar** — repeated in every HTML file so pages
  work standalone. A project-wide find-and-replace keeps them in sync.

---

## Connecting real checkout later

The bag lives in `window.Cart` (`js/cart.js`). `Cart.read()` returns
`{ items: [{ id, variant, qty }], promo }`. When you add a payment provider,
serialise that object into the provider's checkout call from the
"Proceed to checkout" handler in `js/cart-page.js` (search for
`data-checkout`).

---

## Browser support

Flexbox, CSS Grid, custom properties, `aspect-ratio`, `IntersectionObserver`
and `<details>` — all supported in current Chrome, Safari, Firefox and Edge.
Motion respects `prefers-reduced-motion`. Verified in headless Chromium
(see `REVIEW_NOTES.md` for what was checked and how). To run the same checks
in Firefox and WebKit locally, see `tools/README.md`.
