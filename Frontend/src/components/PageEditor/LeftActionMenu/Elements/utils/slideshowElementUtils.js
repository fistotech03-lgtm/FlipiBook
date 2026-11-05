/**
 * slideshowElementUtils.js
 * Clean, standard Swiper.js Slideshow Element utilities for FlipiBook
 * Supports the 5 official Swiper effects: Fade, Cube, Coverflow, Flip, Cards
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import { Icon, getIcon, buildIcon, loadIcon } from '@iconify/react';
import { navIconStyles, getDisplayIcons } from '../popups/NavIconStylesPopup';

// Preload all 12 navigation icon sets from NavIconStylesPopup
if (typeof window !== 'undefined') {
  navIconStyles.forEach((s) => {
    if (s.left) loadIcon(s.left).catch(() => {});
    if (s.right) loadIcon(s.right).catch(() => {});
  });
}

// ============================================================================
// DATA STRUCTURES & ALGORITHMS (DSA) CORE ENGINE FOR SLIDESHOW
// ============================================================================

/**
 * 1. Circular Doubly Linked List (CDLL)
 * Bidirectional node structure for O(1) loop traversal and zero-clone virtualization
 */
export class CDLLNode {
  constructor(data, index = 0) {
    this.data = data;
    this.index = index;
    this.prev = null;
    this.next = null;
  }
}

export class CircularDoublyLinkedList {
  constructor(items = []) {
    this.head = null;
    this.tail = null;
    this.size = 0;
    if (Array.isArray(items) && items.length > 0) {
      items.forEach((item, idx) => this.append(item, idx));
    }
  }

  append(data, index = this.size) {
    const node = new CDLLNode(data, index);
    if (!this.head) {
      this.head = node;
      this.tail = node;
      node.next = node;
      node.prev = node;
    } else {
      node.prev = this.tail;
      node.next = this.head;
      this.tail.next = node;
      this.head.prev = node;
      this.tail = node;
    }
    this.size++;
    return node;
  }

  getNodeAt(index) {
    if (this.size === 0) return null;
    const targetIdx = RingBuffer.canonicalIndex(index, this.size);
    let curr = this.head;
    for (let i = 0; i < targetIdx; i++) {
      curr = curr.next;
    }
    return curr;
  }

  /**
   * Generates a circular sequence of exactly `targetCount` items in O(K) time
   */
  getCircularSequence(targetCount) {
    if (this.size === 0 || targetCount <= 0) return [];
    const result = [];
    let curr = this.head;
    for (let i = 0; i < targetCount; i++) {
      result.push({ ...curr.data, _cdllIndex: curr.index });
      curr = curr.next;
    }
    return result;
  }

  toArray() {
    if (this.size === 0) return [];
    const arr = [];
    let curr = this.head;
    for (let i = 0; i < this.size; i++) {
      arr.push(curr.data);
      curr = curr.next;
    }
    return arr;
  }
}

/**
 * 2. Sliding Window via Deque (Double-Ended Queue)
 * O(1) push and pop on both ends for virtualized slide window
 */
export class Deque {
  constructor(maxCapacity = 5) {
    this.items = [];
    this.capacity = maxCapacity;
  }

  pushBack(item) {
    this.items.push(item);
    if (this.items.length > this.capacity) {
      this.items.shift();
    }
  }

  pushFront(item) {
    this.items.unshift(item);
    if (this.items.length > this.capacity) {
      this.items.pop();
    }
  }

  popFront() {
    return this.items.shift();
  }

  popBack() {
    return this.items.pop();
  }

  peekFront() {
    return this.items[0];
  }

  peekBack() {
    return this.items[this.items.length - 1];
  }

  toArray() {
    return [...this.items];
  }

  size() {
    return this.items.length;
  }
}

/**
 * 3. LRU (Least Recently Used) Texture & Render Cache
 * Keeps decoded bitmaps and HTML fragments bounded in O(1) time
 */
export class LRUCache {
  constructor(capacity = 40) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  get(key) {
    if (!this.cache.has(key)) return null;
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  put(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      const oldestKey = this.cache.keys().next().value;
      const oldestVal = this.cache.get(oldestKey);
      if (oldestVal && typeof oldestVal === 'string' && oldestVal.startsWith('blob:')) {
        try { URL.revokeObjectURL(oldestVal); } catch (_) {}
      }
      this.cache.delete(oldestKey);
    }
    this.cache.set(key, value);
  }

  has(key) {
    return this.cache.has(key);
  }

  clear() {
    for (const [, val] of this.cache.entries()) {
      if (val && typeof val === 'string' && val.startsWith('blob:')) {
        try { URL.revokeObjectURL(val); } catch (_) {}
      }
    }
    this.cache.clear();
  }
}

export const slideshowLRUCache = new LRUCache(50);

/**
 * 4. Modular Ring Buffer Arithmetic
 * Guarantees zero off-by-one errors and canonical shortest circular path
 */
export const RingBuffer = {
  canonicalIndex(i, length) {
    if (!length || length <= 0) return 0;
    return ((i % length) + length) % length;
  },

  shortestPath(fromIdx, toIdx, length) {
    if (!length || length <= 1) return { distance: 0, direction: 'next' };
    const cFrom = RingBuffer.canonicalIndex(fromIdx, length);
    const cTo = RingBuffer.canonicalIndex(toIdx, length);
    const forwardDist = (cTo - cFrom + length) % length;
    const backwardDist = (cFrom - cTo + length) % length;

    if (forwardDist <= backwardDist) {
      return { distance: forwardDist, direction: 'next' };
    } else {
      return { distance: backwardDist, direction: 'prev' };
    }
  }
};

/**
 * 5. RAF Throttler (Leaky Bucket Event Scheduler)
 * Locks rapid click/touch updates to the 60fps/120fps display refresh cycle
 */
export class RAFThrottler {
  constructor(callback) {
    this.callback = callback;
    this.ticking = false;
    this.lastArgs = null;
  }

  trigger(...args) {
    this.lastArgs = args;
    if (!this.ticking) {
      this.ticking = true;
      requestAnimationFrame(() => {
        this.ticking = false;
        if (this.callback && this.lastArgs) {
          this.callback(...this.lastArgs);
        }
      });
    }
  }

  cancel() {
    this.ticking = false;
    this.lastArgs = null;
  }
}

/**
 * Generates an offline vector placeholder thumbnail using code (zero external network dependencies)
 */
export const createDefaultPlaceholderDataUrl = (slideNum, bgGradStart, bgGradEnd, title) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400">
    <defs>
      <linearGradient id="g_${slideNum}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bgGradStart}"/>
        <stop offset="100%" stop-color="${bgGradEnd}"/>
      </linearGradient>
    </defs>
    <rect width="640" height="400" fill="url(#g_${slideNum})"/>
    <g fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" transform="translate(284, 130) scale(1.8)">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </g>
    <text x="320" y="235" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="700" fill="white" text-anchor="middle" letter-spacing="0.5">${title || `Slide ${slideNum}`}</text>
    <text x="320" y="265" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="500" fill="white" fill-opacity="0.8" text-anchor="middle">Click or drag in properties to customize</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

export const defaultSampleImages = [
  {
    id: 1,
    url: createDefaultPlaceholderDataUrl(1, '#4f46e5', '#3b82f6', 'Slide 1'),
    name: 'Slide 1',
    heading: 'Welcome to FlipiBook',
    subtext: 'Add your headings and descriptions here'
  },
  {
    id: 2,
    url: createDefaultPlaceholderDataUrl(2, '#0d9488', '#10b981', 'Slide 2'),
    name: 'Slide 2',
    heading: 'Showcase Your Work',
    subtext: 'High-resolution images and smooth transitions'
  },
  {
    id: 3,
    url: createDefaultPlaceholderDataUrl(3, '#f59e0b', '#f43f5e', 'Slide 3'),
    name: 'Slide 3',
    heading: 'Interactive Digital Reading',
    subtext: 'Share with clients or publish anywhere'
  }
];

export const defaultSlideshowSettings = {
  autoPlay: false,
  speed: 3,
  infiniteLoop: true,
  showArrows: true,
  showDots: true,
  imageFitType: 'Fill All',
  transitionEffect: 'Coverflow',
  dragToSlide: false,
  dotColor: '#3b82f6',
  dotOpacity: 100,
  dotStyle: 1,
  dotButtonSize: 70,
  navIconColor: '#ffffff',
  navIconOpacity: 100,
  navStyle: 1,
  navButtonSize: 70,
  autoSlide: false,
  bgColor: 'none',
  bgOpacity: 100,
  strokeColor: 'none',
  strokeOpacity: 100,
  strokeAlignment: 'Outside',
  strokeWidth: 0,
  strokeLineStyle: 'Solid',
  strokeDashLength: 8,
  strokeDashGap: 4,
  strokeLineCorner: 'Square',
};

export const escapeXml = (str) => {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

export const getNavIconSvg = (styleId = 1, direction = 'left') => {
  const isLeft = direction === 'left';
  const id = Number(styleId) || 1;

  switch (id) {
    case 1:
      // lucide:chevron-left / lucide:chevron-right
      return isLeft
        ? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>'
        : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>';

    case 2:
      // ion:arrow-back-circle / ion:arrow-forward-circle
      return isLeft
        ? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%"><path fill="currentColor" d="M256 48C141.13 48 48 141.13 48 256s93.13 208 208 208s208-93.13 208-208S370.87 48 256 48m35.31 292.69a16 16 0 1 1-22.62 22.62l-96-96a16 16 0 0 1 0-22.62l96-96a16 16 0 0 1 22.62 22.62L214.63 256Z"/></svg>'
        : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%"><path fill="currentColor" d="M256 48C141.13 48 48 141.13 48 256s93.13 208 208 208s208-93.13 208-208S370.87 48 256 48m-35.31 292.69L297.37 256l-76.68-84.69a16 16 0 0 1 22.62-22.62l96 96a16 16 0 0 1 0 22.62l-96 96a16 16 0 0 1-22.62-22.62"/></svg>';

    case 3:
      // material-symbols:arrow-left-rounded / material-symbols:arrow-right-rounded
      return isLeft
        ? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="100%" height="100%"><path fill="currentColor" d="m10.825 12l2.9 2.9q.275.275.275.7t-.275.7t-.7.275t-.7-.275l-3.6-3.6q-.15-.15-.213-.325T8.65 12t.063-.375t.212-.325l3.6-3.6q.275-.275.7-.275t.7.275t.275.7t-.275.7z"/></svg>'
        : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="100%" height="100%"><path fill="currentColor" d="M13.175 12l-2.9-2.9q-.275-.275-.275-.7t.275-.7t.7-.275t.7.275l3.6 3.6q.15.15.213.325t.062.375t-.062.375t-.213.325l-3.6 3.6q-.275.275-.7.275t-.7-.275t-.275-.7t.275-.7z"/></svg>';

    case 4:
      // material-symbols:chevron-left-rounded / material-symbols:chevron-right-rounded
      return isLeft
        ? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="100%" height="100%"><path fill="currentColor" d="m10.825 12l4.9 4.9q.275.275.263.7t-.288.7q-.275.275-.7.275t-.7-.275l-5.6-5.6q-.15-.15-.213-.325T8.425 12t.063-.375t.212-.325l5.6-5.6q.275-.275.7-.275t.7.275q.275.275.275.7t-.275.7z"/></svg>'
        : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="100%" height="100%"><path fill="currentColor" d="M13.175 12l-4.9-4.9q-.275-.275-.263-.7t.288-.7q.275-.275.7-.275t.7.275l5.6 5.6q.15.15.213.325t.062.375t-.062.375t-.213.325l-5.6 5.6q-.275.275-.7.275t-.7-.275q-.275-.275-.275-.7t.275-.7z"/></svg>';

    case 5:
      // ph:caret-left-bold / ph:caret-right-bold
      return isLeft
        ? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="100%" height="100%"><path fill="currentColor" d="M168.49 199.51a12 12 0 0 1-17 17l-80-80a12 12 0 0 1 0-17l80-80a12 12 0 0 1 17 17L97 128Z"/></svg>'
        : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="100%" height="100%"><path fill="currentColor" d="M184.49 136.49l-80 80a12 12 0 0 1-17-17L159 128 87.51 56.49a12 12 0 1 1 17-17l80 80a12 12 0 0 1 0 17Z"/></svg>';

    case 6:
      // material-symbols:arrow-circle-left-outline-rounded / arrow-circle-right-outline-rounded
      return isLeft
        ? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="100%" height="100%"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8s8 3.59 8 8s-3.59 8-8 8zm1.71-13.71a.996.996 0 0 0-1.41 0L8.71 11.3a.996.996 0 0 0 0 1.41l3.59 3.59a.996.996 0 1 0 1.41-1.41L10.83 12l2.88-2.88c.39-.39.39-1.02 0-1.41z"/></svg>'
        : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="100%" height="100%"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8s8 3.59 8 8s-3.59 8-8 8zm-1.71-5.71a.996.996 0 0 0 1.41 0l3.59-3.59a.996.996 0 0 0 0-1.41l-3.59-3.59a.996.996 0 1 0-1.41 1.41L13.17 12l-2.88 2.88c-.39.39-.39 1.02 0 1.41z"/></svg>';

    case 7:
      // fluent:arrow-left-20-regular / fluent:arrow-right-20-regular
      return isLeft
        ? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width="100%" height="100%"><path fill="currentColor" d="M12.854 4.146a.5.5 0 0 1 0 .708L7.707 10l5.147 5.146a.5.5 0 0 1-.708.708l-5.5-5.5a.5.5 0 0 1 0-.708l5.5-5.5a.5.5 0 0 1 .708 0"/></svg>'
        : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width="100%" height="100%"><path fill="currentColor" d="M7.146 4.146a.5.5 0 0 1 .708 0l5.5 5.5a.5.5 0 0 1 0 .708l-5.5 5.5a.5.5 0 0 1-.708-.708L12.293 10L7.146 4.854a.5.5 0 0 1 0-.708"/></svg>';

    case 8:
      // solar:round-arrow-left-bold / solar:round-arrow-right-bold
      return isLeft
        ? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="100%"><path fill="currentColor" fill-rule="evenodd" d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2S2 6.477 2 12s4.477 10 10 10m.707-13.707a1 1 0 0 0-1.414 0l-3 3a1 1 0 0 0 0 1.414l3 3a1 1 0 0 0 1.414-1.414L11.414 13H15a1 1 0 1 0 0-2h-3.586l1.293-1.293a1 1 0 0 0 0-1.414" clip-rule="evenodd"/></svg>'
        : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="100%"><path fill="currentColor" fill-rule="evenodd" d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2S2 6.477 2 12s4.477 10 10 10m-.707-13.707a1 1 0 0 1 1.414 0l3 3a1 1 0 0 1 0 1.414l-3 3a1 1 0 0 1-1.414-1.414L12.586 13H9a1 1 0 1 1 0-2h3.586l-1.293-1.293a1 1 0 0 1 0-1.414" clip-rule="evenodd"/></svg>';

    case 9:
      // ic:baseline-arrow-left / ic:baseline-arrow-right
      return isLeft
        ? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="100%" height="100%"><path fill="currentColor" d="m14 7l-5 5l5 5z"/></svg>'
        : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="100%" height="100%"><path fill="currentColor" d="m10 17l5-5l-5-5z"/></svg>';

    case 10:
      // mdi:chevron-left-box / mdi:chevron-right-box
      return isLeft
        ? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="100%"><path fill="currentColor" d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2m-3.71 12.29a1 1 0 0 1-1.41 1.42L9.17 12l4.71-4.71a1 1 0 1 1 1.41 1.42L11.99 12z"/></svg>'
        : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="100%"><path fill="currentColor" d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2m3.71 12.29L12.01 12L8.71 8.71a1 1 0 1 1 1.41-1.42L14.83 12l-4.71 4.71a1 1 0 0 1-1.41-1.42"/></svg>';

    case 11:
      // mdi:arrow-left-box / mdi:arrow-right-box
      return isLeft
        ? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="100%"><path fill="currentColor" d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2m-3 10h-4.8l2.9 2.9l-1.4 1.4l-5.3-5.3l5.3-5.3l1.4 1.4l-2.9 2.9H16z"/></svg>'
        : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="100%"><path fill="currentColor" d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2m3 10h4.8l-2.9 2.9l1.4 1.4l5.3-5.3l-5.3-5.3l-1.4 1.4l2.9 2.9H8z"/></svg>';

    case 12:
      // lucide:arrow-left / lucide:arrow-right
      return isLeft
        ? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>'
        : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>';

    default:
      return isLeft
        ? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>'
        : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>';
  }
};

/**
 * Mounts the exact Iconify React icon into a navigation button container
 * with bit-for-bit parity with NavIconStylesPopup.jsx
 */
export function renderNavIconToButton(buttonEl, styleId = 1, direction = 'left', color = 'currentColor') {
  if (!buttonEl) return;
  const rawStyle = navIconStyles.find(s => s.id === Number(styleId)) || navIconStyles[0];
  const style = getDisplayIcons ? getDisplayIcons(rawStyle) : rawStyle;
  const iconName = direction === 'left' ? style.left : style.right;

  try {
    if (!buttonEl._iconRoot) {
      buttonEl._iconRoot = createRoot(buttonEl);
    }
    buttonEl._iconRoot.render(
      React.createElement(Icon, {
        icon: iconName,
        style: {
          width: '100%',
          height: '100%',
          display: 'block',
          color: color || 'currentColor'
        }
      })
    );
  } catch (e) {
    buttonEl.innerHTML = getNavIconSvg(styleId, direction);
  }
}

export const isElementSlideshow = (el) => {
  if (!el || typeof el.getAttribute !== 'function') return false;
  return (
    el.getAttribute('data-type') === 'slideshow' ||
    el.getAttribute('data-is-slideshow') === 'true' ||
    (typeof el.getAttribute('id') === 'string' && el.getAttribute('id').startsWith('slideshow-'))
  );
};

export const SLIDESHOW_PRESET_CONFIGS = {
  coverflow: {
    transitionEffect: 'Coverflow',
    bgColor: 'none',
    strokeColor: 'none',
    strokeLineCorner: 'Square',
    dotColor: '#4D47FF',
    navIconColor: '#ffffff'
  },
  cards: {
    transitionEffect: 'Cards',
    bgColor: 'none',
    strokeColor: 'none',
    strokeLineCorner: 'Square',
    dotColor: '#4D47FF',
    navIconColor: '#ffffff'
  },
  cube: {
    transitionEffect: 'Cube',
    bgColor: 'none',
    strokeColor: 'none',
    strokeLineCorner: 'Square',
    dotColor: '#4D47FF',
    navIconColor: '#ffffff'
  },
  flip: {
    transitionEffect: 'Flip',
    bgColor: 'none',
    strokeColor: 'none',
    strokeLineCorner: 'Square',
    dotColor: '#4D47FF',
    navIconColor: '#ffffff'
  },
  fade: {
    transitionEffect: 'Fade',
    bgColor: 'none',
    strokeColor: 'none',
    strokeLineCorner: 'Square',
    dotColor: '#4D47FF',
    navIconColor: '#ffffff'
  }
};

/**
 * Helper to ensure sufficient slides for seamless Swiper infinite looping (satisfies Swiper's loop buffer requirement)
 * Powered by Circular Doubly Linked List (CDLL) for zero-allocation O(1) circular sequencing
 */
export const getSlidesForLoop = (images = [], isLoop = true) => {
  const baseList = (images && images.length > 0) ? images : defaultSampleImages;
  if (!isLoop || baseList.length <= 1) return baseList;
  // Swiper's loopFix requires at least (slidesPerView + loopedSlides * 2) slides.
  // For centered Coverflow & Cards with dynamic slidesPerView, this requires at least 18 slides.
  const minRequiredSlides = 18;
  if (baseList.length < minRequiredSlides) {
    const cdll = new CircularDoublyLinkedList(baseList);
    const repeatCount = Math.ceil(minRequiredSlides / baseList.length);
    return cdll.getCircularSequence(repeatCount * baseList.length);
  }
  return baseList;
};

/**
 * Generates the Swiper slide HTML items with seamless loop support
 * Powered by LRU Cache (Least Recently Used) for instant O(1) template memoization
 */
export const renderSwiperSlidesHtml = (images = [], isLoop = true) => {
  const baseList = (images && images.length > 0) ? images : defaultSampleImages;
  const list = getSlidesForLoop(baseList, isLoop);

  return list.map((img, i) => {
    const realIdx = RingBuffer.canonicalIndex(i, baseList.length);
    const url = img?.url || '';
    const heading = img?.heading || '';
    const subtext = img?.subtext || '';
    const textColor = img?.textColor || '#ffffff';
    const fFam = img?.fontFamily || "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    const fSize = Number(img?.fontSize) || 13;
    const fit = img?.fixType === 'Fit' || img?.fixType === 'Fit All' ? 'contain' : (img?.fixType === 'Stretch' ? 'fill' : 'cover');

    // DSA: Check LRU Cache for rendered slide template
    const cacheKey = `slide_${img?.id || realIdx}_${url}_${heading}_${subtext}_${textColor}_${fSize}_${fit}`;
    const cachedHtml = slideshowLRUCache.get(cacheKey);
    if (cachedHtml) {
      return cachedHtml;
    }

    const slideHtml = `
      <div class="swiper-slide" data-slide-index="${realIdx}">
        <img src="${escapeXml(url)}" alt="${escapeXml(img.name || `Slide ${realIdx + 1}`)}" style="width: 100%; height: 100%; object-fit: ${fit}; display: block; border-radius: inherit;" />
        ${(heading || subtext) ? `
          <div class="swiper-slide-caption" style="position: absolute; bottom: 0; left: 0; right: 0; padding: 6px 14px 28px 14px; background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 65%, transparent 100%); color: ${textColor}; text-align: center; pointer-events: none; font-family: ${fFam};">
            ${heading ? `<div class="caption-heading" style="font-weight: 700; font-size: ${fSize}px; text-shadow: 0 1px 3px rgba(0,0,0,0.95);">${escapeXml(heading)}</div>` : ''}
            ${subtext ? `<div class="caption-subtext" style="font-size: ${Math.max(9, Math.round(fSize * 0.75))}px; opacity: 0.85; margin-top: 2px; text-shadow: 0 1px 2px rgba(0,0,0,0.95); font-weight: 500;">${escapeXml(subtext)}</div>` : ''}
          </div>
        ` : ''}
      </div>
    `.trim();

    slideshowLRUCache.put(cacheKey, slideHtml);
    return slideHtml;
  }).join('');
};

/**
 * Standard Slideshow SVG supporting pure official Swiper.js
 */
export const getBannerSliderSvg = (uniqueId = Date.now(), transformAttr = '', customSettings = {}) => {
  const mergedSettings = { ...defaultSlideshowSettings, ...customSettings };
  const effect = (mergedSettings.transitionEffect || 'Coverflow').toLowerCase();
  const dataJson = escapeXml(JSON.stringify({ settings: mergedSettings, images: defaultSampleImages }));
  const slidesHtml = renderSwiperSlidesHtml(defaultSampleImages, mergedSettings.infiniteLoop !== false);

  const cornerR = mergedSettings.strokeLineCorner === 'Square' ? 0 : 10;
  const navScale = Math.max(0.5, Math.min(2.0, (mergedSettings.navButtonSize ?? 70) / 100));
  const dotScale = Math.max(0.5, Math.min(2.0, (mergedSettings.dotButtonSize ?? 70) / 100));
  const dotOpacity = (mergedSettings.dotOpacity !== undefined ? mergedSettings.dotOpacity : 100) / 100;
  const navOpacity = (mergedSettings.navIconOpacity !== undefined ? mergedSettings.navIconOpacity : 100) / 100;
  const navStyle = mergedSettings.navStyle || 1;
  const dotStyle = mergedSettings.dotStyle || 1;
  const showArrows = mergedSettings.showArrows !== false && mergedSettings.showNav !== false;
  const showDots = mergedSettings.showDots !== false;

  return `
    <g id="slideshow-${uniqueId}" data-name="Slideshow" data-type="slideshow" data-is-slideshow="true" data-style="${effect}" data-active-index="0" data-slideshow="${dataJson}" cursor="pointer" ${transformAttr}>
      <!-- Background & Border Frame -->
      <rect class="slideshow-container-bg" x="0" y="0" width="320" height="200" rx="${cornerR}" fill="${(mergedSettings.bgColor && mergedSettings.bgColor !== 'none' && mergedSettings.bgColor !== 'transparent') ? mergedSettings.bgColor : 'none'}" stroke="${(mergedSettings.strokeColor && mergedSettings.strokeColor !== 'none' && mergedSettings.strokeColor !== 'transparent') ? mergedSettings.strokeColor : 'none'}" stroke-width="${mergedSettings.strokeWidth || 0}" />
      
      <!-- Bounding Box Anchor for Canvas Transform Engine -->
      <rect class="bbox-anchor" x="0" y="0" width="320" height="200" fill="transparent" pointer-events="none" />

      <!-- Official Swiper Container Embedded via foreignObject -->
      <foreignObject class="slideshow-foreign-object" x="0" y="0" width="320" height="200" style="overflow: hidden; border-radius: ${cornerR}px; pointer-events: auto;">
        <div xmlns="http://www.w3.org/1999/xhtml" class="swiper flipibook-swiper-container swiper-effect-${effect} ${!showArrows ? 'hide-nav-arrows' : ''} ${!showDots ? 'hide-pagination-dots' : ''}" data-nav-style="${navStyle}" data-dot-style="${dotStyle}" style="width: 100%; height: 100%; position: relative; border-radius: inherit; overflow: hidden; --swiper-theme-color: ${mergedSettings.dotColor || '#3b82f6'}; --swiper-pagination-color: ${mergedSettings.dotColor || '#3b82f6'}; --swiper-navigation-color: ${mergedSettings.navIconColor || '#ffffff'}; --swiper-navigation-size: ${Math.round(20 * navScale)}px; --nav-scale: ${navScale}; --dot-scale: ${dotScale}; --dot-opacity: ${dotOpacity}; --nav-opacity: ${navOpacity};">
          <div class="swiper-wrapper">
            ${slidesHtml}
          </div>
          <!-- Swiper Navigation Buttons -->
          <div class="swiper-button-prev" style="${!showArrows ? 'display: none !important;' : 'display: flex !important;'}">${getNavIconSvg(navStyle, 'left')}</div>
          <div class="swiper-button-next" style="${!showArrows ? 'display: none !important;' : 'display: flex !important;'}">${getNavIconSvg(navStyle, 'right')}</div>
          <!-- Swiper Pagination -->
          <div class="swiper-pagination" style="${!showDots ? 'display: none !important;' : ''}"></div>
        </div>
      </foreignObject>
    </g>
  `.trim();
};

// Style-specific SVG generators
export const get3DCoverflowSvg = (id, tf) => getBannerSliderSvg(id, tf, SLIDESHOW_PRESET_CONFIGS.coverflow);
export const get3DStackSvg = (id, tf) => getBannerSliderSvg(id, tf, SLIDESHOW_PRESET_CONFIGS.cards);
export const getFadeshowSvg = (id, tf) => getBannerSliderSvg(id, tf, SLIDESHOW_PRESET_CONFIGS.fade);
export const getMonochromeMinimalSvg = (id, tf) => getBannerSliderSvg(id, tf, SLIDESHOW_PRESET_CONFIGS.cube);
export const getRoundedCardSvg = (id, tf) => getBannerSliderSvg(id, tf, SLIDESHOW_PRESET_CONFIGS.flip);
export const getFilmstripSvg = (id, tf) => getBannerSliderSvg(id, tf, SLIDESHOW_PRESET_CONFIGS.coverflow);
export const getInfiniteCarouselSvg = (id, tf) => getBannerSliderSvg(id, tf, SLIDESHOW_PRESET_CONFIGS.fade);
export const getFlatGallerySvg = (id, tf) => getBannerSliderSvg(id, tf, SLIDESHOW_PRESET_CONFIGS.coverflow);
export const getMinimalLookbookSvg = (id, tf) => getBannerSliderSvg(id, tf, SLIDESHOW_PRESET_CONFIGS.fade);
export const getHeroCaptionSvg = (id, tf) => getBannerSliderSvg(id, tf, SLIDESHOW_PRESET_CONFIGS.coverflow);
export const getThumbnailGallerySvg = (id, tf) => getBannerSliderSvg(id, tf, SLIDESHOW_PRESET_CONFIGS.cards);

export function getSlideshowDimensions(el) {
  if (!el) return { baseW: 320, baseH: 200 };
  const containerBg = el.querySelector(':scope > .slideshow-container-bg') || el.querySelector('.slideshow-container-bg');
  const anchor = el.querySelector(':scope > .bbox-anchor') || el.querySelector('.bbox-anchor');

  let w = containerBg ? parseFloat(containerBg.getAttribute('width') || '0') : 0;
  let h = containerBg ? parseFloat(containerBg.getAttribute('height') || '0') : 0;

  if (!w || !h) {
    w = anchor ? parseFloat(anchor.getAttribute('width') || '0') : 0;
    h = anchor ? parseFloat(anchor.getAttribute('height') || '0') : 0;
  }

  return {
    baseW: Math.max(120, Math.min(2000, w || 320)),
    baseH: Math.max(80, Math.min(1500, h || 200))
  };
}

/**
 * Creates an element DOM node for inserting into the page editor canvas
 */
export function createSlideshowElementNode(styleId = 'coverflow', cx = 200, cy = 150) {
  const uniqueId = Date.now();
  const config = SLIDESHOW_PRESET_CONFIGS[styleId] || SLIDESHOW_PRESET_CONFIGS.coverflow;
  const initialSettings = { ...defaultSlideshowSettings, ...config };
  const svgString = getBannerSliderSvg(uniqueId, '', initialSettings);
  const title = config.transitionEffect ? `${config.transitionEffect} Slideshow` : 'Slideshow';

  const parser = new DOMParser();
  const doc = parser.parseFromString(`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">${svgString}</svg>`, 'image/svg+xml');
  const el = doc.querySelector(`g#slideshow-${uniqueId}`) || doc.firstElementChild?.firstElementChild;
  if (el) {
    el.setAttribute('transform', `translate(${Math.round(cx - 160)}, ${Math.round(cy - 100)})`);
    el.setAttribute('data-name', 'Slideshow');
    el.setAttribute('data-slideshow-title', title);
    el.setAttribute('data-type', 'slideshow');
    el.setAttribute('data-is-slideshow', 'true');
    return document.importNode(el, true);
  }
  return null;
}

/**
 * Swiper Option Config Generator for the 5 official Swiper effects
 */
export const getSwiperConfig = (effectName = 'coverflow', settings = {}, uniqueCount = 3) => {
  const norm = String(effectName || 'coverflow').toLowerCase();
  const speedSec = Number(settings.speed) || 3;
  const loop = settings.infiniteLoop !== false;
  const isAuto = speedSec > 0 && Boolean(settings.autoSlide ?? settings.autoPlay ?? false);
  const realCount = Math.max(1, uniqueCount || 3);

  const baseConfig = {
    grabCursor: false,
    allowTouchMove: false,
    loop: loop,
    loopPreventsSliding: true,
    preventInteractionOnTransition: true,
    loopAddBlankSlides: true,
    loopAdditionalSlides: 2,
    speed: 350,
    autoplay: isAuto ? {
      delay: speedSec * 1000,
      disableOnInteraction: false
    } : false,
    observer: true,
    observeParents: true,
    observeSlideChildren: true,
    resizeObserver: true,
    watchOverflow: false,
    pagination: settings.showDots !== false ? {
      el: '.swiper-pagination',
      clickable: true,
      renderBullet: (index, className) => {
        if (index >= realCount) return '';
        const numText = (settings.dotStyle === 12) ? `${index + 1}` : '';
        return `<span class="${className}">${numText}</span>`;
      }
    } : false,
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
      addIcons: false,
      lockClass: 'swiper-button-never-lock'
    }
  };

  switch (norm) {
    case 'cube':
      return {
        ...baseConfig,
        effect: 'cube',
        slidesPerView: 1,
        cubeEffect: {
          shadow: true,
          slideShadows: true,
          shadowOffset: 20,
          shadowScale: 0.94
        }
      };
    case 'cards':
      return {
        ...baseConfig,
        effect: 'cards',
        slidesPerView: 'auto',
        cardsEffect: {
          slideShadows: true,
          perSlideOffset: 8,
          perSlideRotate: 2
        }
      };
    case 'flip':
      return {
        ...baseConfig,
        effect: 'flip',
        slidesPerView: 1,
        flipEffect: {
          slideShadows: true,
          limitRotation: true
        }
      };
    case 'fade':
      return {
        ...baseConfig,
        effect: 'fade',
        slidesPerView: 1,
        fadeEffect: {
          crossFade: true
        }
      };
    case 'coverflow':
    default:
      return {
        ...baseConfig,
        effect: 'coverflow',
        centeredSlides: true,
        slidesPerView: 'auto',
        coverflowEffect: {
          rotate: 30,
          stretch: 0,
          depth: 100,
          modifier: 1,
          slideShadows: true
        }
      };
  }
};

/**
 * Unified Element Updater for Slideshow with Swiper Sync
 */
export const update3FrameSlideshow = (el, images = [], activeIdx = 0, settings = {}, direction = 1, prevIndex = null) => {
  if (!el) return;
  const len = images.length;
  const centerIndex = len > 0 ? RingBuffer.canonicalIndex(activeIdx, len) : 0;
  const { baseW, baseH } = getSlideshowDimensions(el);
  const effect = (settings.transitionEffect || el.getAttribute('data-style') || 'coverflow').toLowerCase();
  const cornerR = settings.strokeLineCorner === 'Square' ? 0 : 10;

  // 1. Update Container Background & Border (Stroke)
  const containerBg = el.querySelector('.slideshow-container-bg');
  if (containerBg) {
    const sColor = settings.strokeColor;
    const sWidth = settings.strokeWidth !== undefined ? settings.strokeWidth : 1;
    const sOpacity = (settings.strokeOpacity !== undefined ? settings.strokeOpacity : 100) / 100;
    const bgColor = settings.bgColor;
    const bgOpacity = (settings.bgOpacity !== undefined ? settings.bgOpacity : 100) / 100;

    if (bgColor === 'transparent' || bgColor === 'none' || bgOpacity === 0) {
      containerBg.setAttribute('fill', 'none');
    } else if (bgColor) {
      containerBg.setAttribute('fill', bgColor);
      containerBg.setAttribute('fill-opacity', bgOpacity.toString());
    }

    if (sColor === 'transparent' || sColor === 'none' || sWidth === 0 || sOpacity === 0) {
      containerBg.setAttribute('stroke', 'none');
      containerBg.setAttribute('stroke-width', '0');
    } else if (sColor) {
      containerBg.setAttribute('stroke', sColor);
      containerBg.setAttribute('stroke-width', sWidth.toString());
      containerBg.setAttribute('stroke-opacity', sOpacity.toString());
      if (settings.strokeLineStyle === 'Dashed') {
        containerBg.setAttribute('stroke-dasharray', `${settings.strokeDashLength || 8},${settings.strokeDashGap || 4}`);
      } else if (settings.strokeLineStyle === 'Dotted') {
        containerBg.setAttribute('stroke-dasharray', '2,3');
      } else {
        containerBg.removeAttribute('stroke-dasharray');
      }
    }

    containerBg.setAttribute('rx', cornerR.toString());
    containerBg.setAttribute('ry', cornerR.toString());
  }

  // 2. Update foreignObject viewport & Swiper elements
  const fo = el.querySelector('.slideshow-foreign-object');
  if (fo) {
    fo.setAttribute('width', baseW.toString());
    fo.setAttribute('height', baseH.toString());
    fo.style.borderRadius = `${cornerR}px`;
  }

  const swiperContainer = el.querySelector('.swiper');
  if (swiperContainer) {
    swiperContainer.style.borderRadius = `${cornerR}px`;
    // Keep transition effect CSS class in sync
    ['fade', 'cube', 'coverflow', 'flip', 'cards'].forEach(ef => {
      swiperContainer.classList.remove(`swiper-effect-${ef}`);
    });
    swiperContainer.classList.add(`swiper-effect-${effect}`);

    // If an active Swiper instance has a different effect, destroy it so it can be cleanly re-initialized
    if (el._swiperInstance && !el._swiperInstance.destroyed) {
      if (el._swiperInstance.params?.effect !== effect) {
        try { el._swiperInstance.destroy(true, true); } catch (e) {}
        el._swiperInstance = null;
        window.dispatchEvent(new CustomEvent('slideshow-reinit-needed', { detail: { id: el.id } }));
      }
    }

    const navScale = Math.max(0.5, Math.min(2.0, (settings.navButtonSize ?? 70) / 100));
    const dotScale = Math.max(0.5, Math.min(2.0, (settings.dotButtonSize ?? 70) / 100));
    const dotOpacity = (settings.dotOpacity !== undefined ? settings.dotOpacity : 100) / 100;
    const navOpacity = (settings.navIconOpacity !== undefined ? settings.navIconOpacity : 100) / 100;

    swiperContainer.style.setProperty('--swiper-theme-color', settings.dotColor || '#3b82f6');
    swiperContainer.style.setProperty('--swiper-pagination-color', settings.dotColor || '#3b82f6');
    swiperContainer.style.setProperty('--swiper-navigation-color', settings.navIconColor || '#ffffff');
    swiperContainer.style.setProperty('--swiper-navigation-size', `${Math.round(20 * navScale)}px`);
    swiperContainer.style.setProperty('--nav-scale', navScale.toString());
    swiperContainer.style.setProperty('--dot-scale', dotScale.toString());
    swiperContainer.style.setProperty('--dot-opacity', dotOpacity.toString());
    swiperContainer.style.setProperty('--nav-opacity', navOpacity.toString());

    // 1. Navigation Button Styles & Icons
    const navStyle = settings.navStyle || 1;
    swiperContainer.setAttribute('data-nav-style', navStyle.toString());
    const prevBtn = swiperContainer.querySelector('.swiper-button-prev');
    const nextBtn = swiperContainer.querySelector('.swiper-button-next');
    const pagEl = swiperContainer.querySelector('.swiper-pagination');

    if (prevBtn) {
      prevBtn.innerHTML = getNavIconSvg(navStyle, 'left');
      renderNavIconToButton(prevBtn, navStyle, 'left', settings.navIconColor || '#ffffff');
    }
    if (nextBtn) {
      nextBtn.innerHTML = getNavIconSvg(navStyle, 'right');
      renderNavIconToButton(nextBtn, navStyle, 'right', settings.navIconColor || '#ffffff');
    }

    // 2. Navigation & Pagination Visibility (Enable/Disable)
    const showArrows = settings.showArrows !== false && settings.showNav !== false;
    const showDots = settings.showDots !== false;

    swiperContainer.classList.toggle('hide-nav-arrows', !showArrows);
    swiperContainer.classList.toggle('hide-pagination-dots', !showDots);

    if (prevBtn) {
      if (!showArrows) {
        prevBtn.style.setProperty('display', 'none', 'important');
      } else {
        prevBtn.style.setProperty('display', 'flex', 'important');
        prevBtn.style.setProperty('visibility', 'visible', 'important');
      }
    }
    if (nextBtn) {
      if (!showArrows) {
        nextBtn.style.setProperty('display', 'none', 'important');
      } else {
        nextBtn.style.setProperty('display', 'flex', 'important');
        nextBtn.style.setProperty('visibility', 'visible', 'important');
      }
    }
    if (pagEl) {
      if (!showDots) {
        pagEl.style.setProperty('display', 'none', 'important');
      } else {
        pagEl.style.removeProperty('display');
      }
    }

    // 3. Pagination Dot Styles & Active Bullet Synchronization
    const dotStyleId = Number(settings.dotStyle) || 1;
    swiperContainer.setAttribute('data-dot-style', dotStyleId.toString());
    const bullets = swiperContainer.querySelectorAll('.swiper-pagination-bullet');
    bullets.forEach((b, idx) => {
      // Clear any inline overrides so CSS variables and custom geometry apply reliably
      b.style.removeProperty('background');
      b.style.removeProperty('border');
      if (dotStyleId === 12) {
        b.textContent = (idx + 1).toString();
      } else {
        b.textContent = '';
      }
    });

    const wrapper = swiperContainer.querySelector('.swiper-wrapper');
    if (wrapper) {
      const baseImages = (images && images.length > 0) ? images : defaultSampleImages;
      
      // DSA Content Signature: Compare base ordered images rather than transient Swiper loop DOM order
      const currentSignature = baseImages.map(img => 
        `${img?.id || ''}::${img?.url || ''}::${img?.heading || ''}::${img?.subtext || ''}::${img?.textColor || ''}::${img?.fontSize || ''}::${img?.fixType || ''}`
      ).join('||');
      
      const lastSignature = wrapper.getAttribute('data-slides-signature');
      const needsHtmlUpdate = !lastSignature || lastSignature !== currentSignature || wrapper.children.length === 0;

      if (needsHtmlUpdate) {
        if (el._swiperInstance && !el._swiperInstance.destroyed) {
          try { el._swiperInstance.destroy(true, true); } catch (e) {}
          el._swiperInstance = null;
        }
        wrapper.innerHTML = renderSwiperSlidesHtml(baseImages, settings.infiniteLoop !== false);
        wrapper.setAttribute('data-slides-signature', currentSignature);
        window.dispatchEvent(new CustomEvent('slideshow-reinit-needed', { detail: { id: el.id } }));
      }
    }

    // If an active Swiper instance exists, trigger real-time sync & autoplay update
    const swiper = el._swiperInstance;
    if (swiper && !swiper.destroyed) {
      try {
        const speedSec = Number(settings.speed) || 3;
        const isAuto = speedSec > 0 && Boolean(settings.autoSlide ?? settings.autoPlay ?? false);
        if (isAuto) {
          if (!swiper.params.autoplay || typeof swiper.params.autoplay !== 'object') {
            swiper.params.autoplay = { delay: speedSec * 1000, disableOnInteraction: false };
          } else {
            swiper.params.autoplay.delay = speedSec * 1000;
          }
          if (swiper.autoplay) {
            try { swiper.autoplay.start(); } catch (err) {}
          }
        } else {
          swiper.params.autoplay = false;
          if (swiper.autoplay) {
            try { swiper.autoplay.stop(); } catch (err) {}
          }
        }

        swiper.update();
        if (typeof activeIdx === 'number' && !isNaN(activeIdx)) {
          const currentCanonical = RingBuffer.canonicalIndex(swiper.realIndex, len);
          if (centerIndex !== currentCanonical) {
            if (swiper.params.loop) {
              swiper.slideToLoop(centerIndex, 350);
            } else {
              swiper.slideTo(centerIndex, 350);
            }
          }
        }
      } catch (e) {
        // Safe catch during destruction or re-init
      }
    }
  }

  // Keep data-slideshow attribute in sync so manager re-init always reads current images
  const curDataStr = el.getAttribute('data-slideshow');
  let curData = {};
  try { curData = curDataStr ? JSON.parse(curDataStr) : {}; } catch (e) {}
  curData.settings = { ...(curData.settings || {}), ...settings };
  if (images && images.length > 0) {
    curData.images = images;
  }
  el.setAttribute('data-slideshow', JSON.stringify(curData));

  el.setAttribute('data-active-index', centerIndex.toString());
  el.setAttribute('data-style', effect);
};
