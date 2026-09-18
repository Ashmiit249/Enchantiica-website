# tools/

Optional developer tooling. Nothing in here is needed to run or deploy the site.

## audit.js — automated site check

The script used for every review pass in `REVIEW_NOTES.md`. It loads all pages
at phone, tablet and desktop widths and reports console errors, horizontal
overflow, missing headings/labels, broken links, product ids and anchors,
axe-core accessibility violations, and then drives the real UI (filters, sort,
bag, variants, forms, drawers, reduced-motion).

```bash
# one-time setup (from the repo root)
npm init -y
npm i -D playwright axe-core
npx playwright install chromium firefox webkit

# serve the site, then audit it
npx serve -l 8080 .            # or: python3 -m http.server 8080
node tools/audit.js            # Chromium
BROWSER=firefox node tools/audit.js
BROWSER=webkit  node tools/audit.js   # Safari's engine
SHOTS=1 node tools/audit.js    # also saves full-page screenshots to tools/shots/
```

Exit code is non-zero when anything is reported. `BASE` overrides the server
URL (e.g. a deployed preview), `ROOT` the folder used for link checks.

## HTML validation

```bash
npx html-validate --config tools/.htmlvalidate.json *.html
```
