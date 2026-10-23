/* NutraPack concept pages — shared scroll lineup + concept switcher.
   Tub geometry is copied from the live 3D designer (Design.html):
   SIZES in mm, MM = 1/30, same body and lid lathe profiles, same parting gap. */
(function () {
  'use strict';

  var SIZES = [
    { key: '8oz',  label: '8 oz',  d: 60,  bodyH: 87,  lidH: 15, ml: 237 },
    { key: '10oz', label: '10 oz', d: 60,  bodyH: 97,  lidH: 14, ml: 296 },
    { key: '20oz', label: '20 oz', d: 89,  bodyH: 92,  lidH: 15, ml: 591 },
    { key: '25oz', label: '25 oz', d: 89,  bodyH: 129, lidH: 15, ml: 740 },
    { key: '55oz', label: '55 oz', d: 120, bodyH: 122, lidH: 21, ml: 1627 }
  ];
  var MM = 1 / 30;
  var PARTING_GAP = 0.003;
  var GAP_MM = 26;            // space between tubs in the lineup
  var HERO = 2;               // the 20 oz tub starts alone, like the current hero

  function clamp(x, a, b) { return Math.min(b, Math.max(a, x)); }
  function smooth(a, b, x) { var t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }
  function lerp(a, b, t) { return a + (b - a) * t; }

  function mount(o) {
    var section = o.section, stage = o.stage;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function fallback() {
      var img = document.createElement('img');
      img.src = o.fallback || 'images/web/lineup.jpg';
      img.alt = 'NutraPack tubs in 8, 10, 20, 25 and 55 oz, shown to scale';
      img.className = 'np-fallback';
      stage.appendChild(img);
    }
    var THREE = window.THREE;
    if (!THREE) { fallback(); return; }

    var canvas = document.createElement('canvas');
    canvas.className = 'np-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    stage.appendChild(canvas);
    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    } catch (e) { canvas.remove(); fallback(); return; }
    renderer.setPixelRatio(Math.min(window.innerWidth < 760 ? 1.5 : 2, window.devicePixelRatio || 1));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = o.exposure || 1;
    renderer.setClearColor(0x000000, 0);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(28, 1, 0.1, 200);

    // Lighting: "studio" for light pages, "dramatic" for dark pages
    var dramatic = o.light === 'dramatic';
    scene.add(new THREE.HemisphereLight(0xffffff, 0x3a3836, o.ambient || (dramatic ? 0.12 : 0.75)));
    var key = new THREE.DirectionalLight(0xffffff, o.key || (dramatic ? 0.9 : 1.25)); key.position.set(4, 7, 6); scene.add(key);
    var fill = new THREE.DirectionalLight(0xffffff, dramatic ? 0.15 : 0.45); fill.position.set(-6, 3, 3); scene.add(fill);
    var rim = new THREE.DirectionalLight(0xffffff, dramatic ? 2.2 : 0.8); rim.position.set(-2, 4, -7); scene.add(rim);
    var rim2 = new THREE.DirectionalLight(0xffffff, dramatic ? 1.4 : 0.3); rim2.position.set(5, 2, -6); scene.add(rim2);

    // Soft contact shadow texture
    var sc = document.createElement('canvas'); sc.width = sc.height = 128;
    var g = sc.getContext('2d');
    var grad = g.createRadialGradient(64, 64, 4, 64, 64, 64);
    grad.addColorStop(0, 'rgba(0,0,0,0.55)'); grad.addColorStop(0.55, 'rgba(0,0,0,0.18)'); grad.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grad; g.fillRect(0, 0, 128, 128);
    var shadowTex = new THREE.CanvasTexture(sc);

    function bodyProfile(radius, height) {
      var c = Math.min(radius * 0.05, height * 0.03);
      return [new THREE.Vector2(0, 0), new THREE.Vector2(radius - c, 0), new THREE.Vector2(radius - c * 0.5, c * 0.5),
        new THREE.Vector2(radius, c), new THREE.Vector2(radius, height - c), new THREE.Vector2(radius - c * 0.3, height)];
    }
    function lidProfile(radius, height) {
      var t = Math.min(radius * 0.04, height * 0.15);
      return [new THREE.Vector2(radius, 0), new THREE.Vector2(radius, height - t),
        new THREE.Vector2(radius - t * 0.5, height - t * 0.3), new THREE.Vector2(radius - t, height)];
    }
    function lidTopRadius(radius, height) { return radius - Math.min(radius * 0.04, height * 0.15); }

    // Lineup slots, to scale, centred on x = 0
    var total = SIZES.reduce(function (s, z) { return s + z.d; }, 0) + GAP_MM * (SIZES.length - 1);
    var cursor = -total / 2, slots = [];
    SIZES.forEach(function (s) { slots.push((cursor + s.d / 2) * MM); cursor += s.d + GAP_MM; });
    var lineupW = total * MM;
    var tallest = Math.max.apply(null, SIZES.map(function (s) { return (s.bodyH + s.lidH) * MM; }));

    var labelsWrap = document.createElement('div');
    labelsWrap.className = 'np-labels';
    stage.appendChild(labelsWrap);

    var colors = o.colors || ['#0a0a0a', '#0a0a0a', '#0a0a0a', '#0a0a0a', '#0a0a0a'];
    var tubs = SIZES.map(function (s, i) {
      var group = new THREE.Group();
      var mat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(colors[i]).convertSRGBToLinear(),
        roughness: 0.5, metalness: 0, clearcoat: 0.25, clearcoatRoughness: 0.6, transparent: true, opacity: 1
      });
      var r = (s.d / 2) * MM, bh = s.bodyH * MM, lh = s.lidH * MM;
      var body = new THREE.Mesh(new THREE.LatheGeometry(bodyProfile(r, bh), 96), mat);
      var lid = new THREE.Mesh(new THREE.LatheGeometry(lidProfile(r, lh), 96), mat);
      lid.position.y = bh + PARTING_GAP;
      var topGeo = new THREE.CircleGeometry(lidTopRadius(r, lh), 96); topGeo.rotateX(-Math.PI / 2);
      var top = new THREE.Mesh(topGeo, mat); top.position.y = bh + PARTING_GAP + lh + 0.0008;
      var partMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true });
      var part = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.998, r * 0.998, PARTING_GAP * 1.5, 96, 1, true), partMat);
      part.position.y = bh + PARTING_GAP / 2;
      group.add(body, lid, top, part);
      var shMat = new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, opacity: dramatic ? 0.9 : 0.6 });
      var sh = new THREE.Mesh(new THREE.PlaneGeometry(r * 3.4, r * 3.4), shMat);
      sh.rotation.x = -Math.PI / 2; sh.position.y = 0.002;
      scene.add(group); scene.add(sh);

      var label = document.createElement('div');
      label.className = 'np-label';
      label.innerHTML = '<span class="np-label__size">' + s.label + '</span><span class="np-label__meta">' + s.d + ' mm · ' + s.ml + ' ml</span>';
      labelsWrap.appendChild(label);
      return { s: s, group: group, mats: [mat, partMat], shadow: sh, shMat: shMat, label: label, h: (s.bodyH + s.lidH) * MM };
    });

    // Rise order: neighbours of the 20 oz first, then the ends
    var riseStart = { 0: 0.30, 1: 0.18, 3: 0.22, 4: 0.34 };

    var w = 1, h = 1;
    function resize() {
      var rect = stage.getBoundingClientRect();
      w = Math.max(1, rect.width); h = Math.max(1, rect.height);
      renderer.setSize(w, h, false);
      camera.aspect = w / h; camera.updateProjectionMatrix();
    }
    resize();
    if (window.ResizeObserver) new ResizeObserver(resize).observe(stage);
    else window.addEventListener('resize', resize);

    var tanHalf = Math.tan((camera.fov / 2) * Math.PI / 180);
    function frameDistance(width, height) {
      var byH = height / (2 * tanHalf);
      var byW = width / (2 * tanHalf * camera.aspect);
      return Math.max(byH, byW);
    }

    var target = reduce ? 1 : 0, p = target, clock = 0;
    var heroScale = o.heroScale || 0.5;   // share of stage height the lone 20 oz fills at the start
    var v = new THREE.Vector3();

    function progress() {
      var r = section.getBoundingClientRect();
      var run = r.height - window.innerHeight;
      return run > 0 ? clamp(-r.top / run, 0, 1) : 1;
    }
    function visible() {
      var r = section.getBoundingClientRect();
      return r.bottom > -50 && r.top < window.innerHeight + 50;
    }

    function render() {
      clock += 0.016;
      if (!reduce) target = progress();
      p += (target - p) * 0.12;
      if (Math.abs(target - p) < 0.0005) p = target;
      section.style.setProperty('--np-p', p.toFixed(3));
      if (o.onProgress) o.onProgress(p);

      var heroT = smooth(0.08, 0.72, p);
      tubs.forEach(function (t, i) {
        var x, y, a, tilt = 0;
        if (i === HERO) {
          x = slots[i];
          y = (1 - heroT) * Math.sin(clock * 1.4) * 0.03;
          a = 1;
        } else {
          var st = riseStart[i];
          var k = smooth(st, st + 0.42, p);
          var e = 1 - Math.pow(1 - k, 3);
          x = slots[i];
          y = lerp(-(t.h + 2.5), 0, e);
          a = smooth(st, st + 0.1, p);
          tilt = (1 - e) * 0.18 * (i < HERO ? 1 : -1);
        }
        t.group.position.set(x, y, 0);
        t.group.rotation.z = tilt;
        t.group.visible = a > 0.01;
        t.mats.forEach(function (m) { m.opacity = a; m.transparent = a < 0.999; m.depthWrite = a > 0.5; });
        t.shadow.position.x = x;
        t.shMat.opacity = (dramatic ? 0.9 : 0.6) * a * clamp(1 + y, 0, 1);
      });

      // Camera: close on the lone 20 oz, pulling back to frame the full lineup
      var heroH = tubs[HERO].h;
      var dStart = frameDistance(heroH / 0.9, heroH / heroScale);
      var dEnd = frameDistance(lineupW * 1.18, tallest * 1.9);
      var cam = smooth(0.06, 0.82, p);
      var d = lerp(dStart, dEnd, cam);
      // Optional start offsets so the lone tub clears the page's headline
      var wide = camera.aspect >= 1;
      var heroW = tubs[HERO].s.d * MM;
      var shiftX = wide ? (o.heroShiftX || 0) * heroW : 0;
      var liftY = wide ? 0 : (o.heroLiftMobile || 0) * heroH;
      var lookX = lerp(slots[HERO] - shiftX, 0, cam);
      var lookY = lerp(heroH * 0.48 - liftY, tallest * 0.5, cam);
      camera.position.set(lookX, lookY + d * 0.14, d);
      camera.lookAt(lookX, lookY, 0);
      renderer.render(scene, camera);

      // Size labels under each tub once the lineup lands
      var la = smooth(0.78, 0.95, p);
      tubs.forEach(function (t, i) {
        v.set(slots[i], 0, (t.s.d / 2) * MM).project(camera);
        var sx = (v.x * 0.5 + 0.5) * w, sy = (-v.y * 0.5 + 0.5) * h;
        t.label.style.transform = 'translate(' + sx.toFixed(1) + 'px,' + sy.toFixed(1) + 'px) translate(-50%, 14px)';
        t.label.style.opacity = la.toFixed(3);
      });
    }

    function loop() {
      if (visible() || Math.abs(target - p) > 0.001) render();
      requestAnimationFrame(loop);
    }
    render();
    requestAnimationFrame(loop);
  }

  // ---------- Concept switcher bar ----------
  var CONCEPTS = [
    { file: 'classic.html', name: 'Classic' },
    { file: 'clean.html', name: 'Clean' },
    { file: 'pantone.html', name: 'Pantone' },
    { file: 'mission.html', name: 'Mission' },
    { file: 'catalog.html', name: 'Catalog' }
  ];
  function switcher(current) {
    var css = '' +
      '.npx{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(14px + env(safe-area-inset-bottom,0px));z-index:1000;' +
      'display:flex;align-items:center;gap:2px;padding:5px;border-radius:999px;background:rgba(18,18,18,.92);' +
      'box-shadow:0 8px 30px rgba(0,0,0,.25);font:500 13px/1 system-ui,-apple-system,sans-serif;max-width:calc(100vw - 24px);overflow-x:auto}' +
      '.npx a{color:#e8e6e1;text-decoration:none;padding:10px 13px;border-radius:999px;white-space:nowrap;display:inline-flex;gap:6px;align-items:center}' +
      '.npx a:hover{background:rgba(255,255,255,.1)}' +
      '.npx a:focus-visible{outline:2px solid #fff;outline-offset:1px}' +
      '.npx a[aria-current=page]{background:#fff;color:#111}' +
      '.npx .npx-n{opacity:.55;font-variant-numeric:tabular-nums}' +
      '.npx a[aria-current=page] .npx-n{opacity:.6}' +
      '.npx .npx-sep{width:1px;height:18px;background:rgba(255,255,255,.2);margin:0 4px;flex:none}' +
      '@media (max-width:560px){.npx .npx-name{display:none}.npx a[aria-current=page] .npx-name{display:inline}}';
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    var nav = document.createElement('nav'); nav.className = 'npx'; nav.setAttribute('aria-label', 'Homepage concepts');
    var html = '<a href="index.html">All</a><span class="npx-sep"></span>';
    CONCEPTS.forEach(function (c, i) {
      html += '<a href="' + c.file + '"' + (c.file === current ? ' aria-current="page"' : '') + '><span class="npx-n">' + (i + 1) + '</span><span class="npx-name">' + c.name + '</span></a>';
    });
    nav.innerHTML = html;
    document.body.appendChild(nav);
  }

  window.NP = { mount: mount, switcher: switcher, SIZES: SIZES, CONCEPTS: CONCEPTS };
})();
