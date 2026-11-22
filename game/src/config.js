// Shared constants for The Midnight Ledger.
// Every module draws from here so one edit retunes the whole game.

export const VIEW = { w: 1280, h: 720 };
export const HUD_H = 66;
export const ROOM = { x: 36, y: 92, w: 1208, h: 596 };

export const PAL = {
  sky: '#0a0f1c',
  floorA: '#131c31',
  floorB: '#101829',
  grid: '#1d2a44',
  wall: '#2a3757',
  wallEdge: '#46598a',
  cover: '#33456b',
  coverTop: '#4a6094',
  coverEdge: '#6a83bd',
  thief: '#66e6c4',
  thiefDark: '#0d4b40',
  guard: '#edb75f',
  guardDark: '#5a3c12',
  camera: '#e07a6c',
  loot: '#8ce6ff',
  lootGlow: 'rgba(140,230,255,0.30)',
  coneWarm: 'rgba(237,183,95,0.17)',
  coneWarmEdge: 'rgba(237,183,95,0.34)',
  coneHot: 'rgba(255,92,92,0.22)',
  coneHotEdge: 'rgba(255,92,92,0.42)',
  safe: '#5fd6a3',
  danger: '#ff6b6b',
  ink: '#e8eefc',
  muted: '#8fa3c8',
  smoke: 'rgba(196,214,240,0.30)',
};

export const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

export const PLAYER = {
  radius: 11,
  speed: 2.75,
  sneakSpeed: 1.4,
  grabRange: 40,
  start: { x: 92, y: 636 },
};

export const ALARM = {
  guardGain: 30,
  cameraGain: 38,
  decay: 15,
  sneakScale: 0.5,
  coverScale: 0.0,
  lootSpike: 10,
  max: 100,
  alertAt: 62,
};

export const TOOLS = {
  pebbles: 3,
  smokes: 1,
  pebbleSpeed: 7.2,
  pebbleLife: 1.1,
  lureRadius: 260,
  lureSecs: 3.2,
  smokeRadius: 104,
  smokeSecs: 6,
};

export const GUARD = {
  radius: 12,
  coneRange: 268,
  coneHalf: 0.40,
  patrolSpeed: 0.92,
};

export const CAMERA = {
  coneRange: 320,
  coneHalf: 0.46,
  sweepAmp: 0.62,
  sweepRate: 0.55,
};
