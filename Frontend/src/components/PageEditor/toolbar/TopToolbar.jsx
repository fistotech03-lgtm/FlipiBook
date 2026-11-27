import React, { useState, useEffect, useRef } from 'react';
import { Undo2, Redo2, RotateCcw, Plus, Minus, Scissors, Ruler, Save } from 'lucide-react';
import { Icon } from '@iconify/react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import { useActiveBook } from '../../../store/hooks';
import { MaskIcon, FlattenIcon } from '../mainEditor/components/editorIcons';
import { TRANSLATE_LANGUAGES } from '../utils/inlineTranslationHelper';

const TopToolbar = ({ 
  zoom, 
  onZoomIn, 
  onZoomOut, 
  onReset, 
  onUndo, 
  onRedo, 
  canUndo, 
  canRedo,
  onAlign,
  hasSelection,
  selectedLayerId,
  hideTools = false
}) => {
  const [showTranslateMenu, setShowTranslateMenu] = useState(false);
  const [selectedLang, setSelectedLang] = useState('tam_Taml');
  const translateMenuRef = useRef(null);

  const { user } = useAuth();
  const { isAutoSaveEnabled, toggleAutoSave } = useActiveBook();

  const [isTrimView, setIsTrimView] = useState(() => {
    try {
      const saved = localStorage.getItem('isTrimViewEnabled');
      return saved !== null ? JSON.parse(saved) : false;
    } catch { return false; }
  });
  const [isRulerEnabled, setIsRulerEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem('isRulerEnabled');
      return saved !== null ? JSON.parse(saved) : true;
    } catch { return true; }
  });

  const syncEditorSettings = async (partialSettings) => {
    try {
      if (user) {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
        await axios.post(`${backendUrl}/api/usersetting/update-editor-settings`, {
          emailId: user.emailId || user.email,
          editorSettings: partialSettings
        });
      }
    } catch (err) {
      console.error('Failed to sync editor settings to backend:', err);
    }
  };

  useEffect(() => {
    const handleSettingsChanged = (e) => {
      if (e.detail) {
        if (e.detail.isRulerEnabled !== undefined) setIsRulerEnabled(e.detail.isRulerEnabled);
        if (e.detail.isTrimView !== undefined) setIsTrimView(e.detail.isTrimView);
      }
    };
    const handleTrimEvent = (e) => {
      if (e.detail !== undefined) setIsTrimView(Boolean(e.detail));
    };
    const handleRulerEvent = (e) => {
      if (e.detail !== undefined) {
        const val = typeof e.detail === 'object' && e.detail !== null
          ? (e.detail.isRulerEnabled !== undefined ? e.detail.isRulerEnabled : e.detail)
          : e.detail;
        setIsRulerEnabled(Boolean(val));
      }
    };
    window.addEventListener('editor_settings_changed', handleSettingsChanged);
    window.addEventListener('editor_toggleTrimView', handleTrimEvent);
    window.addEventListener('editor_toggleRuler', handleRulerEvent);
    return () => {
      window.removeEventListener('editor_settings_changed', handleSettingsChanged);
      window.removeEventListener('editor_toggleTrimView', handleTrimEvent);
      window.removeEventListener('editor_toggleRuler', handleRulerEvent);
    };
  }, []);

  const handleTrimViewToggle = () => {
    const next = !isTrimView;
    setIsTrimView(next);
    localStorage.setItem('isTrimViewEnabled', JSON.stringify(next));
    window.dispatchEvent(new CustomEvent('editor_toggleTrimView', { detail: next }));
    syncEditorSettings({ isTrimViewEnabled: next });
  };

  const handleAutoSaveToggle = () => {
    const next = !isAutoSaveEnabled;
    toggleAutoSave(next);
    syncEditorSettings({ isAutoSaveEnabled: next });
  };

  const handleRulerToggle = () => {
    const next = !isRulerEnabled;
    setIsRulerEnabled(next);
    localStorage.setItem('isRulerEnabled', JSON.stringify(next));
    window.dispatchEvent(new CustomEvent('editor_toggleRuler', { detail: next }));
    syncEditorSettings({ isRulerEnabled: next });
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (translateMenuRef.current && !translateMenuRef.current.contains(e.target)) {
        setShowTranslateMenu(false);
      }
    };
    if (showTranslateMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTranslateMenu]);
  return (
    <div 
      className="bg-[#FFFFFF] border-b border-[#EEEEEE] flex items-center justify-between px-[1.5vw] flex-shrink-0 select-none"
      style={{ height: '7vh', width: '100%' }}
    >
      {/* Left Section: History */}
      <div className="flex items-center gap-[1.5vw]">
        <div className="relative group/tt flex flex-col items-center">
          <div 
            onClick={canUndo ? onUndo : undefined}
            className={`flex flex-col items-center group ${canUndo ? 'cursor-pointer' : 'cursor-not-allowed opacity-30'}`}
          >
            <Undo2 size="1.2vw" className={`text-[#374151] ${canUndo ? 'group-hover:text-black' : ''} transition-colors`} />
            <span className={`text-[0.68vw] font-medium mt-[0.1vh] text-[#374151] ${canUndo ? 'group-hover:text-black' : ''}`}>Undo</span>
          </div>
          {canUndo && (
            <div className="absolute left-1/2 -translate-x-1/2 top-full mt-[0.35vw] hidden group-hover/tt:flex flex-col items-center pointer-events-none z-50 whitespace-nowrap">
              <div className="w-0 h-0 border-x-[0.3vw] border-x-transparent border-b-[0.3vw] border-b-gray-900/90" />
              <div className="bg-gray-900/90 text-white text-[0.65vw] font-medium px-[0.5vw] py-[0.2vw] rounded-[0.3vw] shadow-md backdrop-blur-xs">
                Undo
              </div>
            </div>
          )}
        </div>

        <div className="relative group/tt flex flex-col items-center">
          <div 
            onClick={canRedo ? onRedo : undefined}
            className={`flex flex-col items-center group ${canRedo ? 'cursor-pointer' : 'cursor-not-allowed opacity-30'}`}
          >
            <Redo2 size="1.2vw" className={`text-[#374151] ${canRedo ? 'group-hover:text-black' : ''} transition-colors`} />
            <span className={`text-[0.68vw] font-medium mt-[0.1vh] text-[#374151] ${canRedo ? 'group-hover:text-black' : ''}`}>Redo</span>
          </div>
          {canRedo && (
            <div className="absolute left-1/2 -translate-x-1/2 top-full mt-[0.35vw] hidden group-hover/tt:flex flex-col items-center pointer-events-none z-50 whitespace-nowrap">
              <div className="w-0 h-0 border-x-[0.3vw] border-x-transparent border-b-[0.3vw] border-b-gray-900/90" />
              <div className="bg-gray-900/90 text-white text-[0.65vw] font-medium px-[0.5vw] py-[0.2vw] rounded-[0.3vw] shadow-md backdrop-blur-xs">
                Redo
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Center Section: Unified Alignment Pill & Inline Text Translation */}
      {!hideTools && (
        <div className="flex items-center gap-[0.6vw]">
          <div className={`flex items-center bg-[#F3F4F6] p-[0.28vw] rounded-[0.55vw] gap-[0.1vw] ${!hasSelection ? 'opacity-35 pointer-events-none' : ''}`}>
            {/* Group 1: Vertical Alignment */}
            <div className="relative group/tt flex items-center justify-center">
              <div onClick={() => onAlign && onAlign('top')} className="w-[1.9vw] h-[1.9vw] flex items-center justify-center hover:bg-white rounded-[0.4vw] cursor-pointer transition-all hover:shadow-sm">
                <Icon icon="line-md:arrow-align-top" width="1.05vw" className="text-[#374151]" />
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-[0.35vw] hidden group-hover/tt:flex flex-col items-center pointer-events-none z-50 whitespace-nowrap">
                <div className="w-0 h-0 border-x-[0.3vw] border-x-transparent border-b-[0.3vw] border-b-gray-900/90" />
                <div className="bg-gray-900/90 text-white text-[0.65vw] font-medium px-[0.5vw] py-[0.2vw] rounded-[0.3vw] shadow-md backdrop-blur-xs">
                  Align Top
                </div>
              </div>
            </div>

            <div className="relative group/tt flex items-center justify-center">
              <div onClick={() => onAlign && onAlign('middle')} className="w-[1.9vw] h-[1.9vw] flex items-center justify-center hover:bg-white rounded-[0.4vw] cursor-pointer transition-all hover:shadow-sm">
                <Icon icon="line-md:arrow-align-middle" width="1.05vw" className="text-[#374151]" />
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-[0.35vw] hidden group-hover/tt:flex flex-col items-center pointer-events-none z-50 whitespace-nowrap">
                <div className="w-0 h-0 border-x-[0.3vw] border-x-transparent border-b-[0.3vw] border-b-gray-900/90" />
                <div className="bg-gray-900/90 text-white text-[0.65vw] font-medium px-[0.5vw] py-[0.2vw] rounded-[0.3vw] shadow-md backdrop-blur-xs">
                  Align Middle
                </div>
              </div>
            </div>

            <div className="relative group/tt flex items-center justify-center">
              <div onClick={() => onAlign && onAlign('bottom')} className="w-[1.9vw] h-[1.9vw] flex items-center justify-center hover:bg-white rounded-[0.4vw] cursor-pointer transition-all hover:shadow-sm">
                <Icon icon="line-md:arrow-align-bottom" width="1.05vw" className="text-[#374151]" />
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-[0.35vw] hidden group-hover/tt:flex flex-col items-center pointer-events-none z-50 whitespace-nowrap">
                <div className="w-0 h-0 border-x-[0.3vw] border-x-transparent border-b-[0.3vw] border-b-gray-900/90" />
                <div className="bg-gray-900/90 text-white text-[0.65vw] font-medium px-[0.5vw] py-[0.2vw] rounded-[0.3vw] shadow-md backdrop-blur-xs">
                  Align Bottom
                </div>
              </div>
            </div>

            <div className="w-[1px] h-[1.1vw] bg-gray-300/80 mx-[0.2vw]" />

            {/* Group 2: Horizontal Alignment */}
            <div className="relative group/tt flex items-center justify-center">
              <div onClick={() => onAlign && onAlign('left')} className="w-[1.9vw] h-[1.9vw] flex items-center justify-center hover:bg-white rounded-[0.4vw] cursor-pointer transition-all hover:shadow-sm">
                <Icon icon="line-md:arrow-align-left" width="1.05vw" className="text-[#374151]" />
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-[0.35vw] hidden group-hover/tt:flex flex-col items-center pointer-events-none z-50 whitespace-nowrap">
                <div className="w-0 h-0 border-x-[0.3vw] border-x-transparent border-b-[0.3vw] border-b-gray-900/90" />
                <div className="bg-gray-900/90 text-white text-[0.65vw] font-medium px-[0.5vw] py-[0.2vw] rounded-[0.3vw] shadow-md backdrop-blur-xs">
                  Align Left
                </div>
              </div>
            </div>

            <div className="relative group/tt flex items-center justify-center">
              <div onClick={() => onAlign && onAlign('center')} className="w-[1.9vw] h-[1.9vw] flex items-center justify-center hover:bg-white rounded-[0.4vw] cursor-pointer transition-all hover:shadow-sm">
                <Icon icon="line-md:arrow-align-center" width="1.05vw" className="text-[#374151]" />
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-[0.35vw] hidden group-hover/tt:flex flex-col items-center pointer-events-none z-50 whitespace-nowrap">
                <div className="w-0 h-0 border-x-[0.3vw] border-x-transparent border-b-[0.3vw] border-b-gray-900/90" />
                <div className="bg-gray-900/90 text-white text-[0.65vw] font-medium px-[0.5vw] py-[0.2vw] rounded-[0.3vw] shadow-md backdrop-blur-xs">
                  Align Center
                </div>
              </div>
            </div>

            <div className="relative group/tt flex items-center justify-center">
              <div onClick={() => onAlign && onAlign('right')} className="w-[1.9vw] h-[1.9vw] flex items-center justify-center hover:bg-white rounded-[0.4vw] cursor-pointer transition-all hover:shadow-sm">
                <Icon icon="line-md:arrow-align-right" width="1.05vw" className="text-[#374151]" />
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-[0.35vw] hidden group-hover/tt:flex flex-col items-center pointer-events-none z-50 whitespace-nowrap">
                <div className="w-0 h-0 border-x-[0.3vw] border-x-transparent border-b-[0.3vw] border-b-gray-900/90" />
                <div className="bg-gray-900/90 text-white text-[0.65vw] font-medium px-[0.5vw] py-[0.2vw] rounded-[0.3vw] shadow-md backdrop-blur-xs">
                  Align Right
                </div>
              </div>
            </div>

            <div className="w-[1px] h-[1.1vw] bg-gray-300/80 mx-[0.2vw]" />

            {/* Group 3: Distribution */}
            <div className="relative group/tt flex items-center justify-center">
              <div onClick={() => onAlign && onAlign('distribute-v')} className="w-[1.9vw] h-[1.9vw] flex items-center justify-center hover:bg-white rounded-[0.4vw] cursor-pointer transition-all hover:shadow-sm">
                <Icon icon="icon-park-outline:distribute-vertically" width="1.05vw" className="text-[#374151]" />
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-[0.35vw] hidden group-hover/tt:flex flex-col items-center pointer-events-none z-50 whitespace-nowrap">
                <div className="w-0 h-0 border-x-[0.3vw] border-x-transparent border-b-[0.3vw] border-b-gray-900/90" />
                <div className="bg-gray-900/90 text-white text-[0.65vw] font-medium px-[0.5vw] py-[0.2vw] rounded-[0.3vw] shadow-md backdrop-blur-xs">
                  Distribute Vertically
                </div>
              </div>
            </div>

            <div className="relative group/tt flex items-center justify-center">
              <div onClick={() => onAlign && onAlign('distribute-h')} className="w-[1.9vw] h-[1.9vw] flex items-center justify-center hover:bg-white rounded-[0.4vw] cursor-pointer transition-all hover:shadow-sm">
                <Icon icon="icon-park-outline:distribute-horizontally" width="1.05vw" className="text-[#374151]" />
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-[0.35vw] hidden group-hover/tt:flex flex-col items-center pointer-events-none z-50 whitespace-nowrap">
                <div className="w-0 h-0 border-x-[0.3vw] border-x-transparent border-b-[0.3vw] border-b-gray-900/90" />
                <div className="bg-gray-900/90 text-white text-[0.65vw] font-medium px-[0.5vw] py-[0.2vw] rounded-[0.3vw] shadow-md backdrop-blur-xs">
                  Distribute Horizontally
                </div>
              </div>
            </div>
          </div>

          {/* Inline Text Translation - Matching Exact Pill Height */}
          <div className="relative flex items-center">
            <div className="flex items-center bg-[#F3F4F6] p-[0.28vw] rounded-[0.55vw]">
              <button
                onMouseDown={(e) => {
                  // Crucial: prevent blur on mousedown so active text selection is preserved!
                  e.preventDefault();
                }}
                onClick={() => setShowTranslateMenu(!showTranslateMenu)}
                title="Translate selected word, sentence, or text layer"
                className={`h-[1.9vw] flex items-center gap-[0.35vw] px-[0.65vw] rounded-[0.4vw] cursor-pointer transition-all ${
                  showTranslateMenu ? 'bg-white shadow-sm text-gray-900' : 'hover:bg-white text-[#374151] hover:text-gray-900'
                }`}
              >
                <Icon icon="bi:translate" width="0.95vw" height="0.95vw" className={showTranslateMenu ? 'text-gray-900' : 'text-gray-700'} />
                <span className="text-[0.72vw] font-semibold leading-none">Translate</span>
                <Icon icon="mdi:chevron-down" width="0.8vw" height="0.8vw" className={`transition-transform duration-150 ${showTranslateMenu ? 'rotate-180 text-gray-900' : 'text-gray-400'}`} />
              </button>
            </div>

        {/* Translation Language Dropdown */}
        {showTranslateMenu && (
          <div
            ref={translateMenuRef}
            onMouseDown={(e) => e.preventDefault()}
            className="absolute left-1/2 -translate-x-1/2 top-full mt-[0.5vw] w-[13.5vw] bg-white rounded-[0.6vw] shadow-[0_12px_36px_rgba(0,0,0,0.16)] border border-gray-100 p-[0.4vw] z-[9999] flex flex-col gap-[0.2vw]"
          >
            <div className="px-[0.5vw] py-[0.3vw] border-b border-gray-100 flex items-center justify-between">
              <span className="text-[0.7vw] font-bold text-gray-800">Translate Text</span>
            </div>
            <div className="max-h-[34vh] overflow-y-auto flex flex-col gap-[0.1vw] py-[0.2vw]">
              {TRANSLATE_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setSelectedLang(lang.code);
                    window.dispatchEvent(new CustomEvent('trigger-inline-translate', {
                      detail: { targetLang: lang.code, layerId: selectedLayerId }
                    }));
                    setShowTranslateMenu(false);
                  }}
                  className={`w-full flex items-center justify-between px-[0.6vw] py-[0.4vw] text-[0.72vw] font-medium rounded-[0.4vw] transition-colors cursor-pointer text-left ${
                    lang.code === selectedLang
                      ? 'bg-gray-100 text-gray-900 font-semibold hover:bg-gray-200/70'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-black'
                  }`}
                >
                  <div className="flex items-center gap-[0.4vw]">
                    {lang.code === selectedLang && (
                      <span className="w-[0.4vw] h-[0.4vw] rounded-full bg-gray-700"></span>
                    )}
                    <span>{lang.name}</span>
                  </div>
                  <span className="text-[0.65vw] text-gray-400 font-normal">{lang.native}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      </div>
      )}

      {/* Right Section: Editor Settings Toggles & Zoom */}
      <div className="flex items-center gap-[0.6vw]">
        {/* Direct Editor Settings Toggle Icons */}
        <div className="flex items-center bg-[#F3F4F6] p-[0.28vw] rounded-[0.55vw] gap-[0.25vw]">
          {/* Trim View */}
          {!hideTools && (
            <div className="relative group/tt flex items-center justify-center">
              <button
                onClick={handleTrimViewToggle}
                tabIndex={-1}
                aria-label="Toggle Trim View"
                className={`relative w-[1.9vw] h-[1.9vw] flex items-center justify-center rounded-[0.4vw] cursor-pointer transition-all focus:outline-none group ${
                  isTrimView
                    ? 'bg-[#E5E7EB] text-gray-900 shadow-[inset_0_1px_2px_rgba(0,0,0,0.08)] border border-gray-300/60'
                    : 'bg-white text-gray-500 shadow-xs border border-transparent hover:text-gray-800'
                }`}
              >
                <Scissors size="0.95vw" strokeWidth={2.2} className="group-hover:scale-105 transition-transform" />
              </button>
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-[0.35vw] hidden group-hover/tt:flex flex-col items-center pointer-events-none z-50 whitespace-nowrap">
                <div className="w-0 h-0 border-x-[0.3vw] border-x-transparent border-b-[0.3vw] border-b-gray-900/90" />
                <div className="bg-gray-900/90 text-white text-[0.65vw] font-medium px-[0.5vw] py-[0.2vw] rounded-[0.3vw] shadow-md backdrop-blur-xs">
                  Trim View: {isTrimView ? 'On' : 'Off'}
                </div>
              </div>
            </div>
          )}

          {/* Auto Save */}
          <div className="relative group/tt flex items-center justify-center">
            <button
              onClick={handleAutoSaveToggle}
              tabIndex={-1}
              aria-label="Toggle Auto Save"
              className={`relative w-[1.9vw] h-[1.9vw] flex items-center justify-center rounded-[0.4vw] cursor-pointer transition-all focus:outline-none group ${
                isAutoSaveEnabled
                  ? 'bg-[#E5E7EB] text-gray-900 shadow-[inset_0_1px_2px_rgba(0,0,0,0.08)] border border-gray-300/60'
                  : 'bg-white text-gray-500 shadow-xs border border-transparent hover:text-gray-800'
              }`}
            >
              <Save size="0.95vw" strokeWidth={2.2} className="group-hover:scale-105 transition-transform" />
            </button>
            <div className="absolute left-1/2 -translate-x-1/2 top-full mt-[0.35vw] hidden group-hover/tt:flex flex-col items-center pointer-events-none z-50 whitespace-nowrap">
              <div className="w-0 h-0 border-x-[0.3vw] border-x-transparent border-b-[0.3vw] border-b-gray-900/90" />
              <div className="bg-gray-900/90 text-white text-[0.65vw] font-medium px-[0.5vw] py-[0.2vw] rounded-[0.3vw] shadow-md backdrop-blur-xs">
                Auto Save: {isAutoSaveEnabled ? 'On' : 'Off'}
              </div>
            </div>
          </div>

          {/* Ruler */}
          {!hideTools && (
            <div className="relative group/tt flex items-center justify-center">
              <button
                onClick={handleRulerToggle}
                tabIndex={-1}
                aria-label="Toggle Ruler"
                className={`relative w-[1.9vw] h-[1.9vw] flex items-center justify-center rounded-[0.4vw] cursor-pointer transition-all focus:outline-none group ${
                  isRulerEnabled
                    ? 'bg-[#E5E7EB] text-gray-900 shadow-[inset_0_1px_2px_rgba(0,0,0,0.08)] border border-gray-300/60'
                    : 'bg-white text-gray-500 shadow-xs border border-transparent hover:text-gray-800'
                }`}
              >
                <Ruler size="0.95vw" strokeWidth={2.2} className="group-hover:scale-105 transition-transform" />
              </button>
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-[0.35vw] hidden group-hover/tt:flex flex-col items-center pointer-events-none z-50 whitespace-nowrap">
                <div className="w-0 h-0 border-x-[0.3vw] border-x-transparent border-b-[0.3vw] border-b-gray-900/90" />
                <div className="bg-gray-900/90 text-white text-[0.65vw] font-medium px-[0.5vw] py-[0.2vw] rounded-[0.3vw] shadow-md backdrop-blur-xs">
                  Ruler: {isRulerEnabled ? 'On' : 'Off'}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center bg-[#F3F4F6] p-[0.28vw] rounded-[0.55vw] gap-[0.1vw]">
          {/* Zoom Out */}
          <div className="relative group/tt flex items-center justify-center">
            <button 
              onClick={onZoomOut}
              tabIndex={-1}
              className="w-[1.9vw] h-[1.9vw] flex items-center justify-center hover:bg-white rounded-[0.4vw] cursor-pointer transition-all hover:shadow-sm text-[#374151] hover:text-black group"
            >
              <Minus size="0.9vw" strokeWidth={2.5} className="group-hover:scale-110 transition-transform" />
            </button>
            <div className="absolute left-1/2 -translate-x-1/2 top-full mt-[0.35vw] hidden group-hover/tt:flex flex-col items-center pointer-events-none z-50 whitespace-nowrap">
              <div className="w-0 h-0 border-x-[0.3vw] border-x-transparent border-b-[0.3vw] border-b-gray-900/90" />
              <div className="bg-gray-900/90 text-white text-[0.65vw] font-medium px-[0.5vw] py-[0.2vw] rounded-[0.3vw] shadow-md backdrop-blur-xs">
                Zoom Out
              </div>
            </div>
          </div>
          
          {/* Zoom Label */}
          <div className="w-[3.4vw] flex-shrink-0 flex items-center justify-center">
            <span className="text-[0.7vw] font-bold text-[#111827] tabular-nums">{Math.round(zoom * 10) / 10}%</span>
          </div>
          
          {/* Zoom In */}
          <div className="relative group/tt flex items-center justify-center">
            <button 
              onClick={onZoomIn}
              tabIndex={-1}
              className="w-[1.9vw] h-[1.9vw] flex items-center justify-center hover:bg-white rounded-[0.4vw] cursor-pointer transition-all hover:shadow-sm text-[#374151] hover:text-black group"
            >
              <Plus size="0.9vw" strokeWidth={2.5} className="group-hover:scale-110 transition-transform" />
            </button>
            <div className="absolute left-1/2 -translate-x-1/2 top-full mt-[0.35vw] hidden group-hover/tt:flex flex-col items-center pointer-events-none z-50 whitespace-nowrap">
              <div className="w-0 h-0 border-x-[0.3vw] border-x-transparent border-b-[0.3vw] border-b-gray-900/90" />
              <div className="bg-gray-900/90 text-white text-[0.65vw] font-medium px-[0.5vw] py-[0.2vw] rounded-[0.3vw] shadow-md backdrop-blur-xs">
                Zoom In
              </div>
            </div>
          </div>
          
          {/* Vertical Divider */}
          <div className="w-[1px] h-[1vw] bg-gray-300 mx-[0.3vw]"></div>
          
          {/* Reset Action */}
          <div className="relative group/tt flex items-center justify-center">
            <button 
              onClick={onReset}
              tabIndex={-1}
              className="w-[1.9vw] h-[1.9vw] flex items-center justify-center hover:bg-white rounded-[0.4vw] cursor-pointer transition-all hover:shadow-sm text-[#374151] hover:text-black group"
            >
              <RotateCcw size="0.9vw" strokeWidth={2.5} className="group-hover:scale-110 transition-transform" />
            </button>
            <div className="absolute left-1/2 -translate-x-1/2 top-full mt-[0.35vw] hidden group-hover/tt:flex flex-col items-center pointer-events-none z-50 whitespace-nowrap">
              <div className="w-0 h-0 border-x-[0.3vw] border-x-transparent border-b-[0.3vw] border-b-gray-900/90" />
              <div className="bg-gray-900/90 text-white text-[0.65vw] font-medium px-[0.5vw] py-[0.2vw] rounded-[0.3vw] shadow-md backdrop-blur-xs">
                Reset Zoom
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopToolbar;
