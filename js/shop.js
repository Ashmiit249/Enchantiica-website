/* ==========================================================================
   Enchantiica — shop & category listing
   --------------------------------------------------------------------------
   Drives the product grid on shop.html, crystals.html and jewellery.html.
   The root element (#shop-app) can lock a category via data-category, in
   which case the category filter is hidden and sub-category pills are shown.
   Filter state is mirrored into the URL so listings are shareable.
   ========================================================================== */
(function () {
  'use strict';

  var E = window.ENCHANTIICA;
  var app = document.getElementById('shop-app');
  if (!E || !app) return;

  var lockedCategory = app.getAttribute('data-category') || '';
  var grid = app.querySelector('[data-grid]');
  var countEl = app.querySelector('[data-count]');
  var chipsEl = app.querySelector('[data-chips]');
  var sortEl = app.querySelector('[data-sort]');
  var filtersEl = app.querySelector('.filters');
  var subnavEl = document.querySelector('[data-subnav]');
  var toggleBtn = app.querySelector('.filters-toggle');
  var closeBtn = app.querySelector('.filters__close');
  var overlay = app.querySelector('.filters-overlay');

  var PRICE_BANDS = [
    { id: 'under-10', label: 'Under £10', min: 0, max: 9.99 },
    { id: '10-25', label: '£10 – £25', min: 10, max: 25 },
    { id: '25-50', label: '£25 – £50', min: 25.01, max: 50 },
    { id: 'over-50', label: 'Over £50', min: 50.01, max: Infinity }
  ];

  var state = { category: [], sub: [], crystal: [], good: [], price: [], sort: 'featured' };

  /* ---------------------------------------------------------------------- */
  /* URL <-> state                                                           */
  /* ---------------------------------------------------------------------- */
  function readURL() {
    var params = new URLSearchParams(location.search);
    ['category', 'sub', 'crystal', 'good', 'price'].forEach(function (k) {
      var v = params.get(k);
      state[k] = v ? v.split(',').filter(Boolean) : [];
    });
    if (lockedCategory) state.category = [lockedCategory];
    state.sort = params.get('sort') || 'featured';
  }

  function writeURL() {
    var params = new URLSearchParams();
    ['category', 'sub', 'crystal', 'good', 'price'].forEach(function (k) {
      if (k === 'category' && lockedCategory) return;
      if (state[k].length) params.set(k, state[k].join(','));
    });
    if (state.sort !== 'featured') params.set('sort', state.sort);
    var qs = params.toString();
    history.replaceState(null, '', location.pathname + (qs ? '?' + qs : ''));
  }

  /* ---------------------------------------------------------------------- */
  /* Build filter UI                                                         */
  /* ---------------------------------------------------------------------- */
  var pool = E.products.filter(function (p) { return !lockedCategory || p.category === lockedCategory; });
  var minPrice = {};
  pool.forEach(function (p) { minPrice[p.id] = E.priceRange(p).min; });

  function countBy(key, value) {
    return pool.filter(function (p) {
      return key === 'good' ? p.helps.indexOf(value) !== -1 : p[key] === value;
    }).length;
  }

  function checkboxHTML(group, value, label, count) {
    var id = 'f-' + group + '-' + value;
    return '<label class="checkbox" for="' + id + '">' +
      '<input type="checkbox" id="' + id + '" data-filter="' + group + '" value="' + value + '">' +
      '<span>' + E.escapeHTML(label) + '</span>' +
      (count != null ? '<span class="checkbox__count">' + count + '</span>' : '') +
      '</label>';
  }

  function buildFilters() {
    var html = '';

    function open(title) {
      var id = 'fg-' + title.toLowerCase().replace(/[^a-z]+/g, '-');
      return '<div class="filters__group" role="group" aria-labelledby="' + id + '"><h3 class="filters__title" id="' + id + '">' + title + '</h3>';
    }

    if (!lockedCategory) {
      html += open('Category');
      Object.keys(E.CATEGORIES).forEach(function (c) {
        html += checkboxHTML('category', c, E.CATEGORIES[c].label, countBy('category', c));
      });
      html += '</div>';
    }

    html += open('Type');
    Object.keys(E.CATEGORIES).forEach(function (c) {
      if (lockedCategory && c !== lockedCategory) return;
      Object.keys(E.CATEGORIES[c].subs).forEach(function (s) {
        html += checkboxHTML('sub', s, E.CATEGORIES[c].subs[s], countBy('sub', s));
      });
    });
    html += '</div>';

    html += open('Price');
    PRICE_BANDS.forEach(function (b) { html += checkboxHTML('price', b.id, b.label, null); });
    html += '</div>';

    html += open('Crystal');
    var crystalsUsed = {};
    pool.forEach(function (p) { crystalsUsed[p.crystal] = true; });
    Object.keys(E.CRYSTALS).forEach(function (c) {
      if (!crystalsUsed[c]) return;
      html += checkboxHTML('crystal', c, E.CRYSTALS[c].name, countBy('crystal', c));
    });
    html += '</div>';

    html += open('Good for');
    Object.keys(E.INTENTIONS).forEach(function (i) {
      var n = countBy('good', i);
      if (n) html += checkboxHTML('good', i, E.INTENTIONS[i], n);
    });
    html += '</div>';

    filtersEl.querySelector('[data-filter-groups]').innerHTML = html;
  }

  function buildSubnav() {
    if (!subnavEl || !lockedCategory) return;
    var subs = E.CATEGORIES[lockedCategory].subs;
    var html = '<a class="pill" href="' + location.pathname + '" data-sub="">All ' + E.CATEGORIES[lockedCategory].label + '</a>';
    Object.keys(subs).forEach(function (s) {
      html += '<a class="pill" href="?sub=' + s + '" data-sub="' + s + '">' + E.escapeHTML(subs[s]) + '</a>';
    });
    subnavEl.innerHTML = html;
  }

  function syncUI() {
    filtersEl.querySelectorAll('[data-filter]').forEach(function (cb) {
      cb.checked = state[cb.getAttribute('data-filter')].indexOf(cb.value) !== -1;
    });
    if (sortEl) sortEl.value = state.sort;
    if (subnavEl) {
      var activeSub = state.sub.length === 1 ? state.sub[0] : '';
      subnavEl.querySelectorAll('[data-sub]').forEach(function (pill) {
        var isActive = pill.getAttribute('data-sub') === activeSub && !(state.sub.length > 1);
        pill.classList.toggle('is-active', isActive);
        if (isActive) pill.setAttribute('aria-current', 'true'); else pill.removeAttribute('aria-current');
      });
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Filtering + sorting                                                     */
  /* ---------------------------------------------------------------------- */
  function matchesPrice(p) {
    if (!state.price.length) return true;
    var range = E.priceRange(p);
    return state.price.some(function (id) {
      var band = PRICE_BANDS.filter(function (b) { return b.id === id; })[0];
      return band && range.min <= band.max && range.max >= band.min;
    });
  }

  function apply() {
    var list = pool.filter(function (p) {
      if (state.category.length && state.category.indexOf(p.category) === -1) return false;
      if (state.sub.length && state.sub.indexOf(p.sub) === -1) return false;
      if (state.crystal.length && state.crystal.indexOf(p.crystal) === -1) return false;
      if (state.good.length && !state.good.some(function (g) { return p.helps.indexOf(g) !== -1; })) return false;
      return matchesPrice(p);
    });

    var sorters = {
      featured: function (a, b) { return (b.bestseller - a.bestseller) || (b.reviewCount - a.reviewCount); },
      'price-asc': function (a, b) { return minPrice[a.id] - minPrice[b.id]; },
      'price-desc': function (a, b) { return minPrice[b.id] - minPrice[a.id]; },
      rating: function (a, b) { return (b.rating - a.rating) || (b.reviewCount - a.reviewCount); },
      name: function (a, b) { return a.name.localeCompare(b.name); }
    };
    list.sort(sorters[state.sort] || sorters.featured);
    return list;
  }

  function render() {
    var list = apply();
    if (!list.length) {
      grid.innerHTML = '<div class="shop__empty"><h3>Nothing matches those filters</h3>' +
        '<p>Try removing a filter or two — or browse everything.</p>' +
        '<button class="btn btn--outline btn--small" type="button" data-clear>Clear filters</button></div>';
    } else {
      grid.innerHTML = list.map(E.productCardHTML).join('');
    }
    if (countEl) countEl.textContent = list.length + (list.length === 1 ? ' product' : ' products');
    renderChips();
    if (window.observeReveals) window.observeReveals(grid);
  }

  function chipLabel(group, value) {
    if (group === 'category') return E.CATEGORIES[value] ? E.CATEGORIES[value].label : value;
    if (group === 'sub') {
      for (var c in E.CATEGORIES) { if (E.CATEGORIES[c].subs[value]) return E.CATEGORIES[c].subs[value]; }
      return value;
    }
    if (group === 'crystal') return E.crystalName(value);
    if (group === 'good') return E.intentionLabel(value);
    if (group === 'price') { var b = PRICE_BANDS.filter(function (x) { return x.id === value; })[0]; return b ? b.label : value; }
    return value;
  }

  function renderChips() {
    if (!chipsEl) return;
    var html = '';
    ['category', 'sub', 'crystal', 'good', 'price'].forEach(function (group) {
      if (group === 'category' && lockedCategory) return;
      state[group].forEach(function (value) {
        html += '<span class="chip">' + E.escapeHTML(chipLabel(group, value)) +
          '<button type="button" data-remove-filter="' + group + '" data-value="' + E.escapeHTML(value) + '" aria-label="Remove ' + E.escapeHTML(chipLabel(group, value)) + ' filter">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></span>';
      });
    });
    if (html) {
      html += '<button class="filters__clear" type="button" data-clear>Clear all</button>';
    }
    chipsEl.innerHTML = html;
  }

  /* After a chip or "clear" removes itself, move focus to the live results count */
  function focusResults() {
    if (!countEl) return;
    countEl.setAttribute('tabindex', '-1');
    countEl.focus({ preventScroll: true });
  }

  function hasActiveFilters() {
    return ['sub', 'crystal', 'good', 'price'].some(function (k) { return state[k].length; }) || (!lockedCategory && state.category.length);
  }

  /* ---------------------------------------------------------------------- */
  /* Events                                                                  */
  /* ---------------------------------------------------------------------- */
  filtersEl.addEventListener('change', function (e) {
    var cb = e.target.closest('[data-filter]');
    if (!cb) return;
    var group = cb.getAttribute('data-filter');
    var idx = state[group].indexOf(cb.value);
    if (cb.checked && idx === -1) state[group].push(cb.value);
    if (!cb.checked && idx !== -1) state[group].splice(idx, 1);
    writeURL(); syncUI(); render(); updateHeading();
  });

  app.addEventListener('click', function (e) {
    var remove = e.target.closest('[data-remove-filter]');
    if (remove) {
      var group = remove.getAttribute('data-remove-filter');
      var idx = state[group].indexOf(remove.getAttribute('data-value'));
      if (idx !== -1) state[group].splice(idx, 1);
      writeURL(); syncUI(); render(); updateHeading(); focusResults();
      return;
    }
    if (e.target.closest('[data-clear]')) {
      ['sub', 'crystal', 'good', 'price'].forEach(function (k) { state[k] = []; });
      if (!lockedCategory) state.category = [];
      writeURL(); syncUI(); render(); updateHeading(); focusResults();
      return;
    }
  });

  /* Sub-category pills (category pages) — filter in place, no reload */
  if (subnavEl) {
    subnavEl.addEventListener('click', function (e) {
      var pill = e.target.closest('[data-sub]');
      if (!pill) return;
      e.preventDefault();
      var sub = pill.getAttribute('data-sub');
      state.sub = sub ? [sub] : [];
      writeURL(); syncUI(); render(); updateHeading();
    });
  }

  if (sortEl) {
    sortEl.addEventListener('change', function () {
      state.sort = sortEl.value;
      writeURL(); render();
    });
  }

  /* Mobile filter drawer */
  function openFilters() {
    document.body.classList.add('filters-open');
    toggleBtn.setAttribute('aria-expanded', 'true');
    var first = filtersEl.querySelector('input, button');
    if (first) setTimeout(function () { first.focus(); }, 300);
  }
  function closeFilters() {
    document.body.classList.remove('filters-open');
    toggleBtn.setAttribute('aria-expanded', 'false');
    toggleBtn.focus();
  }
  if (toggleBtn) toggleBtn.addEventListener('click', openFilters);
  if (closeBtn) closeBtn.addEventListener('click', closeFilters);
  if (overlay) overlay.addEventListener('click', closeFilters);
  document.addEventListener('keydown', function (e) {
    if (!document.body.classList.contains('filters-open')) return;
    if (e.key === 'Escape') closeFilters();
    if (e.key === 'Tab' && window.trapFocus) window.trapFocus(e, filtersEl);
  });
  window.matchMedia('(min-width: 900px)').addEventListener('change', function (e) {
    if (e.matches && document.body.classList.contains('filters-open')) closeFilters();
  });

  /* ---------------------------------------------------------------------- */
  /* Init                                                                    */
  /* ---------------------------------------------------------------------- */
  readURL();
  buildFilters();
  buildSubnav();
  syncUI();
  render();

  /* Page heading reflects a single selected sub-category on category pages */
  var heading = document.querySelector('[data-sub-heading]');
  var headingDefault = heading ? heading.textContent : '';
  function updateHeading() {
    if (!heading || !lockedCategory) return;
    var label = state.sub.length === 1 ? E.CATEGORIES[lockedCategory].subs[state.sub[0]] : null;
    heading.textContent = label || headingDefault;
    document.title = (label || headingDefault) + ' — Enchantiica';
  }
  updateHeading();
})();
