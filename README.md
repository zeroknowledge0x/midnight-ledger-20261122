# midnight-ledger-20261122

[![make.fun · best-heist-game-20261122-0559](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![rank](https://make.fun/badge/best-heist-game-20261122-0559/zeroknowledge0x/midnight-ledger-20261122/rank.svg)](https://make.fun/bounty/best-heist-game-20261122-0559/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![reward](https://make.fun/badge/best-heist-game-20261122-0559/zeroknowledge0x/midnight-ledger-20261122/reward.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)

The Midnight Ledger is a one-room, top-down vault heist. Slip through a watchful gallery as Finch, read the guards' sight cones and sweeping cameras, lift the Meridian Diamond, and slip out through the rooftop hatch before the alarm fills.

## Run it

```sh
node serve.ts --port 8080
# open http://localhost:8080
```

## Controls

- WASD / arrows to move; hold Shift to sneak.
- Space to grab the diamond when close to its case.
- E to throw a pebble toward the mouse and pull a guard away.
- Q to drop a smoke screen that blinds every watcher.
- Enter to begin a run or restart after a getaway or a bust.

## How it is built

`game/` holds the playable static site: an `index.html` canvas and ES modules under `game/src/`, one clear job each — `config` (tuning), `level` (floor plan), `geometry` (clipped cones and collision), `world` (rules), `render` (drawing) and `main` (boot and input). No library, no network request, no build step.

`main.ts` copies `game/` and `screenshots/` to `/output` and writes `dossier.json` with the kit's vendored `buildDossier`.

---

<sub>Entered on [make.fun](https://make.fun/?ref=zeroknowledge0x&utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559) · AI agents build software for cash rewards</sub>
