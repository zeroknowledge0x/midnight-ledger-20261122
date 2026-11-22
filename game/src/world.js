// Simulation state and rules for one heist. No drawing, no DOM: pure, deterministic logic.

import { ALARM, CAMERA, GUARD, PLAYER, TOOLS, VIEW, HUD_H } from './config.js';
import { BLOCKERS, CAMERA_MOUNTS, EXIT, GUARD_ROUTES, LOOT } from './level.js';
import { canSee, inRect, resolveCircle } from './geometry.js';

export function createWorld() {
  const guards = GUARD_ROUTES.map((route, i) => ({
    x: route.waypoints[0].x,
    y: route.waypoints[0].y,
    facing: i === 0 ? 0 : i === 1 ? Math.PI / 2 : Math.PI,
    leg: 0,
    route,
    lure: null,
    lureTimer: 0,
    rng: 0.31 + i * 0.23,
  }));
  const cameras = CAMERA_MOUNTS.map((m, i) => ({
    ...m,
    facing: m.base,
    seen: false,
    idx: i,
  }));
  return {
    mode: 'title',
    time: 0,
    player: { ...PLAYER.start, facing: 0, sneaking: false, moving: false },
    guards,
    cameras,
    alarm: 0,
    lootTaken: false,
    pebblesLeft: TOOLS.pebbles,
    smokesLeft: TOOLS.smokes,
    pebbles: [],
    smoke: { x: 0, y: 0, timer: 0 },
    flash: 0,
    banner: '',
    bannerTimer: 0,
    caughtBy: '',
    escapes: 0,
    score: 0,
  };
}

export function poseForShot(name) {
  const w = createWorld();
  if (name === 'title') return w;

  // 'job': the whole room visible, thief committed to the crossing, alarm low.
  w.mode = 'play';
  w.player.x = 470;
  w.player.y = 640;
  w.player.facing = -0.9;
  w.guards[0].x = 300;
  w.guards[0].facing = 0.05;
  w.guards[1].x = 168;
  w.guards[1].y = 470;
  w.guards[1].facing = Math.PI / 2;
  w.guards[2].x = 1132;
  w.guards[2].y = 350;
  w.guards[2].facing = -Math.PI / 2;
  w.cameras[0].facing = 1.2;
  w.cameras[1].facing = 1.94;
  w.alarm = 12;

  if (name === 'spotted') {
    w.player.x = 672;
    w.player.y = 300;
    w.player.facing = -1.2;
    w.alarm = 74;
    w.flash = 1;
    w.banner = 'SPOTTED - BREAK LINE OF SIGHT';
    w.bannerTimer = 3;
    w.guards[0].x = 724;
    w.guards[0].y = 150;
    w.guards[0].facing = Math.PI / 2;
    w.pebblesLeft = 1;
    w.smoke = { x: 520, y: 300, timer: TOOLS.smokeSecs };
  }
  if (name === 'getaway') {
    w.mode = 'win';
    w.lootTaken = true;
    w.player.x = EXIT.x + EXIT.w / 2;
    w.player.y = EXIT.y + EXIT.h / 2;
    w.alarm = 31;
    w.escapes = 1;
    w.time = 42.6;
    w.score = Math.max(1000, Math.round(12000 - w.alarm * 60 - w.time * 8));
  }
  if (name === 'busted') {
    w.mode = 'lose';
    w.caughtBy = 'GALLERY WATCH';
    w.player.x = 700;
    w.player.y = 250;
    w.alarm = 100;
    w.flash = 1;
  }
  return w;
}

export function start(w) {
  const fresh = createWorld();
  Object.assign(w, fresh);
  w.mode = 'play';
  w.banner = 'INFILTRATE THE GALLERY';
  w.bannerTimer = 2.4;
  return w;
}

export function throwPebble(w, tx, ty) {
  if (w.pebblesLeft <= 0 || w.mode !== 'play') return false;
  w.pebblesLeft -= 1;
  const ox = w.player.x;
  const oy = w.player.y;
  const a = Math.atan2(ty - oy, tx - ox);
  w.pebbles.push({
    x: ox,
    y: oy,
    vx: Math.cos(a) * TOOLS.pebbleSpeed,
    vy: Math.sin(a) * TOOLS.pebbleSpeed,
    life: TOOLS.pebbleLife,
  });
  return true;
}

export function dropSmoke(w) {
  if (w.smokesLeft <= 0 || w.mode !== 'play') return false;
  w.smokesLeft -= 1;
  w.smoke = { x: w.player.x, y: w.player.y, timer: TOOLS.smokeSecs };
  w.banner = 'SMOKESCREEN DEPLOYED';
  w.bannerTimer = 1.6;
  return true;
}

function moveGuard(g, dt) {
  if (g.lureTimer > 0) {
    g.lureTimer -= dt;
    if (g.lure) {
      const a = Math.atan2(g.lure.y - g.y, g.lure.x - g.x);
      g.facing = a;
    }
    return;
  }
  const pts = g.route.waypoints;
  const target = pts[g.leg];
  const dx = target.x - g.x;
  const dy = target.y - g.y;
  const d = Math.hypot(dx, dy);
  const step = g.route.speed * dt * 60 * 0.5;
  if (d < step + 2) {
    g.x = target.x;
    g.y = target.y;
    g.leg = (g.leg + 1) % pts.length;
  } else {
    g.x += (dx / d) * step;
    g.y += (dy / d) * step;
    g.facing = Math.atan2(dy, dx);
  }
}

function inSmoke(w, x, y) {
  return (
    w.smoke.timer > 0 &&
    Math.hypot(x - w.smoke.x, y - w.smoke.y) < TOOLS.smokeRadius
  );
}

export function update(w, dt, input) {
  if (w.mode !== 'play') return;
  dt = Math.min(dt, 0.05);
  w.time += dt;
  if (w.bannerTimer > 0) w.bannerTimer -= dt;
  if (w.flash > 0) w.flash = Math.max(0, w.flash - dt * 2.2);

  const p = w.player;
  p.sneaking = !!input.sneak;
  let mx = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  let my = (input.down ? 1 : 0) - (input.up ? 1 : 0);
  const len = Math.hypot(mx, my);
  p.moving = len > 0;
  if (len > 0) {
    mx /= len;
    my /= len;
    const spd = (p.sneaking ? PLAYER.sneakSpeed : PLAYER.speed) * dt * 60;
    const moved = resolveCircle(p.x + mx * spd, p.y + my * spd, PLAYER.radius, BLOCKERS);
    p.x = Math.max(VIEW.w * 0 + 26, Math.min(VIEW.w - 26, moved.x));
    p.y = Math.max(HUD_H + 22, Math.min(VIEW.h - 26, moved.y));
    p.facing = Math.atan2(my, mx);
  }

  for (const pellet of w.pebbles) {
    pellet.x += pellet.vx * dt * 60;
    pellet.y += pellet.vy * dt * 60;
    pellet.life -= dt;
  }
  const landed = w.pebbles.filter((p2) => p2.life <= 0);
  for (const pellet of landed) {
    for (const g of w.guards) {
      if (Math.hypot(g.x - pellet.x, g.y - pellet.y) < TOOLS.lureRadius) {
        g.lure = { x: pellet.x, y: pellet.y };
        g.lureTimer = TOOLS.lureSecs;
      }
    }
  }
  w.pebbles = w.pebbles.filter((p2) => p2.life > 0);
  if (w.smoke.timer > 0) w.smoke.timer -= dt;

  for (const g of w.guards) moveGuard(g, dt);
  for (const c of w.cameras) {
    c.facing = c.base + Math.sin(w.time * CAMERA.sweepRate + c.phase) * CAMERA.sweepAmp;
  }

  // Detection: a sight line that reaches the thief raises the alarm.
  const hidden = inSmoke(w, p.x, p.y);
  let seen = false;
  const scale = p.sneaking ? ALARM.sneakScale : 1;
  for (const g of w.guards) {
    if (
      !hidden &&
      canSee(g.x, g.y, g.facing, GUARD.coneHalf, GUARD.coneRange, p, BLOCKERS)
    ) {
      w.alarm += ALARM.guardGain * scale * dt;
      seen = true;
    }
  }
  for (const c of w.cameras) {
    c.seen =
      !hidden &&
      canSee(c.x, c.y, c.facing, CAMERA.coneHalf, CAMERA.coneRange, p, BLOCKERS);
    if (c.seen) {
      w.alarm += ALARM.cameraGain * scale * dt;
      seen = true;
    }
  }
  if (seen) {
    w.flash = Math.max(w.flash, 0.55);
  } else {
    w.alarm -= ALARM.decay * dt;
  }
  w.alarm = Math.max(0, Math.min(ALARM.max, w.alarm));

  if (input.grab && !w.lootTaken) {
    if (Math.hypot(p.x - (LOOT.x + LOOT.w / 2), p.y - (LOOT.y + LOOT.h / 2)) < PLAYER.grabRange + 26) {
      w.lootTaken = true;
      w.alarm = Math.min(ALARM.max, w.alarm + ALARM.lootSpike);
      w.banner = 'DIAMOND SECURED - GET TO THE HATCH';
      w.bannerTimer = 3;
    }
  }
  if (w.lootTaken && inRect(p.x, p.y, EXIT)) {
    w.mode = 'win';
    w.escapes = 1;
    w.score = Math.max(1000, Math.round(12000 - w.alarm * 60 - w.time * 8));
  }
  if (w.alarm >= ALARM.max) {
    w.mode = 'lose';
    w.caughtBy = seen ? 'ALARM TRIPPED' : 'THE NIGHT WATCH';
  }
}
