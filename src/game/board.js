// src/game/board.js
// The 8×8 playing grid: occupancy, placement validation, line detection & clearing.
// Pure module: no DOM, no rendering.

export class Board {
  constructor(size = 8) {
    this.size = size;
    /** @type {(string|null)[][]} grid[y][x] — a color string when filled, else null. */
    this.grid = [];
    this.reset();
  }

  reset() {
    this.grid = Array.from({ length: this.size }, () => new Array(this.size).fill(null));
  }

  inBounds(x, y) {
    return x >= 0 && y >= 0 && x < this.size && y < this.size;
  }

  isFree(x, y) {
    return this.inBounds(x, y) && this.grid[y][x] === null;
  }

  isEmpty() {
    return this.grid.every((row) => row.every((cell) => cell === null));
  }

  /**
   * Can `shape` be placed with its bounding-box top-left at (ox, oy)?
   * Every shape cell must land on an in-bounds, empty cell.
   */
  canPlace(shape, ox, oy) {
    for (const [cx, cy] of shape.cells) {
      if (!this.isFree(ox + cx, oy + cy)) return false;
    }
    return true;
  }

  /** Write `value` into every cell the shape covers. Assumes canPlace() already passed. */
  place(shape, ox, oy, value) {
    for (const [cx, cy] of shape.cells) {
      this.grid[oy + cy][ox + cx] = value;
    }
  }

  /** @returns {{rows: number[], cols: number[]}} indices of fully-filled rows/columns. */
  fullLines() {
    const rows = [];
    const cols = [];
    for (let y = 0; y < this.size; y++) {
      if (this.grid[y].every((cell) => cell !== null)) rows.push(y);
    }
    for (let x = 0; x < this.size; x++) {
      let full = true;
      for (let y = 0; y < this.size; y++) {
        if (this.grid[y][x] === null) { full = false; break; }
      }
      if (full) cols.push(x);
    }
    return { rows, cols };
  }

  /** Empty the given rows and columns. @returns {number} cells cleared. */
  clearLines(rows, cols) {
    let cleared = 0;
    for (const y of rows) {
      for (let x = 0; x < this.size; x++) {
        if (this.grid[y][x] !== null) { this.grid[y][x] = null; cleared++; }
      }
    }
    for (const x of cols) {
      for (let y = 0; y < this.size; y++) {
        if (this.grid[y][x] !== null) { this.grid[y][x] = null; cleared++; }
      }
    }
    return cleared;
  }
}
