import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Home,
  BookOpen,
  Sliders,
  FileEdit,
  Box,
  Compass,
  User,
  Settings,
  RefreshCw,
  Search,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Layers,
  HelpCircle,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CustomScrollbar from '../../components/CustomScrollbar';

import HomeGuide, { homeGuideSections } from './Home/HomeGuide';
import ExploreGuide, { exploreGuideSections } from './Explore/ExploreGuide';
import ConverterGuide, { converterGuideSections } from './Converter/ConverterGuide';
import MyFlipbookGuide, { myFlipbookGuideSections } from './MyFlipbook/MyFlipbookGuide';
import LayoutEditorGuide, { layoutEditorGuideSections } from './LayoutEditor/LayoutEditorGuide';
import PageEditorGuide, { pageEditorGuideSections } from './PageEditor/PageEditorGuide';
import ThreeDEditorGuide, { threeDEditorGuideSections } from './3DEditor/3DEditorGuide';
import ProfileGuide, { profileGuideSections } from './Profile/ProfileGuide';
import SettingsGuide, { settingsGuideSections } from './SettingsGuide/SettingsGuide';

export default function Guide() {
  const navigate = useNavigate();

  // Navigation states
  const [activeNav, setActiveNav] = useState('Home');
  const [selectedSubItem, setSelectedSubItem] = useState('home-overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchContainerRef = useRef(null);

  // Accordion state tracker: single active open section at a time
  const [openSectionId, setOpenSectionId] = useState('home-main');

  // Dropdown states
  const [isQuickNavOpen, setIsQuickNavOpen] = useState(false);
  const quickNavRef = useRef(null);

  // Close search and quick nav suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
      if (quickNavRef.current && !quickNavRef.current.contains(event.target)) {
        setIsQuickNavOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleSection = (sectionId, defaultItemId) => {
    if (openSectionId === sectionId) {
      setOpenSectionId(null);
    } else {
      setOpenSectionId(sectionId);
      if (defaultItemId) {
        setSelectedSubItem(defaultItemId);
      }
    }
  };

  // Left primary navigation items
  const primaryNavItems = [
    { id: 'Home', label: 'Home', icon: Home, path: '/', defaultSubItem: 'home-overview' },
    { id: 'Explore', label: 'Explore', icon: Compass, path: '/explore', defaultSubItem: 'explore-books-search' },
    { id: 'Convert', label: 'Converter', icon: RefreshCw, path: '/converter', defaultSubItem: 'converter-image-overview' },
    { id: 'My FlipBook', label: 'My FlipBook', icon: BookOpen, path: '/my-flipbooks', defaultSubItem: 'create-flipbook' },
    { id: 'Layout Editor', label: 'Layout Editor', icon: Sliders, path: '/templates', defaultSubItem: 'background' },
    { id: 'Page Editor', label: 'Page Editor', icon: FileEdit, path: '/my-flipbooks', defaultSubItem: 'manage-pages' },
    { id: '3D Editor', label: '3D Editor', icon: Box, path: '/converter', defaultSubItem: '3d-model-tree' },
    { id: 'Profile', label: 'Profile', icon: User, path: '/overview', defaultSubItem: 'profile-type-individual' },
    { id: 'Settings', label: 'Settings', icon: Settings, path: '/settings', defaultSubItem: 'settings-account-overview' },
  ];

  // Map each primary tab to its sub-sections and component
  const navContentConfig = {
    'Home': {
      sections: homeGuideSections,
      component: HomeGuide
    },
    'Explore': {
      sections: exploreGuideSections,
      component: ExploreGuide
    },
    'Convert': {
      sections: converterGuideSections,
      component: ConverterGuide
    },
    'My FlipBook': {
      sections: myFlipbookGuideSections,
      component: MyFlipbookGuide
    },
    'Layout Editor': {
      sections: layoutEditorGuideSections,
      component: LayoutEditorGuide
    },
    'Page Editor': {
      sections: pageEditorGuideSections,
      component: PageEditorGuide
    },
    '3D Editor': {
      sections: threeDEditorGuideSections,
      component: ThreeDEditorGuide
    },
    'Profile': {
      sections: profileGuideSections,
      component: ProfileGuide
    },
    'Settings': {
      sections: settingsGuideSections,
      component: SettingsGuide
    }
  };

  // Build searchable index across all headings and subheadings
  const searchIndex = useMemo(() => {
    const list = [];
    primaryNavItems.forEach((nav) => {
      const config = navContentConfig[nav.id];
      const sections = config?.sections || [];
      sections.forEach((section) => {
        // Section heading entry
        const firstSubItem = section.items?.[0];
        list.push({
          type: 'heading',
          title: section.title,
          navId: nav.id,
          navLabel: nav.label,
          sectionId: section.id,
          subItemId: firstSubItem?.id || nav.defaultSubItem,
          searchText: `${nav.label} ${section.title}`.toLowerCase()
        });

        // Subheading items
        (section.items || []).forEach((item) => {
          list.push({
            type: 'subheading',
            title: item.label,
            headingTitle: section.title,
            group: item.group,
            navId: nav.id,
            navLabel: nav.label,
            sectionId: section.id,
            subItemId: item.id,
            searchText: `${nav.label} ${section.title} ${item.group || ''} ${item.label}`.toLowerCase()
          });
        });
      });
    });
    return list;
  }, []);

  // Filter search results
  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];

    return searchIndex.filter((entry) => entry.searchText.includes(query)).slice(0, 12);
  }, [searchQuery, searchIndex]);

  const handleSelectSearchResult = (result) => {
    setActiveNav(result.navId);
    setOpenSectionId(result.sectionId);
    if (result.subItemId) {
      setSelectedSubItem(result.subItemId);
    }
    setSearchQuery('');
    setIsSearchOpen(false);
  };

  const currentNav = navContentConfig[activeNav] || navContentConfig['My FlipBook'];
  const currentSections = currentNav.sections || [];
  const ActiveComponent = currentNav.component;

  const handleNavSelect = (item) => {
    setActiveNav(item.id);
    const firstSection = navContentConfig[item.id]?.sections?.[0];
    if (firstSection) {
      setOpenSectionId(firstSection.id);
      if (firstSection.items?.[0]?.id) {
        setSelectedSubItem(firstSection.items[0].id);
      }
    } else if (item.defaultSubItem) {
      setSelectedSubItem(item.defaultSubItem);
    }
  };

  return (
    <div className="h-full w-full bg-white text-black flex font-sans antialiased select-none overflow-hidden">
      {/* 1. Dark Primary Left Sidebar */}
      <aside className="w-[5.5vw] min-w-[5rem] max-w-[6rem] bg-[#151c28] text-gray-300 flex flex-col items-center py-[1vh] shrink-0 border-r border-[#1f293d] h-full overflow-y-auto">
        <div className="flex flex-col items-center gap-[0.6vh] w-full px-[0.3vw]">
          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavSelect(item)}
                className={`w-full py-[1vh] px-[0.2vw] flex flex-col items-center justify-center rounded-[0.4vw] transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-[#2c3749] text-white shadow-xs font-semibold'
                    : 'text-gray-300 hover:text-white hover:bg-[#1e2738] font-normal'
                }`}
              >
                <Icon
                  size="1.1vw"
                  className={`shrink-0 mb-[0.5vh] ${
                    isActive ? 'text-white' : 'text-gray-300'
                  }`}
                  strokeWidth={1.75}
                />
                <span className="text-[0.6vw] font-medium text-center leading-tight">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </aside>

      {/* 2. Secondary Sub-Sidebar (Collapsible Subcontent Accordions) */}
      <aside className="w-[18vw] max-w-[30rem] bg-[#fcfcfd] border-r border-gray-100 flex flex-col shrink-0 h-full overflow-hidden">
        <CustomScrollbar
          color="#d1d5db"
          hoverColor="#9ca3af"
          width="0.25vw"
          className="flex-1 py-[1.8vh] px-[0.8vw]"
        >
          <div className="space-y-[1.4vh]">
            {currentSections.map((section) => {
              const isOpen = openSectionId === section.id;
              const hasActiveSubItem = section.items.some((i) => i.id === selectedSubItem);
              const isSectionActive = isOpen || hasActiveSubItem;
              const firstItemId = section.items?.[0]?.id;

              return (
                <div key={section.id} className="text-[0.85vw]">
                  {/* Section Header */}
                  <button
                    type="button"
                    onClick={() => toggleSection(section.id, firstItemId)}
                    className={`w-full flex items-center justify-between px-[0.6vw] py-[0.7vh] rounded-[0.4vw] transition-colors group ${
                      isSectionActive ? 'text-[#EC5137]' : 'text--gray-600 hover:text-black hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-[0.5vw] font-semibold text-[0.85vw]">
                      <span className={isSectionActive ? 'text-[#EC5137]' : 'text-gray-700'}>
                        {section.icon}
                      </span>
                      <span className={`text-left font-semibold ${isSectionActive ? 'text-[#EC5137]' : 'text-gray-700'}`}>
                        {section.title}
                      </span>
                    </div>
                    {isOpen ? (
                      <ChevronUp
                        className={`w-[0.8vw] h-[0.8vw] shrink-0 ${
                          isSectionActive ? 'text-[#EC5137]' : 'text-gray-400'
                        }`}
                      />
                    ) : (
                      <ChevronDown
                        className={`w-[0.8vw] h-[0.8vw] shrink-0 ${
                          isSectionActive ? 'text-[#EC5137]' : 'text-gray-400'
                        }`}
                      />
                    )}
                  </button>

                  {/* Sub items */}
                  {isOpen && (
                    <div className="mt-[0.3vh] ml-[0.9vw] pl-[0.7vw] border-l border-gray-200 space-y-[0.3vh]">
                      {section.items.map((subItem, itemIdx) => {
                        const isSelected = selectedSubItem === subItem.id;
                        const prevItem = section.items[itemIdx - 1];
                        const showGroupHeader = subItem.group && (!prevItem || prevItem.group !== subItem.group);

                        return (
                          <React.Fragment key={subItem.id}>
                            {showGroupHeader && (
                              <div className="flex items-center gap-[0.35vw] text-[0.68vw] font-bold uppercase tracking-wider text-gray-700 pt-[0.8vh] pb-[0.25vh] px-[0.5vw]">
                                {subItem.groupIcon && (
                                  <span className="text-gray-600 shrink-0">
                                    {subItem.groupIcon}
                                  </span>
                                )}
                                <span>{subItem.group}</span>
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => setSelectedSubItem(subItem.id)}
                              className={`w-full text-left px-[0.5vw] py-[0.5vh] text-[0.77vw] rounded-[0.3vw] transition-colors block leading-tight font-medium ${
                                isSelected
                                  ? 'text-[#EC5137] bg-[#EC5137]/10 font-semibold'
                                  : 'text-gray-500 hover:text-black hover:bg-gray-100/60'
                              }`}
                            >
                              {subItem.label}
                            </button>
                          </React.Fragment>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CustomScrollbar>
      </aside>

      {/* 3. Main Content Area */}
      <main className="flex-1 bg-white overflow-hidden pt-[1.2vh] pb-[1vh] h-full text-black flex flex-col">
        {/* Top Header Bar matching Flipbook Guide layout */}
        <div className="flex items-center justify-between pb-[1.4vh] px-[1.5vw]">
          {/* Title on the left */}
          <div className="flex items-center">
            <h1 className="text-[1.5vw] font-semibold text-black">
              Flipbook Guide
            </h1>
          </div>

          {/* Right inline controls: Search, Quick Navigation, FAQs */}
          <div className="flex items-center gap-[0.8vw]">
            {/* Search Input Container */}
            <div ref={searchContainerRef} className="relative w-[22vw] min-w-[13rem]">
              <Search
                className="absolute left-[0.7vw] top-1/2 -translate-y-1/2 text-[#ec5137] shrink-0 pointer-events-none"
                size="0.85vw"
              />
              <input
                type="text"
                placeholder="Search Features..."
                value={searchQuery}
                onFocus={() => setIsSearchOpen(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                className="w-full pl-[2.2vw] pr-[2vw] py-[0.45vw] rounded-[0.45vw] border border-gray-200 text-[0.82vw] focus:outline-none focus:border-[#ec5137] focus:ring-1 focus:ring-[#ec5137] bg-white text-gray-700 placeholder-gray-400 shadow-2xs transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setIsSearchOpen(false);
                  }}
                  className="absolute right-[0.6vw] top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X size="0.8vw" />
                </button>
              )}

              {/* Suggestions Dropdown */}
              {isSearchOpen && searchQuery.trim().length > 0 && (
                <div className="absolute left-0 right-0 top-[calc(100%+0.4vh)] bg-white border border-gray-200 rounded-[0.5vw] shadow-xl max-h-[35vh] overflow-hidden z-50 flex flex-col">
                  <CustomScrollbar
                    color="#d1d5db"
                    hoverColor="#9ca3af"
                    width="0.25vw"
                    className="max-h-[35vh] py-[0.5vh]"
                  >
                    {searchResults.length > 0 ? (
                      searchResults.map((result, idx) => (
                        <button
                          key={`${result.type}-${result.sectionId}-${result.subItemId}-${idx}`}
                          type="button"
                          onClick={() => handleSelectSearchResult(result)}
                          className="w-full px-[0.8vw] py-[0.6vh] text-left hover:bg-gray-50 flex items-start justify-between group transition-colors border-b border-gray-100 last:border-b-0 cursor-pointer"
                        >
                          <div className="flex flex-col gap-[0.2vh] pr-[0.5vw]">
                            <div className="flex items-center gap-[0.4vw]">
                              <span className="text-[0.8vw] font-semibold text-gray-800 group-hover:text-[#ec5137] transition-colors">
                                {result.title}
                              </span>
                              <span
                                className={`text-[0.6vw] px-[0.3vw] py-[0.1vh] rounded-[0.2vw] font-medium shrink-0 ${
                                  result.type === 'heading'
                                    ? 'bg-blue-50 text-blue-600 border border-blue-200'
                                    : 'bg-orange-50 text-[#ec5137] border border-orange-200'
                                }`}
                              >
                                {result.type === 'heading' ? 'Heading' : 'Subheading'}
                              </span>
                            </div>
                            <div className="text-[0.68vw] text-gray-500 flex items-center gap-[0.3vw] flex-wrap">
                              <span>{result.navLabel}</span>
                              {result.headingTitle && (
                                <>
                                  <ChevronRight size="0.6vw" className="text-gray-400 shrink-0" />
                                  <span>{result.headingTitle}</span>
                                </>
                              )}
                              {result.group && (
                                <>
                                  <ChevronRight size="0.6vw" className="text-gray-400 shrink-0" />
                                  <span className="text-gray-400">{result.group}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <ChevronRight size="0.8vw" className="text-gray-300 group-hover:text-[#ec5137] mt-[0.3vh] shrink-0 transition-colors" />
                        </button>
                      ))
                    ) : (
                      <div className="px-[0.8vw] py-[1vh] text-center text-[0.76vw] text-gray-400">
                        No results found for "{searchQuery}"
                      </div>
                    )}
                  </CustomScrollbar>
                </div>
              )}
            </div>

            {/* Quick Navigation Dropdown */}
            <div ref={quickNavRef} className="relative">
              <button
                type="button"
                onClick={() => setIsQuickNavOpen(!isQuickNavOpen)}
                className={`flex items-center gap-[0.4vw] px-[0.75vw] py-[0.45vw] rounded-[0.45vw] text-[0.78vw] font-medium transition-all cursor-pointer ${
                  isQuickNavOpen
                    ? 'border-2 border-black bg-white text-gray-900 shadow-sm'
                    : 'border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 shadow-2xs'
                }`}
              >
                <Layers size="0.9vw" className="text-[#ec5137]" />
                <span>Quick Navigation</span>
                {isQuickNavOpen ? (
                  <ChevronUp size="0.75vw" className="text-gray-500" />
                ) : (
                  <ChevronDown size="0.75vw" className="text-gray-400" />
                )}
              </button>

              {isQuickNavOpen && (
                <div className="absolute right-0 top-[calc(100%+0.6vh)] w-full min-w-full bg-white border border-gray-100 rounded-[0.7vw] shadow-[0_10px_30px_rgba(0,0,0,0.12)] py-[0.5vh] z-50">
                  {primaryNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeNav === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          handleNavSelect(item);
                          setIsQuickNavOpen(false);
                        }}
                        className={`w-full flex items-center gap-[0.5vw] px-[0.75vw] py-[0.65vh] text-left text-[0.78vw] transition-colors cursor-pointer ${
                          isActive
                            ? 'bg-[#ffebe8] text-[#ec5137] font-medium'
                            : 'text-gray-700 hover:bg-gray-50 font-normal'
                        }`}
                      >
                        <Icon
                          size="0.85vw"
                          className={isActive ? 'text-[#ec5137]' : 'text-gray-600'}
                          strokeWidth={1.8}
                        />
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* FAQs Button */}
            <button
              type="button"
              onClick={() => {
                setActiveNav('Home');
                setOpenSectionId('help-main');
                setSelectedSubItem('help-overview');
              }}
              className="flex items-center gap-[0.35vw] px-[0.75vw] py-[0.45vw] rounded-[0.45vw] border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-[0.78vw] font-medium shadow-2xs transition-all cursor-pointer"
            >
              <HelpCircle size="0.85vw" className="text-[#ec5137]" />
              <span>FAQs</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1">
          {ActiveComponent && <ActiveComponent selectedSubItem={selectedSubItem} />}
        </div>
      </main>
    </div>
  );
}
