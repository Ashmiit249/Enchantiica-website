/* ==========================================================================
   Enchantiica — product page
   --------------------------------------------------------------------------
   Renders product.html from the catalogue using ?id=<product-id>.
   ========================================================================== */
(function () {
  'use strict';

  var E = window.ENCHANTIICA;
  var app = document.getElementById('product-app');
  if (!E || !app) return;

  var id = new URLSearchParams(location.search).get('id');
  var product = id ? E.getProduct(id) : null;

  /* ---------------------------------------------------------------------- */
  /* Not found                                                               */
  /* ---------------------------------------------------------------------- */
  if (!product) {
    document.title = 'Product not found — Enchantiica';
    app.innerHTML = '<div class="container not-found">' +
      '<span class="eyebrow">Oops</span>' +
      '<h1>We couldn’t find that piece</h1>' +
      '<p>It may have sold out or the link may be out of date.</p>' +
      '<div class="btn-row" style="justify-content:center"><a class="btn" href="shop.html">Browse the shop</a>' +
      '<a class="btn btn--outline" href="index.html">Back home</a></div></div>';
    return;
  }

  var cat = E.CATEGORIES[product.category];
  var crystal = E.CRYSTALS[product.crystal];
  var selectedVariant = product.variants ? product.variants.options[0] : '';
  var qty = 1;

  document.title = product.name + ' — Enchantiica';
  var metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute('content', product.short + ' ' + product.long.slice(0, 120));

  var VIEWS = ['Front view', 'Detail', 'Worn / in situ', 'Gift packaging'];

  /* ---------------------------------------------------------------------- */
  /* Template                                                                */
  /* ---------------------------------------------------------------------- */
  function tagsHTML() {
    return product.helps.map(function (h) {
      return '<a class="tag" href="shop.html?good=' + h + '">' + E.escapeHTML(E.intentionLabel(h)) + '</a>';
    }).join('');
  }

  function variantsHTML() {
    if (!product.variants) return '';
    return '<div class="form-group">' +
      '<span class="form-label" id="variant-label">' + E.escapeHTML(product.variants.label) + ': <span data-variant-name>' + E.escapeHTML(selectedVariant) + '</span></span>' +
      '<div class="variants" role="radiogroup" aria-labelledby="variant-label">' +
      product.variants.options.map(function (opt, i) {
        return '<button type="button" class="variant" role="radio" aria-checked="' + (i === 0 ? 'true' : 'false') + '" data-variant="' + E.escapeHTML(opt) + '">' + E.escapeHTML(opt) + '</button>';
      }).join('') +
      '</div>' +
      (product.category === 'jewellery' && /ring|wrist/i.test(product.variants.label) ? '<p class="form-hint">Not sure of your size? See our <a class="link" href="faq.html#sizing">sizing guide</a>.</p>' : '') +
      '</div>';
  }

  function meaningHTML() {
    var html = '<section class="meaning" aria-labelledby="meaning-title">';
    if (product.contents) {
      html += '<div><span class="eyebrow">What’s inside</span><h2 id="meaning-title">The stones in this set</h2>' +
        '<p>' + E.escapeHTML(crystal.meaning) + '</p>' +
        '<ul class="meaning__contents">' +
        product.contents.map(function (c) {
          var s = E.CRYSTALS[c];
          return '<li><strong>' + E.escapeHTML(s.name) + '</strong><span>' + E.escapeHTML(s.meaning.split('. ')[0]) + '.</span></li>';
        }).join('') +
        '</ul></div>' +
        '<dl class="meaning__facts">' +
        '<div class="meaning__fact"><dt>How to use</dt><dd>' + E.escapeHTML(crystal.use) + '</dd></div>' +
        '<div class="meaning__fact"><dt>Care</dt><dd>Cleanse on selenite or in moonlight. Keep Selenite dry.</dd></div>' +
        '</dl>';
    } else {
      html += '<div><span class="eyebrow">Crystal meaning</span><h2 id="meaning-title">' + E.escapeHTML(crystal.name) + '</h2>' +
        '<p>' + E.escapeHTML(crystal.meaning) + '</p><p>' + E.escapeHTML(crystal.use) + '</p></div>' +
        '<dl class="meaning__facts">' +
        '<div class="meaning__fact"><dt>Colour</dt><dd>' + E.escapeHTML(crystal.colour) + '</dd></div>' +
        '<div class="meaning__fact"><dt>Chakra</dt><dd>' + E.escapeHTML(crystal.chakra) + '</dd></div>' +
        '<div class="meaning__fact"><dt>Good for</dt><dd>' + product.helps.map(E.intentionLabel).map(E.escapeHTML).join(', ') + '</dd></div>' +
        '</dl>';
    }
    return html + '</section>';
  }

  function reviewsHTML() {
    var reviews = E.reviewsFor(product);
    return '<section class="section section--tight" id="reviews" aria-labelledby="reviews-title">' +
      '<div class="section__head"><div><span class="eyebrow">Reviews</span><h2 id="reviews-title">What customers say</h2></div></div>' +
      '<div class="reviews">' +
        '<div class="reviews__summary">' +
          '<div class="reviews__score">' + product.rating.toFixed(1) + '</div>' +
          E.starsHTML(product.rating) +
          '<p>Based on ' + product.reviewCount + ' verified reviews</p>' +
        '</div>' +
        '<div>' +
          '<div data-review-list>' +
          reviews.map(function (r) {
            return '<article class="review">' +
              '<div class="review__head">' + E.starsHTML(r.rating) +
              '<span class="review__verified"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>Verified purchase</span></div>' +
              '<h3 class="review__title">' + E.escapeHTML(r.title) + '</h3>' +
              '<p class="review__body">' + E.escapeHTML(r.body) + '</p>' +
              '<p class="review__meta"><strong>' + E.escapeHTML(r.name) + '</strong></p>' +
              '</article>';
          }).join('') +
          '</div>' +
          '<div class="review-form">' +
            '<h3>Write a review</h3>' +
            '<form data-validate data-success="review-success" novalidate>' +
              '<div class="form-group"><span class="form-label" id="rating-label">Your rating</span>' +
              '<div class="rating-input" role="radiogroup" aria-labelledby="rating-label">' +
              [5, 4, 3, 2, 1].map(function (n) {
                return '<input type="radio" name="rating" id="rating-' + n + '" value="' + n + '" required><label for="rating-' + n + '" aria-label="' + n + ' star' + (n > 1 ? 's' : '') + '">★</label>';
              }).reverse().join('') +
              '</div><p class="form-error">Please choose a star rating.</p></div>' +
              '<div class="form-row">' +
                '<div class="form-group"><label class="form-label" for="review-name">Name</label><input class="form-input" id="review-name" name="name" type="text" required autocomplete="name"><p class="form-error">Please enter your name.</p></div>' +
                '<div class="form-group"><label class="form-label" for="review-email">Email (not published)</label><input class="form-input" id="review-email" name="email" type="email" required autocomplete="email"><p class="form-error">Please enter a valid email.</p></div>' +
              '</div>' +
              '<div class="form-group"><label class="form-label" for="review-title">Title</label><input class="form-input" id="review-title" name="title" type="text" required maxlength="80"><p class="form-error">Please add a short title.</p></div>' +
              '<div class="form-group"><label class="form-label" for="review-body">Your review</label><textarea class="form-textarea" id="review-body" name="body" required minlength="10"></textarea><p class="form-error">Please write at least a sentence.</p></div>' +
              '<button class="btn" type="submit">Submit review</button>' +
            '</form>' +
            '<div class="form-success" id="review-success"><h3>Thank you for your review</h3><p>We read every one. Your review will appear once it has been checked by our team.</p></div>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</section>';
  }

  function relatedHTML() {
    var related = E.products.filter(function (p) {
      return p.id !== product.id && (p.crystal === product.crystal || p.sub === product.sub);
    });
    related.sort(function (a, b) {
      var scoreA = (a.crystal === product.crystal ? 2 : 0) + (a.sub === product.sub ? 1 : 0) + (a.bestseller ? 0.5 : 0);
      var scoreB = (b.crystal === product.crystal ? 2 : 0) + (b.sub === product.sub ? 1 : 0) + (b.bestseller ? 0.5 : 0);
      return scoreB - scoreA;
    });
    related = related.slice(0, 4);
    if (!related.length) return '';
    return '<section class="section section--tight" aria-labelledby="related-title">' +
      '<div class="section__head"><div><span class="eyebrow">You may also love</span><h2 id="related-title">Related pieces</h2></div>' +
      '<a class="link-arrow" href="' + cat.href + '">All ' + cat.label.toLowerCase() + ' <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a></div>' +
      '<div class="grid grid--4">' + related.map(E.productCardHTML).join('') + '</div>' +
    '</section>';
  }

  var deliveryIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>';

  app.innerHTML =
    '<nav aria-label="Breadcrumb"><ol class="breadcrumb">' +
      '<li><a href="index.html">Home</a></li>' +
      '<li><a href="' + cat.href + '">' + E.escapeHTML(cat.label) + '</a></li>' +
      '<li><a href="' + cat.href + '?sub=' + product.sub + '">' + E.escapeHTML(cat.subs[product.sub]) + '</a></li>' +
      '<li><span aria-current="page">' + E.escapeHTML(product.name) + '</span></li>' +
    '</ol></nav>' +

    '<div class="product">' +
      '<div class="gallery">' +
        '<div class="gallery__main" data-gallery-main>' +
          E.mediaHTML({ label: product.name + ' — ' + VIEWS[0], src: product.image, ratio: 'portrait', className: 'media--lg', eager: true }) +
        '</div>' +
        '<div class="gallery__thumbs" role="group" aria-label="Product views">' +
        VIEWS.map(function (v, i) {
          return '<button type="button" class="gallery__thumb' + (i === 0 ? ' is-active' : '') + '" data-view="' + i + '" aria-label="Show ' + v.toLowerCase() + '" aria-pressed="' + (i === 0 ? 'true' : 'false') + '">' +
            E.mediaHTML({ label: v, src: i === 0 ? product.image : '', ratio: 'square', className: 'media--sm' }) + '</button>';
        }).join('') +
        '</div>' +
      '</div>' +

      '<div class="product__info">' +
        '<div>' +
          '<span class="eyebrow">' + E.escapeHTML(crystal.name) + (product.bestseller ? ' · Bestseller' : '') + '</span>' +
          '<h1 class="product__title">' + E.escapeHTML(product.name) + '</h1>' +
          '<div class="product__rating">' + E.starsHTML(product.rating) + '<a href="#reviews">' + product.reviewCount + ' reviews</a></div>' +
        '</div>' +
        '<p class="product__price" data-price>' + E.formatPrice(E.priceFor(product, selectedVariant)) + '</p>' +
        '<p class="product__short">' + E.escapeHTML(product.short) + '</p>' +
        '<div class="product__tags"><span class="product__tags-label">Helps with</span>' + tagsHTML() + '</div>' +
        variantsHTML() +
        '<div class="product__buy">' +
          '<div class="qty" role="group" aria-label="Quantity"><button type="button" data-qty="-1" aria-label="Decrease quantity">−</button>' +
          '<input type="number" id="qty" value="1" min="1" max="99" aria-label="Quantity" inputmode="numeric">' +
          '<button type="button" data-qty="1" aria-label="Increase quantity">+</button></div>' +
          '<button class="btn" type="button" data-add>Add to bag</button>' +
        '</div>' +
        '<ul class="product__delivery">' +
          '<li>' + deliveryIcon + '<span>Free delivery across the UAE on orders over AED 250 — otherwise AED 20. Cash on delivery available. <a class="link" href="shipping.html">Delivery details</a></span></li>' +
          '<li>' + deliveryIcon + '<span>Cleansed and charged before dispatch, wrapped in plastic-free packaging.</span></li>' +
          '<li>' + deliveryIcon + '<span>30-day returns on unworn items. <a class="link" href="returns.html">Returns policy</a></span></li>' +
        '</ul>' +
        '<div class="accordion">' +
          '<details open><summary>Description</summary><div class="accordion__body"><p>' + E.escapeHTML(product.long) + '</p><p>Every crystal is natural, so colour, pattern and size will vary slightly from the photos — that’s part of what makes yours yours.</p></div></details>' +
          '<details><summary>' + (product.category === 'jewellery' ? 'Materials & care' : 'Size & care') + '</summary><div class="accordion__body">' +
            (product.category === 'jewellery'
              ? '<ul><li>Genuine ' + E.escapeHTML(crystal.name) + ' with 18ct gold-plated sterling silver findings.</li><li>Remove before swimming, showering or exercising to protect the plating.</li><li>Store in the pouch provided, away from perfumes and lotions.</li><li>Cleanse on selenite or in moonlight — avoid salt water.</li></ul>'
              : '<ul><li>Sizes are approximate; each piece is unique.</li><li>Cleanse in moonlight, with sound, or on a selenite wand.</li><li>Keep Selenite, Malachite and other soft stones away from water.</li><li>Wipe with a soft, dry cloth.</li></ul>') +
          '</div></details>' +
          '<details><summary>Gifting</summary><div class="accordion__body"><p>Every order arrives in a blush gift box or cotton pouch with a printed meaning card. Add a handwritten note at checkout — we’ll never include a receipt in gift orders.</p></div></details>' +
        '</div>' +
      '</div>' +
    '</div>' +

    '<div class="section section--tight">' + meaningHTML() + '</div>' +
    relatedHTML() +
    reviewsHTML();

  /* ---------------------------------------------------------------------- */
  /* Interactions                                                            */
  /* ---------------------------------------------------------------------- */
  var priceEl = app.querySelector('[data-price]');
  var qtyInput = app.querySelector('#qty');
  var galleryMain = app.querySelector('[data-gallery-main]');

  function setVariant(v) {
    selectedVariant = v;
    app.querySelectorAll('.variant').forEach(function (b) {
      b.setAttribute('aria-checked', b.getAttribute('data-variant') === v ? 'true' : 'false');
    });
    var nameEl = app.querySelector('[data-variant-name]');
    if (nameEl) nameEl.textContent = v;
    priceEl.textContent = E.formatPrice(E.priceFor(product, v));
  }

  app.addEventListener('click', function (e) {
    var variantBtn = e.target.closest('.variant');
    if (variantBtn) { setVariant(variantBtn.getAttribute('data-variant')); variantBtn.focus(); return; }

    var qtyBtn = e.target.closest('[data-qty]');
    if (qtyBtn) {
      qty = Math.max(1, Math.min(99, (parseInt(qtyInput.value, 10) || 1) + parseInt(qtyBtn.getAttribute('data-qty'), 10)));
      qtyInput.value = qty;
      return;
    }

    var thumb = e.target.closest('[data-view]');
    if (thumb) {
      var i = parseInt(thumb.getAttribute('data-view'), 10);
      app.querySelectorAll('[data-view]').forEach(function (t) {
        var on = t === thumb;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      galleryMain.innerHTML = E.mediaHTML({ label: product.name + ' — ' + VIEWS[i], src: i === 0 ? product.image : '', ratio: 'portrait', className: 'media--lg', eager: true });
      return;
    }

    if (e.target.closest('[data-add]')) {
      qty = Math.max(1, Math.min(99, parseInt(qtyInput.value, 10) || 1));
      window.Cart.add(product.id, selectedVariant, qty);
      window.toast('<strong>' + E.escapeHTML(product.name) + '</strong>' + (selectedVariant ? ' (' + E.escapeHTML(selectedVariant) + ')' : '') + ' added to your bag', { href: 'cart.html', label: 'View bag' });
    }
  });

  /* Keyboard support for the variant radiogroup */
  app.addEventListener('keydown', function (e) {
    var variantBtn = e.target.closest('.variant');
    if (!variantBtn) return;
    var opts = product.variants.options;
    var i = opts.indexOf(selectedVariant);
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); setVariant(opts[(i + 1) % opts.length]); }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); setVariant(opts[(i - 1 + opts.length) % opts.length]); }
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      app.querySelector('.variant[aria-checked="true"]').focus();
    }
  });

  qtyInput.addEventListener('change', function () {
    qty = Math.max(1, Math.min(99, parseInt(qtyInput.value, 10) || 1));
    qtyInput.value = qty;
  });

  /* Star rating input: highlight state */
  var ratingInput = app.querySelector('.rating-input');
  if (ratingInput) {
    ratingInput.addEventListener('change', function () { ratingInput.classList.add('has-value'); });
  }

  /* Re-run shared behaviours on injected content */
  if (window.observeReveals) window.observeReveals(app);
  document.dispatchEvent(new CustomEvent('product:rendered'));
})();
