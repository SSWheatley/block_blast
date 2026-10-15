// src/input.js
// Pointer-based drag & drop. Mouse, touch, and pen all share one code path.
// Reads geometry from the shared layout and validates moves against the Game.

/**
 * @param {object} deps
 * @param {HTMLCanvasElement} deps.canvas
 * @param {() => object} deps.getLayout  returns the current layout (or null)
 * @param {() => import('./game/state.js').Game} deps.getGame
 * @param {(result: object) => void} deps.onPlace  called with placeAt()'s result on a valid drop
 * @returns {{ get drag(): null | object }}
 */
export function createInput({ canvas, getLayout, getGame, onPlace }) {
  /** @type {null | {handIndex:number, shape:object, color:string, pointerId:number,
   *   originX:number, originY:number, col:number, row:number, valid:boolean, isTouch:boolean}} */
  let drag = null;
  let activePointerId = null;

  function toLocal(e) {
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function slotAt(point, layout) {
    for (const slot of layout.hand.slots) {
      const left = slot.cx - slot.w / 2;
      const top = slot.cy - slot.h / 2;
      if (point.x >= left && point.x <= left + slot.w && point.y >= top && point.y <= top + slot.h) {
        return slot.index;
      }
    }
    return -1;
  }

  /** Recompute where the dragged piece would land and whether that's legal. */
  function computeTarget() {
    const layout = getLayout();
    const game = getGame();
    const b = layout.board;
    let col = Math.round((drag.originX - b.x) / b.cell);
    let row = Math.round((drag.originY - b.y) / b.cell);
    col = Math.max(0, Math.min(game.size - drag.shape.width, col));
    row = Math.max(0, Math.min(game.size - drag.shape.height, row));
    drag.col = col;
    drag.row = row;
    drag.valid = game.canPlace(drag.handIndex, col, row);
  }

  /** Position the floating piece so it follows the pointer (lifted above a finger). */
  function positionDrag(point) {
    const cell = getLayout().board.cell;
    const pw = drag.shape.width * cell;
    const ph = drag.shape.height * cell;
    drag.originX = point.x - pw / 2;
    drag.originY = drag.isTouch ? point.y - ph - cell * 0.6 : point.y - ph / 2;
    computeTarget();
  }

  function endDrag() {
    if (drag && canvas.hasPointerCapture?.(drag.pointerId)) {
      canvas.releasePointerCapture(drag.pointerId);
    }
    drag = null;
    activePointerId = null;
  }

  function onPointerDown(e) {
    if (drag || activePointerId !== null) return;
    const layout = getLayout();
    if (!layout) return;

    const point = toLocal(e);
    const handIndex = slotAt(point, layout);
    if (handIndex < 0) return;
    const piece = getGame().hand[handIndex];
    if (!piece) return;

    drag = {
      handIndex,
      shape: piece.shape,
      color: piece.color,
      pointerId: e.pointerId,
      originX: 0,
      originY: 0,
      col: 0,
      row: 0,
      valid: false,
      isTouch: e.pointerType === 'touch',
    };
    positionDrag(point);
    activePointerId = e.pointerId;
    canvas.setPointerCapture?.(e.pointerId);
    e.preventDefault();
  }

  function onPointerMove(e) {
    if (!drag || e.pointerId !== activePointerId) return;
    positionDrag(toLocal(e));
    e.preventDefault();
  }

  function onPointerUp(e) {
    if (!drag || e.pointerId !== activePointerId) return;
    const { handIndex, col, row, valid } = drag;
    endDrag();
    if (valid) {
      const result = getGame().placeAt(handIndex, col, row);
      if (result) onPlace(result);
    }
    e.preventDefault();
  }

  function onPointerCancel(e) {
    if (!drag || e.pointerId !== activePointerId) return;
    endDrag();
  }

  canvas.addEventListener('pointerdown', onPointerDown, { passive: false });
  canvas.addEventListener('pointermove', onPointerMove, { passive: false });
  canvas.addEventListener('pointerup', onPointerUp, { passive: false });
  canvas.addEventListener('pointercancel', onPointerCancel, { passive: false });

  return {
    get drag() {
      return drag;
    },
  };
}
