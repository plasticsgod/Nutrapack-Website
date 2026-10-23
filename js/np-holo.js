/* NutraPack — holographic security seal + ticking product hero.
   Needs three.js r128 loaded first. Exposes window.NPH = { mountSeal, mountTicker }. */
(function () {
  'use strict';
  var THREE = window.THREE;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function clamp(x, a, b) { return Math.min(b, Math.max(a, x)); }
  function easeOutBack(t) { var c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); }
  function easeInCubic(t) { return t * t * t; }
  function easeInOut(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

  // ---------- Seal artwork (drawn to canvas) ----------
  // Original: red channel = bright foil lines (guilloche, micro text), green channel = dark ink.
  // Photocopy: grey paper, mushy lines, illegible micro text, hidden VOID pattern revealed.
  function sealCanvas(mode, W, H) {
    var c = document.createElement('canvas'); c.width = W; c.height = H;
    var g = c.getContext('2d');
    var orig = mode === 'orig';
    var cx = W / 2, cy = H * 0.47, R0 = W * 0.29;
    g.fillStyle = orig ? '#000' : '#d3d3cf'; g.fillRect(0, 0, W, H);
    if (!orig) { // paper grain
      for (var n = 0; n < 9000; n++) { g.fillStyle = 'rgba(0,0,0,' + (Math.random() * 0.06).toFixed(3) + ')'; g.fillRect(Math.random() * W, Math.random() * H, 2, 2); }
    }
    g.globalCompositeOperation = orig ? 'lighter' : 'source-over';
    var line = orig ? function (a) { return 'rgba(255,0,0,' + a + ')'; } : function (a) { return 'rgba(110,110,108,' + (a * 0.5) + ')'; };
    var ink = orig ? 'rgba(0,255,0,1)' : 'rgba(55,55,55,.85)';
    var lw = orig ? 1 : 2.6;

    // fine diagonal security lines
    g.strokeStyle = line(0.32); g.lineWidth = lw;
    for (var x = -H; x < W; x += 7) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x + H, H); g.stroke(); }
    // wavy border bands
    for (var b = 0; b < 3; b++) {
      g.strokeStyle = line(0.7); g.lineWidth = lw * 1.2; g.beginPath();
      for (var t = 0; t <= Math.PI * 2 + 0.01; t += 0.01) {
        var r = W * (0.43 + b * 0.018) + 6 * Math.sin(t * 48 + b);
        var px = cx + r * Math.cos(t), py = cy + r * Math.sin(t) * 1.08;
        t === 0 ? g.moveTo(px, py) : g.lineTo(px, py);
      }
      g.stroke();
    }
    // guilloche rosette
    for (var j = 0; j < 42; j++) {
      g.strokeStyle = line(orig ? 0.75 : 0.5); g.lineWidth = orig ? 1.1 : 3.2; g.beginPath();
      for (var tt = 0; tt <= Math.PI * 2 + 0.01; tt += 0.006) {
        var rr = R0 + 26 * Math.sin(7 * tt + j * 0.15) + 12 * Math.sin(17 * tt - j * 0.09);
        var qx = cx + rr * Math.cos(tt), qy = cy + rr * Math.sin(tt);
        tt === 0 ? g.moveTo(qx, qy) : g.lineTo(qx, qy);
      }
      g.stroke();
    }
    // micro text ring
    var mr = W * 0.385;
    if (orig) {
      g.fillStyle = 'rgba(255,0,0,1)'; g.font = '600 12px Arial, sans-serif';
      var str = 'AUTHENTIC · YOUR BRAND · DO NOT COPY · ', k = 0;
      for (var a = 0; a < Math.PI * 2 - 0.012; a += 0.0115) {
        g.save(); g.translate(cx + mr * Math.cos(a), cy + mr * Math.sin(a) * 1.08); g.rotate(a + Math.PI / 2);
        g.fillText(str[k % str.length], -3, 4); g.restore(); k++;
      }
    } else {
      g.strokeStyle = 'rgba(95,95,93,.4)'; g.lineWidth = 14; g.beginPath();
      g.ellipse(cx, cy, mr, mr * 1.08, 0, 0, Math.PI * 2); g.stroke();
    }
    // centre type
    g.globalCompositeOperation = 'source-over';
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = ink; g.font = '700 30px Arial, sans-serif';
    spaced(g, 'YOUR BRAND', cx, cy - 78, 9);
    g.font = '800 104px "Arial Narrow", Arial, sans-serif';
    g.fillText('AUTHENTIC', cx, cy + 6);
    if (orig) { g.globalCompositeOperation = 'lighter'; g.strokeStyle = 'rgba(255,0,0,.9)'; g.lineWidth = 1.5; g.strokeText('AUTHENTIC', cx, cy + 6); g.globalCompositeOperation = 'source-over'; }
    g.fillStyle = ink; g.font = '600 24px Arial, sans-serif';
    spaced(g, 'SECURITY LAMINATION', cx, cy + 84, 6);
    g.fillRect(cx - 150, cy + 56, 300, 2);
    // hidden anti-copy pattern: invisible on the original, shows up on a copy
    g.save(); g.translate(cx, cy); g.rotate(-0.42);
    g.font = '900 150px Arial, sans-serif';
    for (var vy = -3; vy <= 3; vy++) for (var vx = -2; vx <= 2; vx++) {
      g.fillStyle = orig ? 'rgba(255,0,0,.035)' : 'rgba(70,70,70,.42)';
      g.fillText('VOID', vx * 430 + (vy % 2) * 215, vy * 230);
    }
    g.restore();
    return c;
  }
  function spaced(g, text, x, y, sp) {
    var w = 0, i; for (i = 0; i < text.length; i++) w += g.measureText(text[i]).width + sp; w -= sp;
    var sx = x - w / 2; g.textAlign = 'left';
    for (i = 0; i < text.length; i++) { g.fillText(text[i], sx, y); sx += g.measureText(text[i]).width + sp; }
    g.textAlign = 'center';
  }

  var holoVert = [
    'varying vec2 vUv; varying vec3 vN; varying vec3 vV;',
    'void main(){ vUv = uv; vec4 mv = modelViewMatrix * vec4(position,1.0);',
    ' vV = normalize(-mv.xyz); vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * mv; }'
  ].join('\n');
  var holoFrag = [
    'uniform sampler2D uTex; uniform sampler2D uCopy; uniform float uTime; uniform float uScan; uniform float uScanGlow; uniform vec4 uBox;',
    'varying vec2 vUv; varying vec3 vN; varying vec3 vV;',
    'vec3 hsv2rgb(vec3 c){ vec3 p = abs(fract(c.xxx + vec3(0.,2./3.,1./3.))*6.-3.); return c.z*mix(vec3(1.),clamp(p-1.,0.,1.),c.y); }',
    'void main(){',
    ' vec2 st = clamp((vUv - uBox.xy) / uBox.zw, 0., 1.);',
    ' vec4 tx = texture2D(uTex, st);',
    ' vec3 n = normalize(vN); if (!gl_FrontFacing) n = -n;',
    ' float ndv = clamp(dot(n, normalize(vV)), 0., 1.);',
    ' float fres = pow(1. - ndv, 2.);',
    ' float grating = sin((st.x * .8 + st.y) * 380.) * .5 + .5;',
    ' float hue = fract(ndv * 1.9 + st.x * .7 - st.y * .45 + n.x * .6 + n.y * .4 + uTime * .025 + grating * .05);',
    ' vec3 holo = hsv2rgb(vec3(hue, .62, 1.));',
    ' vec3 silver = vec3(.70, .72, .76);',
    ' vec3 col = mix(silver * .55, holo * .9, .45 + .4 * fres);',
    ' col = mix(col, holo * 1.25 + .12, tx.r * .75);',
    ' col *= .7 + .45 * ndv;',
    ' float streak = pow(max(0., sin((st.x + st.y) * 2.6 - uTime * .7 + n.x * 2.)), 24.) * .55;',
    ' col += streak;',
    ' col = mix(col, vec3(.045, .045, .055), tx.g * .92);',
    ' vec3 cp = texture2D(uCopy, st).rgb;',
    ' float y = 1. - st.y;',
    ' float isCopy = 1. - smoothstep(uScan - .015, uScan + .015, y);',
    ' vec3 outc = mix(col, cp, isCopy);',
    ' float beam = exp(-pow((y - uScan) * 60., 2.)) * uScanGlow;',
    ' outc += vec3(.55, .9, 1.) * beam;',
    ' gl_FragColor = vec4(outc, 1.);',
    '}'
  ].join('\n');

  var sealTexCache = null;
  function sealTextures() {
    if (sealTexCache) return sealTexCache;
    var o = new THREE.CanvasTexture(sealCanvas('orig', 1024, 1225));
    var c = new THREE.CanvasTexture(sealCanvas('copy', 1024, 1225));
    [o, c].forEach(function (t) { t.anisotropy = 8; t.minFilter = THREE.LinearMipmapLinearFilter; });
    sealTexCache = { orig: o, copy: c };
    return sealTexCache;
  }
  function holoMaterial(box) {
    var tx = sealTextures();
    return new THREE.ShaderMaterial({
      uniforms: {
        uTex: { value: tx.orig }, uCopy: { value: tx.copy }, uTime: { value: 0 },
        uScan: { value: -0.05 }, uScanGlow: { value: 0 }, uBox: { value: new THREE.Vector4(box[0], box[1], box[2], box[3]) }
      },
      vertexShader: holoVert, fragmentShader: holoFrag, side: THREE.DoubleSide
    });
  }

  function makeRenderer(stage) {
    var canvas = document.createElement('canvas');
    canvas.className = 'nph-canvas'; canvas.setAttribute('aria-hidden', 'true');
    stage.appendChild(canvas);
    var r = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    r.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    r.outputEncoding = THREE.sRGBEncoding;
    r.toneMapping = THREE.ACESFilmicToneMapping;
    r.setClearColor(0x000000, 0);
    return r;
  }
  function onScreen(el) { var b = el.getBoundingClientRect(); return b.bottom > -40 && b.top < window.innerHeight + 40; }
  function sizeTo(renderer, camera, el) {
    function fit() { var b = el.getBoundingClientRect(); renderer.setSize(Math.max(1, b.width), Math.max(1, b.height), false); camera.aspect = Math.max(1, b.width) / Math.max(1, b.height); camera.updateProjectionMatrix(); }
    fit();
    if (window.ResizeObserver) new ResizeObserver(fit).observe(el); else window.addEventListener('resize', fit);
  }

  // ---------- Security seal (shield) ----------
  function shieldShape() {
    var s = new THREE.Shape();
    s.moveTo(-0.84, 1.2); s.lineTo(0.84, 1.2); s.quadraticCurveTo(1, 1.2, 1, 1.04);
    s.lineTo(1, 0.25); s.bezierCurveTo(1, -0.55, 0.55, -0.98, 0, -1.22);
    s.bezierCurveTo(-0.55, -0.98, -1, -0.55, -1, 0.25); s.lineTo(-1, 1.04); s.quadraticCurveTo(-1, 1.2, -0.84, 1.2);
    return s;
  }

  function mountSeal(o) {
    if (!THREE) return;
    var stage = o.stage, renderer;
    try { renderer = makeRenderer(stage); } catch (e) { return; }
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
    camera.position.set(0, 0, 6.2);
    sizeTo(renderer, camera, stage);

    scene.add(new THREE.HemisphereLight(0xffffff, 0x222222, 0.6));
    var kl = new THREE.DirectionalLight(0xffffff, 1.2); kl.position.set(2, 3, 4); scene.add(kl);

    var geo = new THREE.ExtrudeGeometry(shieldShape(), { depth: 0.05, bevelEnabled: true, bevelThickness: 0.025, bevelSize: 0.03, bevelSegments: 4, curveSegments: 64 });
    geo.center();
    // ExtrudeGeometry front UVs are shape coordinates; map the shield's bounds to 0..1
    var mat = holoMaterial([-1.03, -1.25, 2.06, 2.48]);
    var edge = new THREE.MeshStandardMaterial({ color: 0xcfd2d8, metalness: 0.9, roughness: 0.25 });
    var mesh = new THREE.Mesh(geo, [mat, edge]);
    var group = new THREE.Group(); group.add(mesh); scene.add(group);


    var px = 0, py = 0, tx = 0, ty = 0;
    stage.addEventListener('pointermove', function (e) {
      var b = stage.getBoundingClientRect();
      tx = ((e.clientX - b.left) / b.width - 0.5) * 2; ty = ((e.clientY - b.top) / b.height - 0.5) * 2;
    });
    stage.addEventListener('pointerleave', function () { tx = 0; ty = 0; });

    var mode = 'orig', scanFrom = -0.05, scanTo = -0.05, scanStart = 0, auto = !reduce, last = performance.now();
    function setMode(m, fromUser) {
      if (fromUser) auto = false;
      if (m === mode) return;
      mode = m; scanFrom = mat.uniforms.uScan.value; scanTo = m === 'copy' ? 1.05 : -0.05; scanStart = performance.now();
      if (o.onMode) o.onMode(m);
    }
    var nextAuto = 0;
    var t0 = performance.now();
    function frame(now) {
      requestAnimationFrame(frame);
      if (!onScreen(stage)) return;
      var dt = Math.min(0.05, (now - last) / 1000); last = now;
      var t = (now - t0) / 1000;
      if (!nextAuto) nextAuto = now + 2600;
      if (auto && now > nextAuto) { setMode(mode === 'orig' ? 'copy' : 'orig'); nextAuto = now + (mode === 'copy' ? 3400 : 3800); }
      var sd = reduce ? 1 : clamp((now - scanStart) / 1300, 0, 1);
      mat.uniforms.uScan.value = scanFrom + (scanTo - scanFrom) * easeInOut(sd);
      mat.uniforms.uScanGlow.value = sd < 1 ? 1 : 0;
      mat.uniforms.uTime.value = t;
      px += (tx - px) * 0.08; py += (ty - py) * 0.08;
      var sway = reduce ? 0 : 1;
      group.rotation.y = (Math.sin(t * 0.6) * 0.35 * sway) + px * 0.45;
      group.rotation.x = (Math.sin(t * 0.45) * 0.12 * sway) + py * 0.3 - 0.05;
      group.position.y = Math.sin(t * 0.9) * 0.04 * sway;
      renderer.render(scene, camera);
    }
    requestAnimationFrame(frame);
    return { setMode: setMode };
  }

  // ---------- Ticking product hero ----------
  var MM = 1 / 30;
  function lathe(pts, seg) { return new THREE.LatheGeometry(pts.map(function (p) { return new THREE.Vector2(p[0], p[1]); }), seg || 96); }
  function std(color, rough, metal) { return new THREE.MeshPhysicalMaterial({ color: new THREE.Color(color).convertSRGBToLinear(), roughness: rough == null ? 0.5 : rough, metalness: metal || 0, clearcoat: 0.2, clearcoatRoughness: 0.6 }); }
  function canvasTex(w, h, draw) { var c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); var t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; return t; }

  function makeTub() {
    var g = new THREE.Group();
    var r = 44.5 * MM, bh = 92 * MM, lh = 15 * MM, c = Math.min(r * 0.05, bh * 0.03), tc = Math.min(r * 0.04, lh * 0.15);
    var m = std('#0a0a0a', 0.5);
    g.add(new THREE.Mesh(lathe([[0, 0], [r - c, 0], [r - c * .5, c * .5], [r, c], [r, bh - c], [r - c * .3, bh]]), m));
    var lid = new THREE.Mesh(lathe([[r, 0], [r, lh - tc], [r - tc * .5, lh - tc * .3], [r - tc, lh]]), m); lid.position.y = bh + 0.003; g.add(lid);
    var top = new THREE.Mesh(new THREE.CircleGeometry(r - tc, 96), m); top.rotation.x = -Math.PI / 2; top.position.y = bh + lh + 0.004; g.add(top);
    var part = new THREE.Mesh(new THREE.CylinderGeometry(r * .998, r * .998, 0.005, 96, 1, true), new THREE.MeshBasicMaterial({ color: 0 })); part.position.y = bh + 0.0015; g.add(part);
    return g;
  }
  function makeCan() {
    var g = new THREE.Group();
    var sleeve = canvasTex(1024, 512, function (x, w, h) {
      x.fillStyle = '#ff5b1f'; x.fillRect(0, 0, w, h);
      x.fillStyle = '#111'; for (var i = 0; i < 9; i++) { x.fillRect(0, h * 0.62 + i * 9, w, 3); }
      x.fillStyle = '#111'; x.fillRect(0, 0, w, h * 0.08); x.fillRect(0, h * 0.92, w, h * 0.08);
      x.save(); x.translate(w * 0.3, h * 0.5); x.rotate(-Math.PI / 2);
      x.fillStyle = '#111'; x.font = '900 120px "Arial Narrow", Arial, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('YOUR', 0, -70); x.fillText('BRAND', 0, 55);
      x.restore();
      x.fillStyle = '#111'; x.font = '700 30px Arial, sans-serif'; x.textAlign = 'left'; x.fillText('12 FL OZ · 355 mL', w * 0.55, h * 0.3);
      x.fillStyle = 'rgba(255,255,255,.25)'; x.fillRect(w * 0.72, 0, 30, h);
    });
    var body = new THREE.Mesh(lathe([[0.31, 0.06], [0.33, 0.1], [0.33, 1.08], [0.31, 1.13]]), new THREE.MeshPhysicalMaterial({ map: sleeve, roughness: 0.35, clearcoat: 0.6, clearcoatRoughness: 0.3 }));
    g.add(body);
    var metal = new THREE.MeshStandardMaterial({ color: 0xc9cbd0, metalness: 0.95, roughness: 0.28 });
    g.add(new THREE.Mesh(lathe([[0, 0.02], [0.24, 0], [0.30, 0.03], [0.31, 0.06]]), metal));
    g.add(new THREE.Mesh(lathe([[0.31, 1.13], [0.285, 1.2], [0.285, 1.22], [0.27, 1.215], [0, 1.2]]), metal));
    return g;
  }
  function makePouch() {
    var g = new THREE.Group();
    var art = canvasTex(512, 700, function (x, w, h) {
      x.fillStyle = '#f2efe8'; x.fillRect(0, 0, w, h);
      x.fillStyle = '#111'; x.fillRect(0, h * 0.34, w, h * 0.3);
      x.fillStyle = '#f2efe8'; x.font = '900 70px "Arial Narrow", Arial, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
      x.fillText('YOUR BRAND', w / 2, h * 0.46);
      x.font = '600 24px Arial, sans-serif'; x.fillText('30 SERVINGS · NET WT 2 LB', w / 2, h * 0.56);
      x.fillStyle = '#0072ce'; x.fillRect(0, h * 0.64, w, 10);
      x.fillStyle = 'rgba(0,0,0,.12)'; x.fillRect(0, h * 0.06, w, 4);
    });
    var W = 1.3, H = 1.75;
    var geo = new THREE.PlaneGeometry(W, H, 40, 56), pos = geo.attributes.position;
    for (var i = 0; i < pos.count; i++) {
      var u = pos.getX(i) / W + 0.5, v = pos.getY(i) / H + 0.5;
      var vv = clamp((v - 0.0) / 0.9, 0, 1);
      var bulge = Math.pow(Math.sin(Math.PI * u), 0.7) * Math.pow(Math.sin(Math.PI * vv), 0.55) * (v > 0.9 ? 0 : 1);
      pos.setZ(i, bulge * 0.2 + (v < 0.12 ? (0.12 - v) * 0.9 : 0) * Math.sin(Math.PI * u) * 0.6);
      pos.setX(i, pos.getX(i) * (1 - bulge * 0.05));
    }
    geo.computeVertexNormals();
    var m = new THREE.MeshPhysicalMaterial({ map: art, roughness: 0.6, clearcoat: 0.3, clearcoatRoughness: 0.5, side: THREE.DoubleSide });
    var front = new THREE.Mesh(geo, m); g.add(front);
    var back = new THREE.Mesh(geo, new THREE.MeshPhysicalMaterial({ color: 0xe9e5dc, roughness: 0.6, side: THREE.DoubleSide })); back.scale.z = -1; g.add(back);
    g.position.y = H / 2;
    var wrap = new THREE.Group(); wrap.add(g); return wrap;
  }
  function makeBottle() {
    var g = new THREE.Group();
    var glass = new THREE.MeshPhysicalMaterial({ color: new THREE.Color('#7a3d10').convertSRGBToLinear(), roughness: 0.08, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.05, transparent: true, opacity: 0.88 });
    g.add(new THREE.Mesh(lathe([[0, 0.01], [0.34, 0], [0.36, 0.04], [0.36, 1.05], [0.3, 1.22], [0.14, 1.36], [0.12, 1.42], [0.12, 1.7], [0.135, 1.72], [0.135, 1.76], [0, 1.76]]), glass));
    var cap = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.24, 64), std('#111111', 0.6)); cap.position.y = 1.86; g.add(cap);
    var lab = canvasTex(1024, 512, function (x, w, h) {
      x.fillStyle = '#efe6d2'; x.fillRect(0, 0, w, h);
      x.strokeStyle = '#1a1a1a'; x.lineWidth = 3; x.strokeRect(w * 0.18, 20, w * 0.3, h - 40);
      x.fillStyle = '#1a1a1a'; x.textAlign = 'center'; x.font = '700 22px Georgia, serif'; x.fillText('SMALL BATCH', w * 0.33, h * 0.3);
      x.font = '900 64px Georgia, serif'; x.fillText('YOUR', w * 0.33, h * 0.5); x.fillText('BRAND', w * 0.33, h * 0.65);
      x.font = '600 20px Georgia, serif'; x.fillText('750 mL', w * 0.33, h * 0.82);
    });
    var label = new THREE.Mesh(new THREE.CylinderGeometry(0.363, 0.363, 0.62, 96, 1, true, -Math.PI * 0.62, Math.PI * 1.24), new THREE.MeshStandardMaterial({ map: lab, roughness: 0.8, side: THREE.DoubleSide }));
    label.position.y = 0.5; g.add(label);
    // holographic security strip over the cap and down the neck
    var strip = new THREE.Mesh(new THREE.CylinderGeometry(0.145, 0.145, 0.42, 48, 1, true, -0.35, 0.7), holoMaterial([0, 0, 1, 1]));
    strip.position.y = 1.78; g.add(strip);
    var seal = new THREE.Mesh(new THREE.CircleGeometry(0.11, 64), holoMaterial([0, 0, 1, 1]));
    seal.position.set(0, 1.25, 0.26); seal.rotation.x = -0.75; g.add(seal);
    return g;
  }
  function makeRoll() {
    var g = new THREE.Group();
    var side = canvasTex(1024, 256, function (x, w, h) {
      x.fillStyle = '#ffffff'; x.fillRect(0, 0, w, h);
      for (var i = 0; i < 6; i++) {
        var X = i * w / 6;
        x.fillStyle = '#111'; x.fillRect(X + 12, 24, w / 6 - 24, h - 48);
        x.fillStyle = '#ff5b1f'; x.fillRect(X + 12, h * 0.6, w / 6 - 24, 18);
        x.fillStyle = '#fff'; x.font = '800 26px Arial, sans-serif'; x.textAlign = 'center'; x.fillText('YOUR BRAND', X + w / 12, h * 0.45);
      }
    });
    var rings = canvasTex(512, 512, function (x, w, h) {
      x.fillStyle = '#f4f2ee'; x.fillRect(0, 0, w, h);
      for (var r = 0.36 * w / 2; r < w / 2; r += 2.2) { x.strokeStyle = 'rgba(0,0,0,' + (0.05 + Math.random() * 0.06) + ')'; x.lineWidth = 1; x.beginPath(); x.arc(w / 2, h / 2, r, 0, Math.PI * 2); x.stroke(); }
    });
    var R = 0.8, r = 0.29, Hh = 0.6;
    g.add(new THREE.Mesh(new THREE.CylinderGeometry(R, R, Hh, 96, 1, true), new THREE.MeshStandardMaterial({ map: side, roughness: 0.45 })));
    var faceM = new THREE.MeshStandardMaterial({ map: rings, roughness: 0.8, side: THREE.DoubleSide });
    [Hh / 2, -Hh / 2].forEach(function (y) { var f = new THREE.Mesh(new THREE.RingGeometry(r, R, 96), faceM); f.rotation.x = -Math.PI / 2; f.position.y = y; g.add(f); });
    g.add(new THREE.Mesh(new THREE.CylinderGeometry(r, r, Hh + 0.02, 64, 1, true), new THREE.MeshStandardMaterial({ color: 0x9a7a52, roughness: 0.9, side: THREE.DoubleSide })));
    var wrap = new THREE.Group(); g.rotation.x = 0.62; g.rotation.z = -0.12; wrap.add(g); return wrap;
  }
  function makeHat() {
    var g = new THREE.Group();
    var R = 0.78;
    var fabric = new THREE.MeshStandardMaterial({ color: new THREE.Color('#2a2c31').convertSRGBToLinear(), roughness: 0.95, metalness: 0 });
    // six-panel crown: taller toward the front like a baseball cap
    var cg = new THREE.SphereGeometry(R, 96, 48, 0, Math.PI * 2, 0, Math.PI / 2), cp = cg.attributes.position;
    for (var i = 0; i < cp.count; i++) {
      var x = cp.getX(i), y = cp.getY(i), z = cp.getZ(i);
      var front = Math.max(0, z / R);
      cp.setY(i, y * (0.78 + 0.12 * front));
    }
    cg.computeVertexNormals();
    g.add(new THREE.Mesh(cg, fabric));
    var btn = new THREE.Mesh(new THREE.SphereGeometry(0.055, 24, 12), fabric); btn.position.y = R * 0.8; g.add(btn);
    // brim: front only, tapering to nothing at the sides, slightly curved down
    var aN = 48, rN = 10, pos = [], idx = [];
    for (i = 0; i <= aN; i++) {
      var a = -1.05 + 2.1 * i / aN, L = 0.82 * Math.pow(Math.max(0, Math.cos(a * 1.48)), 0.85);
      for (var j = 0; j <= rN; j++) {
        var f = j / rN, rr = R * 0.985 + L * f;
        var yb = -0.03 - 0.06 * f - 0.18 * Math.pow(Math.sin(a), 2) * f;
        pos.push(rr * Math.sin(a), yb, rr * Math.cos(a));
      }
    }
    for (i = 0; i < aN; i++) for (var k = 0; k < rN; k++) { var p = i * (rN + 1) + k, q = p + rN + 1; idx.push(p, q, p + 1, q, q + 1, p + 1); }
    var bg = new THREE.BufferGeometry(); bg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); bg.setIndex(idx); bg.computeVertexNormals();
    var brimM = new THREE.MeshStandardMaterial({ color: new THREE.Color('#17181b').convertSRGBToLinear(), roughness: 1, side: THREE.DoubleSide });
    g.add(new THREE.Mesh(bg, brimM));
    // holographic security patch on the front panel
    var patch = new THREE.Mesh(new THREE.SphereGeometry(R * 1.008, 48, 24, Math.PI / 2 - 0.4, 0.8, 0.7, 0.6), holoMaterial([0, 0, 1, 1]));
    var pp = patch.geometry.attributes.position;
    for (i = 0; i < pp.count; i++) { var pz = Math.max(0, pp.getZ(i) / R); pp.setY(i, pp.getY(i) * (0.78 + 0.12 * pz)); }
    patch.geometry.computeVertexNormals();
    g.add(patch);
    g.rotation.x = 0.1; g.rotation.y = -0.8;
    return g;
  }

  function normalize(group, targetH) {
    var box = new THREE.Box3().setFromObject(group), size = new THREE.Vector3(), c = new THREE.Vector3();
    box.getSize(size); box.getCenter(c);
    var s = targetH / Math.max(size.y, size.x * 0.82);
    var holder = new THREE.Group();
    group.position.sub(c); holder.add(group); holder.scale.setScalar(s);
    var outer = new THREE.Group(); outer.add(holder); return outer;
  }

  function mountTicker(o) {
    if (!THREE) return;
    var stage = o.stage, renderer;
    try { renderer = makeRenderer(stage); } catch (e) { return; }
    renderer.toneMappingExposure = 1.15;
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(28, 1, 0.1, 50);
    camera.position.set(0, 0.35, 7.2); camera.lookAt(0, 0, 0);
    sizeTo(renderer, camera, stage);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x303030, 0.55));
    var key = new THREE.DirectionalLight(0xffffff, 1.5); key.position.set(3, 5, 5); scene.add(key);
    var rim = new THREE.DirectionalLight(0xffffff, 2.2); rim.position.set(-3, 3, -5); scene.add(rim);
    var rim2 = new THREE.DirectionalLight(0xbfd4ff, 1.2); rim2.position.set(4, 1, -4); scene.add(rim2);

    var items = [
      { make: makeTub, h: 2.15 }, { make: makeCan, h: 2.35 }, { make: makePouch, h: 2.35 },
      { make: makeBottle, h: 2.6 }, { make: makeRoll, h: 1.9 }, { make: makeHat, h: 1.7 }
    ].map(function (it) { var g = normalize(it.make(), it.h); g.visible = false; scene.add(g); return g; });
    var holos = []; scene.traverse(function (m) { if (m.material && m.material.uniforms && m.material.uniforms.uTime) holos.push(m.material); });

    var cur = 0, prev = -1, tickAt = 0, DUR = 420, t0 = performance.now();
    items[0].visible = true;
    if (o.onTick) o.onTick(0);
    function tick(now) {
      prev = cur; cur = (cur + 1) % items.length; tickAt = now;
      items[cur].visible = true;
      if (o.onTick) o.onTick(cur);
    }
    function goTo(i) { if (i === cur) return; prev = cur; cur = i; tickAt = performance.now(); items.forEach(function (g, k) { g.visible = k === cur || k === prev; }); if (o.onTick) o.onTick(cur); }
    // tick on even wall-clock seconds, like a clock
    var period = o.period || 2000;
    var next = Math.ceil(Date.now() / period) * period;
    var paused = reduce;

    function frame(now) {
      requestAnimationFrame(frame);
      if (!paused && Date.now() >= next) { next += period; if (Date.now() > next) next = Math.ceil(Date.now() / period) * period; tick(now); }
      if (o.onProgress) o.onProgress(paused ? 0 : 1 - (next - Date.now()) / period);
      if (!onScreen(stage)) return;
      var t = (now - t0) / 1000, k = clamp((now - tickAt) / DUR, 0, 1);
      holos.forEach(function (m) { m.uniforms.uTime.value = t; });
      items.forEach(function (g, i) {
        if (i === cur) {
          var e = tickAt ? easeOutBack(k) : 1;
          g.scale.setScalar(Math.max(0.0001, e));
          g.rotation.y = (1 - (tickAt ? k : 1)) * -1.2 + Math.sin(t * 0.8) * 0.35 + 0.35;
          g.rotation.x = 0.06;
          g.visible = true;
        } else if (i === prev && k < 1) {
          var ei = 1 - easeInCubic(k);
          g.scale.setScalar(Math.max(0.0001, ei)); g.rotation.y += 0.08; g.visible = true;
        } else g.visible = false;
      });
      renderer.render(scene, camera);
    }
    requestAnimationFrame(frame);
    return { goTo: goTo, pause: function (p) { paused = p; if (!p) next = Math.ceil(Date.now() / period) * period; } };
  }

  window.NPH = { mountSeal: mountSeal, mountTicker: mountTicker };
})();
