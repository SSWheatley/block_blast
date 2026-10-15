# Contributing

Thanks for wanting to help! This project is intentionally small and dependency-free so it's
easy to jump into.

## Getting started

1. Clone the repo.
2. Serve it locally (see README): `python3 -m http.server 8080` or `npx serve . -l 8080`.
3. Open <http://localhost:8080>. There is no build step — edit a file and refresh.

## Project conventions

- **Keep logic pure.** Anything in `src/game/` must not touch the DOM, canvas, or other
  browser APIs. It should run in plain Node. Rendering and input live outside it.
- **Tune the fun, not just the code.** Scoring constants live in `src/game/scoring.js`;
  shape set lives in `src/game/pieces.js`. Feel free to experiment and open a PR with
  numbers you think play better.
- **Update the docs.** If you change behavior, update `docs/game-design.md` so it stays
  accurate. It's meant to describe how the game *actually* works.
- **Match the style.** 2-space indentation, ES modules, JSDoc where it helps.

## Ideas / good first issues

- Additional block shapes or a difficulty curve.
- Sound effects (with a mute toggle).
- Subtle screen shake on big clears.
- Themes / color palettes.
- Replay/share your score.

## License

By contributing, you agree your contributions are licensed under the project's
[MIT License](LICENSE).
