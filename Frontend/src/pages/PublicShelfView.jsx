import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Icon } from '@iconify/react';

// Shelf Components
import BlueShelf from '../components/MyFlipbooks/MyShelf/Shelves/BlueShelf';
import BlueRopeShelf from '../components/MyFlipbooks/MyShelf/Shelves/BlueRopeShelf';
import WindowShelf from '../components/MyFlipbooks/MyShelf/Shelves/WindowShelf';
import PlantLightShelf from '../components/MyFlipbooks/MyShelf/Shelves/PlantLightShelf';
import LightShelf from '../components/MyFlipbooks/MyShelf/Shelves/LightShelf';
import GreenLightShelf from '../components/MyFlipbooks/MyShelf/Shelves/GreenLightShelf';
import GreenShelf from '../components/MyFlipbooks/MyShelf/Shelves/GreenShelf';
import OrangeShelf from '../components/MyFlipbooks/MyShelf/Shelves/OrangeShelf';
import GoldenShelf from '../components/MyFlipbooks/MyShelf/Shelves/GoldenShelf';
import LazyPreview from '../components/MyFlipbooks/MyShelf/LazyPreview';

// Sheet Background Assets
import {
  bluesheet,
  blueFrameSheet,
  windowShelfSheet,
  orangeSheet,
  goldenShelfSheet,
  greensheet,
  lightShelfSheet,
  plantLightShadowSheet,
  greenLightSheet
} from '../components/MyFlipbooks/MyShelf/constants';

const PublicShelfView = () => {
  const { shelfId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shelfData, setShelfData] = useState(null);
  const [creatorData, setCreatorData] = useState(null);

  // Interactive shelf state
  const [decors, setDecors] = useState({ lights: true });
  const [openMenuId, setOpenMenuId] = useState(null);
  const [hoveredInfoId, setHoveredInfoId] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchPublicShelf = async () => {
      if (!shelfId) {
        setError('Shelf ID is missing');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await axios.get(`${backendUrl}/api/shelf/public/${shelfId}?_t=${Date.now()}`, {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        if (res.data?.success && res.data?.shelf) {
          const s = res.data.shelf;
          setShelfData(s);
          setCreatorData(res.data.creator || null);
          setDecors({
            ...(s.decors || {}),
            lights: s.lights !== undefined ? s.lights : (s.defaultLightType !== 'Turn off')
          });
        } else {
          setError(res.data?.message || 'Shelf not found');
        }
      } catch (err) {
        console.error('Error fetching public shelf:', err);
        setError('Failed to load shelf. It may not exist or has been removed.');
      } finally {
        setLoading(false);
      }
    };

    fetchPublicShelf();
  }, [shelfId, backendUrl]);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const getShelfAssets = (style, selectedWallTheme) => {
    switch (style) {
      case 'customize_green':
        return {
          type: 'green_shelf',
          bg: selectedWallTheme || greensheet,
          bgStretch: true
        };
      case 'customize_greenlight':
        return {
          type: 'green_light_shelf',
          bg: selectedWallTheme || greenLightSheet,
          bgStretch: true
        };
      case 'customize_light':
        return {
          type: 'light_shelf',
          bg: selectedWallTheme || lightShelfSheet,
          bgStretch: true
        };
      case 'customize_plantlight':
        return {
          type: 'plant_light_shelf',
          bg: selectedWallTheme || plantLightShadowSheet,
          bgStretch: true
        };
      case 'customize_bluerope':
        return {
          type: 'blue_rope_shelf',
          bg: selectedWallTheme || blueFrameSheet,
          bgStretch: true
        };
      case 'customize_windowshelf':
        return {
          type: 'window_shelf',
          bg: selectedWallTheme || windowShelfSheet,
          bgStretch: true
        };
      case 'customize_orange':
        return {
          type: 'orange_shelf',
          bg: selectedWallTheme || orangeSheet,
          bgStretch: true
        };
      case 'customize_golden':
        return {
          type: 'golden_shelf',
          bg: selectedWallTheme || goldenShelfSheet,
          bgStretch: true
        };
      case 'customize4':
      default:
        return {
          type: 'blue_shelf',
          bg: selectedWallTheme || bluesheet,
          bgStretch: true
        };
    }
  };

  if (loading) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-[#131419] text-white">
        <div className="w-12 h-12 border-4 border-[#FF5733] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-400 text-sm font-medium tracking-wide">Loading Bookshelf...</p>
      </div>
    );
  }

  if (error || !shelfData) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-[#131419] text-white p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-4">
          <Icon icon="mdi:book-alert-outline" className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Shelf Not Found</h2>
        <p className="text-gray-400 max-w-md text-sm mb-6">{error || 'The requested bookshelf could not be found.'}</p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="px-6 py-2.5 bg-[#FF5733] hover:bg-[#E04D2D] text-white font-medium rounded-lg shadow-md transition-all active:scale-95"
        >
          Go to Home
        </button>
      </div>
    );
  }

  const activeAssets = getShelfAssets(shelfData.shelf_design, shelfData.selectedWallTheme);
  const filteredBooks = shelfData.books || [];

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-black select-none">
      {/* Top Floating Header Bar */}
      <header className="absolute top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-4 bg-gradient-to-b from-black/75 via-black/35 to-transparent backdrop-blur-[2px] pointer-events-auto">
        <div className="flex items-center gap-3">
          {shelfData.logo ? (
            <img
              src={typeof shelfData.logo === 'object' ? (shelfData.logo.url || '') : shelfData.logo}
              alt="Shelf Logo"
              className="h-8 max-w-[120px] drop-shadow"
              style={{
                objectFit: shelfData.logoFixType === 'Fill' ? 'fill' : 'contain',
                opacity: (shelfData.logoOpacity ?? 100) / 100
              }}
            />
          ) : creatorData?.picture ? (
            <img src={creatorData.picture} alt={creatorData.name} className="w-9 h-9 rounded-full border border-white/30 object-cover shadow-sm" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-[#FF5733] text-white flex items-center justify-center font-bold text-sm shadow-md">
              {(creatorData?.name || 'F').charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex flex-col">
            <h1 className="text-white text-base font-bold leading-tight drop-shadow-md">
              {shelfData.folderName || 'Bookshelf'}
            </h1>
            <p className="text-white/70 text-xs font-medium drop-shadow-sm">
              Curated by {creatorData?.name || 'Creator'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleFullscreen}
            className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all shadow-md cursor-pointer"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            <Icon icon={isFullscreen ? "lucide:minimize" : "lucide:maximize"} className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => window.open('/', '_blank')}
            className="px-4 py-1.5 rounded-full bg-[#FF5733] hover:bg-[#E04D2D] active:scale-95 text-white text-xs font-semibold shadow-md transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>FlipiBook</span>
            <Icon icon="mdi:arrow-top-right" className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Fullscreen Shelf Stage */}
      <main
        className="w-full h-full relative"
        style={{
          backgroundImage: activeAssets.bg ? `url('${activeAssets.bg}')` : 'none',
          backgroundSize: activeAssets.bgStretch ? '100% 100%' : 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Render the specific Shelf Component with isFs={true} */}
        {activeAssets.type === 'green_shelf' && (
          <GreenShelf
            filteredBooks={filteredBooks}
            decors={decors}
            setDecors={setDecors}
            showLightSwitch={shelfData.showLightSwitch !== false}
            lightOpacity={shelfData.lightOpacity ?? 100}
            selectedLightTheme={shelfData.selectedLightTheme}
            selectedWallTheme={shelfData.selectedWallTheme}
            openMenuId={openMenuId}
            setOpenMenuId={setOpenMenuId}
            hoveredInfoId={hoveredInfoId}
            setHoveredInfoId={setHoveredInfoId}
            LazyPreview={LazyPreview}
            backendUrl={backendUrl}
            currentUserEmail={creatorData?.email}
            isFs={true}
          />
        )}

        {activeAssets.type === 'green_light_shelf' && (
          <GreenLightShelf
            filteredBooks={filteredBooks}
            decors={decors}
            setDecors={setDecors}
            showLightSwitch={shelfData.showLightSwitch !== false}
            lightOpacity={shelfData.lightOpacity ?? 100}
            selectedLightTheme={shelfData.selectedLightTheme}
            selectedWallTheme={shelfData.selectedWallTheme}
            openMenuId={openMenuId}
            setOpenMenuId={setOpenMenuId}
            hoveredInfoId={hoveredInfoId}
            setHoveredInfoId={setHoveredInfoId}
            LazyPreview={LazyPreview}
            backendUrl={backendUrl}
            currentUserEmail={creatorData?.email}
            isFs={true}
          />
        )}

        {activeAssets.type === 'light_shelf' && (
          <LightShelf
            filteredBooks={filteredBooks}
            decors={decors}
            setDecors={setDecors}
            showLightSwitch={shelfData.showLightSwitch !== false}
            lightOpacity={shelfData.lightOpacity ?? 100}
            selectedLightTheme={shelfData.selectedLightTheme}
            selectedWallTheme={shelfData.selectedWallTheme}
            openMenuId={openMenuId}
            setOpenMenuId={setOpenMenuId}
            hoveredInfoId={hoveredInfoId}
            setHoveredInfoId={setHoveredInfoId}
            LazyPreview={LazyPreview}
            backendUrl={backendUrl}
            currentUserEmail={creatorData?.email}
            isFs={true}
          />
        )}

        {activeAssets.type === 'plant_light_shelf' && (
          <PlantLightShelf
            filteredBooks={filteredBooks}
            decors={decors}
            setDecors={setDecors}
            showLightSwitch={shelfData.showLightSwitch !== false}
            lightOpacity={shelfData.lightOpacity ?? 100}
            selectedLightTheme={shelfData.selectedLightTheme}
            selectedWallTheme={shelfData.selectedWallTheme}
            openMenuId={openMenuId}
            setOpenMenuId={setOpenMenuId}
            hoveredInfoId={hoveredInfoId}
            setHoveredInfoId={setHoveredInfoId}
            LazyPreview={LazyPreview}
            backendUrl={backendUrl}
            currentUserEmail={creatorData?.email}
            isFs={true}
          />
        )}

        {activeAssets.type === 'blue_rope_shelf' && (
          <BlueRopeShelf
            filteredBooks={filteredBooks}
            decors={decors}
            setDecors={setDecors}
            showLightSwitch={shelfData.showLightSwitch !== false}
            lightOpacity={shelfData.lightOpacity ?? 100}
            selectedLightTheme={shelfData.selectedLightTheme}
            selectedWallTheme={shelfData.selectedWallTheme}
            openMenuId={openMenuId}
            setOpenMenuId={setOpenMenuId}
            hoveredInfoId={hoveredInfoId}
            setHoveredInfoId={setHoveredInfoId}
            LazyPreview={LazyPreview}
            backendUrl={backendUrl}
            currentUserEmail={creatorData?.email}
            isFs={true}
          />
        )}

        {activeAssets.type === 'window_shelf' && (
          <WindowShelf
            filteredBooks={filteredBooks}
            decors={decors}
            setDecors={setDecors}
            showLightSwitch={shelfData.showLightSwitch !== false}
            lightOpacity={shelfData.lightOpacity ?? 100}
            selectedLightTheme={shelfData.selectedLightTheme}
            selectedWallTheme={shelfData.selectedWallTheme}
            openMenuId={openMenuId}
            setOpenMenuId={setOpenMenuId}
            hoveredInfoId={hoveredInfoId}
            setHoveredInfoId={setHoveredInfoId}
            LazyPreview={LazyPreview}
            backendUrl={backendUrl}
            currentUserEmail={creatorData?.email}
            isFs={true}
          />
        )}

        {activeAssets.type === 'orange_shelf' && (
          <OrangeShelf
            filteredBooks={filteredBooks}
            decors={decors}
            setDecors={setDecors}
            showLightSwitch={shelfData.showLightSwitch !== false}
            lightOpacity={shelfData.lightOpacity ?? 100}
            selectedLightTheme={shelfData.selectedLightTheme}
            selectedWallTheme={shelfData.selectedWallTheme}
            openMenuId={openMenuId}
            setOpenMenuId={setOpenMenuId}
            hoveredInfoId={hoveredInfoId}
            setHoveredInfoId={setHoveredInfoId}
            LazyPreview={LazyPreview}
            backendUrl={backendUrl}
            currentUserEmail={creatorData?.email}
            isFs={true}
          />
        )}

        {activeAssets.type === 'golden_shelf' && (
          <GoldenShelf
            filteredBooks={filteredBooks}
            decors={decors}
            setDecors={setDecors}
            showLightSwitch={shelfData.showLightSwitch !== false}
            lightOpacity={shelfData.lightOpacity ?? 100}
            selectedLightTheme={shelfData.selectedLightTheme}
            selectedWallTheme={shelfData.selectedWallTheme}
            openMenuId={openMenuId}
            setOpenMenuId={setOpenMenuId}
            hoveredInfoId={hoveredInfoId}
            setHoveredInfoId={setHoveredInfoId}
            LazyPreview={LazyPreview}
            backendUrl={backendUrl}
            currentUserEmail={creatorData?.email}
            isFs={true}
          />
        )}

        {activeAssets.type === 'blue_shelf' && (
          <BlueShelf
            filteredBooks={filteredBooks}
            decors={decors}
            setDecors={setDecors}
            showLightSwitch={shelfData.showLightSwitch !== false}
            lightOpacity={shelfData.lightOpacity ?? 100}
            selectedLightTheme={shelfData.selectedLightTheme}
            selectedWallTheme={shelfData.selectedWallTheme}
            openMenuId={openMenuId}
            setOpenMenuId={setOpenMenuId}
            hoveredInfoId={hoveredInfoId}
            setHoveredInfoId={setHoveredInfoId}
            LazyPreview={LazyPreview}
            backendUrl={backendUrl}
            currentUserEmail={creatorData?.email}
            isFs={true}
          />
        )}
      </main>
    </div>
  );
};

export default PublicShelfView;

