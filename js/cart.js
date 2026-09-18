/* ==========================================================================
   Enchantiica — cart store (localStorage, front-end only)
   --------------------------------------------------------------------------
   Exposes window.Cart with a small API. Emits a "cart:change" event on
   document whenever the cart is modified so the header badge and cart page
   can react without polling.
   ========================================================================== */
(function () {
  'use strict';

  var KEY = 'enchantiica.cart.v1';
  var FREE_SHIPPING_THRESHOLD = 50;
  var STANDARD_SHIPPING = 3.5;
  var PROMOS = { WELCOME10: 0.10, ENCHANTED15: 0.15 };

  function read() {
    try {
      var raw = localStorage.getItem(KEY);
      var data = raw ? JSON.parse(raw) : null;
      if (!data || !Array.isArray(data.items)) return { items: [], promo: null };
      return data;
    } catch (e) {
      return { items: [], promo: null };
    }
  }

  function write(state) {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) { /* storage unavailable (private mode / quota) — cart lives in memory only */ }
    document.dispatchEvent(new CustomEvent('cart:change', { detail: state }));
  }

  function lineKey(id, variant) {
    return variant ? id + '::' + variant : id;
  }

  function add(id, variant, qty) {
    var state = read();
    var key = lineKey(id, variant || '');
    var found = null;
    for (var i = 0; i < state.items.length; i++) {
      if (state.items[i].key === key) { found = state.items[i]; break; }
    }
    if (found) {
      found.qty = Math.min(99, found.qty + (qty || 1));
    } else {
      state.items.push({ key: key, id: id, variant: variant || '', qty: Math.max(1, qty || 1) });
    }
    write(state);
    return state;
  }

  function update(key, qty) {
    var state = read();
    state.items = state.items.filter(function (item) {
      if (item.key === key) {
        item.qty = Math.max(0, Math.min(99, qty));
        return item.qty > 0;
      }
      return true;
    });
    write(state);
    return state;
  }

  function remove(key) {
    var state = read();
    state.items = state.items.filter(function (item) { return item.key !== key; });
    write(state);
    return state;
  }

  function clear() {
    write({ items: [], promo: null });
  }

  function count() {
    return read().items.reduce(function (sum, item) { return sum + item.qty; }, 0);
  }

  function applyPromo(code) {
    var state = read();
    var normalised = String(code || '').trim().toUpperCase();
    if (!normalised) { state.promo = null; write(state); return { ok: false, message: 'Enter a code to apply it.' }; }
    if (!PROMOS[normalised]) { return { ok: false, message: 'That code isn’t valid. Try WELCOME10.' }; }
    state.promo = normalised;
    write(state);
    return { ok: true, message: Math.round(PROMOS[normalised] * 100) + '% off applied.' };
  }

  function removePromo() {
    var state = read();
    state.promo = null;
    write(state);
  }

  /* Totals need product data, so this takes a lookup function */
  function totals(getProduct, priceFor) {
    var state = read();
    var subtotal = 0;
    var lines = [];
    state.items.forEach(function (item) {
      var product = getProduct(item.id);
      if (!product) return;
      var unit = priceFor(product, item.variant);
      subtotal += unit * item.qty;
      lines.push({ item: item, product: product, unit: unit, total: unit * item.qty });
    });
    var discountRate = state.promo && PROMOS[state.promo] ? PROMOS[state.promo] : 0;
    var discount = Math.round(subtotal * discountRate * 100) / 100;
    var afterDiscount = subtotal - discount;
    var shipping = lines.length === 0 || afterDiscount >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING;
    return {
      lines: lines,
      subtotal: subtotal,
      promo: state.promo,
      discount: discount,
      shipping: shipping,
      total: afterDiscount + shipping,
      freeShippingRemaining: Math.max(0, FREE_SHIPPING_THRESHOLD - afterDiscount),
      freeShippingThreshold: FREE_SHIPPING_THRESHOLD
    };
  }

  /* Keep other open tabs in sync */
  window.addEventListener('storage', function (e) {
    if (e.key === KEY) {
      document.dispatchEvent(new CustomEvent('cart:change', { detail: read() }));
    }
  });

  window.Cart = {
    read: read,
    add: add,
    update: update,
    remove: remove,
    clear: clear,
    count: count,
    totals: totals,
    applyPromo: applyPromo,
    removePromo: removePromo,
    lineKey: lineKey
  };
})();
