/* ==========================================================================
   Enchantiica — site-wide behaviour
   --------------------------------------------------------------------------
   Header state, mobile navigation, page transitions, scroll reveal, toast
   messages, cart badge, home page bestsellers, newsletter and contact forms.
   Everything is progressive: the site is fully readable without JS.
   ========================================================================== */
(function () {
  'use strict';

  var doc = document;
  var body = doc.body;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------------- */
  /* Page entry transition                                                   */
  /* ---------------------------------------------------------------------- */
  function ready() { body.classList.add('is-ready'); }
  if (reduceMotion) { ready(); } else { requestAnimationFrame(function () { requestAnimationFrame(ready); }); }

  /* Restore visibility when navigating back via bfcache */
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) { body.classList.remove('is-leaving'); ready(); }
  });

  /* ---------------------------------------------------------------------- */
  /* Page exit transition for internal links                                 */
  /* ---------------------------------------------------------------------- */
  doc.addEventListener('click', function (e) {
    if (reduceMotion) return;
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var link = e.target.closest('a[href]');
    if (!link) return;
    if (link.target && link.target !== '_self') return;
    if (link.hasAttribute('download') || link.getAttribute('href').charAt(0) === '#') return;
    var url;
    try { url = new URL(link.href, location.href); } catch (err) { return; }
    if (url.origin !== location.origin) return;
    if (url.pathname === location.pathname && url.search === location.search && url.hash) return; /* same-page anchor */
    e.preventDefault();
    body.classList.add('is-leaving');
    setTimeout(function () { location.href = url.href; }, 220);
  });

  /* ---------------------------------------------------------------------- */
  /* Sticky header state                                                     */
  /* ---------------------------------------------------------------------- */
  var header = doc.querySelector('.header');
  if (header) {
    var ticking = false;
    var update = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 12);
      ticking = false;
    };
    window.addEventListener('scroll', function () {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }

  /* ---------------------------------------------------------------------- */
  /* Mobile navigation                                                       */
  /* ---------------------------------------------------------------------- */
  var burger = doc.querySelector('.burger');
  var nav = doc.querySelector('.nav');
  var overlay = doc.querySelector('.nav-overlay');
  var lastFocus = null;

  function openNav() {
    lastFocus = doc.activeElement;
    body.classList.add('nav-open');
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Close menu');
    var first = nav.querySelector('a');
    if (first) setTimeout(function () { first.focus(); }, reduceMotion ? 0 : 320);
  }
  function closeNav() {
    body.classList.remove('nav-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Open menu');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  /* Keep Tab focus inside a drawer. `extra` is an element outside the drawer
     (e.g. its toggle button) that stays part of the cycle. */
  function trapFocus(e, container, extra) {
    var focusables = Array.prototype.slice.call(container.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex="0"]'))
      .filter(function (el) { return el.offsetParent !== null; });
    if (extra) focusables.unshift(extra);
    if (!focusables.length) return;
    var first = focusables[0], last = focusables[focusables.length - 1];
    if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  window.trapFocus = trapFocus;

  if (burger && nav) {
    burger.addEventListener('click', function () {
      body.classList.contains('nav-open') ? closeNav() : openNav();
    });
    if (overlay) overlay.addEventListener('click', closeNav);
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && body.classList.contains('nav-open')) closeNav();
      if (e.key === 'Tab' && body.classList.contains('nav-open')) trapFocus(e, nav, burger);
    });
    window.matchMedia('(min-width: 900px)').addEventListener('change', function (e) {
      if (e.matches && body.classList.contains('nav-open')) closeNav();
    });
  }

  /* Mark current page in nav (a parent link is current when one of its menu links matches) */
  var current = location.pathname.split('/').pop() || 'index.html';
  doc.querySelectorAll('.nav__link').forEach(function (link) {
    var href = link.getAttribute('href').split('?')[0].split('#')[0];
    if (href === current) { link.setAttribute('aria-current', 'page'); return; }
    var item = link.closest('.nav__item');
    if (item && current !== 'index.html' && Array.prototype.some.call(item.querySelectorAll('.nav__menu a'), function (a) {
      return a.getAttribute('href').split('?')[0].split('#')[0] === current;
    })) link.setAttribute('aria-current', 'page');
  });

  /* Sub-menus: hover / focus on desktop (CSS), accordion toggles in the drawer */
  doc.querySelectorAll('.nav__toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.nav__item');
      var open = !item.classList.contains('is-open');
      doc.querySelectorAll('.nav__item.is-open').forEach(function (other) {
        if (other !== item) { other.classList.remove('is-open'); other.querySelector('.nav__toggle').setAttribute('aria-expanded', 'false'); }
      });
      item.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });
  doc.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var item = doc.activeElement && doc.activeElement.closest && doc.activeElement.closest('.nav__item');
    if (item) { item.querySelector('.nav__link').focus(); if (item.classList.contains('is-open')) item.querySelector('.nav__toggle').click(); }
  });

  /* ---------------------------------------------------------------------- */
  /* Scroll reveal                                                           */
  /* ---------------------------------------------------------------------- */
  var revealObserver = null;
  function observeReveals(root) {
    var targets = (root || doc).querySelectorAll('[data-reveal]:not(.is-visible)');
    if (!targets.length) return;
    if (reduceMotion || !('IntersectionObserver' in window)) {
      targets.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    if (!revealObserver) {
      revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    }
    targets.forEach(function (el) { revealObserver.observe(el); });
  }
  observeReveals();
  window.observeReveals = observeReveals;

  /* ---------------------------------------------------------------------- */
  /* Toast                                                                   */
  /* ---------------------------------------------------------------------- */
  var toastEl = null, toastTimer = null;
  function toast(message, action) {
    if (!toastEl) {
      toastEl = doc.createElement('div');
      toastEl.className = 'toast';
      toastEl.setAttribute('role', 'status');
      toastEl.setAttribute('aria-live', 'polite');
      body.appendChild(toastEl);
    }
    toastEl.innerHTML = '<span>' + message + '</span>' + (action ? '<a href="' + action.href + '">' + action.label + '</a>' : '');
    clearTimeout(toastTimer);
    /* force reflow so repeated toasts re-animate */
    toastEl.classList.remove('is-visible');
    void toastEl.offsetWidth;
    toastEl.classList.add('is-visible');
    toastTimer = setTimeout(function () { toastEl.classList.remove('is-visible'); }, 3600);
  }
  window.toast = toast;

  /* ---------------------------------------------------------------------- */
  /* Cart badge                                                              */
  /* ---------------------------------------------------------------------- */
  var badge = doc.querySelector('.cart-count');
  function renderBadge(bump) {
    if (!badge || !window.Cart) return;
    var n = window.Cart.count();
    badge.textContent = n;
    badge.classList.toggle('is-visible', n > 0);
    var link = badge.closest('a');
    if (link) link.setAttribute('aria-label', 'Bag, ' + n + (n === 1 ? ' item' : ' items'));
    if (bump && n > 0 && !reduceMotion) {
      badge.classList.remove('is-bump');
      void badge.offsetWidth;
      badge.classList.add('is-bump');
    }
  }
  renderBadge(false);
  doc.addEventListener('cart:change', function () { renderBadge(true); });

  /* Quick "Add to bag" buttons on any grid (delegated) */
  doc.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-add-to-cart]');
    if (!btn || !window.Cart || !window.ENCHANTIICA) return;
    var id = btn.getAttribute('data-add-to-cart');
    var product = window.ENCHANTIICA.getProduct(id);
    if (!product) return;
    window.Cart.add(id, '', 1);
    toast('<strong>' + window.ENCHANTIICA.escapeHTML(product.name) + '</strong> added to your bag', { href: 'cart.html', label: 'View bag' });
  });

  /* ---------------------------------------------------------------------- */
  /* Home: bestsellers grid                                                  */
  /* ---------------------------------------------------------------------- */
  var bestsellers = doc.querySelector('[data-bestsellers]');
  if (bestsellers && window.ENCHANTIICA) {
    var limit = parseInt(bestsellers.getAttribute('data-bestsellers'), 10) || 8;
    var picks = window.ENCHANTIICA.products.filter(function (p) { return p.bestseller; })
      .sort(function (a, b) { return b.reviewCount - a.reviewCount; }).slice(0, limit);
    bestsellers.innerHTML = picks.map(window.ENCHANTIICA.productCardHTML).join('');
    observeReveals(bestsellers);
  }

  /* ---------------------------------------------------------------------- */
  /* Forms: newsletter                                                       */
  /* ---------------------------------------------------------------------- */
  function isEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); }

  doc.querySelectorAll('[data-newsletter]').forEach(function (form) {
    var input = form.querySelector('input[type="email"]');
    var msg = form.parentNode.querySelector('.newsletter__msg');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var value = input.value.trim();
      if (!isEmail(value)) {
        msg.textContent = 'Please enter a valid email address.';
        msg.className = 'newsletter__msg is-error';
        input.setAttribute('aria-invalid', 'true');
        input.focus();
        return;
      }
      input.removeAttribute('aria-invalid');
      msg.textContent = 'You’re on the list — welcome to Enchantiica. Check your inbox for 10% off.';
      msg.className = 'newsletter__msg is-success';
      form.reset();
    });
  });

  /* ---------------------------------------------------------------------- */
  /* Forms: generic validation (contact, review)                             */
  /* ---------------------------------------------------------------------- */
  doc.querySelectorAll('[data-validate]').forEach(function (form) {
    var success = doc.getElementById(form.getAttribute('data-success') || '');
    function validateField(field) {
      var group = field.closest('.form-group');
      var valid = field.checkValidity();
      if (field.type === 'email' && field.value && !isEmail(field.value)) valid = false;
      if (group) group.classList.toggle('is-invalid', !valid);
      field.setAttribute('aria-invalid', valid ? 'false' : 'true');
      return valid;
    }
    form.setAttribute('novalidate', '');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var fields = form.querySelectorAll('input, textarea, select');
      var firstInvalid = null;
      fields.forEach(function (f) {
        if (!validateField(f) && !firstInvalid) firstInvalid = f;
      });
      if (firstInvalid) { firstInvalid.focus(); return; }
      form.reset();
      form.querySelectorAll('.is-invalid').forEach(function (g) { g.classList.remove('is-invalid'); });
      if (success) {
        form.hidden = true;
        success.classList.add('is-visible');
        success.setAttribute('tabindex', '-1');
        success.focus();
      } else {
        toast('Thank you — your message has been sent.');
      }
    });
    form.querySelectorAll('input, textarea, select').forEach(function (f) {
      f.addEventListener('blur', function () { if (f.value) validateField(f); });
      f.addEventListener('input', function () {
        var group = f.closest('.form-group');
        if (group && group.classList.contains('is-invalid')) validateField(f);
      });
    });
  });

  /* ---------------------------------------------------------------------- */
  /* Footer year                                                             */
  /* ---------------------------------------------------------------------- */
  doc.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
