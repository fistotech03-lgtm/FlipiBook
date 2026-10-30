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
            <defs>
              <clipPath id="preview-clip-upload-ribbon">
                <rect x="0" y="0" width={btn.width} height={btn.height} rx={btn.rx} />
              </clipPath>
            </defs>
            <rect x="0" y="0" width={btn.width} height={btn.height} rx={btn.rx} fill={btn.fill} />
            <g clipPath="url(#preview-clip-upload-ribbon)">
              <polygon points={`0,0 34,0 42,${btn.height / 2} 34,${btn.height} 0,${btn.height}`} fill={btn.ribbonColor} />
            </g>
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

        {btn.id === 'gradient-pill' && (
          <>
            <defs>
              <linearGradient id="preview-grad-sunrise" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffe8d6" />
                <stop offset="100%" stopColor="#ffd1dc" />
              </linearGradient>
            </defs>
            <rect x="1" y="1" width={btn.width - 2} height={btn.height - 2} rx={btn.rx} fill="url(#preview-grad-sunrise)" stroke={btn.stroke} strokeWidth={btn.strokeWidth} />
            <g transform="translate(16, 13)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={btn.iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
              </svg>
            </g>
            <text
              x="84"
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

        {btn.id === 'ocean-breeze' && (
          <>
            <defs>
              <linearGradient id="preview-grad-ocean" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#e0f2fe" />
                <stop offset="100%" stopColor="#bae6fd" />
              </linearGradient>
            </defs>
            <rect x="1" y="1" width={btn.width - 2} height={btn.height - 2} rx={btn.rx} fill="url(#preview-grad-ocean)" stroke={btn.stroke} strokeWidth={btn.strokeWidth} />
            <g transform="translate(16, 13)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={btn.iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill={btn.iconColor} stroke="none" />
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

        {btn.id === 'lavender-badge' && (
          <>
            <defs>
              <linearGradient id="preview-grad-lav-bg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#faf5ff" />
                <stop offset="100%" stopColor="#f3e8ff" />
              </linearGradient>
              <linearGradient id="preview-grad-lav-badge" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#c084fc" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
            <rect x="1" y="1" width={btn.width - 2} height={btn.height - 2} rx={btn.rx} fill="url(#preview-grad-lav-bg)" stroke={btn.stroke} strokeWidth={btn.strokeWidth} />
            <circle cx="21" cy={btn.height / 2} r="14" fill="url(#preview-grad-lav-badge)" />
            <g transform="translate(13, 13)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
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

        {btn.id === 'mint-frost' && (
          <>
            <defs>
              <linearGradient id="preview-grad-mint" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#d1fae5" />
                <stop offset="100%" stopColor="#a7f3d0" />
              </linearGradient>
            </defs>
            <rect x="1" y="1" width={btn.width - 2} height={btn.height - 2} rx={btn.rx} fill="url(#preview-grad-mint)" stroke={btn.stroke} strokeWidth={btn.strokeWidth} />
            <g transform="translate(16, 13)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={btn.iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </g>
            <text
              x="84"
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

        {btn.id === 'sunset-coral' && (
          <>
            <defs>
              <linearGradient id="preview-grad-sunset" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fff1f2" />
                <stop offset="100%" stopColor="#fed7aa" />
              </linearGradient>
            </defs>
            <rect x="1" y="1" width={btn.width - 2} height={btn.height - 2} rx={btn.rx} fill="url(#preview-grad-sunset)" stroke={btn.stroke} strokeWidth={btn.strokeWidth} />
            <g transform="translate(16, 13)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill={btn.iconColor} stroke="none">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
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

        {btn.id === 'frosted-glass' && (
          <>
            <defs>
              <linearGradient id="preview-grad-frost" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f0f9ff" />
                <stop offset="100%" stopColor="#e0e7ff" />
              </linearGradient>
            </defs>
            <rect x="1" y="1" width={btn.width - 2} height={btn.height - 2} rx={btn.rx} fill="url(#preview-grad-frost)" stroke={btn.stroke} strokeWidth={btn.strokeWidth} />
            <text
              x="64"
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
            <g transform="translate(116, 13)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={btn.iconColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </g>
          </>
        )}

        {btn.id === 'lemon-ribbon' && (
          <>
            <defs>
              <clipPath id="preview-clip-lemon-ribbon">
                <rect x="0" y="0" width={btn.width} height={btn.height} rx={btn.rx} />
              </clipPath>
              <linearGradient id="preview-grad-lemon-bg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fefce8" />
                <stop offset="100%" stopColor="#fef08a" />
              </linearGradient>
              <linearGradient id="preview-grad-lemon-ribbon" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fde047" />
                <stop offset="100%" stopColor="#fbbf24" />
              </linearGradient>
            </defs>
            <rect x="0" y="0" width={btn.width} height={btn.height} rx={btn.rx} fill="url(#preview-grad-lemon-bg)" stroke="#fde047" strokeWidth="1" />
            <g clipPath="url(#preview-clip-lemon-ribbon)">
              <polygon points={`0,0 34,0 42,${btn.height / 2} 34,${btn.height} 0,${btn.height}`} fill="url(#preview-grad-lemon-ribbon)" />
            </g>
            <g transform="translate(10, 13)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={btn.iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
                <circle cx="7" cy="7" r="1.5" fill={btn.iconColor} stroke="none" />
              </svg>
            </g>
            <text
              x="94"
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

        {btn.id === 'pearl-pill' && (
          <>
            <defs>
              <linearGradient id="preview-grad-pearl" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#e0e7ff" />
                <stop offset="50%" stopColor="#ede9fe" />
                <stop offset="100%" stopColor="#fce7f3" />
              </linearGradient>
            </defs>
            <rect x="1" y="1" width={btn.width - 2} height={btn.height - 2} rx={btn.rx} fill="url(#preview-grad-pearl)" stroke={btn.stroke} strokeWidth={btn.strokeWidth} />
            <g transform="translate(16, 13)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={btn.iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 3h12l4 6-10 13L2 9Z" />
                <path d="M11 3 8 9l4 13 4-13-3-6" />
                <path d="M2 9h20" />
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

        {btn.id === 'diagonal-pastel' && (
          <>
            <defs>
              <clipPath id="preview-clip-diagonal-pastel">
                <rect x="0" y="0" width={btn.width} height={btn.height} rx={btn.rx} />
              </clipPath>
              <linearGradient id="preview-grad-diag-slice" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#93c5fd" />
                <stop offset="100%" stopColor="#c4b5fd" />
              </linearGradient>
            </defs>
            <rect x="1" y="1" width={btn.width - 2} height={btn.height - 2} rx={btn.rx} fill={btn.fill} stroke={btn.stroke} strokeWidth={btn.strokeWidth} />
            <g clipPath="url(#preview-clip-diagonal-pastel)">
              <polygon points={`-5,-5 42,-5 26,${btn.height + 5} -5,${btn.height + 5}`} fill="url(#preview-grad-diag-slice)" />
            </g>
            <g transform="translate(10, 13)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
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

        {btn.id === 'slanted-pastel' && (
          <>
            <defs>
              <linearGradient id="preview-grad-slanted-pastel" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f5f3ff" />
                <stop offset="100%" stopColor="#ecfeff" />
              </linearGradient>
            </defs>
            <path
              d={`M 20,0 L ${btn.width - 4},0 A 4,4 0 0 1 ${btn.width},4 L ${btn.width},${btn.height - 20} A 20,20 0 0 1 ${btn.width - 20},${btn.height} L 4,${btn.height} A 4,4 0 0 1 0,${btn.height - 4} L 0,20 A 20,20 0 0 1 20,0 Z`}
              fill="url(#preview-grad-slanted-pastel)"
              stroke={btn.stroke}
              strokeWidth={btn.strokeWidth}
            />
            <g transform="translate(16, 13)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill={btn.iconColor} stroke="none">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </g>
            <text
              x="88"
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
