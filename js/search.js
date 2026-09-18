/* ==========================================================================
   Enchantiica — header search
   --------------------------------------------------------------------------
   Opens the search panel, shows instant suggestions while typing and submits
   to shop.html?q=… for the full results. The catalogue (products.js) is only
   loaded on demand on pages that don't already include it.
   ========================================================================== */
(function () {
  'use strict';

  var doc = document;
  var toggle = doc.querySelector('[data-search-toggle]');
  var panel = doc.getElementById('site-search');
  if (!toggle || !panel) return;

  var form = panel.querySelector('form');
  var input = panel.querySelector('input[type="search"]');
  var results = panel.querySelector('[data-search-results]');
  var closeBtn = panel.querySelector('[data-search-close]');
  var timer = null;
  var lastFocus = null;

  /* ---------------------------------------------------------------------- */
  /* Catalogue on demand                                                     */
  /* ---------------------------------------------------------------------- */
  var loading = null;
  function ensureCatalogue() {
    if (window.ENCHANTIICA) return Promise.resolve(window.ENCHANTIICA);
    if (!loading) {
      loading = new Promise(function (resolve, reject) {
        var script = doc.createElement('script');
        script.src = 'js/products.js';
        script.onload = function () { resolve(window.ENCHANTIICA); };
        script.onerror = reject;
        doc.head.appendChild(script);
      });
    }
    return loading;
  }

  /* ---------------------------------------------------------------------- */
  /* Open / close                                                            */
  /* ---------------------------------------------------------------------- */
  function open() {
    lastFocus = doc.activeElement;
    panel.hidden = false;
    doc.body.classList.add('search-open');
    toggle.setAttribute('aria-expanded', 'true');
    ensureCatalogue();
    requestAnimationFrame(function () { panel.classList.add('is-open'); input.focus(); });
  }
  function close() {
    panel.classList.remove('is-open');
    doc.body.classList.remove('search-open');
    toggle.setAttribute('aria-expanded', 'false');
    panel.hidden = true;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  toggle.addEventListener('click', function () { panel.hidden ? open() : close(); });
  if (closeBtn) closeBtn.addEventListener('click', close);
  doc.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !panel.hidden) { e.preventDefault(); close(); }
    /* Slash focuses search when not typing in a field */
    if (e.key === '/' && panel.hidden && !/^(INPUT|TEXTAREA|SELECT)$/.test(doc.activeElement.tagName)) { e.preventDefault(); open(); }
  });
  doc.addEventListener('click', function (e) {
    if (panel.hidden) return;
    if (panel.contains(e.target) || toggle.contains(e.target)) return;
    close();
  });

  /* ---------------------------------------------------------------------- */
  /* Suggestions                                                             */
  /* ---------------------------------------------------------------------- */
  function render(query) {
    var E = window.ENCHANTIICA;
    var q = query.trim();
    if (!q) { results.innerHTML = ''; input.removeAttribute('aria-activedescendant'); return; }
    var products = E.searchProducts(q);
    var crystals = E.searchCrystals(q);
    if (!products.length && !crystals.length) {
      results.innerHTML = '<p class="search__empty">No matches for “' + E.escapeHTML(q) + '”. Try a stone, a piece or a feeling — “amethyst”, “bracelet”, “calm”.</p>';
      return;
    }
    var html = '';
    if (products.length) {
      html += '<p class="search__heading">Products</p><ul class="search__list" role="list">' +
        products.slice(0, 6).map(function (p) {
          var range = E.priceRange(p);
          return '<li><a class="search__result" href="product.html?id=' + p.id + '">' +
            E.mediaHTML({ label: p.name, src: p.image, ratio: 'square', className: 'media--sm search__thumb' }) +
            '<span class="search__body"><span class="search__name">' + E.escapeHTML(p.name) + '</span>' +
            '<span class="search__meta">' + E.escapeHTML(p.variantCrystals ? 'Choose your stone' : E.crystalName(p.crystal)) + ' · ' + E.escapeHTML(E.CATEGORIES[p.category].subs[p.sub]) + '</span></span>' +
            '<span class="search__price">' + (range.min !== range.max ? 'From ' : '') + E.formatPrice(range.min) + '</span></a></li>';
        }).join('') + '</ul>';
      html += '<a class="search__all" href="shop.html?q=' + encodeURIComponent(q) + '">See all ' + products.length + (products.length === 1 ? ' result' : ' results') + ' for “' + E.escapeHTML(q) + '”</a>';
    }
    if (crystals.length) {
      html += '<p class="search__heading">Crystal guide</p><ul class="search__list" role="list">' +
        crystals.slice(0, 3).map(function (id) {
          var c = E.CRYSTALS[id];
          return '<li><a class="search__result search__result--guide" href="crystal-meanings.html#' + id + '">' +
            '<span class="search__body"><span class="search__name">' + E.escapeHTML(c.name) + ' — meaning &amp; benefits</span>' +
            '<span class="search__meta">' + E.escapeHTML(c.benefits[0]) + '</span></span></a></li>';
        }).join('') + '</ul>';
    }
    results.innerHTML = html;
  }

  input.addEventListener('input', function () {
    clearTimeout(timer);
    var value = input.value;
    timer = setTimeout(function () {
      ensureCatalogue().then(function () { render(value); });
    }, 120);
  });

  /* Arrow keys move between the input and the suggestions */
  panel.addEventListener('keydown', function (e) {
    var links = Array.prototype.slice.call(results.querySelectorAll('a'));
    if (!links.length) return;
    var i = links.indexOf(doc.activeElement);
    if (e.key === 'ArrowDown') { e.preventDefault(); (links[i + 1] || links[0]).focus(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); if (i <= 0) input.focus(); else links[i - 1].focus(); }
  });

  form.addEventListener('submit', function (e) {
    if (!input.value.trim()) { e.preventDefault(); input.focus(); }
  });
})();
