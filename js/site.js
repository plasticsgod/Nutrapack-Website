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

  // 3D starts only once the page has loaded and the browser is idle, and only when its section is
  // on (or near) screen, so text and buttons are usable first on phones.
  function when3D(el, fn) {
    var started = false;
    function go() { if (started) return; started = true; fn(); }
    function idle() { (window.requestIdleCallback || function (f) { setTimeout(f, 300); })(watch, { timeout: 2500 }); }
    function watch() {
      if (!('IntersectionObserver' in window)) return go();
      var io = new IntersectionObserver(function (es) { if (es.some(function (e) { return e.isIntersecting; })) { io.disconnect(); go(); } }, { rootMargin: '400px 0px' });
      io.observe(el);
    }
    if (document.readyState === 'complete') idle(); else window.addEventListener('load', idle, { once: true });
  }

  // Ticking product hero
  var ticker = document.getElementById('ticker');
  if (ticker && window.NPH) {
    var P = [
      ['Packaging', 'Custom tubs'], ['Printing', 'Shrink sleeves'],
      ['Brand protection', 'Spirits security seal'], ['Printing', 'Labels']
    ];
    var dial = document.getElementById('dial'), cat = document.getElementById('tkCat'), name = document.getElementById('tkName');
    var api = null, active = 0;
    var bars = P.map(function (p, i) {
      var b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', 'Show ' + p[1]);
      b.innerHTML = '<span><i></i></span>'; dial.appendChild(b);
      b.addEventListener('click', function () { if (api) api.goTo(i); });
      return b;
    });
    // Phones: show a still of the tub right away and start the 3D on the first touch, scroll or key,
    // so the page is usable instantly. Computers start the 3D as soon as the page has loaded.
    var phone = window.matchMedia && window.matchMedia('(max-width: 760px)').matches;
    var poster = null;
    if (phone) {
      poster = document.createElement('img'); poster.className = 'hero__poster'; poster.alt = '';
      poster.src = 'images/web/hero-tub.webp'; poster.width = 1029; poster.height = 915; poster.decoding = 'async';
      ticker.appendChild(poster);
    }
    function startTicker(fn) {
      if (!phone) return when3D(ticker, fn);
      var done = false, evs = ['pointerdown', 'touchstart', 'scroll', 'keydown', 'wheel'];
      function go() { if (done) return; done = true; evs.forEach(function (e) { window.removeEventListener(e, go, { passive: true }); }); fn(); setTimeout(function () { if (poster) { poster.style.opacity = '0'; setTimeout(function () { poster.remove(); }, 400); } }, 350); }
      evs.forEach(function (e) { window.addEventListener(e, go, { passive: true }); });
    }
    startTicker(function () { api = window.NPH.mountTicker({
      stage: ticker,
      onTick: function (i) {
        active = i; cat.textContent = P[i][0]; name.textContent = P[i][1];
        bars.forEach(function (b, k) { b.setAttribute('aria-current', k === i ? 'true' : 'false'); b.querySelector('i').style.width = k < i ? '100%' : '0'; });
      },
      onProgress: function (f) { bars[active].querySelector('i').style.width = (Math.max(0, Math.min(1, f)) * 100).toFixed(1) + '%'; }
    }); });
  }

  // Security seal: original vs photocopy
  var sealStage = document.getElementById('seal');
  if (sealStage && window.NPH) {
    var cap = document.getElementById('sealCap'), bo = document.getElementById('mOrig'), bc = document.getElementById('mCopy');
    var text = {
      orig: 'Original: the foil shifts color and depth as it tilts. The loupe shows micro text a copier can’t hold. Move over the seal to read it.',
      copy: 'Photocopy: the holographic shift is gone, the micro text turns to mush, and a hidden VOID pattern shows up.'
    };
    var seal = null;
    when3D(sealStage, function () { seal = window.NPH.mountSeal({
      stage: sealStage,
      onMode: function (m) { cap.textContent = text[m]; bo.setAttribute('aria-pressed', String(m === 'orig')); bc.setAttribute('aria-pressed', String(m === 'copy')); }
    }); });
    [].forEach.call(document.querySelectorAll('.shape-picks [data-shape]'), function (b, i, all) {
      b.addEventListener('click', function () { if (!seal) return; seal.setShape(b.dataset.shape); [].forEach.call(all, function (x) { x.setAttribute('aria-pressed', String(x === b)); }); });
    });
    bo.addEventListener('click', function () { if (seal) seal.setMode('orig', true); });
    bc.addEventListener('click', function () { if (seal) seal.setMode('copy', true); });
  }

  // Scroll tub lineup
  var run = document.getElementById('lineup');
  if (run && window.NP) {
    when3D(run, function () { window.NP.mount({
      section: run, stage: document.getElementById('stage'),
      // 20 oz stays black; the rest use Pantone 185 C, 165 C, 354 C and 285 C
      colors: ['#e4002b', '#ff671f', '#0a0a0a', '#00b140', '#0072ce'],
      key: 1.35, ambient: 0.22, light: 'dramatic', exposure: 1.25, heroScale: 0.36
    }); });
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
      var preview = !!document.querySelector('meta[name="np-preview"]');
      (preview ? Promise.resolve({ ok: true }) : fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } }))
        .then(function (r) {
          if (!r.ok) throw new Error('failed');
          form.reset();
          form.querySelectorAll('[data-component-select]').forEach(function (s) { s.dispatchEvent(new Event('change')); });
          if (status) { status.hidden = false; status.classList.add('form-status--success'); status.textContent = 'Thanks, we got your brief. A real person will reply soon.'; }
          if (btn) { btn.innerHTML = 'Sent ✓'; setTimeout(function () { btn.innerHTML = label; btn.disabled = false; }, 3000); }
        })
        .catch(function () {
          if (status) { status.hidden = false; status.classList.add('form-status--error'); status.textContent = 'That didn’t send. Check your connection and try again, or email contact@nutrapack.co.'; }
          if (btn) { btn.innerHTML = label; btn.disabled = false; }
        });
    });
  });

  // Short brief form (homepage, blog)
  var brief = document.getElementById('briefForm');
  if (brief) {
    brief.querySelectorAll('.bf-chips').forEach(function (g) {
      var single = g.hasAttribute('data-single');
      g.addEventListener('click', function (e) {
        var b = e.target.closest('.gtoggle'); if (!b) return;
        var on = b.getAttribute('aria-pressed') === 'true';
        if (single) g.querySelectorAll('.gtoggle').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
        b.setAttribute('aria-pressed', single ? 'true' : String(!on));
      });
    });
    brief.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = document.getElementById('bfEmail'), err = document.getElementById('bfErr');
      if (!email.value || !/^\S+@\S+\.\S+$/.test(email.value)) { email.setAttribute('aria-invalid', 'true'); err.textContent = 'Add an email so we can reply.'; email.focus(); return; }
      email.removeAttribute('aria-invalid'); err.textContent = '';
      // send the brief to the same inbox as the contact form
      var fd = new FormData(), groups = brief.querySelectorAll('.bf-chips');
      function picked(g) { return g ? [].map.call(g.querySelectorAll('.gtoggle[aria-pressed="true"]'), function (b) { return b.textContent.trim(); }).join(', ') : ''; }
      fd.append('_subject', 'New project brief \u2014 ' + (document.title.split('|')[0].trim() || 'Website'));
      fd.append('form_source', 'Brief form: ' + location.pathname);
      fd.append('name', (document.getElementById('bfName') || {}).value || '');
      fd.append('email', email.value);
      fd.append('needs', picked(groups[0]));
      fd.append('quantity', picked([].filter.call(groups, function (g) { return g.hasAttribute('data-single'); })[0]));
      fd.append('message', (document.getElementById('bfNotes') || {}).value || '');
      var btn = brief.querySelector('[type="submit"]'); if (btn) btn.disabled = true;
      var preview = !!document.querySelector('meta[name="np-preview"]');
      (preview ? Promise.resolve({ ok: true }) : fetch('https://formspree.io/f/xqenoayb', { method: 'POST', body: fd, headers: { Accept: 'application/json' } }))
        .then(function (r) {
          if (!r.ok) throw new Error('send failed');
          brief.querySelector('[data-step]').hidden = true;
          var done = document.getElementById('bfDone'); done.hidden = false; done.focus();
        })
        .catch(function () { err.textContent = 'That didn\u2019t send. Please email contact@nutrapack.co and we\u2019ll reply.'; })
        .then(function () { if (btn) btn.disabled = false; });
    });
  }

  var y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();
})();

// Blog topic filters (blog.html): All / Packaging / Printing / Branding / Design / Security; ?topic=security deep links
(function () {
  var grid = document.getElementById('postGrid'); if (!grid) return;
  var chips = [].slice.call(document.querySelectorAll('.fchip')), cards = [].slice.call(grid.querySelectorAll('.post-card')), count = document.getElementById('postCount');
  function apply(cat, push) {
    var n = 0;
    chips.forEach(function (c) { c.setAttribute('aria-pressed', String(c.dataset.cat === cat)); });
    cards.forEach(function (card) { var show = cat === 'all' || (' ' + card.dataset.cats + ' ').indexOf(' ' + cat + ' ') > -1; card.hidden = !show; if (show) n++; });
    if (count) count.textContent = n + (n === 1 ? ' article' : ' articles');
    if (push && window.history && history.replaceState) { var u = new URL(location.href); if (cat === 'all') u.searchParams.delete('topic'); else u.searchParams.set('topic', cat); history.replaceState(null, '', u); }
  }
  chips.forEach(function (c) { c.addEventListener('click', function () { apply(c.dataset.cat, true); }); });
  var q = new URLSearchParams(location.search).get('topic');
  if (q && chips.some(function (c) { return c.dataset.cat === q; })) apply(q, false);
})();

// Lenticular demo (security-features.html): pointer, phone tilt or slow auto-rock drives --t from -1 to 1
(function () {
  var box = document.getElementById('lenti'); if (!box) return;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches, t = 0, target = null, last = 0;
  function set(v) { t = Math.max(-1, Math.min(1, v)); box.style.setProperty('--t', t.toFixed(3)); }
  box.addEventListener('pointermove', function (e) { var b = box.getBoundingClientRect(); target = ((e.clientX - b.left) / b.width - .5) * 2; last = Date.now(); });
  box.addEventListener('pointerleave', function () { target = null; });
  window.addEventListener('deviceorientation', function (e) { if (e.gamma == null) return; target = e.gamma / 30; last = Date.now(); });
  function loop() { requestAnimationFrame(loop); var goal = target; if (goal == null || Date.now() - last > 2500) goal = reduce ? -1 : Math.sin(Date.now() / 1400); set(t + (goal - t) * .12); }
  set(-1); loop();
})();

// Contact form: ?need=pilot|sample|custom|... pre-selects "What do you need?" (entry offers from the security page)
(function () {
  var need = new URLSearchParams(location.search).get('need'); if (!need) return;
  var map = { pilot: 'Pilot on one SKU', sample: 'Sample kit', custom: 'Custom packaging', tamper: 'Tamper seals', neck: 'Neck bands', labels: 'Anti-counterfeit labels', premium: 'Premium brand effects', security: 'Security features' };
  var want = map[need]; if (!want) return;
  document.querySelectorAll('select[name="component"]').forEach(function (s) {
    [].forEach.call(s.options, function (o) { if (o.text === want) { s.value = o.value || o.text; o.selected = true; } });
    s.dispatchEvent(new Event('change'));
  });
})();

// Open every page at the top (no restored mid-page scroll), unless the link points at a section
(function () {
  try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; } catch (e) {}
  function top() { if (!location.hash) window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); }
  top(); window.addEventListener('pageshow', top);
})();

// Open every page at the top (no restored mid-page scroll), unless the address points at a section
(function () {
  try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; } catch (e) {}
  function top() { if (!location.hash) window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); }
  top(); window.addEventListener('pageshow', top);
})();
