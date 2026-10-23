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
    var c = document.createElement('canvas'); c.width = W * 2; c.height = H * 2;
    var g = c.getContext('2d'); g.scale(2, 2);
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
    spaced(g, 'SECURITY FEATURE', cx, cy + 84, 6);
    if (orig) { g.font = '600 5px Arial, sans-serif'; g.textAlign = 'left'; var mline = ''; while (mline.length < 120) mline += 'AUTHENTICYOURBRAND'; g.fillText(mline, cx - 150, cy + 57); g.fillText(mline.slice(9), cx - 150, cy + 63); g.textAlign = 'center'; }
    else g.fillRect(cx - 150, cy + 56, 300, 6);
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
    'uniform vec3 uLoupe; uniform float uDepth; uniform vec2 uTile;',
    'varying vec2 vUv; varying vec3 vN; varying vec3 vV;',
    'vec3 hsv2rgb(vec3 c){ vec3 p = abs(fract(c.xxx + vec3(0.,2./3.,1./3.))*6.-3.); return c.z*mix(vec3(1.),clamp(p-1.,0.,1.),c.y); }',
    'void main(){',
    ' vec2 raw = (vUv - uBox.xy) / uBox.zw; vec2 st0 = uTile.x > .5 ? fract(raw) : clamp(raw, 0., 1.);',
    ' vec2 st = st0; float inLens = 0.; float ring = 0.;',
    ' if (uLoupe.z > 0.) {',
    '   vec2 d = (st0 - uLoupe.xy) * uBox.zw; float dl = length(d);',
    '   inLens = 1. - smoothstep(uLoupe.z - .004, uLoupe.z, dl);',
    '   ring = smoothstep(uLoupe.z - .022, uLoupe.z - .008, dl) * (1. - smoothstep(uLoupe.z, uLoupe.z + .012, dl));',
    '   st = mix(st0, uLoupe.xy + (st0 - uLoupe.xy) / 4., inLens);',
    ' }',
    ' vec3 V = normalize(vV); vec3 n = normalize(vN); if (!gl_FrontFacing) n = -n;',
    // layers: foil lines sit under the ink, ink floats on top -> visible depth when tilted
    ' vec2 par = V.xy * uDepth * (1. - inLens * .7);',
    ' float foil = texture2D(uTex, st + par).r;',
    ' float ink = texture2D(uTex, st - par * .5).g;',
    // emboss: foil lines are raised and catch the light
    ' float e = 1.2 / 2048.;',
    ' float fx = texture2D(uTex, st + par + vec2(e, 0.)).r - texture2D(uTex, st + par - vec2(e, 0.)).r;',
    ' float fy = texture2D(uTex, st + par + vec2(0., e)).r - texture2D(uTex, st + par - vec2(0., e)).r;',
    ' vec3 nb = normalize(n + vec3(-fx, -fy, 0.) * 1.4);',
    ' float ndv = clamp(dot(nb, V), 0., 1.);',
    ' float fres = pow(1. - ndv, 2.);',
    ' float grating = sin((st.x * .8 + st.y) * 520.) * .5 + .5;',
    ' float hue = fract(ndv * 2.4 + st.x * .9 - st.y * .55 + nb.x * 1.1 + nb.y * .7 + uTime * .03 + grating * .06);',
    ' vec3 holo = hsv2rgb(vec3(hue, .7, 1.));',
    ' vec3 holo2 = hsv2rgb(vec3(fract(hue + .33 + foil * .2), .75, 1.));',
    ' vec3 silver = vec3(.68, .70, .75);',
    ' vec3 col = mix(silver * .5, holo * .85, .45 + .45 * fres);',
    ' col = mix(col, holo2 * 1.3 + .1, foil * .8);',
    ' col *= .65 + .5 * ndv;',
    ' vec3 L = normalize(vec3(.45, .65, 1.)); vec3 Hh = normalize(L + V);',
    ' col += pow(max(dot(nb, Hh), 0.), 70.) * (.35 + foil * 1.2);',
    ' float streak = pow(max(0., sin((st.x + st.y) * 2.6 - uTime * .7 + n.x * 2.)), 24.) * .55;',
    ' col += streak;',
    ' col = mix(col, vec3(.04, .04, .05), ink * .92);',
    ' vec3 cp = texture2D(uCopy, st).rgb;',
    ' float y = uTile.x > .5 ? 1. - vUv.y / uTile.y : 1. - st0.y;',
    ' float isCopy = 1. - smoothstep(uScan - .015, uScan + .015, y);',
    ' vec3 outc = mix(col, cp, isCopy);',
    ' outc = mix(outc, vec3(.96), ring);',
    ' float beam = exp(-pow((y - uScan) * 60., 2.)) * uScanGlow;',
    ' outc += vec3(.55, .9, 1.) * beam;',
    ' gl_FragColor = vec4(outc, 1.);',
    '}'
  ].join('\n');

  function stripCanvas(mode, W, H) {
    var c = document.createElement('canvas'); c.width = W * 2; c.height = H * 2;
    var g = c.getContext('2d'); g.scale(2, 2);
    var orig = mode === 'orig', cx = W / 2;
    g.fillStyle = orig ? '#000' : '#d3d3cf'; g.fillRect(0, 0, W, H);
    if (!orig) for (var n = 0; n < 5000; n++) { g.fillStyle = 'rgba(0,0,0,' + (Math.random() * 0.06).toFixed(3) + ')'; g.fillRect(Math.random() * W, Math.random() * H, 2, 2); }
    g.globalCompositeOperation = orig ? 'lighter' : 'source-over';
    var line = orig ? function (a) { return 'rgba(255,0,0,' + a + ')'; } : function (a) { return 'rgba(110,110,108,' + (a * 0.5) + ')'; };
    var lw = orig ? 1 : 2.6;
    g.strokeStyle = line(0.3); g.lineWidth = lw;                               // fine diagonal lines (repeat-safe)
    for (var x = -H; x < W + H; x += 8) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x + H, H); g.stroke(); }
    for (var b = 0; b < 4; b++) {                                              // wavy guilloche bands running the length
      g.strokeStyle = line(0.7); g.lineWidth = lw * 1.1; g.beginPath();
      for (var y = 0; y <= H; y += 2) { var xx = W * (0.2 + b * 0.2) + 7 * Math.sin(y / H * Math.PI * 8 + b * 1.3); y ? g.lineTo(xx, y) : g.moveTo(xx, y); }
      g.stroke();
    }
    var my = H * 0.5, mr = W * 0.2;                                            // medallion: rosette ring
    for (var j = 0; j < 26; j++) { g.strokeStyle = line(orig ? 0.8 : 0.5); g.lineWidth = orig ? 1 : 3; g.beginPath();
      for (var t = 0; t <= Math.PI * 2 + 0.01; t += 0.01) { var rr = mr + 6 * Math.sin(9 * t + j * 0.24); var qx = cx + rr * Math.cos(t), qy = my + rr * Math.sin(t); t ? g.lineTo(qx, qy) : g.moveTo(qx, qy); }
      g.stroke(); }
    if (orig) {                                                                 // micro text running down both edges
      g.fillStyle = 'rgba(255,0,0,1)'; g.font = '600 9px Arial, sans-serif';
      var str = 'AUTHENTIC · YOUR BRAND · DO NOT COPY · ';
      [W * 0.06, W * 0.94].forEach(function (ex, side) { g.save(); g.translate(ex, side ? H : 0); g.rotate(side ? -Math.PI / 2 : Math.PI / 2); var s2 = ''; while (s2.length < 120) s2 += str; g.fillText(s2, 0, 3); g.restore(); });
    } else { g.fillStyle = 'rgba(95,95,93,.45)'; g.fillRect(W * 0.03, 0, 9, H); g.fillRect(W * 0.94, 0, 9, H); }
    g.globalCompositeOperation = 'source-over'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = orig ? 'rgba(0,255,0,1)' : 'rgba(55,55,55,.85)';
    g.save(); g.translate(cx, my); g.rotate(-Math.PI / 2); g.font = '800 30px "Arial Narrow", Arial, sans-serif'; g.fillText('AUTHENTIC', 0, 0); g.restore();
    g.save(); g.translate(cx, H * 0.06); g.font = '700 13px Arial, sans-serif'; g.fillText('YOUR BRAND', 0, 0); g.restore();
    g.save(); g.translate(cx, H * 0.94); g.font = '700 13px Arial, sans-serif'; g.fillText('YOUR BRAND', 0, 0); g.restore();
    g.save(); g.translate(cx, my); g.rotate(-0.42); g.font = '900 64px Arial, sans-serif';  // hidden VOID
    for (var vy = -6; vy <= 6; vy++) { g.fillStyle = orig ? 'rgba(255,0,0,.035)' : 'rgba(70,70,70,.42)'; g.fillText('VOID', (vy % 2) * 60, vy * 80); }
    g.restore();
    return c;
  }
  var stripTexCache = null;
  function stripTextures() {
    if (stripTexCache) return stripTexCache;
    var o = new THREE.CanvasTexture(stripCanvas('orig', 256, 512)), c = new THREE.CanvasTexture(stripCanvas('copy', 256, 512));
    [o, c].forEach(function (t) { t.anisotropy = 8; t.minFilter = THREE.LinearMipmapLinearFilter; });
    return (stripTexCache = { orig: o, copy: c });
  }
  // true-scale repeating holo material for strips and bands: tileW x tileH world units per artwork tile, span = strip length
  function holoStripMaterial(tileW, tileH, span) {
    var m = holoMaterial([0, 0, tileW, tileH]), tx = stripTextures();
    m.uniforms.uTex.value = tx.orig; m.uniforms.uCopy.value = tx.copy; m.uniforms.uTile.value.set(1, span); return m;
  }
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
        uScan: { value: -0.05 }, uScanGlow: { value: 0 }, uLoupe: { value: new THREE.Vector3(0, 0, 0) }, uDepth: { value: 0.018 }, uTile: { value: new THREE.Vector2(0, 1) }, uBox: { value: new THREE.Vector4(box[0], box[1], box[2], box[3]) }
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

  // ---------- Security label artwork: landscape, fills the whole label ----------
  function labelCanvas(mode, W, H) {
    var c = document.createElement('canvas'); c.width = W * 2; c.height = H * 2;
    var g = c.getContext('2d'); g.scale(2, 2);
    var orig = mode === 'orig';
    g.fillStyle = orig ? '#000' : '#d3d3cf'; g.fillRect(0, 0, W, H);
    if (!orig) for (var n = 0; n < 8000; n++) { g.fillStyle = 'rgba(0,0,0,' + (Math.random() * 0.06).toFixed(3) + ')'; g.fillRect(Math.random() * W, Math.random() * H, 2, 2); }
    g.globalCompositeOperation = orig ? 'lighter' : 'source-over';
    var line = orig ? function (a) { return 'rgba(255,0,0,' + a + ')'; } : function (a) { return 'rgba(110,110,108,' + (a * 0.5) + ')'; };
    var ink = orig ? 'rgba(0,255,0,1)' : 'rgba(55,55,55,.85)', lw = orig ? 1 : 2.6;
    g.strokeStyle = line(0.3); g.lineWidth = lw;                                     // fine diagonal lines, edge to edge
    for (var x = -H; x < W; x += 7) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x + H, H); g.stroke(); }
    var m = 26;                                                                      // wavy guilloche frame
    for (var b = 0; b < 3; b++) {
      var inset = m + b * 7; g.strokeStyle = line(0.75); g.lineWidth = lw * 1.1; g.beginPath();
      var per = 2 * (W - 2 * inset) + 2 * (H - 2 * inset), steps = 1400;
      for (var i = 0; i <= steps; i++) {
        var d = i / steps * per, px, py, nx = 0, ny = 0, wv = 4 * Math.sin(d / 9 + b);
        if (d < W - 2 * inset) { px = inset + d; py = inset; ny = 1; }
        else if (d < W - 2 * inset + H - 2 * inset) { px = W - inset; py = inset + d - (W - 2 * inset); nx = -1; }
        else if (d < 2 * (W - 2 * inset) + H - 2 * inset) { px = W - inset - (d - (W - 2 * inset) - (H - 2 * inset)); py = H - inset; ny = -1; }
        else { px = inset; py = H - inset - (d - 2 * (W - 2 * inset) - (H - 2 * inset)); nx = 1; }
        px += nx * wv; py += ny * wv; i ? g.lineTo(px, py) : g.moveTo(px, py);
      }
      g.stroke();
    }
    var mx = H * 0.52, my = H * 0.5, R = H * 0.3;                                    // medallion on the left
    for (var j = 0; j < 34; j++) { g.strokeStyle = line(orig ? 0.78 : 0.5); g.lineWidth = orig ? 1.1 : 3.2; g.beginPath();
      for (var t = 0; t <= Math.PI * 2 + 0.01; t += 0.006) { var rr = R + 14 * Math.sin(7 * t + j * 0.17) + 6 * Math.sin(17 * t - j * 0.1); var qx = mx + rr * Math.cos(t), qy = my + rr * Math.sin(t); t ? g.lineTo(qx, qy) : g.moveTo(qx, qy); }
      g.stroke(); }
    var str = 'AUTHENTIC · YOUR BRAND · DO NOT COPY · ';
    if (orig) {                                                                      // micro text: ring round the medallion + lines inside the frame
      g.fillStyle = 'rgba(255,0,0,1)'; g.font = '600 9px Arial, sans-serif';
      var k = 0, mr = R + 34; for (var a = 0; a < Math.PI * 2 - 0.02; a += 0.0185) { g.save(); g.translate(mx + mr * Math.cos(a), my + mr * Math.sin(a)); g.rotate(a + Math.PI / 2); g.fillText(str[k % str.length], -2.5, 3); g.restore(); k++; }
      var s2 = ''; while (s2.length < 260) s2 += str;
      g.font = '600 8px Arial, sans-serif'; g.fillText(s2, m + 30, m + 30); g.fillText(s2, m + 30, H - m - 24);
    } else { g.fillStyle = 'rgba(95,95,93,.4)'; g.fillRect(m + 30, m + 23, W - 2 * m - 60, 9); g.fillRect(m + 30, H - m - 31, W - 2 * m - 60, 9);
      g.strokeStyle = 'rgba(95,95,93,.4)'; g.lineWidth = 12; g.beginPath(); g.arc(mx, my, R + 34, 0, Math.PI * 2); g.stroke(); }
    g.globalCompositeOperation = 'source-over'; g.fillStyle = ink; g.textBaseline = 'middle';
    g.textAlign = 'center'; g.font = '900 30px "Arial Narrow", Arial, sans-serif'; g.fillText('✓', mx, my - 6); g.font = '800 15px Arial, sans-serif'; spaced(g, 'GENUINE', mx, my + 26, 4);
    var tx = H * 0.98;                                                               // text block on the right
    g.textAlign = 'left'; g.font = '700 26px Arial, sans-serif'; var sx = tx; 'YOUR BRAND'.split('').forEach(function (ch) { g.fillText(ch, sx, H * 0.27); sx += g.measureText(ch).width + 7; });
    var avail = W - m - 34 - tx, fs = 112; g.font = '800 ' + fs + 'px "Arial Narrow", Arial, sans-serif';
    while (g.measureText('AUTHENTIC').width > avail && fs > 40) { fs -= 2; g.font = '800 ' + fs + 'px "Arial Narrow", Arial, sans-serif'; }
    g.fillText('AUTHENTIC', tx - 4, H * 0.5);
    if (orig) { g.globalCompositeOperation = 'lighter'; g.strokeStyle = 'rgba(255,0,0,.9)'; g.lineWidth = 1.5; g.strokeText('AUTHENTIC', tx - 4, H * 0.5); g.globalCompositeOperation = 'source-over'; }
    g.fillStyle = ink; g.font = '600 20px Arial, sans-serif'; sx = tx; 'SECURITY FEATURE'.split('').forEach(function (ch) { g.fillText(ch, sx, H * 0.7); sx += g.measureText(ch).width + 5; });
    g.font = '700 18px "Courier New", monospace'; g.fillText('No. 0425 1187 · LOT A', tx, H * 0.8);
    g.save(); g.translate(W / 2, H / 2); g.rotate(-0.42); g.font = '900 120px Arial, sans-serif';  // hidden VOID
    for (var vy = -4; vy <= 4; vy++) for (var vx = -3; vx <= 3; vx++) { g.fillStyle = orig ? 'rgba(255,0,0,.035)' : 'rgba(70,70,70,.42)'; g.fillText('VOID', vx * 330 + (vy % 2) * 165 - 120, vy * 160); }
    g.restore();
    return c;
  }
  var labelTexCache = null;
  function labelTextures() {
    if (labelTexCache) return labelTexCache;
    var o = new THREE.CanvasTexture(labelCanvas('orig', 1024, 635)), c = new THREE.CanvasTexture(labelCanvas('copy', 1024, 635));
    [o, c].forEach(function (t) { t.anisotropy = 8; t.minFilter = THREE.LinearMipmapLinearFilter; });
    return (labelTexCache = { orig: o, copy: c });
  }
  function rrectShape(w, h, r) { var s = new THREE.Shape(), x = -w / 2, y = -h / 2; s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h); s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s; }
  function stripGeo(path, width, nu) { // ribbon following [x,y,z] points; UVs in world units (true scale)
    var pos = [], uv = [], idx = [], len = [0];
    for (var i = 1; i < path.length; i++) len.push(len[i - 1] + Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1], path[i][2] - path[i - 1][2]));
    var L = len[len.length - 1];
    path.forEach(function (p, i) { for (var u = 0; u <= nu; u++) { pos.push(p[0] + (u / nu - .5) * width, p[1], p[2]); uv.push(u / nu * width, L - len[i]); } });
    for (var j = 0; j < path.length - 1; j++) for (var k = 0; k < nu; k++) { var A = j * (nu + 1) + k, B = A + nu + 1; idx.push(A, B, A + 1, B, B + 1, A + 1); }
    var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); g.userData.length = L; return g;
  }
  function cartonWithStrip() {
    var g = new THREE.Group(), W = 1.9, H = 1.05, D = 1.25, r = 0.015;
    var c = document.createElement('canvas'); c.width = 512; c.height = 512; var x = c.getContext('2d');
    x.fillStyle = '#121214'; x.fillRect(0, 0, 512, 512); var og = x.createLinearGradient(0, 300, 0, 512); og.addColorStop(0, '#ff7a1a'); og.addColorStop(1, '#ff4d00'); x.fillStyle = og; x.fillRect(0, 360, 512, 152);
    for (var n = 0; n < 6000; n++) { x.fillStyle = 'rgba(255,255,255,' + (Math.random() * .03) + ')'; x.fillRect(Math.random() * 512, Math.random() * 512, 1, 1); }
    var tex = new THREE.CanvasTexture(c); tex.encoding = THREE.sRGBEncoding;
    var board = new THREE.MeshPhysicalMaterial({ map: tex, roughness: .55, clearcoat: .35, clearcoatRoughness: .4 });
    var rs = new THREE.Shape(), bw = W / 2 - r * 3, bh = H / 2 - r * 3; rs.moveTo(-bw, -bh); rs.lineTo(bw, -bh); rs.lineTo(bw, bh); rs.lineTo(-bw, bh); rs.lineTo(-bw, -bh);
    var bg = new THREE.ExtrudeGeometry(rs, { depth: D - r * 6, bevelEnabled: true, bevelThickness: r * 3, bevelSize: r * 3, bevelSegments: 5, curveSegments: 8 });
    bg.translate(0, 0, -(D - r * 6) / 2);
    var bb = new THREE.Box3().setFromBufferAttribute(bg.attributes.position), uvA = bg.attributes.uv, P = bg.attributes.position;
    for (var q = 0; q < P.count; q++) uvA.setXY(q, (P.getX(q) - bb.min.x) / (bb.max.x - bb.min.x), (P.getY(q) - bb.min.y) / (bb.max.y - bb.min.y));
    g.add(new THREE.Mesh(bg, board));
    var seam = new THREE.Mesh(new THREE.BoxGeometry(W + .002, .006, D + .002), new THREE.MeshBasicMaterial({ color: 0x050505 })); seam.position.y = H / 2 - 0.12; g.add(seam);
    var t = H / 2 + .002, f = D / 2 + .002, path = [];
    for (var z = -0.35; z <= f - r; z += 0.05) path.push([0, t, z]);
    for (var a = 0; a <= 1.0001; a += 0.1) { var an = a * Math.PI / 2; path.push([0, t - r + r * Math.cos(an), f - r + r * Math.sin(an)]); }
    for (var y = t - r - 0.05; y >= t - 0.55; y -= 0.05) path.push([0, y, f]);
    var sg = stripGeo(path, 0.36, 10); g.add(new THREE.Mesh(sg, holoStripMaterial(0.36, 0.72, sg.userData.length)));
    g.rotation.set(0.42, -0.6, 0); g.position.y = -0.05; return g;
  }

  // ---------- Security seal: shield, security label or tamper strip ----------
  function mountSeal(o) {
    if (!THREE) return;
    var stage = o.stage, renderer;
    try { renderer = makeRenderer(stage); } catch (e) { return; }
    var scene = new THREE.Scene();
    try { scene.environment = studioEnv(renderer); } catch (e) {}
    var camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
    camera.position.set(0, 0, 6.2);
    sizeTo(renderer, camera, stage);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x222222, 0.6));
    var kl = new THREE.DirectionalLight(0xffffff, 1.2); kl.position.set(2, 3, 4); scene.add(kl);
    var rim = new THREE.DirectionalLight(0xbfd4ff, 0.7); rim.position.set(-3, 2, -4); scene.add(rim);
    var edge = new THREE.MeshStandardMaterial({ color: 0xcfd2d8, metalness: 0.9, roughness: 0.25 });

    var shapes = {};
    // shield (approved)
    var sgeo = new THREE.ExtrudeGeometry(shieldShape(), { depth: 0.05, bevelEnabled: true, bevelThickness: 0.025, bevelSize: 0.03, bevelSegments: 4, curveSegments: 64 });
    sgeo.center();
    var smat = holoMaterial([-1.03, -1.25, 2.06, 2.48]);
    shapes.shield = { obj: new THREE.Mesh(sgeo, [smat, edge]), box: [-1.03, -1.25, 2.06, 2.48], orbit: function (a) { return [0.5 + 0.385 * Math.cos(a), 0.53 - 0.3476 * Math.sin(a)]; } };
    // security label: its own landscape art mapped exactly to the label
    var LW = 2.5, LH = 1.55, lgeo = new THREE.ExtrudeGeometry(rrectShape(LW, LH, 0.1), { depth: 0.035, bevelEnabled: true, bevelThickness: 0.018, bevelSize: 0.022, bevelSegments: 4, curveSegments: 32 });
    lgeo.translate(0, 0, -0.0525);
    var lmat = holoMaterial([-LW / 2, -LH / 2, LW, LH]), lt = labelTextures(); lmat.uniforms.uTex.value = lt.orig; lmat.uniforms.uCopy.value = lt.copy;
    shapes.label = { obj: new THREE.Mesh(lgeo, [lmat, edge]), box: [-LW / 2, -LH / 2, LW, LH], orbit: function (a) { var c = 0.5 + 0.5 * Math.sin(a * 0.8); return [0.16 + c * 0.68, 0.135]; } };
    // tamper strip over a carton seam
    shapes.strip = { obj: cartonWithStrip(), box: null, orbit: null };

    var group = new THREE.Group(); scene.add(group);
    Object.keys(shapes).forEach(function (k) { var s = shapes[k]; s.mats = []; s.obj.traverse(function (m) { if (m.material) [].concat(m.material).forEach(function (x) { if (x.uniforms && x.uniforms.uTime) s.mats.push(x); }); }); s.obj.visible = false; group.add(s.obj); });
    var cur = shapes[o.shape] ? o.shape : 'shield'; shapes[cur].obj.visible = true;

    var px = 0, py = 0, tx = 0, ty = 0, ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), hover = null, lx = 0.5, ly = 0.5;
    stage.addEventListener('pointermove', function (e) {
      var b = stage.getBoundingClientRect();
      tx = ((e.clientX - b.left) / b.width - 0.5) * 2; ty = ((e.clientY - b.top) / b.height - 0.5) * 2;
      var s = shapes[cur]; hover = null; if (!s.box) return;
      ndc.set(tx, -ty); ray.setFromCamera(ndc, camera);
      var hit = ray.intersectObject(s.obj)[0];
      if (hit && hit.uv && hit.face && hit.face.normal.z > 0.5) hover = { x: (hit.uv.x - s.box[0]) / s.box[2], y: (hit.uv.y - s.box[1]) / s.box[3] };
    });
    stage.addEventListener('pointerleave', function () { tx = 0; ty = 0; hover = null; });

    var mode = 'orig', scanFrom = -0.05, scanTo = -0.05, scanStart = 0, auto = !reduce, last = performance.now();
    function setMode(m, fromUser) {
      if (fromUser) auto = false;
      if (m === mode) return;
      mode = m; scanFrom = shapes[cur].mats[0] ? shapes[cur].mats[0].uniforms.uScan.value : -0.05; scanTo = m === 'copy' ? 1.05 : -0.05; scanStart = performance.now();
      if (o.onMode) o.onMode(m);
    }
    function setShape(k) { if (!shapes[k] || k === cur) return; shapes[cur].obj.visible = false; cur = k; shapes[cur].obj.visible = true; hover = null; if (o.onShape) o.onShape(k); }
    var nextAuto = 0, t0 = performance.now();
    function frame(now) {
      requestAnimationFrame(frame);
      if (!onScreen(stage)) return;
      last = now;
      var t = (now - t0) / 1000;
      if (!nextAuto) nextAuto = now + 2600;
      if (auto && now > nextAuto) { setMode(mode === 'orig' ? 'copy' : 'orig'); nextAuto = now + (mode === 'copy' ? 3400 : 3800); }
      var sd = reduce ? 1 : clamp((now - scanStart) / 1300, 0, 1), scan = scanFrom + (scanTo - scanFrom) * easeInOut(sd);
      var s = shapes[cur], a = reduce ? -0.9 : -0.9 + t * 0.35;
      if (s.box) { var gp = hover ? [hover.x, hover.y] : s.orbit(a); lx += (gp[0] - lx) * 0.18; ly += (gp[1] - ly) * 0.18; }
      s.mats.forEach(function (m) { m.uniforms.uScan.value = scan; m.uniforms.uScanGlow.value = sd < 1 ? 1 : 0; m.uniforms.uTime.value = t; m.uniforms.uLoupe.value.set(lx, ly, s.box ? (cur === 'label' ? 0.26 : 0.34) : 0); });
      px += (tx - px) * 0.08; py += (ty - py) * 0.08;
      var sway = reduce ? 0 : 1;
      group.rotation.y = (Math.sin(t * 0.6) * 0.35 * sway) + px * 0.45;
      group.rotation.x = (Math.sin(t * 0.45) * 0.12 * sway) + py * 0.3 - 0.05;
      group.position.y = Math.sin(t * 0.9) * 0.04 * sway;
      renderer.render(scene, camera);
    }
    requestAnimationFrame(frame);
    return { setMode: setMode, setShape: setShape };
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
  // ---- studio helpers ----
  function phys(o) { var m = new THREE.MeshPhysicalMaterial(o); m.envMapIntensity = o.envMapIntensity == null ? 1 : o.envMapIntensity; return m; }
  function hex(c) { return new THREE.Color(c).convertSRGBToLinear(); }
  function grain(x, w, h, a) { var d = x.getImageData(0, 0, w, h), p = d.data; for (var i = 0; i < p.length; i += 4) { var n = (Math.random() - .5) * a; p[i] += n; p[i + 1] += n; p[i + 2] += n; } x.putImageData(d, 0, 0); }

  function makeCan() {
    var g = new THREE.Group();
    var sleeve = canvasTex(2048, 1024, function (x, w, h) {
      var bg = x.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, '#141416'); bg.addColorStop(1, '#050506'); x.fillStyle = bg; x.fillRect(0, 0, w, h);
      // bold orange wave band
      var og = x.createLinearGradient(0, h * .35, 0, h * .9); og.addColorStop(0, '#ff7a1a'); og.addColorStop(1, '#ff4d00');
      x.fillStyle = og; x.beginPath(); x.moveTo(0, h * .58);
      for (var X = 0; X <= w; X += 8) x.lineTo(X, h * .58 + Math.sin(X / w * Math.PI * 4) * h * .06);
      x.lineTo(w, h); x.lineTo(0, h); x.closePath(); x.fill();
      x.fillStyle = 'rgba(255,255,255,.12)'; for (var k = 0; k < 4; k++) { x.fillRect(0, h * (.74 + k * .045), w, 3); }
      // vertical brand stack, repeated twice around the can
      [w * .18, w * .68].forEach(function (cx) {
        x.save(); x.translate(cx, h * .42); x.rotate(-Math.PI / 2);
        x.fillStyle = '#f4f2ee'; x.font = '900 150px "Arial Narrow", "Helvetica Neue", Arial, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
        x.fillText('YOUR', 0, -82); x.fillText('BRAND', 0, 78); x.restore();
        x.fillStyle = '#ff6a00'; x.font = '700 34px Arial, sans-serif'; x.textAlign = 'center'; x.fillText('ZERO SUGAR · ENERGY', cx + 210, h * .16);
        x.fillStyle = 'rgba(244,242,238,.75)'; x.font = '600 26px Arial, sans-serif'; x.fillText('12 FL OZ (355 mL)', cx + 210, h * .93);
      });
      grain(x, w, h, 10);
    });
    sleeve.wrapS = THREE.RepeatWrapping;
    var alu = phys({ color: hex('#d9dbe0'), metalness: 1, roughness: .26, envMapIntensity: 1.4 });
    var aluDark = phys({ color: hex('#b7bac1'), metalness: 1, roughness: .4 });
    // body (sleeve) + aluminium shoulder, neck and dome, 66 mm x 122 mm
    g.add(new THREE.Mesh(lathe([[0.300, 0.07], [0.322, 0.11], [0.330, 0.16], [0.330, 1.02], [0.322, 1.08], [0.300, 1.12]], 160), phys({ map: sleeve, roughness: .28, clearcoat: 1, clearcoatRoughness: .12, envMapIntensity: 1.1 })));
    g.add(new THREE.Mesh(lathe([[0, 0.05], [0.18, 0.02], [0.255, 0.0], [0.285, 0.02], [0.300, 0.07]], 160), alu));
    g.add(new THREE.Mesh(lathe([[0.300, 1.12], [0.282, 1.16], [0.268, 1.19], [0.266, 1.205], [0.275, 1.215], [0.270, 1.225], [0.255, 1.215], [0.238, 1.2], [0.236, 1.196]], 160), alu));
    var lid = new THREE.Mesh(new THREE.CircleGeometry(0.238, 96), aluDark); lid.rotation.x = -Math.PI / 2; lid.position.y = 1.196; g.add(lid);
    var tab = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.008, 0.19), alu); tab.position.set(0, 1.203, 0.03); g.add(tab);
    return g;
  }
  function makeBottle() {
    var g = new THREE.Group();
    var prof = [[0, 0.02], [0.30, 0.0], [0.355, 0.03], [0.365, 0.08], [0.365, 1.02], [0.35, 1.12], [0.29, 1.24], [0.17, 1.36], [0.125, 1.44], [0.12, 1.62], [0.132, 1.65], [0.132, 1.70], [0, 1.70]];
    // Liquid: amber shell + deep core for depth, and a live surface that sloshes and ripples
    var L = 0.97, LR = 0.345;
    var liquid = liquidMaterial(false);
    var shellGeo = lathe([[0, 0.06], [0.33, 0.05], [LR - 0.004, 0.085], [LR, 0.12], [LR, L]], 160);
    var liq = new THREE.Mesh(shellGeo, liquid); liq.renderOrder = 1; g.add(liq);
    var surfGeo = new THREE.RingGeometry(0.0001, LR, 160, 28); surfGeo.rotateX(-Math.PI / 2);
    var surf = new THREE.Mesh(surfGeo, liquidMaterial(true));
    surf.position.y = L; surf.renderOrder = 1; g.add(surf);
    var sp = surfGeo.attributes.position, sBase = Float32Array.from(sp.array);
    var wp = shellGeo.attributes.position, wTop = [];
    for (var wi = 0; wi < wp.count; wi++) if (wp.getY(wi) > L - 1e-4) wTop.push(wi);
    function wave(x, z, t) {
      var r = Math.sqrt(x * x + z * z);
      return 0.032 * Math.sin(t * 1.9) * (x / LR) + 0.018 * Math.cos(t * 1.35 + 0.6) * (z / LR)   // slosh
        + 0.006 * Math.sin(r * 26 - t * 4.2) * (0.4 + r / LR)                                       // rings
        + 0.004 * Math.sin(x * 15 + z * 9 + t * 3.1);                                               // chop
    }
    g.userData.tick = function (t) {
      for (var i = 0; i < sp.count; i++) { var x = sBase[i * 3], z = sBase[i * 3 + 2]; sp.setY(i, wave(x, z, t)); }
      sp.needsUpdate = true; surfGeo.computeVertexNormals();
      for (var k = 0; k < wTop.length; k++) { var j = wTop[k]; wp.setY(j, L + wave(wp.getX(j), wp.getZ(j), t)); }
      wp.needsUpdate = true;
    };
    g.userData.tick(0);
    // glass: inner wall (back faces) + thick base + outer wall, drawn after the liquid
    var inner = prof.map(function (q) { return [Math.max(0, q[0] - 0.014), q[1]]; }); inner[0] = [0, 0.09]; inner[1] = [0.27, 0.075];
    var gIn = new THREE.Mesh(lathe(inner.slice(0, -2), 160), glassMaterial(true)); gIn.renderOrder = 2; g.add(gIn);
    var base = new THREE.Mesh(lathe([[0, 0.02], [0.3, 0.0], [0.35, 0.03], [0.351, 0.075], [0.27, 0.075], [0.12, 0.1], [0, 0.11]], 160), glassMaterial(false)); base.renderOrder = 2; g.add(base);
    var gl = new THREE.Mesh(lathe(prof, 160), glassMaterial(false)); gl.renderOrder = 3; g.add(gl);
    // wooden stopper with a dark top
    var wood = canvasTex(512, 256, function (x, w, h) { x.fillStyle = '#6b4526'; x.fillRect(0, 0, w, h); for (var i = 0; i < 90; i++) { x.strokeStyle = 'rgba(30,15,5,' + (Math.random() * .25) + ')'; x.lineWidth = 1 + Math.random() * 2; x.beginPath(); var yy = Math.random() * h; x.moveTo(0, yy); x.bezierCurveTo(w * .3, yy + 6, w * .6, yy - 6, w, yy + 3); x.stroke(); } });
    var stop = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.2, 96), phys({ map: wood, roughness: .7, envMapIntensity: .5 })); stop.position.y = 1.80; g.add(stop);
    var cap = new THREE.Mesh(new THREE.CylinderGeometry(0.172, 0.172, 0.04, 96), phys({ color: hex('#141414'), roughness: .35, clearcoat: .8 })); cap.position.y = 1.92; g.add(cap);
    var lab = canvasTex(2048, 900, function (x, w, h) {
      x.fillStyle = '#efe7d6'; x.fillRect(0, 0, w, h); grain(x, w, h, 14);
      var cx = w * .5;
      x.strokeStyle = '#1b1b1b'; x.lineWidth = 3; x.strokeRect(cx - 330, 40, 660, h - 80); x.lineWidth = 1; x.strokeRect(cx - 316, 54, 632, h - 108);
      x.fillStyle = '#1b1b1b'; x.textAlign = 'center'; x.font = '600 34px Georgia, "Times New Roman", serif'; x.fillText('S M A L L   B A T C H', cx, h * .2);
      x.font = '700 150px Georgia, "Times New Roman", serif'; x.fillText('YOUR', cx, h * .44); x.fillText('BRAND', cx, h * .62);
      x.font = 'italic 40px Georgia, serif'; x.fillText('Straight Bourbon Whiskey', cx, h * .74);
      x.font = '600 28px Georgia, serif'; x.fillText('750 mL · 45% ALC/VOL', cx, h * .86);
    });
    // paper label bonded to the glass: tight radius, wraps 216 degrees, thin adhesive shadow at its edges, plain paper back
    var LRAD = 0.3662, LA = Math.PI * 1.2;
    var lgeo = new THREE.CylinderGeometry(LRAD, LRAD, 0.66, 192, 1, true, -LA / 2, LA);
    var label = new THREE.Mesh(lgeo, phys({ map: lab, roughness: .6, clearcoat: .25, clearcoatRoughness: .5, envMapIntensity: .6 }));
    label.position.y = 0.52; g.add(label);
    var lback = new THREE.Mesh(lgeo, phys({ color: hex('#cfc7b6'), roughness: .9, envMapIntensity: .2, side: THREE.BackSide })); lback.position.y = 0.52; g.add(lback);
    var lsh = new THREE.Mesh(new THREE.CylinderGeometry(0.3654, 0.3654, 0.674, 192, 1, true, -LA / 2 - 0.02, LA + 0.04), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: .45, depthWrite: false }));
    lsh.position.y = 0.52; g.add(lsh);
    // holographic tamper seal: one strip laid over the cap top, down the stopper and onto the neck, following the surfaces
    var path = [[0.0, 1.9415], [0.12, 1.9415], [0.165, 1.9405], [0.1735, 1.932], [0.1738, 1.90], [0.1738, 1.705], [0.168, 1.7015], [0.1335, 1.7015],
      [0.1338, 1.65], [0.1225, 1.622], [0.1218, 1.58], [0.1235, 1.50], [0.1245, 1.46]];
    var SW = 0.075, NU = 12, pos = [], uv = [], idx = [], len = [0];
    for (var pi = 1; pi < path.length; pi++) len.push(len[pi - 1] + Math.hypot(path[pi][0] - path[pi - 1][0], path[pi][1] - path[pi - 1][1]));
    path.forEach(function (q, i) {
      for (var u = 0; u <= NU; u++) {
        var off = (u / NU - 0.5) * SW, r = q[0];
        // on the flat top the strip runs straight across; on the walls it wraps at the wall radius
        var x, z; if (r < 0.15 && i < 3) { x = off; z = r; } else { var a2 = off / r; x = r * Math.sin(a2); z = r * Math.cos(a2); }
        pos.push(x, q[1], z); uv.push(u / NU, 1 - len[i] / len[len.length - 1]);
      }
    });
    for (var i2 = 0; i2 < path.length - 1; i2++) for (var u2 = 0; u2 < NU; u2++) { var A = i2 * (NU + 1) + u2, B = A + NU + 1; idx.push(A, B, A + 1, B, B + 1, A + 1); }
    var sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); sg.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); sg.setIndex(idx); sg.computeVertexNormals();
    g.add(new THREE.Mesh(sg, holoMaterial([0, 0, 1, 1])));
    return g;
  }
  // ===================== NutraPack 3D render standard =====================
  // Approved references: the tub, the can and the security lamination. Every product follows these rules.
  // 1. Geometry  - real proportions in mm (MM = 1/30). Round parts are lathe profiles, 160 segments.
  //               No hard 90-degree edges: every rim and corner gets a small radius. Parts meet at real seams.
  // 2. Materials - only the FINISH presets below (the can sleeve finish is the reference for print).
  // 3. Artwork   - canvasTex at 2048 px on the long side, sRGB, brand palette from ART, grain 6-10,
  //               "YOUR BRAND" set in 900 Arial Narrow; the front of the art faces the camera at rotation 0.
  // 4. Light     - studioEnv() reflections + the ticker's four lights. No per-object lights.
  // 5. Staging   - normalize() to the ticker height, which adds the contact shadow.
  // 6. Security  - holographic features always use holoMaterial(), never a flat rainbow texture.
  var ART = { ink: '#0d0d0f', ink2: '#141416', paper: '#f4f2ee', orangeA: '#ff7a1a', orangeB: '#ff4d00', font: '"Arial Narrow", "Helvetica Neue", Arial, sans-serif' };
  var FINISH = {
    printGloss: function (map) { return phys({ map: map, roughness: .28, clearcoat: 1, clearcoatRoughness: .12, envMapIntensity: 1.1, transparent: false, alphaTest: .5 }); },
    paperMatte: function (map) { return phys({ map: map, roughness: .8, clearcoat: .15, clearcoatRoughness: .6, envMapIntensity: .45, alphaTest: .5 }); },
    linerGloss: function (map) { return phys({ map: map, roughness: .3, clearcoat: .9, clearcoatRoughness: .2, envMapIntensity: .8, alphaTest: .5 }); },
    aluminium: function () { return phys({ color: hex('#d9dbe0'), metalness: 1, roughness: .26, envMapIntensity: 1.4 }); }
  };
  function roundRect(x, X, Y, W, H, r) { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + W, Y, X + W, Y + H, r); x.arcTo(X + W, Y + H, X, Y + H, r); x.arcTo(X, Y + H, X, Y, r); x.arcTo(X, Y, X + W, Y, r); x.closePath(); }

  // Single die-cut label, kiss-cut on its liner, top corner peeling up. 95 x 64 mm landscape on a 101 x 70 mm liner.
  function makeLabel() {
    var g = new THREE.Group();
    var W = 95 * MM * 0.66, H = 64 * MM * 0.66, M = 3 * MM * 0.66, LW = W + 2 * M, LH = H + 2 * M, R = 0.07;
    var PX = 2048, PY = Math.round(PX * H / W), scale = PX / W;
    var front = canvasTex(PX, PY, function (x, w, h) {
      roundRect(x, 0, 0, w, h, R * scale); x.save(); x.clip();
      var bg = x.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, ART.ink2); bg.addColorStop(1, '#050506'); x.fillStyle = bg; x.fillRect(0, 0, w, h);
      var og = x.createLinearGradient(0, h * .6, 0, h); og.addColorStop(0, ART.orangeA); og.addColorStop(1, ART.orangeB);
      x.fillStyle = og; x.beginPath(); x.moveTo(0, h * .72);
      for (var X = 0; X <= w; X += 6) x.lineTo(X, h * .72 + Math.sin(X / w * Math.PI * 2) * h * .045);
      x.lineTo(w, h); x.lineTo(0, h); x.closePath(); x.fill();
      x.fillStyle = 'rgba(255,255,255,.12)'; for (var k = 0; k < 3; k++) x.fillRect(0, h * (.86 + k * .04), w, 3);
      x.textAlign = 'center'; x.textBaseline = 'middle';
      x.fillStyle = ART.orangeA; x.font = '700 62px Arial, sans-serif'; x.fillText('DIETARY SUPPLEMENT', w / 2, h * .14);
      x.fillStyle = ART.paper; x.font = '900 250px ' + ART.font; x.fillText('YOUR BRAND', w / 2, h * .38);
      x.fillStyle = 'rgba(244,242,238,.85)'; x.font = '700 66px Arial, sans-serif'; x.fillText('MAGNESIUM GLYCINATE', w / 2, h * .585);
      x.fillStyle = ART.ink; x.font = '800 62px Arial, sans-serif'; x.fillText('120 CAPSULES · 400 MG', w / 2, h * .85);
      x.restore(); grain(x, w, h, 8);
    });
    var back = canvasTex(256, Math.round(256 * H / W), function (x, w, h) { roundRect(x, 0, 0, w, h, R * w / W); x.fillStyle = '#e9e7e1'; x.fill(); });
    var liner = canvasTex(PX, Math.round(PX * LH / LW), function (x, w, h) {
      var s = w / LW; roundRect(x, 0, 0, w, h, (R + M * .5) * s); x.fillStyle = '#f1efe9'; x.fill();
      x.save(); x.clip();
      // soft shadow where the label sits on the liner
      x.filter = 'blur(10px)'; x.fillStyle = 'rgba(0,0,0,.28)'; roundRect(x, M * s + 4, M * s + 8, W * s, H * s, R * s); x.fill(); x.filter = 'none';
      x.fillStyle = 'rgba(0,0,0,.05)'; x.font = '700 22px Arial, sans-serif'; x.textAlign = 'center';
      for (var yy = 30; yy < h; yy += 60) x.fillText('NUTRAPACK · NUTRAPACK · NUTRAPACK · NUTRAPACK', w / 2, yy);
      x.restore(); grain(x, w, h, 6);
    });
    // gentle bow across the width, and a curl lifting the top-right corner
    var dir = new THREE.Vector2(1, 1).normalize(), Rc = 0.19, peel = 0.5;
    function bend(geo, lift, curl) {
      var p = geo.attributes.position, v = new THREE.Vector2(), c0 = new THREE.Vector2(W / 2, H / 2).sub(dir.clone().multiplyScalar(peel));
      for (var i = 0; i < p.count; i++) {
        v.set(p.getX(i), p.getY(i)); var z = -0.1 * Math.pow(v.x / (LW / 2), 2) + lift;
        if (curl) { var sd = v.clone().sub(c0).dot(dir); if (sd > 0) { var th = sd / Rc; v.sub(dir.clone().multiplyScalar(sd - Rc * Math.sin(th))); z += Rc * (1 - Math.cos(th)); } }
        p.setXYZ(i, v.x, v.y, z);
      }
      geo.computeVertexNormals(); return geo;
    }
    g.add(new THREE.Mesh(bend(new THREE.PlaneGeometry(LW, LH, 60, 80), 0, false), FINISH.linerGloss(liner)));
    var lg = bend(new THREE.PlaneGeometry(W, H, 90, 120), 0.006, true);
    g.add(new THREE.Mesh(lg, FINISH.printGloss(front)));
    var bk = new THREE.Mesh(lg, FINISH.paperMatte(back)); bk.material.side = THREE.BackSide; g.add(bk);
    // round holographic security seal (the approved lamination) on the lower left of the label
    var sr = 0.15, sx = W / 2 - 0.27, sy = -H / 2 + 0.3;
    var seal = new THREE.Mesh(new THREE.CircleGeometry(sr, 96), holoMaterial([-0.214, -0.257, 1.4286, 1.4286]));
    var slope = -0.2 * sx / Math.pow(LW / 2, 2);
    seal.position.set(sx, sy, -0.1 * Math.pow(sx / (LW / 2), 2) + 0.016); seal.rotation.y = -Math.atan(slope); g.add(seal);
    g.rotation.x = -0.12;
    return g;
  }

  // Studio environment: dark room with soft boxes, so materials get real reflections
  var studioCanvasCache = null;
  function studioCanvas() { if (!studioCanvasCache) { studioEnvDraw(); } return studioCanvasCache; }
  function studioEnv(renderer) {
    var tex = new THREE.CanvasTexture(studioCanvas()); tex.mapping = THREE.EquirectangularReflectionMapping; tex.encoding = THREE.sRGBEncoding;
    var pm = new THREE.PMREMGenerator(renderer); var rt = pm.fromEquirectangular(tex); pm.dispose(); tex.dispose();
    return rt.texture;
  }
  function studioEnvDraw() {
    var c = document.createElement('canvas'); c.width = 1024; c.height = 512; var x = c.getContext('2d');
    var bg = x.createLinearGradient(0, 0, 0, 512); bg.addColorStop(0, '#2a2a2e'); bg.addColorStop(.5, '#101012'); bg.addColorStop(1, '#050505'); x.fillStyle = bg; x.fillRect(0, 0, 1024, 512);
    function box(X, Y, W, H, a) { var gr = x.createLinearGradient(X, Y, X, Y + H); gr.addColorStop(0, 'rgba(255,255,255,' + a + ')'); gr.addColorStop(1, 'rgba(255,255,255,' + a * .6 + ')'); x.fillStyle = gr; x.fillRect(X, Y, W, H); }
    box(380, 40, 260, 70, 1);       // overhead key
    box(80, 150, 90, 220, .85);     // left strip
    box(860, 140, 70, 240, .7);     // right strip
    box(560, 200, 40, 160, .5);     // back kicker
    x.fillStyle = 'rgba(120,170,255,.25)'; x.fillRect(700, 260, 140, 90);
    studioCanvasCache = c;
  }
  // ---- glass + liquid shaders (studio reflections, fresnel, thickness) ----
  var envTexCache = null;
  function envTex() {
    if (envTexCache) return envTexCache;
    // glass-only copy of the studio with two tall strip lights either side of the camera (classic bottle highlights)
    var src = studioCanvas(), c = document.createElement('canvas'); c.width = src.width; c.height = src.height; var x = c.getContext('2d');
    x.drawImage(src, 0, 0);
    function strip(X, W, a) { var gr = x.createLinearGradient(X, 0, X + W, 0); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(.5, 'rgba(255,255,255,' + a + ')'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(X, 70, W, 380); }
    strip(700, 34, 1); strip(812, 22, .8); strip(560, 60, .5); strip(980, 40, .55);
    envTexCache = new THREE.CanvasTexture(c); envTexCache.minFilter = THREE.LinearFilter; return envTexCache;
  }
  var optVert = [
    'varying vec3 vWP; varying vec3 vWN; varying vec3 vLP;',
    'void main(){ vLP = position; vec4 wp = modelMatrix * vec4(position,1.); vWP = wp.xyz; vWN = normalize(mat3(modelMatrix) * normal);',
    ' gl_Position = projectionMatrix * viewMatrix * wp; }'].join('\n');
  var optCommon = [
    'uniform sampler2D uEnv; varying vec3 vWP; varying vec3 vWN; varying vec3 vLP;',
    'vec3 env(vec3 d){ d = normalize(d); vec2 uv = vec2(atan(d.z, d.x) / 6.2831853 + .5, asin(clamp(d.y,-1.,1.)) / 3.1415926 + .5); return texture2D(uEnv, uv).rgb; }'].join('\n');
  function glassMaterial(back) {
    return new THREE.ShaderMaterial({
      uniforms: { uEnv: { value: envTex() }, uTint: { value: new THREE.Color('#dfeee6') } },
      vertexShader: optVert,
      fragmentShader: optCommon + '\nuniform vec3 uTint;\nvoid main(){ vec3 n = normalize(vWN); if (!gl_FrontFacing) n = -n; vec3 v = normalize(vWP - cameraPosition);' +
        ' float ndv = clamp(dot(n, -v), 0., 1.); float F = .04 + .96 * pow(1. - ndv, 5.);' +
        ' vec3 r = env(reflect(v, n)); float edge = pow(1. - ndv, 2.2);' +
        ' float k = ' + (back ? '.5' : '1.') + ';' +
        // premultiplied: reflections add light, only the fresnel edge hides what is behind
        ' vec3 col = (r * (F * 1.8 + .06) + uTint * edge * .06) * uTint * k;' +
        ' float a = clamp(F * .85 + edge * .12, 0., 1.) * k;' +
        ' gl_FragColor = vec4(col, a); }',
      transparent: true, depthWrite: false, side: back ? THREE.BackSide : THREE.FrontSide,
      blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor
    });
  }
  function liquidMaterial(top) {
    return new THREE.ShaderMaterial({
      uniforms: { uEnv: { value: envTex() }, uLight: { value: new THREE.Color('#c96f1e') }, uDeep: { value: new THREE.Color('#4e1c04') } },
      vertexShader: optVert,
      fragmentShader: optCommon + '\nuniform vec3 uLight; uniform vec3 uDeep;\nvoid main(){ vec3 n = normalize(vWN); if (!gl_FrontFacing) n = -n; vec3 v = normalize(vWP - cameraPosition);' +
        ' float ndv = clamp(dot(n, -v), 0., 1.); float F = .03 + .97 * pow(1. - ndv, 5.);' +
        // light passes through the middle (glow), edges are thick and dark, backlight warms the lower body
        ' float thick = 1. - ndv; vec3 body = mix(uLight, uDeep, smoothstep(.15, .9, thick));' +
        ' body += vec3(.35, .16, .03) * smoothstep(.7, .0, vLP.y) * ndv;' +
        (top ? ' body = mix(uDeep * 1.4, uLight, .35);' : '') +
        ' vec3 r = env(reflect(v, n)); vec3 col = body + r * F * 1.4 + pow(max(r.r, r.g), 6.) * ' + (top ? '.9' : '.35') + ';' +
        ' gl_FragColor = vec4(col, ' + (top ? '.94' : '.9') + '); }',
      transparent: true, depthWrite: false, side: THREE.DoubleSide
    });
  }
  function contactShadow(width) {
    var c = document.createElement('canvas'); c.width = c.height = 256; var x = c.getContext('2d');
    var gr = x.createRadialGradient(128, 128, 4, 128, 128, 128); gr.addColorStop(0, 'rgba(0,0,0,.75)'); gr.addColorStop(.5, 'rgba(0,0,0,.28)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = gr; x.fillRect(0, 0, 256, 256);
    var m = new THREE.Mesh(new THREE.PlaneGeometry(width, width * .5), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false }));
    m.rotation.x = -Math.PI / 2; return m;
  }

  function normalize(group, targetH) {
    var box = new THREE.Box3().setFromObject(group), size = new THREE.Vector3(), c = new THREE.Vector3();
    box.getSize(size); box.getCenter(c);
    var s = targetH / Math.max(size.y, size.x * 0.82);
    var holder = new THREE.Group();
    group.position.sub(c); holder.add(group); holder.scale.setScalar(s);
    var outer = new THREE.Group(); outer.add(holder);
    var sh = contactShadow(Math.max(size.x, size.z) * s * 1.7); sh.position.y = -size.y * s / 2 - 0.005; outer.add(sh);
    return outer;
  }

  function mountTicker(o) {
    if (!THREE) return;
    var stage = o.stage, renderer;
    try { renderer = makeRenderer(stage); } catch (e) { return; }
    renderer.toneMappingExposure = 1.05;
    var scene = new THREE.Scene();
    try { scene.environment = studioEnv(renderer); } catch (e) {}
    var camera = new THREE.PerspectiveCamera(28, 1, 0.1, 50);
    camera.position.set(0, 0.35, 7.2); camera.lookAt(0, 0, 0);
    sizeTo(renderer, camera, stage);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x202020, 0.25));
    var key = new THREE.DirectionalLight(0xffffff, 1.1); key.position.set(3, 5, 5); scene.add(key);
    var rim = new THREE.DirectionalLight(0xffffff, 1.6); rim.position.set(-3, 3, -5); scene.add(rim);
    var rim2 = new THREE.DirectionalLight(0xbfd4ff, 0.9); rim2.position.set(4, 1, -4); scene.add(rim2);

    var items = [
      { make: makeTub, h: 2.15 }, { make: makeCan, h: 2.35 },
      { make: makeBottle, h: 2.6 }, { make: makeLabel, h: 2.05 }
    ].map(function (it) { var g = normalize(it.make(), it.h); g.visible = false; scene.add(g); return g; });
    var holos = []; scene.traverse(function (m) { if (m.material && m.material.uniforms && m.material.uniforms.uTime) holos.push(m.material); });
    var tickers = items.map(function (it) { var fns = []; it.traverse(function (o) { if (o.userData.tick) fns.push(o.userData.tick); }); return fns; });

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
      tickers[cur].forEach(function (f) { f(t); });
      // hard cut: the next product snaps in on the tick, no tween
      items.forEach(function (g, i) {
        g.visible = i === cur;
        if (i === cur) { g.scale.setScalar(1); g.rotation.y = Math.sin(t * 0.8) * 0.35 + 0.35; g.rotation.x = 0.06; }
      });
      renderer.render(scene, camera);
    }
    requestAnimationFrame(frame);
    return { goTo: goTo, pause: function (p) { paused = p; if (!p) next = Math.ceil(Date.now() / period) * period; } };
  }

  window.NPH = { mountSeal: mountSeal, mountTicker: mountTicker,
    // building blocks for the seal-shape gallery
    holoMaterial: holoMaterial, holoStripMaterial: holoStripMaterial, labelTextures: labelTextures, makeRenderer: makeRenderer, sizeTo: sizeTo, studioEnv: studioEnv, shieldShape: shieldShape, onScreen: onScreen };
})();
