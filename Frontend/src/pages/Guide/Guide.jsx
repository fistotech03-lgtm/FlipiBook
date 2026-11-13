import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Rocket,
  UserCheck,
  BookOpen,
  Sliders,
  FileEdit,
  Box,
  HelpCircle,
  MessageSquare,
  Compass,
  Search,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Layers,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CustomScrollbar from '../../components/CustomScrollbar';

import GetStartedGuide, { getStartedGuideSections } from './GetStarted/GetStartedGuide';
import ProfileAccountGuide, { profileAccountGuideSections } from './ProfileAccount/ProfileAccountGuide';
import FlipbookGuide, { flipbookGuideSections } from './Flipbook/FlipbookGuide';
import CustomizationGuide, { customizationGuideSections } from './Customization/CustomizationGuide';
import PageEditorGuide, { pageEditorSections } from './PageEditor/PageEditorGuide';
import ThreeDStudioEditorGuide, { threeDStudioEditorSections } from './3DEditor/3DEditorGuide';
import ThreeDRequestGuide, { threeDRequestGuideSections } from './ThreeDRequest/ThreeDRequestGuide';
import ForumGuide, { forumGuideSections } from './ForumGuide/ForumGuide';
import ExploreGuide, { exploreGuideSections } from './Explore/ExploreGuide';

export default function Guide() {
  const navigate = useNavigate();

  // Navigation states
  const [activeNav, setActiveNav] = useState('Get Started');
  const [selectedSubItem, setSelectedSubItem] = useState('get-started-auth');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchContainerRef = useRef(null);

  // Accordion state tracker: single active open section at a time
  const [openSectionId, setOpenSectionId] = useState('get-started-main');

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
    setOpenSectionId(sectionId);
    if (defaultItemId) {
      setSelectedSubItem(defaultItemId);
    }
  };

  // Left primary navigation items
  const primaryNavItems = [
    {
      id: 'Get Started',
      label: 'Get Started',
      icon: Rocket,
      path: '/login',
      defaultSubItem: 'get-started-auth',
      about: 'Master the essentials to set up your account, explore core tools, and create your first interactive digital flipbook.'
    },
    {
      id: 'Profile & Account',
      label: 'Profile & Account',
      icon: UserCheck,
      path: '/overview',
      defaultSubItem: 'profile-overview-setup',
      about: 'Manage your profile settings, team workspace, account preferences, billing subscriptions, and support requests.'
    },
    {
      id: 'Flipbook',
      label: 'Flipbook',
      icon: BookOpen,
      path: '/my-flipbooks',
      defaultSubItem: 'flipbook-file-create',
      about: 'Create, upload, and organize your flipbooks from PDF documents, pre-designed templates, or custom blank canvases.'
    },
    {
      id: 'Customization',
      label: 'Customization',
      icon: Sliders,
      path: '/templates',
      defaultSubItem: 'custom-bg-theme-layouts',
      about: 'Personalize viewer themes, brand styling, navigation layouts, lead generation forms, and publication privacy.'
    },
    {
      id: 'Page Editor',
      label: 'Page Editor',
      icon: FileEdit,
      path: '/my-flipbooks',
      defaultSubItem: 'page-editor-settings',
      about: 'Design engaging flipbook pages with interactive media, custom links, animated elements, audio hotspots, and widgets.'
    },
    {
      id: '3D Studio Editor',
      label: '3D Studio Editor',
      icon: Box,
      path: '/converter',
      defaultSubItem: '3d-studio-create-upload',
      about: 'Build and render realistic 3D models with customizable material textures, dynamic lighting presets, and studio environments.'
    },
    {
      id: '3D Request Page',
      label: '3D Request Page',
      icon: HelpCircle,
      path: '/converter',
      defaultSubItem: '3d-request-page-overview',
      about: 'Submit custom 3D model modeling requests, track ongoing conversion projects, and collaborate with 3D specialists.'
    },
    {
      id: 'Forum',
      label: 'Forum',
      icon: MessageSquare,
      path: '/forum',
      defaultSubItem: 'forum-discussions-overview',
      about: 'Connect with the creator community, ask questions, share flipbook showcases, and discover community tips and tutorials.'
    },
    {
      id: 'Explore',
      label: 'Explore',
      icon: Compass,
      path: '/explore',
      defaultSubItem: 'explore-books-overview',
      about: 'Browse curated community flipbooks, featured creator publications, interactive magazines, and inspiring showcase designs.'
    },
  ];

  // Map each primary tab to its sub-sections and component
  const navContentConfig = {
    'Get Started': {
      sections: getStartedGuideSections,
      component: GetStartedGuide
    },
    'Profile & Account': {
      sections: profileAccountGuideSections,
      component: ProfileAccountGuide
    },
    'Flipbook': {
      sections: flipbookGuideSections,
      component: FlipbookGuide
    },
    'Customization': {
      sections: customizationGuideSections,
      component: CustomizationGuide
    },
    'Page Editor': {
      sections: pageEditorSections,
      component: PageEditorGuide
    },
    '3D Studio Editor': {
      sections: threeDStudioEditorSections,
      component: ThreeDStudioEditorGuide
    },
    '3D Request Page': {
      sections: threeDRequestGuideSections,
      component: ThreeDRequestGuide
    },
    'Forum': {
      sections: forumGuideSections,
      component: ForumGuide
    },
    'Explore': {
      sections: exploreGuideSections,
      component: ExploreGuide
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

  const currentNavItem = primaryNavItems.find((item) => item.id === activeNav);

  return (
    <div className="h-full w-full bg-white text-black flex font-sans antialiased select-none overflow-hidden">
      {/* 1. Dark Primary Left Sidebar */}
      <aside className="w-[6.5vw] min-w-[5.8rem] max-w-[7.5rem] bg-[#151c28] text-gray-300 flex flex-col items-center py-[1vh] shrink-0 border-r border-[#1f293d] h-full overflow-y-auto">
        <div className="flex flex-col items-center gap-[0.4vh] w-full px-[0.3vw]">
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
                <span className="text-[0.63vw] font-semibold text-center leading-tight">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </aside>

      {/* 2. Secondary Sub-Sidebar (Collapsible Subcontent Accordions) */}
      <aside className="w-[16vw] max-w-[20rem] bg-[#fcfcfd] border-r border-gray-100 flex flex-col shrink-0 h-full overflow-hidden">
        <CustomScrollbar
          color="#d1d5db"
          hoverColor="#9ca3af"
          width="0.25vw"
          className="flex-1 py-[1.8vh] px-[0.8vw]"
        >
          <div className="space-y-[1.4vh]">
            {currentSections.map((section) => {
              const hasMultipleItems = (section.items?.length || 0) > 1;
              const hasActiveSubItem = section.items?.some((i) => i.id === selectedSubItem);
              const isOpen = openSectionId === section.id;
              const isSectionActive = isOpen || hasActiveSubItem;
              const firstItemId = section.items?.[0]?.id;

              return (
                <div key={section.id} className="text-[0.85vw]">
                  {/* Section Item Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setOpenSectionId(section.id);
                      if (firstItemId) setSelectedSubItem(firstItemId);
                    }}
                    className={`w-full flex items-center justify-between px-[0.6vw] py-[0.7vh] rounded-[0.4vw] transition-colors group cursor-pointer ${
                      isSectionActive
                        ? 'text-[#EC5137] bg-[#EC5137]/10 font-semibold'
                        : 'text-gray-600 hover:text-black hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-[0.5vw] font-semibold text-[0.8vw]">
                      <span className={isSectionActive ? 'text-[#EC5137]' : 'text-gray-500'}>
                        {section.icon}
                      </span>
                      <span className={`text-left font-semibold ${isSectionActive ? 'text-[#EC5137]' : 'text-gray-500'}`}>
                        {section.title}
                      </span>
                    </div>

                    {/* Only show expand/collapse chevron if there are multiple sub items */}
                    {hasMultipleItems && (
                      isOpen ? (
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
                      )
                    )}
                  </button>

                  {/* Sub items dropdown only rendered when multiple items exist */}
                  {hasMultipleItems && isOpen && (
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
        <div className="flex items-start justify-between pb-[1.4vh] px-[1.5vw]">
          {/* Title on the left */}
          <div className="flex flex-col flex-1 pr-[1.5vw]">
            <h1 className="text-[1.5vw] font-semibold text-[#3F00FF] tracking-tight leading-snug">
              {activeNav === 'Get Started' ? 'Get Started Guide' : activeNav === 'Profile & Account' ? 'Profile & Account Guide' : `${activeNav} Guide`}
            </h1>
            {currentNavItem?.about && (
              <p className="text-[0.85vw] font-semibold text-gray-700 mt-[0.6vh]">
                {currentNavItem.about}
              </p>
            )}
          </div>

          {/* Right inline controls: Search, Quick Navigation, FAQs */}
          <div className="flex items-center gap-[0.8vw]  shrink-0 mt-[0.3vh]">
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
                setActiveNav('Profile & Account');
                setOpenSectionId('support-section');
                setSelectedSubItem('support-help-tickets');
              }}
              className="flex items-center gap-[0.35vw] px-[0.75vw] py-[0.45vw] rounded-[0.45vw] border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-[0.78vw] font-medium shadow-2xs transition-all cursor-pointer"
            >
              <HelpCircle size="0.85vw" className="text-[#ec5137]" />
              <span>FAQs</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 min-h-0 h-full overflow-hidden">
          {ActiveComponent && <ActiveComponent selectedSubItem={selectedSubItem} />}
        </div>
      </main>
    </div>
  );
}
