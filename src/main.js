// src/main.js
// Bootstrap: wire up the canvas, game loop, input, HUD, effects, and overlays.

import { Game, GameStatus } from './game/state.js';
import { computeLayout } from './render/layout.js';
import { drawBoard, drawHand, drawDraggingPiece, drawEffects } from './render/renderer.js';
import { createInput } from './input.js';
import { loadHighScore, saveHighScore } from './storage.js';

// --- DOM ---------------------------------------------------------------------
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best');
const comboWrap = document.getElementById('combo-wrap');
const comboEl = document.getElementById('combo');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlayMsg = document.getElementById('overlay-msg');
const restartBtn = document.getElementById('restart');

// --- State -------------------------------------------------------------------
let cssW = 1;
let cssH = 1;
let layout = null;
let highScore = loadHighScore();
const game = new Game();
const effects = [];

const input = createInput({
  canvas,
  getLayout: () => layout,
  getGame: () => game,
  onPlace: handlePlace,
});

// --- Sizing ------------------------------------------------------------------
function resize() {
  const rect = canvas.getBoundingClientRect();
  if (rect.width < 1 || rect.height < 1) return;
  const dpr = window.devicePixelRatio || 1;
  cssW = rect.width;
  cssH = rect.height;
  canvas.width = Math.round(cssW * dpr);
  canvas.height = Math.round(cssH * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // draw in CSS pixels
  layout = computeLayout(cssW, cssH);
}

// --- Gameplay callbacks ------------------------------------------------------
function handlePlace(result) {
  spawnEffects(result);
  if (game.score > highScore) {
    highScore = game.score;
    saveHighScore(highScore);
  }
  updateHud();
  if (game.status === GameStatus.GAME_OVER) {
    window.setTimeout(showGameOver, 450);
  }
}

function updateHud() {
  scoreEl.textContent = String(game.score);
  bestEl.textContent = String(Math.max(highScore, game.score));
  if (game.combo > 1) {
    comboWrap.hidden = false;
    comboEl.textContent = `Combo x${game.combo}`;
  } else {
    comboWrap.hidden = true;
  }
}

function showGameOver() {
  overlayTitle.textContent = 'Game Over';
  overlayMsg.textContent = `Score ${game.score}  ·  Best ${Math.max(highScore, game.score)}`;
  overlay.classList.remove('hidden');
}

restartBtn.addEventListener('click', () => {
  game.reset();
  effects.length = 0;
  updateHud();
  overlay.classList.add('hidden');
});

// --- Effects -----------------------------------------------------------------
function spawnEffects(result) {
  if (!layout || result.clearedCells.length === 0) return;
  const b = layout.board;
  const cell = b.cell;

  effects.push({ type: 'flash', t: 0, dur: 0.28, cells: result.clearedCells });

  const parts = [];
  for (const c of result.clearedCells) {
    const px = b.x + (c.x + 0.5) * cell;
    const py = b.y + (c.y + 0.5) * cell;
    for (let i = 0; i < 3; i++) {
      parts.push({
        x: px,
        y: py,
        vx: (Math.random() - 0.5) * 260,
        vy: -Math.random() * 240 - 40,
        size: cell * (0.12 + Math.random() * 0.14),
        color: c.color,
      });
    }
  }
  effects.push({ type: 'burst', t: 0, dur: 0.9, parts });

  effects.push({
    type: 'popup',
    t: 0,
    dur: 0.9,
    x: b.x + b.size / 2,
    y: b.y + b.size / 2,
    text: `+${result.points}`,
    sub: result.combo > 1 ? `Combo x${result.combo}` : '',
  });
}

function updateEffects(dt) {
  for (const e of effects) {
    e.t += dt;
    if (e.type === 'burst') {
      for (const p of e.parts) {
        p.vy += 900 * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
      }
    }
  }
  for (let i = effects.length - 1; i >= 0; i--) {
    if (effects[i].t >= effects[i].dur) effects.splice(i, 1);
  }
}

// --- Render + loop -----------------------------------------------------------
function render() {
  ctx.clearRect(0, 0, cssW, cssH);
  if (!layout) return;
  const d = input.drag;
  const ghost = d ? { shape: d.shape, ox: d.col, oy: d.row, valid: d.valid } : null;
  drawBoard(ctx, game.board, layout, ghost);
  drawEffects(ctx, effects, layout);
  drawHand(ctx, game, layout, d);
  if (d) drawDraggingPiece(ctx, d, layout);
}

let lastTime = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;
  updateEffects(dt);
  render();
  requestAnimationFrame(frame);
}

// --- Init --------------------------------------------------------------------
resize();
updateHud();
if (window.ResizeObserver) new ResizeObserver(resize).observe(canvas);
window.addEventListener('resize', resize);
window.addEventListener('orientationchange', () => window.setTimeout(resize, 100));
requestAnimationFrame(frame);
