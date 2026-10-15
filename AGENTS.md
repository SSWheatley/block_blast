# AGENTS.md

Orientation for AI coding agents (and humans) working in this repository. Read this first.

## What this is

An open-source clone of the mobile puzzle game **Block Blast**. A single-page HTML5 Canvas
game written in **vanilla JavaScript (ES modules)**.

- **No frameworks, no build step, no dependencies.** Deliberately.
- **MIT licensed.**
- Live: <https://sswheatley.github.io/block_blast/> · Repo: <https://github.com/SSWheatley/block_blast>

## Run & verify

The game uses ES modules, so it must be served over `http://` (opening `index.html` as a
`file://` path will fail).

```bash
python3 -m http.server 8080      # or: npx serve . -l 8080
# then open http://localhost:8080
```

There is **no build, lint, or test step**. Ways to verify work:

- **Logic only (no browser):** everything in `src/game/` is pure ES modules and runs in
  plain Node, e.g.
  `node --input-type=module -e "import('./src/game/state.js').then(m => console.log(new m.Game().score))"`.
- **Visual:** take a headless screenshot (Chromium is usually available on this machine):

  ```bash
  chromium --headless --no-sandbox --disable-gpu --hide-scrollbars \
    --window-size=430,932 --force-device-scale-factor=2 --virtual-time-budget=4500 \
    --screenshot=/tmp/shot.png http://localhost:8080/
  ```

## Conventions — please follow

1. **Keep `src/game/` pure.** No DOM, no canvas, no browser APIs — it must keep running in
   plain Node. Rendering (`src/render/`) and input (`src/input.js`) live outside it.
2. **No dependencies / no build step.** Don't introduce a bundler, framework, or npm
   runtime dependency for the game itself.
3. **Keep docs in sync.** If you change behavior, update `docs/game-design.md` so it
   describes what the code *actually* does. Update `docs/plan.md` progress as phases move.
4. **Style:** 2-space indentation, ES modules, JSDoc where it clarifies. Match surrounding code.

## Layout

| Path | Responsibility |
|---|---|
| `index.html`, `style.css` | Page shell, theme, HUD, game-over overlay |
| `src/main.js` | Bootstrap, game loop, wiring, HUD/overlay, effects |
| `src/input.js` | Pointer-based drag & drop (mouse + touch, one path) |
| `src/storage.js` | High-score persistence (`localStorage`) |
| `src/game/pieces.js` | Shape set, palette, bag RNG |
| `src/game/board.js` | 8×8 grid, placement validation, line clearing |
| `src/game/scoring.js` | Scoring formulas (tunable) |
| `src/game/state.js` | Game state machine, hand management |
| `src/render/layout.js` | Viewport geometry (shared by renderer + input) |
| `src/render/renderer.js` | All canvas drawing |
| `docs/plan.md` | Roadmap, architecture, phase progress |
| `docs/game-design.md` | How the game works (rules, scoring, systems) |
| `.github/workflows/pages.yml` | Auto-deploy to GitHub Pages on push to `main` |

## Current status

- Phases 1–3 complete (scaffold, pure logic, rendering + input). Phase 4 (polish) mostly
  done; Phase 5 (packaging + hosting) complete.
- **Deploys automatically:** any push to `main` publishes the site via GitHub Pages.
- Open ideas: title/start screen, PWA (installable + offline), sound effects, screen shake.
- Full details and the phase checklist live in [`docs/plan.md`](docs/plan.md).

## Environment notes (this machine)

- Not originally a git repo; now `origin` → `git@github.com:SSWheatley/block_blast.git`, branch `main`.
- Git identity: Jake Vince. GitHub CLI (`gh`) is installed but **not authenticated**.
- GitLab CLI (`glab`) is not installed (it is in the Arch `extra` repo if ever needed).
