/* NutraPack site behaviour: mobile menu, header background, 3D pieces, quote form. */
(function () {
  'use strict';

  // Mobile menu
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.getAttribute('data-open') === 'true';
      nav.setAttribute('data-open', open ? 'false' : 'true');
      burger.setAttribute('aria-expanded', open ? 'false' : 'true');
    });
    nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { nav.setAttribute('data-open', 'false'); burger.setAttribute('aria-expanded', 'false'); }); });
  }
  // Header gets a solid background once you scroll
  var hdr = document.querySelector('.hdr');
  function solid() { if (hdr) hdr.classList.toggle('is-solid', window.scrollY > 40); }
  solid(); window.addEventListener('scroll', solid, { passive: true });

  // Ticking product hero
  var ticker = document.getElementById('ticker');
  if (ticker && window.NPH) {
    var P = [
      ['Packaging', 'Custom tubs'], ['Printing', 'Shrink sleeves'], ['Packaging', 'Stand-up pouches'],
      ['Brand protection', 'Spirits security seal'], ['Printing', 'Labels'], ['Brand protection', 'Hat security lamination']
    ];
    var dial = document.getElementById('dial'), cat = document.getElementById('tkCat'), name = document.getElementById('tkName');
    var api = null, active = 0;
    var bars = P.map(function (p, i) {
      var b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', 'Show ' + p[1]);
      b.innerHTML = '<span><i></i></span>'; dial.appendChild(b);
      b.addEventListener('click', function () { if (api) api.goTo(i); });
      return b;
    });
    api = window.NPH.mountTicker({
      stage: ticker,
      onTick: function (i) {
        active = i; cat.textContent = P[i][0]; name.textContent = P[i][1];
        bars.forEach(function (b, k) { b.setAttribute('aria-current', k === i ? 'true' : 'false'); b.querySelector('i').style.width = k < i ? '100%' : '0'; });
      },
      onProgress: function (f) { bars[active].querySelector('i').style.width = (Math.max(0, Math.min(1, f)) * 100).toFixed(1) + '%'; }
    });
  }

  // Security seal: original vs photocopy
  var sealStage = document.getElementById('seal');
  if (sealStage && window.NPH) {
    var cap = document.getElementById('sealCap'), bo = document.getElementById('mOrig'), bc = document.getElementById('mCopy');
    var text = {
      orig: 'Original: the holographic color shifts as it moves, and the micro text and fine lines stay sharp.',
      copy: 'Photocopy: the holographic shift is gone, the micro text turns to mush, and a hidden VOID pattern shows up.'
    };
    var seal = window.NPH.mountSeal({
      stage: sealStage,
      onMode: function (m) { cap.textContent = text[m]; bo.setAttribute('aria-pressed', String(m === 'orig')); bc.setAttribute('aria-pressed', String(m === 'copy')); }
    });
    bo.addEventListener('click', function () { if (seal) seal.setMode('orig', true); });
    bc.addEventListener('click', function () { if (seal) seal.setMode('copy', true); });
  }

  // Scroll tub lineup
  var run = document.getElementById('lineup');
  if (run && window.NP) {
    window.NP.mount({
      section: run, stage: document.getElementById('stage'),
      // 20 oz stays black; the rest use Pantone 185 C, 165 C, 354 C and 285 C
      colors: ['#e4002b', '#ff671f', '#0a0a0a', '#00b140', '#0072ce'],
      key: 1.35, ambient: 0.22, light: 'dramatic', exposure: 1.25, heroScale: 0.36
    });
  }

  // Quote form: tub-only questions + in-page Formspree submit
  document.querySelectorAll('[data-component-select]').forEach(function (select) {
    var form = select.closest('form');
    var groups = form.querySelectorAll('[data-tub-fields]');
    var req = form.querySelectorAll('[data-tub-required]');
    function update() {
      var tubs = select.value === 'Tubs';
      groups.forEach(function (g) { g.hidden = !tubs; if (!tubs) g.querySelectorAll('input[type=checkbox]').forEach(function (c) { c.checked = false; }); });
      req.forEach(function (f) { if (tubs) f.setAttribute('required', ''); else { f.removeAttribute('required'); f.value = ''; } });
    }
    select.addEventListener('change', update); update();
  });
  document.querySelectorAll('form[action^="https://formspree.io"]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var status = form.querySelector('[data-form-status]'), btn = form.querySelector('button[type=submit]'), label = btn ? btn.innerHTML : '';
      if (btn) { btn.disabled = true; btn.innerHTML = 'Sending…'; }
      if (status) { status.hidden = true; status.className = 'form-status'; }
      fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        .then(function (r) {
          if (!r.ok) throw new Error('failed');
          form.reset();
          form.querySelectorAll('[data-component-select]').forEach(function (s) { s.dispatchEvent(new Event('change')); });
          if (status) { status.hidden = false; status.classList.add('form-status--success'); status.textContent = 'Thanks, we got your brief. A real person will reply within 48 hours.'; }
          if (btn) { btn.innerHTML = 'Sent ✓'; setTimeout(function () { btn.innerHTML = label; btn.disabled = false; }, 3000); }
        })
        .catch(function () {
          if (status) { status.hidden = false; status.classList.add('form-status--error'); status.textContent = 'That didn’t send. Check your connection and try again, or email contact@nutrapack.co.'; }
          if (btn) { btn.innerHTML = label; btn.disabled = false; }
        });
    });
  });

  var y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();
})();
