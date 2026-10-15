# Block Blast Clone — Development Plan

> Open-source clone of the mobile game Block Blast.
> **License:** MIT
> **Stack:** Zero-dependency web game — HTML5 Canvas + vanilla JavaScript (ES modules), no build step.
> **Target platforms:** Any OS via browser; optional later packaging as PWA / Electron desktop app / Capacitor APK.

## Why this stack (decision log)

- User wants: learn-friendly, runs on any OS, browser, and eventually Android APK.
- Considered Rust (Bevy / macroquad) — rejected for now: no toolchain installed, steep ECS
  learning curve, and Android build tooling is fiddly.
- Plain HTML/JS/Canvas runs in every browser on every OS with **zero packaging** — the
  simplest path to "multi-platform".
- Wrappers (PWA / Electron / Capacitor) are **optional packaging steps added later** that
  wrap the same finished game — deferred, not lost.

| Goal | Solution | When |
|---|---|---|
| Play anywhere, now | Plain web game | ✅ Now |
| Installable app + offline | PWA (manifest + service worker) | Phase 6 (optional) |
| Desktop app download | Electron wrapper | Phase 6 (optional) |
| Play Store APK | Capacitor wrapper | Phase 6 (optional) |

## Architecture

Keeps game logic separate from rendering so it stays clean, debuggable, and testable
later if tests are ever added.

```
block_blast_clone/
├── AGENTS.md               # Standard agent entry point (project context for AI agents)
├── README.md               # Project intro + play/build/contrib instructions
├── LICENSE                 # MIT
├── CONTRIBUTING.md
├── .gitignore
├── .github/workflows/
│   └── pages.yml           # Auto-deploy the static site to GitHub Pages on push to main
├── index.html              # Entry point (canvas + script)
├── style.css
├── docs/
│   ├── plan.md             # This file — master plan, updated as work progresses
│   ├── game-design.md      # Living documentation: how the game functions
│   └── screenshot.png      # README screenshot
└── src/
    ├── main.js             # Bootstrap, game loop (requestAnimationFrame), wiring, HUD
    ├── input.js            # Pointer Events drag & drop (mouse + touch, one code path)
    ├── storage.js          # High score persistence via localStorage
    ├── game/               # PURE logic — no rendering, no DOM
    │   ├── board.js        # 8×8 grid, occupancy, collision + bounds validation
    │   ├── pieces.js       # Piece shape definitions + bag-style RNG hand generator
    │   ├── scoring.js      # Score rules, line multipliers, combos
    │   └── state.js        # Game state machine: playing / game-over, hand mgmt
    └── render/
        ├── layout.js       # Viewport geometry (shared by renderer + input)
        └── renderer.js     # Canvas draw: board, hand, ghost preview, effects
```

## Game rules (summary — full detail in `docs/game-design.md`)

- 8×8 grid.
- Player holds a hand of **3 pieces** at a time; a new hand of 3 is dealt when all are used.
- Drag and drop pieces onto the grid. A placement must fit within bounds and not overlap
  occupied cells.
- Completing a **full row OR full column** clears it (rows and columns can clear together).
- Scoring: base points per placement, multiplied for clearing 1/2/3/4+ lines; consecutive
  placements that clear lines build a **combo streak** bonus.
- **Game over** when no piece remaining in the hand fits anywhere on the board.
- High score persisted in `localStorage`.

## Phases

### Phase 1 — Scaffold ✅
- `index.html`, `style.css`, `src/main.js` with full-window Canvas.
- `requestAnimationFrame` game loop; devicePixelRatio scaling for crisp mobile rendering.

### Phase 2 — Core game logic (pure JS, no rendering) ✅
- 8×8 board as a 2D array; occupancy + collision + bounds checks.
- Block Blast piece set (33 shapes: lines 1–5, squares, rects, corners, L/T/S/Z, big L).
- Hand-of-3 with bag-style RNG.
- Row and column clear detection (simultaneous clears, de-duplicated).
- Scoring with line multipliers + consecutive-clear combos.
- Game-over detection (no hand piece fits anywhere).

### Phase 3 — Rendering + input ✅
- Draw board, hand pieces, score HUD.
- Drag-and-drop via Pointer Events (mouse + touch on one code path).
- Live ghost preview: valid placement = green tint, invalid = red tint.

### Phase 4 — Polish ⚠️ (largely done — iterate as desired)
- ✅ Line-clear flash/shrink animation; ✅ particles; ✅ floating score popups.
- ✅ Combo streak feedback (HUD badge + popup).
- ✅ Color theme, rounded glossy blocks.
- ⬜ Title / start screen (game currently starts immediately; only game-over overlay exists).
- ✅ High score via `storage.js` (`localStorage`).
- ⬜ Sound effects / mute toggle (optional).
- ⬜ Screen shake on big clears (optional).

### Phase 5 — Open-source packaging ⚠️ (mostly done)
- ✅ `LICENSE` (MIT), ✅ `README.md`, ✅ `CONTRIBUTING.md`, ✅ `.gitignore`.
- ✅ Screenshot in README (`docs/screenshot.png`).
- ✅ Published to GitHub: <https://github.com/SSWheatley/block_blast>.
- ⬜ Enable GitHub Pages (Settings → Pages → Deploy from branch `main` / root) to activate
  the play link <https://sswheatley.github.io/block_blast/> already referenced in the README.

### Phase 6 — Optional packaging (pick as desired)
- PWA: web app manifest + service worker → "add to home screen", offline play.
- Electron: desktop app for Windows/Mac/Linux download (itch.io / GitHub Releases).
- Capacitor: wrap web game as Android APK for Play Store.
- Each wraps the same finished game — none affect core game code.

## Progress log

- [x] Phase 1 — Scaffold
- [x] Phase 2 — Core logic
- [x] Phase 3 — Rendering + input
- [~] Phase 4 — Polish (core polish done; start screen / sound optional)
- [~] Phase 5 — OSS packaging (files done; Pages deploy + screenshot pending)
- [ ] Phase 6 — Optional wrappers

### Verification done (2026-10-15)
- Pure logic simulated in Node over multiple seeds: invariant checks pass (no uncleared
  full lines, score never decreases, game-over state matches "no legal move"); games end
  cleanly in ~20–26 moves under a deliberately weak greedy heuristic.
- All source files pass `node --check`.
- Loaded in headless Chromium: all modules import, a full frame renders (163k painted
  pixels), zero JS runtime errors.

### Known rough edges / next steps
- No title/start screen yet; the game begins immediately and there's only a game-over overlay.
- Hand pieces are drawn smaller than board cells — purely visual, fine, but could be tuned.
- Consider adding an initial `git init` and committing per phase for a clean history.

## Notes for a fresh session / model switch

- Working directory: `/home/sswheatley/Projects/block_blast_clone` (was empty at start; not yet a git repo).
- User prefers documentation written **as features are built** — keep `docs/game-design.md`
  updated to reflect real behavior, not aspirational behavior.
- No tests for now (per user), but logic in `src/game/` is pure so tests are trivial to add later.
- MIT license chosen.
- To run locally: `python3 -m http.server 8080` (or `npx serve . -l 8080`) then open localhost —
  ES modules require http://, not file://.
