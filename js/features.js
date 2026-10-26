/* NutraPack security feature visuals: nine animated label samples, drawn live (no stock images).
   Each tile reacts to pointer tilt (or phone tilt) and gently sways on its own. */
(function () {
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var PHONE = window.innerWidth < 760;
  var DPR = Math.min(PHONE ? 1.5 : 2, window.devicePixelRatio || 1);
  function rr(x, X, Y, W, H, r) { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + W, Y, X + W, Y + H, r); x.arcTo(X + W, Y + H, X, Y + H, r); x.arcTo(X, Y + H, X, Y, r); x.arcTo(X, Y, X + W, Y, r); x.closePath(); }
  function rnd(seed) { var s = seed >>> 0; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  function hsl(h, s, l, a) { return 'hsla(' + h + ',' + s + '%,' + l + '%,' + (a == null ? 1 : a) + ')'; }
  var noiseC = document.createElement('canvas'); noiseC.width = noiseC.height = 256;
  (function () { var x = noiseC.getContext('2d'), d = x.createImageData(256, 256), r = rnd(7); for (var i = 0; i < d.data.length; i += 4) { var v = 128 + (r() - .5) * 60; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; } x.putImageData(d, 0, 0); })();
  // brushed-metal streaks, drawn once
  var brushC = document.createElement('canvas'); brushC.width = 512; brushC.height = 256;
  (function () { var x = brushC.getContext('2d'), r = rnd(11); x.fillStyle = '#808080'; x.fillRect(0, 0, 512, 256); for (var i = 0; i < 900; i++) { x.fillStyle = 'rgba(' + (r() > .5 ? '255,255,255' : '0,0,0') + ',' + (r() * .08) + ')'; x.fillRect(0, r() * 256, 512, r() * 1.6); } })();

  var D = {};
  // 1 \u00b7 Tamper evident adhesive: the face stock lifts and leaves "OPENED VOID" behind
  D.tamper = function (x, w, h, t, tl) {
    var p = reduce ? .55 : .5 - .5 * Math.cos(t * 1.1);           // peel amount 0..1
    // residue left on the surface
    x.fillStyle = '#e9e9e6'; x.fillRect(0, 0, w, h);
    x.save(); x.translate(w / 2, h / 2); x.rotate(-0.35); x.font = '900 ' + (h * .16) + 'px Arial, sans-serif'; x.fillStyle = 'rgba(150,150,146,.75)';
    for (var yy = -4; yy <= 4; yy++) for (var xx = -4; xx <= 4; xx++) x.fillText(((xx + yy) % 2 ? 'VOID' : 'OPENED'), xx * h * .78 + (yy % 2) * h * .39 - h * .3, yy * h * .2);
    x.restore();
    // intact face stock: everything left of the peel line
    var lx = w * (1.15 - p * 1.0), slope = h * .55;
    x.save(); x.beginPath(); x.moveTo(0, 0); x.lineTo(lx, 0); x.lineTo(lx - slope, h); x.lineTo(0, h); x.closePath(); x.clip();
    var g = x.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#f1f1ee'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    x.fillStyle = '#0b0b0c'; x.font = '800 ' + (h * .17) + 'px "Barlow Semi Condensed", Arial, sans-serif'; x.fillText('SEALED', w * .1, h * .45);
    x.fillStyle = '#6d6d69'; x.font = '600 ' + (h * .07) + 'px Arial, sans-serif'; x.fillText('YOUR BRAND \u00b7 DO NOT ACCEPT IF OPENED', w * .1, h * .62);
    x.restore();
    // lifted flap: mirror of the peeled area, back side shaded
    x.save(); x.beginPath(); var fl = Math.min(w * .5, (w * 1.15 - lx) * .55);
    x.moveTo(lx, 0); x.lineTo(lx + fl * .55 - slope * .2, 0 - h * .02); x.lineTo(lx - slope + fl * .25, h); x.lineTo(lx - slope, h); x.closePath();
    var fg = x.createLinearGradient(lx, 0, lx + fl, 0); fg.addColorStop(0, '#cfcfcb'); fg.addColorStop(.6, '#fafaf8'); fg.addColorStop(1, '#e2e2de'); x.fillStyle = fg;
    x.shadowColor = 'rgba(0,0,0,.25)'; x.shadowBlur = 14; x.shadowOffsetX = -4; x.fill(); x.restore();
  };
  // 2 \u00b7 Metallic cold foil: brushed metal with a highlight that follows the tilt
  D.foil = function (x, w, h, t, tl) {
    x.drawImage(brushC, 0, 0, w, h);
    var c = .5 + tl.x * .35 + (reduce ? 0 : Math.sin(t * .7) * .18);
    var g = x.createLinearGradient(0, 0, w, 0);
    g.addColorStop(0, 'rgba(120,124,132,.9)'); g.addColorStop(Math.max(0, c - .28), 'rgba(170,174,182,.75)'); g.addColorStop(Math.max(0, c - .08), 'rgba(250,250,252,.92)');
    g.addColorStop(Math.min(1, c), 'rgba(255,255,255,1)'); g.addColorStop(Math.min(1, c + .1), 'rgba(205,208,214,.8)'); g.addColorStop(1, 'rgba(110,114,122,.9)');
    x.fillStyle = g; x.fillRect(0, 0, w, h);
    x.globalCompositeOperation = 'multiply'; x.globalAlpha = .35; x.drawImage(brushC, 0, 0, w, h); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over';
    // debossed wordmark catches light on its lower edge
    x.font = '800 ' + (h * .2) + 'px "Barlow Semi Condensed", Arial, sans-serif'; x.textAlign = 'center';
    x.fillStyle = 'rgba(255,255,255,.7)'; x.fillText('YOUR BRAND', w / 2, h * .58 + 1.5); x.fillStyle = 'rgba(60,62,68,.55)'; x.fillText('YOUR BRAND', w / 2, h * .58); x.textAlign = 'left';
  };
  // 3 \u00b7 Opaque / transparent white combo: clear film shows the product, white flood blocks it
  D.combo = function (x, w, h, t, tl) {
    var off = tl.x * 18 + (reduce ? 0 : Math.sin(t * .6) * 10);
    // the product behind the clear film (amber bottle wall with stripes of light)
    var g = x.createLinearGradient(off, 0, w + off, 0); g.addColorStop(0, '#7a3a0c'); g.addColorStop(.35, '#c46a1c'); g.addColorStop(.5, '#f0a650'); g.addColorStop(.65, '#c46a1c'); g.addColorStop(1, '#6a3009');
    x.fillStyle = g; x.fillRect(0, 0, w, h);
    x.fillStyle = 'rgba(255,255,255,.18)'; x.fillRect(w * .18 + off * .6, 0, w * .04, h);
    // opaque white areas: a circle window and a panel for text
    x.fillStyle = '#fbfbf9'; x.beginPath(); x.ellipse(w * .7, h * .5, h * .32, h * .36, 0, 0, Math.PI * 2); x.fill();
    x.fillRect(0, h * .74, w, h * .26);
    x.fillStyle = '#0b0b0c'; x.font = '800 ' + (h * .11) + 'px "Barlow Semi Condensed", Arial, sans-serif'; x.textAlign = 'center'; x.fillText('YOUR', w * .7, h * .47); x.fillText('BRAND', w * .7, h * .6);
    x.font = '700 ' + (h * .07) + 'px Arial, sans-serif'; x.fillText('CLEAR FILM \u00b7 WHITE FLOOD', w / 2, h * .9); x.textAlign = 'left';
    // film gloss
    var s = x.createLinearGradient(0, 0, w, h); s.addColorStop(0, 'rgba(255,255,255,0)'); s.addColorStop(.45 + tl.x * .1, 'rgba(255,255,255,.35)'); s.addColorStop(.55 + tl.x * .1, 'rgba(255,255,255,0)'); x.fillStyle = s; x.fillRect(0, 0, w, h * .74);
  };
  // 4 \u00b7 UV 4-color process: a UV lamp sweeps across and lights up hidden fluorescent ink
  D.uv = function (x, w, h, t, tl) {
    function art(uv) {
      x.fillStyle = uv ? '#1b0b3a' : '#f7f1ea'; x.fillRect(0, 0, w, h);
      x.fillStyle = uv ? '#3a1a7a' : '#f4d6c4'; x.fillRect(w * .42, 0, w * .44, h);
      x.fillStyle = uv ? '#fff200' : '#ffd400'; x.fillRect(w * .86, 0, w * .14, h);
      var sg = x.createRadialGradient(w * .58, h * .38, 2, w * .62, h * .5, h * .3); sg.addColorStop(0, uv ? '#ffd1f5' : '#ffe2dc'); sg.addColorStop(.35, uv ? '#ff3df2' : '#e86a5a'); sg.addColorStop(1, uv ? '#6a00ff' : '#9a2a22');
      x.fillStyle = sg; x.beginPath(); x.arc(w * .62, h * .5, h * .28, 0, Math.PI * 2); x.fill();
      if (uv) { x.fillStyle = '#39ff88'; x.font = '900 ' + (h * .16) + 'px "Barlow Semi Condensed", Arial, sans-serif'; x.fillText('AUTHENTIC', w * .06, h * .58);
        x.fillStyle = 'rgba(0,240,255,.85)'; x.font = '600 ' + (h * .055) + 'px Arial, sans-serif'; for (var i = 0; i < 6; i++) x.fillText('UV \u00b7 YOUR BRAND \u00b7 UV \u00b7 YOUR BRAND', w * .04, h * (.12 + i * .16)); }
      else { x.fillStyle = '#3a2a22'; x.font = '700 ' + (h * .09) + 'px Arial, sans-serif'; x.fillText('YOUR BRAND', w * .06, h * .55); }
    }
    art(false);
    var bx = w * (.5 + tl.x * .62), br = h * .55;
    x.save(); x.beginPath(); x.ellipse(bx, h / 2, br * .9, br * 1.2, 0, 0, Math.PI * 2); x.clip(); art(true);
    var gl = x.createRadialGradient(bx, h / 2, 0, bx, h / 2, br * 1.1); gl.addColorStop(0, 'rgba(120,60,255,0)'); gl.addColorStop(1, 'rgba(120,60,255,.45)'); x.fillStyle = gl; x.fillRect(0, 0, w, h); x.restore();
  };
  // 5 \u00b7 Color shifting optical ink: magenta to green as the angle changes, with metallic flake
  D.shift = function (x, w, h, t, tl) {
    x.fillStyle = '#fbfbf9'; x.fillRect(0, 0, w, h);
    var a = tl.x + (reduce ? 0 : Math.sin(t * .9) * .6);
    var px = w * .08, pw = w * .84, ph = h * .62, py = h * .19;
    var g = x.createLinearGradient(px, py, px + pw, py + ph);
    var h1 = 300 + a * 60, h2 = 160 + a * 60; g.addColorStop(0, hsl(h1, 80, 45)); g.addColorStop(.5, hsl((h1 + h2) / 2 + 30, 85, 55)); g.addColorStop(1, hsl(h2, 75, 40));
    rr(x, px, py, pw, ph, 10); x.fillStyle = g; x.fill();
    x.save(); rr(x, px, py, pw, ph, 10); x.clip(); x.globalCompositeOperation = 'overlay'; x.globalAlpha = .55; x.drawImage(noiseC, 0, 0, w * 1.5, h * 1.5); x.globalAlpha = 1;
    x.globalCompositeOperation = 'screen'; var s = x.createLinearGradient(0, 0, w, 0); var c = .5 + a * .3; s.addColorStop(Math.max(0, c - .2), 'rgba(255,255,255,0)'); s.addColorStop(Math.min(1, Math.max(0, c)), 'rgba(255,255,255,.5)'); s.addColorStop(Math.min(1, c + .2), 'rgba(255,255,255,0)'); x.fillStyle = s; x.fillRect(0, 0, w, h); x.restore();
    x.fillStyle = 'rgba(255,255,255,.92)'; x.font = '800 ' + (h * .17) + 'px "Barlow Semi Condensed", Arial, sans-serif'; x.textAlign = 'center'; x.fillText('GENUINE', w / 2, h * .57); x.textAlign = 'left';
  };
  // 6 \u00b7 3D optical effect: a dome that seems to rise out of a flat hex grid
  D.optic = function (x, w, h, t, tl) {
    x.fillStyle = '#fbfbf9'; x.fillRect(0, 0, w, h);
    var cx = w * .6 + tl.x * w * .05, cy = h * .5 + tl.y * h * .04, R = h * .4, s = h * .06, Q = R * Math.PI / 2, spin = reduce ? 0 : t * .25;
    // soft shadow the dome casts on the flat print
    var sh = x.createRadialGradient(cx + R * .18, cy + R * .22, R * .4, cx + R * .18, cy + R * .22, R * 1.25); sh.addColorStop(0, 'rgba(0,0,0,.28)'); sh.addColorStop(1, 'rgba(0,0,0,0)');
    var cells = [];
    for (var row = -14; row <= 14; row++) for (var col = -16; col <= 16; col++) {
      var gx = col * s * 1.732 + (row & 1 ? s * .866 : 0), gy = row * s * 1.5;
      var gxs = gx * Math.cos(spin) - gy * Math.sin(spin), gys = gx * Math.sin(spin) + gy * Math.cos(spin);
      var d = Math.sqrt(gxs * gxs + gys * gys), on = d < Q, dd, ux = d ? gxs / d : 0, uy = d ? gys / d : 0, nz = 0, rad = 1, tan = 1;
      if (on) { var th = d / R; dd = R * Math.sin(th); nz = Math.cos(th); rad = Math.cos(th); }   // on the sphere: radial foreshortening
      else dd = R + (d - Q);                                                                      // flat field around it
      cells.push({ X: cx + ux * dd, Y: cy + uy * dd, ux: ux, uy: uy, on: on, nz: nz, rad: rad, z: on ? nz : -1 });
    }
    x.fillStyle = '#fbfbf9'; x.fillRect(0, 0, w, h);
    cells.filter(function (c) { return !c.on; }).forEach(draw);
    x.fillStyle = sh; x.fillRect(0, 0, w, h);
    cells.filter(function (c) { return c.on; }).sort(function (a2, b2) { return a2.z - b2.z; }).forEach(draw);
    function draw(c) {
      x.beginPath();
      for (var i = 0; i < 6; i++) { var an = Math.PI / 6 + i * Math.PI / 3 + spin, px = Math.cos(an) * s * .9, py = Math.sin(an) * s * .9;
        if (c.on) { var pr = px * c.ux + py * c.uy, pt = -px * c.uy + py * c.ux; pr *= Math.max(.08, c.rad); px = pr * c.ux - pt * c.uy; py = pr * c.uy + pt * c.ux; }
        x.lineTo(c.X + px, c.Y + py); }
      x.closePath();
      if (c.on) { var nx = c.ux * Math.sqrt(1 - c.nz * c.nz), ny = c.uy * Math.sqrt(1 - c.nz * c.nz), L = Math.max(0, -nx * .5 - ny * .6 + c.nz * .62), v = Math.round(60 + 195 * L);
        x.fillStyle = 'rgb(' + v + ',' + v + ',' + (v + 4) + ')'; x.fill(); x.strokeStyle = 'rgba(20,20,24,' + (.25 + .4 * c.nz) + ')'; x.lineWidth = .8; x.stroke(); }
      else { x.fillStyle = '#ffffff'; x.fill(); x.strokeStyle = 'rgba(30,30,34,.2)'; x.lineWidth = 1; x.stroke(); }
    }
    var hl = x.createRadialGradient(cx - R * .38, cy - R * .42, 0, cx - R * .38, cy - R * .42, R * .55); hl.addColorStop(0, 'rgba(255,255,255,.55)'); hl.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = hl; x.fillRect(0, 0, w, h);
  };
  // 7 \u00b7 Variable coding / serialization: every label gets its own code and number
  D.serial = function (x, w, h, t) {
    x.fillStyle = '#ffffff'; x.fillRect(0, 0, w, h);
    var n = 25019 + (reduce ? 0 : Math.floor(t / .9)), r = rnd(n * 2654435761), q = h * .62, cell = q / 25, ox = w * .08, oy = h * .1;
    x.fillStyle = '#0d1b3e';
    for (var i = 0; i < 25; i++) for (var j = 0; j < 25; j++) { var f = (i < 8 && j < 8) || (i > 16 && j < 8) || (i < 8 && j > 16); if (!f && r() > .52) x.fillRect(ox + i * cell, oy + j * cell, cell + .3, cell + .3); }
    [[0, 0], [18, 0], [0, 18]].forEach(function (p) { x.fillRect(ox + p[0] * cell, oy + p[1] * cell, 7 * cell, 7 * cell); x.fillStyle = '#fff'; x.fillRect(ox + (p[0] + 1) * cell, oy + (p[1] + 1) * cell, 5 * cell, 5 * cell); x.fillStyle = '#0d1b3e'; x.fillRect(ox + (p[0] + 2) * cell, oy + (p[1] + 2) * cell, 3 * cell, 3 * cell); });
    x.font = '700 ' + (h * .1) + 'px "Courier New", monospace'; x.fillText(String(n).padStart(10, '0'), ox, oy + q + h * .15);
    x.fillStyle = '#6d6d69'; x.font = '700 ' + (h * .06) + 'px Arial, sans-serif'; x.fillText('UNIQUE CODE', w * .58, h * .3); x.fillText('PER LABEL', w * .58, h * .4); x.fillStyle = '#0d1b3e'; x.fillText('SCAN TO VERIFY', w * .58, h * .55);
    if (!reduce) { var sy = oy + ((t * .9) % 1) * q; var sg = x.createLinearGradient(0, sy - 8, 0, sy + 8); sg.addColorStop(0, 'rgba(0,255,140,0)'); sg.addColorStop(.5, 'rgba(0,220,120,.8)'); sg.addColorStop(1, 'rgba(0,255,140,0)'); x.fillStyle = sg; x.fillRect(ox - 6, sy - 8, q + 12, 16); }
  };
  // 8 \u00b7 Micro optical array on PET film: lens lines make a floating image that moves against the tilt
  D.micro = function (x, w, h, t, tl) {
    x.fillStyle = '#f4f9ff'; x.fillRect(0, 0, w, h);
    var a = tl.x + (reduce ? 0 : Math.sin(t * .7) * .7);
    x.strokeStyle = 'rgba(70,140,220,.35)'; x.lineWidth = 1;
    for (var X = 0; X < w; X += 3.2) { x.beginPath(); x.moveTo(X, 0); x.lineTo(X, h); x.stroke(); }
    // moire from a second, slightly rotated grating
    x.save(); x.translate(w / 2, h / 2); x.rotate(0.035 + a * .02); x.strokeStyle = 'rgba(40,110,200,.3)';
    for (var X2 = -w; X2 < w; X2 += 3.35) { x.beginPath(); x.moveTo(X2, -h); x.lineTo(X2, h); x.stroke(); } x.restore();
    // floating icons that move opposite to the tilt
    var off = -a * w * .12;
    x.strokeStyle = 'rgba(20,90,190,.85)'; x.lineWidth = h * .035; x.lineCap = 'round'; x.lineJoin = 'round'; x.textAlign = 'center';
    for (var i = -1; i < 5; i++) { var cx2 = ((i * w * .28 + off) % (w * 1.12) + w * 1.12) % (w * 1.12) - w * .06, cy2 = h * .45 + Math.sin(i) * h * .08, k2 = h * .07;
      x.beginPath(); x.moveTo(cx2 - k2, cy2); x.lineTo(cx2 - k2 * .3, cy2 + k2 * .7); x.lineTo(cx2 + k2, cy2 - k2 * .8); x.stroke(); }
    x.fillStyle = 'rgba(20,90,190,.5)'; x.font = '700 ' + (h * .07) + 'px Arial, sans-serif'; x.fillText('PET LENS FILM', w / 2, h * .9); x.textAlign = 'left';
  };
  // 9 \u00b7 Dual foil hot stamping: gold and silver foils on one label, each catching the light differently
  D.dual = function (x, w, h, t, tl) {
    x.fillStyle = '#ffffff'; x.fillRect(0, 0, w, h);
    var a = tl.x + (reduce ? 0 : Math.sin(t * .8) * .6);
    function foil(c0, c1, c2, pos) { var g = x.createLinearGradient(0, 0, w, h * .3); g.addColorStop(0, c0); g.addColorStop(Math.max(.01, Math.min(.99, pos - .12)), c1); g.addColorStop(Math.max(.02, Math.min(.99, pos)), '#ffffff'); g.addColorStop(Math.max(.03, Math.min(1, pos + .12)), c1); g.addColorStop(1, c2); return g; }
    // gold crest (an original star-and-triangle mark)
    x.save(); x.translate(w * .78, h * .52); x.fillStyle = foil('#7a5410', '#d9a93a', '#8a6214', .5 + a * .35);
    x.beginPath(); x.moveTo(0, -h * .3); x.lineTo(h * .27, h * .2); x.lineTo(-h * .27, h * .2); x.closePath(); x.fill();
    x.fillStyle = '#ffffff'; x.beginPath(); for (var i = 0; i < 10; i++) { var an = -Math.PI / 2 + i * Math.PI / 5, r2 = i % 2 ? h * .04 : h * .1; x.lineTo(r2 * Math.cos(an), h * .03 + r2 * Math.sin(an)); } x.closePath(); x.fill(); x.restore();
    // silver wordmark, set vertically
    x.save(); x.translate(w * .3, h * .5); x.rotate(-Math.PI / 2); x.fillStyle = foil('#7d8088', '#c9ccd3', '#6e7178', .5 - a * .35);
    x.font = '700 ' + (h * .12) + 'px "Barlow Semi Condensed", Arial, sans-serif'; x.textAlign = 'center'; x.fillText('B R A N D', 0, h * .05); x.restore();
    x.fillStyle = foil('#7a5410', '#d9a93a', '#8a6214', .5 + a * .35); x.fillRect(w * .5, h * .12, 2, h * .76);
  };

  var logo = new Image(), parts = null; logo.src = 'images/web/logo.png';
  logo.onload = function () { // split the logo into the narwhal mark and the wordmark (both black on transparent)
    function crop(y0, y1) { var c = document.createElement('canvas'); c.width = logo.width; c.height = y1 - y0; c.getContext('2d').drawImage(logo, 0, y0, logo.width, y1 - y0, 0, 0, logo.width, y1 - y0); return c; }
    parts = { mark: crop(0, 178), word: crop(188, logo.height) };
  };
  D.flip = function (x, w, h, t, tl) {
    var a = tl.x, m = Math.min(1, Math.max(0, (a + .25) / .5)); // 0 = mark view, 1 = wordmark view
    // silver holographic sticker base, hue follows the angle
    var g = x.createLinearGradient(0, 0, w, h); for (var i = 0; i <= 6; i++) g.addColorStop(i / 6, hsl((i * 60 + a * 90 + 200) % 360, 55, 84)); x.fillStyle = g; x.fillRect(0, 0, w, h);
    x.globalCompositeOperation = 'overlay'; x.globalAlpha = .4; x.drawImage(noiseC, 0, 0, w * 1.4, h * 1.4); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over';
    if (!parts) return;
    function place(img, sc) { var iw = w * sc, ih = iw * img.height / img.width; if (ih > h * .72) { ih = h * .72; iw = ih * img.width / img.height; } return [w / 2 - iw / 2, h / 2 - ih / 2, iw, ih]; }
    var pa = place(parts.mark, .8), pb = place(parts.word, .78), lens = 5;
    // interlaced lens strips: each strip shows the mark for (1 - m) of its width and the wordmark for the rest
    for (var X = 0; X < w; X += lens) {
      var split = lens * (1 - m);
      if (split > .2) { x.save(); x.beginPath(); x.rect(X, 0, split, h); x.clip(); x.globalAlpha = .9; x.drawImage(parts.mark, pa[0], pa[1], pa[2], pa[3]); x.restore(); }
      if (lens - split > .2) { x.save(); x.beginPath(); x.rect(X + split, 0, lens - split, h); x.clip(); x.globalAlpha = .9; x.drawImage(parts.word, pb[0], pb[1], pb[2], pb[3]); x.restore(); }
    }
    x.globalAlpha = 1;
    x.fillStyle = 'rgba(255,255,255,.12)'; for (var X2 = 0; X2 < w; X2 += lens) x.fillRect(X2, 0, 1, h);     // lens ridges
    x.fillStyle = 'rgba(0,0,0,.05)'; for (var X3 = 2; X3 < w; X3 += lens) x.fillRect(X3, 0, 1, h);
  };


  // ---------- Lenticular / micro-optic effects: angle in, image out ----------
  function lensRidges(x, w, h, a) {
    var lens = 5; x.fillStyle = 'rgba(255,255,255,.14)'; for (var X = 0; X < w; X += lens) x.fillRect(X, 0, 1, h);
    x.fillStyle = 'rgba(0,0,0,.06)'; for (var X2 = 2; X2 < w; X2 += lens) x.fillRect(X2, 0, 1, h);
    var c = .5 + a * .45, g = x.createLinearGradient(0, 0, w, 0);
    g.addColorStop(Math.max(0, c - .18), 'rgba(255,255,255,0)'); g.addColorStop(Math.min(1, Math.max(0, c)), 'rgba(255,255,255,.4)'); g.addColorStop(Math.min(1, c + .18), 'rgba(255,255,255,0)');
    x.fillStyle = g; x.fillRect(0, 0, w, h);
  }
  function interlace(x, w, h, frames, pos) { // pos 0..frames-1, strips blend neighbouring frames like real lenticular
    var i = Math.max(0, Math.min(frames.length - 1, Math.floor(pos))), f = pos - i, j = Math.min(frames.length - 1, i + 1), lens = 5;
    for (var X = 0; X < w; X += lens) { var split = lens * (1 - f);
      if (split > .2) { x.save(); x.beginPath(); x.rect(X, 0, split, h); x.clip(); frames[i](); x.restore(); }
      if (lens - split > .2) { x.save(); x.beginPath(); x.rect(X + split, 0, lens - split, h); x.clip(); frames[j](); x.restore(); } }
  }
  // Morph: tub -> bottle -> can, our own products, in halftone black and white
  D.morph = function (x, w, h, t, tl) {
    var a = tl.x, pos = (a + 1) / 2 * 2;
    function bg() { x.fillStyle = '#f4f4f2'; x.fillRect(0, 0, w, h); x.fillStyle = 'rgba(0,0,0,.12)'; for (var yy = 4; yy < h; yy += 7) for (var xx = 4 + (yy % 14 ? 3 : 0); xx < w; xx += 7) { x.beginPath(); x.arc(xx, yy, 1.4, 0, 6.3); x.fill(); } }
    function sil(path) { return function () { bg(); x.save(); x.translate(w / 2, h * .54); var k = h / 100; x.scale(k, k); var g = x.createLinearGradient(-30, 0, 30, 0); g.addColorStop(0, '#1a1a1c'); g.addColorStop(.35, '#5a5a5e'); g.addColorStop(.6, '#202022'); g.addColorStop(1, '#0b0b0c'); x.fillStyle = g; path(); x.fill(); x.restore(); }; }
    var tub = sil(function () { x.beginPath(); x.roundRect ? x.roundRect(-28, -26, 56, 60, 4) : x.rect(-28, -26, 56, 60); x.rect(-30, -36, 60, 11); });
    var bottle = sil(function () { x.beginPath(); x.moveTo(-18, 36); x.lineTo(-18, -6); x.quadraticCurveTo(-18, -18, -8, -22); x.lineTo(-7, -34); x.lineTo(7, -34); x.lineTo(8, -22); x.quadraticCurveTo(18, -18, 18, -6); x.lineTo(18, 36); x.closePath(); x.rect(-8, -42, 16, 8); });
    var can = sil(function () { x.beginPath(); x.moveTo(-17, 36); x.lineTo(-19, 30); x.lineTo(-19, -26); x.lineTo(-15, -34); x.lineTo(15, -34); x.lineTo(19, -26); x.lineTo(19, 30); x.lineTo(17, 36); x.closePath(); });
    interlace(x, w, h, [tub, bottle, can], pos);
    x.fillStyle = 'hsl(' + (200 + a * 140) + ',80%,50%)'; x.fillRect(0, 0, w, h * .07);   // header band changes color too
    lensRidges(x, w, h, a);
  };
  // 3D depth: a letter floats above a honeycomb that slides underneath it
  D.depth = function (x, w, h, t, tl) {
    var a = tl.x, b = tl.y;
    x.fillStyle = '#fbfbf9'; x.fillRect(0, 0, w, h);
    var s = h * .085, ox = -a * s * 2.2, oy = -b * s;
    x.strokeStyle = 'rgba(30,30,34,.45)'; x.lineWidth = 1.4;
    for (var r = -2; r < h / (s * 1.5) + 2; r++) for (var c = -2; c < w / (s * 1.732) + 3; c++) {
      var X = c * s * 1.732 + (r & 1 ? s * .866 : 0) + ox, Y = r * s * 1.5 + oy; x.beginPath();
      for (var i = 0; i < 6; i++) { var an = Math.PI / 6 + i * Math.PI / 3; x.lineTo(X + s * .9 * Math.cos(an), Y + s * .9 * Math.sin(an)); } x.closePath();
      var gr = x.createRadialGradient(X - s * .3, Y - s * .3, 1, X, Y, s); gr.addColorStop(0, '#ffffff'); gr.addColorStop(1, '#cfcfcc'); x.fillStyle = gr; x.fill(); x.stroke(); }
    x.fillStyle = 'hsl(' + (60 + a * 20) + ',90%,' + (55 + a * 8) + '%)'; x.beginPath(); x.moveTo(0, 0); x.lineTo(w * .3, 0); x.lineTo(0, h * .45); x.closePath(); x.fill();    // corner patch shifts color
    x.fillStyle = 'hsl(' + (205 + a * 60) + ',85%,45%)'; x.fillRect(0, h * .3, w * .035, h * .7);                                                        // edge stripe shifts blue -> purple
    var fx = w / 2 + a * s * 1.2, fy = h * .58 + b * s * .5, fs = h * .62;
    x.font = '900 ' + fs + 'px "Barlow Semi Condensed", Arial, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillStyle = 'rgba(0,0,0,.25)'; x.fillText('N', fx - a * s * 1.6 + 4, fy + 8);                 // shadow on the honeycomb below
    x.fillStyle = '#121214'; x.fillText('N', fx, fy); x.textAlign = 'left'; x.textBaseline = 'alphabetic';
    lensRidges(x, w, h, a);
  };
  // Motion: waves ripple and arrows run as the angle changes
  D.motion = function (x, w, h, t, tl) {
    var a = tl.x, ph = a * Math.PI * 2;
    x.fillStyle = '#fbfbf9'; x.fillRect(0, 0, w, h);
    x.strokeStyle = '#2a2a2e'; x.lineWidth = 2.2;
    for (var k = 0; k < 8; k++) { x.beginPath(); for (var X = 0; X <= w; X += 3) { var Y = h * (.2 + k * .045) + Math.sin(X / w * Math.PI * 4 + ph + k * .5) * h * .025; X ? x.lineTo(X, Y) : x.moveTo(X, Y); } x.stroke(); }
    x.fillStyle = '#c6f03c'; x.fillRect(0, h * .58, w, h * .13);
    x.fillStyle = '#121214'; x.font = '800 ' + (h * .1) + 'px "Barlow Semi Condensed", Arial, sans-serif'; x.textAlign = 'center';
    x.fillText(a < 0 ? 'NUTRA   PACK   NUTRA' : 'PACK   NUTRA   PACK', w / 2, h * .68); x.textAlign = 'left';                      // text band flips
    var cols = ['#ff5a00', '#00b7ff', '#9b3dff', '#ff2bd6', '#16c47f'], off = a * w * .35;
    for (var i = -2; i < 12; i++) { var X2 = ((i * w * .12 + off) % (w * 1.2) + w * 1.2) % (w * 1.2) - w * .1, Y2 = h * .84; x.fillStyle = cols[(i + 10) % 5];
      x.beginPath(); x.moveTo(X2, Y2 - h * .07); x.lineTo(X2 + h * .1, Y2); x.lineTo(X2, Y2 + h * .07); x.lineTo(X2 + h * .04, Y2); x.closePath(); x.fill(); }
    lensRidges(x, w, h, a);
  };
  // Zoom: the centre disc grows into a ring and the rings turn
  D.zoom = function (x, w, h, t, tl) {
    var a = tl.x, z = (a + 1) / 2;
    for (var r = 0; r < 14; r++) for (var c = 0; c < 22; c++) { x.fillStyle = 'hsl(' + ((r * 37 + c * 53 + a * 90) % 360) + ',55%,' + (30 + ((r + c) % 3) * 10) + '%)'; x.fillRect(c * w / 22, r * h / 14, w / 22 + .5, h / 14 + .5); }
    var cx = w / 2, cy = h / 2, R = h * .42;
    x.fillStyle = '#121a2a'; x.beginPath(); x.arc(cx, cy, R, 0, 6.3); x.fill();
    x.save(); x.translate(cx, cy); x.rotate(a * Math.PI / 3);
    for (var k = 0; k < 7; k++) { x.strokeStyle = 'rgba(0,200,255,' + (.25 + k * .08) + ')'; x.lineWidth = 2; x.setLineDash([R * .12, R * .06]); x.beginPath(); x.arc(0, 0, R * (.35 + k * .09), 0, 6.3); x.stroke(); }
    x.restore(); x.setLineDash([]);
    var g = x.createRadialGradient(cx, cy, 0, cx, cy, R * (.2 + z * .45)); g.addColorStop(0, z > .5 ? '#ffffff' : '#00c8ff'); g.addColorStop(z > .5 ? .45 : .7, '#00c8ff'); g.addColorStop(1, 'rgba(0,200,255,0)');
    x.fillStyle = g; x.beginPath(); x.arc(cx, cy, R * (.2 + z * .45), 0, 6.3); x.fill();
    lensRidges(x, w, h, a);
  };
  // Color change: the narwhal shifts color with the angle on a blue chevron ground
  D.color = function (x, w, h, t, tl) {
    var a = tl.x;
    x.fillStyle = '#dff3ff'; x.fillRect(0, 0, w, h); x.strokeStyle = '#4fb6ff'; x.lineWidth = h * .05;
    for (var k = -2; k < 10; k++) { x.beginPath(); for (var X = 0; X <= w; X += w / 10) x.lineTo(X, k * h * .16 + ((X / (w / 10)) % 2 ? h * .06 : 0)); x.stroke(); }
    if (!parts) return;
    var iw = w * .78, ih = iw * parts.mark.height / parts.mark.width, dx = w / 2 - iw / 2 + a * 4, dy = h / 2 - ih / 2;
    var c = document.createElement('canvas'); c.width = Math.ceil(iw); c.height = Math.ceil(ih); var g = c.getContext('2d');
    var gr = g.createLinearGradient(0, 0, iw, ih); gr.addColorStop(0, 'hsl(' + (a * 120 + 20) + ',75%,42%)'); gr.addColorStop(1, 'hsl(' + (a * 120 + 120) + ',70%,36%)');
    g.fillStyle = gr; g.fillRect(0, 0, iw, ih); g.globalCompositeOperation = 'destination-in'; g.drawImage(parts.mark, 0, 0, iw, ih);
    x.drawImage(c, dx, dy);
    lensRidges(x, w, h, a);
  };

  // Layered security label: holographic art + blue metallic burst + gold foil seal + foil wordmark + unique QR and serial
  function qr(x, ox, oy, q, seed) {
    var r = rnd(seed), cell = q / 25; x.fillStyle = '#0d1b3e';
    for (var i = 0; i < 25; i++) for (var j = 0; j < 25; j++) { var f = (i < 8 && j < 8) || (i > 16 && j < 8) || (i < 8 && j > 16); if (!f && r() > .52) x.fillRect(ox + i * cell, oy + j * cell, cell + .3, cell + .3); }
    [[0, 0], [18, 0], [0, 18]].forEach(function (p) { x.fillStyle = '#0d1b3e'; x.fillRect(ox + p[0] * cell, oy + p[1] * cell, 7 * cell, 7 * cell); x.fillStyle = '#fff'; x.fillRect(ox + (p[0] + 1) * cell, oy + (p[1] + 1) * cell, 5 * cell, 5 * cell); x.fillStyle = '#0d1b3e'; x.fillRect(ox + (p[0] + 2) * cell, oy + (p[1] + 2) * cell, 3 * cell, 3 * cell); });
  }
  D.stack = function (x, w, h, t, tl) {
    var a = tl.x, k = tl.k || 0, aw = w * .6;
    // 1 holographic art panel: background hue follows the angle
    var g = x.createLinearGradient(0, 0, aw, h); for (var i = 0; i <= 5; i++) g.addColorStop(i / 5, hsl((i * 50 + a * 110 + 330) % 360, 70, 62)); x.fillStyle = g; x.fillRect(0, 0, aw, h);
    x.globalCompositeOperation = 'overlay'; x.globalAlpha = .5; x.drawImage(noiseC, 0, 0, aw * 1.4, h * 1.4); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over';
    // honeycomb + embossed sphere art
    var s2 = h * .07; x.strokeStyle = 'rgba(255,255,255,.35)'; x.lineWidth = 1;
    for (var r = 0; r < 12; r++) for (var c = 0; c < 10; c++) { var X = c * s2 * 1.732 + (r & 1 ? s2 * .866 : 0) - a * 6, Y = r * s2 * 1.5; x.beginPath(); for (var q = 0; q < 6; q++) { var an = Math.PI / 6 + q * Math.PI / 3; x.lineTo(X + s2 * .9 * Math.cos(an), Y + s2 * .9 * Math.sin(an)); } x.closePath(); x.stroke(); }
    var sx = aw * .48 + a * 4, sy = h * .58, sr = h * .27, sg = x.createRadialGradient(sx - sr * .35 - a * sr * .3, sy - sr * .4, sr * .1, sx, sy, sr);
    sg.addColorStop(0, '#fff4f0'); sg.addColorStop(.35, hsl((a * 60 + 350) % 360, 55, 55)); sg.addColorStop(1, '#2a0e14'); x.fillStyle = sg; x.beginPath(); x.arc(sx, sy, sr, 0, 6.3); x.fill();
    // 2 blue metallic burst, bright when the light catches it
    x.save(); x.translate(aw * .2, h * .2); x.fillStyle = 'hsl(200,90%,' + (55 + Math.max(0, -a) * 25) + '%)'; x.beginPath();
    for (var b2 = 0; b2 < 28; b2++) { var an2 = b2 / 28 * Math.PI * 2, rr2 = b2 % 2 ? h * .07 : h * .15; x.lineTo(rr2 * Math.cos(an2), rr2 * Math.sin(an2)); } x.closePath(); x.fill(); x.restore();
    // 3 gold foil seal with the narwhal, highlight follows the angle
    x.save(); x.translate(aw * .78, h * .2); var gg = x.createLinearGradient(-h * .14, -h * .14, h * .14, h * .14); var gp = Math.min(.95, Math.max(.05, .5 + a * .45));
    gg.addColorStop(0, '#8a6214'); gg.addColorStop(Math.max(0, gp - .15), '#d9a93a'); gg.addColorStop(gp, '#fff4cc'); gg.addColorStop(Math.min(1, gp + .15), '#d9a93a'); gg.addColorStop(1, '#7a5410');
    x.fillStyle = gg; x.beginPath(); x.moveTo(0, -h * .15); x.lineTo(h * .15, h * .12); x.lineTo(-h * .15, h * .12); x.closePath(); x.fill();
    if (parts) x.drawImage(parts.mark, -h * .085, -h * .02, h * .17, h * .17 * parts.mark.height / parts.mark.width);
    x.restore();
    // 4 vertical foil wordmark
    x.save(); x.translate(aw * .93, h * .62); x.rotate(-Math.PI / 2); var wg = x.createLinearGradient(-h * .3, 0, h * .3, 0); wg.addColorStop(0, '#9aa0a8'); wg.addColorStop(Math.min(1, Math.max(0, .5 - a * .45)), '#ffffff'); wg.addColorStop(1, '#8a8f98');
    x.fillStyle = wg; x.font = '800 ' + (h * .085) + 'px "Barlow Semi Condensed", Arial, sans-serif'; x.textAlign = 'center'; x.fillText('NUTRAPACK', 0, 0); x.restore(); x.textAlign = 'left';
    // 5 white data panel: unique QR and serial on every label
    x.fillStyle = '#ffffff'; x.fillRect(aw, 0, w - aw, h); x.fillStyle = 'rgba(0,0,0,.08)'; x.fillRect(aw, 0, 1, h);
    var q2 = Math.min(w - aw - 20, h * .62); qr(x, aw + (w - aw - q2) / 2, h * .1, q2, 45190 + k * 7919);
    x.fillStyle = '#0d1b3e'; x.font = '700 ' + (h * .075) + 'px "Courier New", monospace'; x.textAlign = 'center';
    x.fillText(['D', 'C', 'B', 'A'][k % 4] + String(45190 + k).padStart(9, '0'), aw + (w - aw) / 2, h * .86); x.textAlign = 'left';
  };

  var tiles = [].slice.call(document.querySelectorAll('[data-feature]'));
  var TIME_BASED = { tamper: 1, serial: 1 }; // physical actions, not optics
  tiles.forEach(function (el) {
    var lbl = el.querySelector('.lbl'), cv = lbl.querySelector('canvas'), x = cv.getContext('2d'), tl = { x: 0, y: 0 }, tg = null, ph = Math.random() * 6;
    var strip = document.createElement('div'); strip.className = 'angles'; strip.setAttribute('aria-hidden', 'true');
    var single = el.dataset.minis === '0';
    var minis = (single ? [] : [-0.85, 0.85]).map(function (off, mi) { var m = document.createElement('div'); m.className = 'mini'; var c = document.createElement('canvas'); m.appendChild(c); strip.appendChild(m); return { off: off, k: mi + 1, cv: c, x: c.getContext('2d'), el: m }; });
    var cap = document.createElement('p'); cap.className = 'angles-cap'; cap.textContent = 'Same label, two angles';
    if (!single) { lbl.insertAdjacentElement('afterend', strip); strip.insertAdjacentElement('afterend', cap); }
    function size(c) { var b = c.getBoundingClientRect(); c.width = Math.max(1, b.width * DPR); c.height = Math.max(1, b.height * DPR); }
    function sizeAll() { size(cv); minis.forEach(function (m) { size(m.cv); }); }
    sizeAll(); window.addEventListener('resize', sizeAll);
    el.addEventListener('pointermove', function (e) { var b = el.getBoundingClientRect(); tg = { x: Math.max(-1, Math.min(1, ((e.clientX - b.left) / b.width - .5) * 2.4)), y: ((e.clientY - b.top) / b.height - .5) * 2 }; });
    el.addEventListener('pointerleave', function () { tg = null; });
    el._tilt = function (gx) { tg = { x: gx, y: 0 }; el._tiltAt = performance.now(); };
    function paint(c, ctx, angle, t) {
      var w = c.width / DPR, h = c.height / DPR; ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.save(); rr(ctx, 0, 0, w, h, Math.min(10, h * .08)); ctx.clip(); D[el.dataset.feature](ctx, w, h, TIME_BASED[el.dataset.feature] ? t : 0, angle); ctx.restore();
    }
    el._draw = function (now) {
      var t = now / 1000 + ph, idle = { x: reduce ? .3 : Math.sin(t * .45) * .95, y: reduce ? 0 : Math.cos(t * .37) * .3 };
      var goal = tg && (!el._tiltAt || now - el._tiltAt < 1500) ? tg : idle;
      tl.x += (goal.x - tl.x) * .12; tl.y += (goal.y - tl.y) * .12;
      lbl.style.transform = 'perspective(800px) rotateY(' + (tl.x * 16) + 'deg) rotateX(' + (-tl.y * 10) + 'deg)';
      lbl.style.setProperty('--gx', (50 + tl.x * 45) + '%');
      paint(cv, x, tl, t);
      if (el._n = (el._n || 0) + 1, el._n % 3 && el._mDone) return; el._mDone = true;
      minis.forEach(function (m) { var ang = { x: Math.max(-1, Math.min(1, m.off + tl.x * 0.15)), y: tl.y, k: m.k }; m.el.style.transform = 'perspective(400px) rotateY(' + (ang.x * 16) + 'deg)'; m.el.style.setProperty('--gx', (50 + ang.x * 45) + '%'); paint(m.cv, m.x, ang, t); });
    };
  });
  // Only draw tiles that are on screen, pause while the page is scrolling, and run at 30 fps on phones.
  var onScreenSet = new Set(), lastScroll = 0, lastFrame = 0;
  ['scroll', 'touchmove', 'wheel'].forEach(function (e) { window.addEventListener(e, function () { lastScroll = performance.now(); }, { passive: true }); });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) onScreenSet.add(e.target); else onScreenSet.delete(e.target); }); }, { rootMargin: '100px 0px' });
    tiles.forEach(function (el) { io.observe(el); });
  } else tiles.forEach(function (el) { onScreenSet.add(el); });
  function loop(now) {
    requestAnimationFrame(loop);
    if (now - lastScroll < 220) return;
    if (PHONE && now - lastFrame < 31) return;
    lastFrame = now;
    onScreenSet.forEach(function (el) { el._draw(now); });
  }
  if (reduce) tiles.forEach(function (el) { el._draw(2000); }); else requestAnimationFrame(loop);
  window.addEventListener('deviceorientation', function (e) { if (e.gamma == null) return; var g = Math.max(-1, Math.min(1, e.gamma / 30)); tiles.forEach(function (el) { el._tilt(g); }); }); // phone tilt drives every tile
})();
