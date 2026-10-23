/**
 * CircularBuffer.js
 * Circular Doubly-Navigable Data Structure for Infinite Carousels & Slideshows
 *
 * Provides:
 * - O(1) next() and prev() navigation with wraparound
 * - O(1) neighbor lookups (left, active, right) for 3D coverflow & slider animations
 * - In-place array permutation / reordering
 * - Safe boundary handling
 */

export class CircularBuffer {
  constructor(items = [], initialIndex = 0) {
    this.items = Array.isArray(items) ? [...items] : [];
    this.activeIndex = this.clampIndex(initialIndex);
  }

  /**
   * Modulo arithmetic for safe cyclic index wrapping
   */
  clampIndex(idx) {
    if (this.items.length === 0) return 0;
    const len = this.items.length;
    return ((idx % len) + len) % len;
  }

  /**
   * Advances pointer to next slide in O(1)
   */
  next() {
    if (this.items.length <= 1) return this.current();
    this.activeIndex = this.clampIndex(this.activeIndex + 1);
    return this.current();
  }

  /**
   * Moves pointer to previous slide in O(1)
   */
  prev() {
    if (this.items.length <= 1) return this.current();
    this.activeIndex = this.clampIndex(this.activeIndex - 1);
    return this.current();
  }

  /**
   * Returns currently active item in O(1)
   */
  current() {
    return this.items[this.activeIndex] || null;
  }

  /**
   * Returns active index
   */
  getIndex() {
    return this.activeIndex;
  }

  /**
   * Sets active index safely with modulo clamping
   */
  setIndex(idx) {
    this.activeIndex = this.clampIndex(idx);
    return this.current();
  }

  /**
   * Returns neighbor items around the active pointer in O(1)
   * Perfect for 3D Coverflow (Left, Center, Right)
   */
  getNeighbors() {
    if (this.items.length === 0) {
      return { prev: null, current: null, next: null };
    }
    const prevIdx = this.clampIndex(this.activeIndex - 1);
    const nextIdx = this.clampIndex(this.activeIndex + 1);

    return {
      prev: this.items[prevIdx],
      prevIndex: prevIdx,
      current: this.items[this.activeIndex],
      currentIndex: this.activeIndex,
      next: this.items[nextIdx],
      nextIndex: nextIdx,
    };
  }

  /**
   * Reorders an item from one index to another in-place in O(N)
   */
  reorder(fromIndex, toIndex) {
    if (
      fromIndex < 0 ||
      fromIndex >= this.items.length ||
      toIndex < 0 ||
      toIndex >= this.items.length ||
      fromIndex === toIndex
    ) {
      return false;
    }

    const [movedItem] = this.items.splice(fromIndex, 1);
    this.items.splice(toIndex, 0, movedItem);

    // Keep activeIndex tracking the correct element
    if (this.activeIndex === fromIndex) {
      this.activeIndex = toIndex;
    } else if (fromIndex < this.activeIndex && toIndex >= this.activeIndex) {
      this.activeIndex -= 1;
    } else if (fromIndex > this.activeIndex && toIndex <= this.activeIndex) {
      this.activeIndex += 1;
    }

    return true;
  }

  /**
   * Inserts an item at specific index
   */
  insert(item, atIndex = null) {
    const insertIdx = atIndex !== null && atIndex >= 0 && atIndex <= this.items.length
      ? atIndex
      : this.items.length;
    this.items.splice(insertIdx, 0, item);
    return this.items.length;
  }

  /**
   * Removes an item by index
   */
  remove(index) {
    if (index < 0 || index >= this.items.length) return null;
    const [removed] = this.items.splice(index, 1);
    this.activeIndex = this.clampIndex(this.activeIndex);
    return removed;
  }

  size() {
    return this.items.length;
  }

  toArray() {
    return [...this.items];
  }
}

export default CircularBuffer;
