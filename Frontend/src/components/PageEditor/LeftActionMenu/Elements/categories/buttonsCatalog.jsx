import React from 'react';
import { BUTTON_TEMPLATES, createButtonElementNode } from '../utils/buttonElementUtils';

/**
 * ButtonPreview
 * Renders the accurate vector SVG preview matching each ButtonStyle template
 */
export const ButtonPreview = ({ template }) => {
  const btn = template;

  return (
    <div className="w-full h-full flex items-center justify-center p-[0.2vw] pointer-events-none select-none">
      <svg
        viewBox={`0 0 ${btn.width} ${btn.height}`}
        className="w-full h-auto pointer-events-none select-none max-h-[2.5vw]"
      >
        {btn.id === 'solid-pill' && (
          <>
            <rect x="0" y="0" width={btn.width} height={btn.height} rx={btn.rx} fill={btn.fill} />
            <g transform="translate(18, 13)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1" fill="#ffffff" stroke="none" />
                <circle cx="20" cy="21" r="1" fill="#ffffff" stroke="none" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
            </g>
            <text
              x="82"
              y={btn.height / 2 + 1}
              fill={btn.textColor}
              fontSize={btn.fontSize}
              fontFamily={btn.fontFamily}
              fontWeight={btn.fontWeight}
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {btn.text}
            </text>
          </>
        )}

        {btn.id === 'white-pill-badge' && (
          <>
            <rect x="1" y="1" width={btn.width - 2} height={btn.height - 2} rx={btn.rx} fill={btn.fill} stroke={btn.stroke} strokeWidth={btn.strokeWidth} />
            <circle cx="21" cy={btn.height / 2} r="14" fill={btn.badgeColor} />
            <g transform="translate(13, 13)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1" fill="#ffffff" stroke="none" />
                <circle cx="20" cy="21" r="1" fill="#ffffff" stroke="none" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
            </g>
            <text
              x="86"
              y={btn.height / 2 + 1}
              fill={btn.textColor}
              fontSize={btn.fontSize}
              fontFamily={btn.fontFamily}
              fontWeight={btn.fontWeight}
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {btn.text}
            </text>
          </>
        )}

        {btn.id === 'rect-badge' && (
          <>
            <rect x="1" y="1" width={btn.width - 2} height={btn.height - 2} rx={btn.rx} fill={btn.fill} stroke={btn.stroke} strokeWidth={btn.strokeWidth} />
            <path d={`M 0,${btn.rx} A ${btn.rx},${btn.rx} 0 0 1 ${btn.rx},0 L 38,0 L 38,${btn.height} L ${btn.rx},${btn.height} A ${btn.rx},${btn.rx} 0 0 1 0,${btn.height - btn.rx} Z`} fill={btn.badgeColor} />
            <g transform="translate(11, 13)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1" fill="#ffffff" stroke="none" />
                <circle cx="20" cy="21" r="1" fill="#ffffff" stroke="none" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
            </g>
            <text
              x="92"
              y={btn.height / 2 + 1}
              fill={btn.textColor}
              fontSize={btn.fontSize}
              fontFamily={btn.fontFamily}
              fontWeight={btn.fontWeight}
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {btn.text}
            </text>
          </>
        )}

        {btn.id === 'app-icon' && (
          <>
            <rect x="0" y="0" width={btn.width} height={btn.height} rx={btn.rx} fill={btn.fill} />
            <g transform="translate(18, 13)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </g>
            <text
              x="76"
              y={btn.height / 2 + 1}
              fill={btn.textColor}
              fontSize={btn.fontSize}
              fontFamily={btn.fontFamily}
              fontWeight={btn.fontWeight}
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {btn.text}
            </text>
          </>
        )}

        {btn.id === 'blue-primary' && (
          <>
            <rect x="0" y="0" width={btn.width} height={btn.height} rx={btn.rx} fill={btn.fill} />
            <text
              x={btn.width / 2}
              y={btn.height / 2 + 1}
              fill={btn.textColor}
              fontSize={btn.fontSize}
              fontFamily={btn.fontFamily}
              fontWeight={btn.fontWeight}
              letterSpacing={btn.letterSpacing}
              textAnchor="middle"
              dominantBaseline="middle"
              style={{ letterSpacing: btn.letterSpacing }}
            >
              {btn.text}
            </text>
          </>
        )}

        {btn.id === 'social-badge' && (
          <>
            <rect x="0" y="0" width={btn.width} height={btn.height} rx={btn.rx} fill={btn.fill} />
            <circle cx="21" cy={btn.height / 2} r="14" fill={btn.badgeColor} />
            <g transform="translate(13, 13)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#22c55e">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.82 9.82 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.052 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
              </svg>
            </g>
            <text
              x="94"
              y={btn.height / 2 + 1}
              fill={btn.textColor}
              fontSize={btn.fontSize}
              fontFamily={btn.fontFamily}
              fontWeight={btn.fontWeight}
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {btn.text}
            </text>
          </>
        )}

        {btn.id === 'angled-slice' && (
          <>
            <defs>
              <clipPath id="preview-clip-angled-slice">
                <rect x="0" y="0" width={btn.width} height={btn.height} rx={btn.rx} />
              </clipPath>
            </defs>
            <rect x="1" y="1" width={btn.width - 2} height={btn.height - 2} rx={btn.rx} fill={btn.fill} stroke={btn.stroke} strokeWidth={btn.strokeWidth} />
            <g clipPath="url(#preview-clip-angled-slice)">
              <polygon points={`-5,-5 42,-5 26,${btn.height + 5} -5,${btn.height + 5}`} fill={btn.sliceColor} />
            </g>
            <g transform="translate(10, 13)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#ffffff">
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
              </svg>
            </g>
            <text
              x="94"
              y={btn.height / 2 + 1}
              fill={btn.textColor}
              fontSize={btn.fontSize}
              fontFamily={btn.fontFamily}
              fontWeight={btn.fontWeight}
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {btn.text}
            </text>
          </>
        )}

        {btn.id === 'slanted-border' && (
          <>
            <path
              d={`M 24,0 L ${btn.width},0 L ${btn.width},${btn.height - 24} A 24,24 0 0 1 ${btn.width - 24},${btn.height} L 0,${btn.height} L 0,24 A 24,24 0 0 1 24,0 Z`}
              fill={btn.fill}
              stroke={btn.stroke}
              strokeWidth={btn.strokeWidth}
            />
            <text
              x={btn.width / 2}
              y={btn.height / 2 + 1}
              fill={btn.textColor}
              fontSize={btn.fontSize}
              fontFamily={btn.fontFamily}
              fontWeight={btn.fontWeight}
              letterSpacing={btn.letterSpacing}
              textAnchor="middle"
              dominantBaseline="middle"
              style={{ letterSpacing: btn.letterSpacing }}
            >
              {btn.text}
            </text>
          </>
        )}

        {btn.id === 'like-chevron' && (
          <>
            <polygon
              points={`0,0 ${btn.width - 12},0 ${btn.width},${btn.height / 2} ${btn.width - 12},${btn.height} 0,${btn.height}`}
              fill={btn.fill}
              stroke={btn.stroke}
              strokeWidth={btn.strokeWidth}
            />
            <polygon points={`0,0 36,0 36,${btn.height} 0,${btn.height}`} fill={btn.blockColor} stroke="none" />
            <g transform="translate(10, 13)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#ffffff">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </g>
            <text
              x="86"
              y={btn.height / 2 + 1}
              fill={btn.textColor}
              fontSize={btn.fontSize}
              fontFamily={btn.fontFamily}
              fontWeight={btn.fontWeight}
              letterSpacing={btn.letterSpacing}
              textAnchor="middle"
              dominantBaseline="middle"
              style={{ letterSpacing: btn.letterSpacing }}
            >
              {btn.text}
            </text>
          </>
        )}

        {btn.id === 'upload-ribbon' && (
          <>
            <rect x="0" y="0" width={btn.width} height={btn.height} rx={btn.rx} fill={btn.fill} />
            <polygon points={`0,0 34,0 42,${btn.height / 2} 34,${btn.height} 0,${btn.height}`} fill={btn.ribbonColor} />
            <g transform="translate(10, 13)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </g>
            <text
              x="92"
              y={btn.height / 2 + 1}
              fill={btn.textColor}
              fontSize={btn.fontSize}
              fontFamily={btn.fontFamily}
              fontWeight={btn.fontWeight}
              letterSpacing={btn.letterSpacing}
              textAnchor="middle"
              dominantBaseline="middle"
              style={{ letterSpacing: btn.letterSpacing }}
            >
              {btn.text}
            </text>
          </>
        )}
      </svg>
    </div>
  );
};

export const BUTTON_ITEMS = BUTTON_TEMPLATES.map((tmpl) => ({
  id: tmpl.id,
  name: tmpl.name,
  category: 'buttons',
  type: 'button',
  renderPreview: () => <ButtonPreview template={tmpl} />,
  insert: (cx, cy) => createButtonElementNode(tmpl, cx, cy)
}));

export default BUTTON_ITEMS;
