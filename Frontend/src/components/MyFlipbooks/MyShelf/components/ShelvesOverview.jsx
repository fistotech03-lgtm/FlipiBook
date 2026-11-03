import React from 'react';
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

const ShelvesOverview = ({
  folders = [],
  setSelectedFolder,
  setActiveShelfStyle,
  setSelectedWallTheme,
  setCurrentView,
  setShowAddShelfModal,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start max-w-5xl">
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
              setSelectedFolder(folder.name);
              setActiveShelfStyle(styleId);
              setSelectedWallTheme(null);
              setCurrentView('shelf_detail');
            }}
            className="group cursor-pointer flex flex-col items-center"
          >
            <div className="w-full aspect-[354/200] rounded-xl overflow-hidden shadow-sm border border-gray-200/90 group-hover:shadow-lg group-hover:-translate-y-1 group-hover:border-blue-400/50 transition-all duration-200 ease-out bg-white flex items-center justify-center">
              <img
                src={shelfCardImg}
                alt={shelfTitle}
                className="w-full h-full object-cover transition-all duration-200 group-hover:contrast-[1.03]"
              />
            </div>
            <span className="mt-3 text-sm font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
              {shelfTitle}
            </span>
          </div>
        );
      })}

      {/* Create New Shelf Dashed Card */}
      <div className="w-full aspect-[354/200] rounded-2xl border-2 border-dashed border-[#FCA5A5] bg-[#FEF2F2]/20 flex flex-col items-center justify-center p-6 text-center hover:bg-[#FEF2F2]/40 transition-colors">
        {/* Shelf Illustration / Icon with glowing rays */}
        <div className="relative mb-3 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center relative">
            {/* Subtle rays */}
            <span className="absolute -top-1 w-1 h-1.5 bg-orange-300 rounded-full"></span>
            <span className="absolute -top-0.5 -right-0.5 w-1 h-1.5 bg-orange-300 rounded-full rotate-45"></span>
            <span className="absolute -top-0.5 -left-0.5 w-1 h-1.5 bg-orange-300 rounded-full -rotate-45"></span>
            {/* Floating shelf icon */}
            <div className="w-7 h-2.5 bg-[#EA580C]/80 rounded-sm relative flex items-center justify-center shadow-sm">
              <div className="w-3.5 h-1 bg-white/70 rounded-full"></div>
            </div>
            {/* Plus badge */}
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF5733] rounded-full text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
              +
            </div>
          </div>
        </div>

        <h3 className="text-sm font-bold text-gray-900 mb-1">Create New Shelf</h3>
        <p className="text-[11px] text-gray-500 mb-4 max-w-[240px] leading-relaxed">
          Design a new shelf, add your flipbooks and share with your clients
        </p>

        <button
          onClick={() => setShowAddShelfModal(true)}
          className="px-5 py-2 bg-[#FF5733] hover:bg-[#E04D2D] active:scale-95 text-white text-xs font-semibold rounded-lg shadow-sm transition-all duration-150 flex items-center gap-1.5"
        >
          <span>+</span>
          <span>Create New Shelf</span>
        </button>
      </div>
    </div>
  );
};

export default ShelvesOverview;

