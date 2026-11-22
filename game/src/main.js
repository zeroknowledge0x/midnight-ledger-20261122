// Entry point: boots the canvas, reads keyboard and mouse, runs the frame loop.
// In ?shot= mode it paints one deterministic frame and stops, for screenshots.

import { VIEW } from './config.js';
import { createWorld, dropSmoke, poseForShot, start, throwPebble, update } from './world.js';
import { render } from './render.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = VIEW.w;
canvas.height = VIEW.h;

const world = createWorld();
const input = { up: false, down: false, left: false, right: false, sneak: false, grab: false };
const KEYS = {
  ArrowUp: 'up', KeyW: 'up',
  ArrowDown: 'down', KeyS: 'down',
  ArrowLeft: 'left', KeyA: 'left',
  ArrowRight: 'right', KeyD: 'right',
  ShiftLeft: 'sneak', ShiftRight: 'sneak',
};
let mouse = { x: VIEW.w / 2, y: VIEW.h / 2 };

const query = new URLSearchParams(location.search);
const shot = query.get('shot');

canvas.addEventListener('mousemove', (e) => {
  const r = canvas.getBoundingClientRect();
  mouse = {
    x: ((e.clientX - r.left) / r.width) * VIEW.w,
    y: ((e.clientY - r.top) / r.height) * VIEW.h,
  };
});

window.addEventListener('keydown', (e) => {
  if (shot) return;
  const key = KEYS[e.code];
  if (key) {
    input[key] = true;
    e.preventDefault();
  }
  if (e.code === 'Space') {
    input.grab = true;
    e.preventDefault();
  }
  if (e.code === 'KeyE') throwPebble(world, mouse.x, mouse.y);
  if (e.code === 'KeyQ') dropSmoke(world);
  if (e.code === 'Enter') {
    if (world.mode === 'title' || world.mode === 'win' || world.mode === 'lose') start(world);
  }
});
window.addEventListener('keyup', (e) => {
  const key = KEYS[e.code];
  if (key) input[key] = false;
  if (e.code === 'Space') input.grab = false;
});

const status = document.getElementById('status');
let lastStatus = '';
function announce(w) {
  const text =
    w.mode === 'title' ? 'Title. Press Enter to begin the heist.'
      : w.mode === 'win' ? `Getaway complete. Score ${w.score}.`
        : w.mode === 'lose' ? `Busted by ${w.caughtBy}.`
          : `Alarm ${Math.round(w.alarm)} percent. ${w.lootTaken ? 'Diamond secured, reach the hatch.' : 'Find the Meridian Diamond.'}`;
  if (text !== lastStatus) {
    status.textContent = text;
    lastStatus = text;
  }
}

let last = performance.now();
function frame(now) {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;
  update(world, dt, input);
  input.grab = false;
  render(ctx, world);
  announce(world);
  requestAnimationFrame(frame);
}

if (shot) {
  // Deterministic pose: no animation loop, no clock reads beyond the posed state.
  Object.assign(world, poseForShot(shot));
  render(ctx, world);
  window.__heist = { world, render, update, start };
  window.__shotReady = true;
} else {
  requestAnimationFrame(frame);
}
