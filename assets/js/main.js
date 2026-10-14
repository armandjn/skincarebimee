/* Skincare Bimee — site interactions (vanilla JS, no dependencies) */
(function () {
  'use strict';
  var doc = document, root = doc.documentElement;
  root.classList.remove('no-js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };
  var EMAIL = 'skincarebimee@gmail.com';

  /* ---- Header: scrolled state, hide on scroll-down, progress bar, back-to-top ---- */
  var header = $('.site-header'), bar = $('.progress'), toTop = $('.to-top');
  var lastY = 0, ticking = false;
  function onScroll() {
    var y = window.scrollY || 0;
    var max = Math.max(1, doc.documentElement.scrollHeight - window.innerHeight);
    if (header) {
      header.classList.toggle('is-scrolled', y > 24);
      var goingDown = y > lastY + 6 && y > 480;
      var goingUp = y < lastY - 6;
      if (!doc.body.classList.contains('menu-open')) {
        if (goingDown) header.classList.add('is-hidden');
        else if (goingUp || y < 480) header.classList.remove('is-hidden');
      }
    }
    if (bar) bar.style.transform = 'scaleX(' + (y / max).toFixed(4) + ')';
    if (toTop) toTop.classList.toggle('is-visible', y > 900);
    lastY = y;
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();
  if (toTop) toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });

  /* ---- Mobile menu ---- */
  var burger = $('.burger'), menu = $('.mobile-menu');
  function setMenu(open) {
    if (!burger || !menu) return;
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    doc.body.classList.toggle('menu-open', open);
    if (open && header) header.classList.remove('is-hidden');
  }
  if (burger && menu) {
    burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
    $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    doc.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
    window.matchMedia('(min-width: 1100px)').addEventListener('change', function (e) { if (e.matches) setMenu(false); });
  }

  /* ---- Scroll reveal ---- */
  var revealEls = $$('.reveal, .clip-reveal');
  if (/[?&]shot/.test(location.search)) { reduce = true; root.classList.add('shot'); }
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0, rootMargin: '0px 0px -5% 0px' });
    /* failsafe: never leave content hidden */
    setTimeout(function () { revealEls.forEach(function (el) { var r = el.getBoundingClientRect(); if (r.top < window.innerHeight * 1.5) el.classList.add('in'); }); }, 2500);
    window.addEventListener('load', function () { setTimeout(function () { revealEls.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('in'); }); }, 300); });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---- Parallax on images / blobs ---- */
  var par = $$('[data-parallax]');
  if (par.length && !reduce) {
    var pTick = false;
    var runPar = function () {
      var vh = window.innerHeight;
      par.forEach(function (el) {
        var r = el.parentElement.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) return;
        var p = (r.top + r.height / 2 - vh / 2) / vh;
        var amt = parseFloat(el.getAttribute('data-parallax')) || 40;
        el.style.transform = 'translate3d(0,' + (p * -amt).toFixed(1) + 'px,0) scale(1.12)';
      });
      pTick = false;
    };
    window.addEventListener('scroll', function () { if (!pTick) { pTick = true; requestAnimationFrame(runPar); } }, { passive: true });
    window.addEventListener('resize', runPar);
    runPar();
  }

  /* ---- 3D tilt cards ---- */
  if (canHover && !reduce) {
    $$('.tilt').forEach(function (el) {
      var max = parseFloat(el.getAttribute('data-tilt')) || 9;
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        el.style.transform = 'perspective(1000px) rotateX(' + ((0.5 - y) * max).toFixed(2) + 'deg) rotateY(' + ((x - 0.5) * max * 1.3).toFixed(2) + 'deg) translateZ(0)';
        el.style.setProperty('--mx', (x * 100) + '%');
        el.style.setProperty('--my', (y * 100) + '%');
        el.classList.add('is-tilting');
      });
      el.addEventListener('pointerleave', function () {
        el.style.transform = '';
        el.classList.remove('is-tilting');
      });
    });
    /* magnetic buttons */
    $$('.btn--gold, .btn--ghost').forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.14).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.25).toFixed(1) + 'px)';
      });
      b.addEventListener('pointerleave', function () { b.style.transform = ''; });
    });
  }

  /* ---- Rail controls (home service slider) ---- */
  $$('[data-rail]').forEach(function (wrap) {
    var rail = $('.rail', wrap);
    if (!rail) return;
    var step = function () { var c = rail.firstElementChild; return c ? c.getBoundingClientRect().width + 20 : 340; };
    var prev = $('.prev', wrap), next = $('.next', wrap);
    if (prev) prev.addEventListener('click', function () { rail.scrollBy({ left: -step(), behavior: 'smooth' }); });
    if (next) next.addEventListener('click', function () { rail.scrollBy({ left: step(), behavior: 'smooth' }); });
  });

  /* ---- Services filter ---- */
  var filterBtns = $$('.filter-btn');
  if (filterBtns.length) {
    var cards = $$('.svc-grid .svc-card');
    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filterBtns.forEach(function (b) { b.classList.remove('is-active'); b.setAttribute('aria-pressed', 'false'); });
        btn.classList.add('is-active'); btn.setAttribute('aria-pressed', 'true');
        var f = btn.getAttribute('data-filter');
        cards.forEach(function (c) {
          var show = f === 'all' || (c.getAttribute('data-cat') || '').split(' ').indexOf(f) > -1;
          c.classList.toggle('is-hidden', !show);
        });
      });
    });
  }

  /* ---- mailto forms (static site: composes an email in the visitor's mail app) ---- */
  $$('form[data-mailto]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var data = new FormData(form), lines = [];
      var subject = form.getAttribute('data-subject') || 'Website enquiry';
      data.forEach(function (v, k) { if (v && k.charAt(0) !== '_') lines.push(k.replace(/_/g, ' ') + ': ' + v); });
      var extra = form.getAttribute('data-extra');
      if (extra && window[extra]) lines = lines.concat(window[extra]());
      var href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(lines.join('\n'));
      var status = $('.form-status', form);
      if (status) status.classList.add('is-visible');
      window.location.href = href;
    });
  });

  /* ---- Booking page ---- */
  var book = $('#book-form');
  if (book) {
    var priceMap = {};
    $$('input[name="service"]', book).forEach(function (r) { priceMap[r.value] = { price: r.getAttribute('data-price'), dur: r.getAttribute('data-dur'), label: r.getAttribute('data-label') }; });
    var sSvc = $('#sum-service'), sDur = $('#sum-dur'), sDate = $('#sum-date'), sTime = $('#sum-time'), sTot = $('#sum-total');
    var dateEl = $('#date');
    if (dateEl) { var t = new Date(); t.setMinutes(t.getMinutes() - t.getTimezoneOffset()); dateEl.min = t.toISOString().slice(0, 10); }
    var refresh = function () {
      var sel = $('input[name="service"]:checked', book);
      var info = sel ? priceMap[sel.value] : null;
      sSvc.textContent = info ? info.label : 'Choose a service';
      sDur.textContent = info ? info.dur : '—';
      sTot.textContent = info ? (info.price === '0' ? 'Free' : '$' + info.price) : '—';
      var d = dateEl && dateEl.value ? new Date(dateEl.value + 'T12:00:00') : null;
      sDate.textContent = d ? d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : 'Pick a date';
      var tm = $('input[name="preferred_time"]:checked', book);
      sTime.textContent = tm ? tm.value : 'Pick a time';
    };
    book.addEventListener('input', refresh); book.addEventListener('change', refresh);
    var q = new URLSearchParams(location.search).get('service');
    if (q) { var pre = $('input[name="service"][value="' + q.replace(/[^a-z-]/g, '') + '"]', book); if (pre) pre.checked = true; }
    refresh();
    window.bookExtra = function () { return ['price: ' + sTot.textContent, 'duration: ' + sDur.textContent]; };
  }

  /* ---- Gift card builder ---- */
  var gift = $('#gift-form');
  if (gift) {
    var amtOut = $$('[data-amount]'), nameOut = $('#gc-to'), fromOut = $('#gc-from'), msgOut = $('#gc-msg'), totalOut = $('#gc-total'), qtyOut = $('#qty-out');
    var qty = 1;
    var update = function () {
      var a = $('input[name="amount"]:checked', gift).value;
      amtOut.forEach(function (n) { n.textContent = '$' + a; });
      totalOut.textContent = '$' + (a * qty);
      qtyOut.textContent = qty;
      nameOut.textContent = ($('#to', gift).value || 'Someone special').slice(0, 24);
      fromOut.textContent = ($('#from', gift).value || 'Skincare Bimee').slice(0, 24);
      msgOut.textContent = $('#message', gift).value || 'A gift of endless possibilities.';
    };
    gift.addEventListener('input', update); gift.addEventListener('change', update);
    $('#qty-minus').addEventListener('click', function () { qty = Math.max(1, qty - 1); update(); });
    $('#qty-plus').addEventListener('click', function () { qty = Math.min(10, qty + 1); update(); });
    $('#flip').addEventListener('click', function () { $('.gcard').classList.toggle('is-flipped'); });
    window.giftExtra = function () { return ['quantity: ' + qty, 'total: ' + totalOut.textContent]; };
    update();
  }
  /* gift card 3D follow-pointer */
  var gc = $('.gcard');
  if (gc && canHover && !reduce) {
    var scene = gc.parentElement;
    scene.addEventListener('pointermove', function (e) {
      if (gc.classList.contains('is-flipped')) return;
      var r = scene.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      gc.style.transform = 'rotateX(' + ((0.5 - y) * 22).toFixed(1) + 'deg) rotateY(' + ((x - 0.5) * 30).toFixed(1) + 'deg)';
      gc.style.setProperty('--mx', (x * 100) + '%'); gc.style.setProperty('--my', (y * 100) + '%');
    });
    scene.addEventListener('pointerleave', function () { if (!gc.classList.contains('is-flipped')) gc.style.transform = ''; });
  } else if (gc && !reduce) {
    gc.style.animation = 'floaty 6s ease-in-out infinite';
  }

  /* ---- Year ---- */
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
