// src/game/state.js
// The game state machine: board + hand, turn resolution, scoring, game-over detection.
// Pure module: no DOM, no rendering.

import { Board } from './board.js';
import { SHAPES, PieceBag, colorFor } from './pieces.js';
import { placementPoints, lineClearPoints } from './scoring.js';

export const GameStatus = Object.freeze({
  PLAYING: 'playing',
  GAME_OVER: 'gameOver',
});

let uidCounter = 0;

export class Game {
  constructor({ size = 8, rng = Math.random } = {}) {
    this.size = size;
    this.rng = rng;
    this.board = new Board(size);
    this.bag = new PieceBag(SHAPES, rng);
    this.reset();
  }

  reset() {
    this.board.reset();
    /** @type {(null | {uid:number, shape:object, color:string})[]} three slots. */
    this.hand = [null, null, null];
    this.score = 0;
    this.combo = 0;
    this.bestCombo = 0;
    this.status = GameStatus.PLAYING;
    this.dealHand();
    // An empty board always has a legal move, but keep the check for safety.
    if (!this.hasAnyMove()) this.status = GameStatus.GAME_OVER;
  }

  /** Fill all three hand slots from the bag. */
  dealHand() {
    this.hand = [0, 0, 0].map(() => {
      const shape = this.bag.next();
      return { uid: ++uidCounter, shape, color: colorFor(shape) };
    });
  }

  /** Is placing hand slot `handIndex` at (ox, oy) legal? */
  canPlace(handIndex, ox, oy) {
    const slot = this.hand[handIndex];
    return !!slot && this.board.canPlace(slot.shape, ox, oy);
  }

  /**
   * Attempt to place a hand piece. On success: mutates the board, refills the hand if
   * empty, updates score/combo, and checks for game over.
   * @returns {null | {
   *   placedCells: number[][], clearedCells: {x:number,y:number,color:string}[],
   *   rows:number[], cols:number[], lines:number, combo:number, points:number,
   *   gameOver:boolean
   * }}
   */
  placeAt(handIndex, ox, oy) {
    const slot = this.hand[handIndex];
    if (!slot || !this.board.canPlace(slot.shape, ox, oy)) return null;

    this.board.place(slot.shape, ox, oy, slot.color);
    this.hand[handIndex] = null;

    const placedCells = slot.shape.cells.map(([cx, cy]) => [ox + cx, oy + cy]);

    let points = placementPoints(slot.shape);
    let clearedCells = [];

    const { rows, cols } = this.board.fullLines();
    const lines = rows.length + cols.length;

    if (lines > 0) {
      this.combo += 1;
      if (this.combo > this.bestCombo) this.bestCombo = this.combo;
      clearedCells = this._collectLineCells(rows, cols); // capture colors BEFORE clearing
      points += lineClearPoints(lines, this.combo);
      this.board.clearLines(rows, cols);
    } else {
      this.combo = 0;
    }

    this.score += points;

    // Refill the hand once all three slots are used.
    if (this.hand.every((s) => s === null)) this.dealHand();

    if (!this.hasAnyMove()) this.status = GameStatus.GAME_OVER;

    return {
      placedCells,
      clearedCells,
      rows,
      cols,
      lines,
      combo: this.combo,
      points,
      gameOver: this.status === GameStatus.GAME_OVER,
    };
  }

  /** Is there at least one legal placement for some piece currently in hand? */
  hasAnyMove() {
    return this.hand.some((slot) => slot && this._canPlaceAnywhere(slot.shape));
  }

  _canPlaceAnywhere(shape) {
    const maxX = this.size - shape.width;
    const maxY = this.size - shape.height;
    for (let oy = 0; oy <= maxY; oy++) {
      for (let ox = 0; ox <= maxX; ox++) {
        if (this.board.canPlace(shape, ox, oy)) return true;
      }
    }
    return false;
  }

  /** Union of all cells in the given full rows/columns, with their colors, de-duplicated. */
  _collectLineCells(rows, cols) {
    const map = new Map();
    const add = (x, y) => map.set(`${x},${y}`, { x, y, color: this.board.grid[y][x] });
    for (const y of rows) for (let x = 0; x < this.size; x++) add(x, y);
    for (const x of cols) for (let y = 0; y < this.size; y++) add(x, y);
    return [...map.values()];
  }
}
