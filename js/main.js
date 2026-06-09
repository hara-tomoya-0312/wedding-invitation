/* ===================================================
   PIXEL MIYAJIMA WEDDING - Main Script
   =================================================== */

'use strict';

/* =============================================
   UTILITY
   ============================================= */
const $ = id => document.getElementById(id);

function calcAge(birthYear, birthMonth, birthDay) {
  const today = new Date();
  let age = today.getFullYear() - birthYear;
  const m = today.getMonth() + 1;
  if (m < birthMonth || (m === birthMonth && today.getDate() < birthDay)) age--;
  return age;
}

function lerp(a, b, t) { return a + (b - a) * t; }

/* =============================================
   OPENING: STARS
   ============================================= */
function initOpeningStars() {
  const canvas = $('opening-stars');
  const ctx = canvas.getContext('2d');
  const stars = [];

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  for (let i = 0; i < 160; i++) {
    stars.push({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.5 + 0.3,
      speed: Math.random() * 0.3 + 0.1,
      phase: Math.random() * Math.PI * 2,
    });
  }

  let t = 0;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0d0a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    t += 0.015;
    stars.forEach(s => {
      const blink = 0.4 + 0.6 * Math.abs(Math.sin(t * s.speed + s.phase));
      ctx.globalAlpha = blink;
      ctx.fillStyle = '#f0ede8';
      ctx.beginPath();
      ctx.arc(s.x * canvas.width, s.y * canvas.height, s.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  return { draw };
}

/* =============================================
   OPENING: SPARKLES
   ============================================= */
function initSparkles(containerId) {
  const container = $(containerId);
  const sparks = [];
  const colors = ['#f5c842','#4af5e8','#ff88aa','#ffffff'];

  function spawn() {
    const el = document.createElement('div');
    el.className = 'sparkle';
    const x = 10 + Math.random() * 80;
    const y = 10 + Math.random() * 80;
    el.style.left = x + '%';
    el.style.top  = y + '%';
    el.style.background = colors[Math.floor(Math.random() * colors.length)];
    el.style.animationDuration = (1.2 + Math.random() * 1.5) + 's';
    el.style.animationDelay   = (Math.random() * 0.8) + 's';
    el.style.width = (4 + Math.random() * 6) + 'px';
    el.style.height = el.style.width;
    container.appendChild(el);
    sparks.push(el);
    setTimeout(() => {
      el.remove();
      sparks.splice(sparks.indexOf(el), 1);
    }, 3000);
  }

  const interval = setInterval(() => {
    if (sparks.length < 20) spawn();
  }, 200);

  return { stop: () => clearInterval(interval) };
}

/* =============================================
   OPENING: TYPEWRITER
   ============================================= */
function typewriter(text, el, speed, onDone) {
  let i = 0;
  el.textContent = '';
  function step() {
    if (i < text.length) {
      el.textContent += text[i++];
      setTimeout(step, speed);
    } else {
      if (onDone) onDone();
    }
  }
  setTimeout(step, 400);
}

/* =============================================
   WORLD CANVAS: hero background
   宮島風景（空・山・海・雲・鹿・鳥・鳥居シルエット）
   ============================================= */
class WorldCanvas {
  constructor(canvasId) {
    this.canvas = $(canvasId);
    this.ctx    = this.canvas.getContext('2d');
    this.t      = 0;
    this.clouds = this.makeClouds();
    this.deer   = this.makeDeer();
    this.birds  = this.makeBirds();
    this.scrollY = 0;
    this.resize();
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('scroll', () => {
      this.scrollY = window.scrollY;
    });
  }

  resize() {
    this.W = this.canvas.offsetWidth || window.innerWidth;
    this.H = this.canvas.offsetHeight || window.innerHeight;
    this.canvas.width  = this.W;
    this.canvas.height = this.H;
  }

  makeClouds() {
    return Array.from({ length: 6 }, (_, i) => ({
      x: Math.random() * 1.5,
      y: 0.08 + Math.random() * 0.18,
      w: 0.12 + Math.random() * 0.18,
      speed: 0.00008 + Math.random() * 0.00006,
      alpha: 0.5 + Math.random() * 0.4,
    }));
  }

  makeDeer() {
    return [
      { x: 0.68, phase: 0 },
      { x: 0.76, phase: 1.2 },
    ];
  }

  makeBirds() {
    return Array.from({ length: 4 }, (_, i) => ({
      x: Math.random(),
      y: 0.25 + Math.random() * 0.15,
      speed: 0.0004 + Math.random() * 0.0003,
      phase: Math.random() * Math.PI * 2,
    }));
  }

  /* ----- sky gradient ----- */
  drawSky() {
    const { ctx, W, H } = this;
    const hour = (this.t * 0.01) % (Math.PI * 2);
    const sunPos = 0.5 + 0.4 * Math.sin(hour);
    const grad = ctx.createLinearGradient(0, 0, 0, H * 0.62);
    grad.addColorStop(0,   '#1a0a2e');
    grad.addColorStop(0.3, '#2a1a5e');
    grad.addColorStop(0.6, '#c06030');
    grad.addColorStop(1,   '#e08050');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H * 0.62);

    // sun
    const sx = W * 0.5;
    const sy = H * 0.18;
    const sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, W * 0.18);
    sg.addColorStop(0,   'rgba(255,220,100,0.6)');
    sg.addColorStop(0.5, 'rgba(255,160,60,0.2)');
    sg.addColorStop(1,   'transparent');
    ctx.fillStyle = sg;
    ctx.fillRect(0, 0, W, H * 0.62);
  }

  /* ----- mountains ----- */
  drawMountains() {
    const { ctx, W, H } = this;
    const layers = [
      { pts: [0,0.7, 0.1,0.48, 0.25,0.52, 0.38,0.42, 0.5,0.55, 0.65,0.40, 0.8,0.50, 1,0.45, 1,0.7], col: '#1a0d30' },
      { pts: [0,0.7, 0.05,0.55, 0.2,0.58, 0.35,0.52, 0.5,0.60, 0.7,0.50, 0.85,0.56, 1,0.52, 1,0.7], col: '#2a1540' },
      { pts: [0,0.7, 0.1,0.60, 0.3,0.62, 0.55,0.58, 0.75,0.63, 0.9,0.60, 1,0.62, 1,0.7], col: '#3a2050' },
    ];
    layers.forEach(({ pts, col }) => {
      ctx.beginPath();
      ctx.moveTo(pts[0] * W, pts[1] * H);
      for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i] * W, pts[i+1] * H);
      ctx.closePath();
      ctx.fillStyle = col;
      ctx.fill();
    });
  }

  /* ----- sea ----- */
  drawSea() {
    const { ctx, W, H, t } = this;
    const seaTop = H * 0.62;
    const grad = ctx.createLinearGradient(0, seaTop, 0, H);
    grad.addColorStop(0, '#1a3a6a');
    grad.addColorStop(1, '#0d1a3a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, seaTop, W, H - seaTop);

    // wave lines
    for (let wi = 0; wi < 7; wi++) {
      const y = seaTop + (H - seaTop) * (0.1 + wi * 0.13);
      const amp   = 2 + wi * 0.5;
      const freq  = 0.008 + wi * 0.001;
      const speed = t * (0.02 + wi * 0.005);
      ctx.beginPath();
      for (let x = 0; x <= W; x += 3) {
        const wy = y + amp * Math.sin(x * freq + speed);
        x === 0 ? ctx.moveTo(x, wy) : ctx.lineTo(x, wy);
      }
      ctx.strokeStyle = `rgba(100,180,240,${0.08 + wi * 0.03})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  /* ----- clouds ----- */
  drawClouds() {
    const { ctx, W, H, t } = this;
    this.clouds.forEach(c => {
      c.x = (c.x + c.speed) % 1.3;
      const cx = c.x * W;
      const cy = c.y * H;
      const cw = c.w * W;
      ctx.globalAlpha = c.alpha * 0.7;
      ctx.fillStyle = '#a080c0';
      // pixel-style cloud (squares)
      const sz = Math.max(8, cw / 6);
      const bumps = [
        { ox: 0,      oy: 0,      r: 1.0 },
        { ox: cw*0.3, oy: -sz*0.6, r: 0.8 },
        { ox: cw*0.6, oy: 0,      r: 0.9 },
      ];
      bumps.forEach(b => {
        const bx = cx + b.ox;
        const by = cy + b.oy;
        const br = sz * b.r;
        for (let px = -br; px <= br; px += 4) {
          for (let py = -br; py <= br; py += 4) {
            if (px*px + py*py <= br*br) {
              ctx.fillRect(Math.round(bx+px), Math.round(by+py), 4, 4);
            }
          }
        }
      });
      ctx.globalAlpha = 1;
    });
  }

  /* ----- torii silhouette (small, in hero) ----- */
  drawToriiSmall() {
    const { ctx, W, H } = this;
    const tx = W * 0.5;
    const ty = H * 0.58;
    const th = H * 0.22;
    const tw = th * 1.1;
    drawToriiShape(ctx, tx, ty, tw, th, '#aa1100', true);
  }

  /* ----- deer ----- */
  drawDeer() {
    const { ctx, W, H, t } = this;
    const groundY = H * 0.67;
    this.deer.forEach(d => {
      const x = d.x * W;
      const legOff = Math.sin(t * 0.04 + d.phase) * 2;
      drawDeerSprite(ctx, x, groundY, legOff);
    });
  }

  /* ----- birds ----- */
  drawBirds() {
    const { ctx, W, H, t } = this;
    this.birds.forEach(b => {
      b.x = (b.x + b.speed) % 1.1;
      const x = b.x * W;
      const y = b.y * H + Math.sin(t * 0.05 + b.phase) * 4;
      const flap = Math.sin(t * 0.2 + b.phase) * 3;
      ctx.strokeStyle = '#ccaabb';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x - 6, y + flap);
      ctx.lineTo(x,     y);
      ctx.lineTo(x + 6, y + flap);
      ctx.stroke();
    });
  }

  draw() {
    this.t++;
    this.resize();
    const { ctx, W, H } = this;
    ctx.clearRect(0, 0, W, H);
    this.drawSky();
    this.drawClouds();
    this.drawMountains();
    this.drawToriiSmall();
    this.drawSea();
    this.drawDeer();
    this.drawBirds();
  }
}

/* =============================================
   TORII CANVAS: big standalone torii gate
   ============================================= */
class ToriiCanvas {
  constructor(canvasId) {
    this.canvas = $(canvasId);
    this.ctx    = this.canvas.getContext('2d');
    this.t      = 0;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.W = this.canvas.offsetWidth  || 800;
    this.H = this.canvas.offsetHeight || 600;
    this.canvas.width  = this.W;
    this.canvas.height = this.H;
  }

  drawBackground() {
    const { ctx, W, H } = this;
    // dusk sky
    const sg = ctx.createLinearGradient(0, 0, 0, H);
    sg.addColorStop(0, '#0d0828');
    sg.addColorStop(0.45, '#3a1050');
    sg.addColorStop(0.65, '#aa3020');
    sg.addColorStop(1,    '#1a3060');
    ctx.fillStyle = sg;
    ctx.fillRect(0, 0, W, H);

    // reflection glow
    const rx = W * 0.5, ry = H * 0.58;
    const rg = ctx.createRadialGradient(rx, ry, 0, rx, ry, W * 0.35);
    rg.addColorStop(0, 'rgba(200,80,30,0.35)');
    rg.addColorStop(1, 'transparent');
    ctx.fillStyle = rg;
    ctx.fillRect(0, 0, W, H);
  }

  drawWater() {
    const { ctx, W, H, t } = this;
    const waterY = H * 0.58;
    const wg = ctx.createLinearGradient(0, waterY, 0, H);
    wg.addColorStop(0, '#0a1840');
    wg.addColorStop(1, '#050d20');
    ctx.fillStyle = wg;
    ctx.fillRect(0, waterY, W, H - waterY);

    // wave animation
    for (let i = 0; i < 8; i++) {
      const wy = waterY + (H - waterY) * (i * 0.12);
      const amp = 1.5 + i * 0.3;
      ctx.beginPath();
      for (let x = 0; x <= W; x += 4) {
        const y = wy + amp * Math.sin(x * 0.012 + t * 0.025 + i * 0.5);
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `rgba(80,140,220,${0.06 + i * 0.025})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  drawStars() {
    const { ctx, W, H, t } = this;
    const positions = [
      [0.1,0.05], [0.2,0.12], [0.35,0.06], [0.55,0.03],
      [0.7,0.09], [0.82,0.14], [0.9,0.05], [0.15,0.18],
      [0.45,0.15], [0.65,0.18], [0.05,0.22], [0.92,0.2],
    ];
    positions.forEach(([px, py], i) => {
      const blink = 0.4 + 0.6 * Math.abs(Math.sin(t * 0.03 + i * 1.1));
      ctx.globalAlpha = blink;
      ctx.fillStyle = '#f0e8d0';
      const sz = (i % 3 === 0) ? 2 : 1;
      ctx.fillRect(Math.round(px * W), Math.round(py * H), sz, sz);
    });
    ctx.globalAlpha = 1;
  }

  drawTorii() {
    const { ctx, W, H } = this;
    const cx  = W * 0.5;
    const bot = H * 0.56;
    const th  = H * 0.52;
    const tw  = W * 0.6;
    drawToriiShapeDetailed(ctx, cx, bot, tw, th);
  }

  drawToriiReflection() {
    const { ctx, W, H, t } = this;
    ctx.save();
    const refY = H * 0.585;
    ctx.translate(0, refY * 2);
    ctx.scale(1, -1);

    ctx.globalAlpha = 0.35;
    const cx  = W * 0.5;
    const bot = H * 0.56;
    const th  = H * 0.52;
    const tw  = W * 0.6;
    drawToriiShapeDetailed(ctx, cx, bot, tw, th);
    ctx.restore();
    ctx.globalAlpha = 1;

    // shimmer over reflection
    for (let i = 0; i < 5; i++) {
      const wy = refY + (H - refY) * (i * 0.18);
      ctx.fillStyle = 'rgba(10,24,64,0.15)';
      const ww = 6 + Math.sin(t * 0.04 + i) * 4;
      ctx.fillRect(0, wy - ww*0.5, W, ww);
    }
  }

  drawMountains() {
    const { ctx, W, H } = this;
    const horizY = H * 0.58;
    const pts = [0,1, 0.08,0.72, 0.2,0.78, 0.32,0.70, 0.45,0.76, 0.58,0.68, 0.72,0.74, 0.86,0.69, 1,0.73, 1,1];
    ctx.beginPath();
    ctx.moveTo(0, horizY);
    pts.forEach((_,i) => {
      if (i % 2 === 0) {
        ctx.lineTo(pts[i] * W, horizY - (1 - pts[i+1]) * (horizY * 0.4));
      }
    });
    ctx.lineTo(W, horizY);
    ctx.closePath();
    ctx.fillStyle = '#1a0d2a';
    ctx.fill();
  }

  draw() {
    this.t++;
    this.resize();
    this.drawBackground();
    this.drawStars();
    this.drawMountains();
    this.drawWater();
    this.drawTorii();
    this.drawToriiReflection();
  }
}

/* =============================================
   TORII SHAPE HELPERS
   ============================================= */
function drawToriiShape(ctx, cx, bottom, w, h, col, small) {
  const pillarW = w * 0.06;
  const top     = bottom - h;
  const kasagi  = top;
  const nuki    = top + h * 0.28;
  const kasagiH = h * 0.07;
  const kasagiW = w * 1.05;

  ctx.fillStyle = col;

  // 笠木 (top beam, slight curve)
  ctx.beginPath();
  ctx.moveTo(cx - kasagiW/2, kasagi + kasagiH * 0.5);
  ctx.quadraticCurveTo(cx, kasagi - kasagiH * 0.3, cx + kasagiW/2, kasagi + kasagiH * 0.5);
  ctx.lineTo(cx + kasagiW/2, kasagi + kasagiH);
  ctx.lineTo(cx - kasagiW/2, kasagi + kasagiH);
  ctx.closePath();
  ctx.fill();

  // 島木 (2nd beam)
  const shimagi = top + h * 0.15;
  ctx.fillRect(cx - w/2 * 0.98, shimagi, w * 0.98, kasagiH * 0.7);

  // 貫 (crossbar)
  ctx.fillRect(cx - w/2 * 0.92, nuki, w * 0.92, kasagiH * 0.5);

  // 柱 (left pillar)
  ctx.fillRect(cx - w/2 + pillarW, nuki, pillarW, bottom - nuki);
  // 柱 (right pillar)
  ctx.fillRect(cx + w/2 - pillarW * 2, nuki, pillarW, bottom - nuki);

  // 柱 down to bottom (thicker below nuki)
  ctx.fillRect(cx - w/2 + pillarW * 0.8, top + h * 0.25, pillarW * 1.2, nuki - top - h * 0.25);
  ctx.fillRect(cx + w/2 - pillarW * 2.2, top + h * 0.25, pillarW * 1.2, nuki - top - h * 0.25);
}

function drawToriiShapeDetailed(ctx, cx, bottom, w, h) {
  const top      = bottom - h;
  const kasagiH  = h * 0.055;
  const shimagiH = kasagiH * 0.8;
  const nukiH    = kasagiH * 0.55;
  const pillarW  = w * 0.055;
  const kasagiW  = w * 1.08;
  const shimagiW = w * 1.0;
  const nukiW    = w * 0.92;

  const kasagiY  = top;
  const shimagiY = top + h * 0.12;
  const nukiY    = top + h * 0.28;
  const pillarTop = top + h * 0.14;

  // shadow
  ctx.globalAlpha = 0.4;
  ctx.fillStyle = '#550000';
  drawToriiBeam(ctx, cx, kasagiY + 4, kasagiW + 4, kasagiH + 4);
  ctx.globalAlpha = 1;

  // highlight (orange-red gradient)
  const grad = ctx.createLinearGradient(0, top, 0, bottom);
  grad.addColorStop(0,   '#ff4422');
  grad.addColorStop(0.3, '#cc2200');
  grad.addColorStop(0.7, '#aa1800');
  grad.addColorStop(1,   '#881200');

  ctx.fillStyle = grad;

  // 笠木 (curved top beam)
  ctx.beginPath();
  ctx.moveTo(cx - kasagiW/2, kasagiY + kasagiH * 0.8);
  ctx.quadraticCurveTo(cx, kasagiY - kasagiH * 0.5, cx + kasagiW/2, kasagiY + kasagiH * 0.8);
  ctx.lineTo(cx + kasagiW/2 + kasagiH * 0.3, kasagiY + kasagiH * 1.3);
  ctx.lineTo(cx - kasagiW/2 - kasagiH * 0.3, kasagiY + kasagiH * 1.3);
  ctx.closePath();
  ctx.fill();

  // pixel detail line on kasagi
  ctx.fillStyle = '#ff6644';
  ctx.fillRect(cx - kasagiW/2 * 0.9, kasagiY + kasagiH * 0.2, kasagiW * 0.9, 2);

  ctx.fillStyle = grad;
  // 島木
  ctx.fillRect(cx - shimagiW/2, shimagiY, shimagiW, shimagiH);
  // 貫
  ctx.fillRect(cx - nukiW/2, nukiY, nukiW, nukiH);

  // 左柱
  ctx.fillRect(cx - w/2 + pillarW*0.2, pillarTop, pillarW, bottom - pillarTop);
  // 右柱
  ctx.fillRect(cx + w/2 - pillarW*1.2, pillarTop, pillarW, bottom - pillarTop);

  // 柱の亀腹 (base flare)
  const baseW = pillarW * 1.6;
  const baseH = h * 0.06;
  ctx.fillRect(cx - w/2 + pillarW*0.2 - baseW*0.1, bottom - baseH, pillarW + baseW*0.2, baseH);
  ctx.fillRect(cx + w/2 - pillarW*1.2 - baseW*0.1, bottom - baseH, pillarW + baseW*0.2, baseH);

  // highlight stripe on pillars
  ctx.fillStyle = 'rgba(255,120,80,0.4)';
  ctx.fillRect(cx - w/2 + pillarW*0.2 + 2, pillarTop + 10, 3, bottom - pillarTop - 20);
  ctx.fillRect(cx + w/2 - pillarW*1.2 + 2, pillarTop + 10, 3, bottom - pillarTop - 20);
}

function drawToriiBeam(ctx, cx, y, w, h) {
  ctx.fillRect(cx - w/2, y, w, h);
}

/* =============================================
   DEER SPRITE
   ============================================= */
function drawDeerSprite(ctx, x, groundY, legOff) {
  const s = 3; // pixel scale
  // simple pixel deer silhouette
  const pixels = [
    // [col, row] — body
    [1,0],[2,0], // antlers
    [0,1],       // antler left
    [3,1],       // antler right
    [1,2],[2,2], // head
    [1,3],[2,3],[3,3], // neck + body
    [1,4],[2,4],[3,4],[4,4],
    [1,5],[2,5],[3,5],[4,5],
    [1,6],[4,6], // legs
    [1,7],[4,7],
  ];

  ctx.fillStyle = '#4a3020';
  pixels.forEach(([col, row]) => {
    const px = x + (col - 2) * s;
    const py = groundY - (8 - row) * s + legOff * (row > 5 ? 1 : 0);
    ctx.fillRect(Math.round(px), Math.round(py), s, s);
  });
}

/* =============================================
   CHARACTER SPRITES
   新郎（和装男性）・新婦（和装女性）
   ============================================= */
function drawGroomSprite(canvas) {
  const ctx = canvas.getContext('2d');
  const S   = 4; // pixel scale
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const W = canvas.width;
  const ow = Math.floor(W / S / 2); // offset to center

  function px(col, row, color, w = 1, h = 1) {
    ctx.fillStyle = color;
    ctx.fillRect((col + ow) * S, row * S, w * S, h * S);
  }

  // 頭
  px(0,0,'#f5c8a0',2,2);  // face
  px(-1,0,'#1a1a1a',1,3); // hair left
  px(2,0,'#1a1a1a',1,3);  // hair right
  px(0,-1,'#1a1a1a',2,1); // hair top

  // 目・眉
  px(0,1,'#2a1a0a',1,1);
  px(1,1,'#2a1a0a',1,1);
  px(0,0,'#1a1a1a',1,1); // eyebrow
  px(1,0,'#1a1a1a',1,1);

  // 首
  px(0,2,'#f0b890',2,1);

  // 紋付羽織（黒）
  px(-1,3,'#1a1a2a',4,5);
  // 白い下着
  px(0,3,'#f0ede8',2,1);
  // 紋（家紋風）
  px(0,4,'#f0ede8',1,1);
  px(1,4,'#f0ede8',1,1);

  // 袴（黒）
  px(-1,8,'#1a1a2a',4,3);

  // 足
  px(-1,11,'#f0b890',1,2);
  px(2,11,'#f0b890',1,2);

  // 草履
  px(-1,13,'#3a2a1a',1,1);
  px(2,13,'#3a2a1a',1,1);

  // 腕
  px(-2,3,'#f5c8a0',1,4);
  px(3,3,'#f5c8a0',1,4);

  // 扇子（右手）
  px(4,5,'#f5c842',1,3);
  px(5,4,'#f5c842',1,1);
}

function drawBrideSprite(canvas) {
  const ctx = canvas.getContext('2d');
  const S   = 4;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const W = canvas.width;
  const ow = Math.floor(W / S / 2);

  function px(col, row, color, w = 1, h = 1) {
    ctx.fillStyle = color;
    ctx.fillRect((col + ow) * S, row * S, w * S, h * S);
  }

  // 綿帽子（白）
  px(-2,-1,'#f0ede8',6,1);
  px(-2,0,'#f0ede8',6,2);
  // 顔
  px(0,2,'#f5c8a0',2,2);
  // 目
  px(0,3,'#2a1a0a',1,1);
  px(1,3,'#2a1a0a',1,1);
  // 唇
  px(0,4,'#e87880',1,1);

  // 首
  px(0,4,'#f0b890',2,1);

  // 白無垢（白）
  px(-2,5,'#f0ede8',6,7);
  // 打掛の模様
  px(-1,6,'#f5b8c0',1,1);
  px(2,7,'#f5b8c0',1,1);
  px(-1,9,'#f5b8c0',1,1);
  px(2,9,'#f5b8c0',1,1);

  // 帯
  px(-1,8,'#f5c842',4,1);

  // 足（白足袋）
  px(-1,12,'#f0ede8',2,2);
  px(1,12,'#f0ede8',2,2);

  // 草履
  px(-1,14,'#c8a070',2,1);
  px(1,14,'#c8a070',2,1);

  // 腕
  px(-3,5,'#f0ede8',1,5);
  px(4,5,'#f0ede8',1,5);
}

/* =============================================
   YUKI (柴犬) SPRITE
   ============================================= */
function drawYukiSprite(canvas, frame) {
  const ctx = canvas.getContext('2d');
  const S   = 5;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const ow = 4; // x offset

  function px(col, row, color, w = 1, h = 1) {
    ctx.fillStyle = color;
    ctx.fillRect((col + ow) * S, row * S, w * S, h * S);
  }

  const white  = '#f0ede8';
  const cream  = '#e8d8b0';
  const nose   = '#2a1a1a';
  const collar = '#80c040'; // 黄緑の首輪
  const eye    = '#2a1a1a';

  // 体
  px(1,4,white,5,4);
  // 頭
  px(1,1,white,5,4);
  // 耳（三角）
  px(1,0,cream,2,2);
  px(4,0,cream,2,2);

  // 目
  px(2,2,eye,1,1);
  px(5,2,eye,1,1);

  // 鼻
  px(3,3,nose,2,1);

  // 首輪
  px(1,5,collar,5,1);
  px(3,5,'#60a020',1,1); // collar tag

  // 尻尾（フレームでアニメ）
  const tailOff = frame % 2 === 0 ? 0 : 1;
  px(6,4,white,2,1);
  px(7,3 - tailOff,white,2,2);

  // 足
  const legOff = frame % 4 < 2 ? 0 : 1;
  px(1,8,white,2,2);
  px(4,8,white,2,2);
  px(1,10 - legOff,cream,1,1);
  px(4,10 + legOff,cream,1,1);
}

/* =============================================
   MESSAGE TYPEWRITER
   ============================================= */
const MAIN_MESSAGE = `Tomoya と Sayaka は
長い冒険の旅を経て

ついに結婚という
新たなステージへ進みます。

ぜひ皆さまに
見届けていただけると幸いです。`;

function initMessageAnimation() {
  const section  = $('message');
  const textEl   = $('message-text');
  const cursorEl = $('msg-cursor');
  let started = false;

  function startTyping() {
    if (started) return;
    started = true;
    cursorEl.style.display = 'inline';
    let i = 0;
    function step() {
      if (i < MAIN_MESSAGE.length) {
        textEl.textContent += MAIN_MESSAGE[i++];
        setTimeout(step, 50);
      } else {
        setTimeout(() => { cursorEl.style.display = 'none'; }, 1500);
      }
    }
    setTimeout(step, 400);
  }

  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      startTyping();
      observer.disconnect();
    }
  }, { threshold: 0.4 });

  observer.observe(section);
}

/* =============================================
   COUNTDOWN
   ============================================= */
function initCountdown() {
  const target = new Date('2026-11-02T14:00:00+09:00');

  function update() {
    const now  = new Date();
    const diff = target - now;
    if (diff <= 0) {
      $('cd-days').textContent  = '0';
      $('cd-hours').textContent = '00';
      $('cd-mins').textContent  = '00';
      $('cd-secs').textContent  = '00';
      return;
    }
    const days  = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins  = Math.floor((diff % 3600000)  / 60000);
    const secs  = Math.floor((diff % 60000)    / 1000);
    $('cd-days').textContent  = days;
    $('cd-hours').textContent = String(hours).padStart(2,'0');
    $('cd-mins').textContent  = String(mins).padStart(2,'0');
    $('cd-secs').textContent  = String(secs).padStart(2,'0');
  }

  update();
  setInterval(update, 1000);
}

/* =============================================
   LEVELS (RPG風年齢)
   ============================================= */
function updateLevels() {
  $('groom-level').textContent = calcAge(2000, 3, 12);
  $('bride-level').textContent  = calcAge(1998, 9, 19);
}

/* =============================================
   SCROLL ANIMATIONS
   ============================================= */
function initScrollAnimations() {
  const els = document.querySelectorAll('.slide-in-left, .slide-in-right, .fade-in-card');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  els.forEach(el => obs.observe(el));
}

/* =============================================
   EASTER EGG: YUKI
   ============================================= */
function initEasterEgg() {
  const zone      = $('easter-egg-zone');
  const container = $('yuki-container');
  const canvas    = $('yuki-canvas');
  const bubble    = $('yuki-bubble');

  let visible  = false;
  let frame    = 0;
  let animId   = null;
  let tapCount = 0;
  let lastTap  = 0;

  function showYuki() {
    if (visible) return;
    visible = true;
    container.classList.remove('yuki-hidden');
    container.classList.add('yuki-visible');
    bubble.style.display = 'block';

    frame = 0;
    function animYuki() {
      drawYukiSprite(canvas, frame++);
      animId = requestAnimationFrame(animYuki);
    }
    animYuki();

    setTimeout(() => {
      bubble.style.display = 'none';
    }, 1200);

    setTimeout(() => {
      container.classList.remove('yuki-visible');
      container.classList.add('yuki-hidden');
      visible = false;
      if (animId) cancelAnimationFrame(animId);
    }, 5000);
  }

  // クリックゾーン（左下）
  zone.addEventListener('click', () => {
    const now = Date.now();
    if (now - lastTap < 800) tapCount++;
    else tapCount = 1;
    lastTap = now;
    if (tapCount >= 3) {
      tapCount = 0;
      showYuki();
    }
  });

  // 初期描画
  drawYukiSprite(canvas, 0);
}

/* =============================================
   OPENING FLOW
   ============================================= */
function initOpening() {
  const openingEl = $('opening-screen');
  const mainEl    = $('main-content');
  const textEl    = $('opening-text');
  const cursorEl  = $('opening-cursor');
  const btnEl     = $('open-btn');

  // アニメーションループ
  const stars    = initOpeningStars();
  const sparkles = initSparkles('sparkles');
  let animId;

  function loop() {
    stars.draw();
    animId = requestAnimationFrame(loop);
  }
  loop();

  // タイプライター
  const MSG = 'あなたに招待状が届きました！';
  typewriter(MSG, textEl, 80, () => {
    cursorEl.style.display = 'none';
    btnEl.style.display    = 'inline-block';
  });

  // ボタン押下
  btnEl.addEventListener('click', () => {
    sparkles.stop();
    openingEl.classList.add('fade-out');
    setTimeout(() => {
      openingEl.style.display = 'none';
      cancelAnimationFrame(animId);
      mainEl.style.display = 'block';
      initMainContent();
    }, 800);
  });
}

/* =============================================
   MAIN CONTENT INIT
   ============================================= */
function initMainContent() {
  // キャラクタースプライト
  drawGroomSprite($('groom-sprite'));
  drawBrideSprite($('bride-sprite'));

  // RPGレベル
  updateLevels();

  // ワールドキャンバス（hero）
  const world = new WorldCanvas('world-canvas');
  function worldLoop() {
    world.draw();
    requestAnimationFrame(worldLoop);
  }
  worldLoop();

  // 鳥居キャンバス
  const torii = new ToriiCanvas('torii-canvas');
  let toriiVisible = false;

  const toriiObs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !toriiVisible) {
      toriiVisible = true;
      function toriiLoop() {
        if (toriiVisible) {
          torii.draw();
          requestAnimationFrame(toriiLoop);
        }
      }
      toriiLoop();
    }
  }, { threshold: 0.1 });
  toriiObs.observe($('torii-section'));

  // メッセージ
  initMessageAnimation();

  // カウントダウン
  initCountdown();

  // スクロールアニメ
  initScrollAnimations();

  // イースターエッグ
  initEasterEgg();

  // バーアニメ（スクロール時に発火）
  const barObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.querySelectorAll('.rpg-bar-fill').forEach(bar => {
          bar.style.animation = 'none';
          bar.offsetHeight; // reflow
          bar.style.animation = '';
        });
        barObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('.profile-card').forEach(c => barObs.observe(c));
}

/* =============================================
   ENTRY
   ============================================= */
document.addEventListener('DOMContentLoaded', initOpening);
