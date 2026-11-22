// The vault floor plan: walls, cover, patrols, cameras, loot and the getaway hatch.
// Positions are hand-placed so every screenshot reads as one legible room.

import { ROOM } from './config.js';

// Rectangles are {x, y, w, h} in canvas pixels. The outer four are the room walls.
export const WALLS = [
  { x: ROOM.x, y: ROOM.y, w: ROOM.w, h: 14 },
  { x: ROOM.x, y: ROOM.y + ROOM.h - 14, w: ROOM.w, h: 14 },
  { x: ROOM.x, y: ROOM.y, w: 14, h: ROOM.h },
  { x: ROOM.x + ROOM.w - 14, y: ROOM.y, w: 14, h: ROOM.h },
];

// Safe cover: solid blocks that stop a guard's line of sight and hide the thief.
export const COVER = [
  { kind: 'plinth', x: 214, y: 214, w: 76, h: 76, label: 'GLYPH' },
  { kind: 'plinth', x: 522, y: 300, w: 76, h: 76, label: 'RELIC' },
  { kind: 'plinth', x: 858, y: 214, w: 76, h: 76, label: 'MASK' },
  { kind: 'crate', x: 344, y: 470, w: 132, h: 46, label: 'CRATES' },
  { kind: 'crate', x: 706, y: 512, w: 104, h: 46, label: 'CRATES' },
  { kind: 'desk', x: 1000, y: 420, w: 138, h: 54, label: 'DESK' },
];

export const BLOCKERS = [...WALLS, ...COVER];

// Patrol routes are waypoints walked on a loop. facing follows travel direction.
export const GUARD_ROUTES = [
  { waypoints: [{ x: 150, y: 150 }, { x: 1090, y: 150 }], speed: 0.86 },
  { waypoints: [{ x: 168, y: 372 }, { x: 168, y: 600 }, { x: 300, y: 600 }], speed: 0.98 },
  { waypoints: [{ x: 760, y: 604 }, { x: 1132, y: 604 }, { x: 1132, y: 360 }], speed: 0.9 },
];

// Cameras are fixed mounts sweeping around their base angle.
export const CAMERA_MOUNTS = [
  { x: 74, y: 118, base: 0.95, phase: 0.0 },
  { x: 1206, y: 118, base: 2.19, phase: 1.7 },
];

export const LOOT = {
  x: 622,
  y: 168,
  w: 58,
  h: 46,
  name: 'THE MERIDIAN DIAMOND',
};

export const EXIT = { x: 1112, y: 606, w: 96, h: 58, name: 'ROOFTOP HATCH' };

// A short, readable briefing shown on the title screen.
export const BRIEF = [
  'Slip through the gallery, lift the Meridian Diamond, reach the rooftop hatch.',
  'Shadows and plinths break a guard\'s sight. Sneak to shrink your silhouette.',
];
