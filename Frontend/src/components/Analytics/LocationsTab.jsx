import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Icon } from '@iconify/react';
import AnalyticsDatePicker from './AnalyticsDatePicker';
import { getPaginationPages, formatDuration, buildDynamicTimeline, getSampledXLabels } from './analyticsUtils';
import { exportProfessionalExcel } from '../../utils/excelExportHelper';
import worldMercMapData from './worldMercMapData.json';
import worldMercBBoxes from './worldMercBBoxes.json';
import mercCountries from './mercCountries.json';

const DEFAULT_LOCATION_DATA = [
  { country: 'India', code: 'IN', readers: 520, views: 1120, avgTime: '4m 12s', share: '41.7%', trend: [118, 144, 130, 188, 175, 220, 242] },
  { country: 'United States', code: 'US', readers: 310, views: 720, avgTime: '3m 35s', share: '24.8%', trend: [78, 93, 73, 110, 105, 130, 118] },
  { country: 'United Kingdom', code: 'GB', readers: 185, views: 430, avgTime: '3m 08s', share: '14.8%', trend: [50, 65, 55, 75, 70, 85, 90] },
  { country: 'Germany', code: 'DE', readers: 110, views: 260, avgTime: '2m 54s', share: '8.8%', trend: [30, 40, 35, 50, 45, 55, 50] },
  { country: 'Canada', code: 'CA', readers: 123, views: 290, avgTime: '3m 15s', share: '9.9%', trend: [35, 45, 40, 55, 50, 60, 65] },
];

const COUNTRY_NAME_TO_CODE = {
  'india': 'IN',
  'united states': 'US',
  'usa': 'US',
  'united kingdom': 'GB',
  'uk': 'GB',
  'germany': 'DE',
  'canada': 'CA',
  'australia': 'AU',
  'france': 'FR',
  'brazil': 'BR',
  'china': 'CN',
  'japan': 'JP',
  'russia': 'RU',
  'spain': 'ES',
  'italy': 'IT',
  'mexico': 'MX',
  'romania': 'RO'
};

const CONTINENT_BBOXES = {
  'World': '0 0 900 583',
  'Asia': '450 200 370 260',
  'Europe': '390 140 220 180',
  'North America': '20 130 260 230'
};

const DEFAULT_VIEWBOX = '0 0 900 583';

export default function LocationsTab({ timeline = [], analyticsData = {}, summary = {}, loading = false }) {
  const [dateFilter, setDateFilter] = useState('7d');
  const [groupBy, setGroupBy] = useState('week');
  const [customRange, setCustomRange] = useState({
    startDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
  });
  const datePickerRef = useRef(null);

  // Dynamic timeline driven by LocationsTab's date filters
  const activeTimeline = useMemo(() => {
    return buildDynamicTimeline(dateFilter, customRange, analyticsData?.dailyViews || [], summary.avgDuration || 0);
  }, [dateFilter, customRange, analyticsData?.dailyViews, summary.avgDuration]);

  const [selectedCountry, setSelectedCountry] = useState('All Countries');
  const [selectedForCompare, setSelectedForCompare] = useState(['India', 'United States']);
  const [hoveredCompareDateIdx, setHoveredCompareDateIdx] = useState(null); // Shows tooltip and guideline only on hover
  const [hoveredMapCountry, setHoveredMapCountry] = useState(null);
  const [tableSort, setTableSort] = useState('Most viewed');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [focusedSortIndex, setFocusedSortIndex] = useState(-1);
  const sortDropdownRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [mapScale, setMapScale] = useState(1);
  const [mapPan, setMapPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const mapContainerRef = useRef(null);

  // Attach a non-passive wheel listener directly to the map container to prevent the browser window from zooming on Ctrl+Wheel
  useEffect(() => {
    const el = mapContainerRef.current;
    if (!el) return;

    const handleWheel = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        e.stopPropagation();
        setMapScale(prev => {
          const factor = e.deltaY < 0 ? 1.15 : 0.85;
          const next = prev * factor;
          return Math.min(Math.max(1, next), 12);
        });
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', handleWheel);
    };
  }, []);

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

  const sortOptions = useMemo(() => [
    { label: 'Most viewed', value: 'Most viewed' },
    { label: 'Most readers', value: 'Most readers' },
    { label: 'Location (A-Z)', value: 'Location (A-Z)' },
  ], []);

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

  const rawCountries = analyticsData?.countries || [];
  const rawTotalViews = summary?.totalViews || analyticsData?.summary?.totalViews || 0;
  const avgTimeStr = summary?.avgDurationSeconds
    ? `${Math.floor(summary.avgDurationSeconds / 60)}m ${summary.avgDurationSeconds % 60}s`
    : '4m 12s';

  // Merge backend data with fallback list
  const locationList = useMemo(() => {
    // Build lookup for actual per-country per-day views if returned by backend
    const countryDayMap = {};
    (analyticsData?.countryDailyViews || []).forEach(cd => {
      let c = cd.country || 'Unknown';
      if (c === 'United Nations' || c === 'UN') c = 'Unknown';
      if (!countryDayMap[c]) countryDayMap[c] = {};
      countryDayMap[c][cd.date] = cd.views || 0;
    });

    if (rawCountries.length > 0) {
      return rawCountries.map((c, idx) => {
        let cName = c.country || 'Unknown';
        if (cName === 'United Nations' || cName === 'UN') {
          cName = 'Unknown';
        }
        const code = (c.code || COUNTRY_NAME_TO_CODE[cName.toLowerCase()] || '').toLowerCase();
        const viewsNum = c.views || 0;
        const fallback = DEFAULT_LOCATION_DATA.find(d => d.country.toLowerCase() === cName.toLowerCase());

        // Dynamic trend from actual dates
        const hasRealDayData = countryDayMap[cName] && Object.keys(countryDayMap[cName]).length > 0;
        let trend = [];

        if (hasRealDayData) {
          trend = activeTimeline.map(t => countryDayMap[cName][t.dateKey] || 0);
        } else {
          // If totalViews exist on activeTimeline, distribute according to country share
          const totalTimelineViews = activeTimeline.reduce((sum, t) => sum + (t.views || 0), 0);
          if (totalTimelineViews > 0) {
            trend = activeTimeline.map(t => Math.round((t.views || 0) * (c.percentage ? c.percentage / 100 : 0.5)));
          } else {
            trend = fallback?.trend || [Math.round(viewsNum * 0.4), Math.round(viewsNum * 0.6), Math.round(viewsNum * 0.5), Math.round(viewsNum * 0.8), Math.round(viewsNum * 0.7), Math.round(viewsNum * 0.9), viewsNum];
          }
        }

        const countryAvgDuration = c.avgDurationSeconds !== undefined
          ? (c.avgDurationSeconds > 0
              ? `${Math.floor(c.avgDurationSeconds / 60)}m ${c.avgDurationSeconds % 60}s`
              : (summary?.avgDurationSeconds
                  ? `${Math.floor(summary.avgDurationSeconds / 60)}m ${summary.avgDurationSeconds % 60}s`
                  : '—'))
          : avgTimeStr;

        return {
          country: cName,
          code,
          readers: c.readers !== undefined ? c.readers : Math.max(1, Math.round(viewsNum * 0.75)),
          views: viewsNum,
          avgTime: countryAvgDuration,
          share: `${c.percentage !== undefined ? c.percentage : (rawTotalViews > 0 ? Math.round((viewsNum / rawTotalViews) * 100) : 100)}%`,
          trend: trend.length > 0 ? trend : [0, 0, 0, 0, 0, 0, 0]
        };
      });
    }
    return [];
  }, [rawCountries, rawTotalViews, avgTimeStr, activeTimeline, analyticsData?.countryDailyViews]);

  const maxReaders = useMemo(() => {
    return Math.max(...locationList.map(d => d.readers), 1);
  }, [locationList]);

  // Dynamic ViewBox based on selectedCountry, scale, and pan
  const currentViewBox = useMemo(() => {
    let base = [0, 0, 900, 583]; // DEFAULT_VIEWBOX [x, y, w, h]
    if (selectedCountry && selectedCountry !== 'All Countries' && selectedCountry !== 'All') {
      const code = (COUNTRY_NAME_TO_CODE[selectedCountry.toLowerCase()] ||
        mercCountries.find(c => c.name.toLowerCase() === selectedCountry.toLowerCase())?.code || '').toUpperCase();
      if (code && worldMercBBoxes[code]) {
        const parts = worldMercBBoxes[code].split(' ').map(Number);
        if (parts.length === 4) {
          base = parts;
        }
      }
    }

    const [bx, by, bw, bh] = base;
    const w = bw / mapScale;
    const h = bh / mapScale;
    const cx = bx + bw / 2 + mapPan.x;
    const cy = by + bh / 2 + mapPan.y;
    const x = cx - w / 2;
    const y = cy - h / 2;

    return `${x} ${y} ${w} ${h}`;
  }, [selectedCountry, mapScale, mapPan]);

  // Map of country codes that have actual reader activity
  const activeCountryCodesMap = useMemo(() => {
    const map = {};
    locationList.forEach(loc => {
      const code = (loc.code || COUNTRY_NAME_TO_CODE[loc.country.toLowerCase()] || '').toUpperCase();
      const val = Number(loc.readers || loc.views) || 0;
      if (code && val > 0) {
        map[code] = true;
      }
    });
    return map;
  }, [locationList]);

  // Countries to highlight on map - strictly only countries with actual reader data
  const mapCountryColors = useMemo(() => {
    // If a specific country is selected:
    if (selectedCountry && selectedCountry !== 'All Countries' && selectedCountry !== 'All') {
      const targetCode = (COUNTRY_NAME_TO_CODE[selectedCountry.toLowerCase()] ||
        mercCountries.find(c => c.name.toLowerCase() === selectedCountry.toLowerCase())?.code || '').toUpperCase();
      
      const singleShades = {};
      if (targetCode) {
        // Check if selected country has actual reader activity
        const locItem = locationList.find(l => l.country.toLowerCase() === selectedCountry.toLowerCase());
        const hasData = locItem && (Number(locItem.readers || locItem.views) || 0) > 0;
        
        // If it has actual data, use vibrant blue highlight.
        // If normal select without actual data (e.g. Russia clicked), use distinct neutral slate/gray:
        singleShades[targetCode] = hasData ? '#0BA6FF' : '#94A3B8';
      }
      return singleShades;
    }

    const shades = {};

    // Calculate maximum readers/views among countries with actual data
    const maxVal = Math.max(...locationList.map(loc => Number(loc.readers || loc.views) || 0), 1);

    locationList.forEach(loc => {
      const upperCode = (loc.code || COUNTRY_NAME_TO_CODE[loc.country.toLowerCase()] || '').toUpperCase();
      const val = Number(loc.readers || loc.views) || 0;
      if (!upperCode || val <= 0) return;

      const ratio = val / maxVal;
      // Gradient of blues based on volume: most readers = deepest/most vibrant blue
      if (ratio >= 0.8) {
        shades[upperCode] = '#1D4ED8'; // Deep vibrant navy/blue (highest)
      } else if (ratio >= 0.5) {
        shades[upperCode] = '#2563EB'; // Strong royal blue
      } else if (ratio >= 0.25) {
        shades[upperCode] = '#3B82F6'; // Medium blue
      } else {
        shades[upperCode] = '#60A5FA'; // Soft lighter blue (lowest data)
      }
    });

    return shades;
  }, [locationList, selectedCountry]);

  const toggleCompareCountry = (country) => {
    if (selectedForCompare.includes(country)) {
      if (selectedForCompare.length > 1) {
        setSelectedForCompare(selectedForCompare.filter(c => c !== country));
      }
    } else {
      setSelectedForCompare([...selectedForCompare, country]);
    }
  };

  // Compare Line Chart Layout (Enlarged viewport for a bigger, clearer graph)
  const chartW = 760;
  const chartH = 370;
  const padL = 48;
  const padR = 24;
  const padT = 24;
  const padB = 40;
  const innerW = chartW - padL - padR;
  const innerH = chartH - padT - padB;

  // Dynamic Y-axis scale based on selected compare countries maximum values
  const { yMax, yTicks } = useMemo(() => {
    let maxVal = 0;
    selectedForCompare.forEach(cName => {
      const countryObj = locationList.find(c => c.country === cName);
      if (countryObj && countryObj.trend) {
        countryObj.trend.forEach(v => {
          if (v > maxVal) maxVal = v;
        });
      }
    });

    if (maxVal <= 0) maxVal = 5;

    // Determine appropriate nice upper ceiling and 5 evenly spaced ticks
    let ceiling = 275;
    if (maxVal <= 5) {
      ceiling = 5;
    } else if (maxVal <= 10) {
      ceiling = 10;
    } else if (maxVal <= 25) {
      ceiling = 25;
    } else if (maxVal <= 50) {
      ceiling = 50;
    } else if (maxVal <= 100) {
      ceiling = 100;
    } else if (maxVal <= 275) {
      ceiling = 275;
    } else {
      ceiling = Math.ceil(maxVal / 50) * 50;
    }

    const step = ceiling / 5;
    const ticks = [ceiling, Math.round(step * 4), Math.round(step * 3), Math.round(step * 2), Math.round(step)];
    return { yMax: ceiling, yTicks: ticks };
  }, [selectedForCompare, locationList]);

  // Dynamic color palette generator for compare countries
  const COLOR_PALETTE = [
    { line: '#4285F4', dot: '#4285F4', bg: 'bg-[#4285F4]' }, // Blue
    { line: '#52B870', dot: '#52B870', bg: 'bg-[#52B870]' }, // Green
    { line: '#F59E0B', dot: '#F59E0B', bg: 'bg-[#F59E0B]' }, // Amber
    { line: '#8B5CF6', dot: '#8B5CF6', bg: 'bg-[#8B5CF6]' }, // Purple
    { line: '#EC4899', dot: '#EC4899', bg: 'bg-[#EC4899]' }, // Pink
    { line: '#06B6D4', dot: '#06B6D4', bg: 'bg-[#06B6D4]' }, // Cyan
    { line: '#F97316', dot: '#F97316', bg: 'bg-[#F97316]' }, // Orange
  ];

  const compareColors = useMemo(() => {
    const map = {
      'India': { line: '#4285F4', dot: '#4285F4', bg: 'bg-[#4285F4]' },
      'United States': { line: '#52B870', dot: '#52B870', bg: 'bg-[#52B870]' },
      'United Kingdom': { line: '#F59E0B', dot: '#F59E0B', bg: 'bg-[#F59E0B]' },
      'Germany': { line: '#8B5CF6', dot: '#8B5CF6', bg: 'bg-[#8B5CF6]' },
      'Canada': { line: '#EC4899', dot: '#EC4899', bg: 'bg-[#EC4899]' }
    };
    locationList.forEach((item, idx) => {
      if (!map[item.country]) {
        map[item.country] = COLOR_PALETTE[idx % COLOR_PALETTE.length];
      }
    });
    return map;
  }, [locationList]);

  // Sort & Pagination for Table
  const sortedLocationList = useMemo(() => {
    const list = [...locationList];
    if (tableSort === 'Location (A-Z)') {
      return list.sort((a, b) => a.country.localeCompare(b.country));
    }
    return list.sort((a, b) => (Number(b.views) || 0) - (Number(a.views) || 0));
  }, [locationList, tableSort]);

  const ITEMS_PER_PAGE = 7;
  const totalPages = Math.max(1, Math.ceil(sortedLocationList.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedLocations = sortedLocationList.slice((safeCurrentPage - 1) * ITEMS_PER_PAGE, safeCurrentPage * ITEMS_PER_PAGE);
  const pageItems = getPaginationPages(safeCurrentPage, totalPages);

  // Totals for summary footer
  const totalSummary = useMemo(() => {
    const totalReaders = locationList.reduce((acc, curr) => acc + (Number(curr.readers) || 0), 0);
    const totalViews = locationList.reduce((acc, curr) => acc + (Number(curr.views) || 0), 0);
    return {
      readers: totalReaders,
      views: totalViews,
      avgTime: avgTimeStr,
      share: '100%'
    };
  }, [locationList, avgTimeStr]);

  const exportCSV = async () => {
    if (sortedLocationList.length === 0) return;
    const columns = [
      { header: 'Location / Country', key: 'country', width: 26, align: 'left' },
      { header: 'Unique Readers', key: 'readers', width: 18, align: 'right' },
      { header: 'Total Views', key: 'views', width: 18, align: 'right' },
      { header: 'Avg. Reading Time', key: 'avgTime', width: 22, align: 'center' },
      { header: 'Share of Readers', key: 'share', width: 18, align: 'right' }
    ];

    const data = sortedLocationList.map(r => ({
      country: r.country || 'Unknown',
      readers: Number(r.readers) || 0,
      views: Number(r.views) || 0,
      avgTime: r.avgTime || '0s',
      share: r.share || '0%'
    }));

    const dateStr = datePreset === 'Custom' && customRange.startDate && customRange.endDate
      ? `${new Date(customRange.startDate).toLocaleDateString()} to ${new Date(customRange.endDate).toLocaleDateString()}`
      : datePreset;

    const metadata = [
      { label: 'Date Range', value: dateStr },
      { label: 'Sort Order', value: tableSort },
      { label: 'Total Countries Tracked', value: locationList.length },
      { label: 'Total Readers', value: totals.readers },
      { label: 'Total Views', value: totals.views },
      { label: 'Export Date', value: new Date().toLocaleString() }
    ];

    // Chart: Top Countries by Readers
    const topLocations = [...sortedLocationList].slice(0, 7);
    const chartConfig = topLocations.length > 0 ? {
      title: 'Top Locations by Readers',
      type: 'bar',
      labels: topLocations.map(l => l.country),
      datasets: [
        {
          label: 'Readers',
          data: topLocations.map(l => Number(l.readers) || 0),
          color: '#16865C'
        },
        {
          label: 'Views',
          data: topLocations.map(l => Number(l.views) || 0),
          color: '#F05338'
        }
      ]
    } : null;

    const summaryCards = [
      { title: 'Total Readers', value: totals.readers, color: '16865C' },
      { title: 'Total Views', value: totals.views, color: 'F05338' },
      { title: 'Countries Tracked', value: locationList.length, color: '3B82F6' },
      { title: 'Avg. Read Time', value: totals.avgTime, color: '8B5CF6' }
    ];

    await exportProfessionalExcel({
      filename: `Location_Analytics_${new Date().toISOString().slice(0, 10)}.xlsx`,
      sheetTitle: 'Location Analytics',
      reportName: 'Geographical Distribution Report',
      columns,
      data,
      metadata,
      summaryCards,
      chartConfig,
      totalRowLabelCol: 'country',
      sumCols: ['readers', 'views']
    });
  };

  return (
    <div className="w-full space-y-[1.1vw]">
      {/* 1. Header: Readers by Location */}
      <div className="flex items-center gap-[0.55vw] pt-[0.1vw]">
        <div className="w-[2.3vw] h-[2.3vw] rounded-[0.65vw] bg-[#E6F7EF] text-[#16865C] flex items-center justify-center shrink-0">
          <Icon icon="basil:map-location-outline" className="w-[1.25vw] h-[1.25vw]" />
        </div>
        <div>
          <h2 className="text-[0.95vw] font-semibold text-slate-900 tracking-tight">
            Readers by Location
          </h2>
          <p className="text-[0.7vw] text-slate-500 font-normal">
            Explore reader distribution across countries, regions and cities.
          </p>
        </div>
      </div>

      {/* 2. Top Filter Controls Card (Date Range + Group By) */}
      <div className="bg-white rounded-[0.65vw] p-[0.85vw] px-[1vw] border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-end justify-between gap-[1vw]">
        {/* Left Side: Date Range */}
        <div className="flex flex-col gap-[0.35vw]">
          <span className="text-[0.74vw] text-slate-700 font-medium whitespace-nowrap">
            Date Range
          </span>
          <div className="flex items-center gap-[0.75vw] flex-wrap">
            <AnalyticsDatePicker
              className="w-[15.5vw] min-w-[210px]"
              startDate={customRange.startDate}
              endDate={customRange.endDate}
              onChange={(range) => {
                setCustomRange(range);
                setDateFilter('custom');
              }}
            />

            <div className="inline-flex items-center bg-white border border-slate-200 rounded-[0.45vw] p-[0.2vw] gap-[0.25vw]">
              {['Today', 'Yesterday', '7 Days', '30 Days', 'Custom'].map((preset) => {
                const isActive = (preset === '7 Days' && dateFilter === '7d') ||
                  (preset === 'Today' && dateFilter === 'today') ||
                  (preset === 'Yesterday' && dateFilter === 'yesterday') ||
                  (preset === '30 Days' && dateFilter === '30d') ||
                  (preset === 'Custom' && dateFilter === 'custom');

                return (
                  <button
                    key={preset}
                    onClick={() => {
                      setDateFilter(preset === '7 Days' ? '7d' : preset === '30 Days' ? '30d' : preset.toLowerCase());
                      const end = new Date();
                      const start = new Date();
                      if (preset === 'Yesterday') {
                        start.setDate(end.getDate() - 1);
                        end.setDate(end.getDate() - 1);
                      } else if (preset === '7 Days') {
                        start.setDate(end.getDate() - 6);
                      } else if (preset === '30 Days') {
                        start.setDate(end.getDate() - 29);
                      }
                      setCustomRange({ startDate: start, endDate: end });
                    }}
                    className={`px-[1.05vw] py-[0.38vw] rounded-[0.35vw] text-[0.72vw] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-[#EC5137] text-white shadow-xs'
                        : 'text-[#555555] hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {preset}
                  </button>
                );
              })}
            </div>
          </div>
        </div>


      </div>

      {/* 3. Section 1: Reader Locations (World Map + Country Bars) */}
      <div className="bg-white rounded-[0.75vw] p-[1.1vw] border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-[1.5vw]">
          {/* Left: World Map */}
          <div className="lg:col-span-8 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-[0.6vw]">
              <h4 className="text-[0.88vw] font-semibold text-slate-900">
                Reader Locations
              </h4>
              {selectedCountry !== 'All Countries' && (
                <button
                  onClick={() => {
                    setSelectedCountry('All Countries');
                  }}
                  className="text-[0.72vw] text-[#0BA6FF] hover:underline font-medium cursor-pointer"
                >
                  Reset View
                </button>
              )}
            </div>

            {/* Interactive World Map SVG - Increased Map Size & Zoom / Pan */}
            <div
              ref={mapContainerRef}
              className={`relative w-full h-[400px] flex items-center justify-center bg-white overflow-hidden rounded-[0.5vw] border border-slate-100 ${
                isPanning ? 'cursor-grabbing' : 'cursor-grab'
              }`}
              onMouseDown={(e) => {
                if (e.button === 0) {
                  setIsPanning(true);
                  panStartRef.current = { x: e.clientX - mapPan.x, y: e.clientY - mapPan.y };
                }
              }}
              onMouseMove={(e) => {
                if (isPanning) {
                  setMapPan({
                    x: e.clientX - panStartRef.current.x,
                    y: e.clientY - panStartRef.current.y
                  });
                }
              }}
              onMouseUp={() => setIsPanning(false)}
              onMouseLeave={() => {
                setIsPanning(false);
              }}
            >

              {/* Zoom & Pan Overlay Controls */}
              <div className="absolute top-[0.6vw] left-[0.6vw] z-10 flex flex-col bg-white/90 backdrop-blur-xs rounded-[0.4vw] border border-slate-200/90 shadow-sm overflow-hidden select-none">
                <button
                  type="button"
                  title="Zoom In"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMapScale(s => Math.min(s * 1.35, 12));
                  }}
                  className="w-[1.9vw] h-[1.9vw] min-w-[28px] min-h-[28px] flex items-center justify-center text-slate-700 hover:bg-slate-100 hover:text-blue-600 transition-colors border-b border-slate-100 cursor-pointer font-bold text-[0.9vw]"
                >
                  <Icon icon="lucide:plus" className="w-[1vw] h-[1vw] min-w-[14px] min-h-[14px]" />
                </button>
                <button
                  type="button"
                  title="Zoom Out"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMapScale(s => Math.max(s / 1.35, 1));
                  }}
                  className="w-[1.9vw] h-[1.9vw] min-w-[28px] min-h-[28px] flex items-center justify-center text-slate-700 hover:bg-slate-100 hover:text-blue-600 transition-colors border-b border-slate-100 cursor-pointer font-bold text-[0.9vw]"
                >
                  <Icon icon="lucide:minus" className="w-[1vw] h-[1vw] min-w-[14px] min-h-[14px]" />
                </button>
                <button
                  type="button"
                  title="Reset Zoom & Pan"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMapScale(1);
                    setMapPan({ x: 0, y: 0 });
                    setSelectedCountry('All Countries');
                  }}
                  className="w-[1.9vw] h-[1.9vw] min-w-[28px] min-h-[28px] flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-blue-600 transition-colors cursor-pointer"
                >
                  <Icon icon="lucide:rotate-ccw" className="w-[0.9vw] h-[0.9vw] min-w-[13px] min-h-[13px]" />
                </button>
              </div>

              {/* Reset View Pill (if zoomed or panned or country selected) */}
              {(mapScale > 1 || mapPan.x !== 0 || mapPan.y !== 0 || selectedCountry !== 'All Countries') && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMapScale(1);
                    setMapPan({ x: 0, y: 0 });
                    setSelectedCountry('All Countries');
                  }}
                  className="absolute bottom-[0.6vw] left-[0.6vw] z-10 px-[0.6vw] py-[0.25vw] bg-white/95 backdrop-blur-xs text-slate-600 hover:text-blue-600 border border-slate-200/90 rounded-[0.35vw] text-[0.68vw] font-medium shadow-xs flex items-center gap-[0.3vw] cursor-pointer"
                >
                  <Icon icon="lucide:maximize-2" className="w-[0.75vw] h-[0.75vw]" />
                  Reset View
                </button>
              )}

              <svg
                viewBox={currentViewBox}
                className="w-full h-full select-none transition-all duration-300 ease-out"
                style={{ filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.04))' }}
              >
                {Object.entries(worldMercMapData.paths).map(([countryCode, countryObj]) => {
                  const upperCode = countryCode.toUpperCase();
                  const hasData = !!activeCountryCodesMap[upperCode];
                  const fillColor = mapCountryColors[upperCode] || '#F1F5F9';
                  const isHover = hoveredMapCountry === upperCode;

                  // Hover color: vibrant blue for countries with reader data, subtle soft gray/slate for others
                  const hoverColor = hasData ? '#0BA6FF' : '#E2E8F0';

                  return (
                    <path
                      key={countryCode}
                      d={countryObj.path}
                      fill={isHover ? hoverColor : fillColor}
                      stroke="#FFFFFF"
                      strokeWidth={selectedCountry && selectedCountry !== 'All Countries' ? "0.3" : "0.5"}
                      strokeLinejoin="round"
                      className={`transition-colors duration-150 ${hasData ? 'cursor-pointer hover:opacity-90' : 'cursor-default'}`}
                      onMouseEnter={() => setHoveredMapCountry(upperCode)}
                      onMouseLeave={() => setHoveredMapCountry(null)}
                      onClick={(e) => {
                        if (!hasData) return;
                        e.stopPropagation();
                        setSelectedCountry(countryObj.name);
                        setMapScale(1);
                        setMapPan({ x: 0, y: 0 });
                      }}
                    >
                      <title>{countryObj.name}{hasData ? '' : ' (No readers)'}</title>
                    </path>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Right: Selectors + Country Bars */}
          <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-slate-100 lg:pl-[1.5vw] flex flex-col justify-between">
            <div>
              {/* Selectors Header (Country filter with only available viewer countries) */}
              <div className="flex items-center justify-end gap-[1vw] mb-[1.2vw]">
                <div className="flex items-center gap-[0.35vw]">
                  <span className="text-[0.72vw] text-slate-500 font-normal">Country :</span>
                  <select
                    value={selectedCountry}
                    onChange={(e) => {
                      const newCountry = e.target.value;
                      setSelectedCountry(newCountry);
                    }}
                    className="bg-white border border-slate-200 text-slate-800 text-[0.72vw] font-medium rounded-[0.4vw] px-[0.6vw] py-[0.25vw] focus:outline-none cursor-pointer max-w-[170px] truncate"
                  >
                    <option value="All Countries">All Countries</option>
                    {/* Only show available countries viewed by users */}
                    {locationList.filter(l => l.country && l.country !== 'Unknown').map(item => (
                      <option key={item.country} value={item.country}>
                        {item.country} ({item.readers})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Country List with progress bars */}
              <div className="space-y-[1vw] max-h-[350px] overflow-y-auto pr-1">
                {(() => {
                  const filteredBars = (selectedCountry && selectedCountry !== 'All Countries')
                    ? locationList.filter(item => item.country.toLowerCase() === selectedCountry.toLowerCase())
                    : locationList;

                  const displayList = filteredBars.length > 0 ? filteredBars : [
                    {
                      country: selectedCountry,
                      readers: 0,
                      views: 0,
                      avgTime: '0s'
                    }
                  ];

                  return displayList.map((item) => {
                    const barWidth = `${Math.min(100, Math.max(8, (item.readers / maxReaders) * 100))}%`;
                    return (
                      <div
                        key={item.country}
                        onClick={() => setSelectedCountry(item.country)}
                        className={`space-y-[0.25vw] p-[0.3vw] rounded-[0.4vw] cursor-pointer transition-colors ${
                          selectedCountry === item.country ? 'bg-blue-50/70' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[0.78vw]">
                          <span className="font-normal text-slate-800">{item.country}</span>
                          <span className="text-slate-500 text-[0.72vw] font-normal">{item.readers} readers</span>
                        </div>

                        {/* Navy / Dark Blue Progress Bar */}
                        <div className="w-full h-[0.32vw] bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#172554] rounded-full transition-all duration-500"
                            style={{ width: item.readers > 0 ? barWidth : '0%' }}
                          />
                        </div>

                        <div className="text-[0.66vw] text-slate-400 font-normal">
                          {item.views.toLocaleString()} views Avg. {item.avgTime}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Section 2: Compare Readers By Location (Compare Line Chart + Checkboxes) */}
      <div className="bg-white rounded-[0.75vw] p-[1.1vw] border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-[1.5vw]">
          {/* Left: Multi-line Compare Chart */}
          <div className="lg:col-span-8 flex flex-col justify-between">
            <h4 className="text-[0.88vw] font-semibold text-slate-900 mb-[0.6vw]">
              Compare Readers By Location
            </h4>

            <div className="relative w-full h-[410px] select-none">
              <svg
                viewBox={`0 0 ${chartW} ${chartH}`}
                className="w-full h-full overflow-visible"
                onMouseLeave={() => setHoveredCompareDateIdx(null)}
              >
                {/* Horizontal Dashed Grid lines */}
                {yTicks.map((val) => {
                  const y = padT + (1 - val / yMax) * innerH;
                  return (
                    <g key={val}>
                      <line
                        x1={padL}
                        y1={y}
                        x2={chartW - padR}
                        y2={y}
                        stroke="#E2E8F0"
                        strokeDasharray="3 3"
                        strokeWidth="1"
                      />
                      <text
                        x={padL - 10}
                        y={y + 4.5}
                        textAnchor="end"
                        fontSize="13"
                        fill="#64748B"
                        fontWeight="normal"
                      >
                        {val}
                      </text>
                    </g>
                  );
                })}

                {/* Vertical active guideline between highest and lowest points only */}
                {hoveredCompareDateIdx !== null && activeTimeline.length > 0 && (() => {
                  let minY = Infinity;
                  let maxY = -Infinity;
                  selectedForCompare.forEach(cName => {
                    const countryObj = locationList.find(c => c.country === cName);
                    const val = countryObj?.trend && countryObj.trend[hoveredCompareDateIdx] !== undefined
                      ? countryObj.trend[hoveredCompareDateIdx]
                      : 0;
                    const y = padT + (1 - val / yMax) * innerH;
                    if (y < minY) minY = y;
                    if (y > maxY) maxY = y;
                  });

                  if (minY === Infinity || maxY === -Infinity) return null;

                  const x = activeTimeline.length > 1
                    ? padL + (hoveredCompareDateIdx / (activeTimeline.length - 1)) * innerW
                    : padL + innerW / 2;

                  // If dots are at the same Y point, don't show an overlapping line or show nothing
                  if (Math.abs(maxY - minY) < 1) return null;

                  return (
                    <line
                      x1={x}
                      y1={minY}
                      x2={x}
                      y2={maxY}
                      stroke="#00A3FF"
                      strokeWidth="1.4"
                    />
                  );
                })()}

                {/* X Axis Labels (at most 7 sampled points) */}
                {getSampledXLabels(activeTimeline, 7).map((pt, i, arr) => {
                  const origIdx = activeTimeline.findIndex(t => t.dateKey === pt.dateKey);
                  const x = activeTimeline.length > 1
                    ? padL + (origIdx / (activeTimeline.length - 1)) * innerW
                    : padL + innerW / 2;
                  return (
                    <text
                      key={pt.dateKey}
                      x={x}
                      y={chartH - padB + 22}
                      textAnchor="middle"
                      fontSize="13"
                      fill="#64748B"
                      fontWeight="normal"
                    >
                      {pt.formattedShort}
                    </text>
                  );
                })}

                {/* Straight Lines for Selected Compare Countries */}
                {selectedForCompare.map((cName) => {
                  const countryObj = locationList.find(c => c.country === cName);
                  if (!countryObj) return null;
                  const pts = (countryObj.trend || []).map((val, idx) => {
                    const x = activeTimeline.length > 1
                      ? padL + (idx / (activeTimeline.length - 1)) * innerW
                      : padL + innerW / 2;
                    const y = padT + (1 - val / yMax) * innerH;
                    return { x, y, val };
                  });

                  if (pts.length === 0) return null;
                  let pathD = `M ${pts[0].x} ${pts[0].y}`;
                  for (let i = 1; i < pts.length; i++) {
                    pathD += ` L ${pts[i].x} ${pts[i].y}`;
                  }

                  const color = compareColors[cName]?.line || '#3B82F6';

                  return (
                    <g key={cName}>
                      <path
                        d={pathD}
                        fill="none"
                        stroke={color}
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {pts.map((pt, i) => (
                        <g key={i}>
                          {/* Invisible larger hit target for smooth, effortless hover */}
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r={14}
                            fill="transparent"
                            className="cursor-pointer"
                            onMouseEnter={() => setHoveredCompareDateIdx(i)}
                          />
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r={i === hoveredCompareDateIdx ? 5 : 3}
                            fill={i === hoveredCompareDateIdx ? '#FFFFFF' : color}
                            stroke={color}
                            strokeWidth={i === hoveredCompareDateIdx ? 2.5 : 1.2}
                            className="cursor-pointer pointer-events-none transition-all duration-150"
                          />
                        </g>
                      ))}
                    </g>
                  );
                })}
              </svg>

              {/* Compare Hover Tooltip */}
              {hoveredCompareDateIdx !== null && activeTimeline[hoveredCompareDateIdx] && (
                <div
                  className="absolute bg-white/95 backdrop-blur-xs border border-slate-200/90 rounded-[0.55vw] shadow-[0_4px_16px_rgba(0,0,0,0.08)] px-[0.7vw] py-[0.45vw] pointer-events-none transition-all z-20 text-[0.72vw]"
                  style={{
                    left: `${((activeTimeline.length > 1 ? hoveredCompareDateIdx / (activeTimeline.length - 1) : 0.5) * 0.7 + 0.12) * 100}%`,
                    top: '44%'
                  }}
                >
                  <div className="text-[0.72vw] font-bold text-slate-800 mb-[0.25vw]">
                    {activeTimeline[hoveredCompareDateIdx]?.formattedShort || activeTimeline[hoveredCompareDateIdx]?.dateKey}
                  </div>
                  <table className="border-collapse">
                    <tbody>
                      {selectedForCompare.map((cName) => {
                        const item = locationList.find(d => d.country === cName);
                        const val = item?.trend && item.trend[hoveredCompareDateIdx] !== undefined ? item.trend[hoveredCompareDateIdx] : 0;
                        const cColor = compareColors[cName]?.line || '#4285F4';
                        return (
                          <tr key={cName} className="leading-[1.3vw]">
                            <td className="pr-[0.35vw]">
                              <span className="inline-block w-[0.4vw] h-[0.4vw] rounded-full" style={{ backgroundColor: cColor }} />
                            </td>
                            <td className="text-slate-600 font-normal pr-[1.2vw] whitespace-nowrap text-[0.7vw]">{cName}</td>
                            <td className="text-slate-900 font-bold text-right pl-[0.5vw] text-[0.72vw]">{val}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Bottom Legend */}
            <div className="flex items-center justify-center gap-[1.8vw] pt-[0.6vw] text-[0.84vw]">
              {selectedForCompare.map((cName) => {
                const cColor = compareColors[cName]?.bg || 'bg-blue-500';
                return (
                  <div key={cName} className="flex items-center gap-[0.45vw]">
                    <span className={`w-[0.65vw] h-[0.65vw] rounded-full ${cColor}`} />
                    <span className="text-slate-800 font-medium text-[0.82vw]">{cName}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Selectors + Checkboxes */}
          <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-slate-100 lg:pl-[1.5vw] flex flex-col justify-between">
            <div>
              {/* Selectors Header (Country filter with only available viewer countries) */}
              <div className="flex items-center justify-end gap-[1vw] mb-[1.2vw]">
                <div className="flex items-center gap-[0.35vw]">
                  <span className="text-[0.72vw] text-slate-500 font-normal">Country :</span>
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="bg-white border border-slate-200 text-slate-800 text-[0.72vw] font-medium rounded-[0.4vw] px-[0.6vw] py-[0.25vw] focus:outline-none cursor-pointer max-w-[170px] truncate"
                  >
                    <option value="All Countries">All Countries</option>
                    {locationList.filter(l => l.country && l.country !== 'Unknown').map(item => (
                      <option key={item.country} value={item.country}>
                        {item.country} ({item.readers})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Country Checkboxes List */}
              <div className="space-y-[1.1vw] max-h-[350px] overflow-y-auto pr-1">
                {locationList.map((item) => {
                  const isChecked = selectedForCompare.includes(item.country);
                  const barWidth = `${Math.min(100, Math.max(8, (item.readers / maxReaders) * 100))}%`;

                  return (
                    <div
                      key={item.country}
                      onClick={() => toggleCompareCountry(item.country)}
                      className="cursor-pointer group space-y-[0.28vw]"
                    >
                      <div className="flex items-center justify-between text-[0.78vw]">
                        <div className="flex items-center gap-[0.55vw]">
                          <div
                            className={`w-[0.95vw] h-[0.95vw] min-w-[14px] min-h-[14px] rounded-[0.2vw] flex items-center justify-center transition-colors ${
                              isChecked
                                ? 'bg-[#EB5757] text-white'
                                : 'border-[1.5px] border-slate-400 bg-white'
                            }`}
                          >
                            {isChecked && (
                              <Icon icon="solar:check-read-linear" className="w-[0.7vw] h-[0.7vw] stroke-[3]" />
                            )}
                          </div>
                          <span className="font-normal text-slate-800 text-[0.82vw]">
                            {item.country}
                          </span>
                        </div>
                        <span className="text-slate-500 text-[0.72vw] font-normal">{item.readers} readers</span>
                      </div>

                      <div className="w-full h-[0.24vw] bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#174EA6] rounded-full transition-all duration-500"
                          style={{ width: barWidth }}
                        />
                      </div>

                      <div className="text-[0.66vw] text-slate-400 font-normal">
                        {item.views.toLocaleString()} views Avg. {item.avgTime}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Section 3: Location Analytics Table */}
      <div className="bg-white rounded-[0.75vw] p-[1.1vw] border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-[0.9vw]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-[0.6vw]">
          <div>
            <h3 className="text-[0.95vw] font-semibold text-slate-900 tracking-tight">
              Location Analytics Table
            </h3>
            <p className="text-[0.7vw] text-slate-500 font-normal">
              Compare unique readers, views and reading time by location.
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
                          setCurrentPage(1);
                        }}
                        onMouseEnter={() => setFocusedSortIndex(idx)}
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
                  <th className="py-[0.7vw] px-[1vw]">Location</th>
                  <th className="py-[0.7vw] px-[1vw] text-center">Unique readers</th>
                  <th className="py-[0.7vw] px-[1vw] text-center">Views</th>
                  <th className="py-[0.7vw] px-[1vw] text-center">Avg. reading time</th>
                  <th className="py-[0.7vw] px-[1vw] text-center">Share of readers</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={`loc-skel-${i}`} className="animate-pulse">
                      <td className="py-[0.7vw] px-[1vw]">
                        <div className="h-[0.6vw] w-[7vw] bg-slate-100 rounded" />
                      </td>
                      <td className="py-[0.7vw] px-[1vw] text-center">
                        <div className="h-[0.6vw] w-[2.5vw] bg-slate-100 rounded mx-auto" />
                      </td>
                      <td className="py-[0.7vw] px-[1vw] text-center">
                        <div className="h-[0.6vw] w-[2.5vw] bg-slate-100 rounded mx-auto" />
                      </td>
                      <td className="py-[0.7vw] px-[1vw] text-center">
                        <div className="h-[0.6vw] w-[3.5vw] bg-slate-100 rounded mx-auto" />
                      </td>
                      <td className="py-[0.7vw] px-[1vw] text-center">
                        <div className="h-[0.6vw] w-[2.5vw] bg-slate-100 rounded mx-auto" />
                      </td>
                    </tr>
                  ))
                ) : paginatedLocations.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-[2.5vw] text-center text-slate-400 font-normal">
                      No location data available.
                    </td>
                  </tr>
                ) : (
                  paginatedLocations.map((row) => (
                    <tr key={row.country} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-[0.7vw] px-[1vw] text-slate-900 font-normal">
                        {row.country}
                      </td>
                      <td className="py-[0.7vw] px-[1vw] text-center text-slate-900 font-normal">
                        {row.readers.toLocaleString()}
                      </td>
                      <td className="py-[0.7vw] px-[1vw] text-center text-slate-900 font-normal">
                        {row.views.toLocaleString()}
                      </td>
                      <td className="py-[0.7vw] px-[1vw] text-center text-slate-900 font-normal">
                        {row.avgTime}
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
                  <td className="py-[0.7vw] px-[1vw] text-center text-slate-900 font-normal">
                    {totalSummary.readers.toLocaleString()}
                  </td>
                  <td className="py-[0.7vw] px-[1vw] text-center text-slate-900 font-normal">
                    {totalSummary.views.toLocaleString()}
                  </td>
                  <td className="py-[0.7vw] px-[1vw] text-center text-slate-900 font-normal">
                    {totalSummary.avgTime}
                  </td>
                  <td className="py-[0.7vw] px-[1vw] text-center text-slate-900 font-normal">
                    {totalSummary.share}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {sortedLocationList.length > 0 && (
          <div className="flex items-center justify-between pt-[0.4vw] text-[0.72vw]">
            <span className="text-black font-medium">
              Showing {Math.min((safeCurrentPage - 1) * ITEMS_PER_PAGE + 1, sortedLocationList.length)}–{Math.min(safeCurrentPage * ITEMS_PER_PAGE, sortedLocationList.length)} of {sortedLocationList.length}
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
