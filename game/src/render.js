// All canvas drawing. Every visual element of the heist is painted here, in layers.

import { ALARM, CAMERA, FONT, GUARD, HUD_H, PAL, ROOM, TOOLS, VIEW } from './config.js';
import { BLOCKERS, BRIEF, COVER, EXIT, LOOT, WALLS } from './level.js';
import { conePolygon } from './geometry.js';

export function render(ctx, w) {
  ctx.clearRect(0, 0, VIEW.w, VIEW.h);
  drawBackdrop(ctx);
  drawFloor(ctx);
  drawLootCase(ctx, w);
  drawExit(ctx, w);
  drawCover(ctx);
  drawCones(ctx, w);
  drawCameras(ctx, w);
  drawGuards(ctx, w);
  drawPebbles(ctx, w);
  drawSmoke(ctx, w);
  drawThief(ctx, w);
  drawWalls(ctx);
  drawHud(ctx, w);

  if (w.mode === 'title') drawTitle(ctx, w);
  else if (w.mode === 'win') drawWin(ctx, w);
  else if (w.mode === 'lose') drawLose(ctx, w);
  else if (w.bannerTimer > 0) drawBanner(ctx, w);
}

function drawBackdrop(ctx) {
  ctx.fillStyle = PAL.sky;
  ctx.fillRect(0, 0, VIEW.w, VIEW.h);
}

function drawFloor(ctx) {
  ctx.fillStyle = PAL.floorA;
  ctx.fillRect(ROOM.x, ROOM.y, ROOM.w, ROOM.h);
  ctx.fillStyle = PAL.floorB;
  for (let y = ROOM.y; y < ROOM.y + ROOM.h; y += 56) {
    for (let x = ROOM.x; x < ROOM.x + ROOM.w; x += 56) {
      if (((x / 56 + y / 56) | 0) % 2 === 0) ctx.fillRect(x, y, 56, 56);
    }
  }
  ctx.strokeStyle = PAL.grid;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = ROOM.x; x <= ROOM.x + ROOM.w; x += 56) {
    ctx.moveTo(x, ROOM.y);
    ctx.lineTo(x, ROOM.y + ROOM.h);
  }
  for (let y = ROOM.y; y <= ROOM.y + ROOM.h; y += 56) {
    ctx.moveTo(ROOM.x, y);
    ctx.lineTo(ROOM.x + ROOM.w, y);
  }
  ctx.stroke();
}

function drawWalls(ctx) {
  for (const r of WALLS) {
    ctx.fillStyle = PAL.wall;
    ctx.fillRect(r.x, r.y, r.w, r.h);
    ctx.fillStyle = PAL.wallEdge;
    ctx.fillRect(r.x, r.y, r.w, 3);
    ctx.fillRect(r.x, r.y, 3, r.h);
  }
}

function drawCover(ctx) {
  for (const c of COVER) {
    ctx.fillStyle = PAL.cover;
    ctx.fillRect(c.x, c.y, c.w, c.h);
    ctx.fillStyle = PAL.coverTop;
    ctx.fillRect(c.x + 5, c.y + 5, c.w - 10, c.h - 10);
    ctx.strokeStyle = PAL.coverEdge;
    ctx.lineWidth = 2;
    ctx.strokeRect(c.x + 1, c.y + 1, c.w - 2, c.h - 2);
    ctx.fillStyle = PAL.muted;
    ctx.font = `700 10px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText(c.label, c.x + c.w / 2, c.y + c.h / 2 + 4);
  }
}

function paintCone(ctx, ox, oy, facing, half, range, hot) {
  const poly = conePolygon(ox, oy, facing, half, range, BLOCKERS);
  ctx.beginPath();
  ctx.moveTo(poly[0].x, poly[0].y);
  for (let i = 1; i < poly.length; i++) ctx.lineTo(poly[i].x, poly[i].y);
  ctx.closePath();
  ctx.fillStyle = hot ? PAL.coneHot : PAL.coneWarm;
  ctx.fill();
  ctx.strokeStyle = hot ? PAL.coneHotEdge : PAL.coneWarmEdge;
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function drawCones(ctx, w) {
  const hot = w.alarm >= ALARM.alertAt;
  for (const g of w.guards) {
    paintCone(ctx, g.x, g.y, g.facing, GUARD.coneHalf, GUARD.coneRange, hot || !!g.lure);
  }
  for (const c of w.cameras) {
    paintCone(ctx, c.x, c.y, c.facing, CAMERA.coneHalf, CAMERA.coneRange, hot || c.seen);
  }
}

function drawCameras(ctx, w) {
  for (const c of w.cameras) {
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.fillStyle = c.seen ? PAL.danger : PAL.camera;
    ctx.beginPath();
    ctx.arc(0, 0, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = PAL.ink;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(c.facing) * 16, Math.sin(c.facing) * 16);
    ctx.stroke();
    ctx.restore();
    ctx.fillStyle = PAL.muted;
    ctx.font = `700 10px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText(`CAM ${String(c.idx + 1).padStart(2, '0')}`, c.x, c.y - 14);
  }
}

function drawGuards(ctx, w) {
  for (const g of w.guards) {
    ctx.save();
    ctx.translate(g.x, g.y);
    ctx.rotate(g.facing);
    ctx.fillStyle = PAL.guardDark;
    ctx.beginPath();
    ctx.arc(0, 0, GUARD.radius + 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = PAL.guard;
    ctx.beginPath();
    ctx.arc(0, 0, GUARD.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = PAL.ink;
    ctx.fillRect(GUARD.radius - 3, -3, 8, 6);
    ctx.restore();
    ctx.fillStyle = PAL.guard;
    ctx.font = `700 10px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText(g.lureTimer > 0 ? '!' : 'WATCH', g.x, g.y - 18);
  }
}

function drawThief(ctx, w) {
  const p = w.player;
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(2, 5, PLAYER_R, PLAYER_R * 0.7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.rotate(p.facing);
  const r = PLAYER_R;
  ctx.fillStyle = PAL.thiefDark;
  ctx.beginPath();
  ctx.arc(0, 0, r + 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PAL.thief;
  ctx.beginPath();
  ctx.arc(0, 0, p.sneaking ? r - 2 : r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PAL.sky;
  ctx.fillRect(r - 4, -3, 7, 6);
  ctx.restore();
  ctx.fillStyle = PAL.thief;
  ctx.font = `700 11px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.fillText(p.sneaking ? 'FINCH · SNEAK' : 'FINCH', p.x, p.y - 21);
}

const PLAYER_R = 11;

function drawLootCase(ctx, w) {
  const glow = 0.5 + 0.5 * Math.sin(w.time * 2.2);
  ctx.save();
  ctx.fillStyle = `rgba(140,230,255,${0.1 + glow * 0.12})`;
  ctx.beginPath();
  ctx.arc(LOOT.x + LOOT.w / 2, LOOT.y + LOOT.h / 2, 52, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = w.lootTaken ? PAL.muted : PAL.loot;
  ctx.lineWidth = 3;
  ctx.strokeRect(LOOT.x, LOOT.y, LOOT.w, LOOT.h);
  ctx.fillStyle = w.lootTaken ? 'rgba(140,230,255,0.06)' : PAL.lootGlow;
  ctx.fillRect(LOOT.x, LOOT.y, LOOT.w, LOOT.h);
  if (!w.lootTaken) {
    ctx.fillStyle = PAL.loot;
    ctx.beginPath();
    const cx = LOOT.x + LOOT.w / 2;
    const cy = LOOT.y + LOOT.h / 2;
    ctx.moveTo(cx, cy - 14);
    ctx.lineTo(cx + 9, cy);
    ctx.lineTo(cx, cy + 14);
    ctx.lineTo(cx - 9, cy);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = w.lootTaken ? PAL.muted : PAL.loot;
  ctx.font = `700 10px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.fillText(w.lootTaken ? 'LOOTED' : 'MERIDIAN', LOOT.x + LOOT.w / 2, LOOT.y - 12);
  ctx.restore();
}

function drawExit(ctx, w) {
  const open = w.lootTaken;
  ctx.save();
  ctx.strokeStyle = open ? PAL.safe : PAL.muted;
  ctx.lineWidth = 3;
  ctx.strokeRect(EXIT.x, EXIT.y, EXIT.w, EXIT.h);
  ctx.fillStyle = open ? 'rgba(95,214,163,0.18)' : 'rgba(143,163,200,0.08)';
  ctx.fillRect(EXIT.x, EXIT.y, EXIT.w, EXIT.h);
  ctx.fillStyle = open ? PAL.safe : PAL.muted;
  ctx.font = `700 11px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.fillText(open ? 'HATCH OPEN' : 'HATCH LOCKED', EXIT.x + EXIT.w / 2, EXIT.y + EXIT.h / 2 - 2);
  ctx.font = `600 9px ${FONT}`;
  ctx.fillText('GETAWAY', EXIT.x + EXIT.w / 2, EXIT.y + EXIT.h / 2 + 12);
  ctx.restore();
}

function drawPebbles(ctx, w) {
  ctx.fillStyle = PAL.ink;
  for (const p of w.pebbles) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawSmoke(ctx, w) {
  if (w.smoke.timer <= 0) return;
  const a = Math.min(1, w.smoke.timer / 1.5) * 0.55;
  ctx.fillStyle = `rgba(196,214,240,${a})`;
  ctx.beginPath();
  ctx.arc(w.smoke.x, w.smoke.y, TOOLS.smokeRadius, 0, Math.PI * 2);
  ctx.fill();
}

function label(ctx, text, x, y, size, color, align = 'left', weight = 700) {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px ${FONT}`;
  ctx.textAlign = align;
  ctx.fillText(text, x, y);
}

function drawHud(ctx, w) {
  ctx.fillStyle = PAL.sky;
  ctx.fillRect(0, 0, VIEW.w, HUD_H);
  ctx.fillStyle = PAL.wallEdge;
  ctx.fillRect(0, HUD_H - 2, VIEW.w, 2);

  label(ctx, 'THE MIDNIGHT LEDGER', 24, 30, 20, PAL.ink);
  label(ctx, 'VAULT HEIST  /  NIGHT SHIFT', 24, 50, 10, PAL.muted, 'left', 600);

  // Alarm meter.
  const bx = 388;
  const by = 24;
  const bw = 320;
  const bh = 18;
  label(ctx, 'ALARM', bx, 18, 11, PAL.muted, 'left', 700);
  ctx.fillStyle = '#1a2338';
  ctx.fillRect(bx, by, bw, bh);
  const pct = w.alarm / ALARM.max;
  const alarmColor = w.alarm >= ALARM.alertAt ? PAL.danger : w.alarm >= 35 ? PAL.guard : PAL.safe;
  ctx.fillStyle = alarmColor;
  ctx.fillRect(bx, by, bw * pct, bh);
  ctx.strokeStyle = PAL.wallEdge;
  ctx.lineWidth = 1;
  ctx.strokeRect(bx, by, bw, bh);
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = PAL.danger;
  ctx.beginPath();
  const tx = bx + bw * (ALARM.alertAt / ALARM.max);
  ctx.moveTo(tx, by);
  ctx.lineTo(tx, by + bh);
  ctx.stroke();
  ctx.setLineDash([]);
  label(ctx, `${Math.round(w.alarm)}%`, bx + bw + 12, by + 14, 15, alarmColor);

  // Objective + tools.
  label(ctx, w.lootTaken ? 'OBJECTIVE: REACH THE HATCH' : 'OBJECTIVE: TAKE THE DIAMOND', 792, 28, 13, PAL.ink);
  const t = `PEBBLES ${w.pebblesLeft}   SMOKE ${w.smokesLeft}`;
  label(ctx, t, 792, 50, 12, PAL.muted, 'left', 600);

  // Legend: safe cover, danger, loot - always visible in the play frame.
  const lx = 1010;
  swatch(ctx, lx, 18, PAL.coverTop, 'COVER');
  swatch(ctx, lx, 38, PAL.guard, 'DANGER');
  swatch(ctx, lx + 116, 18, PAL.loot, 'LOOT');
  swatch(ctx, lx + 116, 38, PAL.safe, 'EXIT');
}

function swatch(ctx, x, y, color, text) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y - 9, 12, 12);
  label(ctx, text, x + 18, y + 1, 11, PAL.ink, 'left', 600);
}

function panel(ctx, x, y, w, h) {
  ctx.fillStyle = 'rgba(8,13,26,0.90)';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = PAL.wallEdge;
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);
}

function drawTitle(ctx, w) {
  ctx.fillStyle = 'rgba(6,10,20,0.82)';
  ctx.fillRect(0, HUD_H, VIEW.w, VIEW.h - HUD_H);
  panel(ctx, 220, 150, 840, 430);
  label(ctx, 'THE MIDNIGHT LEDGER', 640, 226, 44, PAL.ink, 'center', 800);
  label(ctx, 'A one-room vault heist', 640, 258, 16, PAL.loot, 'center', 600);
  ctx.textAlign = 'left';
  let y = 306;
  for (const line of BRIEF) {
    label(ctx, line, 292, y, 15, PAL.ink, 'left', 500);
    y += 28;
  }
  const controls = [
    ['MOVE', 'WASD / ARROWS'],
    ['SNEAK', 'HOLD SHIFT'],
    ['GRAB DIAMOND', 'SPACE'],
    ['THROW PEBBLE', 'E  (aim with mouse)'],
    ['SMOKESCREEN', 'Q'],
    ['START', 'ENTER'],
  ];
  label(ctx, 'CONTROLS', 292, 380, 13, PAL.guard, 'left', 800);
  let cx = 292;
  let cy = 404;
  for (const [k, v] of controls) {
    label(ctx, k, cx, cy, 12, PAL.muted, 'left', 700);
    label(ctx, v, cx + 150, cy, 12, PAL.ink, 'left', 600);
    cy += 26;
    if (cy > 500) {
      cx = 640;
      cy = 404;
    }
  }
  const pulse = 0.6 + 0.4 * Math.sin(w.time * 3);
  label(ctx, 'PRESS ENTER TO BEGIN', 640, 552, 18, `rgba(102,230,196,${pulse.toFixed(2)})`, 'center', 800);
}

function drawBanner(ctx, w) {
  const a = Math.min(1, w.bannerTimer);
  ctx.fillStyle = `rgba(8,13,26,${0.72 * a})`;
  ctx.fillRect(360, 78, 560, 46);
  label(ctx, w.banner, 640, 108, 16, PAL.ink, 'center', 700);
}

function drawWin(ctx, w) {
  ctx.fillStyle = 'rgba(6,14,22,0.84)';
  ctx.fillRect(0, HUD_H, VIEW.w, VIEW.h - HUD_H);
  panel(ctx, 340, 190, 600, 330);
  label(ctx, 'CLEAN GETAWAY', 640, 268, 40, PAL.safe, 'center', 800);
  label(ctx, 'The Meridian Diamond is gone. So are you.', 640, 306, 15, PAL.ink, 'center', 500);
  label(ctx, 'FINAL SCORE', 640, 366, 14, PAL.muted, 'center', 700);
  label(ctx, String(w.score), 640, 420, 52, PAL.loot, 'center', 800);
  label(ctx, `ALARM ${Math.round(w.alarm)}%  ·  TIME ${w.time.toFixed(1)}s`, 640, 458, 13, PAL.muted, 'center', 600);
  label(ctx, 'ENTER  ·  RUN ANOTHER JOB', 640, 500, 16, PAL.ink, 'center', 700);
}

function drawLose(ctx, w) {
  ctx.fillStyle = 'rgba(20,6,10,0.84)';
  ctx.fillRect(0, HUD_H, VIEW.w, VIEW.h - HUD_H);
  panel(ctx, 340, 196, 600, 318);
  label(ctx, 'BUSTED', 640, 272, 46, PAL.danger, 'center', 800);
  label(ctx, `CAUGHT BY: ${w.caughtBy}`, 640, 312, 15, PAL.ink, 'center', 700);
  label(ctx, 'The gallery watches every corridor. Read the cones', 640, 358, 14, PAL.muted, 'center', 500);
  label(ctx, 'before you move, and let a pebble pull them away.', 640, 382, 14, PAL.muted, 'center', 500);
  label(ctx, 'ENTER  ·  TRY AGAIN', 640, 468, 16, PAL.ink, 'center', 700);
}
