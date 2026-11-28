import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';
import PremiumDropdown from '../../components/PremiumDropdown';
import { Trash2, Edit2, ChevronsLeft } from 'lucide-react';
import OtherSetup from '../../components/OtherSetup';
import BookmarkStylesPopup from '../../components/BookmarkStylesPopup';
import Switch from '../../components/Switch';
import { fontFamilies } from '../../utils/fontConstants';

// Reusable Section Header
const SectionHeader = ({ title }) => (
  <div className="flex items-center gap-[0.5vw] mt-[1.2vw] mb-[0.8vw]">
    <h4 className="text-[0.9vw] font-semibold text-gray-900 whitespace-nowrap pb-[0.5vw]">{title}</h4>
    <div className="h-[0.0925vw] bg-gray-200 flex-1" style={{ marginRight: '-1vw' }}> </div>
  </div>
);

const Stepper = ({ value, onChange, unit = 's', min = 1, max = 20 }) => (
  <div className="flex items-center gap-[0.4vw]">
    <button
      onClick={(e) => { e.stopPropagation(); onChange(Math.max(min, value - 1)); }}
      className="text-gray-400 hover:text-gray-700 transition-colors"
    >
      <Icon icon="lucide:chevron-left" className="w-[1vw] h-[1vw]" />
    </button>
    <div
      className="w-[3.2vw] h-[2vw] border border-gray-200 rounded-[0.4vw] flex items-center justify-center bg-white cursor-ew-resize select-none text-[0.85vw] text-gray-800 font-semibold shadow-2xs"
      onMouseDown={(e) => {
        e.preventDefault();
        const startX = e.clientX;
        const startVal = value;
        const handleMove = (moveEvent) => {
          const dx = moveEvent.clientX - startX;
          const newVal = Math.max(min, Math.min(max, startVal + Math.round(dx)));
          onChange(newVal);
        };
        const handleUp = () => { window.removeEventListener('mousemove', handleMove); window.removeEventListener('mouseup', handleUp); };
        window.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', handleUp);
      }}
    >
      {value}{unit}
    </div>
    <button
      onClick={(e) => { e.stopPropagation(); onChange(Math.min(max, value + 1)); }}
      className="text-gray-400 hover:text-gray-700 transition-colors"
    >
      <Icon icon="lucide:chevron-right" className="w-[1vw] h-[1vw]" />
    </button>
  </div>
);

const SettingRow = ({ label, children, className = "" }) => (
  <div className={`flex items-center justify-between gap-[1vw] ${className}`}>
    <span className="text-[0.75vw] font-semibold text-gray-700 whitespace-nowrap">{label}</span>
    {children}
  </div>
);

// Menu Item Component (Card Style)
const MenuItem = ({ label, enabled, onChange, hasSettings, isExpanded, onToggleSettings, onRedirect, children }) => (
  <div
    className={`bg-white rounded-[0.8vw] shadow-2xs transition-all duration-300 relative border border-gray-200 ${isExpanded ? 'ring-1 ring-[#EC5137]/40 z-[100] !overflow-visible' : 'z-0 !overflow-visible'}`}
  >
    <div className={`flex items-center justify-between px-[0.5vw] py-[0.8vw] pl-[1vw] pr-[1vw] transition-all duration-300 ${isExpanded ? 'rounded-t-[0.8vw] border-b border-gray-100' : 'rounded-[0.8vw]'}`}>
      <span className="text-[0.75vw] font-medium text-gray-900 whitespace-nowrap">{label}</span>
      <div className="flex items-center gap-[0.75vw]">
        {hasSettings && (
          <button
            onClick={onToggleSettings}
            className={`p-[0.25vw] rounded-[0.7vw] transition-colors ${isExpanded ? 'bg-gray-100 text-[#EC5137]' : 'hover:bg-gray-100 text-gray-400'
              }`}
          >
            <Icon
              icon="tdesign:adjustment-filled"
              className={`w-[1vw] h-[1vw] rotate-90 transition-colors ${isExpanded ? 'text-[#EC5137]' : 'text-gray-400'}`}
            />
          </button>
        )}

        {onRedirect && (
          <button
            onClick={onRedirect}
            className="rounded-[0.7vw] transition-colors hover:bg-gray-100 text-gray-400"
            title="Go to Other Setup"
          >
            <Icon
              icon="lucide:external-link"
              className="w-[1vw] h-[1vw] text-gray-400"
            />
          </button>
        )}

        <Switch enabled={enabled} onChange={onChange} />
      </div>
    </div>
    {children}
  </div>
);

// TOC Item Component for Editor
const TocItem = ({ item, index, isEditing, onUpdate, onDelete, activeTOCItem, setActiveTOCItem, onToggleEdit, onAddHead, onAddSub }) => {
  return (
    <div className="mb-[0.9vw] relative flex gap-[0.5vw]">
      {/* Number Badge */}
      <div className="relative flex flex-col items-center w-[1.4vw] shrink-0 pt-[0.4vw]">
        <div className="w-[1.35vw] h-[1.35vw] rounded-full bg-[#404040] text-white flex items-center justify-center text-[0.75vw] font-semibold z-10 shrink-0">
          {index + 1}
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-[0.4vw]">
        {/* Heading Row */}
        <div
          className="flex items-center gap-[0.4vw] relative"
          onClick={() => {
            setActiveTOCItem({ type: 'head', index });
            if (onToggleEdit) onToggleEdit();
          }}
        >
          <div className="flex-1 relative flex items-center">
            <input
              type="text"
              placeholder={`Heading ${index + 1}`}
              value={item.title || ''}
              onChange={(e) => onUpdate({ ...item, title: e.target.value })}
              className="w-full h-[2.5vw] px-[0.7vw] text-[0.8vw] text-gray-700 bg-white border border-[#D5D8DE] rounded-[0.5vw] focus:border-[#F2562B] placeholder-[#BCC2CF] outline-none shadow-2xs"
            />
          </div>
          <div className="w-[2.2vw] h-[2.5vw] shrink-0 flex items-center justify-center">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={item.page !== undefined && item.page !== null ? String(item.page).replace(/\D/g, '') : ''}
              placeholder={`${index + 1}`}
              onChange={(e) => {
                const numericVal = e.target.value.replace(/\D/g, '');
                onUpdate({ ...item, page: numericVal });
              }}
              onKeyDown={(e) => {
                if (
                  ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key) ||
                  (e.ctrlKey || e.metaKey)
                ) {
                  return;
                }
                if (!/^[0-9]$/.test(e.key)) {
                  e.preventDefault();
                }
              }}
              className="w-full h-full text-center text-[0.8vw] text-gray-700 bg-white border border-[#D5D8DE] rounded-[0.5vw] focus:border-[#F2562B] outline-none shadow-2xs"
            />
          </div>
        </div>

        {/* Subheadings */}
        {item.subheadings && item.subheadings.length > 0 && (
          <div className="relative flex flex-col gap-[0.4vw] ml-[1.6vw]">
            {item.subheadings.map((sub, sIdx) => {
              const isSubActive = activeTOCItem?.type === 'sub' && activeTOCItem?.index === index && activeTOCItem?.sIdx === sIdx;
              const isFirst = sIdx === 0;
              const isLast = sIdx === item.subheadings.length - 1;

              return (
                <div
                  key={sub.id || sIdx}
                  className="flex items-center relative"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTOCItem({ type: 'sub', index, sIdx });
                  }}
                >
                  {/* Dashed connector line */}
                  {isLast ? (
                    /* Last item: corner rounded-bl connector matching screenshot 2 */
                    <div
                      className={`absolute left-[-1.0vw] w-[1.0vw] border-l-[1.5px] border-b-[1.5px] border-dashed border-[#F27A54] rounded-bl-[0.35vw] pointer-events-none ${
                        isFirst ? 'top-[-0.4vw] h-[calc(50%+0.4vw)]' : 'top-[-0.6vw] h-[calc(50%+0.6vw)]'
                      }`}
                    />
                  ) : (
                    /* Non-last items: T-junction line continuing downward */
                    <>
                      <div
                        className={`absolute left-[-1.0vw] border-l-[1.5px] border-dashed border-[#F27A54] pointer-events-none ${
                          isFirst ? 'top-[-0.4vw] bottom-[-0.4vw]' : 'top-[-0.6vw] bottom-[-0.4vw]'
                        }`}
                      />
                      <div className="absolute left-[-1.0vw] top-[50%] w-[1.0vw] border-t-[1.5px] border-dashed border-[#F27A54] pointer-events-none" />
                    </>
                  )}

                  {/* Subheading row: outer container highlights both title & page box with soft pink/peach fill color (no stroke border) */}
                  <div
                    className={`flex-1 flex items-center gap-[0.35vw] p-[0.2vw] rounded-[0.6vw] transition-all ${
                      isSubActive
                        ? 'bg-[#FEECE7]'
                        : 'bg-transparent'
                    }`}
                  >
                    <div className="flex-1 relative flex items-center rounded-[0.45vw] border border-[#D5D8DE] bg-white shadow-2xs">
                      <input
                        type="text"
                        placeholder={`Subheading ${sIdx + 1}`}
                        value={sub.title || ''}
                        onChange={(e) => {
                          const newSubs = [...item.subheadings];
                          newSubs[sIdx] = { ...sub, title: e.target.value };
                          onUpdate({ ...item, subheadings: newSubs });
                        }}
                        className="w-full h-[2.35vw] px-[0.7vw] pr-[1.8vw] text-[0.8vw] text-gray-700 bg-white rounded-[0.45vw] placeholder-[#BCC2CF] outline-none"
                      />

                      {/* Red trash icon inside when active/selected */}
                      {isSubActive && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const newSubs = item.subheadings.filter((_, i) => i !== sIdx);
                            onUpdate({ ...item, subheadings: newSubs });
                          }}
                          className="absolute right-[0.5vw] text-[#EF4444] hover:text-[#DC2626] p-[0.2vw] transition-colors"
                          title="Delete Subheading"
                        >
                          <Trash2 size="0.85vw" strokeWidth={2} />
                        </button>
                      )}
                    </div>

                    <div className="w-[2.2vw] h-[2.35vw] shrink-0 flex items-center justify-center">
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={sub.page !== undefined && sub.page !== null ? String(sub.page).replace(/\D/g, '') : ''}
                        placeholder={(() => {
                          const parentVal = item.page !== undefined && item.page !== null ? String(item.page).replace(/\D/g, '') : '';
                          return parentVal ? parentVal : `${index + 1}`;
                        })()}
                        onChange={(e) => {
                          const numericVal = e.target.value.replace(/\D/g, '');
                          const newSubs = [...item.subheadings];
                          newSubs[sIdx] = { ...sub, page: numericVal };
                          onUpdate({ ...item, subheadings: newSubs });
                        }}
                        onKeyDown={(e) => {
                          if (
                            ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key) ||
                            (e.ctrlKey || e.metaKey)
                          ) {
                            return;
                          }
                          if (!/^[0-9]$/.test(e.key)) {
                            e.preventDefault();
                          }
                        }}
                        className="w-full h-full text-center text-[0.8vw] text-gray-700 bg-white border border-[#D5D8DE] rounded-[0.45vw] outline-none shadow-2xs"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Action Controls: Edit button or (+ Head / + Sub buttons) */}
        {isEditing ? (
          <div className="flex gap-[0.4vw] mt-[0.3vw] justify-end">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddHead();
              }}
              className="bg-black text-white px-[0.7vw] py-[0.3vw] rounded-[0.45vw] text-[0.75vw] font-medium flex items-center justify-center gap-[0.25vw] hover:bg-gray-800 transition-all shadow-sm"
            >
              <Icon icon="lucide:plus" className="w-[0.8vw] h-[0.8vw]" strokeWidth={2.5} /> Head
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddSub();
              }}
              className="bg-black text-white px-[0.7vw] py-[0.3vw] rounded-[0.45vw] text-[0.75vw] font-medium flex items-center justify-center gap-[0.25vw] hover:bg-gray-800 transition-all shadow-sm"
            >
              <Icon icon="lucide:plus" className="w-[0.8vw] h-[0.8vw]" strokeWidth={2.5} /> Sub
            </button>
          </div>
        ) : (
          <div className="flex justify-end pt-[0.1vw]">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleEdit();
              }}
              className="text-gray-500 hover:text-gray-800 transition-colors p-[0.2vw]"
              title="Edit TOC"
            >
              <Edit2 size="0.95vw" strokeWidth={2} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};


const MenuBar = ({ onBack, settings, onUpdate, otherSettings, onUpdateOther, bookAppearanceSettings, pages = [], folderName, bookName, onTocSettingsClick }) => {
  const [expandedSection, setExpandedSection] = useState(null);
  const [activeTOCItem, setActiveTOCItem] = useState(null); // { type: 'head'|'sub', index, sIdx }
  
  const isPdfProject = pages?.some(p => p.html && p.html.includes('data-name="PDF Background"'));
  const activeTocSettings = settings?.tocSettings || settings?.navigation?.tocSettings || {};
  const [editingTOCIndex, setEditingTOCIndex] = useState((activeTocSettings.content?.length || 0) > 0 ? 0 : null);

  const toggleSection = (section) => {
    const willOpen = expandedSection !== section;
    setExpandedSection(willOpen ? section : null);
    // Notify parent when TOC settings panel opens so it can show the TOC popup
    if (section === 'toc' && willOpen && onTocSettingsClick) {
      onTocSettingsClick();
    }
    // Trigger right side gallery popup when Gallery settings panel opens
    if (section === 'gallery' && willOpen && onUpdateOther) {
      onUpdateOther(prev => ({
        ...prev,
        gallery: {
          ...(prev?.gallery || {}),
          previewOpen: Date.now()
        }
      }));
    }
  };

  const updateSection = (section, field, value) => {
    onUpdate(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] || {}),
        [field]: value
      }
    }));
  };

  const updateNestedSetting = (section, nestedObject, field, value) => {
    onUpdate(prev => {
      const sectionState = prev[section] || {};
      const nestedState = sectionState[nestedObject] || {};
      const newNestedState = { ...nestedState, [field]: value };
      return {
        ...prev,
        [section]: {
          ...sectionState,
          [nestedObject]: newNestedState
        },
        [nestedObject]: newNestedState
      };
    });
  };

  // Helper for direct property updates in settings root (like tocSettings which is separate)
  const updateRootSetting = (rootKey, field, value) => {
    if (rootKey === 'tocSettings' && onTocSettingsClick) {
      onTocSettingsClick();
    }
    
    onUpdate(prev => {
      const currentRoot = prev[rootKey] || (prev.navigation && prev.navigation[rootKey]) || {};
      const newRoot = { ...currentRoot, [field]: value };
      const currentNav = prev.navigation || {};
      
      let updatedNav = {
        ...currentNav,
        [rootKey]: newRoot
      };

      if (rootKey === 'tocSettings') {
        updatedNav.tableOfContents = true;
      }
      
      return {
        ...prev,
        [rootKey]: newRoot,
        navigation: updatedNav
      };
    });
  };

  return (
    <div className="flex flex-col h-full bg-transparent text-gray-800 relative overflow-visible">
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Sub-header */}
      <div className="h-[7.5vh] flex items-center justify-between px-[1.2vw] border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-[0.75vw] text-gray-800">
          <Icon icon="fluent:layout-row-two-settings-24-regular" className="w-[1.4vw] h-[1.4vw] text-black" />
          <h2 className="text-[1vw] font-semibold text-gray-900">Layout Settings</h2>
        </div>
        {onBack && (
          <button
            onClick={onBack}
            className="w-[2vw] h-[2vw] rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-all active:scale-90"
          >
            <ChevronsLeft className="w-[1.2vw] h-[1.2vw]" strokeWidth={2.2} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-[1vw] pb-[1vw] hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>


        {/* Navigation Controls Section */}
        <SectionHeader title="Navigation Controls" />
        <div className="space-y-[0.325vw]">
          <MenuItem
            label="Show Icon Labels"
            enabled={otherSettings?.toolbar?.addTextBelowIcons ?? false}
            hasSettings={true}
            isExpanded={expandedSection === 'addTextToIcons'}
            onToggleSettings={() => toggleSection('addTextToIcons')}
            onChange={(val) => {
              updateSection('navigation', 'addTextToIcons', val);
              if (onUpdateOther) {
                onUpdateOther(prev => ({
                  ...prev,
                  toolbar: {
                    ...(prev?.toolbar || {}),
                    addTextBelowIcons: val
                  }
                }));
              }
            }}
          >
            <AnimatePresence>
              {expandedSection === 'addTextToIcons' && (
                <motion.div
                  initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
                  animate={{ 
                    height: 'auto', 
                    opacity: 1,
                    transitionEnd: { overflow: 'visible' }
                  }}
                  exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
                  transition={{ duration: 0.3 }}
                  className="bg-gray-50/50 rounded-b-[0.8vw] relative z-10 !overflow-visible"
                >
                  <div className="px-[1.25vw] pb-[1vw] pt-0 border-t border-gray-50">
                    <div className="flex items-center justify-between gap-[0.5vw] mt-[1vw]">
                      <span className="text-[0.75vw] font-medium text-gray-700 whitespace-nowrap">Text style :</span>
                      <PremiumDropdown
                        options={fontFamilies}
                        value={settings?.navigation?.addTextToIconsSettings?.font || settings?.addTextToIconsSettings?.font || otherSettings?.toolbar?.textProperties?.font || 'Arial'}
                        onChange={(val) => {
                          updateNestedSetting('navigation', 'addTextToIconsSettings', 'font', val);
                          if (onUpdateOther) {
                            onUpdateOther(prev => ({
                              ...prev,
                              toolbar: {
                                ...(prev?.toolbar || {}),
                                textProperties: { ...(prev?.toolbar?.textProperties || {}), font: val }
                              }
                            }));
                          }
                        }}
                        width="10vw"
                        className="shrink-0"
                        isFont={true}
                        buttonClassName="!border-gray-600 !rounded-[0.5vw]"
                        align="right"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </MenuItem>
          <MenuItem
            label="Next / Preview Buttons"
            enabled={settings.navigation?.nextPrevButtons}
            onChange={(val) => updateSection('navigation', 'nextPrevButtons', val)}
          />
          <MenuItem
            label="Mouse Wheel Navigation"
            enabled={settings.navigation?.mouseWheel}
            onChange={(val) => updateSection('navigation', 'mouseWheel', val)}
          />
          <MenuItem
            label="Drag to Turn Pages"
            enabled={settings.navigation?.dragToTurn}
            onChange={(val) => updateSection('navigation', 'dragToTurn', val)}
          />
          <MenuItem
            label="Page Quick Access"
            enabled={settings.navigation?.pageQuickAccess}
            onChange={(val) => updateSection('navigation', 'pageQuickAccess', val)}
          />

          {/* Table of Contents with Settings */}
          <MenuItem
            label="Table of Contents"
            enabled={settings.navigation?.tableOfContents ?? true}
            hasSettings={true}
            isExpanded={expandedSection === 'toc'}
            onToggleSettings={() => toggleSection('toc')}
            onChange={(val) => updateSection('navigation', 'tableOfContents', val)}
          >
            <AnimatePresence>
              {expandedSection === 'toc' && (
                <motion.div
                  initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
                  animate={{
                    height: 'auto',
                    opacity: 1,
                    transitionEnd: { overflow: 'visible' }
                  }}
                  exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
                  className="border-t border-gray-200 bg-gray-50/50 relative z-10 !overflow-visible rounded-b-[0.8vw]"
                >
                  <div className={`p-[1vw] ${!(settings.navigation?.tableOfContents ?? true) ? 'opacity-50 pointer-events-none select-none' : ''}`}>
                    <div className="space-y-[0.85vw] mb-[1.5vw]">
                      <div className="flex items-center justify-between">
                        <span className="text-[0.75vw] font-semibold text-gray-700">Add Search to the TOC</span>
                        <Switch
                          enabled={Boolean(activeTocSettings.addSearch)}
                          onChange={(val) => updateRootSetting('tocSettings', 'addSearch', val)}
                          variant="secondary"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[0.75vw] font-semibold text-gray-700">Add Page Number to the TOC</span>
                        <Switch
                          enabled={Boolean(activeTocSettings.addPageNumber)}
                          onChange={(val) => updateRootSetting('tocSettings', 'addPageNumber', val)}
                          variant="secondary"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[0.75vw] font-semibold text-gray-700">Add Serial Number to the Heading</span>
                        <Switch
                          enabled={Boolean(activeTocSettings.addSerialNumberHeading)}
                          onChange={(val) => updateRootSetting('tocSettings', 'addSerialNumberHeading', val)}
                          variant="secondary"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[0.75vw] font-semibold text-gray-700">Add Serial Number to the Subheading</span>
                        <Switch
                          enabled={Boolean(activeTocSettings.addSerialNumberSubheading)}
                          onChange={(val) => updateRootSetting('tocSettings', 'addSerialNumberSubheading', val)}
                          variant="secondary"
                        />
                      </div>
                      <div className="flex items-center justify-between mt-[0.85vw]">
                        <span className="text-[0.75vw] font-semibold text-gray-700">Read TOC with Male Voice</span>
                        <Switch
                          enabled={Boolean(activeTocSettings.useMaleVoice)}
                          onChange={(val) => updateRootSetting('tocSettings', 'useMaleVoice', val)}
                          variant="secondary"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-[0.8vw] mb-[1.2vw] pr-[0.4vw]">
                      <h5 className="text-[0.75vw] font-semibold text-gray-700">TOC Content</h5>
                      <div className="h-[0.0925vw] bg-gray-200 flex-1" style={{ marginRight: '-1.4vw' }}> </div>
                    </div>

                    <div
                      className="space-y-[0.2vw] max-h-[30vw] overflow-y-auto pr-[0.4vw] hide-scrollbar"
                      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                      {activeTocSettings.content?.map((item, idx) => (
                        <TocItem
                          key={item.id || idx}
                          item={item}
                          index={idx}
                          isEditing={editingTOCIndex === idx}
                          onUpdate={(updatedItem) => {
                            const newContent = [...(activeTocSettings.content || [])];
                            newContent[idx] = updatedItem;
                            updateRootSetting('tocSettings', 'content', newContent);
                          }}
                          onDelete={() => {
                            const newContent = (activeTocSettings.content || []).filter((_, i) => i !== idx);
                            updateRootSetting('tocSettings', 'content', newContent);
                            if (editingTOCIndex === idx) setEditingTOCIndex(newContent.length > 0 ? 0 : null);
                          }}
                          activeTOCItem={activeTOCItem}
                          setActiveTOCItem={setActiveTOCItem}
                          onToggleEdit={() => {
                            setEditingTOCIndex(idx);
                            setActiveTOCItem({ type: 'head', index: idx });
                          }}
                          onAddHead={() => {
                            const content = activeTocSettings.content || [];
                            const nextIdx = idx + 1;
                            const newContent = [...content];
                            newContent.splice(nextIdx, 0, {
                              id: Date.now(),
                              title: `Heading ${content.length + 1}`,
                              page: `${nextIdx + 1}`,
                              subheadings: []
                            });
                            updateRootSetting('tocSettings', 'content', newContent);
                            setActiveTOCItem({ type: 'head', index: nextIdx });
                            setEditingTOCIndex(nextIdx);
                          }}
                          onAddSub={() => {
                            const content = activeTocSettings.content || [];
                            if (content.length > 0) {
                              const newContent = [...content];
                              const targetItem = newContent[idx];
                              const parentPage = targetItem.page ? String(targetItem.page).replace(/\D/g, '') : `${idx + 1}`;
                              const updatedItem = {
                                ...targetItem,
                                subheadings: [...(targetItem.subheadings || []), {
                                  id: Date.now() + 1,
                                  title: `Subheading ${(targetItem.subheadings || []).length + 1}`,
                                  page: parentPage
                                }]
                              };
                              newContent[idx] = updatedItem;
                              updateRootSetting('tocSettings', 'content', newContent);
                              setActiveTOCItem({
                                type: 'sub',
                                index: idx,
                                sIdx: updatedItem.subheadings.length - 1
                              });
                            }
                          }}
                        />
                      ))}
                      {(activeTocSettings.content?.length || 0) === 0 && (
                        <div className="flex justify-center py-[1vw]">
                          <button
                            onClick={() => {
                              const newContent = [{ id: Date.now(), title: 'Heading 1', page: '1', subheadings: [] }];
                              updateRootSetting('tocSettings', 'content', newContent);
                              setEditingTOCIndex(0);
                              setActiveTOCItem({ type: 'head', index: 0 });
                            }}
                            className="bg-black text-white px-[1.5vw] py-[0.5vw] rounded-lg text-[0.85vw] font-semibold flex items-center gap-[0.5vw] hover:bg-gray-800 transition-all"
                          >
                            <Icon icon="lucide:plus" className="w-[1vw] h-[1vw]" strokeWidth={3} /> Add Heading
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Footer Save Button */}
                    <div className="flex justify-end pt-[1vw] border-t border-gray-200 mt-[1vw]">
                      <button
                        onClick={() => toggleSection('toc')}
                        className="bg-[#EF4444] hover:bg-[#DC2626] text-white px-[1.8vw] py-[0.45vw] rounded-[0.5vw] text-[0.85vw] font-medium transition-all shadow-md active:scale-95"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </MenuItem>

          <MenuItem
            label="Page Thumbnails"
            enabled={settings.navigation?.pageThumbnails ?? true}
            onChange={(val) => updateSection('navigation', 'pageThumbnails', val)}
          />

          <MenuItem
            label="First / Last Page Buttons"
            enabled={settings.navigation?.startEndNav ?? true}
            onChange={(val) => updateSection('navigation', 'startEndNav', val)}
          />
        </div>

        {/* Playback & Audio Section */}
        <SectionHeader title="Playback & Audio" />
        <div className="space-y-[0.325vw]">
          <MenuItem
            label="Auto Flip Features"
            enabled={settings.media?.autoFlip}
            hasSettings={true}
            isExpanded={expandedSection === 'autoFlip'}
            onToggleSettings={() => toggleSection('autoFlip')}
            onChange={(val) => updateSection('media', 'autoFlip', val)}
          >
            <AnimatePresence>
              {expandedSection === 'autoFlip' && (
                <motion.div
                  initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
                  animate={{
                    height: 'auto',
                    opacity: 1,
                    transitionEnd: { overflow: 'visible' }
                  }}
                  exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
                  className="border-t border-gray-200 bg-gray-50/50 relative z-10 !overflow-visible"
                >
                  <div className="p-[1vw]">
                    <div className="space-y-[0.85vw]">
                      <SettingRow label="Auto Flip Duration">
                        <Stepper
                          value={settings.media?.autoFlipSettings?.duration || 5}
                          onChange={(val) => updateNestedSetting('media', 'autoFlipSettings', 'duration', val)}
                        />
                      </SettingRow>
                      <SettingRow label="Next Flip Countdown">
                        <Switch
                          enabled={settings.media?.autoFlipSettings?.countdown ?? false}
                          onChange={(val) => updateNestedSetting('media', 'autoFlipSettings', 'countdown', val)}
                          variant="secondary"
                        />
                      </SettingRow>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </MenuItem>
          <MenuItem
            label="Audio Controls"
            enabled={settings?.media?.backgroundAudio ?? settings?.media?.audio ?? true}
            hasSettings={true}
            isExpanded={expandedSection === 'sound'}
            onToggleSettings={() => toggleSection('sound')}
            onChange={(val) => {
              updateSection('media', 'backgroundAudio', val);
              updateSection('media', 'audio', val);
              // Master off also stops background music; master on does NOT force background music on
              // (it is opt-in). If master is switched on while both sounds are off, bring back the
              // flip sound so "Audio Features on" always means at least one sound is on.
              if (onUpdateOther) {
                onUpdateOther(prev => {
                  const snd = prev?.sound || {};
                  if (!val) return { ...prev, sound: { ...snd, bgSoundEnabled: false } };
                  if (snd.flipSoundEnabled === false && snd.bgSoundEnabled !== true) {
                    return { ...prev, sound: { ...snd, flipSoundEnabled: true } };
                  }
                  return prev;
                });
              }
            }}
          >
            <AnimatePresence>
              {expandedSection === 'sound' && (
                <motion.div
                  initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
                  animate={{ 
                    height: 'auto', 
                    opacity: 1,
                    transitionEnd: { overflow: 'visible' }
                  }}
                  exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
                  transition={{ duration: 0.3 }}
                  className="bg-gray-50/50 rounded-b-[0.8vw] relative z-10 !overflow-visible"
                >
                  <div className="border-t border-gray-50">
                    <OtherSetup 
                      inlineMode="sound" 
                      settings={otherSettings} 
                      onUpdate={onUpdateOther} 
                      bookAppearanceSettings={bookAppearanceSettings}
                      folderName={folderName} 
                      bookName={bookName} 
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </MenuItem>
        </div>

        {/* Viewing Controls Section */}
        <SectionHeader title="Viewing Controls" />
        <div className="space-y-[0.325vw]">
          <MenuItem
            label="Zoom In / Out Button"
            enabled={settings.viewing?.zoom}
            hasSettings={true}
            isExpanded={expandedSection === 'zoom'}
            onToggleSettings={() => toggleSection('zoom')}
            onChange={(val) => updateSection('viewing', 'zoom', val)}
          >
            <AnimatePresence>
              {expandedSection === 'zoom' && (
                <motion.div
                  initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
                  animate={{
                    height: 'auto',
                    opacity: 1,
                    transitionEnd: { overflow: 'visible' }
                  }}
                  exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
                  className="border-t border-gray-200 bg-gray-50/50 relative z-10 !overflow-visible rounded-b-[0.8vw]"
                >
                  <div className="p-[1vw]">
                    <div className="space-y-[0.85vw]">
                      <SettingRow label="Set Maximum Zoom">
                        <Stepper
                          value={settings.toolbar?.maximumZoom || 4}
                          unit="x"
                          min={1}
                          max={3}
                          onChange={(val) => updateRootSetting('toolbar', 'maximumZoom', val)}
                        />
                      </SettingRow>
                      <SettingRow label="Double tap to Zoom at Max">
                        <Switch
                          enabled={settings.toolbar?.twoClickToZoom ?? true}
                          onChange={(val) => updateRootSetting('toolbar', 'twoClickToZoom', val)}
                          variant="secondary"
                        />
                      </SettingRow>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </MenuItem>
          <MenuItem
            label="Full Screen View"
            enabled={settings.viewing?.fullScreen}
            onChange={(val) => updateSection('viewing', 'fullScreen', val)}
          />
        </div>

        {/* Interactive Features Section */}
        <SectionHeader title="Interactive Features" />
        <div className="space-y-[0.325vw]">
          {!isPdfProject && (
            <MenuItem
              label="Search Inside Book"
              enabled={settings.interaction?.search}
              onChange={(val) => updateSection('interaction', 'search', val)}
            />
          )}

          <MenuItem
            label="Gallery"
            enabled={settings.interaction?.gallery}
            hasSettings={true}
            isExpanded={expandedSection === 'gallery'}
            onToggleSettings={() => toggleSection('gallery')}
            onChange={(val) => updateSection('interaction', 'gallery', val)}
          >
            <AnimatePresence>
              {expandedSection === 'gallery' && (
                <motion.div
                  initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
                  animate={{ 
                    height: 'auto', 
                    opacity: 1,
                    transitionEnd: { overflow: 'visible' }
                  }}
                  exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
                  transition={{ duration: 0.3 }}
                  className="bg-gray-50/50 rounded-b-[0.8vw] relative z-10 !overflow-visible"
                >
                  <div className="border-t border-gray-50">
                    <OtherSetup 
                      inlineMode="gallery" 
                      settings={otherSettings} 
                      onUpdate={onUpdateOther} 
                      folderName={folderName} 
                      bookName={bookName} 
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </MenuItem>

          {/* Bookmark */}
          <MenuItem
            label="Bookmark"
            enabled={settings.navigation?.bookmark}
            hasSettings={true}
            isExpanded={expandedSection === 'bookmark'}
            onToggleSettings={() => toggleSection('bookmark')}
            onChange={(val) => updateSection('navigation', 'bookmark', val)}
          >
            <AnimatePresence>
              {expandedSection === 'bookmark' && (
                <motion.div
                  initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
                  animate={{ 
                    height: 'auto', 
                    opacity: 1,
                    transitionEnd: { overflow: 'visible' }
                  }}
                  exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
                  transition={{ duration: 0.3 }}
                  className="bg-gray-50/50 rounded-b-[0.8vw] relative z-10 !overflow-visible"
                >
                  <div className={`px-[1.25vw] pb-[1vw] pt-0 border-t border-gray-50 ${!settings.navigation?.bookmark ? 'opacity-50 pointer-events-none select-none' : ''}`}>
                    <BookmarkStylesPopup
                      settings={settings}
                      onUpdate={onUpdate}
                      pages={pages}
                      onClose={() => toggleSection('bookmark')}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </MenuItem>
        </div>

        {/* Sharing & Download Section */}
        <SectionHeader title="Sharing & Download" />
        <div className="space-y-[0.325vw]">
          <MenuItem
            label="Share"
            enabled={settings.shareExport?.share}
            onChange={(val) => updateSection('shareExport', 'share', val)}
          />
          <MenuItem
            label="Download"
            enabled={settings.shareExport?.download}
            onChange={(val) => updateSection('shareExport', 'download', val)}
          />
        </div>

        {/* Branding Section */}
        <SectionHeader title="Branding" />
        <div className="space-y-[0.325vw]">
          <MenuItem
            label="Logo"
            enabled={settings.brandingProfile?.logo}
            onChange={(val) => updateSection('brandingProfile', 'logo', val)}
          />
        </div>
      </div>
      {/* Extra padding to allow dropdown menus to scroll into view */}
      <div className="h-[0.1vw] shrink-0 pointer-events-none" />
    </div>
  );
};

export const LayoutSettingsPanel = MenuBar;
export { MenuBar };
export default LayoutSettingsPanel;
