/* ===================================================
   TOMOYA & SAYAKA WEDDING - script.js
   Pixel Miyajima RPG
   =================================================== */

'use strict';

// ===================================================
//  Constants & Config
// ===================================================
const WEDDING_DATE = new Date('2026-11-02T14:00:00+09:00');
const ANNOUNCE_DATE = new Date('2025-01-01T00:00:00+09:00');

const TOMOYA_BIRTH = { y: 2000, m: 3,  d: 12 };
const SAYAKA_BIRTH = { y: 1998, m: 9,  d: 19 };

// Color constants (match CSS variables)
const C = {
  bg:          '#0D0D1A',
  gold:        '#FFD700',
  goldDark:    '#CC9900',
  torii:       '#CC2200',
  toriiDark:   '#991100',
  toriiShad:   '#771100',
  waterDeep:   '#003366',
  waterMid:    '#0055AA',
  waterLight:  '#0077CC',
  waterFoam:   '#88BBFF',
  skyTop:      '#1a0a2e',
  skyMid:      '#3d1a5e',
  skyHorizon:  '#8B2FC9',
  dawnOrange:  '#CC4422',
  dawnPink:    '#FF6B35',
  dawnYellow:  '#FF9F45',
  islandDark:  '#0d1a0d',
  islandMid:   '#1a2e1a',
  skin:        '#E8B88A',
  white:       '#F8F8F8',
  uiBorder:    '#8888FF',
};

// ===================================================
//  Utility
// ===================================================
function lerp(a, b, t) { return a + (b - a) * t; }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return [r,g,b];
}
function rgbaStr(hex, a) {
  const [r,g,b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}

function calculateAge(by, bm, bd) {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  const d = now.getDate();
  let age = y - by;
  if (m < bm || (m === bm && d < bd)) age--;
  return age;
}

function pad2(n) { return String(n).padStart(2, '0'); }

// ===================================================
//  Typing Effect
// ===================================================
function typeText(element, text, speed, callback) {
  let i = 0;
  element.textContent = '';
  const cursor = element.nextElementSibling;
  if (cursor) cursor.classList.remove('hidden');

  function tick() {
    if (i < text.length) {
      element.textContent += text[i++];
      setTimeout(tick, speed);
    } else {
      if (cursor) {
        setTimeout(() => cursor.classList.add('hidden'), 1200);
      }
      if (callback) setTimeout(callback, 200);
    }
  }
  tick();
}

// ===================================================
//  OPENING SCREEN
// ===================================================
function drawEnvelope(canvas) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  const px = 4; // pixel size
  ctx.clearRect(0, 0, w, h);

  // Envelope body
  ctx.fillStyle = '#EEEECC';
  ctx.fillRect(px*4, px*5, px*32, px*20);

  // Envelope flap (closed V shape)
  ctx.fillStyle = '#DDDDAA';
  // Left triangle
  ctx.beginPath();
  ctx.moveTo(px*4, px*5);
  ctx.lineTo(px*20, px*16);
  ctx.lineTo(px*4, px*25);
  ctx.fill();
  // Right triangle
  ctx.beginPath();
  ctx.moveTo(px*36, px*5);
  ctx.lineTo(px*20, px*16);
  ctx.lineTo(px*36, px*25);
  ctx.fill();
  // Top flap
  ctx.fillStyle = '#CCCCAA';
  ctx.beginPath();
  ctx.moveTo(px*4, px*5);
  ctx.lineTo(px*36, px*5);
  ctx.lineTo(px*20, px*16);
  ctx.fill();
  // Bottom flap
  ctx.fillStyle = '#CCCCAA';
  ctx.beginPath();
  ctx.moveTo(px*4, px*25);
  ctx.lineTo(px*36, px*25);
  ctx.lineTo(px*20, px*15);
  ctx.fill();

  // Border
  ctx.strokeStyle = '#997755';
  ctx.lineWidth = px;
  ctx.strokeRect(px*4, px*5, px*32, px*20);

  // Red seal in center
  ctx.fillStyle = C.torii;
  ctx.beginPath();
  ctx.arc(px*20, px*15.5, px*3, 0, Math.PI * 2);
  ctx.fill();

  // Wax seal highlight
  ctx.fillStyle = '#FF4422';
  ctx.beginPath();
  ctx.arc(px*19, px*14.5, px*1, 0, Math.PI * 2);
  ctx.fill();

  // Stars decoration
  ctx.fillStyle = C.gold;
  [[px*10, px*20], [px*30, px*20], [px*20, px*22]].forEach(([x,y]) => {
    ctx.fillRect(x, y, px, px);
    ctx.fillRect(x-px, y+px, px*3, px);
    ctx.fillRect(x, y+px*2, px, px);
  });
}

function startOpeningAnimation() {
  drawEnvelope(document.getElementById('envelope-canvas'));

  const textEl = document.getElementById('opening-text');
  const msg = '結婚式の\n招待状が\n届きました！';

  setTimeout(() => {
    typeText(textEl, msg, 90, () => {
      const btn = document.getElementById('open-btn');
      btn.classList.remove('hidden');
      btn.style.animation = 'pulse-btn 1.5s ease-in-out infinite';
    });
  }, 600);
}

function openInvitation() {
  const btn = document.getElementById('open-btn');
  if (btn) btn.disabled = true;

  const flash = document.createElement('div');
  flash.id = 'flash-overlay';
  document.body.appendChild(flash);

  setTimeout(() => {
    const overlay = document.getElementById('opening-overlay');
    overlay.classList.add('fade-out');

    // main を opacity:0 で DOM に展開しておくことで canvas のサイズが確定する
    const main = document.getElementById('main-content');
    main.classList.remove('hidden');
    main.style.opacity = '0';

    setTimeout(() => {
      overlay.remove();
      flash.remove();

      showLoadingScreen(() => {
        main.style.transition = 'opacity 0.8s ease';
        setTimeout(() => { main.style.opacity = '1'; }, 50);
      });
    }, 900);
  }, 350);
}

// ===================================================
//  LOADING SCREEN
// ===================================================
const LOADING_STEPS = [
  { at: 0,    msg: '招待状を解読中...',              fn: null },
  { at: 0.2,  msg: '宮島への道を開いています...',    fn: () => { initTitleCanvas(); initStoryCanvas(); } },
  { at: 0.45, msg: '旅の仲間を呼び集めています...', fn: () => { initCharacterSprites(); setCharacterLevels(); } },
  { at: 0.65, msg: '二人の物語を読み込み中...',      fn: () => { initCountdown(); } },
  { at: 0.85, msg: '冒険の準備完了！',               fn: () => { initScrollReveal(); initParallax(); } },
];

function showLoadingScreen(onComplete) {
  const loadingEl  = document.getElementById('loading-overlay');
  const barFill    = document.getElementById('loading-bar-fill');
  const percentEl  = document.getElementById('loading-percent');
  const msgEl      = document.getElementById('loading-msg');
  const dotsEl     = document.getElementById('loading-dots');
  const canvas     = document.getElementById('loading-canvas');

  loadingEl.classList.remove('hidden');

  const cancelAnim = startLoadingCanvasAnim(canvas);

  let dotsCount = 0;
  const dotsTimer = setInterval(() => {
    dotsCount = (dotsCount + 1) % 4;
    dotsEl.textContent = '.'.repeat(dotsCount);
  }, 400);

  const DURATION = 2400;
  const startTime = performance.now();
  let stepIdx = 0;

  function update(now) {
    const elapsed  = now - startTime;
    const progress = Math.min(elapsed / DURATION, 1);
    const pct      = Math.floor(progress * 100);

    barFill.style.width    = pct + '%';
    percentEl.textContent  = pct + '%';

    while (stepIdx < LOADING_STEPS.length && progress >= LOADING_STEPS[stepIdx].at) {
      msgEl.textContent = LOADING_STEPS[stepIdx].msg;
      if (LOADING_STEPS[stepIdx].fn) LOADING_STEPS[stepIdx].fn();
      stepIdx++;
    }

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      clearInterval(dotsTimer);
      if (cancelAnim) cancelAnim();

      setTimeout(() => {
        loadingEl.style.transition = 'opacity 0.5s ease';
        loadingEl.style.opacity = '0';
        setTimeout(() => {
          loadingEl.classList.add('hidden');
          loadingEl.style.opacity = '';
          loadingEl.style.transition = '';
          onComplete();
        }, 500);
      }, 300);
    }
  }

  requestAnimationFrame(update);
}

function startLoadingCanvasAnim(canvas) {
  if (!canvas) return null;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  let animId;

  function loop(ts) {
    ctx.clearRect(0, 0, W, H);

    // Sky gradient
    const sky = ctx.createLinearGradient(0, 0, 0, H * 0.65);
    sky.addColorStop(0,   C.skyTop);
    sky.addColorStop(0.6, C.skyMid);
    sky.addColorStop(1,   C.dawnOrange);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H * 0.65);

    // Water
    const wGrad = ctx.createLinearGradient(0, H * 0.6, 0, H);
    wGrad.addColorStop(0, C.waterMid);
    wGrad.addColorStop(1, C.waterDeep);
    ctx.fillStyle = wGrad;
    ctx.fillRect(0, H * 0.6, W, H * 0.4);

    // Stars
    for (let i = 0; i < 10; i++) {
      const sx = ((i * 0.11 + ts * 0.00003) % 1.05) * W;
      const sy = H * 0.06 + (i % 3) * 5;
      const fa = 0.3 + 0.7 * Math.abs(Math.sin(ts * 0.002 + i * 1.1));
      ctx.fillStyle = `rgba(255, 240, 200, ${fa})`;
      ctx.fillRect(sx, sy, 2, 2);
    }

    // Mini torii (recordRect=false でクリック判定を汚染しない)
    const pulse = 0.8 + 0.2 * Math.sin(ts * 0.0015);
    ctx.save();
    ctx.globalAlpha = pulse;
    drawToriiGate(ctx, W * 0.5, H * 0.66, 1, ts, false);
    ctx.restore();

    animId = requestAnimationFrame(loop);
  }
  animId = requestAnimationFrame(loop);
  return () => cancelAnimationFrame(animId);
}

// ===================================================
//  TITLE CANVAS — Scene Renderer
// ===================================================
let titleAnimId = null;
let titleTime = 0;
let toriiClickCount = 0;
let toriiRect = { x: 0, y: 0, w: 0, h: 0 };

// Cloud positions
const clouds = [
  { x: 0.05, y: 0.08, speed: 0.00008, scale: 1.2, alpha: 0.55 },
  { x: 0.3,  y: 0.05, speed: 0.00005, scale: 0.8, alpha: 0.4  },
  { x: 0.6,  y: 0.12, speed: 0.00010, scale: 1.0, alpha: 0.5  },
  { x: 0.8,  y: 0.07, speed: 0.00006, scale: 0.7, alpha: 0.35 },
];

// Sparkle particles
const sparkles = Array.from({length: 28}, (_, i) => ({
  x: Math.random(), y: Math.random() * 0.6,
  size: Math.random() * 2 + 1,
  speed: Math.random() * 0.0003 + 0.0001,
  phase: Math.random() * Math.PI * 2,
  alpha: Math.random() * 0.7 + 0.3,
}));

function initTitleCanvas() {
  const canvas = document.getElementById('title-canvas');
  if (!canvas) return;

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Torii click detection
  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const my = (e.clientY - rect.top) * (canvas.height / rect.height);
    if (
      mx >= toriiRect.x && mx <= toriiRect.x + toriiRect.w &&
      my >= toriiRect.y && my <= toriiRect.y + toriiRect.h
    ) {
      handleToriiClick();
    }
  });

  function loop(ts) {
    titleTime = ts;
    renderTitleScene(canvas, ts);
    titleAnimId = requestAnimationFrame(loop);
  }
  titleAnimId = requestAnimationFrame(loop);
}

function renderTitleScene(canvas, t) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  if (W === 0 || H === 0) return;
  ctx.clearRect(0, 0, W, H);

  // --- Sky gradient ---
  const sky = ctx.createLinearGradient(0, 0, 0, H * 0.55);
  sky.addColorStop(0,   C.skyTop);
  sky.addColorStop(0.35, C.skyMid);
  sky.addColorStop(0.7,  C.skyHorizon);
  sky.addColorStop(0.88, C.dawnOrange);
  sky.addColorStop(1,    C.dawnYellow);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H * 0.55);

  // --- Stars ---
  drawStars(ctx, W, H, t);

  // --- Clouds ---
  drawClouds(ctx, W, H, t);

  // --- Far island silhouette ---
  drawIsland(ctx, W, H, 0.2, 0.38, 0.8, 0.07, C.islandDark, 0.7);
  drawIsland(ctx, W, H, 0.55, 0.36, 0.5, 0.06, C.islandDark, 0.8);

  // --- Near island silhouette ---
  // 左：宮島本土側の前景（左端から）
  drawIsland(ctx, W, H, -0.02, 0.42, 0.38, 0.12, C.islandMid, 1.0);
  // 右：対岸の丘陵（右端へ自然に消える）
  drawIsland(ctx, W, H, 0.70, 0.43, 0.38, 0.09, C.islandMid, 0.95);

  // --- Horizon glow ---
  const horizonY = H * 0.44;
  const glow = ctx.createLinearGradient(0, horizonY - 20, 0, horizonY + 30);
  glow.addColorStop(0, 'rgba(255, 159, 69, 0)');
  glow.addColorStop(0.5, 'rgba(255, 120, 40, 0.45)');
  glow.addColorStop(1, 'rgba(255, 100, 20, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, horizonY - 20, W, 50);

  // --- Water ---
  drawWater(ctx, W, H, t);

  // --- Torii Gate ---
  const toriiBaseX = W * 0.5;
  const toriiBaseY = H * 0.52;
  const px = Math.max(3, Math.floor(W / 140));
  drawToriiGate(ctx, toriiBaseX, toriiBaseY, px, t);

  // --- Sparkle particles ---
  drawSparkles(ctx, W, H, t);
}

function drawStars(ctx, W, H, t) {
  const starPositions = [
    [0.08, 0.06], [0.18, 0.02], [0.28, 0.09], [0.38, 0.03],
    [0.48, 0.07], [0.55, 0.01], [0.68, 0.08], [0.78, 0.04],
    [0.85, 0.10], [0.92, 0.02], [0.12, 0.15], [0.45, 0.14],
    [0.72, 0.13], [0.95, 0.11],
  ];
  starPositions.forEach(([rx, ry], i) => {
    const flicker = 0.5 + 0.5 * Math.sin(t * 0.002 + i * 1.3);
    ctx.fillStyle = `rgba(255, 240, 220, ${0.3 + 0.7 * flicker})`;
    const sx = rx * W, sy = ry * H * 0.7;
    ctx.fillRect(sx, sy, 2, 2);
  });
}

function drawClouds(ctx, W, H, t) {
  clouds.forEach(cloud => {
    const x = ((cloud.x + cloud.speed * t) % 1.2 - 0.1) * W;
    const y = cloud.y * H;
    ctx.save();
    ctx.globalAlpha = cloud.alpha * (0.7 + 0.3 * Math.sin(t * 0.001 + cloud.x * 10));
    drawPixelCloud(ctx, x, y, cloud.scale, W);
    ctx.restore();
  });
}

function drawPixelCloud(ctx, cx, cy, scale, W) {
  const px = Math.max(2, Math.floor(W / 200)) * scale;
  const blobs = [[0,0,5,3],[3,-2,7,4],[8,-1,6,3],[14,0,4,2]];
  blobs.forEach(([bx, by, bw, bh]) => {
    const grad = ctx.createRadialGradient(
      cx + bx*px, cy + by*px, 0,
      cx + bx*px, cy + by*px, bw*px
    );
    grad.addColorStop(0, 'rgba(180, 160, 200, 0.7)');
    grad.addColorStop(1, 'rgba(100, 80, 140, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(cx + bx*px, cy + by*px, bw*px*0.6, bh*px*0.5, 0, 0, Math.PI*2);
    ctx.fill();
  });
}

function drawIsland(ctx, W, H, rx, ry, rw, rh, color, alpha) {
  const x = rx * W, y = ry * H;
  const w = rw * W, h = rh * H;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  // 底辺をキャンバス最下端（H）まで伸ばすことで水面への自然な接続を実現
  ctx.moveTo(x, H);

  const steps = 32;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const bumpX = x + t * w;
    const envelope = Math.sin(t * Math.PI);
    const seed = rx * 6.28;
    const noise = Math.sin(t * Math.PI * 3.2 + seed) * 0.22 +
                  Math.sin(t * Math.PI * 7.1 + seed * 1.3) * 0.10 +
                  Math.sin(t * Math.PI * 14  + seed * 0.7) * 0.04;
    const bumpH = h * envelope * Math.max(0.15, 0.65 + noise);
    ctx.lineTo(bumpX, y + h - bumpH);
  }
  ctx.lineTo(x + w, H);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawWater(ctx, W, H, t) {
  const waterTop = H * 0.44;
  const waterH = H - waterTop;

  // Deep water base
  const waterGrad = ctx.createLinearGradient(0, waterTop, 0, H);
  waterGrad.addColorStop(0,   C.waterMid);
  waterGrad.addColorStop(0.5, C.waterDeep);
  waterGrad.addColorStop(1,   '#001122');
  ctx.fillStyle = waterGrad;
  ctx.fillRect(0, waterTop, W, waterH);

  // Horizon reflection strip (orange glow on water)
  const reflGrad = ctx.createLinearGradient(0, waterTop, 0, waterTop + 60);
  reflGrad.addColorStop(0, 'rgba(255, 140, 60, 0.35)');
  reflGrad.addColorStop(1, 'rgba(255, 100, 20, 0)');
  ctx.fillStyle = reflGrad;
  ctx.fillRect(0, waterTop, W, 60);

  // Wave layers
  const waveLayers = [
    { amp: 3.5, freq: 0.018, speed: 0.0015, yOffset: 0.03, color: C.waterLight, alpha: 0.35 },
    { amp: 2.5, freq: 0.025, speed: 0.0022, yOffset: 0.08, color: C.waterFoam,  alpha: 0.18 },
    { amp: 4.0, freq: 0.013, speed: 0.001,  yOffset: 0.15, color: C.waterMid,   alpha: 0.5  },
    { amp: 2.0, freq: 0.032, speed: 0.003,  yOffset: 0.22, color: C.waterLight, alpha: 0.25 },
    { amp: 5.0, freq: 0.009, speed: 0.0008, yOffset: 0.35, color: '#003088',    alpha: 0.4  },
  ];

  waveLayers.forEach(wl => {
    const baseY = waterTop + waterH * wl.yOffset;
    ctx.beginPath();
    ctx.moveTo(0, baseY);
    for (let x = 0; x <= W; x += 2) {
      const y = baseY +
        Math.sin(x * wl.freq + t * wl.speed) * wl.amp +
        Math.sin(x * wl.freq * 1.7 + t * wl.speed * 0.7 + 1.2) * wl.amp * 0.4;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fillStyle = rgbaStr(wl.color, wl.alpha);
    ctx.fill();
  });

  // White foam dots on waves
  ctx.fillStyle = 'rgba(180, 220, 255, 0.4)';
  for (let i = 0; i < 20; i++) {
    const wx = ((i * 0.137 + t * 0.0003) % 1) * W;
    const wy = waterTop + waterH * 0.05 + Math.sin(wx * 0.02 + t * 0.001) * 4;
    ctx.fillRect(wx, wy, 4, 2);
  }
}

// recordRect=false のときは toriiRect を更新しない（ストーリーキャンバス用）
function drawToriiGate(ctx, cx, baseY, px, t, recordRect = true) {
  const gw = 50, gh = 46;
  const ox = cx - (gw / 2) * px;
  const oy = baseY - gh * px;

  // タイトルキャンバスのみクリック判定領域を更新
  if (recordRect) {
    toriiRect = { x: ox, y: oy, w: gw * px, h: gh * px + 20 };
  }

  // Pulsing glow behind torii
  const pulse = 0.5 + 0.5 * Math.sin(t * 0.001);
  const glowGrad = ctx.createRadialGradient(cx, baseY - gh * px * 0.5, 10, cx, baseY - gh * px * 0.5, gw * px);
  glowGrad.addColorStop(0, `rgba(204, 34, 0, ${0.12 + 0.08 * pulse})`);
  glowGrad.addColorStop(1, 'rgba(204, 34, 0, 0)');
  ctx.fillStyle = glowGrad;
  ctx.fillRect(cx - gw * px, oy - 20, gw * px * 2, gh * px + 40);

  // Helper: fill a rectangle in game-pixel coordinates
  function fill(gx, gy, gwidth, gheight, color) {
    ctx.fillStyle = color;
    ctx.fillRect(ox + gx * px, oy + gy * px, gwidth * px, gheight * px);
  }
  function shadow(gx, gy, gwidth, gheight) {
    fill(gx, gy, gwidth, gheight, C.toriiShad);
  }

  // ---- Kasagi (top crossbeam, slightly wider, curved look) ----
  // Main kasagi
  fill(0, 1, 50, 4, C.torii);
  // Top edge bright
  fill(0, 1, 50, 1, '#DD3311');
  // Bottom edge shadow
  shadow(0, 4, 50, 1);
  // End caps (upward tips)
  fill(0, 0, 3, 2, C.torii);
  fill(47, 0, 3, 2, C.torii);
  // Kasagi dark highlight ends
  shadow(0, 5, 2, 1);
  shadow(48, 5, 2, 1);

  // ---- Shimagi/Nuki (second horizontal beam) ----
  fill(3, 9, 44, 3, C.torii);
  shadow(3, 11, 44, 1);
  // Small connecting blocks to pillars
  fill(5, 7, 4, 2, C.torii);
  fill(41, 7, 4, 2, C.torii);

  // ---- Left pillar (hashira) ----
  // Outer face
  fill(5, 5, 7, 41, C.torii);
  // Inner face (slightly lighter)
  fill(6, 5, 5, 41, '#D42800');
  // Shadow side (right of pillar)
  shadow(11, 5, 1, 41);
  // Highlight (left of pillar)
  fill(5, 5, 1, 41, '#EE3311');
  // Pillar base
  fill(4, 42, 9, 4, C.toriiDark);
  fill(3, 44, 11, 2, C.toriiShad);

  // ---- Right pillar (hashira) ----
  fill(38, 5, 7, 41, C.torii);
  fill(38, 5, 5, 41, '#D42800');
  shadow(44, 5, 1, 41);
  fill(38, 5, 1, 41, '#EE3311');
  fill(37, 42, 9, 4, C.toriiDark);
  fill(36, 44, 11, 2, C.toriiShad);

  // ---- Water reflection ----
  drawToriiReflection(ctx, cx, baseY, px, gw, gh, t);
}

function drawToriiReflection(ctx, cx, baseY, px, gw, gh, t) {
  // Wavy distorted reflection in water
  ctx.save();
  ctx.globalAlpha = 0.35 + 0.1 * Math.sin(t * 0.0008);

  const reflH = gh * px * 0.65;
  const waveAmp = 1.5 + Math.sin(t * 0.001) * 0.8;

  for (let row = 0; row < reflH; row += 2) {
    const progress = row / reflH;
    const alpha = (1 - progress) * 0.6;
    if (alpha <= 0) continue;

    const waveX = Math.sin(row * 0.18 + t * 0.002) * waveAmp +
                  Math.sin(row * 0.31 + t * 0.0015) * waveAmp * 0.5;
    const waveStretch = 1 + progress * 0.15;

    ctx.save();
    ctx.globalAlpha = alpha * 0.35;

    // Left pillar reflection
    ctx.fillStyle = C.toriiDark;
    ctx.fillRect(
      cx - (gw * 0.5 - 5) * px * waveStretch + waveX,
      baseY + row,
      7 * px * waveStretch, 2
    );
    // Right pillar reflection
    ctx.fillRect(
      cx + (gw * 0.5 - 12) * px * waveStretch + waveX,
      baseY + row,
      7 * px * waveStretch, 2
    );
    // Kasagi reflection (top beam)
    if (row < 12) {
      ctx.fillRect(
        cx - gw * 0.5 * px * waveStretch + waveX,
        baseY + row,
        gw * px * waveStretch, 2
      );
    }
    ctx.restore();
  }

  ctx.restore();
}

function drawSparkles(ctx, W, H, t) {
  sparkles.forEach(sp => {
    const x = ((sp.x + sp.speed * t * 0.01) % 1.05) * W;
    const y = sp.y * H * 0.8 + Math.sin(t * 0.0015 + sp.phase) * 15;
    const flicker = 0.3 + 0.7 * Math.abs(Math.sin(t * 0.003 + sp.phase));
    const alpha = sp.alpha * flicker;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = C.gold;
    // Cross shape
    ctx.fillRect(x - 1, y - sp.size, 2, sp.size * 2);
    ctx.fillRect(x - sp.size, y - 1, sp.size * 2, 2);
    ctx.restore();
  });
}

// ===================================================
//  STORY CANVAS
// ===================================================
let storyAnim = null;
let storyTime = 0;

const CHAR_COLORS = {
  // Tomoya pixel columns (simplified 8x12 at 3px)
  tomoya: {
    hair: '#222222',
    skin: C.skin,
    haoriOuter: '#1a1a1a',
    haoriInner: '#F0F0F0',
    hakama: '#111111',
    belt: '#333333',
    tabi: '#FFFFFF',
    shadow: '#080808',
  },
  sayaka: {
    hood: '#F5F5F5',
    skin: C.skin,
    kimono: '#FFFFFF',
    kimonoShadow: '#DDDDDD',
    fold: '#CCCCCC',
    tabi: '#FFFFFF',
    accent: '#FFE8F0',
  }
};

function initStoryCanvas() {
  const canvas = document.getElementById('story-canvas');
  if (!canvas) return;

  canvas.width = Math.min(canvas.offsetWidth || 400, 500);
  canvas.height = 160;

  function loop(ts) {
    storyTime = ts;
    renderStoryScene(canvas, ts);
    storyAnim = requestAnimationFrame(loop);
  }
  storyAnim = requestAnimationFrame(loop);
}

function renderStoryScene(canvas, t) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  // Dark background with subtle grid
  ctx.fillStyle = '#080810';
  ctx.fillRect(0, 0, W, H);

  // Grid
  ctx.strokeStyle = 'rgba(136,136,255,0.06)';
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 16) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = 0; y < H; y += 16) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }

  // Path
  ctx.fillStyle = '#1a1a00';
  ctx.fillRect(0, H - 40, W, 40);
  // Path bricks
  ctx.fillStyle = '#222200';
  for (let x = 0; x < W; x += 20) {
    ctx.fillRect(x, H - 40, 1, 40);
  }
  ctx.fillRect(0, H - 40, W, 1);

  // Torii Gate in background (smaller) — recordRect=false でクリック判定を汚染しない
  ctx.save();
  ctx.globalAlpha = 0.6;
  const px = 2;
  drawToriiGate(ctx, W * 0.78, H - 38, px, t, false);
  ctx.restore();

  // Characters walking
  const walkSpeed = 0.00006;
  // Tomoya: start right, walk toward center
  const tomoyaX = W * 0.35 + Math.sin(t * walkSpeed) * 8;
  const sayakaX = W * 0.25 + Math.sin(t * walkSpeed + 0.3) * 8;
  const charY = H - 142;
  const frame = Math.floor(t / 300) % 2;

  drawCharacterSprite(ctx, tomoyaX, charY, 'tomoya', frame, 2);
  drawCharacterSprite(ctx, sayakaX, charY, 'sayaka', frame, 2);

  // Firefly sparkles over scene
  for (let i = 0; i < 6; i++) {
    const sx = ((i * 0.17 + t * 0.00005) % 1) * W;
    const sy = 20 + Math.sin(t * 0.002 + i * 1.1) * 30 + i * 8;
    const fa = 0.4 + 0.6 * Math.abs(Math.sin(t * 0.003 + i * 0.9));
    ctx.fillStyle = `rgba(255, 230, 100, ${fa})`;
    ctx.fillRect(sx, sy, 3, 3);
  }
}

// ===================================================
//  CHARACTER SPRITES
// ===================================================

// Pixel data: each row is an array of color keys or '.' for transparent
const TOMOYA_PIXELS = [
  // 12 wide, 16 tall (rendered at px*px scale)
  '  HHHHHH    ', // 0  hair top
  ' HHHHHHHHH  ', // 1
  ' HSSSSSSSH  ', // 2  face
  ' HSSSSSSSH  ', // 3
  ' HSSSSSSSH  ', // 4  eyes
  ' HSSSSSSSH  ', // 5  mouth
  '  WWWWWWW   ', // 6  collar white
  ' OOOOOOOOOO ', // 7  haori outer
  ' OWWWWWWWOO ', // 8  haori inner white
  ' OWWWWWWWOO ', // 9
  ' OBBBBBBBOO ', // 10 belt
  ' OOOOOOOOOO ', // 11 hakama
  ' KKKK KKKK  ', // 12
  ' KKKK KKKK  ', // 13
  ' TTTT TTTT  ', // 14 tabi
  '  TT    TT  ', // 15
];

// simplified: just use a function to draw programmatically
function drawCharacterSprite(ctx, x, y, character, frame, scale) {
  const ps = 3 * scale; // pixel size (3px per game pixel)

  // Bob animation (subtle breathing)
  const bob = frame === 0 ? 0 : -1;

  if (character === 'tomoya') {
    drawTomoyaSprite(ctx, x, y + bob, ps);
  } else if (character === 'sayaka') {
    drawSayakaSprite(ctx, x, y + bob, ps);
  } else if (character === 'yuki') {
    drawYukiSprite(ctx, x, y + bob, ps, frame);
  }
}

// ── 新郎: 原 智也 (黒紋付袴) ──────────────────────────────────
function drawTomoyaSprite(ctx, cx, cy, ps) {
  function p(rx, ry, w, h, color, alpha) {
    ctx.save();
    if (alpha !== undefined) ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.fillRect(cx + rx * ps, cy + ry * ps, w * ps, h * ps);
    ctx.restore();
  }

  const H = '#222222', S = C.skin, O = '#1a1a1a', W = '#EEEEEE',
        B = '#333333', K = '#0a0a0a', T = '#F8F8F8', E = '#4a2800';

  // Hair
  p(-2, 0, 6, 1, H); p(-2, 1, 6, 1, H); p(-2, 2, 1, 2, H); p(3, 2, 1, 2, H);
  // Face
  p(-1, 2, 4, 3, S);
  // Eyes
  p(-0.5, 3, 1, 1, E); p(1.5, 3, 1, 1, E);
  // Mouth
  p(0, 4.5, 2, 0.5, '#CC6644');
  // Collar
  p(-2, 5, 6, 1, W);
  // Haori (outer black)
  p(-2, 6, 6, 5, O);
  // Haori inner white
  p(-0.5, 6, 3, 4, W);
  // Belt/obi
  p(-2, 10, 6, 2, B);
  // Hakama left
  p(-2, 12, 3, 5, K);
  // Hakama right
  p(1, 12, 3, 5, K);
  // Gap
  p(0, 12, 2, 6, '#060606');
  // Tabi
  p(-2, 16, 3, 1, T); p(1, 16, 3, 1, T);
}

function drawSayakaSprite(ctx, cx, cy, ps) {
  function p(rx, ry, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(cx + rx * ps, cy + ry * ps, w * ps, h * ps);
  }

  const WH = '#F5F5F5', S = C.skin, K = '#FFFFFF', F = '#DDDDDD',
        A = '#FFE0EC', T = '#F0F0F0', E = '#4a2800', SH = '#CCCCCC';

  // Wataboshi (hood) - rounded white cap
  p(-2, 0, 6, 1, WH); p(-3, 1, 8, 2, WH); p(-3, 3, 8, 1, WH);
  // Hood shadow
  p(-3, 3, 1, 1, SH); p(4, 3, 1, 1, SH);
  // Face
  p(-1, 4, 4, 2, S);
  // Eyes
  p(-0.5, 4.5, 1, 1, E); p(1.5, 4.5, 1, 1, E);
  // Mouth (subtle)
  p(0.5, 5.5, 1, 0.3, '#CC8877');
  // Kimono neck/collar
  p(-1, 6, 4, 1, WH);
  // Kimono body (wide, layered look)
  p(-3, 7, 8, 4, K);
  p(-2, 7, 6, 4, WH);
  // Fold lines
  p(-1, 8, 1, 3, F); p(2, 8, 1, 3, F);
  // Obi (thin belt)
  p(-2, 11, 6, 1, A);
  // Lower kimono (wide)
  p(-3, 12, 8, 5, K);
  p(-2, 12, 6, 5, WH);
  // Fold lines lower
  p(-1, 13, 1, 4, F); p(2, 13, 1, 4, F);
  // Tabi
  p(-2, 16, 2, 1, T); p(1, 16, 2, 1, T);
}

function drawYukiSprite(ctx, cx, cy, ps, frame) {
  function p(rx, ry, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(cx + rx * ps, cy + ry * ps, w * ps, h * ps);
  }

  const W = '#F2F2EE', S = '#E8E8E0', N = '#333333', C2 = '#88CC44', E = '#222222';
  const legOff = frame === 0 ? 0 : 1;

  // Tail (curled) - wagging
  const tailX = frame === 0 ? 5 : 6;
  p(tailX, -1, 2, 1, W); p(tailX+1, -2, 2, 1, W); p(tailX+2, -1, 1, 2, W);

  // Body
  p(0, 1, 8, 4, W);
  p(0, 2, 8, 3, S);
  // Head
  p(1, -1, 5, 3, W);
  // Ears
  p(1, -2, 2, 1, S); p(4, -2, 2, 1, S);
  // Eyes
  p(2, 0, 1, 1, E); p(4, 0, 1, 1, E);
  // Nose
  p(3, 1, 1, 1, N);
  // Mouth
  p(2, 2, 1, 0.5, N); p(4, 2, 1, 0.5, N);
  // Collar
  p(1, 3, 6, 1, C2);
  // Legs
  p(1, 5, 2, 2 + legOff, W);
  p(5, 5, 2, 2 + (1-legOff), W);
  p(1, 7 + legOff, 2, 1, S);
  p(5, 6 + (1-legOff), 2, 1, S);
}

function initCharacterSprites() {
  // Tomoya
  const tc = document.getElementById('tomoya-canvas');
  if (tc) {
    let frame = 0;
    function animTomoya(ts) {
      const ctx = tc.getContext('2d');
      ctx.clearRect(0, 0, tc.width, tc.height);
      frame = Math.floor(ts / 500) % 2;
      drawCharacterSprite(ctx, tc.width / 2, 8, 'tomoya', frame, 3);
      requestAnimationFrame(animTomoya);
    }
    requestAnimationFrame(animTomoya);
  }

  // Sayaka
  const sc = document.getElementById('sayaka-canvas');
  if (sc) {
    let frame = 0;
    function animSayaka(ts) {
      const ctx = sc.getContext('2d');
      ctx.clearRect(0, 0, sc.width, sc.height);
      frame = Math.floor(ts / 500) % 2;
      drawCharacterSprite(ctx, sc.width / 2, 8, 'sayaka', frame, 3);
      requestAnimationFrame(animSayaka);
    }
    requestAnimationFrame(animSayaka);
  }
}

function setCharacterLevels() {
  const tLevel = calculateAge(TOMOYA_BIRTH.y, TOMOYA_BIRTH.m, TOMOYA_BIRTH.d);
  const sLevel = calculateAge(SAYAKA_BIRTH.y, SAYAKA_BIRTH.m, SAYAKA_BIRTH.d);
  const tEl = document.getElementById('tomoya-level');
  const sEl = document.getElementById('sayaka-level');
  if (tEl) tEl.textContent = tLevel;
  if (sEl) sEl.textContent = sLevel;
}

// ===================================================
//  STORY TYPING
// ===================================================
const STORY_LINES = [
  `「Tomoya と Sayaka は\n　長い冒険の旅を経て\n　ついに結婚という\n　新たなステージへ\n　進みます。」`,
  `「ぜひ皆さまに\n　見届けていただけると\n　幸いです。」`,
];

function startStoryTyping() {
  // Triggered by scroll reveal observer instead
}

function typeStoryLine(lineIndex) {
  const textEl = document.getElementById(`story-text-${lineIndex + 1}`);
  const curEl = document.getElementById(`cur${lineIndex + 1}`);
  if (!textEl || !curEl) return;
  if (textEl.dataset.typed) return;
  textEl.dataset.typed = '1';
  curEl.classList.remove('hidden');

  const isLast = lineIndex >= STORY_LINES.length - 1;
  typeText(textEl, STORY_LINES[lineIndex], 60, isLast ? null : () => {
    setTimeout(() => typeStoryLine(lineIndex + 1), 800);
  });
}

// ===================================================
//  COUNTDOWN TIMER
// ===================================================
function updateCountdown() {
  const now = new Date();
  const diff = WEDDING_DATE - now;

  if (diff <= 0) {
    document.getElementById('cd-days').textContent  = '00';
    document.getElementById('cd-hours').textContent = '00';
    document.getElementById('cd-mins').textContent  = '00';
    document.getElementById('cd-secs').textContent  = '00';
    const prog = document.getElementById('cd-progress');
    if (prog) prog.style.width = '100%';
    return;
  }

  const totalDays  = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours      = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins       = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const secs       = Math.floor((diff % (1000 * 60)) / 1000);

  document.getElementById('cd-days').textContent  = String(totalDays);
  document.getElementById('cd-hours').textContent = pad2(hours);
  document.getElementById('cd-mins').textContent  = pad2(mins);
  document.getElementById('cd-secs').textContent  = pad2(secs);

  // Progress bar: from announce date to wedding date
  const totalSpan = WEDDING_DATE - ANNOUNCE_DATE;
  const elapsed   = now - ANNOUNCE_DATE;
  const progress  = clamp(elapsed / totalSpan * 100, 0, 100);
  const prog = document.getElementById('cd-progress');
  if (prog) prog.style.width = progress + '%';
}

function initCountdown() {
  updateCountdown();
  setInterval(updateCountdown, 1000);
}

// ===================================================
//  SCROLL REVEAL
// ===================================================
// HP/MPバーをアニメーションで伸ばす
function animateStatBars() {
  document.querySelectorAll('.stat-bar').forEach(bar => {
    const value = parseInt(bar.dataset.value, 10);
    const fill = bar.querySelector('.stat-bar-fill');
    if (fill && fill.style.width === '0%') {
      // 少し遅らせてからアニメーション開始（視認性向上）
      setTimeout(() => { fill.style.width = value + '%'; }, 150);
    }
  });
}

function initScrollReveal() {
  const els = document.querySelectorAll('.scroll-reveal');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = parseInt(entry.target.dataset.delay || '0');
        setTimeout(() => {
          entry.target.classList.add('revealed');
          // ストーリーボックスのタイピング発火（1行目のみ。2行目は1行目完了後に連鎖）
          const idx = Array.from(document.querySelectorAll('.story-box')).indexOf(entry.target);
          if (idx === 0) {
            setTimeout(() => typeStoryLine(0), 200);
          }
        }, delay);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  els.forEach(el => observer.observe(el));

  // キャラクターセクション専用: スクロール時にHPバーを発火
  const charSection = document.getElementById('characters-section');
  if (charSection) {
    const barObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateStatBars();
          barObserver.disconnect();
        }
      });
    }, { threshold: 0.2 });
    barObserver.observe(charSection);
  }
}

// ===================================================
//  PARALLAX
// ===================================================
function initParallax() {
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const titleOverlay = document.querySelector('.title-overlay');
    if (titleOverlay) {
      titleOverlay.style.transform = `translateY(${scrollY * 0.3}px)`;
    }
  }, { passive: true });
}

// ===================================================
//  EASTER EGG — Yuki
// ===================================================
function handleToriiClick() {
  toriiClickCount++;

  // Visual feedback
  const canvas = document.getElementById('title-canvas');
  if (canvas) {
    canvas.style.filter = `brightness(${1 + toriiClickCount * 0.1})`;
    setTimeout(() => { canvas.style.filter = ''; }, 200);
  }

  if (toriiClickCount >= 5) {
    triggerEasterEgg();
  }
}

function triggerEasterEgg() {
  toriiClickCount = 0;
  const overlay = document.getElementById('easter-egg-overlay');
  if (!overlay) return;
  overlay.classList.remove('hidden');

  const textEl = overlay.querySelector('#easter-text');
  if (textEl) {
    typeText(textEl, 'ユキが\nあらわれた！', 80, () => {
      startYukiAnimation();
    });
  }
}

function closeEasterEgg() {
  const overlay = document.getElementById('easter-egg-overlay');
  if (overlay) overlay.classList.add('hidden');
}

// ===================================================
//  HINT BUTTON — Tennis ball
// ===================================================
(function () {
  const btn   = document.getElementById('hint-btn');
  const toast = document.getElementById('hint-toast');
  if (!btn || !toast) return;
  let timer = null;

  btn.addEventListener('click', () => {
    toast.classList.remove('hidden');
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => toast.classList.add('hidden'), 4500);
  });

  toast.addEventListener('click', () => {
    if (timer) clearTimeout(timer);
    toast.classList.add('hidden');
  });
}());

let yukiAnimId = null;

function startYukiAnimation() {
  const canvas = document.getElementById('yuki-canvas');
  if (!canvas) return;

  let yukiFrame = 0;
  let yukiX = 0;
  const direction = 1;

  if (yukiAnimId) cancelAnimationFrame(yukiAnimId);

  function loop(ts) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Background
    ctx.fillStyle = '#050510';
    ctx.fillRect(0, 0, W, H);
    // Ground
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, H - 30, W, 30);
    // Grass
    ctx.fillStyle = '#0a2200';
    for (let gx = 0; gx < W; gx += 8) {
      ctx.fillRect(gx, H - 30, 4, 2);
    }

    // Yuki walking
    yukiX = (yukiX + 1.2) % (W + 80);
    yukiFrame = Math.floor(ts / 200) % 2;

    ctx.save();
    if (yukiX > W / 2) ctx.scale(-1, 1); // flip direction after halfway
    const drawX = yukiX > W / 2 ? -(yukiX - W) : yukiX;
    drawYukiSprite(ctx, drawX + 10, H - 50, 5, yukiFrame);
    ctx.restore();

    // Bark effect
    if (Math.floor(ts / 1500) % 3 === 0) {
      const bx = clamp(yukiX, 20, W - 40);
      ctx.fillStyle = 'rgba(255,255,200,0.7)';
      ctx.font = '6px "Press Start 2P", monospace';
      ctx.fillText('ワン!', bx, H - 65);
    }

    yukiAnimId = requestAnimationFrame(loop);
  }
  yukiAnimId = requestAnimationFrame(loop);
}

// ===================================================
//  RSVP
// ===================================================
function showMaybe() {
  const msg = document.getElementById('rsvp-maybe-msg');
  if (msg) {
    msg.classList.toggle('hidden');
  }
}

// ===================================================
//  INIT
// ===================================================
document.addEventListener('DOMContentLoaded', () => {
  startOpeningAnimation();
});
