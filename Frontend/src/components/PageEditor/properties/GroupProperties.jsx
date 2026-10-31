import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Effect from './Effect';
import ColorPicker from './ColorPicker';
import { handleScrubHelper, normalizeHex, getIntAttr, getFloatAttr } from './propertiesShared';

export default function GroupProperties({
  selectedElement,
  selectedLayerId,
  activePageIndex,
  onUpdate,
  onDeleteLayer,
  setSelectedLayerId,
  setMultiSelectedIds,
  multiSelectedIds = null,
  isMultiSelect = false
}) {
  const [openSubSection, setOpenSubSection] = useState('colors');
  const [opacity, setOpacity] = useState(100);
  const [colors, setColors] = useState([]);
  const [activeColorIndex, setActiveColorIndex] = useState(null);
  const [activeColorPicker, setActiveColorPicker] = useState(null);
  const [showDetailedPicker, setShowDetailedPicker] = useState(false);

  // Helper to get all selected DOM nodes (either multi-selected or single group/element)
  const getSelectedNodes = () => {
    const editorDoc = document.getElementById('main-flipbook-editor')?.contentDocument || document;
    if (isMultiSelect && multiSelectedIds && multiSelectedIds.size > 0) {
      const nodes = [];
      multiSelectedIds.forEach(id => {
        const el = editorDoc.getElementById(id);
        if (el) nodes.push(el);
      });
      return nodes;
    }
    if (selectedElement) return [selectedElement];
    if (selectedLayerId) {
      const el = editorDoc.getElementById(selectedLayerId);
      if (el) return [el];
    }
    return [];
  };

  // Helper to extract unique fill, stroke, text & background colors from child elements
  const extractGroupColors = () => {
    const nodes = getSelectedNodes();
    if (nodes.length === 0) return;
    const colorMap = new Map();

    const scanNode = (node) => {
      if (node.nodeType !== 1) return;

      const tag = node.tagName?.toLowerCase();
      if (tag === 'style' || tag === 'defs' || tag === 'clippath') return;

      const fill = node.getAttribute('fill') || node.style?.fill || node.getAttribute('data-fill-color') || node.getAttribute('data-bg-fill') || node.style?.backgroundColor;
      const stroke = node.getAttribute('stroke') || node.style?.stroke || node.style?.webkitTextStrokeColor || node.getAttribute('data-stroke-color') || node.getAttribute('data-bg-stroke');
      const textColor = node.style?.color || node.getAttribute('color');

      const fillOpacity = node.getAttribute('fill-opacity') || node.style?.fillOpacity || '1';
      const strokeOpacity = node.getAttribute('stroke-opacity') || node.style?.strokeOpacity || '1';

      if (fill) {
        const hex = normalizeHex(fill);
        if (hex && !colorMap.has(hex)) {
          const alpha = Math.round(parseFloat(fillOpacity) * 100);
          colorMap.set(hex, { hex, opacity: isNaN(alpha) ? 100 : alpha, targetAttr: 'fill' });
        }
      }

      if (stroke) {
        const hex = normalizeHex(stroke);
        if (hex && !colorMap.has(hex)) {
          const alpha = Math.round(parseFloat(strokeOpacity) * 100);
          colorMap.set(hex, { hex, opacity: isNaN(alpha) ? 100 : alpha, targetAttr: 'stroke' });
        }
      }

      if (textColor) {
        const hex = normalizeHex(textColor);
        if (hex && !colorMap.has(hex)) {
          colorMap.set(hex, { hex, opacity: 100, targetAttr: 'color' });
        }
      }

      Array.from(node.children).forEach(scanNode);
    };

    nodes.forEach(scanNode);
    setColors(Array.from(colorMap.values()));
  };

  // 1. Synchronize state from selected element(s)
  useEffect(() => {
    const nodes = getSelectedNodes();
    if (nodes.length === 0) return;

    // Opacity: take average or first node opacity
    const firstNode = nodes[0];
    const opAttr = firstNode.getAttribute('opacity') || firstNode.style?.opacity || '1';
    const parsedOp = Math.round(parseFloat(opAttr) * 100);
    setOpacity(isNaN(parsedOp) ? 100 : parsedOp);

    // Extract colors across all selected elements recursively
    extractGroupColors();
  }, [selectedElement, selectedLayerId, multiSelectedIds, activePageIndex, isMultiSelect]);

  // 2. Handle Opacity Change across selected element(s)
  const handleOpacityChange = (newVal) => {
    const valNum = parseInt(newVal);
    setOpacity(valNum);
    const nodes = getSelectedNodes();
    if (nodes.length === 0) return;

    const decimalOp = (valNum / 100).toFixed(2);
    nodes.forEach(node => {
      node.setAttribute('opacity', decimalOp);
    });

    if (onUpdate) onUpdate();
  };

  // 3. Handle Color Replace across selected element(s)
  const handleColorChange = (oldHex, newHex) => {
    const nodes = getSelectedNodes();
    if (nodes.length === 0 || !newHex) return;
    const normNewHex = normalizeHex(newHex) || newHex.toLowerCase();
    const normOldHex = normalizeHex(oldHex) || oldHex.toLowerCase();

    const replaceColorsInNode = (node) => {
      if (node.nodeType !== 1) return;

      const fill = node.getAttribute('fill') || node.style?.fill || node.getAttribute('data-fill-color');
      const bgFill = node.getAttribute('data-bg-fill') || node.style?.backgroundColor;
      const stroke = node.getAttribute('stroke') || node.style?.stroke || node.style?.webkitTextStrokeColor || node.getAttribute('data-stroke-color') || node.getAttribute('data-bg-stroke');
      const textColor = node.style?.color || node.getAttribute('color');

      if (fill && normalizeHex(fill) === normOldHex) {
        node.setAttribute('fill', normNewHex);
        if (node.style?.fill) node.style.fill = normNewHex;
        if (node.getAttribute('data-fill-color')) node.setAttribute('data-fill-color', normNewHex);
        if (node.getAttribute('data-original-fill')) node.setAttribute('data-original-fill', normNewHex);
      }

      if (bgFill && normalizeHex(bgFill) === normOldHex) {
        node.setAttribute('data-bg-fill', normNewHex);
        if (node.style?.backgroundColor) {
          node.style.setProperty('background-color', normNewHex, 'important');
        }
        const textOuters = node.querySelectorAll ? node.querySelectorAll('.flipbook-text-outer, .flipbook-text-scrollbar, div') : [];
        textOuters.forEach(div => {
          if (div.style) {
            div.style.setProperty('background-color', normNewHex, 'important');
            div.style.setProperty('--bg-fill', normNewHex, 'important');
          }
        });
      }

      if (stroke && normalizeHex(stroke) === normOldHex) {
        node.setAttribute('stroke', normNewHex);
        if (node.style?.stroke) node.style.stroke = normNewHex;
        if (node.style?.webkitTextStrokeColor) {
          node.style.webkitTextStrokeColor = normNewHex;
          node.style.setProperty('-webkit-text-stroke-color', normNewHex, 'important');
        }
        if (node.getAttribute('data-stroke-color')) node.setAttribute('data-stroke-color', normNewHex);
        if (node.getAttribute('data-bg-stroke')) node.setAttribute('data-bg-stroke', normNewHex);
      }

      if (textColor && normalizeHex(textColor) === normOldHex) {
        node.style.color = normNewHex;
        node.style.setProperty('color', normNewHex, 'important');
        if (node.getAttribute('color')) node.setAttribute('color', normNewHex);
      }

      Array.from(node.children).forEach(replaceColorsInNode);
    };

    nodes.forEach(replaceColorsInNode);

    // Keep colors state array updated to maintain matching hex during active color picker dragging/clicking
    setColors(prev => prev.map(c => normalizeHex(c.hex) === normOldHex ? { ...c, hex: normNewHex } : c));

    if (onUpdate) onUpdate();
  };

  // 4. Handle Color Opacity Change across selected element(s)
  const handleColorOpacityChange = (targetHex, newOpacityVal) => {
    const nodes = getSelectedNodes();
    if (nodes.length === 0) return;
    const decimalOp = (parseFloat(newOpacityVal) / 100).toFixed(2);
    const normTargetHex = normalizeHex(targetHex) || targetHex.toLowerCase();

    const updateOpacityInNode = (node) => {
      if (node.nodeType !== 1) return;

      const fill = node.getAttribute('fill') || node.style?.fill || node.getAttribute('data-fill-color');
      const stroke = node.getAttribute('stroke') || node.style?.stroke || node.getAttribute('data-stroke-color');
      const textColor = node.style?.color || node.getAttribute('color');

      if ((fill && normalizeHex(fill) === normTargetHex) || (textColor && normalizeHex(textColor) === normTargetHex)) {
        node.setAttribute('fill-opacity', decimalOp);
        if (node.style?.fillOpacity) node.style.fillOpacity = decimalOp;
      }

      if (stroke && normalizeHex(stroke) === normTargetHex) {
        node.setAttribute('stroke-opacity', decimalOp);
        if (node.style?.strokeOpacity) node.style.strokeOpacity = decimalOp;
      }

      Array.from(node.children).forEach(updateOpacityInNode);
    };

    nodes.forEach(updateOpacityInNode);

    setColors(prev => prev.map(c => normalizeHex(c.hex) === normTargetHex ? { ...c, opacity: parseFloat(newOpacityVal) } : c));

    if (onUpdate) onUpdate();
  };

  // Open ColorPicker Modal
  const handleOpenColorPicker = (e, index) => {
    e.stopPropagation();
    setActiveColorIndex(index);
  };

  // ── Single Group Actions ──

  // Quick Action: Ungroup
  const handleUngroup = () => {
    const nodes = getSelectedNodes();
    if (nodes.length === 0) return;
    const targetNode = nodes[0];

    const parent = targetNode.parentNode;
    if (!parent) return;

    const children = Array.from(targetNode.childNodes);
    const groupTransform = targetNode.getAttribute('transform') || '';
    const newIds = new Set();

    children.forEach(child => {
      if (child.nodeType === 1) {
        if (groupTransform && groupTransform !== 'matrix(1 0 0 1 0 0)') {
          const childTransform = child.getAttribute('transform') || '';
          if (childTransform) {
            child.setAttribute('transform', `${groupTransform} ${childTransform}`);
          } else {
            child.setAttribute('transform', groupTransform);
          }
        }
        parent.insertBefore(child, targetNode);
        if (child.id) newIds.add(child.id);
      }
    });

    parent.removeChild(targetNode);

    if (setMultiSelectedIds && newIds.size > 0) {
      setMultiSelectedIds(newIds);
      const firstId = Array.from(newIds)[0];
      if (setSelectedLayerId) setSelectedLayerId(firstId);
    } else if (setSelectedLayerId) {
      setSelectedLayerId(null);
    }

    if (onUpdate) onUpdate();
  };

  // Quick Action: Duplicate Group
  const handleDuplicate = () => {
    const nodes = getSelectedNodes();
    if (nodes.length === 0) return;
    const targetNode = nodes[0];

    const parent = targetNode.parentNode;
    if (!parent) return;

    const clone = targetNode.cloneNode(true);
    const timeStamp = Date.now();
    clone.id = `group-${timeStamp}`;

    let count = 0;
    const updateIds = (node) => {
      if (node.nodeType !== 1) return;
      if (node.id) {
        count++;
        const baseName = node.tagName.toLowerCase();
        node.id = `${baseName}-${timeStamp}-${count}`;
      }
      Array.from(node.children).forEach(updateIds);
    };
    updateIds(clone);

    const matrix = targetNode.transform?.baseVal?.consolidate()?.matrix || new DOMMatrix(targetNode.getAttribute('transform') || '');
    const nextMatrix = new DOMMatrix().translate(15, 15).multiply(matrix);
    clone.setAttribute('transform', `matrix(${nextMatrix.a} ${nextMatrix.b} ${nextMatrix.c} ${nextMatrix.d} ${nextMatrix.e} ${nextMatrix.f})`);

    parent.insertBefore(clone, targetNode.nextSibling);

    if (setSelectedLayerId) setSelectedLayerId(clone.id);
    if (setMultiSelectedIds) setMultiSelectedIds(new Set([clone.id]));

    if (onUpdate) onUpdate();
  };

  // Quick Action: Delete Group
  const handleDelete = () => {
    if (onDeleteLayer && selectedLayerId) {
      onDeleteLayer();
    } else {
      const nodes = getSelectedNodes();
      nodes.forEach(n => {
        if (n.parentNode) n.parentNode.removeChild(n);
      });
      if (setSelectedLayerId) setSelectedLayerId(null);
      if (setMultiSelectedIds) setMultiSelectedIds(new Set());
      if (onUpdate) onUpdate();
    }
  };

  // ── Multi-Selection Actions ──

  // Quick Action: Group Selected Elements
  const handleGroupSelected = () => {
    const nodes = getSelectedNodes();
    if (nodes.length < 2) return;

    const parent = nodes[0].parentNode;
    if (!parent) return;

    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const groupTime = Date.now();
    group.id = `group-${groupTime}`;
    group.setAttribute('data-type', 'group');
    group.setAttribute('data-name', 'Group');

    parent.insertBefore(group, nodes[0]);

    nodes.forEach(node => {
      group.appendChild(node);
    });

    if (setSelectedLayerId) setSelectedLayerId(group.id);
    if (setMultiSelectedIds) setMultiSelectedIds(new Set([group.id]));

    if (onUpdate) onUpdate();
  };

  // Quick Action: Duplicate Selected Elements
  const handleDuplicateSelected = () => {
    const nodes = getSelectedNodes();
    if (nodes.length === 0) return;

    const timeStamp = Date.now();
    const newIds = new Set();

    nodes.forEach((node, index) => {
      const parent = node.parentNode;
      if (!parent) return;

      const clone = node.cloneNode(true);
      let count = 0;
      const updateIds = (n) => {
        if (n.nodeType !== 1) return;
        if (n.id) {
          count++;
          const baseName = n.tagName.toLowerCase();
          n.id = `${baseName}-${timeStamp}-${index}-${count}`;
        }
        Array.from(n.children).forEach(updateIds);
      };
      clone.id = `${node.tagName.toLowerCase()}-${timeStamp}-${index}`;
      updateIds(clone);

      const matrix = node.transform?.baseVal?.consolidate()?.matrix || new DOMMatrix(node.getAttribute('transform') || '');
      const nextMatrix = new DOMMatrix().translate(15, 15).multiply(matrix);
      clone.setAttribute('transform', `matrix(${nextMatrix.a} ${nextMatrix.b} ${nextMatrix.c} ${nextMatrix.d} ${nextMatrix.e} ${nextMatrix.f})`);

      parent.insertBefore(clone, node.nextSibling);
      newIds.add(clone.id);
    });

    if (newIds.size > 0) {
      if (setMultiSelectedIds) setMultiSelectedIds(newIds);
      const firstId = Array.from(newIds)[0];
      if (setSelectedLayerId) setSelectedLayerId(firstId);
    }

    if (onUpdate) onUpdate();
  };

  // Quick Action: Delete Selected Elements
  const handleDeleteSelected = () => {
    if (onDeleteLayer) {
      onDeleteLayer();
    } else {
      const nodes = getSelectedNodes();
      nodes.forEach(n => {
        if (n.parentNode) n.parentNode.removeChild(n);
      });
      if (setSelectedLayerId) setSelectedLayerId(null);
      if (setMultiSelectedIds) setMultiSelectedIds(new Set());
      if (onUpdate) onUpdate();
    }
  };

  // 8. Effects Handling using Effect.jsx
  const nodes = getSelectedNodes();
  const firstNode = nodes[0];
  const activeEffects = [];
  if (firstNode?.getAttribute('data-effect-drop-shadow') === 'true') activeEffects.push('Drop Shadow');
  if (firstNode?.getAttribute('data-effect-inner-shadow') === 'true') activeEffects.push('Inner Shadow');
  if (firstNode?.getAttribute('data-effect-blur') === 'true') activeEffects.push('Blur');

  const handleSetActiveEffects = (updater) => {
    const targetNodes = getSelectedNodes();
    if (targetNodes.length === 0) return;

    const currentActive = [];
    const first = targetNodes[0];
    if (first?.getAttribute('data-effect-drop-shadow') === 'true') currentActive.push('Drop Shadow');
    if (first?.getAttribute('data-effect-inner-shadow') === 'true') currentActive.push('Inner Shadow');
    if (first?.getAttribute('data-effect-blur') === 'true') currentActive.push('Blur');

    const next = typeof updater === 'function' ? updater(currentActive) : updater;
    const hasDropShadow = next.includes('Drop Shadow');
    const hasInnerShadow = next.includes('Inner Shadow');
    const hasBlur = next.includes('Blur');

    targetNodes.forEach(el => {
      el.setAttribute('data-effect-drop-shadow', hasDropShadow ? 'true' : 'false');
      el.setAttribute('data-effect-inner-shadow', hasInnerShadow ? 'true' : 'false');
      el.setAttribute('data-effect-blur', hasBlur ? 'true' : 'false');
      applyFilterEffects(el);
    });

    if (onUpdate) onUpdate();
  };

  const effectSettings = {
    'Drop Shadow': {
      x: getIntAttr(firstNode, 'data-effect-drop-shadow-x', 2),
      y: getIntAttr(firstNode, 'data-effect-drop-shadow-y', 2),
      blur: getIntAttr(firstNode, 'data-effect-drop-shadow-blur', 4),
      spread: getIntAttr(firstNode, 'data-effect-drop-shadow-spread', 0),
      color: firstNode?.getAttribute('data-effect-drop-shadow-color') || '#000000',
      opacity: getIntAttr(firstNode, 'data-effect-drop-shadow-opacity', 35),
    },
    'Inner Shadow': {
      x: getIntAttr(firstNode, 'data-effect-inner-shadow-x', 2),
      y: getIntAttr(firstNode, 'data-effect-inner-shadow-y', 2),
      blur: getIntAttr(firstNode, 'data-effect-inner-shadow-blur', 4),
      spread: getIntAttr(firstNode, 'data-effect-inner-shadow-spread', 0),
      color: firstNode?.getAttribute('data-effect-inner-shadow-color') || '#000000',
      opacity: getIntAttr(firstNode, 'data-effect-inner-shadow-opacity', 35),
    },
    'Blur': {
      blur: getFloatAttr(firstNode, 'data-effect-blur-value', getFloatAttr(firstNode, 'data-effect-blur-blur', 4)),
      spread: getIntAttr(firstNode, 'data-effect-blur-spread', 0),
      clipContent: firstNode?.getAttribute('data-effect-blur-clip') === 'true'
    }
  };

  const handleSetEffectSettings = (updater) => {
    const targetNodes = getSelectedNodes();
    if (targetNodes.length === 0) return;
    const next = typeof updater === 'function' ? updater(effectSettings) : updater;

    targetNodes.forEach(el => {
      ['Drop Shadow', 'Inner Shadow'].forEach(type => {
        const prefix = type === 'Drop Shadow' ? 'drop-shadow' : 'inner-shadow';
        if (next[type]) {
          if (next[type].x !== undefined) el.setAttribute(`data-effect-${prefix}-x`, next[type].x.toString());
          if (next[type].y !== undefined) el.setAttribute(`data-effect-${prefix}-y`, next[type].y.toString());
          if (next[type].blur !== undefined) el.setAttribute(`data-effect-${prefix}-blur`, next[type].blur.toString());
          if (next[type].spread !== undefined) el.setAttribute(`data-effect-${prefix}-spread`, next[type].spread.toString());
          if (next[type].color !== undefined) el.setAttribute(`data-effect-${prefix}-color`, next[type].color);
          if (next[type].opacity !== undefined) el.setAttribute(`data-effect-${prefix}-opacity`, next[type].opacity.toString());
        }
      });

      if (next['Blur']) {
        if (next['Blur'].blur !== undefined) el.setAttribute('data-effect-blur-value', next['Blur'].blur.toString());
        if (next['Blur'].spread !== undefined) el.setAttribute('data-effect-blur-spread', next['Blur'].spread.toString());
        if (next['Blur'].clipContent !== undefined) el.setAttribute('data-effect-blur-clip', next['Blur'].clipContent ? 'true' : 'false');
      }

      applyFilterEffects(el);
    });

    if (onUpdate) onUpdate();
  };

  const applyFilterEffects = (el) => {
    if (!el) return;

    if (!el.id) {
      el.id = `group-el-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    }

    const doc = el.ownerDocument || document;
    const svgRoot = el.ownerSVGElement || el.closest('svg') || (doc.querySelector ? doc.querySelector('svg') : null);

    const hasDropShadow = el.getAttribute('data-effect-drop-shadow') === 'true';
    const hasInnerShadow = el.getAttribute('data-effect-inner-shadow') === 'true';
    const hasBlur = el.getAttribute('data-effect-blur') === 'true';
    const hasClipContent = hasBlur && el.getAttribute('data-effect-blur-clip') === 'true';

    const filterId = `filter-${el.id}`;

    if (!svgRoot) {
      const filters = [];
      if (hasDropShadow) {
        const x = el.getAttribute('data-effect-drop-shadow-x') || 2;
        const y = el.getAttribute('data-effect-drop-shadow-y') || 2;
        const blur = el.getAttribute('data-effect-drop-shadow-blur') || 4;
        const color = el.getAttribute('data-effect-drop-shadow-color') || '#000000';
        filters.push(`drop-shadow(${x}px ${y}px ${blur}px ${color})`);
      }
      if (hasBlur) {
        const blurVal = el.getAttribute('data-effect-blur-value') || el.getAttribute('data-effect-blur-blur') || 4;
        filters.push(`blur(${blurVal}px)`);
      }
      el.style.filter = filters.length > 0 ? filters.join(' ') : '';
      return;
    }

    let defs = svgRoot.querySelector('defs');
    if (!defs) {
      defs = doc.createElementNS("http://www.w3.org/2000/svg", "defs");
      svgRoot.insertBefore(defs, svgRoot.firstChild);
    }

    let filterEl = defs.querySelector(`[id="${filterId}"]`);

    if (!hasDropShadow && !hasInnerShadow && !hasBlur) {
      if (filterEl) filterEl.remove();
      el.removeAttribute('filter');
      el.style.filter = '';
      return;
    }

    if (!filterEl) {
      filterEl = doc.createElementNS("http://www.w3.org/2000/svg", "filter");
      filterEl.id = filterId;
      filterEl.setAttribute('x', '-50%');
      filterEl.setAttribute('y', '-50%');
      filterEl.setAttribute('width', '200%');
      filterEl.setAttribute('height', '200%');
      defs.appendChild(filterEl);
    }

    while (filterEl.firstChild) filterEl.removeChild(filterEl.firstChild);

    const getVal = (attr, def) => el.getAttribute(attr) || def;
    let graphicIn = "SourceGraphic";

    // 1. Inner Shadow
    if (hasInnerShadow) {
      const color = getVal('data-effect-inner-shadow-color', '#000000');
      const opacity = parseFloat(getVal('data-effect-inner-shadow-opacity', '35')) / 100;
      const dx = getVal('data-effect-inner-shadow-x', '2');
      const dy = getVal('data-effect-inner-shadow-y', '2');
      const blur = parseFloat(getVal('data-effect-inner-shadow-blur', '4'));
      const spread = parseFloat(getVal('data-effect-inner-shadow-spread', '0'));

      const morph = doc.createElementNS("http://www.w3.org/2000/svg", "feMorphology");
      morph.setAttribute('operator', spread >= 0 ? 'dilate' : 'erode');
      morph.setAttribute('radius', Math.abs(spread));
      morph.setAttribute('in', 'SourceAlpha');
      morph.setAttribute('result', 'is_morph');
      filterEl.appendChild(morph);

      const gauss = doc.createElementNS("http://www.w3.org/2000/svg", "feGaussianBlur");
      gauss.setAttribute('stdDeviation', blur);
      gauss.setAttribute('in', 'is_morph');
      gauss.setAttribute('result', 'is_blur');
      filterEl.appendChild(gauss);

      const offset = doc.createElementNS("http://www.w3.org/2000/svg", "feOffset");
      offset.setAttribute('dx', dx);
      offset.setAttribute('dy', dy);
      offset.setAttribute('in', 'is_blur');
      offset.setAttribute('result', 'is_offset');
      filterEl.appendChild(offset);

      const compOut = doc.createElementNS("http://www.w3.org/2000/svg", "feComposite");
      compOut.setAttribute('operator', 'out');
      compOut.setAttribute('in', 'SourceAlpha');
      compOut.setAttribute('in2', 'is_offset');
      compOut.setAttribute('result', 'is_inverse');
      filterEl.appendChild(compOut);

      const flood = doc.createElementNS("http://www.w3.org/2000/svg", "feFlood");
      flood.setAttribute('flood-color', color);
      flood.setAttribute('flood-opacity', opacity);
      flood.setAttribute('result', 'is_flood');
      filterEl.appendChild(flood);

      const compIn = doc.createElementNS("http://www.w3.org/2000/svg", "feComposite");
      compIn.setAttribute('operator', 'in');
      compIn.setAttribute('in', 'is_flood');
      compIn.setAttribute('in2', 'is_inverse');
      compIn.setAttribute('result', 'is_final');
      filterEl.appendChild(compIn);

      const compOver = doc.createElementNS("http://www.w3.org/2000/svg", "feComposite");
      compOver.setAttribute('operator', 'over');
      compOver.setAttribute('in', 'is_final');
      compOver.setAttribute('in2', graphicIn);
      compOver.setAttribute('result', 'inner_shadow_merged');
      filterEl.appendChild(compOver);

      graphicIn = "inner_shadow_merged";
    }

    // 2. Blur
    if (hasBlur) {
      const blurVal = parseFloat(getVal('data-effect-blur-value', getVal('data-effect-blur-blur', '4')));
      const spreadVal = parseFloat(getVal('data-effect-blur-spread', '0'));

      let blurSource = graphicIn;
      if (spreadVal !== 0) {
        const morph = doc.createElementNS("http://www.w3.org/2000/svg", "feMorphology");
        morph.setAttribute('operator', spreadVal >= 0 ? 'dilate' : 'erode');
        morph.setAttribute('radius', Math.abs(spreadVal));
        morph.setAttribute('in', graphicIn);
        morph.setAttribute('result', 'blur_morph');
        filterEl.appendChild(morph);
        blurSource = "blur_morph";
      }

      const blurNode = doc.createElementNS("http://www.w3.org/2000/svg", "feGaussianBlur");
      blurNode.setAttribute('stdDeviation', blurVal);
      blurNode.setAttribute('in', blurSource);
      blurNode.setAttribute('result', 'blur_out');
      filterEl.appendChild(blurNode);
      graphicIn = "blur_out";
    }

    // 3. Clip Content
    if (hasClipContent) {
      const compClip = doc.createElementNS("http://www.w3.org/2000/svg", "feComposite");
      compClip.setAttribute('operator', 'in');
      compClip.setAttribute('in', graphicIn);
      compClip.setAttribute('in2', 'SourceAlpha');
      compClip.setAttribute('result', 'clipped_final');
      filterEl.appendChild(compClip);
      graphicIn = 'clipped_final';
    }

    // 4. Drop Shadow
    if (hasDropShadow) {
      const color = getVal('data-effect-drop-shadow-color', '#000000');
      const opacity = parseFloat(getVal('data-effect-drop-shadow-opacity', '35')) / 100;
      const dx = getVal('data-effect-drop-shadow-x', '2');
      const dy = getVal('data-effect-drop-shadow-y', '2');
      const blur = parseFloat(getVal('data-effect-drop-shadow-blur', '4'));
      const spread = parseFloat(getVal('data-effect-drop-shadow-spread', '0'));

      const extractAlpha = doc.createElementNS("http://www.w3.org/2000/svg", "feColorMatrix");
      extractAlpha.setAttribute('type', 'matrix');
      extractAlpha.setAttribute('values', '0 0 0 0 0   0 0 0 0 0   0 0 0 0 0   0 0 0 1 0');
      extractAlpha.setAttribute('in', graphicIn);
      extractAlpha.setAttribute('result', 'ds_alpha');
      filterEl.appendChild(extractAlpha);

      let dsSource = 'ds_alpha';
      if (spread !== 0) {
        const morph = doc.createElementNS("http://www.w3.org/2000/svg", "feMorphology");
        morph.setAttribute('operator', spread >= 0 ? 'dilate' : 'erode');
        morph.setAttribute('radius', Math.abs(spread));
        morph.setAttribute('in', 'ds_alpha');
        morph.setAttribute('result', 'ds_morph');
        filterEl.appendChild(morph);
        dsSource = 'ds_morph';
      }

      const gauss = doc.createElementNS("http://www.w3.org/2000/svg", "feGaussianBlur");
      gauss.setAttribute('stdDeviation', blur);
      gauss.setAttribute('in', dsSource);
      gauss.setAttribute('result', 'ds_blur');
      filterEl.appendChild(gauss);

      const offset = doc.createElementNS("http://www.w3.org/2000/svg", "feOffset");
      offset.setAttribute('dx', dx);
      offset.setAttribute('dy', dy);
      offset.setAttribute('in', 'ds_blur');
      offset.setAttribute('result', 'ds_offset');
      filterEl.appendChild(offset);

      const flood = doc.createElementNS("http://www.w3.org/2000/svg", "feFlood");
      flood.setAttribute('flood-color', color);
      flood.setAttribute('flood-opacity', opacity);
      flood.setAttribute('result', 'ds_flood');
      filterEl.appendChild(flood);

      const comp = doc.createElementNS("http://www.w3.org/2000/svg", "feComposite");
      comp.setAttribute('in', 'ds_flood');
      comp.setAttribute('in2', 'ds_offset');
      comp.setAttribute('operator', 'in');
      comp.setAttribute('result', 'ds_final');
      filterEl.appendChild(comp);

      const merge = doc.createElementNS("http://www.w3.org/2000/svg", "feMerge");
      const nodeShadow = doc.createElementNS("http://www.w3.org/2000/svg", "feMergeNode");
      nodeShadow.setAttribute('in', 'ds_final');
      const nodeInput = doc.createElementNS("http://www.w3.org/2000/svg", "feMergeNode");
      nodeInput.setAttribute('in', graphicIn);

      merge.appendChild(nodeShadow);
      merge.appendChild(nodeInput);
      merge.setAttribute('result', 'final_merged');
      filterEl.appendChild(merge);
    }

    el.setAttribute('filter', `url(#${filterId})`);
    el.style.filter = '';
  };

  return (
    <div className="relative flex flex-col gap-[1.7vw] w-full max-w-[25vw] pb-[2vw] font-sans select-none text-gray-800">
      <style>{`
        .custom-range-slider { -webkit-appearance: none; width: 100%; background: transparent; position: relative; }
        .custom-range-slider::before { content: ""; position: absolute; top: -0.75vw; bottom: -0.75vw; left: 0; right: 0; cursor: pointer; z-index: 1; }
        .custom-range-slider::-webkit-slider-runnable-track { height: 0.2vw; border-radius: 0.1vw; background: inherit; }
        .custom-range-slider::-webkit-slider-thumb { -webkit-appearance: none; height: 1vw; width: 1vw; border-radius: 50%; background: #4D47FF; border: 0.02vw solid #ffffff; box-shadow: 0 0.15vw 0.5vw rgba(77,71,255,0.4); margin-top: -0.55vw; cursor: pointer; transition: box-shadow 0.15s ease; position: relative; z-index: 2; }
        .custom-range-slider::-webkit-slider-thumb:hover { box-shadow: 0 0.15vw 0.75vw rgba(77,71,255,0.6); }
      `}</style>

      {/* ── Quick Actions Section ── */}
      <div className="flex flex-col gap-[0.8vw]">
        <div className="flex items-center gap-[0.8vw]">
          <span className="text-[0.9vw] font-semibold text-gray-900 whitespace-nowrap tracking-tight">Quick Actions</span>
          <div className="flex-1 h-[1px] bg-gray-200" />
        </div>

        <div className="grid grid-cols-2 gap-[0.6vw]">
          {isMultiSelect ? (
            <>
              <button
                onClick={handleGroupSelected}
                className="h-[2.2vw] px-[0.8vw] bg-white border border-gray-200 rounded-[0.45vw] text-gray-700 text-[0.78vw] font-semibold hover:bg-gray-50 hover:border-gray-300 active:scale-[0.98] transition-all shadow-2xs cursor-pointer flex items-center justify-center"
              >
                Group
              </button>
              <button
                onClick={handleDuplicateSelected}
                className="h-[2.2vw] px-[0.8vw] bg-white border border-gray-200 rounded-[0.45vw] text-gray-700 text-[0.78vw] font-semibold hover:bg-gray-50 hover:border-gray-300 active:scale-[0.98] transition-all shadow-2xs cursor-pointer flex items-center justify-center"
              >
                Duplicate Selected
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleUngroup}
                className="h-[2.2vw] px-[0.8vw] bg-white border border-gray-200 rounded-[0.45vw] text-gray-700 text-[0.78vw] font-semibold hover:bg-gray-50 hover:border-gray-300 active:scale-[0.98] transition-all shadow-2xs cursor-pointer flex items-center justify-center"
              >
                Ungroup
              </button>
              <button
                onClick={handleDuplicate}
                className="h-[2.2vw] px-[0.8vw] bg-white border border-gray-200 rounded-[0.45vw] text-gray-700 text-[0.78vw] font-semibold hover:bg-gray-50 hover:border-gray-300 active:scale-[0.98] transition-all shadow-2xs cursor-pointer flex items-center justify-center"
              >
                Duplicate Group
              </button>
            </>
          )}
        </div>
        {isMultiSelect ? (
          <button
            onClick={handleDeleteSelected}
            className="w-full h-[2.2vw] px-[0.8vw] bg-white border border-gray-200 rounded-[0.45vw] text-gray-600 text-[0.78vw] font-semibold hover:bg-red-50 hover:border-red-200 hover:text-red-600 active:scale-[0.98] transition-all shadow-2xs cursor-pointer flex items-center justify-center"
          >
            Delete Selected
          </button>
        ) : (
          <button
            onClick={handleDelete}
            className="w-full h-[2.2vw] px-[0.8vw] bg-white border border-gray-200 rounded-[0.45vw] text-gray-600 text-[0.78vw] font-semibold hover:bg-red-50 hover:border-red-200 hover:text-red-600 active:scale-[0.98] transition-all shadow-2xs cursor-pointer flex items-center justify-center"
          >
            Delete Group
          </button>
        )}
      </div>

      {/* ── Opacity Section ── */}
      <div className="flex items-center justify-between gap-[1vw] py-[0.1vw]">
        <span className="text-[0.82vw] font-medium text-gray-800 whitespace-nowrap">Opacity</span>
        <div className="flex-1 px-[0.2vw] flex items-center">
          <input
            type="range"
            min="0"
            max="100"
            value={opacity}
            onChange={(e) => handleOpacityChange(Number(e.target.value))}
            className="custom-range-slider h-[0.2vw] w-full bg-gray-200 rounded-lg cursor-pointer"
            style={{
              background: `linear-gradient(to right, #4D47FF 0%, #4D47FF ${opacity}%, #E5E7EB ${opacity}%, #E5E7EB 100%)`
            }}
          />
        </div>
        <div className="w-[3.3vw] h-[2vw] rounded-[0.4vw] border border-gray-300 bg-white flex items-center justify-center text-[0.8vw] font-medium text-gray-700 shadow-2xs">
          {opacity}%
        </div>
      </div>

      {/* ── Colors in this Group Section ── */}
      <div className="flex flex-col gap-[0.8vw]">
        <div className="flex items-center gap-[0.8vw]">
          <span className="text-[0.82vw] font-semibold text-gray-900 whitespace-nowrap">
            {isMultiSelect ? 'Colors in Selection' : 'Colors in Group'}
          </span>
          <div className="flex-1 h-[1px] bg-gray-200" />
        </div>

        {colors.length === 0 ? (
          <div className="text-[0.78vw] text-gray-400 py-[0.8vw] text-center bg-gray-50/60 rounded-[0.45vw] border border-gray-100 italic">
            No distinct colors found
          </div>
        ) : (
          <div className="flex flex-col gap-[0.6vw] max-h-[16vw] overflow-y-auto pr-[0.3vw] custom-scrollbar">
            {colors.map((cItem, index) => (
              <div key={index} className="flex items-center gap-[0.6vw]">
                {/* Swatch */}
                <div
                  className="w-[3.6vw] h-[2.1vw] rounded-[0.45vw] border border-gray-300 shadow-2xs cursor-pointer flex-shrink-0 relative overflow-hidden transition-transform hover:scale-105"
                  onClick={(e) => handleOpenColorPicker(e, index)}
                  title="Change color"
                >
                  <div
                    className="w-full h-full"
                    style={{
                      background: (cItem.hex === 'none' || cItem.hex === 'transparent' || !cItem.hex)
                        ? 'white'
                        : cItem.hex
                    }}
                  />
                  {(cItem.hex === 'none' || cItem.hex === 'transparent' || !cItem.hex) && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[1.5px] bg-red-500 rotate-45" />
                  )}
                </div>

                {/* Input box */}
                <div className="flex-1 h-[2.1vw] rounded-[0.45vw] border border-gray-300 bg-white flex items-center justify-between px-[0.75vw] hover:border-gray-400 transition-colors shadow-2xs">
                  <input
                    type="text"
                    value={(() => {
                      const val = cItem.hex;
                      if (!val || val === 'none' || val === 'transparent') return '#';
                      return val.startsWith('#') ? val.toUpperCase() : '#' + val.toUpperCase();
                    })()}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '' || val === '#') {
                        handleColorChange(cItem.hex, 'none');
                      } else {
                        const finalVal = val.startsWith('#') ? val : '#' + val;
                        handleColorChange(cItem.hex, finalVal);
                      }
                    }}
                    className="text-[0.8vw] font-mono font-medium text-gray-800 outline-none bg-transparent flex-1 uppercase"
                    maxLength={8}
                  />
                  <div
                    className="flex items-center cursor-ew-resize select-none px-[0.2vw] hover:bg-gray-50 rounded"
                    onPointerDown={(e) => {
                      handleScrubHelper(e, cItem.opacity, (val) => {
                        const num = parseInt(val);
                        const clamped = Math.min(Math.max(num, 0), 100);
                        handleColorOpacityChange(cItem.hex, clamped);
                      });
                    }}
                    title="Drag horizontally to adjust opacity"
                  >
                    <span className="text-[0.8vw] font-medium text-gray-700">
                      {cItem.opacity}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Effects Section (Common Effect Component) ── */}
      <Effect
        noAccordion={true}
        openSubSection={openSubSection}
        setOpenSubSection={setOpenSubSection}
        activeEffects={activeEffects}
        setActiveEffects={handleSetActiveEffects}
        effectSettings={effectSettings}
        setEffectSettings={handleSetEffectSettings}
        activeColorPicker={activeColorPicker}
        setActiveColorPicker={setActiveColorPicker}
        showDetailedPicker={showDetailedPicker}
        setShowDetailedPicker={setShowDetailedPicker}
      />

      {/* ── Official ColorPicker Portal Popup (Positioned alongside RightSidebar) ── */}
      {activeColorIndex !== null && colors[activeColorIndex] && createPortal(
        <div
          className="fixed z-[5000]"
          style={{
            top: '50%',
            right: '19.5vw',
            transform: 'translateY(-50%)'
          }}
        >
          <div className="animate-in fade-in zoom-in-95 duration-200">
            <ColorPicker
              color={colors[activeColorIndex].hex}
              colorsOnPage={colors.map(c => c.hex)}
              onChange={(newVal) => {
                if (colors[activeColorIndex]) {
                  handleColorChange(colors[activeColorIndex].hex, newVal);
                }
              }}
              opacity={colors[activeColorIndex].opacity}
              onOpacityChange={(newOp) => {
                if (colors[activeColorIndex]) {
                  handleColorOpacityChange(colors[activeColorIndex].hex, newOp);
                }
              }}
              onClose={() => setActiveColorIndex(null)}
            />
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
