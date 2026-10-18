"use strict";

// The page is a dial. The canvas draws a dot grid, a rotary dial, and a dot-matrix
// readout. The dial selects which section of <main> is visible.
(() => {
  const root = document.querySelector("[data-root]");
  if (!root) return;

  const html = document.documentElement;
  const canvas = root.querySelector("[data-canvas]");
  const zone = root.querySelector("[data-zone]");
  const ui = root.querySelector("[data-ui]");
  const panel = root.querySelector("[data-panel]");
  const counter = root.querySelector("[data-counter]");
  const sheet = root.querySelector("[data-sheet]");
  const themeButton = root.querySelector("[data-theme-toggle]");
  const soundButton = root.querySelector("[data-sound-toggle]");
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const labels = [...root.querySelectorAll("[data-labels] button[data-i]")];
  const sections = [...panel.querySelectorAll("[data-section]")].map((el) => ({ id: el.id, word: el.dataset.word }));
  const N = sections.length;
  const ctx = canvas.getContext("2d");
  const systemDark = matchMedia("(prefers-color-scheme: dark)");
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const THEME_KEY = "white-rose-theme";
  const SOUND_KEY = "white-rose-sound";

  // 5x9 glyphs: rows 0-1 ascender, 2-6 x-height, 7-8 descender. "0" is an empty row.
  const FONT = {
    a: "0 0 .###. ....# .#### #...# .####", b: "#.... #.... ####. #...# #...# #...# ####.",
    c: "0 0 .#### #.... #.... #.... .####", d: "....# ....# .#### #...# #...# #...# .####",
    e: "0 0 .###. #...# ##### #.... .####", f: "..##. .#... ####. .#... .#... .#... .#...",
    g: "0 0 .#### #...# #...# #...# .#### ....# .###.", h: "#.... #.... ####. #...# #...# #...# #...#",
    i: "..#.. 0 .##.. ..#.. ..#.. ..#.. .###.", j: "...#. 0 ..##. ...#. ...#. ...#. ...#. #..#. .##..",
    k: "#.... #.... #..#. #.#.. ##... #.#.. #..#.", l: ".##.. ..#.. ..#.. ..#.. ..#.. ..#.. .###.",
    m: "0 0 ##.#. #.#.# #.#.# #.#.# #.#.#", n: "0 0 ####. #...# #...# #...# #...#",
    o: "0 0 .###. #...# #...# #...# .###.", p: "0 0 ####. #...# #...# #...# ####. #.... #....",
    q: "0 0 .#### #...# #...# #...# .#### ....# ....#", r: "0 0 #.##. ##..# #.... #.... #....",
    s: "0 0 .#### #.... .###. ....# ####.", t: ".#... .#... ####. .#... .#... .#... ..##.",
    u: "0 0 #...# #...# #...# #...# .####", v: "0 0 #...# #...# #...# .#.#. ..#..",
    w: "0 0 #...# #.#.# #.#.# #.#.# .#.#.", x: "0 0 #...# .#.#. ..#.. .#.#. #...#",
    y: "0 0 #...# #...# #...# #...# .#### ....# .###.", z: "0 0 ##### ...#. ..#.. .#... #####",
  };

  const storage = {
    get(key) {
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, value);
      } catch {}
    },
  };

  const storedTheme = storage.get(THEME_KEY);
  let themeMode = storedTheme === "light" || storedTheme === "system" ? storedTheme : "dark";
  let soundOn = storage.get(SOUND_KEY) !== "off";

  let idx = 0, pos = 0, vel = 0, target = 0, mode = "idle", lastIdx = 0, settledIdx = 0, pawl = 0;
  let samples = [], ripple = null, waves = [], raf = 0, lastT = 0, lastTick = 0, panelWheelT = 0;
  let contact = "closed", opener = null, drag = null, touching = false, swipe = null;
  let L = null, R0 = null, C = null, cls = null, candOf = null, cand = null, rv = null, rt = null, rs = null;
  let cache = null, dpr = 1, booted = false, rDirty = false, layRaf = 0, layTries = 0;
  let wheelT = 0, closeT = 0, audio = null, noise = null;
  const buckets = new Map();
  const glyphs = {};

  const clampIdx = (v) => Math.max(0, Math.min(N - 1, v));
  const farCorner = (x, y) => Math.max(Math.hypot(x, y), Math.hypot(L.W - x, y), Math.hypot(x, L.H - y), Math.hypot(L.W - x, L.H - y));
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  // ---------- theme and sound ----------

  function applyTheme() {
    const dark = themeMode === "system" ? systemDark.matches : themeMode !== "light";
    html.dataset.theme = dark ? "dark" : "light";
    const style = getComputedStyle(html);
    const token = (name) => style.getPropertyValue(name).trim();
    C = [token("--fg"), token("--accent"), token("--surface")];
    themeMeta?.setAttribute("content", token("--bg"));
    const label = { dark: "Dark", light: "Light", system: "System" }[themeMode];
    themeButton.textContent = label;
    themeButton.setAttribute("aria-label", `Theme: ${label}`);
    if (L) {
      buildCache();
      draw(performance.now());
    }
  }

  function cycleTheme() {
    themeMode = { dark: "light", light: "system", system: "dark" }[themeMode];
    storage.set(THEME_KEY, themeMode);
    applyTheme();
  }

  function renderSound() {
    soundButton.textContent = soundOn ? "Sound on" : "Sound off";
    soundButton.setAttribute("aria-pressed", String(soundOn));
  }

  function toggleSound() {
    soundOn = !soundOn;
    storage.set(SOUND_KEY, soundOn ? "on" : "off");
    renderSound();
    if (soundOn) {
      initAudio();
      tick(true);
    }
  }

  function showSection(i) {
    idx = i;
    html.dataset.section = sections[i].id;
    counter.textContent = `${String(i + 1).padStart(2, "0")} / ${String(N).padStart(2, "0")}`;
    panel.scrollTop = 0;
    labels.forEach((el, k) => {
      if (k === i) el.setAttribute("aria-current", "true");
      else el.removeAttribute("aria-current");
    });
  }

  // ---------- layout ----------

  function scheduleLayout() {
    cancelAnimationFrame(layRaf);
    layRaf = requestAnimationFrame(layout);
  }

  function wordCols(word, s) {
    let cols = 0;
    for (const ch of word) cols += (ch === " " ? 4 : 6) * s;
    return cols - s;
  }

  function layout() {
    const W = root.clientWidth, H = root.clientHeight;
    if (!W || !H) {
      if (++layTries < 120) scheduleLayout();
      return;
    }
    layTries = 0;
    if (L && L.W === W && L.H === H) return;
    const narrow = W < 760;
    // Short screens, such as a phone in landscape, get a tighter top area to give the panel more room.
    const short = !narrow && H < 520;
    const G = narrow ? 10 : 12, sR = G / 12;
    const COLS = Math.floor((W - 4) / G) + 1, ROWS = Math.floor((H - 4) / G) + 1;
    const OX = Math.round((W - (COLS - 1) * G) / 2), OY = Math.round((H - (ROWS - 1) * G) / 2);
    const sx = (v) => OX + Math.round((v - OX) / G) * G, sy = (v) => OY + Math.round((v - OY) / G) * G;
    const cx = (v) => OX + Math.ceil((v - OX) / G) * G, cy = (v) => OY + Math.ceil((v - OY) / G) * G;
    const ht = narrow ? 18 : 26;
    let RX, AX, AY, CX, CY, R, nx, ny, tx, ty, GAP, thMax;
    if (!narrow) {
      // The dial sits on the right edge and turns vertically.
      RX = cx(Math.min(88, Math.max(28, W * 0.05)));
      AX = sx(W - (W >= 1100 ? 290 : 250)); AY = sy(H / 2);
      R = Math.max(560, Math.min(900, H * 0.85)); CX = AX + R; CY = AY;
      nx = -1; ny = 0; tx = 0; ty = 1; GAP = 54;
      thMax = Math.asin(Math.min(0.98, (H * 0.5 - 16) / R));
    } else {
      // The dial sits at the bottom edge and turns horizontally.
      RX = cx(20);
      AX = sx(W / 2); AY = sy(H - 124);
      R = Math.max(460, Math.min(720, W * 1.4)); CX = AX; CY = AY + R;
      nx = 0; ny = -1; tx = 1; ty = 0; GAP = 96;
      thMax = Math.asin(Math.min(0.98, (W * 0.5 + 10) / R));
    }
    const STEP = GAP / R;
    const RY = cy(ht + (narrow ? 46 : short ? 40 : 60));
    const contentRight = narrow ? W - RX + 2 : AX - 72;
    const avail = contentRight - RX;
    let F = G / 2;
    let RC = Math.max(20, Math.floor(avail / F));
    const s = RC >= 118 ? 2 : 1;
    // On very small screens, tighten the readout pitch so that the longest word fits.
    const need = Math.max(...sections.map((x) => wordCols(x.word, s)));
    if (RC < need) {
      F = Math.max(3, avail / need);
      RC = need;
    }
    const RR = 9 * s + 2;
    const pt = RY + RR * F + (narrow || short ? 8 : 18);
    const vars = {
      "--rx": RX + "px", "--ht": ht + "px", "--hr": (narrow ? RX : 24) + "px", "--pt": pt + "px",
      "--pr": W - contentRight + "px", "--pb": (narrow ? H - AY + 30 : short ? 20 : 52) + "px",
      "--dz-l": (narrow ? 0 : AX - 80) + "px", "--dz-t": (narrow ? AY - 56 : 0) + "px",
      "--hint-d": narrow || short ? "none" : "flex", "--cnt-d": narrow ? "none" : "inline",
    };
    for (const k in vars) root.style.setProperty(k, vars[k]);
    L = { W, H, narrow, G, F, sR, COLS, ROWS, OX, OY, AX, AY, CX, CY, R, nx, ny, tx, ty, GAP, STEP, thMax };
    dpr = Math.min(2, devicePixelRatio || 1);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);

    // Classify dots: 0 base, 1 dim, 2 ring, 3 readout, 4 notch.
    const n = COLS * ROWS;
    cls = new Uint8Array(n);
    candOf = new Int32Array(n).fill(-1);
    const xs = [], ys = [], us = [], ths = [];
    const rx1 = RX + RC * F, ry1 = RY + RR * F;
    for (let j = 0; j < ROWS; j++) for (let i = 0; i < COLS; i++) {
      const k = j * COLS + i, x = OX + i * G, y = OY + j * G;
      if (x >= RX && x < rx1 && y >= RY && y < ry1) { cls[k] = 3; continue; }
      if (x === AX && y === AY) { cls[k] = 4; continue; }
      const vx = x - CX, vy = y - CY, u = Math.hypot(vx, vy) - R;
      if (u > 12) continue;
      const th = Math.atan2(vx * tx + vy * ty, vx * nx + vy * ny);
      if (u >= -34 && Math.abs(th) < thMax) { cls[k] = 2; candOf[k] = xs.length; xs.push(x); ys.push(y); us.push(u); ths.push(th); }
      else if (u < -34) cls[k] = 1;
    }
    const m = xs.length;
    cand = { n: m, x: Float32Array.from(xs), y: Float32Array.from(ys), u: Float32Array.from(us), th: Float32Array.from(ths), r: new Float32Array(m), a: new Float32Array(m) };
    R0 = { RX, RY, RC, RR, F, s, k: F / (G / 2) };
    rv = new Float32Array(RC * RR);
    rt = new Uint8Array(RC * RR);
    rs = new Float64Array(RC * RR);
    const now = performance.now();
    if (!booted) {
      booted = true;
      setReadout(sections[lastIdx].word, now + 250);
      if (!reducedMotion.matches) waves.push({ t0: now + 120, ox: AX, oy: AY, max: narrow ? 520 : 820 });
    } else {
      const b = bitsFor(sections[lastIdx].word);
      rt.set(b);
      for (let q = 0; q < b.length; q++) rv[q] = b[q];
    }
    if (ripple && ripple.dir > 0) ripple.maxR = 1e6;
    buildCache();
    draw(now);
    kick();
  }

  // The static dots go into an offscreen canvas once per layout and theme.
  function buildCache() {
    if (!L || !C) return;
    cache = cache || document.createElement("canvas");
    cache.width = Math.round(L.W * dpr);
    cache.height = Math.round(L.H * dpr);
    const x = cache.getContext("2d");
    x.setTransform(dpr, 0, 0, dpr, 0, 0);
    const pb = new Path2D(), pd = new Path2D(), r = 1.2 * L.sR;
    for (let j = 0; j < L.ROWS; j++) for (let i = 0; i < L.COLS; i++) {
      const t = cls[j * L.COLS + i];
      if (t > 1) continue;
      const px = L.OX + i * L.G, py = L.OY + j * L.G, p = t ? pd : pb;
      p.moveTo(px + r, py);
      p.arc(px, py, r, 0, 6.2832);
    }
    x.fillStyle = C[0];
    x.globalAlpha = 0.16;
    x.fill(pb);
    x.globalAlpha = 0.08;
    x.fill(pd);
  }

  // ---------- readout ----------

  function glyph(ch) {
    if (!glyphs[ch]) {
      const src = FONT[ch];
      if (!src) return null;
      const rows = src.split(" ").map((row) => (row === "0" ? "....." : row));
      while (rows.length < 9) rows.push(".....");
      glyphs[ch] = rows;
    }
    return glyphs[ch];
  }

  function bitsFor(word) {
    const { RC, RR, s } = R0, out = new Uint8Array(RC * RR);
    let col = 0;
    for (const ch of word) {
      if (ch === " ") { col += 4 * s; continue; }
      const g = glyph(ch);
      if (g) for (let r = 0; r < 9; r++) for (let c = 0; c < 5; c++) if (g[r][c] === "#")
        for (let yy = 0; yy < s; yy++) for (let xx = 0; xx < s; xx++) {
          const X = col + c * s + xx, Y = 1 + r * s + yy;
          if (X < RC && Y < RR) out[Y * RC + X] = 1;
        }
      col += 6 * s;
    }
    return out;
  }

  function setReadout(word, now) {
    const bits = bitsFor(word), RC = R0.RC;
    for (let i = 0; i < bits.length; i++) if (bits[i] !== rt[i]) {
      rt[i] = bits[i];
      rs[i] = now + (i % RC) * 5 + (bits[i] ? 30 : 0);
    }
    rDirty = true;
  }

  function stepReadout(dt, now) {
    if (!rDirty) return false;
    const k = 1 - Math.pow(0.7, dt / 16);
    let busy = false;
    for (let i = 0; i < rv.length; i++) {
      const d = rt[i] - rv[i];
      if (d === 0) continue;
      busy = true;
      if (now < rs[i]) continue;
      if (Math.abs(d) < 0.004) rv[i] = rt[i];
      else rv[i] += d * k;
    }
    rDirty = busy;
    return busy;
  }

  // ---------- audio ----------

  function initAudio() {
    if (!soundOn) return;
    if (audio) {
      if (audio.state === "suspended") audio.resume();
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    audio = new AC();
    const len = Math.floor(audio.sampleRate * 0.014);
    noise = audio.createBuffer(1, len, audio.sampleRate);
    const d = noise.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 7);
  }

  function tick(strong) {
    if (!soundOn || !audio || audio.state !== "running") return;
    const now = performance.now();
    if (!strong && now - lastTick < 26) return;
    lastTick = now;
    const t = audio.currentTime;
    const src = audio.createBufferSource();
    src.buffer = noise;
    src.playbackRate.value = 0.9 + Math.random() * 0.2;
    const bp = audio.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = strong ? 1800 : 3400;
    bp.Q.value = 1.4;
    const g = audio.createGain();
    g.gain.value = 0.4;
    src.connect(bp);
    bp.connect(g);
    g.connect(audio.destination);
    src.start(t);
    const o = audio.createOscillator(), og = audio.createGain(), dur = strong ? 0.09 : 0.025;
    o.frequency.setValueAtTime(strong ? 520 : 1500, t);
    o.frequency.exponentialRampToValueAtTime(strong ? 180 : 700, t + (strong ? 0.06 : 0.02));
    og.gain.setValueAtTime(strong ? 0.08 : 0.05, t);
    og.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(og);
    og.connect(audio.destination);
    o.start(t);
    o.stop(t + dur + 0.01);
  }

  function buzz(pattern) {
    if (!soundOn || !navigator.vibrate) return;
    try {
      navigator.vibrate(pattern);
    } catch {}
  }

  // ---------- loop ----------

  function kick() {
    if (!raf) {
      lastT = performance.now();
      raf = requestAnimationFrame(frame);
    }
  }

  function frame(now) {
    raf = 0;
    const dt = Math.max(0, Math.min(50, now - lastT));
    lastT = now;
    const busy = step(dt, now);
    draw(now);
    if (busy) raf = requestAnimationFrame(frame);
  }

  function step(dt, now) {
    if (mode === "fling") {
      pos += vel * dt;
      vel *= Math.pow(0.9965, dt);
      if (pos < -0.3 || pos > N - 0.7) {
        pos = Math.max(-0.45, Math.min(N - 0.55, pos));
        target = clampIdx(Math.round(pos));
        mode = "settle";
      } else if (Math.abs(vel) < 0.004) {
        target = clampIdx(Math.round(pos + Math.sign(vel) * 0.3));
        mode = "settle";
      }
    } else if (mode === "settle") {
      pos += (target - pos) * (1 - Math.pow(0.78, dt / 16));
      if (Math.abs(target - pos) < 0.002) {
        pos = target;
        mode = "idle";
        onSettle(now);
      }
    }
    const i = clampIdx(Math.round(pos));
    if (i !== lastIdx) {
      lastIdx = i;
      pawl = 1;
      tick(false);
      if (touching) buzz(4);
      showSection(i);
      setReadout(sections[i].word, now);
    }
    pawl = pawl > 0.01 ? pawl * Math.pow(0.8, dt / 16) : 0;
    const readoutBusy = stepReadout(dt, now);
    return mode !== "idle" || pawl > 0 || readoutBusy || (ripple && !ripple.done) || waves.length > 0;
  }

  function onSettle(now) {
    if (lastIdx === settledIdx) return;
    settledIdx = lastIdx;
    if (!reducedMotion.matches) waves.push({ t0: now, ox: L.AX, oy: L.AY, max: L.narrow ? 520 : 820 });
    try {
      history.replaceState(null, "", `#${sections[lastIdx].id}`);
    } catch {}
  }

  // ---------- drawing ----------

  // Dots are batched by color and alpha so that each frame needs only a few fill calls.
  function addDot(x, y, r, a, col) {
    const b = Math.max(0, Math.min(32, Math.round(a * 32)));
    if (!b || r <= 0) return;
    const key = col * 33 + b;
    let p = buckets.get(key);
    if (!p) {
      p = new Path2D();
      buckets.set(key, p);
    }
    p.moveTo(x + r, y);
    p.arc(x, y, r, 0, 6.2832);
  }

  function flush() {
    buckets.forEach((p, key) => {
      ctx.globalAlpha = (key % 33) / 32;
      ctx.fillStyle = C[Math.floor(key / 33)];
      ctx.fill(p);
    });
    buckets.clear();
    ctx.globalAlpha = 1;
  }

  function computeRing() {
    const { STEP, thMax, sR } = L, c = cand;
    for (let k = 0; k < c.n; k++) {
      const th = c.th[k], u = c.u[k], at = Math.abs(th), env = 1 - at / thMax;
      let r = 1.2, a = 0.16;
      if (env > 0) {
        const e7 = Math.pow(env, 0.7), f = Math.max(0, 1 - at / 0.8);
        const aa = pos + th / STEP, kk = Math.round(aa), dl = Math.abs(aa - kk);
        const bump = kk >= 0 && kk < N ? Math.pow(Math.cos(Math.PI * dl), 8) : 0;
        if (u >= -9 && u <= 9) { r = 1.2 + e7 * (0.4 + 1.9 * f * f + 1.8 * bump); a = 0.16 + e7 * (0.18 + 0.5 * f + 0.45 * bump); }
        else if (u > -32 && u < -14) { r = 1.2 + e7 * (0.2 + 1.0 * f * f + 0.95 * bump); a = 0.16 + e7 * (0.06 + 0.3 * f + 0.32 * bump); }
      }
      c.r[k] = r * sR;
      c.a[k] = Math.min(1, a);
    }
  }

  function rippleRadius(now) {
    const t = Math.min(1, Math.max(0, (now - ripple.t0) / 640)), e = ease(t);
    if (ripple.dir > 0) {
      if (t >= 1 && !ripple.done) {
        ripple.done = true;
        ripple.maxR = 1e6;
        setTimeout(() => setContact("open"), 0);
      }
      return ripple.done ? 1e6 : ripple.maxR * e;
    }
    if (t >= 1) {
      ripple = null;
      setTimeout(() => setContact("closed"), 0);
      return -1;
    }
    return ripple.maxR * (1 - e);
  }

  function draw(now) {
    if (!L || !C || !cache) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, L.W, L.H);
    computeRing();
    const rr = ripple ? rippleRadius(now) : -1;
    const notchR = (4.6 + pawl * 1.3) * L.sR;
    if (rr >= 0) drawFull(rr, notchR);
    else {
      ctx.drawImage(cache, 0, 0, L.W, L.H);
      for (let k = 0; k < cand.n; k++) addDot(cand.x[k], cand.y[k], cand.r[k], cand.a[k], 0);
      drawWaves(now);
      addDot(L.AX, L.AY, notchR, 1, 1);
      drawReadout(-1);
    }
    flush();
    placeLabels();
  }

  function rip(x, y, r, a, col, rr, cell) {
    const sR = L.sR, g = rr - Math.hypot(x - ripple.ox, y - ripple.oy), band = 30 * sR;
    if (g > 0) {
      if (g < band) {
        col = 1;
        r = Math.max(r, 2.4 * sR);
        a = Math.max(a, 0.85);
      } else {
        const q = ease(Math.min(1, (g - band) / (110 * sR)));
        col = 2;
        r += (cell - r) * q;
        a += (1 - a) * q;
      }
    }
    addDot(x, y, r, a, col);
  }

  function drawFull(rr, notchR) {
    const br = 1.2 * L.sR, cell = 8.9 * L.sR;
    for (let j = 0; j < L.ROWS; j++) for (let i = 0; i < L.COLS; i++) {
      const k = j * L.COLS + i, t = cls[k];
      if (t === 3) continue;
      const x = L.OX + i * L.G, y = L.OY + j * L.G;
      let r = br, a = t === 1 ? 0.08 : 0.16, col = 0;
      if (t === 2) { const q = candOf[k]; r = cand.r[q]; a = cand.a[q]; }
      else if (t === 4) { r = notchR; a = 1; col = 1; }
      rip(x, y, r, a, col, rr, cell);
    }
    drawReadout(rr);
  }

  function drawReadout(rr) {
    const { RX, RY, RC, RR, F, k } = R0, sR = L.sR * k, cell = 4.45 * sR;
    for (let y = 0; y < RR; y++) for (let x = 0; x < RC; x++) {
      const v = rv[y * RC + x], r = (0.85 + 1.75 * v) * sR, a = 0.08 + 0.92 * v, px = RX + x * F, py = RY + y * F;
      if (rr >= 0) rip(px, py, r, a, 0, rr, cell);
      else addDot(px, py, r, a, 0);
    }
  }

  function drawWaves(now) {
    if (!waves.length) return;
    const br = 1.2 * L.sR, band = 14 * L.sR;
    waves = waves.filter((w) => (now - w.t0) * 0.9 < w.max);
    for (const w of waves) {
      const rad = (now - w.t0) * 0.9;
      if (rad < 0) continue;
      const fade = Math.pow(1 - rad / w.max, 1.5);
      for (let j = 0; j < L.ROWS; j++) {
        const y = L.OY + j * L.G, dy = y - w.oy;
        if (Math.abs(dy) > rad + band) continue;
        for (let i = 0; i < L.COLS; i++) {
          const k = j * L.COLS + i;
          if (cls[k] !== 0) continue;
          const x = L.OX + i * L.G, g = Math.abs(Math.hypot(x - w.ox, dy) - rad);
          if (g >= band) continue;
          const s = fade * (1 - g / band);
          if (s > 0.03) addDot(x, y, br * (1 + 1.1 * s), 0.16 + 0.6 * s, 1);
        }
      }
    }
  }

  function placeLabels() {
    const rad = L.R - 46;
    for (const el of labels) {
      const i = +el.dataset.i, ph = (i - pos) * L.STEP, o = 1 - Math.abs(ph) / L.thMax;
      if (o <= 0) {
        el.style.visibility = "hidden";
        continue;
      }
      const c = Math.cos(ph), s = Math.sin(ph);
      const px = L.CX + rad * (L.nx * c + L.tx * s), py = L.CY + rad * (L.ny * c + L.ty * s);
      const near = Math.max(0, 1 - Math.abs(i - pos)), sc = 1 + 0.32 * near;
      el.style.visibility = "visible";
      el.style.opacity = (Math.pow(o, 0.6) * (0.62 + 0.38 * near)).toFixed(3);
      el.style.color = near > 0.5 ? "var(--accent)" : "var(--fg)";
      if (L.narrow) {
        el.style.transformOrigin = "50% 50%";
        el.style.transform = `translate(${px}px,${py}px) translate(-50%,-50%) rotate(${ph}rad) scale(${sc})`;
      } else {
        el.style.transformOrigin = "0 50%";
        el.style.transform = `translate(${px}px,${py}px) translate(0,-50%) rotate(${-ph}rad) scale(${sc})`;
      }
    }
  }

  // ---------- input ----------

  function goTo(i) {
    target = clampIdx(i);
    mode = "settle";
    kick();
  }

  function nudge(d) {
    initAudio();
    goTo(Math.round(mode === "settle" ? target : pos) + d);
  }

  // Past the first and last section, the dial resists like a rubber band.
  function rubber(raw) {
    if (raw < 0) return Math.max(-0.45, raw * 0.35);
    if (raw > N - 1) return Math.min(N - 0.55, N - 1 + (raw - N + 1) * 0.35);
    return raw;
  }

  function dialDown(e) {
    if (contact !== "closed" || e.button > 0 || !L) return;
    initAudio();
    const v = L.narrow ? e.clientX : e.clientY;
    drag = { id: e.pointerId, last: v, raw: pos, moved: 0, label: e.currentTarget.dataset.i, cx: e.clientX, cy: e.clientY };
    mode = "drag";
    vel = 0;
    samples = [{ t: performance.now(), p: pos }];
    touching = e.pointerType === "touch";
    zone.style.cursor = "grabbing";
    kick();
  }

  function onMove(e) {
    if (!drag || e.pointerId !== drag.id) return;
    const v = L.narrow ? e.clientX : e.clientY, dv = v - drag.last;
    drag.last = v;
    drag.moved += Math.abs(dv);
    drag.raw -= dv / L.GAP;
    pos = rubber(drag.raw);
    const now = performance.now();
    samples.push({ t: now, p: pos });
    while (samples.length > 2 && now - samples[0].t > 90) samples.shift();
    kick();
  }

  function onUp(e) {
    if (!drag || e.pointerId !== drag.id) return;
    const d = drag;
    drag = null;
    touching = false;
    zone.style.cursor = "";
    // iOS only starts audio inside a gesture end, so resume it here too.
    initAudio();
    if (d.moved < 6) {
      if (d.label !== undefined) goTo(+d.label);
      else {
        const rb = root.getBoundingClientRect(), vx = d.cx - rb.left - L.CX, vy = d.cy - rb.top - L.CY;
        const th = Math.atan2(vx * L.tx + vy * L.ty, vx * L.nx + vy * L.ny);
        goTo(Math.round(pos + th / L.STEP));
      }
      return;
    }
    const now = performance.now(), s0 = samples[0];
    vel = Math.max(-0.06, Math.min(0.06, (pos - s0.p) / Math.max(1, now - s0.t)));
    target = clampIdx(Math.round(pos));
    mode = pos < 0 || pos > N - 1 ? "settle" : Math.abs(vel) > 0.006 ? "fling" : "settle";
    kick();
  }

  // The wheel scrolls the panel first. At the end of the panel, it turns the dial.
  function onWheel(e) {
    if (contact !== "closed" || !L) {
      e.preventDefault();
      return;
    }
    const now = performance.now();
    let dy = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
    if (e.deltaMode === 1) dy *= 16;
    else if (e.deltaMode === 2) dy *= 400;
    if (panel.contains(e.target)) {
      const can = dy > 0 ? panel.scrollTop + panel.clientHeight < panel.scrollHeight - 1 : panel.scrollTop > 0;
      if (can) {
        panelWheelT = now;
        return;
      }
      if (now - panelWheelT < 320) {
        panelWheelT = now;
        e.preventDefault();
        return;
      }
    }
    e.preventDefault();
    dy = Math.max(-60, Math.min(60, dy));
    mode = "wheel";
    pos = Math.max(-0.45, Math.min(N - 0.55, pos + dy / 120));
    clearTimeout(wheelT);
    wheelT = setTimeout(() => {
      target = clampIdx(Math.round(pos));
      mode = "settle";
      kick();
    }, 110);
    kick();
  }

  // On touch screens, a swipe that starts at the end of the panel turns the dial.
  // The swipe must start at the edge, so a scroll that reaches the edge does not change the section.
  function onTouchStart(e) {
    if (e.touches.length !== 1 || contact !== "closed") {
      swipe = null;
      return;
    }
    const t = e.touches[0];
    swipe = {
      x: t.clientX,
      y: t.clientY,
      t: performance.now(),
      top: panel.scrollTop <= 0,
      bottom: panel.scrollTop + panel.clientHeight >= panel.scrollHeight - 1,
    };
  }

  function onTouchEnd(e) {
    const s = swipe;
    swipe = null;
    if (!s || e.changedTouches.length !== 1) return;
    const t = e.changedTouches[0], dx = t.clientX - s.x, dy = s.y - t.clientY;
    if (performance.now() - s.t > 700 || Math.abs(dy) < 60 || Math.abs(dy) < Math.abs(dx) * 1.5) return;
    if (dy > 0 && s.bottom && idx < N - 1) nudge(1);
    else if (dy < 0 && s.top && idx > 0) nudge(-1);
  }

  function onKey(e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const tg = e.target;
    if (tg && tg.closest && tg.closest("input,textarea,select,[contenteditable]")) return;
    if (contact === "open") {
      if (e.key === "Escape") closeContact();
      return;
    }
    if (contact !== "closed") return;
    const k = e.key;
    let d = 0;
    if (k === "ArrowDown" || k === "ArrowRight" || k === "PageDown" || k === "j") d = 1;
    else if (k === "ArrowUp" || k === "ArrowLeft" || k === "PageUp" || k === "k") d = -1;
    else if (k === "Home" || k === "End") {
      e.preventDefault();
      initAudio();
      goTo(k === "Home" ? 0 : N - 1);
      return;
    } else if (k === "Enter" && idx === N - 1 && (!tg || tg === document.body)) {
      openContact();
      return;
    }
    if (!d) return;
    e.preventDefault();
    nudge(d);
  }

  // ---------- contact sheet ----------

  function setContact(next) {
    contact = next;
    root.dataset.contact = next;
    ui.inert = next !== "closed";
    sheet.hidden = !(next === "open" || next === "closing");
    sheet.classList.toggle("is-leaving", next === "closing");
    if (next === "open") sheet.querySelector("[data-close]").focus({ preventScroll: true });
    if (next === "closed" && opener) {
      opener.focus({ preventScroll: true });
      opener = null;
    }
  }

  function openContact(event, el) {
    event?.preventDefault();
    if (contact !== "closed" || !L) return;
    initAudio();
    opener = el || null;
    if (reducedMotion.matches) {
      setContact("open");
      return;
    }
    let ox = L.AX, oy = L.AY;
    if (el) {
      const b = el.getBoundingClientRect(), rb = root.getBoundingClientRect();
      ox = b.left + b.width / 2 - rb.left;
      oy = b.top + b.height / 2 - rb.top;
    }
    ripple = { dir: 1, t0: performance.now(), ox, oy, maxR: farCorner(ox, oy) + 150 * L.sR, done: false };
    setContact("opening");
    tick(true);
    buzz(10);
    kick();
  }

  function closeContact() {
    if (contact !== "open") return;
    if (reducedMotion.matches) {
      ripple = null;
      setContact("closed");
      draw(performance.now());
      return;
    }
    setContact("closing");
    clearTimeout(closeT);
    closeT = setTimeout(() => {
      const o = ripple || { ox: L.AX, oy: L.AY };
      ripple = { dir: -1, t0: performance.now(), ox: o.ox, oy: o.oy, maxR: farCorner(o.ox, o.oy) + 150 * L.sR, done: false };
      setContact("reverting");
      tick(true);
      kick();
    }, 150);
  }

  async function copyEmail(button) {
    const text = button.dataset.copy;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.append(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }
    button.textContent = "Copied";
    clearTimeout(button.copyTimer);
    button.copyTimer = setTimeout(() => {
      button.textContent = "Copy email";
    }, 1600);
  }

  // ---------- wiring ----------

  root.addEventListener("click", (e) => {
    const copy = e.target.closest("[data-copy]");
    if (copy) {
      copyEmail(copy);
      return;
    }
    if (e.target.closest("[data-close]")) {
      closeContact();
      return;
    }
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    if (link.hasAttribute("data-open-contact")) {
      openContact(e, link);
      return;
    }
    const i = sections.findIndex((s) => `#${s.id}` === link.getAttribute("href"));
    if (i < 0) return;
    e.preventDefault();
    initAudio();
    goTo(i);
  });

  labels.forEach((el) => {
    el.addEventListener("pointerdown", dialDown);
    // Keyboard activation has detail 0. Pointer activation is handled by dialDown and onUp.
    el.addEventListener("click", (e) => {
      if (e.detail === 0) goTo(+el.dataset.i);
    });
  });
  zone.addEventListener("pointerdown", dialDown);
  themeButton.addEventListener("click", cycleTheme);
  soundButton.addEventListener("click", toggleSound);
  root.addEventListener("wheel", onWheel, { passive: false });
  panel.addEventListener("touchstart", onTouchStart, { passive: true });
  panel.addEventListener("touchend", onTouchEnd, { passive: true });
  panel.addEventListener("touchcancel", () => { swipe = null; }, { passive: true });
  addEventListener("keydown", onKey);
  addEventListener("pointermove", onMove);
  addEventListener("pointerup", onUp);
  addEventListener("pointercancel", onUp);
  addEventListener("resize", scheduleLayout);
  addEventListener("hashchange", () => {
    const i = sections.findIndex((s) => s.id === location.hash.slice(1));
    if (i >= 0 && i !== target) goTo(i);
  });
  systemDark.addEventListener("change", () => {
    if (themeMode === "system") applyTheme();
  });
  new ResizeObserver(scheduleLayout).observe(root);

  const start = Math.max(0, sections.findIndex((s) => s.id === location.hash.slice(1)));
  pos = target = lastIdx = settledIdx = start;
  showSection(start);
  renderSound();
  applyTheme();
  layout();
})();
