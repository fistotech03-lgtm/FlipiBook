/**
 * imageFramingUtils.js
 * Isolated pure-code utilities and vector presets for SVG Image Framing & Masking Elements in FlipiBook.
 * Defines all 62 image framing shapes 100% in JavaScript code without external .svg assets.
 */

export const isImageFrame = (el) => {
  if (!el || typeof el.getAttribute !== 'function') return false;
  return (
    el.getAttribute('data-type') === 'image-frame' ||
    el.getAttribute('data-is-image-frame') === 'true' ||
    el.getAttribute('data-frame-type') !== null ||
    (el.getAttribute('id') && el.getAttribute('id').startsWith('image-frame-'))
  );
};

export const DEFAULT_FRAME_IMAGE =
  'data:image/jpeg;base64,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';

/**
 * Helper to generate an SVG path string for a rounded rectangle.
 * @param {number} x - Top-left X coordinate
 * @param {number} y - Top-left Y coordinate
 * @param {number} w - Width
 * @param {number} h - Height
 * @param {number} r - Corner radius
 * @returns {string} SVG Path 'd' attribute string
 */
export function getRoundedRectPath(x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  if (r <= 0) return `M ${x},${y} h ${w} v ${h} h ${-w} Z`;
  return `M ${x + r},${y} ` +
         `h ${w - 2 * r} ` +
         `a ${r},${r} 0 0 1 ${r},${r} ` +
         `v ${h - 2 * r} ` +
         `a ${r},${r} 0 0 1 ${-r},${r} ` +
         `h ${-(w - 2 * r)} ` +
         `a ${r},${r} 0 0 1 ${-r},${-r} ` +
         `v ${-(h - 2 * r)} ` +
         `a ${r},${r} 0 0 1 ${r},${-r} Z`;
}

export const THREE_GRID_SHAPES = [
  // -------------------------------------------------------------
  // SHAPE 1: STAGGERED 3-COLUMNS
  // -------------------------------------------------------------
  {
    id: 'staggered_triptych',
    name: 'Staggered 3-Columns',
    description: '3 vertical staggered slits with high-center elevation',
    slotCount: 3,
    getSlots: (gap = 16, r = 16, cw = 1000, ch = 1000) => {
      const padX = cw * 0.06;
      const totalW = cw - 2 * padX;
      const colW = (totalW - 2 * gap) / 3;

      // Slot 1 (Left): starts lower down
      const h1 = ch * 0.72;
      const y1 = ch * 0.20;

      // Slot 2 (Center): tallest, extends closest to top
      const h2 = ch * 0.90;
      const y2 = ch * 0.04;

      // Slot 3 (Right): medium-high elevation
      const h3 = ch * 0.76;
      const y3 = ch * 0.08;

      return [
        { d: getRoundedRectPath(padX, y1, colW, h1, r) },
        { d: getRoundedRectPath(padX + colW + gap, y2, colW, h2, r) },
        { d: getRoundedRectPath(padX + 2 * (colW + gap), y3, colW, h3, r) }
      ];
    }
  },

  // -------------------------------------------------------------
  // SHAPE 2: DIAMOND S-CURVE (4 TILES)
  // -------------------------------------------------------------
  {
    id: 'staggered_diamonds',
    name: 'Diamond S-Curve (4)',
    description: '4-pane zigzag diamonds with uniform diagonal edge gaps',
    slotCount: 4,
    getSlots: (gap = 16, r = 16, cw = 1000, ch = 1000) => {
      const minDim = Math.min(cw, ch);
      const S = minDim * 0.26;
      const actualGap = Math.max(14, gap * 1.1);
      const step = (S + actualGap) / Math.SQRT2;

      const cx = cw / 2;
      const cy = ch / 2;
      const x0 = cx + step / 2;
      const y0 = cy - 1.5 * step;

      const offsets = [
        { x: x0,        y: y0 },
        { x: x0 - step, y: y0 + step },
        { x: x0,        y: y0 + 2 * step },
        { x: x0 - step, y: y0 + 3 * step }
      ];

      const half = S / 2;
      const cornerR = Math.min(r, S * 0.22);

      return offsets.map(p => ({
        d: getRoundedRectPath(-half, -half, S, S, cornerR),
        transform: `translate(${p.x}, ${p.y}) rotate(45)`
      }));
    }
  },

  // -------------------------------------------------------------
  // SHAPE 3: ARCH HORSESHOE (6 SEGMENTS)
  // -------------------------------------------------------------
  {
    id: 'radial_horseshoe',
    name: 'Arch Horseshoe (6)',
    description: '6-segment radial arch canopy with central circular dome cutout',
    slotCount: 6,
    getSlots: (gap = 16, r = 16, cw = 1000, ch = 1000) => {
      const slots = [];
      const cx = cw / 2;
      const cy = ch * 0.58;
      const rOut = Math.min(cw, ch) * 0.45;
      const rIn = Math.min(cw, ch) * 0.21;
      const count = 6;

      const startAngle = Math.PI * 0.85;
      const endAngle = Math.PI * 2.15;
      const totalAngle = endAngle - startAngle;
      const step = totalAngle / count;
      const angularGap = Math.max(0.015, (gap / rOut) * 0.65);

      for (let i = 0; i < count; i++) {
        const a1 = startAngle + i * step + angularGap / 2;
        const a2 = startAngle + (i + 1) * step - angularGap / 2;

        const x1 = cx + rOut * Math.cos(a1), y1 = cy + rOut * Math.sin(a1);
        const x2 = cx + rOut * Math.cos(a2), y2 = cy + rOut * Math.sin(a2);
        const x3 = cx + rIn * Math.cos(a2),  y3 = cy + rIn * Math.sin(a2);
        const x4 = cx + rIn * Math.cos(a1),  y4 = cy + rIn * Math.sin(a1);

        slots.push({
          d: `M ${x1},${y1} A ${rOut},${rOut} 0 0 1 ${x2},${y2} L ${x3},${y3} A ${rIn},${rIn} 0 0 0 ${x4},${y4} Z`
        });
      }
      return slots;
    }
  }
];

const RAW_PRESETS = [
  {
    "id": "frame-0",
    "name": "0",
    "width": 67,
    "height": 90,
    "viewBox": "0 0 67 90",
    "innerSvg": "<path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M33.5 90C52.0015 90 67 69.8528 67 45C67 20.1472 52.0015 0 33.5 0C14.9985 0 0 20.1472 0 45C0 69.8528 14.9985 90 33.5 90ZM44 45C44 57.7025 39.2991 68 33.5 68C27.7009 68 23 57.7025 23 45C23 32.2975 27.7009 22 33.5 22C39.2991 22 44 32.2975 44 45Z\" fill=\"url(#pattern0_10526_3279)\"/>\r\n<defs>\r\n<pattern id=\"pattern0_10526_3279\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\r\n<use xlink:href=\"#image0_10526_3279\" transform=\"matrix(0.0010712 0 0 0.000797448 -0.171642 0)\"/>\r\n</pattern>\r\n<image id=\"image0_10526_3279\" width=\"1254\" height=\"1254\" preserveAspectRatio=\"none\" xlink:href=\"__FRAME_IMAGE__\"/>\r\n</defs>"
  },
  {
    "id": "frame-1",
    "name": "1",
    "width": 47,
    "height": 90,
    "viewBox": "0 0 47 90",
    "innerSvg": "<path d=\"M22.5342 5.96046e-07L0 10.4114L5.8651e-05 33L12.6901 26.9193L12.5001 27.5V69H0L-2.59876e-05 89.6906L46.5001 90V69H36.5001V0L22.5342 5.96046e-07Z\" fill=\"url(#pattern0_10526_3280)\"/>\r\n<defs>\r\n<pattern id=\"pattern0_10526_3280\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\r\n<use xlink:href=\"#image0_10526_3280\" transform=\"matrix(0.00154344 0 0 0.000797448 -0.46774 0)\"/>\r\n</pattern>\r\n<image id=\"image0_10526_3280\" width=\"1254\" height=\"1254\" preserveAspectRatio=\"none\" xlink:href=\"__FRAME_IMAGE__\"/>\r\n</defs>"
  },
  {
    "id": "frame-2-colums",
    "name": "2 Colums",
    "width": 83,
    "height": 69,
    "viewBox": "0 0 83 69",
    "innerSvg": "<rect width=\"21\" height=\"69\" fill=\"url(#pattern0_10526_3228)\"/>\r\n<rect x=\"24\" width=\"18\" height=\"69\" fill=\"url(#pattern1_10526_3228)\"/>\r\n<rect x=\"45\" width=\"38\" height=\"69\" fill=\"url(#pattern2_10526_3228)\"/>\r\n<defs>\r\n<pattern id=\"pattern0_10526_3228\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\r\n<use xlink:href=\"#image0_10526_3228\" transform=\"matrix(0.00262019 0 0 0.000797448 -1.14286 0)\"/>\r\n</pattern>\r\n<pattern id=\"pattern1_10526_3228\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\r\n<use xlink:href=\"#image0_10526_3228\" transform=\"matrix(0.00305688 0 0 0.000797448 -1.41667 0)\"/>\r\n</pattern>\r\n<pattern id=\"pattern2_10526_3228\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\r\n<use xlink:href=\"#image0_10526_3228\" transform=\"matrix(0.001448 0 0 0.000797448 -0.407895 0)\"/>\r\n</pattern>\r\n<image id=\"image0_10526_3228\" width=\"1254\" height=\"1254\" preserveAspectRatio=\"none\" xlink:href=\"__FRAME_IMAGE__\"/>\r\n</defs>"
  },
  {
    "id": "frame-2",
    "name": "2",
    "width": 68,
    "height": 91,
    "viewBox": "0 0 68 91",
    "innerSvg": "<path d=\"M1.68735 91V73.4663L33.9156 45.763C36.0529 43.922 37.8809 42.1978 39.3995 40.5906C40.9462 38.9541 42.1274 37.2738 42.9429 35.5496C43.7866 33.8255 44.2084 31.9114 44.2084 29.8073C44.2084 27.4987 43.7304 25.5262 42.7742 23.8897C41.8462 22.2532 40.5525 20.9966 38.8933 20.1199C37.2341 19.214 35.3218 18.7611 33.1563 18.7611C30.9909 18.7611 29.0786 19.214 27.4194 20.1199C25.7883 21.0259 24.5227 22.3555 23.6228 24.1089C22.7229 25.8622 22.273 27.9955 22.273 30.5087H0C0 24.1965 1.36394 18.7611 4.09181 14.2023C6.81969 9.64355 10.6725 6.1368 15.6501 3.68208C20.6278 1.22736 26.4632 0 33.1563 0C40.0744 0 46.0645 1.1543 51.1266 3.46291C56.2167 5.7423 60.1398 8.95681 62.8958 13.1065C65.6799 17.2561 67.072 22.1217 67.072 27.7033C67.072 31.1516 66.383 34.5853 65.005 38.0043C63.627 41.3942 61.1522 45.1493 57.5806 49.2698C54.0091 53.3902 48.933 58.2996 42.3524 63.9981L34.2531 71.0116V71.5376H68V91H1.68735Z\" fill=\"url(#pattern0_10526_3281)\"/>\r\n<defs>\r\n<pattern id=\"pattern0_10526_3281\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\r\n<use xlink:href=\"#image0_10526_3281\" transform=\"matrix(0.00106717 0 0 0.000797448 -0.169118 0)\"/>\r\n</pattern>\r\n<image id=\"image0_10526_3281\" width=\"1254\" height=\"1254\" preserveAspectRatio=\"none\" xlink:href=\"__FRAME_IMAGE__\"/>\r\n</defs>"
  },
  {
    "id": "frame-3",
    "name": "3",
    "width": 80,
    "height": 100,
    "viewBox": "0 0 80 100",
    "innerSvg": "<path d=\"M39.4432 99.7457C31.7947 99.7457 24.9996 98.4341 19.0579 95.8109C13.1477 93.1561 8.50178 89.5057 5.12003 84.8597C1.73828 80.2138 0.0316051 74.8725 0 68.8359H26.5483C26.5799 70.7006 27.1488 72.3757 28.255 73.8612C29.3928 75.315 30.9414 76.4528 32.9009 77.2745C34.8604 78.0962 37.1044 78.5071 39.6328 78.5071C42.0664 78.5071 44.2156 78.0804 46.0803 77.2271C47.945 76.3422 49.3988 75.1254 50.4418 73.5767C51.4847 72.0281 51.9904 70.2582 51.9588 68.2671C51.9904 66.3075 51.3899 64.5693 50.1573 63.0522C48.9563 61.5352 47.2654 60.35 45.0847 59.4966C42.9039 58.6433 40.3913 58.2166 37.5469 58.2166H27.6861V40.0121H37.5469C40.1701 40.0121 42.4773 39.5854 44.4684 38.7321C46.4911 37.8787 48.0556 36.6935 49.1618 35.1765C50.2995 33.6594 50.8526 31.9212 50.821 29.9616C50.8526 28.0653 50.3944 26.3903 49.4462 24.9364C48.498 23.4826 47.1706 22.3448 45.464 21.5231C43.7889 20.7013 41.8452 20.2905 39.6328 20.2905C37.2308 20.2905 35.0817 20.7171 33.1854 21.5705C31.3207 22.4238 29.851 23.609 28.7765 25.1261C27.7019 26.6431 27.1488 28.3814 27.1172 30.3409H1.89631C1.92791 24.3991 3.55558 19.1527 6.7793 14.6016C10.0346 10.0504 14.4909 6.47905 20.1483 3.88743C25.8056 1.29581 32.3004 0 39.6328 0C46.8072 0 53.144 1.2168 58.6433 3.65039C64.1742 6.08398 68.4883 9.43413 71.5856 13.7008C74.7145 17.9359 76.2631 22.7873 76.2315 28.255C76.2947 33.6911 74.43 38.1474 70.6374 41.6239C66.8764 45.1005 62.104 47.1548 56.3203 47.7869V48.5455C64.1584 49.3988 70.0527 51.8008 74.0034 55.7514C77.954 59.6705 79.8977 64.6009 79.8345 70.5426C79.8661 76.2315 78.1594 81.2726 74.7145 85.6657C71.3011 90.0588 66.5446 93.5037 60.4448 96.0005C54.3766 98.4973 47.3761 99.7457 39.4432 99.7457Z\" fill=\"url(#pattern0_10526_3219)\"/>\r\n<defs>\r\n<pattern id=\"pattern0_10526_3219\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\r\n<use xlink:href=\"#image0_10526_3219\" transform=\"matrix(0.000996318 0 0 0.000797448 -0.124691 0)\"/>\r\n</pattern>\r\n<image id=\"image0_10526_3219\" width=\"1254\" height=\"1254\" preserveAspectRatio=\"none\" xlink:href=\"__FRAME_IMAGE__\"/>\r\n</defs>"
  },
  {
    "id": "frame-4-grid",
    "name": "4 Grid",
    "width": 83,
    "height": 71,
    "viewBox": "0 0 83 71",
    "innerSvg": "<rect y=\"42\" width=\"38\" height=\"29\" fill=\"url(#pattern0_10526_3244)\"/>\r\n<rect x=\"45\" y=\"42\" width=\"38\" height=\"29\" fill=\"url(#pattern1_10526_3244)\"/>\r\n<rect x=\"45\" width=\"38\" height=\"40\" fill=\"url(#pattern2_10526_3244)\"/>\r\n<rect width=\"38\" height=\"40\" fill=\"url(#pattern3_10526_3244)\"/>\r\n<defs>\r\n<pattern id=\"pattern0_10526_3244\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\r\n<use xlink:href=\"#image0_10526_3244\" transform=\"matrix(0.000797448 0 0 0.00104493 0 -0.155172)\"/>\r\n</pattern>\r\n<pattern id=\"pattern1_10526_3244\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\r\n<use xlink:href=\"#image0_10526_3244\" transform=\"matrix(0.000797448 0 0 0.00104493 0 -0.155172)\"/>\r\n</pattern>\r\n<pattern id=\"pattern2_10526_3244\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\r\n<use xlink:href=\"#image0_10526_3244\" transform=\"matrix(0.000839419 0 0 0.000797448 -0.0263158 0)\"/>\r\n</pattern>\r\n<pattern id=\"pattern3_10526_3244\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\r\n<use xlink:href=\"#image0_10526_3244\" transform=\"matrix(0.000839419 0 0 0.000797448 -0.0263158 0)\"/>\r\n</pattern>\r\n<image id=\"image0_10526_3244\" width=\"1254\" height=\"1254\" preserveAspectRatio=\"none\" xlink:href=\"__FRAME_IMAGE__\"/>\r\n</defs>"
  },
  {
    "id": "frame-4",
    "name": "4",
    "width": 84,
    "height": 98,
    "viewBox": "0 0 84 98",
    "innerSvg": "<path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M0 81.9205H47.218V97.0909H72.4389V81.9205H83.6271V61.4403H72.4389V0H57.6477H47.7869H39.0639L0 61.4403V81.9205ZM47.7869 27.3068H47.0284L25.9794 60.6818V61.4403H47.7869V27.3068Z\" fill=\"url(#pattern0_10526_3220)\"/>\r\n<defs>\r\n<pattern id=\"pattern0_10526_3220\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\r\n<use xlink:href=\"#image0_10526_3220\" transform=\"matrix(0.000925835 0 0 0.000797448 -0.0804988 0)\"/>\r\n</pattern>\r\n<image id=\"image0_10526_3220\" width=\"1254\" height=\"1254\" preserveAspectRatio=\"none\" xlink:href=\"__FRAME_IMAGE__\"/>\r\n</defs>"
  },
  {
    "id": "frame-5",
    "name": "5",
    "width": 78,
    "height": 99,
    "viewBox": "0 0 78 99",
    "innerSvg": "<path d=\"M38.495 98.4183C31.0362 98.4183 24.415 97.1067 18.6312 94.4835C12.8791 91.8287 8.34375 88.1783 5.02521 83.5323C1.73828 78.8864 0.0632102 73.5451 0 67.5085H25.6001C25.695 70.8587 26.9908 73.5293 29.4876 75.5204C32.016 77.5115 35.0185 78.5071 38.495 78.5071C41.1815 78.5071 43.5518 77.9382 45.6062 76.8004C47.6605 75.631 49.2724 73.9876 50.4418 71.87C51.6112 69.7525 52.18 67.2873 52.1484 64.4744C52.18 61.63 51.6112 59.1648 50.4418 57.0788C49.2724 54.9613 47.6605 53.3336 45.6062 52.1958C43.5518 51.0265 41.1815 50.4418 38.495 50.4418C35.7138 50.4418 33.138 51.1213 30.7676 52.4803C28.4288 53.8077 26.7063 55.6566 25.6001 58.027L2.4652 53.4759L6.25781 0H71.4908V21.049H27.8757L25.9794 42.4773H26.5483C28.0653 39.538 30.6886 37.1044 34.418 35.1765C38.1474 33.217 42.4773 32.2372 47.4077 32.2372C53.1914 32.2372 58.343 33.5804 62.8626 36.2669C67.4137 38.9533 71.0009 42.6669 73.6241 47.4077C76.2789 52.1168 77.5906 57.5529 77.559 63.7159C77.5906 70.4794 75.9787 76.4844 72.7234 81.7308C69.4996 86.9457 64.9643 91.0385 59.1174 94.0094C53.2704 96.9487 46.3963 98.4183 38.495 98.4183Z\" fill=\"url(#pattern0_10526_3221)\"/>\r\n<defs>\r\n<pattern id=\"pattern0_10526_3221\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\r\n<use xlink:href=\"#image0_10526_3221\" transform=\"matrix(0.00101191 0 0 0.000797448 -0.13447 0)\"/>\r\n</pattern>\r\n<image id=\"image0_10526_3221\" width=\"1254\" height=\"1254\" preserveAspectRatio=\"none\" xlink:href=\"__FRAME_IMAGE__\"/>\r\n</defs>"
  },
  {
    "id": "frame-6",
    "name": "6",
    "width": 81,
    "height": 100,
    "viewBox": "0 0 81 100",
    "innerSvg": "<path d=\"M42.0987 99.7457C36.4414 99.7457 31.0685 98.8608 25.9801 97.0909C20.9233 95.2894 16.4353 92.4608 12.5163 88.6049C8.59726 84.7491 5.51576 79.7239 3.2718 73.5293C1.05944 67.3347 -0.0309374 59.8285 0.000667712 51.0107C0.0322728 43.141 1.04364 36.0614 3.03476 29.772C5.05749 23.4826 7.91775 18.1255 11.6155 13.7008C15.345 9.2761 19.8013 5.89435 24.9845 3.55557C30.1677 1.18519 35.9357 0 42.2883 0C49.4311 0 55.7205 1.37482 61.1566 4.12447C66.5927 6.87411 70.9225 10.5561 74.1463 15.1705C77.4016 19.7532 79.2979 24.81 79.8352 30.3409H53.8558C53.2553 27.5913 51.8647 25.5843 49.6839 24.3201C47.5348 23.0243 45.0696 22.3764 42.2883 22.3764C36.7574 22.3764 32.6962 24.7784 30.1045 29.5824C27.5445 34.3864 26.2329 40.7074 26.1697 48.5455H26.7386C27.9712 45.5746 29.8359 43.0304 32.3327 40.9128C34.8295 38.7953 37.7372 37.1676 41.0557 36.0298C44.3742 34.892 47.8824 34.3232 51.5802 34.3232C57.4588 34.3232 62.5946 35.6506 66.9877 38.3054C71.4124 40.9602 74.8574 44.5948 77.3226 49.2092C79.7878 53.8235 81.0046 59.1016 80.973 65.0433C81.0046 71.9965 79.3611 78.0804 76.0426 83.2953C72.7556 88.5101 68.1887 92.5556 62.3418 95.4316C56.4948 98.3077 49.7471 99.7457 42.0987 99.7457ZM41.909 79.8345C44.5323 79.8345 46.8553 79.234 48.878 78.033C50.9323 76.832 52.5284 75.1886 53.6662 73.1026C54.8355 71.0167 55.4044 68.6463 55.3728 65.9915C55.4044 63.305 54.8355 60.9347 53.6662 58.8803C52.5284 56.7944 50.9323 55.1509 48.878 53.9499C46.8553 52.7489 44.5323 52.1484 41.909 52.1484C39.9811 52.1484 38.1954 52.4961 36.552 53.1914C34.9401 53.8551 33.5337 54.8191 32.3327 56.0833C31.1317 57.3159 30.1836 58.7855 29.4882 60.4922C28.8245 62.1673 28.4769 64.0004 28.4453 65.9915C28.4769 68.6463 29.0774 71.0167 30.2468 73.1026C31.4162 75.1886 33.0122 76.832 35.0349 78.033C37.0577 79.234 39.349 79.8345 41.909 79.8345Z\" fill=\"url(#pattern0_10526_3222)\"/>\r\n<defs>\r\n<pattern id=\"pattern0_10526_3222\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\r\n<use xlink:href=\"#image0_10526_3222\" transform=\"matrix(0.000982321 0 0 0.000797448 -0.115915 0)\"/>\r\n</pattern>\r\n<image id=\"image0_10526_3222\" width=\"1254\" height=\"1254\" preserveAspectRatio=\"none\" xlink:href=\"__FRAME_IMAGE__\"/>\r\n</defs>"
  },
  {
    "id": "frame-7",
    "name": "7",
    "width": 73,
    "height": 98,
    "viewBox": "0 0 73 98",
    "innerSvg": "<path d=\"M6.63707 97.0909L44.7528 21.6179V21.049H0V0H72.0597V21.049L33.7543 97.0909H6.63707Z\" fill=\"url(#pattern0_10526_3223)\"/>\r\n<defs>\r\n<pattern id=\"pattern0_10526_3223\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\r\n<use xlink:href=\"#image0_10526_3223\" transform=\"matrix(0.00107446 0 0 0.000797448 -0.173684 0)\"/>\r\n</pattern>\r\n<image id=\"image0_10526_3223\" width=\"1254\" height=\"1254\" preserveAspectRatio=\"none\" xlink:href=\"__FRAME_IMAGE__\"/>\r\n</defs>"
  },
  {
    "id": "frame-8",
    "name": "8",
    "width": 82,
    "height": 100,
    "viewBox": "0 0 82 100",
    "innerSvg": "<path d=\"M40.7706 99.7457C32.9325 99.7457 25.932 98.5289 19.769 96.0954C13.6376 93.6618 8.80202 90.359 5.26225 86.1871C1.75408 82.0153 0 77.3061 0 72.0597C0 68.0458 0.995561 64.3796 2.98668 61.0611C5.00941 57.7425 7.72745 54.9929 11.1408 52.8121C14.5542 50.5998 18.3626 49.1776 22.5661 48.5455V47.7869C17.0352 46.8388 12.484 44.3894 8.91264 40.4387C5.37287 36.4565 3.60298 31.7631 3.60298 26.3587C3.60298 21.2702 5.21484 16.7507 8.43857 12.8001C11.6623 8.81783 16.0712 5.68892 21.6653 3.41335C27.2594 1.13778 33.6278 0 40.7706 0C47.9134 0 54.2818 1.15359 59.8759 3.46076C65.47 5.73633 69.8789 8.86524 73.1026 12.8475C76.3263 16.7981 77.9382 21.3018 77.9382 26.3587C77.9382 31.7947 76.1367 36.4881 72.5337 40.4387C68.9307 44.3894 64.4112 46.8388 58.9751 47.7869V48.5455C63.147 49.1776 66.9396 50.5998 70.353 52.8121C73.7663 54.9929 76.4844 57.7425 78.5071 61.0611C80.5298 64.3796 81.5412 68.0458 81.5412 72.0597C81.5412 77.3061 79.7713 82.0153 76.2315 86.1871C72.7234 90.359 67.8878 93.6618 61.7248 96.0954C55.5934 98.5289 48.6087 99.7457 40.7706 99.7457ZM40.7706 81.5412C43.2674 81.5412 45.4798 81.0355 47.4077 80.0242C49.3356 79.0128 50.8526 77.6222 51.9588 75.8523C53.0966 74.0508 53.6655 72.0281 53.6655 69.7841C53.6655 67.5401 53.0966 65.549 51.9588 63.8107C50.8526 62.0724 49.3356 60.7134 47.4077 59.7337C45.4798 58.7223 43.2674 58.2166 40.7706 58.2166C38.3054 58.2166 36.093 58.7223 34.1335 59.7337C32.2056 60.7134 30.6728 62.0724 29.535 63.8107C28.4288 65.549 27.8757 67.5401 27.8757 69.7841C27.8757 72.0281 28.4288 74.035 29.535 75.8049C30.6728 77.5748 32.2056 78.9812 34.1335 80.0242C36.093 81.0355 38.3054 81.5412 40.7706 81.5412ZM40.7706 40.0121C42.983 40.0121 44.9425 39.5538 46.6492 38.6373C48.3558 37.7207 49.699 36.4565 50.6788 34.8446C51.6586 33.2328 52.1484 31.4155 52.1484 29.3928C52.1484 27.37 51.6586 25.5843 50.6788 24.0357C49.699 22.4554 48.3558 21.2228 46.6492 20.3379C44.9425 19.4213 42.983 18.9631 40.7706 18.9631C38.5898 18.9631 36.6303 19.4213 34.892 20.3379C33.1854 21.2228 31.8422 22.4554 30.8624 24.0357C29.8826 25.5843 29.3928 27.37 29.3928 29.3928C29.3928 31.4155 29.8826 33.2328 30.8624 34.8446C31.8422 36.4249 33.1854 37.6891 34.892 38.6373C36.6303 39.5538 38.5898 40.0121 40.7706 40.0121Z\" fill=\"url(#pattern0_10526_3224)\"/>\r\n<defs>\r\n<pattern id=\"pattern0_10526_3224\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\r\n<use xlink:href=\"#image0_10526_3224\" transform=\"matrix(0.000975483 0 0 0.000797448 -0.111628 0)\"/>\r\n</pattern>\r\n<image id=\"image0_10526_3224\" width=\"1254\" height=\"1254\" preserveAspectRatio=\"none\" xlink:href=\"__FRAME_IMAGE__\"/>\r\n</defs>"
  },
  {
    "id": "frame-9",
    "name": "9",
    "width": 81,
    "height": 100,
    "viewBox": "0 0 81 100",
    "innerSvg": "<path d=\"M38.8747 0C44.5321 0 49.8891 0.900747 54.9459 2.70224C60.0028 4.47213 64.4749 7.26918 68.3623 11.0934C72.2813 14.9176 75.347 19.9112 77.5594 26.0742C79.8034 32.2056 80.9411 39.6328 80.9728 48.3558C81.0044 56.3203 80.0088 63.4789 77.9861 69.8315C75.9949 76.1525 73.1347 81.5412 69.4053 85.9975C65.7075 90.4538 61.2512 93.8672 56.0363 96.2376C50.8531 98.5763 45.0693 99.7457 38.6851 99.7457C31.5107 99.7457 25.2055 98.3709 19.7695 95.6213C14.3334 92.8716 10.0035 89.1738 6.77975 84.5279C3.55603 79.8819 1.67552 74.7145 1.13824 69.0256H27.1176C27.7497 71.9649 29.1404 74.0982 31.2895 75.4256C33.4387 76.7214 35.9039 77.3693 38.6851 77.3693C44.2476 77.3693 48.3089 74.9673 50.8689 70.1634C53.4605 65.3278 54.7721 58.8803 54.8037 50.821H54.2348C53.0022 53.7919 51.1375 56.3361 48.6407 58.4537C46.1439 60.5712 43.2362 62.1989 39.9177 63.3367C36.5992 64.4744 33.091 65.0433 29.3932 65.0433C23.5463 65.0433 18.4262 63.7317 14.0331 61.1085C9.64001 58.4537 6.21086 54.8349 3.74566 50.2521C1.28046 45.6378 0.0320566 40.3913 0.000451501 34.5128C-0.0311536 27.6229 1.59651 21.5863 4.88344 16.4031C8.17037 11.2198 12.7373 7.19017 18.5843 4.3141C24.4312 1.43803 31.1947 0 38.8747 0ZM39.0644 19.9112C36.4412 19.9112 34.1024 20.5117 32.048 21.7127C30.0253 22.9137 28.4293 24.5414 27.2599 26.5957C26.1221 28.65 25.569 30.973 25.6006 33.5646C25.6322 36.1562 26.2169 38.4792 27.3547 40.5336C28.5241 42.5879 30.1043 44.2156 32.0954 45.4165C34.1182 46.6175 36.4412 47.218 39.0644 47.218C40.9923 47.218 42.778 46.8862 44.4214 46.2225C46.0649 45.5272 47.4871 44.5632 48.6881 43.3306C49.9207 42.0664 50.8689 40.6126 51.5326 38.9691C52.2279 37.294 52.5598 35.4925 52.5281 33.5646C52.4965 30.973 51.896 28.65 50.7267 26.5957C49.5573 24.5414 47.9612 22.9137 45.9385 21.7127C43.9158 20.5117 41.6244 19.9112 39.0644 19.9112Z\" fill=\"url(#pattern0_10526_3225)\"/>\r\n<defs>\r\n<pattern id=\"pattern0_10526_3225\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\r\n<use xlink:href=\"#image0_10526_3225\" transform=\"matrix(0.000982322 0 0 0.000797448 -0.115916 0)\"/>\r\n</pattern>\r\n<image id=\"image0_10526_3225\" width=\"1254\" height=\"1254\" preserveAspectRatio=\"none\" xlink:href=\"__FRAME_IMAGE__\"/>\r\n</defs>"
  },
  {
    "id": "frame-a",
    "name": "A",
    "width": 72,
    "height": 70,
    "viewBox": "0 0 72 70",
    "innerSvg": "<path d=\"M47.4886 56.4277L51.521 69.785H71.9658L48.9313 0H23.0345L0 69.785H20.4448L24.4772 56.4277H47.4886ZM43.2093 42.2527H28.7565L35.7103 19.2181H36.2555L43.2093 42.2527Z\" fill=\"url(#pattern0_10526_3289)\"/>\r\n<defs>\r\n<pattern id=\"pattern0_10526_3289\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\r\n<use xlink:href=\"#image0_10526_3289\" transform=\"matrix(0.000797448 0 0 0.000822368 0 -0.015625)\"/>\r\n</pattern>\r\n<image id=\"image0_10526_3289\" width=\"1254\" height=\"1254\" preserveAspectRatio=\"none\" xlink:href=\"__FRAME_IMAGE__\"/>\r\n</defs>"
  },
  {
    "id": "frame-arch",
    "name": "Arch",
    "width": 53,
    "height": 83,
    "viewBox": "0 0 53 83",
    "innerSvg": "<path d=\"M26.5 0C33.5282 5.40629e-07 40.2685 2.84474 45.2382 7.90822C50.2079 12.9717 53 19.8392 53 27H0C1.06123e-06 19.8392 2.79206 12.9717 7.76177 7.90822C12.7315 2.84474 19.4718 -7.79101e-10 26.5 0Z\" fill=\"url(#pattern0_10526_3252)\"/>\r\n<rect y=\"27\" width=\"53\" height=\"56\" fill=\"url(#pattern1_10526_3252)\"/>\r\n<defs>\r\n<pattern id=\"pattern0_10526_3252\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\r\n<use xlink:href=\"#image0_10526_3252\" transform=\"matrix(0.000797448 0 0 0.00156536 0 -0.481481)\"/>\r\n</pattern>\r\n<pattern id=\"pattern1_10526_3252\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\r\n<use xlink:href=\"#image0_10526_3252\" transform=\"matrix(0.000842587 0 0 0.000797448 -0.0283019 0)\"/>\r\n</pattern>\r\n<image id=\"image0_10526_3252\" width=\"1254\" height=\"1254\" preserveAspectRatio=\"none\" xlink:href=\"__FRAME_IMAGE__\"/>\r\n</defs>"
  },
  {
    "id": "frame-arrow",
    "name": "Arrow",
    "width": 75,
    "height": 63,
    "viewBox": "0 0 75 63",
    "innerSvg": "<path d=\"M43.7499 62.6555V48.6555H0V13.6555H43.7499V0L74.2871 31.1555L43.7499 62.6555Z\" fill=\"url(#pattern0_10526_3275)\"/>\r\n<defs>\r\n<pattern id=\"pattern0_10526_3275\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\r\n<use xlink:href=\"#image0_10526_3275\" transform=\"matrix(0.000797448 0 0 0.00094549 0 -0.0928223)\"/>\r\n</pattern>\r\n<image id=\"image0_10526_3275\" width=\"1254\" height=\"1254\" preserveAspectRatio=\"none\" xlink:href=\"__FRAME_IMAGE__\"/>\r\n</defs>"
  },
  {
    "id": "frame-b",
    "name": "B",
    "width": 65,
    "height": 79,
    "viewBox": "0 0 65 79",
    "innerSvg": "<path d=\"M0 78.9431V0H34.2292C40.2425 0 45.292 0.809476 49.378 2.42843C53.4896 4.04738 56.5862 6.33446 58.6677 9.28969C60.7749 12.2449 61.8285 15.7269 61.8285 19.7358C61.8285 22.6396 61.186 25.2865 59.9011 27.6763C58.642 30.0662 56.8688 32.0706 54.5817 33.6896C52.2946 35.2828 49.6221 36.3878 46.5641 37.0046V37.7755C49.9562 37.904 53.0399 38.7649 55.8152 40.3581C58.5906 41.9257 60.8006 44.0971 62.4452 46.8725C64.0899 49.6221 64.9122 52.86 64.9122 56.5862C64.9122 60.9034 63.7815 64.7451 61.5201 68.1115C59.2844 71.4779 56.0979 74.1248 51.9606 76.0521C47.8233 77.9794 42.8893 78.9431 37.1588 78.9431H0ZM21.4318 61.8285H31.4539C35.0516 61.8285 37.7498 61.1603 39.5486 59.8241C41.3475 58.4621 42.2469 56.4577 42.2469 53.8108C42.2469 51.9606 41.8229 50.393 40.9748 49.1081C40.1268 47.8233 38.919 46.8468 37.3515 46.1786C35.8096 45.5105 33.9466 45.1764 31.7623 45.1764H21.4318V61.8285ZM21.4318 31.9164H30.2204C32.0963 31.9164 33.7538 31.6209 35.1929 31.0299C36.632 30.4388 37.7498 29.5908 38.5464 28.4858C39.3687 27.3551 39.7799 25.9803 39.7799 24.3613C39.7799 21.9201 38.9062 20.057 37.1588 18.7721C35.4113 17.4615 33.2013 16.8062 30.5288 16.8062H21.4318V31.9164Z\" fill=\"url(#pattern0_10526_3218)\"/>\r\n<defs>\r\n<pattern id=\"pattern0_10526_3218\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\r\n<use xlink:href=\"#image0_10526_3218\" transform=\"matrix(0.000969818 0 0 0.000797448 -0.108076 0)\"/>\r\n</pattern>\r\n<image id=\"image0_10526_3218\" width=\"1254\" height=\"1254\" preserveAspectRatio=\"none\" xlink:href=\"__FRAME_IMAGE__\"/>\r\n</defs>"
  },
  {
    "id": "frame-big-left",
    "name": "Big Left",
    "width": 83,
    "height": 79,
    "viewBox": "0 0 83 79",
    "innerSvg": "<rect width=\"53\" height=\"79\" fill=\"url(#pattern0_10526_3232)\"/>\r\n<rect x=\"55\" width=\"28\" height=\"79\" fill=\"url(#pattern1_10526_3232)\"/>\r\n<defs>\r\n<pattern id=\"pattern0_10526_3232\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\r\n<use xlink:href=\"#image0_10526_3232\" transform=\"matrix(0.00118865 0 0 0.000797448 -0.245283 0)\"/>\r\n</pattern>\r\n<pattern id=\"pattern1_10526_3232\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\r\n<use xlink:href=\"#image0_10526_3232\" transform=\"matrix(0.00224994 0 0 0.000797448 -0.910714 0)\"/>\r\n</pattern>\r\n<image id=\"image0_10526_3232\" width=\"1254\" height=\"1254\" preserveAspectRatio=\"none\" xlink:href=\"__FRAME_IMAGE__\"/>\r\n</defs>"
  },
  {
    "id": "frame-c",
    "name": "C",
    "width": 74,
    "height": 82,
    "viewBox": "0 0 74 82",
    "innerSvg": "<path d=\"M74.0091 30.683H52.269C52.1148 28.8841 51.7036 27.2523 51.0355 25.7876C50.393 24.3228 49.4936 23.0636 48.3372 22.01C47.2065 20.9307 45.8317 20.1084 44.2127 19.543C42.5938 18.952 40.7564 18.6565 38.7006 18.6565C35.1029 18.6565 32.0578 19.5302 29.5651 21.2776C27.0981 23.0251 25.2222 25.5306 23.9373 28.7942C22.6781 32.0578 22.0486 35.9767 22.0486 40.5508C22.0486 45.382 22.691 49.4294 23.9759 52.693C25.2865 55.9309 27.1752 58.3721 29.6422 60.0168C32.1092 61.6357 35.0772 62.4452 38.5464 62.4452C40.5251 62.4452 42.2983 62.2011 43.8658 61.7128C45.4334 61.1989 46.7954 60.4665 47.9518 59.5157C49.1081 58.5649 50.0461 57.4213 50.7656 56.085C51.5109 54.7231 52.012 53.1941 52.269 51.498L74.0091 51.6522C73.7522 54.9929 72.8142 58.3978 71.1952 61.867C69.5763 65.3105 67.2764 68.497 64.2954 71.4265C61.3402 74.3304 57.6783 76.6688 53.3097 78.442C48.9411 80.2151 43.8658 81.1017 38.0839 81.1017C30.8371 81.1017 24.3356 79.547 18.5794 76.4376C12.8488 73.3281 8.31318 68.754 4.97249 62.715C1.6575 56.6761 0 49.288 0 40.5508C0 31.7623 1.69604 24.3613 5.08813 18.3481C8.48021 12.3092 13.0544 7.74783 18.8107 4.66412C24.5669 1.55471 30.9913 0 38.0839 0C43.0692 0 47.6562 0.680986 51.8449 2.04296C56.0337 3.40493 59.7084 5.3965 62.8692 8.01766C66.03 10.6131 68.5741 13.8125 70.5014 17.6157C72.4287 21.419 73.598 25.7747 74.0091 30.683Z\" fill=\"url(#pattern0_10526_3217)\"/>\r\n<defs>\r\n<pattern id=\"pattern0_10526_3217\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\r\n<use xlink:href=\"#image0_10526_3217\" transform=\"matrix(0.00087387 0 0 0.000797448 -0.0479166 0)\"/>\r\n</pattern>\r\n<image id=\"image0_10526_3217\" width=\"1254\" height=\"1254\" preserveAspectRatio=\"none\" xlink:href=\"__FRAME_IMAGE__\"/>\r\n</defs>"
  },
  {
    "id": "frame-circle-collage",
    "name": "Circle Collage",
    "width": 100,
    "height": 82,
    "viewBox": "0 0 100 82",
    "innerSvg": "<path d=\"M75.0045 9.92449C68.0119 3.73408 59.0521 0.22146 49.7155 0.0101229C40.3789 -0.201214 31.2694 2.9024 24.0039 8.77008L43.4554 32.8554C45.0264 31.5866 46.9961 30.9155 49.0149 30.9612C51.0338 31.0069 52.9711 31.7664 54.4831 33.105L75.0045 9.92449Z\" fill=\"url(#pattern0_10526_3259)\"/>\r\n<path d=\"M75.0039 72.107C68.1485 78.2778 59.3646 81.7792 50.2111 81.9899C41.0577 82.2006 32.1269 79.1068 25.0039 73.2577L44.0738 49.2488C45.614 50.5136 47.545 51.1825 49.5243 51.137C51.5035 51.0914 53.4028 50.3343 54.8851 49L75.0039 72.107Z\" fill=\"url(#pattern1_10526_3259)\"/>\r\n<path d=\"M86.7688 24.6258C88.9046 29.7215 90.0039 35.183 90.0039 40.6985H59.4674C59.4674 39.1459 58.0039 35.6985 57.0039 34.6985L77.5559 11C81.5024 14.9001 84.6329 19.5301 86.7688 24.6258Z\" fill=\"url(#pattern2_10526_3259)\"/>\r\n<path d=\"M86.6651 58.861C84.1375 63.7817 80.6588 68.1354 76.4277 71.6736L56.6783 48.0567C57.8753 47.947 59.8811 43.4147 60.0015 41.9998L91.1594 42.9948C90.72 48.5489 89.1928 53.9403 86.6651 58.861Z\" fill=\"url(#pattern3_10526_3259)\"/>\r\n<path d=\"M13.3214 59.6179C10.9529 54.6186 9.63643 48.3654 9.40139 42.8549L40.1362 42.3868C39.4952 43.4037 41.7636 48.2574 42.9227 48.7085L23.1818 72.8355C19.0405 69.1085 15.6899 64.6172 13.3214 59.6179Z\" fill=\"url(#pattern4_10526_3259)\"/>\r\n<path d=\"M12.4923 23.8983C14.9783 18.9564 18.42 14.5734 22.6211 10.9995L42.5694 34.4487C41.3734 34.5685 39.4059 39.1176 39.2975 40.5334L8.13226 39.8019C8.52475 34.2442 10.0063 28.8402 12.4923 23.8983Z\" fill=\"url(#pattern5_10526_3259)\"/>\r\n<defs>\r\n<pattern id=\"pattern0_10526_3259\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\r\n<use xlink:href=\"#image0_10526_3259\" transform=\"matrix(0.000797448 0 0 0.00122853 0 -0.270285)\"/>\r\n</pattern>\r\n<pattern id=\"pattern1_10526_3259\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\r\n<use xlink:href=\"#image0_10526_3259\" transform=\"matrix(-0.000797448 0 0 -0.00120825 1 1.25758)\"/>\r\n</pattern>\r\n<pattern id=\"pattern2_10526_3259\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\r\n<use xlink:href=\"#image0_10526_3259\" transform=\"matrix(0.000797448 0 0 0.000886098 0 -0.0555837)\"/>\r\n</pattern>\r\n<pattern id=\"pattern3_10526_3259\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\r\n<use xlink:href=\"#image0_10526_3259\" transform=\"matrix(0.000797448 0 0 0.000894178 0 -0.0606498)\"/>\r\n</pattern>\r\n<pattern id=\"pattern4_10526_3259\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\r\n<use xlink:href=\"#image0_10526_3259\" transform=\"matrix(-0.000797448 0 0 -0.000867969 1 1.04422)\"/>\r\n</pattern>\r\n<pattern id=\"pattern5_10526_3259\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\r\n<use xlink:href=\"#image0_10526_3259\" transform=\"matrix(0 0.000894178 -0.000797448 0 1 -0.0606498)\"/>\r\n</pattern>\r\n<image id=\"image0_10526_3259\" width=\"1254\" height=\"1254\" preserveAspectRatio=\"none\" xlink:href=\"__FRAME_IMAGE__\"/>\r\n</defs>"
  },
  {
    "id": "frame-cloud",
    "name": "Cloud",
    "width": 76,
    "height": 64,
    "viewBox": "0 0 76 64",
    "innerSvg": "<path d=\"M38.5 0C26.8008 0 16.9785 8.03616 14.2521 18.8896C5.8712 22.4808 0 30.8047 0 40.5C0 53.4787 10.5213 64 23.5 64H52.5C65.4787 64 76 53.4787 76 40.5C76 31.2443 70.6491 23.2383 62.872 19.4069C60.3318 8.29248 50.3843 0 38.5 0Z\" fill=\"url(#pattern0_10526_3277)\"/>\r\n<defs>\r\n<pattern id=\"pattern0_10526_3277\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\r\n<use xlink:href=\"#image0_10526_3277\" transform=\"matrix(0.000797448 0 0 0.00094697 0 -0.09375)\"/>\r\n</pattern>\r\n<image id=\"image0_10526_3277\" width=\"1254\" height=\"1254\" preserveAspectRatio=\"none\" xlink:href=\"__FRAME_IMAGE__\"/>\r\n</defs>"
  },
  {
    "id": "frame-d",
    "name": "D",
    "width": 70,
    "height": 79,
    "viewBox": "0 0 70 79",
    "innerSvg": "<path d=\"M30.3746 78.9431H0V0H30.0662C38.1867 0 45.2021 1.5804 51.1126 4.74121C57.0487 7.87632 61.6229 12.3991 64.8351 18.3096C68.073 24.1943 69.6919 31.2483 69.6919 39.4715C69.6919 47.6948 68.0858 54.7616 64.8736 60.6721C61.6614 66.5568 57.113 71.0796 51.2282 74.2404C45.3434 77.3755 38.3922 78.9431 30.3746 78.9431ZM21.4318 60.7492H29.6037C33.5097 60.7492 36.8375 60.1196 39.5872 58.8604C42.3625 57.6012 44.4697 55.4298 45.9088 52.346C47.3736 49.2623 48.1059 44.9708 48.1059 39.4715C48.1059 33.9722 47.3607 29.6807 45.8702 26.597C44.4055 23.5133 42.2469 21.3419 39.3944 20.0827C36.5677 18.8235 33.0985 18.1939 28.9869 18.1939H21.4318V60.7492Z\" fill=\"url(#pattern0_10526_3216)\"/>\r\n<defs>\r\n<pattern id=\"pattern0_10526_3216\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\r\n<use xlink:href=\"#image0_10526_3216\" transform=\"matrix(0.000903304 0 0 0.000797448 -0.0663716 0)\"/>\r\n</pattern>\r\n<image id=\"image0_10526_3216\" width=\"1254\" height=\"1254\" preserveAspectRatio=\"none\" xlink:href=\"__FRAME_IMAGE__\"/>\r\n</defs>"
  },
  {
    "id": "frame-dimond-collage",
    "name": "Dimond Collage",
    "width": 67,
    "height": 84,
    "viewBox": "0 0 67 84",
    "innerSvg": "<path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M49 20L33.5 0L18 20L31.2568 35.395C31.6648 34.5685 32.5161 34 33.5 34C34.4839 34 35.3352 34.5685 35.7432 35.395L49 20Z\" fill=\"url(#pattern0_10526_3266)\"/>\r\n<path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M49 63.3945L33.5 83.3945L18 63.3945L31.2568 47.9995C31.6648 48.826 32.5161 49.3945 33.5 49.3945C34.4839 49.3945 35.3352 48.826 35.7432 47.9995L49 63.3945Z\" fill=\"url(#pattern1_10526_3266)\"/>\r\n<path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M66.9966 43L51.4966 23L38.2356 40.111C38.8953 40.3149 39.4385 40.7846 39.7397 41.395C39.9043 41.7282 39.9966 42.1033 39.9966 42.5C39.9966 43.8085 38.9912 44.8822 37.7109 44.9909L51.4966 61L66.9966 43Z\" fill=\"url(#pattern2_10526_3266)\"/>\r\n<path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M-0.000488281 43L15.4995 23L28.7605 40.111C28.1008 40.3149 27.5576 40.7846 27.2563 41.395C27.0918 41.7282 26.9995 42.1033 26.9995 42.5C26.9995 43.8085 28.0049 44.8822 29.2852 44.9909L15.4995 61L-0.000488281 43Z\" fill=\"url(#pattern3_10526_3266)\"/>\r\n<defs>\r\n<pattern id=\"pattern0_10526_3266\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\r\n<use xlink:href=\"#image0_10526_3266\" transform=\"matrix(0.000910507 0 0 0.000797448 -0.0708877 0)\"/>\r\n</pattern>\r\n<pattern id=\"pattern1_10526_3266\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\r\n<use xlink:href=\"#image0_10526_3266\" transform=\"matrix(-0.000910507 0 0 -0.000797448 1.07089 1)\"/>\r\n</pattern>\r\n<pattern id=\"pattern2_10526_3266\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\r\n<use xlink:href=\"#image0_10526_3266\" transform=\"matrix(0.00103474 0 0 0.000797448 -0.148782 0)\"/>\r\n</pattern>\r\n<pattern id=\"pattern3_10526_3266\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\r\n<use xlink:href=\"#image0_10526_3266\" transform=\"matrix(0.00103474 0 0 0.000797448 -0.148782 0)\"/>\r\n</pattern>\r\n<image id=\"image0_10526_3266\" width=\"1254\" height=\"1254\" preserveAspectRatio=\"none\" xlink:href=\"__FRAME_IMAGE__\"/>\r\n</defs>"
  },
  {
    "id": "frame-e",
    "name": "E",
    "width": 56,
    "height": 77,
    "viewBox": "0 0 56 77",
    "innerSvg": "<path d=\"M0 76.5326V0H55.1573V16.7415H20.7774V29.8955H52.3172V46.6371H20.7774V59.7911H55.0078V76.5326H0Z\" fill=\"url(#pattern0_10526_3290)\"/>\r\n<defs>\r\n<pattern id=\"pattern0_10526_3290\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\r\n<use xlink:href=\"#image0_10526_3290\" transform=\"matrix(0.00110649 0 0 0.000797448 -0.193767 0)\"/>\r\n</pattern>\r\n<image id=\"image0_10526_3290\" width=\"1254\" height=\"1254\" preserveAspectRatio=\"none\" xlink:href=\"__FRAME_IMAGE__\"/>\r\n</defs>"
  },
  {
    "id": "frame-f",
    "name": "F",
    "width": 54,
    "height": 77,
    "viewBox": "0 0 54 77",
    "innerSvg": "<path d=\"M0 76.5326V0H53.812V16.7415H20.7774V29.8955H50.5235V46.6371H20.7774V76.5326H0Z\" fill=\"url(#pattern0_10526_3291)\"/>\r\n<defs>\r\n<pattern id=\"pattern0_10526_3291\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\r\n<use xlink:href=\"#image0_10526_3291\" transform=\"matrix(0.00113415 0 0 0.000797448 -0.211111 0)\"/>\r\n</pattern>\r\n<image id=\"image0_10526_3291\" width=\"1254\" height=\"1254\" preserveAspectRatio=\"none\" xlink:href=\"__FRAME_IMAGE__\"/>\r\n</defs>"
  },
  {
    "id": "frame-g",
    "name": "G",
    "width": 72,
    "height": 79,
    "viewBox": "0 0 72 79",
    "innerSvg": "<path d=\"M50.0003 26.3081C49.6764 24.9877 49.1657 23.8292 48.4682 22.8327C47.7706 21.8113 46.8986 20.9518 45.8523 20.2542C44.8309 19.5318 43.635 18.9961 42.2648 18.6473C40.9195 18.2737 39.4372 18.0868 37.8179 18.0868C34.3301 18.0868 31.353 18.9214 28.8866 20.5906C26.4451 22.2597 24.5766 24.6638 23.2812 27.8029C22.0106 30.9419 21.3753 34.7287 21.3753 39.1632C21.3753 43.6475 21.9857 47.4841 23.2064 50.673C24.4272 53.8618 26.2458 56.3033 28.6624 57.9974C31.0789 59.6914 34.0809 60.5385 37.6684 60.5385C40.8323 60.5385 43.4607 60.0776 45.5533 59.1558C47.6709 58.234 49.2529 56.9261 50.2993 55.232C51.3456 53.5379 51.8688 51.5449 51.8688 49.2529L55.4562 49.6266H37.9673V34.8283H71.8988V45.4412C71.8988 52.4169 70.4165 58.3835 67.4518 63.3412C64.5121 68.274 60.4513 72.0607 55.2694 74.7015C50.1124 77.3174 44.1956 78.6253 37.5189 78.6253C30.0699 78.6253 23.5303 77.0433 17.9 73.8794C12.2696 70.7154 7.87249 66.2062 4.70855 60.3516C1.56952 54.4971 0 47.5339 0 39.4621C0 33.1342 0.959149 27.5288 2.87745 22.6459C4.82066 17.7629 7.51126 13.6398 10.9492 10.2766C14.3872 6.88843 18.3609 4.33486 22.8701 2.61586C27.3793 0.871953 32.2125 0 37.3694 0C41.9036 0 46.1139 0.647738 50.0003 1.94321C53.9116 3.21377 57.3621 5.03242 60.3516 7.39915C63.3661 9.74097 65.7951 12.5188 67.6387 15.7325C69.4822 18.9463 70.6033 22.4715 71.0019 26.3081H50.0003Z\" fill=\"url(#pattern0_10526_3292)\"/>\r\n<defs>\r\n<pattern id=\"pattern0_10526_3292\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\r\n<use xlink:href=\"#image0_10526_3292\" transform=\"matrix(0.000872054 0 0 0.000797448 -0.0467776 0)\"/>\r\n</pattern>\r\n<image id=\"image0_10526_3292\" width=\"1254\" height=\"1254\" preserveAspectRatio=\"none\" xlink:href=\"__FRAME_IMAGE__\"/>\r\n</defs>"
  },
  {
    "id": "frame-h",
    "name": "H",
    "width": 70,
    "height": 77,
    "viewBox": "0 0 70 77",
    "innerSvg": "<path d=\"M0 76.5326V0H20.7774V29.8955H48.2813V0H69.0587V76.5326H48.2813V46.6371H20.7774V76.5326H0Z\" fill=\"url(#pattern0_10526_3293)\"/>\r\n<defs>\r\n<pattern id=\"pattern0_10526_3293\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\r\n<use xlink:href=\"#image0_10526_3293\" transform=\"matrix(0.000883752 0 0 0.000797448 -0.0541126 0)\"/>\r\n</pattern>\r\n<image id=\"image0_10526_3293\" width=\"1254\" height=\"1254\" preserveAspectRatio=\"none\" xlink:href=\"__FRAME_IMAGE__\"/>\r\n</defs>"
  },
  {
    "id": "frame-heart",
    "name": "Heart",
    "width": 85,
    "height": 75,
    "viewBox": "0 0 85 75",
    "innerSvg": "<path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M43.1873 11.2146L38.6025 6.62709C29.7265 -2.25437 15.3874 -2.20213 6.57537 6.74361C-2.23675 15.6894 -2.18497 30.141 6.69099 39.0222L34.9649 67.3132C35.5636 68.0203 36.1931 68.71 36.8536 69.3806L42.3892 75L78.4483 38.9193C87.1395 30.2227 87.1902 16.072 78.5615 7.31248C69.9329 -1.44708 55.8923 -1.49804 47.2012 7.19832L43.1873 11.2146Z\" fill=\"url(#pattern0_10526_3226)\"/>\r\n<defs>\r\n<pattern id=\"pattern0_10526_3226\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\r\n<use xlink:href=\"#image0_10526_3226\" transform=\"matrix(0.000797448 0 0 0.000903775 0 -0.0666667)\"/>\r\n</pattern>\r\n<image id=\"image0_10526_3226\" width=\"1254\" height=\"1254\" preserveAspectRatio=\"none\" xlink:href=\"__FRAME_IMAGE__\"/>\r\n</defs>"
  },
  {
    "id": "frame-hexagon-collage",
    "name": "Hexagon Collage",
    "width": 84,
    "height": 80,
    "viewBox": "0 0 84 80",
    "innerSvg": "<path d=\"M42 0L61.0526 11V33L42 44L22.9474 33V11L42 0Z\" fill=\"url(#pattern0_10526_3255)\"/>\r\n<path d=\"M62 36L81.0526 47V69L62 80L42.9474 69V47L62 36Z\" fill=\"url(#pattern1_10526_3255)\"/>\r\n<path d=\"M22 36L41.0526 47V69L22 80L2.94744 69V47L22 36Z\" fill=\"url(#pattern2_10526_3255)\"/>\r\n<defs>\r\n<pattern id=\"pattern0_10526_3255\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\r\n<use xlink:href=\"#image0_10526_3255\" transform=\"scale(0.000797448)\"/>\r\n</pattern>\r\n<pattern id=\"pattern1_10526_3255\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\r\n<use xlink:href=\"#image0_10526_3255\" transform=\"scale(0.000797448)\"/>\r\n</pattern>\r\n<pattern id=\"pattern2_10526_3255\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\r\n<use xlink:href=\"#image0_10526_3255\" transform=\"scale(0.000797448)\"/>\r\n</pattern>\r\n<image id=\"image0_10526_3255\" width=\"1254\" height=\"1254\" preserveAspectRatio=\"none\" xlink:href=\"__FRAME_IMAGE__\"/>\r\n</defs>"
  },
  {
    "id": "frame-house",
    "name": "House",
    "width": 77,
    "height": 66,
    "viewBox": "0 0 77 66",
    "innerSvg": "<path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M76.5 37.5L63 24.5192V8H53V14.9038L37.5 0L0 37.5H8V66H68V37.5H76.5Z\" fill=\"url(#pattern0_10526_3287)\"/>\r\n<defs>\r\n<pattern id=\"pattern0_10526_3287\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\r\n<use xlink:href=\"#image0_10526_3287\" transform=\"matrix(0.000797448 0 0 0.000924315 0 -0.0795455)\"/>\r\n</pattern>\r\n<image id=\"image0_10526_3287\" width=\"1254\" height=\"1254\" preserveAspectRatio=\"none\" xlink:href=\"__FRAME_IMAGE__\"/>\r\n</defs>"
  },
  {
    "id": "frame-i",
    "name": "I",
    "width": 21,
    "height": 77,
    "viewBox": "0 0 21 77",
    "innerSvg": "<path d=\"M20.7774 0V76.5326H0V0H20.7774Z\" fill=\"url(#pattern0_10526_3294)\"/>\r\n<defs>\r\n<pattern id=\"pattern0_10526_3294\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\r\n<use xlink:href=\"#image0_10526_3294\" transform=\"matrix(0.00293736 0 0 0.000797448 -1.34173 0)\"/>\r\n</pattern>\r\n<image id=\"image0_10526_3294\" width=\"1254\" height=\"1254\" preserveAspectRatio=\"none\" xlink:href=\"__FRAME_IMAGE__\"/>\r\n</defs>"
  },
  {
    "id": "frame-j",
    "name": "J",
    "width": 56,
    "height": 78,
    "viewBox": "0 0 56 78",
    "innerSvg": "<path d=\"M35.2771 0H55.7556V52.4667C55.7307 57.4493 54.4726 61.834 51.9813 65.6207C49.5149 69.3826 46.1018 72.3223 41.742 74.4399C37.4072 76.5326 32.4121 77.5789 26.7569 77.5789C21.849 77.5789 17.3647 76.7319 13.3039 75.0378C9.24309 73.3188 6.0044 70.6282 3.58785 66.966C1.17129 63.2789 -0.0245316 58.4956 0.00038132 52.6162H20.7778C20.8525 54.5345 21.1764 56.1538 21.7494 57.4742C22.3473 58.7946 23.1694 59.7911 24.2158 60.4637C25.287 61.1115 26.5825 61.4354 28.1022 61.4354C29.6468 61.4354 30.9423 61.099 31.9886 60.4264C33.0599 59.7537 33.8695 58.7572 34.4176 57.4368C34.9657 56.0915 35.2522 54.4348 35.2771 52.4667V0Z\" fill=\"url(#pattern0_10526_3295)\"/>\r\n<defs>\r\n<pattern id=\"pattern0_10526_3295\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\r\n<use xlink:href=\"#image0_10526_3295\" transform=\"matrix(0.00110958 0 0 0.000797448 -0.195706 0)\"/>\r\n</pattern>\r\n<image id=\"image0_10526_3295\" width=\"1254\" height=\"1254\" preserveAspectRatio=\"none\" xlink:href=\"__FRAME_IMAGE__\"/>\r\n</defs>"
  },
  {
    "id": "frame-k",
    "name": "K",
    "width": 70,
    "height": 77,
    "viewBox": "0 0 70 77",
    "innerSvg": "<path d=\"M0 76.5326V0H20.7774V30.9419H21.8238L44.8433 0H69.0587L43.1991 34.0809L69.6566 76.5326H44.8433L27.6534 47.8329L20.7774 56.8015V76.5326H0Z\" fill=\"url(#pattern0_10526_3296)\"/>\r\n<defs>\r\n<pattern id=\"pattern0_10526_3296\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\r\n<use xlink:href=\"#image0_10526_3296\" transform=\"matrix(0.000876166 0 0 0.000797448 -0.0493563 0)\"/>\r\n</pattern>\r\n<image id=\"image0_10526_3296\" width=\"1254\" height=\"1254\" preserveAspectRatio=\"none\" xlink:href=\"__FRAME_IMAGE__\"/>\r\n</defs>"
  },
  {
    "id": "frame-l",
    "name": "L",
    "width": 52,
    "height": 77,
    "viewBox": "0 0 52 77",
    "innerSvg": "<path d=\"M0 76.5326V0H20.7774V59.7911H51.7193V76.5326H0Z\" fill=\"url(#pattern0_10526_3297)\"/>\r\n<defs>\r\n<pattern id=\"pattern0_10526_3297\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\r\n<use xlink:href=\"#image0_10526_3297\" transform=\"matrix(0.00118004 0 0 0.000797448 -0.239884 0)\"/>\r\n</pattern>\r\n<image id=\"image0_10526_3297\" width=\"1254\" height=\"1254\" preserveAspectRatio=\"none\" xlink:href=\"__FRAME_IMAGE__\"/>\r\n</defs>"
  },
  {
    "id": "frame-left-right",
    "name": "Left Right",
    "width": 85,
    "height": 82,
    "viewBox": "0 0 85 82",
    "innerSvg": "<rect y=\"4\" width=\"41\" height=\"78\" fill=\"url(#pattern0_10526_3238)\"/>\r\n<rect x=\"44\" width=\"41\" height=\"78\" fill=\"url(#pattern1_10526_3238)\"/>\r\n<defs>\r\n<pattern id=\"pattern0_10526_3238\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\r\n<use xlink:href=\"#image0_10526_3238\" transform=\"matrix(0.0015171 0 0 0.000797448 -0.45122 0)\"/>\r\n</pattern>\r\n<pattern id=\"pattern1_10526_3238\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\r\n<use xlink:href=\"#image0_10526_3238\" transform=\"matrix(0.0015171 0 0 0.000797448 -0.45122 0)\"/>\r\n</pattern>\r\n<image id=\"image0_10526_3238\" width=\"1254\" height=\"1254\" preserveAspectRatio=\"none\" xlink:href=\"__FRAME_IMAGE__\"/>\r\n</defs>"
  },
  {
    "id": "frame-m",
    "name": "M",
    "width": 89,
    "height": 77,
    "viewBox": "0 0 89 77",
    "innerSvg": "<path d=\"M0 0H25.8597L43.6475 43.3485H44.5444L62.3322 0H88.1919V76.5326H67.8629V32.2872H67.265L50.2245 75.9347H37.9673L20.9269 31.9882H20.329V76.5326H0V0Z\" fill=\"url(#pattern0_10526_3298)\"/>\r\n<defs>\r\n<pattern id=\"pattern0_10526_3298\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\r\n<use xlink:href=\"#image0_10526_3298\" transform=\"matrix(0.000797448 0 0 0.000918934 0 -0.0761719)\"/>\r\n</pattern>\r\n<image id=\"image0_10526_3298\" width=\"1254\" height=\"1254\" preserveAspectRatio=\"none\" xlink:href=\"__FRAME_IMAGE__\"/>\r\n</defs>"
  },
  {
    "id": "frame-mobile",
    "name": "mobile",
    "width": 38,
    "height": 70,
    "viewBox": "0 0 38 70",
    "innerSvg": "<rect x=\"0.5\" y=\"0.5\" width=\"37\" height=\"69\" rx=\"2.5\" fill=\"url(#pattern0_10526_3301)\" stroke=\"black\"/>\r\n<path d=\"M11 1H27V4H11V1Z\" fill=\"black\"/>\r\n<defs>\r\n<pattern id=\"pattern0_10526_3301\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\r\n<use xlink:href=\"#image0_10526_3301\" transform=\"matrix(0.00146898 0 0 0.000797448 -0.421053 0)\"/>\r\n</pattern>\r\n<image id=\"image0_10526_3301\" width=\"1254\" height=\"1254\" preserveAspectRatio=\"none\" xlink:href=\"__FRAME_IMAGE__\"/>\r\n</defs>"
  },
  {
    "id": "frame-n",
    "name": "N",
    "width": 67,
    "height": 77,
    "viewBox": "0 0 67 77",
    "innerSvg": "<path d=\"M66.2186 0V76.5326H48.8792L21.2258 36.3231H20.7774V76.5326H0V0H17.6384L44.8433 40.06H45.4412V0H66.2186Z\" fill=\"url(#pattern0_10526_3299)\"/>\r\n<defs>\r\n<pattern id=\"pattern0_10526_3299\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\r\n<use xlink:href=\"#image0_10526_3299\" transform=\"matrix(0.000921656 0 0 0.000797448 -0.0778781 0)\"/>\r\n</pattern>\r\n<image id=\"image0_10526_3299\" width=\"1254\" height=\"1254\" preserveAspectRatio=\"none\" xlink:href=\"__FRAME_IMAGE__\"/>\r\n</defs>"
  },
  {
    "id": "frame-o",
    "name": "O",
    "width": 75,
    "height": 79,
    "viewBox": "0 0 75 79",
    "innerSvg": "<path d=\"M74.4399 39.3126C74.4399 47.8329 72.7832 55.0203 69.4698 60.8748C66.1564 66.7044 61.6845 71.1265 56.0542 74.141C50.4238 77.1305 44.1458 78.6253 37.22 78.6253C30.2443 78.6253 23.9414 77.1181 18.311 74.1036C12.7056 71.0642 8.24619 66.6297 4.93277 60.8001C1.64426 54.9455 0 47.7831 0 39.3126C0 30.7924 1.64426 23.6175 4.93277 17.7879C8.24619 11.9333 12.7056 7.51126 18.311 4.5217C23.9414 1.50723 30.2443 0 37.22 0C44.1458 0 50.4238 1.50723 56.0542 4.5217C61.6845 7.51126 66.1564 11.9333 69.4698 17.7879C72.7832 23.6175 74.4399 30.7924 74.4399 39.3126ZM53.0646 39.3126C53.0646 34.7287 52.4542 30.8672 51.2335 27.7281C50.0377 24.5642 48.2564 22.1725 45.8897 20.5532C43.5478 18.9089 40.6579 18.0868 37.22 18.0868C33.782 18.0868 30.8796 18.9089 28.5129 20.5532C26.1711 22.1725 24.3898 24.5642 23.1691 27.7281C21.9732 30.8672 21.3753 34.7287 21.3753 39.3126C21.3753 43.8966 21.9732 47.7706 23.1691 50.9345C24.3898 54.0736 26.1711 56.4652 28.5129 58.1095C30.8796 59.7288 33.782 60.5385 37.22 60.5385C40.6579 60.5385 43.5478 59.7288 45.8897 58.1095C48.2564 56.4652 50.0377 54.0736 51.2335 50.9345C52.4542 47.7706 53.0646 43.8966 53.0646 39.3126Z\" fill=\"url(#pattern0_10526_3300)\"/>\r\n<defs>\r\n<pattern id=\"pattern0_10526_3300\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\r\n<use xlink:href=\"#image0_10526_3300\" transform=\"matrix(0.000842285 0 0 0.000797448 -0.0281125 0)\"/>\r\n</pattern>\r\n<image id=\"image0_10526_3300\" width=\"1254\" height=\"1254\" preserveAspectRatio=\"none\" xlink:href=\"__FRAME_IMAGE__\"/>\r\n</defs>"
  },
  {
    "id": "frame-off-set",
    "name": "Off set",
    "width": 80,
    "height": 92,
    "viewBox": "0 0 80 92",
    "innerSvg": "<rect width=\"46\" height=\"72\" fill=\"url(#pattern0_10526_3249)\"/>\r\n<rect x=\"34\" y=\"20\" width=\"46\" height=\"72\" fill=\"url(#pattern1_10526_3249)\"/>\r\n<defs>\r\n<pattern id=\"pattern0_10526_3249\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\r\n<use xlink:href=\"#image0_10526_3249\" transform=\"matrix(0.00124818 0 0 0.000797448 -0.282609 0)\"/>\r\n</pattern>\r\n<pattern id=\"pattern1_10526_3249\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\r\n<use xlink:href=\"#image0_10526_3249\" transform=\"matrix(0.00124818 0 0 0.000797448 -0.282609 0)\"/>\r\n</pattern>\r\n<image id=\"image0_10526_3249\" width=\"1254\" height=\"1254\" preserveAspectRatio=\"none\" xlink:href=\"__FRAME_IMAGE__\"/>\r\n</defs>"
  },
  {
    "id": "frame-p",
    "name": "P",
    "width": 68,
    "height": 84,
    "viewBox": "0 0 68 84",
    "innerSvg": "<path d=\"M0 0V83.5412H22.6801V58.7399H35.2439C41.6074 58.7399 47.1687 57.5569 51.9277 55.191C56.7139 52.8251 60.4259 49.453 63.0638 45.0747C65.7288 40.6964 67.0613 35.5159 67.0613 29.5331C67.0613 23.6047 65.7696 18.4242 63.1862 13.9915C60.6027 9.55883 56.9858 6.11874 52.3356 3.67124C47.6854 1.22375 42.2601 0 36.0598 0H0ZM22.6801 41.1179V18.1115H30.6753C33.3403 18.1115 35.611 18.5738 37.4875 19.4984C39.3911 20.3958 40.846 21.7011 41.8522 23.4144C42.8855 25.1004 43.4022 27.14 43.4022 29.5331C43.4022 31.899 42.8855 33.9522 41.8522 35.6926C40.846 37.4331 39.3911 38.7792 37.4875 39.731C35.611 40.6556 33.3403 41.1179 30.6753 41.1179H22.6801Z\" fill=\"url(#pattern0_10712_1842)\"/>\r\n<defs>\r\n<pattern id=\"pattern0_10712_1842\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\r\n<use xlink:href=\"#image0_10712_1842\" transform=\"matrix(0.000993415 0 0 0.000797448 -0.122871 0)\"/>\r\n</pattern>\r\n<image id=\"image0_10712_1842\" width=\"1254\" height=\"1254\" preserveAspectRatio=\"none\" xlink:href=\"__FRAME_IMAGE__\"/>\r\n</defs>"
  },
  {
    "id": "frame-q",
    "name": "Q",
    "width": 82,
    "height": 91,
    "viewBox": "0 0 82 91",
    "innerSvg": "<path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M75.8315 66.4495C73.8461 69.9427 71.4796 72.9729 68.732 75.5401L81.42 90.8836H61.3505L55.0624 83.5646C50.5776 85.0719 45.7663 85.8255 40.6284 85.8255C33.014 85.8255 26.1338 84.1802 19.9879 80.8897C13.8691 77.572 9.00134 72.7314 5.38449 66.3679C1.79483 59.9772 0 52.1588 0 42.9127C0 33.6123 1.79483 25.7803 5.38449 19.4168C9.00134 13.0261 13.8691 8.19911 19.9879 4.93578C26.1338 1.64526 33.014 0 40.6284 0C48.1884 0 55.0414 1.64526 61.1874 4.93578C67.3333 8.19911 72.2147 13.0261 75.8315 19.4168C79.4484 25.7803 81.2568 33.6123 81.2568 42.9127C81.2568 52.2132 79.4484 60.0588 75.8315 66.4495ZM40.6284 66.0824C41.0836 66.0824 41.53 66.0694 41.9676 66.0434L32.6333 53.6817H50.2552L54.3573 58.8356C54.9551 57.8526 55.4777 56.7737 55.9253 55.5989C57.2578 52.1452 57.924 47.9165 57.924 42.9127C57.924 37.909 57.2578 33.6938 55.9253 30.2674C54.6199 26.8137 52.6755 24.203 50.0921 22.4354C47.5358 20.6405 44.3812 19.7431 40.6284 19.7431C36.8756 19.7431 33.7074 20.6405 31.124 22.4354C28.5677 24.203 26.6233 26.8137 25.2908 30.2674C23.9854 33.6938 23.3328 37.909 23.3328 42.9127C23.3328 47.9165 23.9854 52.1452 25.2908 55.5989C26.6233 59.0254 28.5677 61.6361 31.124 63.4309C33.7074 65.1985 36.8756 66.0824 40.6284 66.0824Z\" fill=\"url(#pattern0_10712_1843)\"/>\r\n<defs>\r\n<pattern id=\"pattern0_10712_1843\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\r\n<use xlink:href=\"#image0_10712_1843\" transform=\"matrix(0.000890138 0 0 0.000797448 -0.0581162 0)\"/>\r\n</pattern>\r\n<image id=\"image0_10712_1843\" width=\"1254\" height=\"1254\" preserveAspectRatio=\"none\" xlink:href=\"__FRAME_IMAGE__\"/>\r\n</defs>"
  },
  {
    "id": "frame-r",
    "name": "R",
    "width": 70,
    "height": 84,
    "viewBox": "0 0 70 84",
    "innerSvg": "<path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M52.8696 52.3934C57.2035 50.3138 60.6016 47.3575 63.0638 43.5246C65.7288 39.4183 67.0613 34.3737 67.0613 28.3909C67.0613 22.4626 65.7696 17.3772 63.1862 13.1349C60.6027 8.89257 56.9858 5.64284 52.3356 3.3857C47.6854 1.12857 42.2601 0 36.0598 0H0V83.5412H22.6801V55.966H30.5295L45.1971 83.5412H69.8352L52.8696 52.3934ZM22.6801 18.1115V38.3441H30.6753C33.3403 38.3441 35.611 38.0178 37.4875 37.3651C39.3911 36.6852 40.846 35.611 41.8522 34.1426C42.8855 32.6741 43.4022 30.7569 43.4022 28.3909C43.4022 25.9978 42.8855 24.0534 41.8522 22.5577C40.846 21.0349 39.3911 19.9199 37.4875 19.2128C35.611 18.4786 33.3403 18.1115 30.6753 18.1115H22.6801Z\" fill=\"url(#pattern0_10712_1851)\"/>\r\n<defs>\r\n<pattern id=\"pattern0_10712_1851\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\r\n<use xlink:href=\"#image0_10712_1851\" transform=\"matrix(0.000953957 0 0 0.000797448 -0.0981308 0)\"/>\r\n</pattern>\r\n<image id=\"image0_10712_1851\" width=\"1254\" height=\"1254\" preserveAspectRatio=\"none\" xlink:href=\"__FRAME_IMAGE__\"/>\r\n</defs>"
  },
  {
    "id": "frame-s",
    "name": "S",
    "width": 70,
    "height": 86,
    "viewBox": "0 0 70 86",
    "innerSvg": "<path d=\"M47.1551 27.2488C46.9375 24.5293 45.9177 22.4082 44.0957 20.8853C42.3009 19.3624 39.5678 18.601 35.8966 18.601C33.5579 18.601 31.6407 18.8865 30.145 19.4576C28.6765 20.0015 27.5887 20.7493 26.8817 21.7011C26.1746 22.6529 25.8075 23.7407 25.7803 24.9644C25.7259 25.9706 25.9027 26.8816 26.3106 27.6975C26.7457 28.4861 27.4255 29.2068 28.3501 29.8594C29.2748 30.4849 30.4577 31.056 31.899 31.5727C33.3403 32.0894 35.0536 32.5517 37.0388 32.9596L43.8917 34.4281C48.5148 35.4071 52.4716 36.6988 55.7621 38.3033C59.0526 39.9078 61.7449 41.7978 63.8388 43.9733C65.9328 46.1217 67.4693 48.542 68.4483 51.2342C69.4545 53.9265 69.9712 56.8635 69.9984 60.0452C69.9712 65.5385 68.5978 70.1887 65.8784 73.9959C63.159 77.8031 59.2702 80.6993 54.212 82.6845C49.181 84.6697 43.1303 85.6623 36.0598 85.6623C28.7989 85.6623 22.4626 84.5881 17.0509 82.4398C11.6664 80.2914 7.47846 76.9873 4.48707 72.5274C1.52289 68.0404 0.0271944 62.3023 0 55.3134H21.538C21.6739 57.8697 22.313 60.018 23.4552 61.7584C24.5973 63.4989 26.2018 64.8178 28.2686 65.7152C30.3625 66.6126 32.8508 67.0614 35.7334 67.0614C38.1537 67.0614 40.1797 66.7622 41.8114 66.1639C43.443 65.5657 44.6804 64.7362 45.5234 63.6757C46.3664 62.6151 46.8015 61.4049 46.8287 60.0452C46.8015 58.7671 46.38 57.6521 45.5642 56.7003C44.7756 55.7213 43.4702 54.8511 41.6482 54.0896C39.8262 53.301 37.3651 52.5667 34.2649 51.8869L25.9434 50.0921C18.5466 48.4876 12.7134 45.8089 8.44386 42.0561C4.20153 38.2761 2.09397 33.1228 2.12116 26.5961C2.09397 21.2932 3.50808 16.6566 6.36349 12.6862C9.24609 8.68861 13.2301 5.57485 18.3154 3.34491C23.428 1.11497 29.2884 0 35.8966 0C42.6408 0 48.474 1.12857 53.3962 3.3857C58.3184 5.64284 62.112 8.82458 64.777 12.9309C67.4693 17.0101 68.829 21.7827 68.8562 27.2488H47.1551Z\" fill=\"url(#pattern0_10712_1862)\"/>\r\n<defs>\r\n<pattern id=\"pattern0_10712_1862\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\r\n<use xlink:href=\"#image0_10712_1862\" transform=\"matrix(0.000975898 0 0 0.000797448 -0.111888 0)\"/>\r\n</pattern>\r\n<image id=\"image0_10712_1862\" width=\"1254\" height=\"1254\" preserveAspectRatio=\"none\" xlink:href=\"__FRAME_IMAGE__\"/>\r\n</defs>"
  },
  {
    "id": "frame-single",
    "name": "Single",
    "width": 82,
    "height": 69,
    "viewBox": "0 0 82 69",
    "innerSvg": "<rect width=\"82\" height=\"69\" fill=\"url(#pattern0_10526_3227)\"/>\r\n<defs>\r\n<pattern id=\"pattern0_10526_3227\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\r\n<use xlink:href=\"#image0_10526_3227\" transform=\"matrix(0.000797448 0 0 0.000947692 0 -0.0942029)\"/>\r\n</pattern>\r\n<image id=\"image0_10526_3227\" width=\"1254\" height=\"1254\" preserveAspectRatio=\"none\" xlink:href=\"__FRAME_IMAGE__\"/>\r\n</defs>"
  },
  {
    "id": "frame-split",
    "name": "Split",
    "width": 82,
    "height": 92,
    "viewBox": "0 0 82 92",
    "innerSvg": "<path d=\"M0 0H58L19 83H0V0Z\" fill=\"url(#pattern0_10526_3241)\"/>\r\n<path d=\"M82 92H24L63 9H82V92Z\" fill=\"url(#pattern1_10526_3241)\"/>\r\n<defs>\r\n<pattern id=\"pattern0_10526_3241\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\r\n<use xlink:href=\"#image0_10526_3241\" transform=\"matrix(0.00114118 0 0 0.000797448 -0.215517 0)\"/>\r\n</pattern>\r\n<pattern id=\"pattern1_10526_3241\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\r\n<use xlink:href=\"#image0_10526_3241\" transform=\"matrix(-0.00114118 0 0 -0.000797448 1.21552 1)\"/>\r\n</pattern>\r\n<image id=\"image0_10526_3241\" width=\"1254\" height=\"1254\" preserveAspectRatio=\"none\" xlink:href=\"__FRAME_IMAGE__\"/>\r\n</defs>"
  },
  {
    "id": "frame-t",
    "name": "T",
    "width": 73,
    "height": 84,
    "viewBox": "0 0 73 84",
    "innerSvg": "<path d=\"M0 18.2746V0H72.609V18.2746H47.4814V83.5412H25.1276V18.2746H0Z\" fill=\"url(#pattern0_10712_1863)\"/>\r\n<defs>\r\n<pattern id=\"pattern0_10712_1863\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\r\n<use xlink:href=\"#image0_10712_1863\" transform=\"matrix(0.000917513 0 0 0.000797448 -0.0752809 0)\"/>\r\n</pattern>\r\n<image id=\"image0_10712_1863\" width=\"1254\" height=\"1254\" preserveAspectRatio=\"none\" xlink:href=\"__FRAME_IMAGE__\"/>\r\n</defs>"
  },
  {
    "id": "frame-tab",
    "name": "tab",
    "width": 63,
    "height": 70,
    "viewBox": "0 0 63 70",
    "innerSvg": "<rect x=\"1.5\" y=\"1.5\" width=\"60\" height=\"67\" rx=\"1.5\" fill=\"url(#pattern0_10526_3304)\" stroke=\"black\" stroke-width=\"3\"/>\r\n<defs>\r\n<pattern id=\"pattern0_10526_3304\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\r\n<use xlink:href=\"#image0_10526_3304\" transform=\"matrix(0.000886054 0 0 0.000797448 -0.0555556 0)\"/>\r\n</pattern>\r\n<image id=\"image0_10526_3304\" width=\"1254\" height=\"1254\" preserveAspectRatio=\"none\" xlink:href=\"__FRAME_IMAGE__\"/>\r\n</defs>"
  },
  {
    "id": "frame-tag",
    "name": "Tag",
    "width": 40,
    "height": 70,
    "viewBox": "0 0 40 70",
    "innerSvg": "<path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M8 0L0 10.5V65.5L4.5 70H36L40 65.5V10.5L32 0H8ZM27 12.5C27 16.0899 24.0898 19 20.5 19C16.9102 19 14 16.0899 14 12.5C14 8.91015 16.9102 6 20.5 6C24.0898 6 27 8.91015 27 12.5Z\" fill=\"url(#pattern0_10526_3288)\"/>\r\n<defs>\r\n<pattern id=\"pattern0_10526_3288\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\r\n<use xlink:href=\"#image0_10526_3288\" transform=\"matrix(0.00139553 0 0 0.000797448 -0.375 0)\"/>\r\n</pattern>\r\n<image id=\"image0_10526_3288\" width=\"1254\" height=\"1254\" preserveAspectRatio=\"none\" xlink:href=\"__FRAME_IMAGE__\"/>\r\n</defs>"
  },
  {
    "id": "frame-teardrop",
    "name": "Teardrop",
    "width": 49,
    "height": 74,
    "viewBox": "0 0 49 74",
    "innerSvg": "<path d=\"M2.01683 39.75C0.719341 42.7379 0 46.0349 0 49.5C0 63.031 10.969 74 24.5 74C38.031 74 49 63.031 49 49.5C49 46.0349 48.2807 42.7379 46.9832 39.75L24.5 0L2.01683 39.75Z\" fill=\"url(#pattern0_10526_3276)\"/>\r\n<defs>\r\n<pattern id=\"pattern0_10526_3276\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\r\n<use xlink:href=\"#image0_10526_3276\" transform=\"matrix(0.00120431 0 0 0.000797448 -0.255102 0)\"/>\r\n</pattern>\r\n<image id=\"image0_10526_3276\" width=\"1254\" height=\"1254\" preserveAspectRatio=\"none\" xlink:href=\"__FRAME_IMAGE__\"/>\r\n</defs>"
  },
  {
    "id": "frame-ticket",
    "name": "Ticket",
    "width": 79,
    "height": 50,
    "viewBox": "0 0 79 50",
    "innerSvg": "<rect x=\"13\" width=\"53\" height=\"50\" fill=\"url(#pattern0_10526_3282)\"/>\r\n<path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M79 18.0164V3.97253C76.9141 3.74197 75.2578 2.08582 75.0273 0H66V50H75.0273C75.2578 47.9142 76.9141 46.258 79 46.0275V32.9836C75.0911 32.7263 72 29.4741 72 25.5C72 21.5259 75.0911 18.2737 79 18.0164Z\" fill=\"url(#pattern1_10526_3282)\"/>\r\n<path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M0 18.0164V3.97253C2.08594 3.74197 3.74219 2.08582 3.97266 0H13V50H3.97266C3.74219 47.9142 2.08594 46.258 0 46.0275V32.9836C3.90894 32.7263 7 29.4741 7 25.5C7 21.5259 3.90894 18.2737 0 18.0164Z\" fill=\"url(#pattern2_10526_3282)\"/>\r\n<defs>\r\n<pattern id=\"pattern0_10526_3282\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\r\n<use xlink:href=\"#image0_10526_3282\" transform=\"matrix(0.000797448 0 0 0.000845295 0 -0.03)\"/>\r\n</pattern>\r\n<pattern id=\"pattern1_10526_3282\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\r\n<use xlink:href=\"#image0_10526_3282\" transform=\"matrix(0.00306711 0 0 0.000797448 -1.42308 0)\"/>\r\n</pattern>\r\n<pattern id=\"pattern2_10526_3282\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\r\n<use xlink:href=\"#image0_10526_3282\" transform=\"matrix(0.00306711 0 0 0.000797448 -1.42308 0)\"/>\r\n</pattern>\r\n<image id=\"image0_10526_3282\" width=\"1254\" height=\"1254\" preserveAspectRatio=\"none\" xlink:href=\"__FRAME_IMAGE__\"/>\r\n</defs>"
  },
  {
    "id": "frame-top-bottom",
    "name": "Top Bottom",
    "width": 86,
    "height": 80,
    "viewBox": "0 0 86 80",
    "innerSvg": "<rect width=\"86\" height=\"39\" fill=\"url(#pattern0_10526_3235)\"/>\r\n<rect y=\"41\" width=\"86\" height=\"39\" fill=\"url(#pattern1_10526_3235)\"/>\r\n<defs>\r\n<pattern id=\"pattern0_10526_3235\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\r\n<use xlink:href=\"#image0_10526_3235\" transform=\"matrix(0.000797448 0 0 0.00175848 0 -0.602564)\"/>\r\n</pattern>\r\n<pattern id=\"pattern1_10526_3235\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\r\n<use xlink:href=\"#image0_10526_3235\" transform=\"matrix(0.000797448 0 0 0.00175848 0 -0.602564)\"/>\r\n</pattern>\r\n<image id=\"image0_10526_3235\" width=\"1254\" height=\"1254\" preserveAspectRatio=\"none\" xlink:href=\"__FRAME_IMAGE__\"/>\r\n</defs>"
  },
  {
    "id": "frame-triangle-collage",
    "name": "Triangle Collage",
    "width": 89,
    "height": 81,
    "viewBox": "0 0 89 81",
    "innerSvg": "<path d=\"M44.5477 0L61.4352 33L44.5476 62L27.6602 33L44.5477 0Z\" fill=\"url(#pattern0_10526_3271)\"/>\r\n<path d=\"M63.0477 36L88.5955 80.25H37.5L63.0477 36Z\" fill=\"url(#pattern1_10526_3271)\"/>\r\n<path d=\"M25.5477 36L43.0479 64L32.5479 80.25H0L25.5477 36Z\" fill=\"url(#pattern2_10526_3271)\"/>\r\n<defs>\r\n<pattern id=\"pattern0_10526_3271\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\r\n<use xlink:href=\"#image0_10526_3271\" transform=\"matrix(0.00146386 0 0 0.000797448 -0.417839 0)\"/>\r\n</pattern>\r\n<pattern id=\"pattern1_10526_3271\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\r\n<use xlink:href=\"#image0_10526_3271\" transform=\"matrix(0.000797448 0 0 0.000920814 0 -0.0773503)\"/>\r\n</pattern>\r\n<pattern id=\"pattern2_10526_3271\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\r\n<use xlink:href=\"#image0_10526_3271\" transform=\"matrix(0.000819718 0 0 0.000797448 -0.0139629 0)\"/>\r\n</pattern>\r\n<image id=\"image0_10526_3271\" width=\"1254\" height=\"1254\" preserveAspectRatio=\"none\" xlink:href=\"__FRAME_IMAGE__\"/>\r\n</defs>"
  },
  {
    "id": "frame-u",
    "name": "U",
    "width": 73,
    "height": 85,
    "viewBox": "0 0 73 85",
    "innerSvg": "<path d=\"M49.4394 0H72.1195V53.5185C72.1195 59.882 70.5966 65.3889 67.5508 70.0391C64.5323 74.6622 60.3171 78.2383 54.9055 80.7673C49.4938 83.2692 43.2119 84.5201 36.0598 84.5201C28.8532 84.5201 22.5441 83.2692 17.1325 80.7673C11.7208 78.2383 7.50565 74.6622 4.48707 70.0391C1.49569 65.3889 0 59.882 0 53.5185V0H22.6801V51.5606C22.6801 54.144 23.2512 56.4555 24.3934 58.4951C25.5355 60.5075 27.1128 62.0848 29.1252 63.2269C31.1648 64.3691 33.4763 64.9402 36.0598 64.9402C38.6704 64.9402 40.9819 64.3691 42.9943 63.2269C45.0067 62.0848 46.584 60.5075 47.7261 58.4951C48.8683 56.4555 49.4394 54.144 49.4394 51.5606V0Z\" fill=\"url(#pattern0_10712_1864)\"/>\r\n<defs>\r\n<pattern id=\"pattern0_10712_1864\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\r\n<use xlink:href=\"#image0_10712_1864\" transform=\"matrix(0.000934566 0 0 0.000797448 -0.0859729 0)\"/>\r\n</pattern>\r\n<image id=\"image0_10712_1864\" width=\"1254\" height=\"1254\" preserveAspectRatio=\"none\" xlink:href=\"__FRAME_IMAGE__\"/>\r\n</defs>"
  },
  {
    "id": "frame-v",
    "name": "V",
    "width": 87,
    "height": 84,
    "viewBox": "0 0 87 84",
    "innerSvg": "<path d=\"M25.6171 0L42.7496 58.903H43.4022L60.5347 0H86.1518L58.5767 83.5412H27.5751L0 0H25.6171Z\" fill=\"url(#pattern0_10712_1865)\"/>\r\n<defs>\r\n<pattern id=\"pattern0_10712_1865\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\r\n<use xlink:href=\"#image0_10712_1865\" transform=\"matrix(0.000797448 0 0 0.000822368 0 -0.015625)\"/>\r\n</pattern>\r\n<image id=\"image0_10712_1865\" width=\"1254\" height=\"1254\" preserveAspectRatio=\"none\" xlink:href=\"__FRAME_IMAGE__\"/>\r\n</defs>"
  },
  {
    "id": "frame-w",
    "name": "W",
    "width": 122,
    "height": 84,
    "viewBox": "0 0 122 84",
    "innerSvg": "<path d=\"M24.6381 83.5412L0 0H25.2908L36.7124 51.3974H37.3651L50.9079 0H70.8142L84.357 51.5606H85.0097L96.4313 0H121.722L97.084 83.5412H75.3828L61.1874 36.8756H60.5347L46.3392 83.5412H24.6381Z\" fill=\"url(#pattern0_10712_1866)\"/>\r\n<defs>\r\n<pattern id=\"pattern0_10712_1866\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\r\n<use xlink:href=\"#image0_10712_1866\" transform=\"matrix(0.000797448 0 0 0.00116191 0 -0.228516)\"/>\r\n</pattern>\r\n<image id=\"image0_10712_1866\" width=\"1254\" height=\"1254\" preserveAspectRatio=\"none\" xlink:href=\"__FRAME_IMAGE__\"/>\r\n</defs>"
  },
  {
    "id": "frame-wave",
    "name": "Wave",
    "width": 74,
    "height": 52,
    "viewBox": "0 0 74 52",
    "innerSvg": "<path d=\"M0 5.64763C36.5 -12.4117 42.5 19.8904 74 5.64763V51.225C45 51.225 36 28.5883 0 51.225V5.64763Z\" fill=\"url(#pattern0_10526_3278)\"/>\r\n<defs>\r\n<pattern id=\"pattern0_10526_3278\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\r\n<use xlink:href=\"#image0_10526_3278\" transform=\"matrix(0.000797448 0 0 0.001152 0 -0.222303)\"/>\r\n</pattern>\r\n<image id=\"image0_10526_3278\" width=\"1254\" height=\"1254\" preserveAspectRatio=\"none\" xlink:href=\"__FRAME_IMAGE__\"/>\r\n</defs>"
  },
  {
    "id": "frame-x",
    "name": "X",
    "width": 81,
    "height": 84,
    "viewBox": "0 0 81 84",
    "innerSvg": "<path d=\"M26.2698 0L39.9757 24.3118H40.6284L54.4975 0H79.7883L54.8239 41.7706L80.7673 83.5412H54.8239L40.6284 58.7399H39.9757L25.7803 83.5412H0L25.6171 41.7706L0.815832 0H26.2698Z\" fill=\"url(#pattern0_10712_1867)\"/>\r\n<defs>\r\n<pattern id=\"pattern0_10712_1867\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\r\n<use xlink:href=\"#image0_10712_1867\" transform=\"matrix(0.000824835 0 0 0.000797448 -0.0171717 0)\"/>\r\n</pattern>\r\n<image id=\"image0_10712_1867\" width=\"1254\" height=\"1254\" preserveAspectRatio=\"none\" xlink:href=\"__FRAME_IMAGE__\"/>\r\n</defs>"
  },
  {
    "id": "frame-y",
    "name": "Y",
    "width": 84,
    "height": 84,
    "viewBox": "0 0 84 84",
    "innerSvg": "<path d=\"M0 0H25.2908L41.6074 33.9386H42.2601L58.5767 0H83.8675L53.1922 57.2714V83.5412H30.6753V57.2714L0 0Z\" fill=\"url(#pattern0_10712_1868)\"/>\r\n<defs>\r\n<pattern id=\"pattern0_10712_1868\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\r\n<use xlink:href=\"#image0_10712_1868\" transform=\"matrix(0.000797448 0 0 0.000800563 0 -0.00195312)\"/>\r\n</pattern>\r\n<image id=\"image0_10712_1868\" width=\"1254\" height=\"1254\" preserveAspectRatio=\"none\" xlink:href=\"__FRAME_IMAGE__\"/>\r\n</defs>"
  },
  {
    "id": "frame-z",
    "name": "z",
    "width": 81,
    "height": 92,
    "viewBox": "0 0 81 92",
    "innerSvg": "<path d=\"M0 91.3169V73.2438L39.9511 25.4451V24.9695H1.42683V0H78.7133V19.9756L42.3292 65.8718V66.3474H80.1401V91.3169H0Z\" fill=\"url(#pattern0_10712_1829)\"/>\r\n<defs>\r\n<pattern id=\"pattern0_10712_1829\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\r\n<use xlink:href=\"#image0_10712_1829\" transform=\"matrix(0.000908665 0 0 0.000797448 -0.0697329 0)\"/>\r\n</pattern>\r\n<image id=\"image0_10712_1829\" width=\"1254\" height=\"1254\" preserveAspectRatio=\"none\" xlink:href=\"__FRAME_IMAGE__\"/>\r\n</defs>"
  },
  {
    "id": "frame-staggered-3-columns",
    "name": "Staggered 3-Columns",
    "width": 100,
    "height": 100,
    "viewBox": "0 0 1000 1000",
    "innerSvg": "<path d=\"M 76,200 h 250.66666666666669 a 16,16 0 0 1 16,16 v 688 a 16,16 0 0 1 -16,16 h -250.66666666666669 a 16,16 0 0 1 -16,-16 v -688 a 16,16 0 0 1 16,-16 Z\" fill=\"url(#pattern0_staggered_triptych)\"/>\n<path d=\"M 374.6666666666667,40 h 250.66666666666669 a 16,16 0 0 1 16,16 v 868 a 16,16 0 0 1 -16,16 h -250.66666666666669 a 16,16 0 0 1 -16,-16 v -868 a 16,16 0 0 1 16,-16 Z\" fill=\"url(#pattern1_staggered_triptych)\"/>\n<path d=\"M 673.3333333333334,80 h 250.66666666666669 a 16,16 0 0 1 16,16 v 728 a 16,16 0 0 1 -16,16 h -250.66666666666669 a 16,16 0 0 1 -16,-16 v -728 a 16,16 0 0 1 16,-16 Z\" fill=\"url(#pattern2_staggered_triptych)\"/>\n<defs>\n<pattern id=\"pattern0_staggered_triptych\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\n<use xlink:href=\"#image0_staggered_triptych\" transform=\"matrix(0.00203124 0 0 0.00079745 -0.773585 0)\"/>\n</pattern>\n<pattern id=\"pattern1_staggered_triptych\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\n<use xlink:href=\"#image0_staggered_triptych\" transform=\"matrix(0.00253904 0 0 0.00079745 -1.091981 0)\"/>\n</pattern>\n<pattern id=\"pattern2_staggered_triptych\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\n<use xlink:href=\"#image0_staggered_triptych\" transform=\"matrix(0.00214408 0 0 0.00079745 -0.844340 0)\"/>\n</pattern>\n<image id=\"image0_staggered_triptych\" width=\"1254\" height=\"1254\" preserveAspectRatio=\"none\" xlink:href=\"__FRAME_IMAGE__\"/>\n</defs>"
  },
  {
    "id": "frame-diamond-s-curve--4-",
    "name": "Diamond S-Curve (4)",
    "width": 100,
    "height": 100,
    "viewBox": "0 0 1000 1000",
    "innerSvg": "<path d=\"M -114,-130 h 228 a 16,16 0 0 1 16,16 v 228 a 16,16 0 0 1 -16,16 h -228 a 16,16 0 0 1 -16,-16 v -228 a 16,16 0 0 1 16,-16 Z\" transform=\"translate(598.1464212286928, 205.5607363139216) rotate(45)\" fill=\"url(#pattern0_staggered_diamonds)\"/>\n<path d=\"M -114,-130 h 228 a 16,16 0 0 1 16,16 v 228 a 16,16 0 0 1 -16,16 h -228 a 16,16 0 0 1 -16,-16 v -228 a 16,16 0 0 1 16,-16 Z\" transform=\"translate(401.8535787713072, 401.8535787713072) rotate(45)\" fill=\"url(#pattern1_staggered_diamonds)\"/>\n<path d=\"M -114,-130 h 228 a 16,16 0 0 1 16,16 v 228 a 16,16 0 0 1 -16,16 h -228 a 16,16 0 0 1 -16,-16 v -228 a 16,16 0 0 1 16,-16 Z\" transform=\"translate(598.1464212286928, 598.1464212286928) rotate(45)\" fill=\"url(#pattern2_staggered_diamonds)\"/>\n<path d=\"M -114,-130 h 228 a 16,16 0 0 1 16,16 v 228 a 16,16 0 0 1 -16,16 h -228 a 16,16 0 0 1 -16,-16 v -228 a 16,16 0 0 1 16,-16 Z\" transform=\"translate(401.8535787713072, 794.4392636860784) rotate(45)\" fill=\"url(#pattern3_staggered_diamonds)\"/>\n<defs>\n<pattern id=\"pattern0_staggered_diamonds\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\n<use xlink:href=\"#image0_staggered_diamonds\" transform=\"matrix(0.00079745 0 0 0.00079745 0 0)\"/>\n</pattern>\n<pattern id=\"pattern1_staggered_diamonds\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\n<use xlink:href=\"#image0_staggered_diamonds\" transform=\"matrix(0.00079745 0 0 0.00079745 0 0)\"/>\n</pattern>\n<pattern id=\"pattern2_staggered_diamonds\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\n<use xlink:href=\"#image0_staggered_diamonds\" transform=\"matrix(0.00079745 0 0 0.00079745 0 0)\"/>\n</pattern>\n<pattern id=\"pattern3_staggered_diamonds\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\n<use xlink:href=\"#image0_staggered_diamonds\" transform=\"matrix(0.00079745 0 0 0.00079745 0 0)\"/>\n</pattern>\n<image id=\"image0_staggered_diamonds\" width=\"1254\" height=\"1254\" preserveAspectRatio=\"none\" xlink:href=\"__FRAME_IMAGE__\"/>\n</defs>"
  },
  {
    "id": "frame-arch-horseshoe--6-",
    "name": "Arch Horseshoe (6)",
    "width": 100,
    "height": 100,
    "viewBox": "0 0 1000 1000",
    "innerSvg": "<path d=\"M 96.71313555321672,779.6489543290469 A 450,450 0 0 1 58.78185051255264,491.53223998047326 L 294.0981969058579,538.7150453242209 A 210,210 0 0 0 311.7994632581678,673.1695120202219 Z\" fill=\"url(#pattern0_radial_horseshoe)\"/>\n<path d=\"M 60.94408397549057,481.35973132701366 A 450,450 0 0 1 212.78366233510394,233.58005920795438 L 365.9657090897152,418.33736096371206 A 210,210 0 0 0 295.1072391885623,533.9678746192731 Z\" fill=\"url(#pattern1_radial_horseshoe)\"/>\n<path d=\"M 220.8658004623063,227.0352727984693 A 450,450 0 0 1 494.8001157259761,130.0300441101242 L 497.57338733878885,370.0140205847246 A 210,210 0 0 0 369.73737354907627,415.28312730595235 Z\" fill=\"url(#pattern2_radial_horseshoe)\"/>\n<path d=\"M 505.1998842740237,130.0300441101242 A 450,450 0 0 1 779.1341995376936,227.03527279846924 L 630.2626264509237,415.2831273059523 A 210,210 0 0 0 502.42661266121104,370.0140205847246 Z\" fill=\"url(#pattern3_radial_horseshoe)\"/>\n<path d=\"M 787.216337664896,233.58005920795426 A 450,450 0 0 1 939.0559160245093,481.3597313270133 L 704.8927608114377,533.9678746192728 A 210,210 0 0 0 634.0342909102848,418.33736096371194 Z\" fill=\"url(#pattern4_radial_horseshoe)\"/>\n<path d=\"M 941.2181494874472,491.5322399804729 A 450,450 0 0 1 903.2868644467833,779.6489543290468 L 688.2005367418323,673.1695120202219 A 210,210 0 0 0 705.901803094142,538.7150453242207 Z\" fill=\"url(#pattern5_radial_horseshoe)\"/>\n<defs>\n<pattern id=\"pattern0_radial_horseshoe\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\n<use xlink:href=\"#image0_radial_horseshoe\" transform=\"matrix(0.00079745 0 0 0.00079745 0 0)\"/>\n</pattern>\n<pattern id=\"pattern1_radial_horseshoe\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\n<use xlink:href=\"#image0_radial_horseshoe\" transform=\"matrix(0.00079745 0 0 0.00079745 0 0)\"/>\n</pattern>\n<pattern id=\"pattern2_radial_horseshoe\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\n<use xlink:href=\"#image0_radial_horseshoe\" transform=\"matrix(0.00079745 0 0 0.00079745 0 0)\"/>\n</pattern>\n<pattern id=\"pattern3_radial_horseshoe\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\n<use xlink:href=\"#image0_radial_horseshoe\" transform=\"matrix(0.00079745 0 0 0.00079745 0 0)\"/>\n</pattern>\n<pattern id=\"pattern4_radial_horseshoe\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\n<use xlink:href=\"#image0_radial_horseshoe\" transform=\"matrix(0.00079745 0 0 0.00079745 0 0)\"/>\n</pattern>\n<pattern id=\"pattern5_radial_horseshoe\" patternContentUnits=\"objectBoundingBox\" width=\"1\" height=\"1\">\n<use xlink:href=\"#image0_radial_horseshoe\" transform=\"matrix(0.00079745 0 0 0.00079745 0 0)\"/>\n</pattern>\n<image id=\"image0_radial_horseshoe\" width=\"1254\" height=\"1254\" preserveAspectRatio=\"none\" xlink:href=\"__FRAME_IMAGE__\"/>\n</defs>"
  }
];

export const IMAGE_FRAMING_PRESETS = RAW_PRESETS.map((p) => ({
  ...p,
  innerSvg: p.innerSvg.replace('__FRAME_IMAGE__', DEFAULT_FRAME_IMAGE)
}));

export const getFrameSvg = (preset) => {
  return `<svg width="${preset.width}" height="${preset.height}" viewBox="${preset.viewBox}" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">${preset.innerSvg}</svg>`;
};

export const createImageFrameNode = (frameNameOrPreset, rawSvgOrCx, cxOrCy, cy) => {
  let frameName = frameNameOrPreset;
  let rawSvg = rawSvgOrCx;
  let cx = cxOrCy;
  let posY_cy = cy;

  if (typeof frameNameOrPreset === 'object' && frameNameOrPreset !== null) {
    frameName = frameNameOrPreset.name;
    rawSvg = getFrameSvg(frameNameOrPreset);
    cx = rawSvgOrCx;
    posY_cy = cxOrCy;
  } else if (!rawSvg && typeof frameName === 'string') {
    const found = IMAGE_FRAMING_PRESETS.find((p) => p.name === frameName || p.id === frameName);
    if (found) {
      rawSvg = getFrameSvg(found);
    }
  }

  const uniqueId = Date.now() + Math.floor(Math.random() * 1000);
  let cleanSvg = (rawSvg || '').replace(/<\?xml.*?\?>/g, '');

  // Scope pattern and image IDs to avoid SVG pattern ID collisions between multiple frames
  const idRegex = /id="(pattern[^"]*|image[^"]*)"/g;
  cleanSvg = cleanSvg.replace(idRegex, (match, p1) => `id="${p1}-${uniqueId}"`);
  cleanSvg = cleanSvg.replace(/url\(#(pattern[^)]*)\)/g, (match, p1) => `url(#${p1}-${uniqueId})`);
  cleanSvg = cleanSvg.replace(/(?:xlink:href|href)="#(image[^"]*)"/g, (match, p1) => `xlink:href="#${p1}-${uniqueId}" href="#${p1}-${uniqueId}"`);

  const parser = new DOMParser();
  const doc = parser.parseFromString(cleanSvg, 'image/svg+xml');
  const svgEl = doc.documentElement;
  const width = parseFloat(svgEl.getAttribute('width') || '100');
  const height = parseFloat(svgEl.getAttribute('height') || '100');

  // Scale frame to snug canvas placement (~75mm or 75 units)
  let scale = 1;
  const maxSize = 80;
  if (width > maxSize || height > maxSize) {
    scale = maxSize / Math.max(width, height);
  }

  const renderW = width * scale;
  const renderH = height * scale;
  const posX = Math.round((cx ?? 100) - renderW / 2);
  const posY = Math.round((posY_cy ?? 100) - renderH / 2);

  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('id', `image-frame-${uniqueId}`);
  g.setAttribute('data-type', 'image-frame');
  g.setAttribute('data-is-image-frame', 'true');
  g.setAttribute('data-frame-type', frameName);
  g.setAttribute('data-name', 'Image Frame');
  g.setAttribute('data-frame-title', `${frameName} Frame`);
  g.setAttribute('transform', `translate(${posX}, ${posY}) scale(${scale.toFixed(4)})`);
  g.setAttribute('cursor', 'pointer');
  g.innerHTML = svgEl.innerHTML;

  return g;
};
