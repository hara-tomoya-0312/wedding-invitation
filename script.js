// ============================================================
//  PIXEL MIYAJIMA — Wedding Invitation
//  Main Script
//
//  よく変更する箇所は「★ 設定値」セクションにまとめています。
// ============================================================

// ============================================================
//  ★ 設定値（ここを編集してください）
// ============================================================

/** 出欠回答フォームのURL。後から差し込むだけでボタンが動きます */
const RSVP_URL = "";

/** メッセージセクションのタイピングアニメーション文章 */
const WEDDING_MESSAGE =
  "このたび私たちは結婚式を挙げることとなりました\n\n" +
  "大切な皆さまと\nかけがえのない時間を過ごしたく\n" +
  "心よりご招待申し上げます\n\n" +
  "ぜひご出席いただけますと幸いです";

/** タイピング速度（ミリ秒/文字） */
const TYPING_SPEED = 65;

/** 改行時の追加ウェイト（ミリ秒） */
const TYPING_NEWLINE_PAUSE = 380;

// ============================================================
//  ピクセルアートキャラクタースプライト定義
//
//  色コード配列。各行が横1ライン。
//  null = 透明。14 x 20 ピクセル。JS で Canvas に描画します。
// ============================================================

/**
 * 新郎スプライト（スーツ + ネクタイ）
 * 列 0 から 13、行 0 から 19
 */
const GROOM_SPRITE = [
  //  0    1    2    3    4    5    6    7    8    9   10   11   12   13
  [null,null,'#3c2a1e','#3c2a1e','#3c2a1e','#3c2a1e','#3c2a1e',null,null,null,null,null,null,null], // 0 hair top
  [null,'#3c2a1e','#3c2a1e','#3c2a1e','#3c2a1e','#3c2a1e','#3c2a1e','#3c2a1e',null,null,null,null,null,null], // 1 hair
  [null,'#3c2a1e','#ffd99a','#ffd99a','#ffd99a','#ffd99a','#ffd99a','#3c2a1e',null,null,null,null,null,null], // 2 face top
  [null,'#3c2a1e','#ffd99a','#1a1a1a','#ffd99a','#1a1a1a','#ffd99a','#3c2a1e',null,null,null,null,null,null], // 3 eyes
  [null,'#3c2a1e','#ffd99a','#ffd99a','#ffd99a','#ffd99a','#ffd99a','#3c2a1e',null,null,null,null,null,null], // 4 nose
  [null,null,'#ffd99a','#ffd99a','#b06050','#ffd99a','#ffd99a',null,null,null,null,null,null,null], // 5 mouth
  [null,null,'#f0f0f0','#2c3e50','#2c3e50','#2c3e50','#f0f0f0',null,null,null,null,null,null,null], // 6 collar/lapel
  ['#2c3e50','#2c3e50','#2c3e50','#c62828','#c62828','#2c3e50','#2c3e50','#2c3e50',null,null,null,null,null,null], // 7 suit / tie
  ['#2c3e50','#2c3e50','#2c3e50','#c62828','#c62828','#2c3e50','#2c3e50','#2c3e50',null,null,null,null,null,null], // 8 suit / tie
  ['#ffd99a','#2c3e50','#2c3e50','#c62828','#c62828','#2c3e50','#2c3e50','#ffd99a',null,null,null,null,null,null], // 9 hands/suit
  [null,'#1a252f','#1a252f','#1a252f','#1a252f','#1a252f','#1a252f',null,null,null,null,null,null,null], // 10 pants
  [null,'#1a252f','#1a252f',null,null,'#1a252f','#1a252f',null,null,null,null,null,null,null], // 11 legs
  [null,'#1a252f','#1a252f',null,null,'#1a252f','#1a252f',null,null,null,null,null,null,null], // 12 legs
  [null,'#1a252f','#1a252f',null,null,'#1a252f','#1a252f',null,null,null,null,null,null,null], // 13 legs
  ['#0d1117','#0d1117','#0d1117',null,null,'#0d1117','#0d1117','#0d1117',null,null,null,null,null,null], // 14 shoes
];

/**
 * 新婦スプライト（ウェディングドレス）
 */
const BRIDE_SPRITE = [
  //  0    1    2    3    4    5    6    7    8    9   10   11   12   13
  [null,null,'#8b4513','#8b4513','#8b4513','#8b4513','#8b4513',null,null,null,null,null,null,null], // 0 hair top
  ['#8b4513','#8b4513','#ffd99a','#ffd99a','#ffd99a','#ffd99a','#8b4513','#8b4513',null,null,null,null,null,null], // 1 hair/face
  ['#8b4513','#ffd99a','#ffd99a','#ffd99a','#ffd99a','#ffd99a','#ffd99a','#8b4513',null,null,null,null,null,null], // 2 face
  [null,'#ffd99a','#ffaaaa','#1a1a1a','#ffd99a','#1a1a1a','#ffaaaa','#ffd99a',null,null,null,null,null,null], // 3 eyes + blush
  [null,'#ffd99a','#ffd99a','#ffd99a','#ffd99a','#ffd99a','#ffd99a',null,null,null,null,null,null,null], // 4 nose
  [null,null,'#ffd99a','#ffd99a','#ff6b8a','#ffd99a','#ffd99a',null,null,null,null,null,null,null], // 5 mouth
  [null,null,'#ffffff','#ffffff','#ffffff','#ffffff','#ffffff',null,null,null,null,null,null,null], // 6 dress top
  [null,'#ffffff','#ffffff','#ffffff','#ffffff','#ffffff','#ffffff','#ffffff',null,null,null,null,null,null], // 7 dress
  ['#ffffff','#ffffff','#ffffff','#ffffff','#ffffff','#ffffff','#ffffff','#ffffff',null,null,null,null,null,null], // 8 skirt
  ['#ffffff','#ffffff','#f0e0f0','#ffffff','#ffffff','#f0e0f0','#ffffff','#ffffff',null,null,null,null,null,null], // 9 skirt
  ['#ffffff','#f8e8f8','#ffffff','#f0e0f0','#f0e0f0','#ffffff','#f8e8f8','#ffffff',null,null,null,null,null,null], // 10 skirt wide
  ['#ffffff','#f8e8f8','#ffffff','#ffffff','#ffffff','#ffffff','#f8e8f8','#ffffff',null,null,null,null,null,null], // 11 skirt wide2
  [null,'#ffffff','#ffffff','#ffffff','#ffffff','#ffffff','#ffffff',null,null,null,null,null,null,null], // 12 skirt bottom
  [null,null,'#ffd99a','#ffd99a',null,'#ffd99a','#ffd99a',null,null,null,null,null,null,null], // 13 feet
  [null,null,'#ffd99a','#ffd99a',null,'#ffd99a','#ffd99a',null,null,null,null,null,null,null], // 14 feet
];

/** ピクセルサイズ（px） */
const SPRITE_PIXEL_SIZE = 5;

// ============================================================
//  DOM 参照
// ============================================================
const $ = (id) => document.getElementById(id);
const openingScreen   = $("opening-screen");
const transitionScreen = $("transition-screen");
const mainContent     = $("main-content");
const openButton      = $("open-button");
const loadingFill     = $("loading-fill");
const loadingText     = $("loading-text");
const sparklesEl      = $("sparkles");
const starsCanvas     = $("stars-canvas");
const oceanCanvas     = $("ocean-canvas");

// ============================================================
//  出欠ボタン（グローバル関数として定義。HTML の onclick で呼ばれる）
// ============================================================
function handleRsvpClick(e) {
  if (!RSVP_URL) {
    e.preventDefault();
    showRpgAlert("URLは後日公開予定です...\nしばらくお待ちください ♥");
  } else {
    e.currentTarget.href = RSVP_URL;
  }
}

// RPG スタイルのトースト通知
function showRpgAlert(message) {
  document.querySelectorAll(".rpg-alert").forEach((el) => el.remove());
  const el = document.createElement("div");
  el.className = "rpg-alert";
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => {
    el.style.transition = "opacity 0.5s";
    el.style.opacity = "0";
    setTimeout(() => el.remove(), 550);
  }, 2800);
}

// ============================================================
//  オープニング演出 — キラキラ
// ============================================================
function createSparkles() {
  const symbols = ["★", "✦", "✧", "◆", "✫", "·", "✨"];
  for (let i = 0; i < 24; i++) {
    const s = document.createElement("span");
    s.className = "sparkle";
    s.textContent = symbols[i % symbols.length];
    s.style.left   = `${Math.random() * 100}%`;
    s.style.top    = `${Math.random() * 100}%`;
    s.style.fontSize = `${8 + (i % 3) * 4}px`;
    s.style.setProperty("--dur",   `${2.5 + Math.random() * 3}s`);
    s.style.setProperty("--delay", `${Math.random() * 5}s`);
    sparklesEl.appendChild(s);
  }
}

// ============================================================
//  オープニング → トランジション → メイン
// ============================================================
function startTransition() {
  // オープニング画面フェードアウト
  openingScreen.style.transition = "opacity 0.6s ease";
  openingScreen.style.opacity = "0";

  setTimeout(() => {
    openingScreen.style.display = "none";

    // トランジション画面（RPGロード）を表示
    transitionScreen.style.display = "flex";
    transitionScreen.style.opacity = "0";
    transitionScreen.style.transition = "opacity 0.3s ease";

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        transitionScreen.style.opacity = "1";
        runLoadingBar();
      });
    });
  }, 650);
}

function runLoadingBar() {
  const loadingMessages = [
    "Now Loading...",
    "Summoning memories...",
    "Loading adventure...",
    "Preparing the stage...",
    "Almost there... ★",
  ];
  let msgIdx = 0;
  let progress = 0;

  const interval = setInterval(() => {
    progress += 6 + Math.random() * 10;

    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      loadingFill.style.width = "100%";

      setTimeout(() => {
        transitionScreen.style.transition = "opacity 0.6s ease";
        transitionScreen.style.opacity = "0";
        setTimeout(() => {
          transitionScreen.style.display = "none";
          showMainContent();
        }, 650);
      }, 400);
    } else {
      loadingFill.style.width = `${progress}%`;

      // ロードメッセージを段階的に変更
      const newIdx = Math.floor((progress / 100) * loadingMessages.length);
      if (newIdx !== msgIdx && newIdx < loadingMessages.length) {
        msgIdx = newIdx;
        loadingText.textContent = loadingMessages[msgIdx];
      }
    }
  }, 110);
}

function showMainContent() {
  mainContent.style.display = "block";
  mainContent.style.opacity = "0";
  mainContent.style.transition = "opacity 1.2s ease";

  // メインコンテンツ初期化
  initStars();
  initOcean();
  initParallax();
  initScrollReveal();
  drawSprites();
  drawMapPixelArt();

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      mainContent.style.opacity = "1";
      // ヒーロータイトルを少し遅らせて表示
      setTimeout(() => {
        const box = document.querySelector(".hero-title-box");
        if (box) box.classList.add("visible");
      }, 600);
    });
  });
}

// ============================================================
//  星空 Canvas アニメーション
// ============================================================
function initStars() {
  if (!starsCanvas) return;

  const ctx = starsCanvas.getContext("2d");
  const stars = [];

  function resize() {
    starsCanvas.width  = window.innerWidth;
    starsCanvas.height = Math.floor(window.innerHeight * 0.65);
  }
  resize();
  window.addEventListener("resize", resize);

  for (let i = 0; i < 180; i++) {
    stars.push({
      x:     Math.random(),
      y:     Math.random(),
      size:  Math.random() < 0.75 ? 1 : 2,
      base:  0.3 + Math.random() * 0.7,
      speed: 0.6 + Math.random() * 1.4,
      phase: Math.random() * Math.PI * 2,
    });
  }

  let t = 0;

  (function draw() {
    const W = starsCanvas.width;
    const H = starsCanvas.height;
    ctx.clearRect(0, 0, W, H);
    t += 0.018;

    stars.forEach((s) => {
      const alpha = s.base * (0.5 + 0.5 * Math.sin(t * s.speed + s.phase));
      ctx.fillStyle = `rgba(255, 240, 200, ${alpha})`;

      const px = Math.floor(s.x * W);
      const py = Math.floor(s.y * H);
      ctx.fillRect(px, py, s.size, s.size);

      // 明るい星に十字ハイライト
      if (s.base > 0.75 && alpha > 0.7) {
        ctx.fillStyle = `rgba(255, 240, 200, ${alpha * 0.4})`;
        ctx.fillRect(px - 1, py, 1, 1);
        ctx.fillRect(px + s.size, py, 1, 1);
        ctx.fillRect(px, py - 1, 1, 1);
        ctx.fillRect(px, py + s.size, 1, 1);
      }
    });

    requestAnimationFrame(draw);
  })();
}

// ============================================================
//  海 Canvas アニメーション（ピクセル波）
// ============================================================
function initOcean() {
  if (!oceanCanvas) return;

  const ctx = oceanCanvas.getContext("2d");
  let waveOffset = 0;

  function resize() {
    oceanCanvas.width  = oceanCanvas.offsetWidth;
    oceanCanvas.height = oceanCanvas.offsetHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  const PIXEL = 4; // ピクセルアートのグリッドサイズ

  (function draw() {
    const W = oceanCanvas.width;
    const H = oceanCanvas.height;
    ctx.clearRect(0, 0, W, H);

    // 海の塗りつぶし（グラデーション）
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0,   "#1255a0");
    grad.addColorStop(0.5, "#0d47a1");
    grad.addColorStop(1,   "#0a2a6e");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // 波1（表面波）
    ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
    for (let x = 0; x < W; x += PIXEL) {
      const waveY = Math.floor(Math.sin((x * 0.04) + waveOffset) * 3) * PIXEL;
      ctx.fillRect(x, waveY + PIXEL * 2, PIXEL, PIXEL);
    }

    // 波2（中間波、逆位相）
    ctx.fillStyle = "rgba(255, 255, 255, 0.10)";
    for (let x = 0; x < W; x += PIXEL) {
      const waveY = Math.floor(Math.sin((x * 0.03) - waveOffset * 0.7 + 2) * 2) * PIXEL;
      ctx.fillRect(x, waveY + PIXEL * 5, PIXEL, PIXEL);
    }

    // 波3（遠景波）
    ctx.fillStyle = "rgba(255, 255, 255, 0.07)";
    for (let x = 0; x < W; x += PIXEL * 2) {
      const waveY = Math.floor(Math.sin((x * 0.02) + waveOffset * 0.5 + 5) * 2) * PIXEL;
      ctx.fillRect(x, waveY + PIXEL * 9, PIXEL * 2, PIXEL);
    }

    // 鳥居の水面反射
    const toriiCenterX = Math.floor(W / 2);
    const refWidth  = 180;
    const refHeight = Math.floor(H * 0.6);
    const refGrad = ctx.createLinearGradient(0, 0, 0, refHeight);
    refGrad.addColorStop(0, "rgba(198, 40, 40, 0.35)");
    refGrad.addColorStop(1, "transparent");
    ctx.fillStyle = refGrad;

    // 揺れる反射（sinで横にずらす）
    const shimmer = Math.sin(waveOffset * 0.5) * 4;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(toriiCenterX - refWidth * 0.4 + shimmer, 0);
    ctx.lineTo(toriiCenterX + refWidth * 0.4 - shimmer, 0);
    ctx.lineTo(toriiCenterX + refWidth * 0.55, refHeight);
    ctx.lineTo(toriiCenterX - refWidth * 0.55, refHeight);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    waveOffset += 0.06;
    requestAnimationFrame(draw);
  })();
}

// ============================================================
//  パララックス効果
// ============================================================
function initParallax() {
  const hero      = $("hero");
  const sky       = $("parallax-sky");
  const clouds    = $("clouds-layer");
  const mountains = $("mountains-layer");

  if (!hero) return;

  window.addEventListener("scroll", () => {
    const s = window.pageYOffset;
    const h = hero.offsetHeight;
    if (s >= h) return;

    if (sky)       sky.style.transform       = `translateY(${s * 0.30}px)`;
    if (clouds)    clouds.style.transform    = `translateY(${s * 0.15}px)`;
    if (mountains) mountains.style.transform = `translateY(${s * 0.10}px)`;
  }, { passive: true });
}

// ============================================================
//  スクロール出現 (IntersectionObserver)
// ============================================================
let typingStarted = false;

function initScrollReveal() {
  const revealEls = document.querySelectorAll(".scroll-reveal");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");

        // メッセージウィンドウが見えたらタイピング開始
        if (!typingStarted && entry.target.closest("#message")) {
          typingStarted = true;
          setTimeout(startTyping, 400);
        }

        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.18 }
  );

  revealEls.forEach((el) => observer.observe(el));
}

// ============================================================
//  タイピングアニメーション
// ============================================================
function startTyping() {
  const el     = $("typing-text");
  const cursor = $("msg-cursor");
  if (!el) return;

  let idx = 0;

  function type() {
    if (idx >= WEDDING_MESSAGE.length) {
      if (cursor) cursor.style.display = "block";
      return;
    }

    el.textContent += WEDDING_MESSAGE[idx];
    idx++;

    const ch    = WEDDING_MESSAGE[idx - 1];
    const delay = ch === "\n" ? TYPING_NEWLINE_PAUSE : TYPING_SPEED;
    setTimeout(type, delay);
  }

  type();
}

// ============================================================
//  ピクセルアートキャラクタースプライト描画
// ============================================================
function drawSprite(canvas, spriteData) {
  if (!canvas) return;
  const ctx  = canvas.getContext("2d");
  const rows = spriteData.length;
  const cols = spriteData[0].length;

  canvas.width  = cols * SPRITE_PIXEL_SIZE;
  canvas.height = rows * SPRITE_PIXEL_SIZE;
  // CSS側でさらに 2x 拡大（style.css の .char-canvas を参照）
  canvas.style.width  = `${cols * SPRITE_PIXEL_SIZE * 2}px`;
  canvas.style.height = `${rows * SPRITE_PIXEL_SIZE * 2}px`;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  spriteData.forEach((row, y) => {
    row.forEach((color, x) => {
      if (!color) return;
      ctx.fillStyle = color;
      ctx.fillRect(
        x * SPRITE_PIXEL_SIZE,
        y * SPRITE_PIXEL_SIZE,
        SPRITE_PIXEL_SIZE,
        SPRITE_PIXEL_SIZE
      );
    });
  });

  // キャラクターのアイドルアニメーション（上下にゆらゆら）
  animateSprite(canvas);
}

function animateSprite(canvas) {
  let t      = Math.random() * Math.PI * 2; // 位相をランダムにずらす
  const rate = 0.025 + Math.random() * 0.015;

  (function anim() {
    t += rate;
    canvas.style.transform = `translateY(${Math.sin(t) * 3}px)`;
    requestAnimationFrame(anim);
  })();
}

function drawSprites() {
  drawSprite($("groom-canvas"), GROOM_SPRITE);
  drawSprite($("bride-canvas"), BRIDE_SPRITE);
}

// ============================================================
//  マップ COMING SOON ピクセルアート（世界地図風）
// ============================================================
function drawMapPixelArt() {
  const canvas = $("map-pixel-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const W   = canvas.width;
  const H   = canvas.height;
  const P   = 4; // ピクセルグリッドサイズ

  // 背景（海）
  ctx.fillStyle = "#0a1e3d";
  ctx.fillRect(0, 0, W, H);

  // ランダムシード的な島配置（固定値で毎回同じ形）
  const islands = [
    { x: 30, y: 40, w: 60, h: 30 },
    { x: 120, y: 20, w: 40, h: 50 },
    { x: 200, y: 50, w: 70, h: 40 },
    { x: 40,  y: 120, w: 50, h: 35 },
    { x: 150, y: 130, w: 90, h: 40 },
    { x: 260, y: 100, w: 40, h: 55 },
  ];

  islands.forEach((island) => {
    // 島の色
    ctx.fillStyle = "#1a4020";
    // ピクセルグリッドに揃えて楕円形の近似
    for (let row = 0; row < island.h; row += P) {
      const ratio    = 1 - Math.abs((row / island.h) - 0.5) * 1.8;
      const rowWidth = Math.floor(island.w * ratio / P) * P;
      const offsetX  = (island.w - rowWidth) / 2;
      ctx.fillRect(
        Math.floor((island.x + offsetX) / P) * P,
        Math.floor((island.y + row) / P) * P,
        Math.max(P, Math.floor(rowWidth / P) * P),
        P
      );
    }
  });

  // 宮島（ハイライト）
  ctx.fillStyle = "#c62828";
  ctx.fillRect(160, 55, P, P);
  ctx.fillRect(164, 51, P, P);
  ctx.fillRect(168, 55, P, P);
  // 鳥居アイコン（小）
  ctx.fillStyle = "#ffd700";
  ctx.fillRect(164, 67, P * 3, P);

  // グリッドライン（細い経緯線）
  ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
  ctx.lineWidth   = 1;
  for (let x = 0; x < W; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  for (let y = 0; y < H; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  // 枠
  ctx.strokeStyle = "rgba(255, 215, 0, 0.25)";
  ctx.lineWidth   = 2;
  ctx.strokeRect(1, 1, W - 2, H - 2);

  // "?" マーク（謎の位置）
  ctx.fillStyle = "rgba(255, 215, 0, 0.5)";
  ctx.font      = "bold 14px monospace";
  ctx.fillText("?", 170, 72);
}

// ============================================================
//  初期化
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  // スパークルを生成
  createSparkles();

  // 開封ボタンのクリック
  if (openButton) {
    openButton.addEventListener("click", startTransition);
  }

  // コンソールに遊び心のある表示
  console.log(
    "%c ✦ PIXEL MIYAJIMA ✦ %c Wedding Invitation ",
    "background:#ffd700;color:#060d1f;font-weight:bold;font-size:13px;padding:6px 12px;",
    "background:#c62828;color:#fff;font-weight:bold;font-size:13px;padding:6px 12px;"
  );
  console.log("%c Tomoya & Sayaka — Adventure begins. ♥",
    "color:#ffd700;font-style:italic;font-size:11px;");
});
