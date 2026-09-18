/* ==========================================================================
   Enchantiica — cart page
   ========================================================================== */
(function () {
  'use strict';

  var E = window.ENCHANTIICA;
  var app = document.getElementById('cart-app');
  if (!E || !app || !window.Cart) return;

  var itemsEl = app.querySelector('[data-cart-items]');
  var summaryEl = app.querySelector('[data-cart-summary]');
  var promoInput = app.querySelector('[data-promo-input]');
  var promoMsg = app.querySelector('[data-promo-msg]');
  var liveEl = app.querySelector('[data-cart-live]');

  function announce(msg) { if (liveEl) liveEl.textContent = msg; }

  /* Remember which control had focus so re-rendering the list doesn't drop it */
  function focusDescriptor() {
    var el = document.activeElement;
    if (!el || !itemsEl.contains(el)) return null;
    var item = el.closest('.cart-item');
    if (!item) return null;
    return { key: item.getAttribute('data-key'), sel: el.hasAttribute('data-qty') ? '[data-qty="' + el.getAttribute('data-qty') + '"]' : el.hasAttribute('data-qty-input') ? '[data-qty-input]' : '[data-remove]' };
  }
  function restoreFocus(d) {
    if (!d) return;
    var item = itemsEl.querySelector('.cart-item[data-key="' + d.key.replace(/"/g, '\\"') + '"]');
    var target = item ? item.querySelector(d.sel) : itemsEl.querySelector('.cart-item [data-qty="1"], .cart-empty a');
    if (target) target.focus({ preventScroll: true });
  }

  function render() {
    var focus = focusDescriptor();
    var t = window.Cart.totals(E.getProduct, E.priceFor);

    if (!t.lines.length) {
      itemsEl.innerHTML = '<div class="cart-empty"><h2>Your bag is empty</h2>' +
        '<p>Nothing in here yet — let’s find something that speaks to you.</p>' +
        '<div class="btn-row" style="justify-content:center"><a class="btn" href="shop.html">Shop all</a><a class="btn btn--outline" href="crystals.html">Shop crystals</a></div></div>';
      summaryEl.hidden = true;
      return;
    }
    summaryEl.hidden = false;

    itemsEl.innerHTML = t.lines.map(function (line) {
      var p = line.product;
      return '<div class="cart-item" data-key="' + E.escapeHTML(line.item.key) + '">' +
        '<a class="cart-item__media" href="product.html?id=' + p.id + '" tabindex="-1" aria-hidden="true">' + E.mediaHTML({ label: p.name, src: p.image, ratio: 'portrait', className: 'media--sm' }) + '</a>' +
        '<div>' +
          '<h2 class="cart-item__title"><a href="product.html?id=' + p.id + '">' + E.escapeHTML(p.name) + '</a></h2>' +
          '<p class="cart-item__variant">' + (line.item.variant ? E.escapeHTML(line.item.variant) : E.escapeHTML(E.crystalName(p.crystal))) + '</p>' +
          '<div class="cart-item__controls">' +
            '<div class="qty qty--small" role="group" aria-label="Quantity">' +
              '<button type="button" data-qty="-1" aria-label="Decrease quantity of ' + E.escapeHTML(p.name) + '">−</button>' +
              '<input type="number" value="' + line.item.qty + '" min="0" max="99" aria-label="Quantity of ' + E.escapeHTML(p.name) + '" data-qty-input inputmode="numeric">' +
              '<button type="button" data-qty="1" aria-label="Increase quantity of ' + E.escapeHTML(p.name) + '">+</button>' +
            '</div>' +
            '<button type="button" class="cart-item__remove" data-remove>Remove</button>' +
          '</div>' +
        '</div>' +
        '<div class="cart-item__price">' + E.formatPrice(line.total) + (line.item.qty > 1 ? '<span class="cart-item__unit">' + E.formatPrice(line.unit) + ' each</span>' : '') + '</div>' +
      '</div>';
    }).join('') + '<p class="cart__continue"><a class="link-arrow" href="shop.html">Continue shopping <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a></p>';
    restoreFocus(focus);

    var progress = Math.min(100, Math.round(((t.subtotal - t.discount) / t.freeShippingThreshold) * 100));
    var shippingText = t.freeShippingRemaining > 0
      ? 'You’re <strong>' + E.formatPrice(t.freeShippingRemaining) + '</strong> away from free UK delivery'
      : '<strong>You’ve unlocked free UK delivery</strong>';

    summaryEl.querySelector('[data-shipping-text]').innerHTML = shippingText;
    summaryEl.querySelector('[data-shipping-fill]').style.width = progress + '%';
    summaryEl.querySelector('[data-shipping-bar]').setAttribute('aria-valuenow', progress);

    var rows = '<div class="summary__row"><span>Subtotal</span><span>' + E.formatPrice(t.subtotal) + '</span></div>';
    if (t.discount > 0) {
      rows += '<div class="summary__row summary__discount"><span>Discount (' + E.escapeHTML(t.promo) + ') <button type="button" class="cart-item__remove" data-remove-promo>Remove</button></span><span>−' + E.formatPrice(t.discount) + '</span></div>';
    }
    rows += '<div class="summary__row"><span>UK delivery</span><span>' + (t.shipping === 0 ? 'Free' : E.formatPrice(t.shipping)) + '</span></div>';
    rows += '<div class="summary__row summary__row--total"><span>Total</span><span>' + E.formatPrice(t.total) + '</span></div>';
    summaryEl.querySelector('[data-rows]').innerHTML = rows;

    if (promoInput) promoInput.value = t.promo || '';
  }

  app.addEventListener('click', function (e) {
    var item = e.target.closest('.cart-item');

    var qtyBtn = e.target.closest('[data-qty]');
    if (qtyBtn && item) {
      var input = item.querySelector('[data-qty-input]');
      var next = (parseInt(input.value, 10) || 0) + parseInt(qtyBtn.getAttribute('data-qty'), 10);
      var name = item.querySelector('.cart-item__title').textContent;
      window.Cart.update(item.getAttribute('data-key'), next);
      announce(next > 0 ? 'Quantity of ' + name + ' is now ' + next : name + ' removed from your bag');
      return;
    }
    if (e.target.closest('[data-remove]') && item) {
      var removedName = item.querySelector('.cart-item__title').textContent;
      window.Cart.remove(item.getAttribute('data-key'));
      window.toast(E.escapeHTML(removedName) + ' removed from your bag');
      return;
    }
    if (e.target.closest('[data-remove-promo]')) {
      window.Cart.removePromo();
      if (promoMsg) { promoMsg.textContent = ''; promoMsg.className = 'promo__msg'; }
      return;
    }
    if (e.target.closest('[data-checkout]')) {
      var note = app.querySelector('[data-checkout-note]');
      if (note) { note.classList.add('is-visible'); note.setAttribute('tabindex', '-1'); note.focus(); }
    }
  });

  app.addEventListener('change', function (e) {
    var input = e.target.closest('[data-qty-input]');
    if (!input) return;
    var item = input.closest('.cart-item');
    var qty = parseInt(input.value, 10) || 0;
    window.Cart.update(item.getAttribute('data-key'), qty);
    announce(qty > 0 ? 'Quantity updated to ' + qty : 'Item removed from your bag');
  });

  var promoForm = app.querySelector('[data-promo-form]');
  if (promoForm) {
    promoForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var result = window.Cart.applyPromo(promoInput.value);
      promoMsg.textContent = result.message;
      promoMsg.className = 'promo__msg ' + (result.ok ? 'is-success' : 'is-error');
    });
  }

  document.addEventListener('cart:change', render);
  render();
})();
