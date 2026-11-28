import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Icon } from '@iconify/react';
import { getPaginationPages } from './analyticsUtils';
import { exportProfessionalExcel } from '../../utils/excelExportHelper';

export default function DevicesSourcesTab({ analyticsData = {}, summary = {}, loading = false }) {
  const [tableSort, setTableSort] = useState('Most viewed');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [focusedSortIndex, setFocusedSortIndex] = useState(-1);
  const sortDropdownRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredBrowser, setHoveredBrowser] = useState(null);

  const sortOptions = useMemo(() => [
    { label: 'Most viewed', value: 'Most viewed' },
    { label: 'Browser (A-Z)', value: 'Browser (A-Z)' },
  ], []);

  // Close sort on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target)) {
        setIsSortOpen(false);
      }
    };
    if (isSortOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSortOpen]);

  const handleSortKeyDown = (e) => {
    if (!isSortOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsSortOpen(true);
        const idx = sortOptions.findIndex(opt => opt.value === tableSort);
        setFocusedSortIndex(idx >= 0 ? idx : 0);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedSortIndex(prev => (prev + 1) % sortOptions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedSortIndex(prev => (prev - 1 + sortOptions.length) % sortOptions.length);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (focusedSortIndex >= 0 && focusedSortIndex < sortOptions.length) {
        setTableSort(sortOptions[focusedSortIndex].value);
        setIsSortOpen(false);
        setCurrentPage(1);
      }
    } else if (e.key === 'Escape' || e.key === 'Tab') {
      setIsSortOpen(false);
    }
  };

  const rawDevices = analyticsData?.devices || [];
  const rawBrowsers = analyticsData?.browsers || [];
  const rawSources = analyticsData?.sources || [];
  const totalViews = summary?.totalViews || analyticsData?.summary?.totalViews || 0;

  // Donut values dynamically from analyticsData with fallback
  const deviceData = React.useMemo(() => {
    const findDevice = (term) => {
      return rawDevices.find(d => {
        const t = (d.type || d._id || d.name || '').toLowerCase();
        return t.includes(term.toLowerCase());
      });
    };

    const dDesktop = findDevice('desktop');
    const dTablet = findDevice('tablet');
    const dMobile = findDevice('mobile');

    let deskViews = 0;
    let tabViews = 0;
    let mobViews = 0;

    if (rawDevices.length > 0) {
      deskViews = dDesktop ? Number(dDesktop.views ?? dDesktop.count ?? 0) : 0;
      tabViews = dTablet ? Number(dTablet.views ?? dTablet.count ?? 0) : 0;
      mobViews = dMobile ? Number(dMobile.views ?? dMobile.count ?? 0) : 0;
    } else if (totalViews > 0) {
      deskViews = Math.round(totalViews * 0.58);
      mobViews = Math.round(totalViews * 0.36);
      tabViews = Math.max(0, totalViews - deskViews - mobViews);
    }

    const effectiveTotal = deskViews + tabViews + mobViews || (totalViews > 0 ? totalViews : 0);

    const calcPct = (v) => (effectiveTotal > 0 ? Math.round((v / effectiveTotal) * 100) : 0);

    let deskPct = calcPct(deskViews);
    let tabPct = calcPct(tabViews);
    let mobPct = calcPct(mobViews);

    if (effectiveTotal > 0) {
      const sumPct = deskPct + tabPct + mobPct;
      if (sumPct > 0 && sumPct !== 100) {
        if (deskPct >= tabPct && deskPct >= mobPct) {
          deskPct += (100 - sumPct);
        } else if (mobPct >= tabPct) {
          mobPct += (100 - sumPct);
        } else {
          tabPct += (100 - sumPct);
        }
      }
    }

    return {
      desktop: { name: 'Desktop', views: deskViews, pct: deskPct, color: '#1F78B4', dotBg: 'bg-[#1F78B4]' },
      tablet: { name: 'Tablet', views: tabViews, pct: tabPct, color: '#A6CEE3', dotBg: 'bg-[#A6CEE3]' },
      mobile: { name: 'Mobile', views: mobViews, pct: mobPct, color: '#B2DF8A', dotBg: 'bg-[#B2DF8A]' },
      totalUsers: effectiveTotal,
      hasData: effectiveTotal > 0
    };
  }, [rawDevices, totalViews]);

  // Views by Browser dynamically from backend with fallback
  const browserList = React.useMemo(() => {
    const defaultBrowsers = [
      { name: 'Chrome', color: '#0284C7', dotBg: 'bg-[#0284C7]' },
      { name: 'Safari', color: '#10B981', dotBg: 'bg-[#10B981]' },
      { name: 'Edge', color: '#A3E635', dotBg: 'bg-[#A3E635]' },
      { name: 'Firefox', color: '#7DD3FC', dotBg: 'bg-[#7DD3FC]' },
      { name: 'Other', color: '#BEF264', dotBg: 'bg-[#BEF264]' },
    ];

    return defaultBrowsers.map(item => {
      const found = rawBrowsers.find(b => (b.browser || '').toLowerCase().includes(item.name.toLowerCase()));
      const actualViews = found
        ? Number(found.views || 0)
        : (item.name === 'Chrome' && rawBrowsers.length === 0 ? totalViews : 0);
      const viewsPct = totalViews > 0
        ? Math.round((actualViews / totalViews) * 100)
        : (item.name === 'Chrome' && actualViews > 0 ? 100 : 0);

      return {
        ...item,
        actualViews,
        views: viewsPct
      };
    });
  }, [rawBrowsers, totalViews]);

  // Table rows dynamically from browsers or fallback
  const trafficRows = React.useMemo(() => {
    // Map of common default platforms for each browser if backend does not supply one
    const defaultBrowserPlatform = {
      'Chrome': 'Windows / Mac / Android',
      'Safari': 'iOS / macOS',
      'Edge': 'Windows / Mac',
      'Firefox': 'Windows / Linux',
      'Opera': 'Windows / Android',
      'Samsung Internet': 'Android'
    };

    // If recentSessions has device data, aggregate exact platforms per browser
    const browserPlatformMap = new Map();
    (analyticsData?.recentSessions || []).forEach(s => {
      const bName = s.device?.browser || 'Other';
      const osName = s.device?.os && s.device.os !== 'Unknown' ? s.device.os : (s.device?.type || '');
      if (!browserPlatformMap.has(bName)) {
        browserPlatformMap.set(bName, new Set());
      }
      if (osName) browserPlatformMap.get(bName).add(osName);
    });

    if (totalViews === 0) return [];

    if (rawBrowsers.length > 0) {
      return rawBrowsers.map((b) => {
        const bName = b.browser || 'Chrome';
        let platformStr = b.platform;

        if (!platformStr && browserPlatformMap.has(bName) && browserPlatformMap.get(bName).size > 0) {
          platformStr = Array.from(browserPlatformMap.get(bName)).join(', ');
        }

        if (!platformStr) {
          platformStr = defaultBrowserPlatform[bName] || (summary?.topDevice || 'Desktop');
        }

        return {
          browser: bName,
          platform: platformStr,
          views: b.views?.toLocaleString() || '1',
          share: totalViews > 0 ? `${Math.round((b.views / totalViews) * 100)}%` : '100%'
        };
      });
    }
    return [
      { browser: 'Chrome', platform: 'Windows', views: `${totalViews || 1}`, share: '100%' }
    ];
  }, [rawBrowsers, totalViews, analyticsData, summary]);

  const sortedTrafficRows = React.useMemo(() => {
    const list = [...trafficRows];
    if (tableSort === 'Browser (A-Z)') {
      return list.sort((a, b) => a.browser.localeCompare(b.browser));
    }
    return list.sort((a, b) => {
      const vA = Number(String(a.views).replace(/,/g, '')) || 0;
      const vB = Number(String(b.views).replace(/,/g, '')) || 0;
      return vB - vA;
    });
  }, [trafficRows, tableSort]);

  const ITEMS_PER_PAGE = 5;
  const totalPages = Math.max(1, Math.ceil(sortedTrafficRows.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedRows = sortedTrafficRows.slice((safeCurrentPage - 1) * ITEMS_PER_PAGE, safeCurrentPage * ITEMS_PER_PAGE);
  const pageItems = getPaginationPages(safeCurrentPage, totalPages);

  const startCount = sortedTrafficRows.length === 0 ? 0 : (safeCurrentPage - 1) * ITEMS_PER_PAGE + 1;
  const endCount = Math.min(safeCurrentPage * ITEMS_PER_PAGE, sortedTrafficRows.length);
  const labelText = sortedTrafficRows.length <= 1
    ? `Showing ${sortedTrafficRows.length} ${sortedTrafficRows.length === 1 ? 'browser' : 'browsers'}`
    : `Showing ${startCount}–${endCount} of ${sortedTrafficRows.length} browsers`;

  const exportCSV = async () => {
    if (sortedTrafficRows.length === 0) return;

    const columns = [
      { header: 'Browser', key: 'browser', width: 22, bold: true },
      { header: 'Platform / OS', key: 'platform', width: 20 },
      { header: 'Views', key: 'views', width: 16, align: 'right', isNumeric: true },
      { header: 'Traffic Share', key: 'share', width: 16, align: 'center' }
    ];

    const data = sortedTrafficRows.map(r => ({
      browser: r.browser,
      platform: r.platform,
      views: r.views,
      share: r.share
    }));

    const totalViews = sortedTrafficRows.reduce((sum, r) => sum + (Number(r.views) || 0), 0);
    const totals = {
      browser: 'TOTAL',
      platform: 'All Platforms',
      views: totalViews,
      share: '100%'
    };

    // Chart: Device Breakdown Donut Chart
    const devLabels = ['Desktop', 'Mobile', 'Tablet'];
    const devValues = [
      Number(summary.desktopViews || analyticsData?.devices?.find(d => d.type === 'Desktop')?.views || 0),
      Number(summary.mobileViews || analyticsData?.devices?.find(d => d.type === 'Mobile')?.views || 0),
      Number(summary.tabletViews || analyticsData?.devices?.find(d => d.type === 'Tablet')?.views || 0)
    ];

    await exportProfessionalExcel({
      filename: `Device_Sources_Analytics`,
      sheetName: 'Browsers & Devices',
      title: 'Devices & Browsers Analytics Report',
      subtitle: 'Comprehensive breakdown of reader hardware & software environments',
      filters: {
        'Sort Filter': tableSort,
        'Top Device': summary.topDevice || 'Desktop',
        'Total Unique Browsers': sortedTrafficRows.length
      },
      columns,
      data,
      totals,
      kpiCards: [
        { label: 'Top Device', value: summary.topDevice || 'Desktop', note: 'Highest reader share' },
        { label: 'Total Views', value: String(totalViews), note: 'Across all platforms' },
        { label: 'Desktop Share', value: `${devValues[0]} views`, note: 'PC / Mac / Laptops' },
        { label: 'Mobile Share', value: `${devValues[1]} views`, note: 'Smartphones' }
      ],
      chartConfig: {
        type: 'donut',
        title: 'Reader Distribution by Device Category',
        subtitle: 'Proportional views between Desktop, Mobile and Tablet',
        labels: devLabels,
        datasets: [
          {
            label: 'Views',
            data: devValues,
            colors: ['#F05338', '#0284C7', '#10B981']
          }
        ]
      }
    });
  };

  return (
    <div className="space-y-[1.1vw]">
      {/* Sub-Header */}
      <div className="flex items-center gap-[0.55vw] pt-[0.1vw]">
        <div className="w-[2.3vw] h-[2.3vw] rounded-[0.65vw] bg-[#F0EDFF] text-[#7357C8] flex items-center justify-center shrink-0">
          <Icon icon="energy-icons:devices-20-bold" className="w-[1.15vw] h-[1.15vw]" />
        </div>
        <div>
          <h3 className="text-[0.95vw] font-semibold text-slate-900 tracking-tight ">
            Device Breakdown
          </h3>
          <p className="text-[0.7vw] text-slate-500 font-normal">
            See how readers access your flipbooks across desktop, mobile and tablet.
          </p>
        </div>
      </div>

      {/* Dual Cards: Devices Used (Donut with leader lines) + Views by Browser (Bar chart) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[1vw]">

        {/* Left: Devices Used Donut with leader lines */}
        <div className="bg-white rounded-[0.75vw] p-[1vw] border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <h4 className="text-[0.85vw] font-semibold text-slate-900 mb-[0.2vw]">
            Devices Used
          </h4>

          <div className="relative w-full h-[17.5vw] min-h-[250px] flex items-center justify-center my-[0.1vw]">
            {/* SVG Donut with Leader Lines matching exact reference design */}
            <svg viewBox="0 0 380 270" className="w-full h-full select-none overflow-visible">
              {/* Center Donut Ring */}
              <g transform="translate(190, 135) rotate(-90)">
                {(() => {
                  const r = 76;
                  const strokeW = 54;
                  const circumference = 2 * Math.PI * r;
                  const deskDash = (deviceData.desktop.pct / 100) * circumference;
                  const tabDash = (deviceData.tablet.pct / 100) * circumference;
                  const mobDash = (deviceData.mobile.pct / 100) * circumference;

                  return (
                    <>
                      {/* Background track circle */}
                      <circle cx="0" cy="0" r={r} fill="none" stroke="#F8FAFC" strokeWidth={strokeW} />

                      {/* Desktop Segment (#1F78B4 / Steel Blue) */}
                      {deskDash > 0 && (
                        <circle
                          cx="0"
                          cy="0"
                          r={r}
                          fill="none"
                          stroke="#1F78B4"
                          strokeWidth={strokeW}
                          strokeDasharray={`${deskDash} ${circumference - deskDash}`}
                          strokeDashoffset="0"
                        />
                      )}

                      {/* Tablet Segment (#A6CEE3 / Soft Light Blue) */}
                      {tabDash > 0 && (
                        <circle
                          cx="0"
                          cy="0"
                          r={r}
                          fill="none"
                          stroke="#A6CEE3"
                          strokeWidth={strokeW}
                          strokeDasharray={`${tabDash} ${circumference - tabDash}`}
                          strokeDashoffset={`-${deskDash}`}
                        />
                      )}

                      {/* Mobile Segment (#B2DF8A / Soft Light Green) */}
                      {mobDash > 0 && (
                        <circle
                          cx="0"
                          cy="0"
                          r={r}
                          fill="none"
                          stroke="#B2DF8A"
                          strokeWidth={strokeW}
                          strokeDasharray={`${mobDash} ${circumference - mobDash}`}
                          strokeDashoffset={`-${deskDash + tabDash}`}
                        />
                      )}
                    </>
                  );
                })()}
              </g>

              {/* Leader lines & labels - exact angles & styling from reference */}
              {/* Desktop (Right: from center of right half towards upper right) */}
              {deviceData.desktop.pct > 0 && (
                <g>
                  <polyline points="245,135 288,85 330,85" fill="none" stroke="#6B7280" strokeWidth="1.2" />
                  <text x="292" y="75" fontSize="15.5" fontWeight="500" fill="#111827">{deviceData.desktop.pct} %</text>
                  <text x="292" y="100" fontSize="12" fontWeight="normal" fill="#111827">{deviceData.desktop.views.toLocaleString()} - Users</text>
                </g>
              )}

              {/* Mobile (Top Left: from center of top-left quadrant) */}
              {deviceData.mobile.pct > 0 && (
                <g>
                  <polyline points="145,72 120,38 72,38" fill="none" stroke="#6B7280" strokeWidth="1.2" />
                  <text x="116" y="28" textAnchor="end" fontSize="15.5" fontWeight="500" fill="#111827">{deviceData.mobile.pct} %</text>
                  <text x="116" y="53" textAnchor="end" fontSize="12" fontWeight="normal" fill="#111827">{deviceData.mobile.views.toLocaleString()} - Users</text>
                </g>
              )}

              {/* Tablet Segment (#A6CEE3 / Soft Light Blue) */}
              {deviceData.tablet.pct > 0 && (() => {
                // Calculate dynamic midpoint angle for tablet segment
                // Segments start at 12 o'clock (-90 deg) and go clockwise: Desktop -> Tablet -> Mobile
                const deskAngle = (deviceData.desktop.pct / 100) * 360;
                const tabAngle = (deviceData.tablet.pct / 100) * 360;
                const midAngleDeg = -90 + deskAngle + (tabAngle / 2);
                const midRad = (midAngleDeg * Math.PI) / 180;
                
                // Radius in middle of donut ring
                const rMid = 76;
                const startX = Math.round(190 + rMid * Math.cos(midRad));
                const startY = Math.round(135 + rMid * Math.sin(midRad));

                // Anchor label to the left
                const elbowX = Math.max(50, Math.min(130, startX - 25));
                const elbowY = Math.max(160, Math.min(235, startY + 28));
                const endX = 70;

                return (
                  <g>
                    <polyline
                      points={`${startX},${startY} ${elbowX},${elbowY} ${endX},${elbowY}`}
                      fill="none"
                      stroke="#6B7280"
                      strokeWidth="1.2"
                    />
                    <text x={elbowX - 4} y={elbowY - 10} textAnchor="end" fontSize="15.5" fontWeight="500" fill="#111827">
                      {deviceData.tablet.pct} %
                    </text>
                    <text x={elbowX - 4} y={elbowY + 15} textAnchor="end" fontSize="12" fontWeight="normal" fill="#111827">
                      {deviceData.tablet.views.toLocaleString()} - Users
                    </text>
                  </g>
                );
              })()}

              {/* Center Content */}
              <text x="190" y="130" textAnchor="middle" fontSize="16.5" fontWeight="500" fill="#111827">
                {deviceData.hasData ? '100 %' : '0 %'}
              </text>
              <text x="190" y="152" textAnchor="middle" fontSize="12" fontWeight="normal" fill="#111827">
                {deviceData.totalUsers.toLocaleString()} Users
              </text>
            </svg>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-[2.5vw] pt-[0.4vw] border-t border-slate-100 text-[0.74vw]">
            <div className="flex items-center gap-[0.45vw]">
              <span className="w-[0.7vw] h-[0.7vw] rounded-full bg-[#1F78B4]"></span>
              <span className="text-slate-700 font-normal">Desktop</span>
            </div>
            <div className="flex items-center gap-[0.45vw]">
              <span className="w-[0.7vw] h-[0.7vw] rounded-full bg-[#A6CEE3]"></span>
              <span className="text-slate-700 font-normal">Tablet</span>
            </div>
            <div className="flex items-center gap-[0.45vw]">
              <span className="w-[0.7vw] h-[0.7vw] rounded-full bg-[#B2DF8A]"></span>
              <span className="text-slate-700 font-normal">Mobile</span>
            </div>
          </div>
        </div>

        {/* Right: Views by browser (Bar chart) */}
        <div className="bg-white rounded-[0.75vw] p-[1vw] border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <h4 className="text-[0.85vw] font-semibold text-slate-900 mb-[0.2vw]">
            Views by browser
          </h4>

          {/* Bar Chart Canvas with Dotted Grid */}
          <div
            className="relative w-full h-[17.5vw] min-h-[250px] flex flex-col justify-between my-[0.1vw]"
            onMouseLeave={() => setHoveredBrowser(null)}
          >
            <svg viewBox="0 0 440 200" className="w-full h-full select-none overflow-visible">
              {/* Dotted Y-axis Guide lines */}
              {[0, 20, 40, 60, 80, 100].map(v => {
                const y = 170 - (v / 100) * 150;
                return (
                  <g key={v}>
                    <line x1="30" y1={y} x2="430" y2={y} stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3 3" />
                    <text x="24" y={y + 3.5} textAnchor="end" fontSize="9" fill="#64748B" fontWeight="normal">{v}</text>
                  </g>
                );
              })}

              {/* Bars */}
              {browserList.map((b, i) => {
                const barWidth = 32;
                const barSpacing = 78;
                const x = 50 + i * barSpacing;
                const h = (b.views / 100) * 150;
                const y = 170 - h;

                return (
                  <g key={b.name} className="cursor-pointer" onMouseEnter={() => setHoveredBrowser(b.name)}>
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={h}
                      rx="4"
                      fill={b.color}
                      className="transition-all duration-300 hover:opacity-90"
                    />
                    <text
                      x={x + barWidth / 2}
                      y="185"
                      textAnchor="middle"
                      fontSize="9.5"
                      fill="#111827"
                      fontWeight="normal"
                    >
                      {b.name}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Hover Tooltip Card (e.g. Chrome : 2 Views) */}
            {hoveredBrowser && (
              <div
                className="absolute bg-white px-[0.7vw] py-[0.35vw] rounded-[0.45vw] shadow-[0_4px_16px_rgba(0,0,0,0.12)] border border-slate-200 pointer-events-none text-[0.72vw] z-10"
                style={{
                  left: hoveredBrowser === 'Chrome' ? '20%' : hoveredBrowser === 'Safari' ? '36%' : hoveredBrowser === 'Edge' ? '54%' : hoveredBrowser === 'Firefox' ? '70%' : '84%',
                  top: '60%',
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <div className="flex items-center gap-[0.3vw]">
                  <span className="text-slate-700 font-semibold">{hoveredBrowser}</span>
                  <span className="text-slate-500">:</span>
                  <span className="text-slate-900 font-bold">
                    {browserList.find(b => b.name === hoveredBrowser)?.actualViews || 0} Views
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-[1.5vw] pt-[0.5vw] border-t border-slate-100 text-[0.74vw] flex-wrap">
            {browserList.map((b) => (
              <div key={b.name} className="flex items-center gap-[0.3vw]">
                <span className={`w-[0.55vw] h-[0.55vw] rounded-full ${b.dotBg}`}></span>
                <span className="text-slate-700 font-medium">{b.name}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Traffic Sources Table */}
      <div className="bg-white rounded-[0.75vw] p-[1.1vw] border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-[0.9vw]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-[0.6vw]">
          <div>
            <h3 className="text-[0.95vw] font-semibold text-slate-900 tracking-tight">
              Traffic Sources
            </h3>
            <p className="text-[0.7vw] text-slate-500 font-normal">
              Understand where your readers come from, including direct, social and referral traffic.
            </p>
          </div>

          <div className="flex items-center gap-[0.5vw]">
            {/* Sort Dropdown */}
            <div className="relative" ref={sortDropdownRef}>
              <button
                type="button"
                onClick={() => setIsSortOpen(!isSortOpen)}
                onKeyDown={handleSortKeyDown}
                aria-haspopup="listbox"
                aria-expanded={isSortOpen}
                className="inline-flex items-center gap-[0.45vw] px-[0.9vw] py-[0.42vw] bg-white border-[1.5px] border-slate-300 hover:border-slate-400 rounded-[0.55vw] text-[0.76vw] text-slate-700 font-medium hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#F05338]/20 transition-all cursor-pointer shadow-xs"
              >
                <Icon icon="iconoir:sort" className="w-[0.95vw] h-[0.95vw] text-[#F05338]" />
                <span className="font-normal">{tableSort}</span>
                <Icon icon="solar:alt-arrow-down-linear" className="w-[0.7vw] h-[0.7vw] text-slate-400" />
              </button>

              {isSortOpen && (
                <div
                  role="listbox"
                  onMouseLeave={() => setFocusedSortIndex(-1)}
                  className="absolute right-0 mt-[0.4vw] w-[11.5vw] bg-white border border-slate-200 rounded-[0.55vw] shadow-[0_6px_24px_rgba(0,0,0,0.08)] py-[0.35vw] px-[0.3vw] z-30 text-[0.76vw] animate-in fade-in zoom-in-95 duration-100"
                >
                  <div className="px-[0.8vw] py-[0.3vw] text-[0.65vw] font-semibold tracking-wider uppercase text-slate-400">
                    Sort Table
                  </div>
                  {sortOptions.map((opt, idx) => {
                    const isCurrent = tableSort === opt.value;
                    const isFocused = focusedSortIndex === idx;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        role="option"
                        aria-selected={isCurrent}
                        onClick={() => {
                          setTableSort(opt.value);
                          setIsSortOpen(false);
                          setFocusedSortIndex(-1);
                          setCurrentPage(1);
                        }}
                        onMouseEnter={() => setFocusedSortIndex(idx)}
                        onMouseLeave={() => setFocusedSortIndex(-1)}
                        className={`w-full text-left px-[0.8vw] py-[0.45vw] rounded-[0.4vw] transition-colors cursor-pointer flex items-center justify-between font-normal ${
                          isFocused
                            ? 'bg-orange-50/80 text-[#F05338]'
                            : isCurrent
                            ? 'bg-orange-50/50 text-[#F05338]'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {isCurrent && (
                          <Icon icon="solar:check-read-linear" className="w-[0.8vw] h-[0.8vw] text-[#F05338]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Download File Button */}
            <button
              type="button"
              onClick={exportCSV}
              className="inline-flex items-center gap-[0.35vw] px-[0.85vw] py-[0.42vw] bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-950 border border-slate-300 rounded-[0.45vw] text-[0.74vw] font-medium shadow-xs transition-colors cursor-pointer"
            >
              <Icon icon="solar:download-minimalistic-linear" className="w-[0.85vw] h-[0.85vw] text-slate-600" />
              <span>Download file</span>
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="border border-slate-200 rounded-[0.65vw] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[0.76vw]">
              <thead>
                <tr className="bg-slate-50/80 text-slate-600 font-semibold text-[0.72vw] border-b border-slate-200 tracking-wide uppercase">
                  <th className="py-[0.7vw] px-[1vw]">Browser</th>
                  <th className="py-[0.7vw] px-[1vw]">Platform</th>
                  <th className="py-[0.7vw] px-[1vw] text-center">Views</th>
                  <th className="py-[0.7vw] px-[1vw] text-center">Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={`device-skel-${i}`} className="animate-pulse">
                      <td className="py-[0.7vw] px-[1vw]">
                        <div className="h-[0.6vw] w-[6vw] bg-slate-100 rounded" />
                      </td>
                      <td className="py-[0.7vw] px-[1vw]">
                        <div className="h-[0.6vw] w-[9vw] bg-slate-100 rounded" />
                      </td>
                      <td className="py-[0.7vw] px-[1vw] text-center">
                        <div className="h-[0.6vw] w-[2.5vw] bg-slate-100 rounded mx-auto" />
                      </td>
                      <td className="py-[0.7vw] px-[1vw] text-center">
                        <div className="h-[0.6vw] w-[2.5vw] bg-slate-100 rounded mx-auto" />
                      </td>
                    </tr>
                  ))
                ) : paginatedRows.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-[2.5vw] text-center text-slate-400 font-normal">
                      No browser activity found.
                    </td>
                  </tr>
                ) : (
                  paginatedRows.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-[0.7vw] px-[1vw] text-slate-900 font-normal">
                        {row.browser}
                      </td>
                      <td className="py-[0.7vw] px-[1vw] text-slate-600 font-normal">
                        {row.platform}
                      </td>
                      <td className="py-[0.7vw] px-[1vw] text-center text-slate-900 font-normal">
                        {row.views}
                      </td>
                      <td className="py-[0.7vw] px-[1vw] text-center text-slate-900 font-normal">
                        {row.share}
                      </td>
                    </tr>
                  ))
                )}

                {/* Summary Total Row */}
                <tr className="bg-slate-50/80 font-normal border-t-2 border-slate-200">
                  <td className="py-[0.7vw] px-[1vw] text-slate-900 font-normal">
                    Total
                  </td>
                  <td className="py-[0.7vw] px-[1vw] text-slate-700 font-normal">
                    {sortedTrafficRows.length} Browsers
                  </td>
                  <td className="py-[0.7vw] px-[1vw] text-center text-slate-900 font-normal">
                    {(totalViews || 0).toLocaleString()}
                  </td>
                  <td className="py-[0.7vw] px-[1vw] text-center text-slate-900 font-normal">
                    100%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {sortedTrafficRows.length > 0 && (
          <div className="flex items-center justify-between pt-[0.4vw] text-[0.72vw]">
            <span className="text-black font-medium">
              Showing {Math.min((safeCurrentPage - 1) * ITEMS_PER_PAGE + 1, sortedTrafficRows.length)}–{Math.min(safeCurrentPage * ITEMS_PER_PAGE, sortedTrafficRows.length)} of {sortedTrafficRows.length}
            </span>

            <div className="flex items-center gap-[0.3vw]">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`w-[1.6vw] h-[1.6vw] rounded-[0.35vw] text-[0.72vw] font-medium transition-colors cursor-pointer flex items-center justify-center ${
                    safeCurrentPage === page
                      ? 'bg-[#F05338] text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}