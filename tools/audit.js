/* ==========================================================================
   Enchantiica site audit
   --------------------------------------------------------------------------
   Loads every page at phone / tablet / desktop widths and fails on console
   errors, horizontal overflow, missing <h1>, unlabelled placeholders, broken
   links / anchors / product ids and axe-core violations; then drives the real
   UI (filters, sort, bag, variants, forms, drawers, reduced motion).

   Usage (from the repo root, with a static server on port 8080):
     npm i -D playwright axe-core && npx playwright install chromium firefox webkit
     node tools/audit.js                      # Chromium
     BROWSER=firefox node tools/audit.js      # Firefox
     BROWSER=webkit  node tools/audit.js      # WebKit (Safari engine)
     SHOTS=1 node tools/audit.js              # also writes full-page screenshots
   Env: BASE (default http://127.0.0.1:8080/), ROOT (repo root), BROWSER, SHOTS.
   axe-core is optional — the accessibility step is skipped if it isn't installed.
   ========================================================================== */
const playwright = require('playwright');
const fs = require('fs');
const path = require('path');
const BASE = process.env.BASE || 'http://127.0.0.1:8080/';
const ROOT = process.env.ROOT || path.resolve(__dirname, '..');
const BROWSER = process.env.BROWSER || 'chromium';
let AXE = null;
try { AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8'); } catch (e) { console.warn('axe-core not installed — skipping accessibility rules'); }
const PAGES = ['index.html','shop.html','crystals.html','jewellery.html','product.html?id=rose-quartz-pendant','product.html?id=amethyst-cluster','product.html?id=self-love-crystal-pack','product.html?id=nope','cart.html','about.html','contact.html','faq.html','shipping.html','returns.html','privacy.html'];
const VIEWPORTS = { mobile: { width: 375, height: 740 }, tablet: { width: 820, height: 1100 }, desktop: { width: 1366, height: 900 } };
const SHOTS = process.env.SHOTS === '1';
if (SHOTS) fs.mkdirSync(path.join(__dirname, 'shots'), { recursive: true });
const products = (() => { global.window = {}; require(path.join(ROOT, 'js/products.js')); return window.ENCHANTIICA; })();

(async () => {
  const browser = await playwright[BROWSER].launch();
  const issues = [];
  const seenLinks = new Set();

  for (const [vpName, vp] of Object.entries(VIEWPORTS)) {
    const ctx = await browser.newContext({ viewport: vp, reducedMotion: 'no-preference', ignoreHTTPSErrors: true });
    const page = await ctx.newPage();
    const consoleErrs = [];
    page.on('console', m => { if ((m.type() === 'error' || m.type() === 'warning') && !/ERR_CERT|ERR_TOO_MANY_RETRIES|ERR_FAILED|fonts\.g/.test(m.text())) consoleErrs.push(`[${m.type()}] ${m.text()}`); });
    page.on('pageerror', e => consoleErrs.push('[pageerror] ' + e.message));
    page.on('requestfailed', r => { if (!r.url().includes('fonts.g')) consoleErrs.push('[reqfail] ' + r.url()); });

    for (const p of PAGES) {
      consoleErrs.length = 0;
      await page.goto(BASE + p, { waitUntil: 'networkidle' });
      await page.waitForTimeout(400);
      const info = await page.evaluate(() => {
        const overflow = document.documentElement.scrollWidth > window.innerWidth + 1;
        // find widest element if overflow
        let widest = null;
        if (overflow) {
          for (const el of document.querySelectorAll('body *')) {
            const r = el.getBoundingClientRect();
            if (r.right > window.innerWidth + 1 && (!widest || r.right > widest.right)) widest = { right: Math.round(r.right), tag: el.tagName, cls: el.className && el.className.baseVal === undefined ? el.className : '' };
          }
        }
        const links = [...document.querySelectorAll('a[href]')].map(a => a.getAttribute('href'));
        const title = document.title;
        const h1s = document.querySelectorAll('h1').length;
        const imgsNoAlt = [...document.querySelectorAll('img:not([alt])')].length;
        const phNoLabel = [...document.querySelectorAll('.ph:not([aria-label])')].length;
        const bodyVisible = getComputedStyle(document.body).opacity;
        return { overflow, widest, links, title, h1s, imgsNoAlt, phNoLabel, bodyVisible, sw: document.documentElement.scrollWidth, iw: window.innerWidth };
      });
      if (info.overflow) issues.push(`${vpName} ${p}: horizontal overflow ${info.sw}>${info.iw} widest=${JSON.stringify(info.widest)}`);
      if (info.h1s !== 1) issues.push(`${vpName} ${p}: ${info.h1s} h1 elements`);
      if (info.imgsNoAlt) issues.push(`${vpName} ${p}: ${info.imgsNoAlt} img without alt`);
      if (info.phNoLabel) issues.push(`${vpName} ${p}: ${info.phNoLabel} placeholder without aria-label`);
      if (info.bodyVisible !== '1') issues.push(`${vpName} ${p}: body opacity ${info.bodyVisible}`);
      consoleErrs.forEach(e => issues.push(`${vpName} ${p}: ${e}`));
      info.links.forEach(l => seenLinks.add(l));

      if (vpName === 'desktop' && AXE) {
        await page.addScriptTag({ content: AXE });
        const axe = await page.evaluate(async () => {
          const r = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'] } });
          return r.violations.map(v => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.slice(0, 3).map(n => n.target.join(' ')) , count: v.nodes.length }));
        });
        axe.forEach(v => issues.push(`axe ${p}: [${v.impact}] ${v.id} — ${v.help} (${v.count}) e.g. ${v.nodes.join(' | ')}`));
      }
      if (SHOTS) {
        const name = p.replace(/[?=.]/g, '_');
        await page.screenshot({ path: path.join(__dirname, 'shots', `${vpName}-${name}.png`), fullPage: true });
      }
    }
    await ctx.close();
  }

  // ---- link check
  for (const href of seenLinks) {
    if (/^(https?:|mailto:|tel:)/.test(href)) continue;
    const [file, query] = href.split('#')[0].split('?');
    if (!file) continue; // pure hash
    if (!fs.existsSync(path.join(ROOT, file))) issues.push(`broken link: ${href}`);
    if (file === 'product.html' && query) {
      const id = new URLSearchParams(query).get('id');
      if (!products.getProduct(id)) issues.push(`unknown product link: ${href}`);
    }
  }
  // hash anchors
  for (const href of seenLinks) {
    if (!href.includes('#') || /^https?:/.test(href)) continue;
    const [file, hash] = href.split('#');
    const target = file || null;
    if (!target) continue;
    const html = fs.readFileSync(path.join(ROOT, target), 'utf8');
    if (hash && !html.includes(`id="${hash}"`)) {
      // product/shop pages have JS-rendered anchors; skip reviews on product page
      if (!(target === 'product.html' && hash === 'reviews')) issues.push(`missing anchor: ${href}`);
    }
  }

  // ---- interactions (desktop)
  const ctx = await browser.newContext({ viewport: VIEWPORTS.desktop });
  const page = await ctx.newPage();
  page.setDefaultTimeout(10000);
  const errs = [];
  page.on('pageerror', e => errs.push('[pageerror] ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED|ERR_CERT|fonts\.g/.test(m.text())) errs.push('[console] ' + m.text()); });
  let lastStep = 'start'; const step = (n) => { lastStep = n; };
  const check = (cond, msg) => { if (!cond) issues.push('interaction: ' + msg); };

  try {
  await page.goto(BASE + 'shop.html', { waitUntil: 'networkidle' });
  check((await page.locator('.card').count()) === products.products.length, 'shop shows all products');
  await page.check('#f-good-love');
  await page.waitForTimeout(200);
  const loveCount = products.products.filter(p => p.helps.includes('love')).length;
  check((await page.locator('.card').count()) === loveCount, `filter love → ${loveCount}`);
  check(page.url().includes('good=love'), 'url synced with filter');
  check((await page.locator('.chip').count()) === 1, 'chip rendered');
  await page.selectOption('#sort', 'price-desc');
  await page.waitForTimeout(150);
  const prices = (await page.locator('.card__price').allTextContents()).map(t => parseFloat(t.replace(/[^0-9.]/g, '')));
  check(prices.length > 1 && prices[0] >= prices[1] && /AED/.test(await page.locator('.card__price').first().textContent()), 'sorted desc: ' + prices.slice(0, 3).join(' ≥ '));
  await page.click('.chip button');
  await page.waitForTimeout(150);
  check((await page.locator('.card').count()) === products.products.length, 'chip removal restores list');
  check(await page.evaluate(() => document.activeElement && document.activeElement.hasAttribute('data-count')), 'chip removal moves focus to results count');
  // quick add
  const quick = page.locator('[data-add-to-cart]').first();
  await quick.click();
  await page.waitForTimeout(300);
  check(await page.locator('.toast.is-visible').count() === 1, 'toast visible after quick add');
  check((await page.locator('.cart-count').textContent()) === '1', 'badge = 1');

  // product page
  step('shop done');
  await page.goto(BASE + 'product.html?id=amethyst-cluster', { waitUntil: 'networkidle' });
  check((await page.title()).startsWith('Amethyst Cluster'), 'product title set');
  const price0 = await page.locator('[data-price]').textContent();
  await page.click('.variant >> nth=2');
  const price1 = await page.locator('[data-price]').textContent();
  check(price0 !== price1 && /AED/.test(price1), `variant price changes ${price0}→${price1}`);
  await page.click('[data-qty="1"]');
  await page.click('[data-add]');
  await page.waitForTimeout(200);
  check((await page.locator('.cart-count').textContent()) === '3', 'badge = 3 after adding 2');
  check((await page.locator('.card').count()) === 4, 'related products = 4');
  await page.click('[data-view="2"]');
  check((await page.locator('.gallery__main .ph__name').textContent()).includes('Worn'), 'gallery thumb switches main');

  // cart page
  step('product done');
  await page.goto(BASE + 'cart.html', { waitUntil: 'networkidle' });
  check((await page.locator('.cart-item').count()) === 2, 'cart shows 2 lines');
  const totalTxt = await page.locator('.summary__row--total span').last().textContent();
  check(totalTxt.includes('AED'), 'total rendered ' + totalTxt);
  await page.fill('#promo', 'welcome10');
  await page.click('.promo button');
  await page.waitForTimeout(150);
  check((await page.locator('.summary__discount').count()) === 1, 'promo applied');
  // focus retention after quantity change
  await page.focus('.cart-item >> nth=0 >> [data-qty="1"]');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(150);
  check(await page.evaluate(() => document.activeElement && document.activeElement.getAttribute('data-qty') === '1'), 'cart: focus stays on + after re-render');
  check((await page.locator('[data-cart-live]').textContent()).includes('now'), 'cart: live region announces quantity');
  check((await page.locator('.cart__continue a').count()) === 1, 'cart: continue shopping link');
  await page.click('.cart-item >> nth=0 >> [data-remove]');
  await page.waitForTimeout(150);
  check((await page.locator('.cart-item').count()) === 1, 'remove line');
  await page.click('[data-checkout]');
  check(await page.locator('.checkout-note.is-visible').count() === 1, 'checkout note');
  // free shipping text
  const ship = await page.locator('[data-shipping-text]').textContent();
  check(ship.includes('free UAE delivery'), 'shipping bar text: ' + ship);

  // category subnav
  step('cart done');
  await page.goto(BASE + 'crystals.html?sub=packs', { waitUntil: 'networkidle' });
  const packs = products.products.filter(p => p.sub === 'packs').length;
  check((await page.locator('.card').count()) === packs, 'crystals?sub=packs count');
  check((await page.locator('[data-sub-heading]').textContent()) === 'Crystal Packs', 'sub heading updated');
  check((await page.locator('.pill.is-active').textContent()).toLowerCase().includes('packs'), 'active pill');
  check((await page.locator('#f-category-crystals').count()) === 0, 'category filter hidden on category page');

  // contact form validation
  step('category done');
  await page.goto(BASE + 'contact.html', { waitUntil: 'networkidle' });
  await page.click('form[data-validate] button[type=submit]');
  check((await page.locator('.is-invalid').count()) >= 3, 'contact validation shows errors');
  await page.fill('#c-name', 'Test'); await page.fill('#c-email', 'a@b.co'); await page.selectOption('#c-topic', { index: 1 }); await page.fill('#c-message', 'Hello there, this is a test');
  await page.click('form[data-validate] button[type=submit]');
  check(await page.locator('#contact-success.is-visible').count() === 1, 'contact success');

  // newsletter
  step('contact done');
  await page.goto(BASE + 'index.html', { waitUntil: 'networkidle' });
  await page.fill('#newsletter-email', 'bad');
  await page.click('[data-newsletter] button');
  check((await page.locator('.newsletter__msg').textContent()).includes('valid'), 'newsletter invalid msg');
  await page.fill('#newsletter-email', 'ok@example.com');
  await page.click('[data-newsletter] button');
  check((await page.locator('.newsletter__msg').textContent()).includes('list'), 'newsletter success');
  check((await page.locator('[data-bestsellers] .card').count()) === 8, 'home bestsellers 8');
  const bsEyebrows = await page.locator('[data-bestsellers] .card__title').allTextContents();
  check(bsEyebrows.some(t => /Pendant|Bracelet|Earrings|Ring/.test(t)) && bsEyebrows.some(t => /Tumblestone|Set|Kit|Cluster|Wand|Heart$/.test(t)), 'bestsellers mix jewellery + crystals: ' + bsEyebrows.join(' / '));

  // page transition: click a link, expect navigation
  step('newsletter done');
  await page.click('.nav__link[href="about.html"]');
  await page.waitForURL('**/about.html');
  check(page.url().endsWith('about.html'), 'page transition navigates');
  await page.waitForLoadState('networkidle'); await page.waitForTimeout(700);
  check((await page.evaluate(() => getComputedStyle(document.body).opacity)) === '1', 'body visible after transition');

  // mobile nav + filters drawer
  step('transition done');
  const mctx = await browser.newContext({ viewport: VIEWPORTS.mobile });
  const mp = await mctx.newPage();
  mp.setDefaultTimeout(10000);
  mp.on('pageerror', e => errs.push('[m pageerror] ' + e.message));
  await mp.goto(BASE + 'index.html', { waitUntil: 'networkidle' });
  check(!(await mp.locator('.nav').isVisible()), 'mobile nav hidden initially');
  await mp.click('.burger');
  await mp.waitForTimeout(450);
  check(await mp.locator('.nav').isVisible(), 'mobile nav visible after burger');
  const navBox = await mp.locator('.nav').boundingBox();
  check(navBox && navBox.height >= 700 && navBox.x + navBox.width <= 376, 'mobile nav drawer full height: ' + JSON.stringify(navBox));
  check((await mp.getAttribute('.burger', 'aria-expanded')) === 'true', 'burger aria-expanded');
  await mp.keyboard.press('Escape');
  await mp.waitForTimeout(450);
  check(!(await mp.locator('.nav').isVisible()), 'esc closes nav');
  step('mobile nav done');
  await mp.goto(BASE + 'shop.html', { waitUntil: 'networkidle' });
  check(!(await mp.locator('.filters').isVisible()), 'filters hidden on mobile');
  step('filters toggle click');
  await mp.click('.filters-toggle');
  await mp.waitForTimeout(450);
  check(await mp.locator('.filters').isVisible(), 'filters drawer opens');
  step('filters close click');
  // focus trap: Tab from last focusable wraps inside the drawer
  await mp.evaluate(() => { const els = document.querySelectorAll('.filters input'); els[els.length - 1].focus(); });
  await mp.keyboard.press('Tab');
  check(await mp.evaluate(() => document.querySelector('.filters').contains(document.activeElement)), 'filters drawer traps focus');
  await mp.click('.filters__close');
  await mp.waitForTimeout(450);
  check(!(await mp.locator('.filters').isVisible()), 'filters drawer closes');
  step('filters done');
  // tap targets: check buttons >= 44px on mobile on product page
  await mp.goto(BASE + 'product.html?id=moonstone-ring', { waitUntil: 'networkidle' });
  // WCAG 2.5.8: targets under 24px, excluding links inline within a sentence
  const small = await mp.evaluate(() => [...document.querySelectorAll('a, button')].filter(el => { const r = el.getBoundingClientRect(); if (!(r.width > 0 && r.height > 0 && r.height < 24)) return false; const p = el.parentElement; return !(p && /^(P|LI|SPAN|DD|TD|FIGCAPTION)$/.test(p.tagName) && p.textContent.trim().length > el.textContent.trim().length + 8); }).map(el => (el.className || el.tagName) + ':' + Math.round(el.getBoundingClientRect().height)).slice(0, 12));
  if (small.length) issues.push('mobile small tap targets (<24px high): ' + small.join(', '));

  // reduced motion
  const rctx = await browser.newContext({ viewport: VIEWPORTS.desktop, reducedMotion: 'reduce' });
  const rp = await rctx.newPage();
  await rp.goto(BASE + 'index.html', { waitUntil: 'networkidle' });
  const rev = await rp.evaluate(() => [...document.querySelectorAll('[data-reveal]')].every(el => getComputedStyle(el).opacity === '1'));
  check(rev, 'reduced motion: all reveal elements visible');

  } catch (e) { issues.push('interaction CRASH after [' + lastStep + ']: ' + e.message.split('\n')[0]); }
  errs.forEach(e => issues.push('interaction: ' + e));
  await browser.close();

  console.log(issues.length ? issues.join('\n') : 'NO ISSUES');
  console.log(`\n${issues.length} issues (${BROWSER})`);
  process.exitCode = issues.length ? 1 : 0;
})().catch(e => { console.error('AUDIT CRASH', e); process.exit(1); });
