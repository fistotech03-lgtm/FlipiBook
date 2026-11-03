/**
 * HistoryStack.js
 * Dual-Stack (Undo / Redo) Data Structure with capacity bounding
 *
 * Provides:
 * - O(1) push of new state snapshots
 * - O(1) undo and redo navigation
 * - Memory bounds via fixed maxCapacity
 * - State change listeners
 */

export class HistoryStack {
  constructor(maxCapacity = 30) {
    this.maxCapacity = Math.max(2, maxCapacity);
    this.undoStack = [];
    this.redoStack = [];
    this.currentState = null;
  }

  /**
   * Initializes or sets the base state
   */
  init(initialState) {
    this.currentState = initialState;
    this.undoStack = [];
    this.redoStack = [];
  }

  /**
   * Pushes a new state in O(1)
   */
  push(newState) {
    if (this.currentState !== null) {
      this.undoStack.push(this.currentState);
      if (this.undoStack.length > this.maxCapacity) {
        this.undoStack.shift(); // Evict oldest
      }
    }
    this.currentState = newState;
    this.redoStack = []; // Clear redo branch on new action
  }

  /**
   * Reverts to the previous state in O(1)
   */
  undo() {
    if (!this.canUndo()) return null;

    this.redoStack.push(this.currentState);
    this.currentState = this.undoStack.pop();
    return this.currentState;
  }

  /**
   * Reapplies the next state in O(1)
   */
  redo() {
    if (!this.canRedo()) return null;

    this.undoStack.push(this.currentState);
    this.currentState = this.redoStack.pop();
    return this.currentState;
  }

  canUndo() {
    return this.undoStack.length > 0;
  }

  canRedo() {
    return this.redoStack.length > 0;
  }

  getCurrent() {
    return this.currentState;
  }

  clear() {
    this.undoStack = [];
    this.redoStack = [];
    this.currentState = null;
  }
}

export default HistoryStack;
