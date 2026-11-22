// Geometry helpers: line-of-sight cones clipped by walls and cover, plus collision.
// A guard sees the thief only if the target is inside the cone AND no blocker is nearer.

export function rayRectDistance(ox, oy, dx, dy, r) {
  let tMin = 0;
  let tMax = Infinity;
  if (Math.abs(dx) < 1e-9) {
    if (ox < r.x || ox > r.x + r.w) return Infinity;
  } else {
    let t1 = (r.x - ox) / dx;
    let t2 = (r.x + r.w - ox) / dx;
    if (t1 > t2) [t1, t2] = [t2, t1];
    tMin = Math.max(tMin, t1);
    tMax = Math.min(tMax, t2);
  }
  if (Math.abs(dy) < 1e-9) {
    if (oy < r.y || oy > r.y + r.h) return Infinity;
  } else {
    let t1 = (r.y - oy) / dy;
    let t2 = (r.y + r.h - oy) / dy;
    if (t1 > t2) [t1, t2] = [t2, t1];
    tMin = Math.max(tMin, t1);
    tMax = Math.min(tMax, t2);
  }
  if (tMax >= tMin && tMax > 0) return tMin >= 0 ? tMin : tMax;
  return Infinity;
}

export function nearestHit(ox, oy, angle, range, blockers) {
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  let best = range;
  for (const r of blockers) {
    const t = rayRectDistance(ox, oy, dx, dy, r);
    if (t < best) best = t;
  }
  return best;
}

// A fan of rays gives the visible polygon for one sight cone.
export function conePolygon(ox, oy, facing, half, range, blockers, steps = 34) {
  const pts = [{ x: ox, y: oy }];
  for (let i = 0; i <= steps; i++) {
    const a = facing - half + (2 * half * i) / steps;
    const d = nearestHit(ox, oy, a, range, blockers);
    pts.push({ x: ox + Math.cos(a) * d, y: oy + Math.sin(a) * d });
  }
  return pts;
}

// True when a point lies inside the cone and is not hidden behind cover.
export function canSee(ox, oy, facing, half, range, target, blockers) {
  const dx = target.x - ox;
  const dy = target.y - oy;
  const dist = Math.hypot(dx, dy);
  if (dist > range) return false;
  let diff = Math.atan2(dy, dx) - facing;
  while (diff > Math.PI) diff -= 2 * Math.PI;
  while (diff < -Math.PI) diff += 2 * Math.PI;
  if (Math.abs(diff) > half) return false;
  const hit = nearestHit(ox, oy, Math.atan2(dy, dx), range, blockers);
  return dist <= hit + 1;
}

// Circle vs axis-aligned rectangle: minimum translation to push the circle out.
export function resolveCircle(px, py, radius, blockers) {
  let x = px;
  let y = py;
  for (const r of blockers) {
    const nx = Math.max(r.x, Math.min(x, r.x + r.w));
    const ny = Math.max(r.y, Math.min(y, r.y + r.h));
    let dx = x - nx;
    let dy = y - ny;
    let d = Math.hypot(dx, dy);
    if (d < radius) {
      if (d < 1e-6) {
        // Center is inside the rect: push out along the nearest face.
        const left = x - r.x;
        const right = r.x + r.w - x;
        const top = y - r.y;
        const bottom = r.y + r.h - y;
        const m = Math.min(left, right, top, bottom);
        if (m === left) x = r.x - radius;
        else if (m === right) x = r.x + r.w + radius;
        else if (m === top) y = r.y - radius;
        else y = r.y + r.h + radius;
      } else {
        x = nx + (dx / d) * radius;
        y = ny + (dy / d) * radius;
      }
    }
  }
  return { x, y };
}

export function inRect(x, y, r) {
  return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}
