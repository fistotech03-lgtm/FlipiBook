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
            <g transform="translate(18, 15)">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m2.05 2.05 1.099-.028a1 1 0 0 1 1.008.815l2.69 14.347A1 1 0 0 0 7.83 18H18" />
                <path d="M4.563 5h16.435a1 1 0 0 1 .981 1.204l-1.026 6.226A2 2 0 0 1 18.962 14H6.25" />
                <circle cx="18" cy="20" r="2" />
                <circle cx="8" cy="20" r="2" />
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
            <g transform="translate(13, 15)">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m2.05 2.05 1.099-.028a1 1 0 0 1 1.008.815l2.69 14.347A1 1 0 0 0 7.83 18H18" />
                <path d="M4.563 5h16.435a1 1 0 0 1 .981 1.204l-1.026 6.226A2 2 0 0 1 18.962 14H6.25" />
                <circle cx="18" cy="20" r="2" />
                <circle cx="8" cy="20" r="2" />
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
            <g transform="translate(11, 15)">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m2.05 2.05 1.099-.028a1 1 0 0 1 1.008.815l2.69 14.347A1 1 0 0 0 7.83 18H18" />
                <path d="M4.563 5h16.435a1 1 0 0 1 .981 1.204l-1.026 6.226A2 2 0 0 1 18.962 14H6.25" />
                <circle cx="18" cy="20" r="2" />
                <circle cx="8" cy="20" r="2" />
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
            <g transform="translate(18, 15)">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                <path d="M2 12h20" />
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
            <g transform="translate(13, 15)">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#22c55e">
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
            <g transform="translate(10, 15)">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384" />
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
            <g transform="translate(10, 15)">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5" />
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
            <g transform="translate(10, 15)">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3v12" />
                <path d="m17 8-5-5-5 5" />
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
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
            <g transform="translate(16, 15)">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={btn.iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" />
                <path d="M20 2v4" />
                <path d="M22 4h-4" />
                <circle cx="4" cy="20" r="2" />
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
            <g transform="translate(16, 15)">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={btn.iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z" />
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
            <g transform="translate(13, 15)">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.268 21a2 2 0 0 0 3.464 0" />
                <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" />
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
            <g transform="translate(16, 15)">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={btn.iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
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
            <g transform="translate(16, 15)">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={btn.iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15.914 4a1.5 1.5 0 00-2.474-1.561l-9 9A1.5 1.5 0 005.5 14h4.002a.5.5 0 01.471.666L8.086 20a1.5 1.5 0 002.475 1.56l9-9A1.5 1.5 0 0018.5 10h-3.997a.5.5 0 01-.472-.667z" />
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
            <g transform="translate(116, 15)">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={btn.iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
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
            <g transform="translate(10, 15)">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={btn.iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
                <circle cx="7.5" cy="7.5" r=".5" fill={btn.iconColor} stroke="none" />
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
            <g transform="translate(16, 15)">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={btn.iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41l-7.59-7.59a2.41 2.41 0 0 0-3.41 0Z" />
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
            <g transform="translate(10, 15)">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 15V3" />
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <path d="m7 10 5 5 5-5" />
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
            <g transform="translate(16, 15)">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={btn.iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z" />
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
