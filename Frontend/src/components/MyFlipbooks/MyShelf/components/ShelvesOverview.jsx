import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import {
  blueshade,
  greenshade,
  lightShelfImg,
  plantLightShelfImg,
  greenLightShelfImg,
  blueRopeShelfImg,
  windowShelfImg,
  orangeShelfImg,
  goldenShelfImg,
} from '../constants';

const ShelfCardSkeleton = () => (
  <div className="flex flex-col items-center relative animate-pulse select-none">
    <div className="w-full aspect-[354/200] rounded-[0.55vw] overflow-hidden border border-gray-200 bg-gradient-to-br from-gray-100 via-gray-200/50 to-gray-100 relative flex flex-col justify-center items-center shadow-2xs">
      {/* Two shelf line placeholders */}
      <div className="w-[62%] h-[0.35vw] bg-gray-300/70 rounded-xs mb-[2.2vw]" />
      <div className="w-[62%] h-[0.35vw] bg-gray-300/70 rounded-xs" />
      {/* Lamp skeleton on table */}
      <div className="w-[1.8vw] h-[2.2vw] bg-gray-300/40 rounded-t-full absolute bottom-[1.4vw] left-[2.2vw]" />
      {/* Three dots button placeholder */}
      <div className="w-[1.6vw] h-[1.6vw] rounded-[0.4vw] bg-gray-200/90 absolute top-[0.6vw] right-[0.6vw]" />
    </div>
    {/* Shelf title placeholder */}
    <div className="mt-[0.6vw] h-[0.82vw] w-[5.5vw] bg-gray-200 rounded-[0.25vw]" />
  </div>
);

const ShelvesOverview = ({
  folders = [],
  setSelectedFolder,
  setActiveShelfStyle,
  setSelectedWallTheme,
  setCurrentView,
  setShowAddShelfModal,
  onDeleteShelf,
  onShareShelf,
  onOpenShelf,
  isLoading = false,
}) => {
  const [openMenuFolder, setOpenMenuFolder] = useState(null);

  useEffect(() => {
    const handleClickOutside = () => setOpenMenuFolder(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  if (isLoading && folders.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[1.2vw] items-start max-w-5xl">
        <ShelfCardSkeleton />
        <ShelfCardSkeleton />
        {/* Create New Shelf Card Skeleton */}
        <div className="w-full aspect-[354/200] rounded-[0.55vw] border-2 border-dashed border-gray-200 bg-gray-50/50 flex flex-col items-center justify-center p-[1.2vw] text-center animate-pulse select-none">
          <div className="w-[2.6vw] h-[2.6vw] rounded-[0.5vw] bg-gray-200/80 mb-[0.6vw]" />
          <div className="h-[0.85vw] w-[7vw] bg-gray-200 rounded-[0.25vw] mb-[0.4vw]" />
          <div className="h-[0.65vw] w-[12vw] bg-gray-100 rounded-[0.2vw] mb-[0.8vw]" />
          <div className="h-[1.9vw] w-[8.5vw] bg-gray-200 rounded-[0.4vw]" />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[1.2vw] items-start max-w-5xl">
      {/* Real User Shelves */}
      {folders.map((folder, idx) => {
        const shelfTitle = folder.name;
        const styleId = String(folder.shelf_design).startsWith('customize')
          ? folder.shelf_design
          : ((folder.shelf_design === 1 || !folder.shelf_design) ? 'customize4' : `customize${folder.shelf_design}`);

        const shelfCardImg =
          styleId === 'customize_green' ? greenshade :
          styleId === 'customize_light' ? lightShelfImg :
          styleId === 'customize_plantlight' ? plantLightShelfImg :
          styleId === 'customize_greenlight' ? greenLightShelfImg :
          styleId === 'customize_bluerope' ? blueRopeShelfImg :
          styleId === 'customize_windowshelf' ? windowShelfImg :
          styleId === 'customize_orange' ? orangeShelfImg :
          styleId === 'customize_golden' ? goldenShelfImg :
          blueshade;

        return (
          <div
            key={folder.name || idx}
            onClick={() => {
              if (typeof onOpenShelf === 'function') {
                onOpenShelf(folder.name, styleId);
              } else {
                setSelectedFolder(folder.name);
                setActiveShelfStyle(styleId);
                setSelectedWallTheme(null);
                setCurrentView('shelf_detail');
              }
            }}
            className="group cursor-pointer flex flex-col items-center relative"
          >
            <div className="w-full aspect-[354/200] rounded-[0.55vw] overflow-hidden shadow-2xs border border-gray-200 group-hover:border-gray-300 group-hover:shadow-md group-hover:-translate-y-[0.15vw] transition-all duration-200 ease-out bg-white flex items-center justify-center relative">
              <img
                src={shelfCardImg}
                alt={shelfTitle}
                className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
              />

              {/* Three-dots Menu on Hover */}
              <div
                className="absolute top-[0.6vw] right-[0.6vw] z-20"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenuFolder(openMenuFolder === folder.name ? null : folder.name);
                  }}
                  className="w-[1.8vw] h-[1.8vw] rounded-[0.4vw] bg-white/90 hover:bg-white text-gray-700 shadow-2xs border border-gray-200 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer backdrop-blur-xs active:scale-95"
                  title="Shelf Options"
                >
                  <Icon icon="mdi:dots-vertical" className="w-[1vw] h-[1vw]" />
                </button>

                {/* Dropdown Menu */}
                {openMenuFolder === folder.name && (
                  <div
                    className="absolute right-0 top-[2.2vw] min-w-[8.5vw] bg-white rounded-[0.45vw] shadow-xl py-[0.25vw] z-30 border border-gray-100 text-left animate-in fade-in zoom-in-95 duration-150 whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuFolder(null);
                        if (typeof onShareShelf === 'function') {
                          onShareShelf(folder.name);
                        }
                      }}
                      className="w-full px-[0.7vw] py-[0.45vw] text-[0.75vw] font-medium text-gray-700 hover:bg-orange-50 hover:text-[#FF5733] flex items-center gap-[0.4vw] transition-colors cursor-pointer group/share"
                    >
                      <Icon icon="lucide:share-2" className="w-[0.9vw] h-[0.9vw] text-gray-500 group-hover/share:text-[#FF5733] transition-colors" />
                      <span>Share Shelf</span>
                    </button>
                    <div className="h-[1px] bg-gray-100 my-[0.15vw]" />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuFolder(null);
                        if (typeof onDeleteShelf === 'function') {
                          onDeleteShelf(folder.name);
                        }
                      }}
                      className="w-full px-[0.7vw] py-[0.45vw] text-[0.75vw] font-medium text-red-600 hover:bg-red-50 flex items-center gap-[0.4vw] transition-colors cursor-pointer"
                    >
                      <Icon icon="mdi:trash-can-outline" className="w-[0.9vw] h-[0.9vw]" />
                      <span>Remove Shelf</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
            <span className="mt-[0.6vw] text-[0.82vw] font-semibold text-gray-800 group-hover:text-[#FF5733] transition-colors">
              {shelfTitle}
            </span>
          </div>
        );
      })}

      {/* Create New Shelf Dashed Card */}
      <div
        onClick={() => setShowAddShelfModal(true)}
        className="w-full aspect-[354/200] rounded-[0.55vw] border-2 border-dashed border-[#FF5733]/40 bg-[#FFF5F2]/30 hover:bg-[#FFF5F2]/70 hover:border-[#FF5733]/70 flex flex-col items-center justify-center p-[1.2vw] text-center transition-all duration-200 cursor-pointer group shadow-2xs"
      >
        {/* Shelf Illustration / Icon with glowing rays */}
        <div className="relative mb-[0.6vw] flex items-center justify-center">
          <div className="w-[2.6vw] h-[2.6vw] rounded-[0.5vw] bg-orange-50 border border-orange-100 flex items-center justify-center relative group-hover:scale-105 transition-transform duration-200">
            {/* Subtle rays */}
            <span className="absolute -top-[0.2vw] w-[0.15vw] h-[0.35vw] bg-orange-300 rounded-full"></span>
            <span className="absolute -top-[0.1vw] -right-[0.1vw] w-[0.15vw] h-[0.35vw] bg-orange-300 rounded-full rotate-45"></span>
            <span className="absolute -top-[0.1vw] -left-[0.1vw] w-[0.15vw] h-[0.35vw] bg-orange-300 rounded-full -rotate-45"></span>
            {/* Floating shelf icon */}
            <div className="w-[1.4vw] h-[0.5vw] bg-[#EA580C]/80 rounded-[0.1vw] relative flex items-center justify-center shadow-xs">
              <div className="w-[0.7vw] h-[0.15vw] bg-white/80 rounded-full"></div>
            </div>
            {/* Plus badge */}
            <div className="absolute -top-[0.2vw] -right-[0.2vw] w-[0.9vw] h-[0.9vw] bg-[#FF5733] rounded-full text-white flex items-center justify-center text-[0.6vw] font-bold shadow-xs">
              +
            </div>
          </div>
        </div>

        <h3 className="text-[0.9vw] font-semibold text-gray-900 mb-[0.2vw]">Create New Shelf</h3>
        <p className="text-[0.72vw] text-gray-500 font-medium mb-[0.8vw] max-w-[15vw] leading-relaxed">
          Design a new shelf, add your flipbooks and share with your clients
        </p>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowAddShelfModal(true);
          }}
          className="h-[1.9vw] px-[0.85vw] bg-[#FF5733] hover:bg-[#E04D2D] active:scale-95 text-white text-[0.8vw] font-medium rounded-[0.4vw] shadow-2xs hover:shadow-sm transition-all duration-150 flex items-center gap-[0.35vw] cursor-pointer"
        >
          <span className="text-[0.9vw] leading-none">+</span>
          <span>Create New Shelf</span>
        </button>
      </div>
    </div>
  );
};

export default ShelvesOverview;
