import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import BlueShelf from '../Shelves/BlueShelf';
import BlueRopeShelf from '../Shelves/BlueRopeShelf';
import WindowShelf from '../Shelves/WindowShelf';
import PlantLightShelf from '../Shelves/PlantLightShelf';
import LightShelf from '../Shelves/LightShelf';
import GreenLightShelf from '../Shelves/GreenLightShelf';
import GreenShelf from '../Shelves/GreenShelf';
import OrangeShelf from '../Shelves/OrangeShelf';
import GoldenShelf from '../Shelves/GoldenShelf';
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
  listFrame,
} from '../constants';

const ShelfDetailView = ({
  view,
  setCurrentView,
  isEditingShelfName,
  setIsEditingShelfName,
  editingShelfNameValue,
  setEditingShelfNameValue,
  handleSaveShelfName,
  selectedFolder,
  activeShelfStyle,
  setActiveShelfStyle,
  isShelfFullscreen,
  toggleShelfFullscreen,
  setShowShareShelfModal,
  applyShelfStyle,
  activeAssets,
  newTopOffset,
  newSpacing,
  isLoading,
  filteredBooks = [],
  folders = [],
  handleFlipbookSelect,
  selectedStatus,
  setSelectedStatus,
  openMenuId,
  setOpenMenuId,
  hoveredInfoId,
  setHoveredInfoId,
  draggedBookIndex,
  handleDragStart,
  handleDragOver,
  handleDrop,
  handleDragEnd,
  handleRemoveBook,
  setSelectedBookIdsToAdd,
  setAddBookSearch,
  setShowAddBookModal,
  LazyPreview,
  backendUrl,
  currentUserEmail,
  decors,
  setDecors,
  showLightSwitch,
  lightOpacity,
  selectedLightTheme,
  selectedWallTheme,
  setSelectedWallTheme,
  shelfLogo,
  setShowLogoModal,
  logoOpacity,
  logoFixType,
  selectedBookCountFilter,
  setSelectedBookCountFilter,
  shelfStylesPage,
  setShelfStylesPage,
}) => {
  const [listDropdown, setListDropdown] = useState(null);

  if (view === 'shelf') {
    return (
      <div className="flex-1 flex flex-col justify-between min-w-0 h-full">
        {/* Shelf View Header scoped to Shelf width */}
        <div className="flex flex-col mb-3 w-full -mt-1">
          {/* Back to My Shelf Link */}
          <div className="flex items-center gap-2 mb-1">
            <button
              onClick={() => setCurrentView('overview')}
              className="flex items-center gap-1 text-[#FF5733] hover:text-[#E04D2D] text-xs font-semibold transition-colors"
            >
              <Icon icon="lucide:chevron-left" className="w-4 h-4" />
              <span>My Shelf</span>
            </button>
          </div>

          {/* Title Row aligned straight with Action Buttons at the shelf right edge */}
          <div className="w-full">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                {isEditingShelfName ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={editingShelfNameValue}
                      onChange={(e) => setEditingShelfNameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveShelfName();
                        if (e.key === 'Escape') setIsEditingShelfName(false);
                      }}
                      autoFocus
                      className="text-xl font-bold text-gray-900 border-b-2 border-[#FF5733] bg-transparent outline-none px-1 py-0.5"
                    />
                    <button
                      onClick={handleSaveShelfName}
                      className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded"
                      title="Save name"
                    >
                      <Icon icon="lucide:check" className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setIsEditingShelfName(false)}
                      className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                      title="Cancel"
                    >
                      <Icon icon="lucide:x" className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight leading-none">
                      {selectedFolder || (activeShelfStyle === 'customize_golden' ? 'Golden Shelf' : activeShelfStyle === 'customize_orange' ? 'Orange Shelf' : activeShelfStyle === 'customize_windowshelf' ? 'Window Shelf' : activeShelfStyle === 'customize_bluerope' ? 'Blue Rope Shelf' : activeShelfStyle === 'customize_plantlight' ? 'Plant-Light Shelf' : activeShelfStyle === 'customize_light' ? 'Light Shelf' : activeShelfStyle === 'customize_greenlight' ? 'Green-Light Shelf' : activeShelfStyle === 'customize_green' ? 'Green Shelf' : 'My Shelf')}
                    </h2>
                    <button
                      onClick={() => {
                        setEditingShelfNameValue(selectedFolder || '');
                        setIsEditingShelfName(true);
                      }}
                      className="text-gray-400 hover:text-[#FF5733] transition-colors p-0.5 cursor-pointer"
                      title="Rename shelf"
                    >
                      <Icon icon="lucide:edit-3" className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={toggleShelfFullscreen}
                  className="flex items-center justify-center p-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-all"
                  title={isShelfFullscreen ? "Exit Fullscreen" : "Fullscreen Shelf"}
                >
                  <Icon icon={isShelfFullscreen ? "lucide:minimize" : "lucide:maximize"} className="w-3.5 h-3.5 text-gray-600" />
                </button>

                <button
                  onClick={() => setShowShareShelfModal(true)}
                  className="flex items-center gap-2 px-3.5 py-1.5 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-all"
                >
                  <Icon icon="lucide:share-2" className="w-3.5 h-3.5 text-gray-600" />
                  <span>Share Shelf</span>
                </button>

                <button
                  onClick={applyShelfStyle}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-[#FF5733] hover:bg-[#E04D2D] active:scale-95 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
                >
                  <Icon icon="lucide:check" className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Fullscreen Mode */}
        {isShelfFullscreen ? (
          <div
            className="fixed inset-0 z-[99999] w-screen h-screen overflow-hidden"
            style={{
              backgroundImage: (!Array.isArray(activeAssets.bg) && activeAssets.bg) ? `url('${activeAssets.bg}')` : 'none',
              backgroundSize: '100% 100%',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
            }}
          >
            {/* Exit Fullscreen Button */}
            <button
              type="button"
              onClick={toggleShelfFullscreen}
              className="absolute top-4 right-4 z-50 bg-black/60 hover:bg-black/85 text-white px-3 py-2 rounded-xl backdrop-blur-md transition-all shadow-lg flex items-center gap-2 group cursor-pointer border border-white/15"
              title="Exit Full Screen (Esc)"
            >
              <Icon
                icon="lucide:minimize-2"
                className="w-4 h-4 text-white/90 group-hover:text-white group-hover:scale-110 transition-transform"
              />
              <span className="text-xs font-semibold tracking-wide">Exit Full Screen</span>
            </button>

            {isLoading && (
              <div className="absolute inset-0 z-50 flex gap-2 items-center justify-center bg-white/50 backdrop-blur-sm">
                <Icon icon="eos-icons:loading" className="w-8 h-8 text-blue-600" />
                <span className="text-base font-semibold text-gray-700">Shelf Loading...</span>
              </div>
            )}

            {/* If bg is an array, map over it to render wall blocks */}
            {Array.isArray(activeAssets.bg) && (
              <div className="absolute inset-0 flex flex-col rounded-xl overflow-hidden pointer-events-none">
                {Array.from({ length: activeAssets.rowCount }, (_, i) => (
                  <div
                    key={i}
                    className="w-full flex-1 bg-center"
                    style={{
                      backgroundImage: `url('${activeAssets.bg[i % activeAssets.bg.length]}')`,
                      backgroundSize: activeAssets.bgStretch ? '100% 100%' : '100% auto',
                      backgroundRepeat: activeAssets.bgStretch ? 'no-repeat' : 'repeat',
                      backgroundPosition: 'center',
                    }}
                  />
                ))}
              </div>
            )}

            {openMenuId && (
              <div
                className="fixed inset-0 z-20"
                onClick={() => setOpenMenuId(null)}
              />
            )}

            {activeAssets.type === 'rows' && activeAssets.rowAsset && (
              <div className="absolute inset-0 w-full h-full">
                {Array.from({ length: activeAssets.rowCount }, (_, i) => (
                  <div
                    key={i}
                    className={`absolute left-0 w-full ${activeAssets.rowPadding ? '' : (activeAssets.padding || 'px-12')}`}
                    style={{
                      top: `${newTopOffset + (i * newSpacing) - (activeShelfStyle === 'customize2' && i !== activeAssets.rowCount - 1 ? 3.5 : 0)}%`,
                      padding: activeAssets.rowPadding || undefined
                    }}
                  >
                    <div className="relative w-full">
                      {!(activeShelfStyle === 'customize2' && i === activeAssets.rowCount - 1) && (
                        <img src={activeAssets.rowAsset} alt="Shelf" className="w-full h-auto drop-shadow-lg" />
                      )}
                      {activeAssets.rowShadow && (
                        <img src={activeAssets.rowShadow} alt="Shelf Shadow" className="w-full h-auto -mt-[1%] opacity-90 drop-shadow-md" />
                      )}
                      {/* Books Container */}
                      {!activeAssets.hideBooks && (
                        <div
                          className={`absolute inset-x-0 flex items-end ${activeAssets.justify || 'justify-between'}`}
                          style={activeAssets.bookStyle || { bottom: '15%', padding: '0 5%' }}
                        >
                          {(() => {
                            const booksPerRow = activeShelfStyle === 'customize4' ? 4 : 6;
                            const rowBooks = filteredBooks.slice(i * booksPerRow, (i + 1) * booksPerRow) || [];
                            const paddedBooks = [...rowBooks, ...Array.from({ length: booksPerRow - rowBooks.length }).fill(null)];

                            return paddedBooks.map((book, bIdx) => {
                              const bookIndex = i * booksPerRow + bIdx;
                              if (!book) {
                                return (
                                  <div
                                    key={`fs-empty-${i}-${bIdx}`}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, bookIndex)}
                                    className={`relative flex justify-center items-end ${activeShelfStyle === 'customize2' ? (i === activeAssets.rowCount - 1 ? 'translate-y-4' : 'translate-y-0') : activeShelfStyle === 'customize4' ? 'translate-y-0' : 'translate-y-2'}`}
                                    style={{ width: activeAssets.bookWidth || '12%' }}
                                  >
                                    {activeShelfStyle === 'customize4' ? (
                                      <div
                                        onClick={() => {
                                          setSelectedBookIdsToAdd([]);
                                          setAddBookSearch('');
                                          setShowAddBookModal(true);
                                        }}
                                        className="w-full aspect-[2.5/3.25] rounded-[6px] border border-dashed border-white/60 hover:border-white transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer group bg-white/10 hover:bg-white/15 backdrop-blur-[1px]"
                                        title="Add Book"
                                      >
                                        <div className="relative flex items-center justify-center text-white transition-transform group-hover:scale-110">
                                          <Icon icon="mdi:book-open-outline" className="w-5 h-5 text-white/90" />
                                          <span className="absolute -bottom-1 -right-1 text-[10px] font-black text-white leading-none">+</span>
                                        </div>
                                        <span className="text-[9px] font-medium text-white/90 group-hover:text-white tracking-wide">
                                          Add Book
                                        </span>
                                      </div>
                                    ) : null}
                                  </div>
                                );
                              }

                              return (
                                <div
                                  key={book.v_id || `fs-book-${bIdx}`}
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, bookIndex)}
                                  onDragOver={handleDragOver}
                                  onDrop={(e) => handleDrop(e, bookIndex)}
                                  onDragEnd={handleDragEnd}
                                  className={`relative group cursor-pointer flex justify-center items-end ${activeShelfStyle === 'customize2' ? (i === activeAssets.rowCount - 1 ? 'translate-y-4' : 'translate-y-0') : activeShelfStyle === 'customize4' ? 'translate-y-0' : 'translate-y-2'} ${openMenuId === `fs-${i}-${bIdx}` ? 'z-40' : 'hover:z-30'} ${draggedBookIndex === bookIndex ? 'opacity-50' : ''}`}
                                  style={{ width: activeAssets.bookWidth || '12%' }}
                                >
                                  <div className={`w-[100%] ${activeShelfStyle === 'customize4' ? 'aspect-[2.5/3.25]' : 'aspect-[2.5/3.5]'} relative rounded-[3px] drop-shadow-md transition-transform origin-bottom group-hover:scale-105 overflow-hidden`}>
                                    <LazyPreview
                                      v_id={book.v_id}
                                      emailId={book.rawBook?.userEmail || currentUserEmail}
                                      backendUrl={backendUrl}
                                      iframeBaseUrl=""
                                      title={book.title}
                                      imageUrl={null}
                                    />
                                  </div>
                                </div>
                              );
                            });
                          })()}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeAssets.type === 'green_shelf' && (
              <GreenShelf
                filteredBooks={filteredBooks}
                decors={decors}
                setDecors={setDecors}
                showLightSwitch={showLightSwitch}
                lightOpacity={lightOpacity}
                selectedLightTheme={selectedLightTheme}
                selectedWallTheme={selectedWallTheme}
                openMenuId={openMenuId}
                setOpenMenuId={setOpenMenuId}
                hoveredInfoId={hoveredInfoId}
                setHoveredInfoId={setHoveredInfoId}
                draggedBookIndex={draggedBookIndex}
                handleDragStart={handleDragStart}
                handleDragOver={handleDragOver}
                handleDrop={handleDrop}
                handleDragEnd={handleDragEnd}
                handleRemoveBook={handleRemoveBook}
                setSelectedBookIdsToAdd={setSelectedBookIdsToAdd}
                setAddBookSearch={setAddBookSearch}
                setShowAddBookModal={setShowAddBookModal}
                LazyPreview={LazyPreview}
                backendUrl={backendUrl}
                currentUserEmail={currentUserEmail}
              />
            )}

            {activeAssets.type === 'green_light_shelf' && (
              <GreenLightShelf
                filteredBooks={filteredBooks}
                decors={decors}
                setDecors={setDecors}
                showLightSwitch={showLightSwitch}
                lightOpacity={lightOpacity}
                selectedLightTheme={selectedLightTheme}
                selectedWallTheme={selectedWallTheme}
                openMenuId={openMenuId}
                setOpenMenuId={setOpenMenuId}
                hoveredInfoId={hoveredInfoId}
                setHoveredInfoId={setHoveredInfoId}
                draggedBookIndex={draggedBookIndex}
                handleDragStart={handleDragStart}
                handleDragOver={handleDragOver}
                handleDrop={handleDrop}
                handleDragEnd={handleDragEnd}
                handleRemoveBook={handleRemoveBook}
                setSelectedBookIdsToAdd={setSelectedBookIdsToAdd}
                setAddBookSearch={setAddBookSearch}
                setShowAddBookModal={setShowAddBookModal}
                LazyPreview={LazyPreview}
                backendUrl={backendUrl}
                currentUserEmail={currentUserEmail}
              />
            )}

            {activeAssets.type === 'light_shelf' && (
              <LightShelf
                filteredBooks={filteredBooks}
                decors={decors}
                setDecors={setDecors}
                showLightSwitch={showLightSwitch}
                lightOpacity={lightOpacity}
                selectedLightTheme={selectedLightTheme}
                selectedWallTheme={selectedWallTheme}
                openMenuId={openMenuId}
                setOpenMenuId={setOpenMenuId}
                hoveredInfoId={hoveredInfoId}
                setHoveredInfoId={setHoveredInfoId}
                draggedBookIndex={draggedBookIndex}
                handleDragStart={handleDragStart}
                handleDragOver={handleDragOver}
                handleDrop={handleDrop}
                handleDragEnd={handleDragEnd}
                handleRemoveBook={handleRemoveBook}
                setSelectedBookIdsToAdd={setSelectedBookIdsToAdd}
                setAddBookSearch={setAddBookSearch}
                setShowAddBookModal={setShowAddBookModal}
                LazyPreview={LazyPreview}
                backendUrl={backendUrl}
                currentUserEmail={currentUserEmail}
              />
            )}

            {activeAssets.type === 'plant_light_shelf' && (
              <PlantLightShelf
                filteredBooks={filteredBooks}
                decors={decors}
                setDecors={setDecors}
                showLightSwitch={showLightSwitch}
                lightOpacity={lightOpacity}
                selectedLightTheme={selectedLightTheme}
                selectedWallTheme={selectedWallTheme}
                openMenuId={openMenuId}
                setOpenMenuId={setOpenMenuId}
                hoveredInfoId={hoveredInfoId}
                setHoveredInfoId={setHoveredInfoId}
                draggedBookIndex={draggedBookIndex}
                handleDragStart={handleDragStart}
                handleDragOver={handleDragOver}
                handleDrop={handleDrop}
                handleDragEnd={handleDragEnd}
                handleRemoveBook={handleRemoveBook}
                setSelectedBookIdsToAdd={setSelectedBookIdsToAdd}
                setAddBookSearch={setAddBookSearch}
                setShowAddBookModal={setShowAddBookModal}
                LazyPreview={LazyPreview}
                backendUrl={backendUrl}
                currentUserEmail={currentUserEmail}
              />
            )}

            {activeAssets.type === 'blue_rope_shelf' && (
              <BlueRopeShelf
                filteredBooks={filteredBooks}
                decors={decors}
                setDecors={setDecors}
                showLightSwitch={showLightSwitch}
                lightOpacity={lightOpacity}
                selectedLightTheme={selectedLightTheme}
                selectedWallTheme={selectedWallTheme}
                openMenuId={openMenuId}
                setOpenMenuId={setOpenMenuId}
                hoveredInfoId={hoveredInfoId}
                setHoveredInfoId={setHoveredInfoId}
                draggedBookIndex={draggedBookIndex}
                handleDragStart={handleDragStart}
                handleDragOver={handleDragOver}
                handleDrop={handleDrop}
                handleDragEnd={handleDragEnd}
                handleRemoveBook={handleRemoveBook}
                setSelectedBookIdsToAdd={setSelectedBookIdsToAdd}
                setAddBookSearch={setAddBookSearch}
                setShowAddBookModal={setShowAddBookModal}
                LazyPreview={LazyPreview}
                backendUrl={backendUrl}
                currentUserEmail={currentUserEmail}
              />
            )}

            {activeAssets.type === 'window_shelf' && (
              <WindowShelf
                filteredBooks={filteredBooks}
                decors={decors}
                setDecors={setDecors}
                showLightSwitch={showLightSwitch}
                lightOpacity={lightOpacity}
                selectedLightTheme={selectedLightTheme}
                selectedWallTheme={selectedWallTheme}
                openMenuId={openMenuId}
                setOpenMenuId={setOpenMenuId}
                hoveredInfoId={hoveredInfoId}
                setHoveredInfoId={setHoveredInfoId}
                draggedBookIndex={draggedBookIndex}
                handleDragStart={handleDragStart}
                handleDragOver={handleDragOver}
                handleDrop={handleDrop}
                handleDragEnd={handleDragEnd}
                handleRemoveBook={handleRemoveBook}
                setSelectedBookIdsToAdd={setSelectedBookIdsToAdd}
                setAddBookSearch={setAddBookSearch}
                setShowAddBookModal={setShowAddBookModal}
                LazyPreview={LazyPreview}
                backendUrl={backendUrl}
                currentUserEmail={currentUserEmail}
              />
            )}

            {activeAssets.type === 'orange_shelf' && (
              <OrangeShelf
                filteredBooks={filteredBooks}
                decors={decors}
                setDecors={setDecors}
                showLightSwitch={showLightSwitch}
                lightOpacity={lightOpacity}
                selectedLightTheme={selectedLightTheme}
                selectedWallTheme={selectedWallTheme}
                openMenuId={openMenuId}
                setOpenMenuId={setOpenMenuId}
                hoveredInfoId={hoveredInfoId}
                setHoveredInfoId={setHoveredInfoId}
                draggedBookIndex={draggedBookIndex}
                handleDragStart={handleDragStart}
                handleDragOver={handleDragOver}
                handleDrop={handleDrop}
                handleDragEnd={handleDragEnd}
                handleRemoveBook={handleRemoveBook}
                setSelectedBookIdsToAdd={setSelectedBookIdsToAdd}
                setAddBookSearch={setAddBookSearch}
                setShowAddBookModal={setShowAddBookModal}
                LazyPreview={LazyPreview}
                backendUrl={backendUrl}
                currentUserEmail={currentUserEmail}
              />
            )}

            {activeAssets.type === 'golden_shelf' && (
              <GoldenShelf
                filteredBooks={filteredBooks}
                decors={decors}
                setDecors={setDecors}
                showLightSwitch={showLightSwitch}
                lightOpacity={lightOpacity}
                selectedLightTheme={selectedLightTheme}
                selectedWallTheme={selectedWallTheme}
                openMenuId={openMenuId}
                setOpenMenuId={setOpenMenuId}
                hoveredInfoId={hoveredInfoId}
                setHoveredInfoId={setHoveredInfoId}
                draggedBookIndex={draggedBookIndex}
                handleDragStart={handleDragStart}
                handleDragOver={handleDragOver}
                handleDrop={handleDrop}
                handleDragEnd={handleDragEnd}
                handleRemoveBook={handleRemoveBook}
                setSelectedBookIdsToAdd={setSelectedBookIdsToAdd}
                setAddBookSearch={setAddBookSearch}
                setShowAddBookModal={setShowAddBookModal}
                LazyPreview={LazyPreview}
                backendUrl={backendUrl}
                currentUserEmail={currentUserEmail}
              />
            )}

            {activeAssets.type === 'blue_shelf' && (
              <BlueShelf
                filteredBooks={filteredBooks}
                decors={decors}
                setDecors={setDecors}
                showLightSwitch={showLightSwitch}
                lightOpacity={lightOpacity}
                selectedLightTheme={selectedLightTheme}
                selectedWallTheme={selectedWallTheme}
                openMenuId={openMenuId}
                setOpenMenuId={setOpenMenuId}
                hoveredInfoId={hoveredInfoId}
                setHoveredInfoId={setHoveredInfoId}
                draggedBookIndex={draggedBookIndex}
                handleDragStart={handleDragStart}
                handleDragOver={handleDragOver}
                handleDrop={handleDrop}
                handleDragEnd={handleDragEnd}
                handleRemoveBook={handleRemoveBook}
                setSelectedBookIdsToAdd={setSelectedBookIdsToAdd}
                setAddBookSearch={setAddBookSearch}
                setShowAddBookModal={setShowAddBookModal}
                LazyPreview={LazyPreview}
                backendUrl={backendUrl}
                currentUserEmail={currentUserEmail}
              />
            )}

            {shelfLogo && (
              <div
                className="absolute z-30 pointer-events-none"
                style={{
                  top: activeShelfStyle === 'customize_bluerope'
                    ? '3.5%'
                    : activeShelfStyle === 'customize_windowshelf'
                      ? '6.2%'
                      : activeShelfStyle === 'customize_golden'
                      ? '6.2%'
                      : activeShelfStyle === 'customize_greenlight'
                        ? '6.2%'
                        : activeShelfStyle === 'customize_plantlight'
                          ? '6.2%'
                          : activeShelfStyle === 'customize_light'
                            ? '6.2%'
                            : activeShelfStyle === 'customize_green'
                              ? '6.0%'
                              : '6.2%',
                  left: activeShelfStyle === 'customize_windowshelf'
                    ? '16.5%'
                    : activeShelfStyle === 'customize_bluerope'
                      ? '13.8%'
                      : activeShelfStyle === 'customize_golden'
                        ? '5.8%'
                        : activeShelfStyle === 'customize_greenlight'
                          ? '8.5%'
                          : activeShelfStyle === 'customize4'
                            ? '12.5%'
                            : activeShelfStyle === 'customize_plantlight'
                              ? '5.0%'
                              : activeShelfStyle === 'customize_light'
                                ? '1.8%'
                                : activeShelfStyle === 'customize_green'
                                  ? '1.8%'
                                  : '6.2%',
                  width: '8%',
                  aspectRatio: '1.8/1',
                  opacity: (logoOpacity ?? 80) / 100
                }}
              >
                <img
                  src={shelfLogo.url}
                  alt="Shelf Logo"
                  className="w-full h-full block rounded-md"
                  style={{
                    objectFit: logoFixType === 'Fill' ? 'fill' : 'contain'
                  }}
                />
              </div>
            )}
          </div>
        ) : null}

        {/* Inline Shelf Stage */}
        <div
          className="w-full flex-1 min-h-[300px] aspect-[16/8.4] rounded-2xl overflow-hidden relative shadow-sm"
          style={{
            backgroundImage: (!Array.isArray(activeAssets.bg) && activeAssets.bg) ? `url('${activeAssets.bg}')` : 'none',
            backgroundSize: '100% 100%',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
          }}
        >
          {/* In-shelf Fullscreen Toggle Button */}
          <button
            type="button"
            onClick={toggleShelfFullscreen}
            className="absolute top-3.5 right-3.5 z-40 bg-black/50 hover:bg-black/75 text-white p-2 rounded-lg backdrop-blur-md transition-all shadow-md group cursor-pointer"
            title="Fullscreen Shelf"
          >
            <Icon
              icon="lucide:maximize-2"
              className="w-4 h-4 text-white/90 group-hover:text-white group-hover:scale-110 transition-transform"
            />
          </button>

          {isLoading && (
            <div className="absolute inset-0 z-50 flex gap-2 items-center justify-center bg-white/50 backdrop-blur-sm">
              <Icon icon="eos-icons:loading" className="w-8 h-8 text-blue-600" />
              <span className="text-base font-semibold text-gray-700">Shelf Loading...</span>
            </div>
          )}

          {/* If bg is an array, map over it to render wall blocks */}
          {Array.isArray(activeAssets.bg) && (
            <div className="absolute inset-0 flex flex-col rounded-xl overflow-hidden pointer-events-none">
              {Array.from({ length: activeAssets.rowCount }, (_, i) => (
                <div
                  key={i}
                  className="w-full flex-1 bg-center"
                  style={{
                    backgroundImage: `url('${activeAssets.bg[i % activeAssets.bg.length]}')`,
                    backgroundSize: activeAssets.bgStretch ? '100% 100%' : '100% auto',
                    backgroundRepeat: activeAssets.bgStretch ? 'no-repeat' : 'repeat',
                    backgroundPosition: 'center',
                  }}
                />
              ))}
            </div>
          )}

          {openMenuId && (
            <div
              className="fixed inset-0 z-20"
              onClick={() => setOpenMenuId(null)}
            />
          )}

          {activeAssets.type === 'rows' && activeAssets.rowAsset && (
            <div className="absolute inset-0 w-full h-full">
              {Array.from({ length: activeAssets.rowCount }, (_, i) => (
                <div
                  key={i}
                  className={`absolute left-0 w-full ${activeAssets.rowPadding ? '' : (activeAssets.padding || 'px-12')}`}
                  style={{
                    top: `${newTopOffset + (i * newSpacing) - (activeShelfStyle === 'customize2' && i !== activeAssets.rowCount - 1 ? 3.5 : 0)}%`,
                    padding: activeAssets.rowPadding || undefined
                  }}
                >
                  <div className="relative w-full">
                    {!(activeShelfStyle === 'customize2' && i === activeAssets.rowCount - 1) && (
                      <img src={activeAssets.rowAsset} alt="Shelf" className="w-full h-auto drop-shadow-lg" />
                    )}
                    {activeAssets.rowShadow && (
                      <img src={activeAssets.rowShadow} alt="Shelf Shadow" className="w-full h-auto -mt-[1%] opacity-90 drop-shadow-md" />
                    )}
                    {/* Books Container */}
                    {!activeAssets.hideBooks && (
                      <div
                        className={`absolute inset-x-0 flex items-end ${activeAssets.justify || 'justify-between'}`}
                        style={activeAssets.bookStyle || { bottom: '15%', padding: '0 5%' }}
                      >
                        {(() => {
                          const booksPerRow = activeShelfStyle === 'customize4' ? 4 : 6;
                          const rowBooks = filteredBooks.slice(i * booksPerRow, (i + 1) * booksPerRow) || [];
                          const paddedBooks = [...rowBooks, ...Array.from({ length: booksPerRow - rowBooks.length }).fill(null)];

                          return paddedBooks.map((book, bIdx) => {
                            const bookIndex = i * booksPerRow + bIdx;
                            if (!book) {
                              return (
                                <div
                                  key={`empty-${i}-${bIdx}`}
                                  onDragOver={handleDragOver}
                                  onDrop={(e) => handleDrop(e, bookIndex)}
                                  className={`relative flex justify-center items-end ${activeShelfStyle === 'customize2' ? (i === activeAssets.rowCount - 1 ? 'translate-y-4' : 'translate-y-0') : activeShelfStyle === 'customize4' ? 'translate-y-0' : 'translate-y-2'}`}
                                  style={{ width: activeAssets.bookWidth || '12%' }}
                                >
                                  {activeShelfStyle === 'customize4' ? (
                                    <div
                                      onClick={() => {
                                        setSelectedBookIdsToAdd([]);
                                        setAddBookSearch('');
                                        setShowAddBookModal(true);
                                      }}
                                      className="w-full aspect-[2.5/3.25] rounded-[6px] border border-dashed border-white/60 hover:border-white transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer group bg-white/10 hover:bg-white/15 backdrop-blur-[1px]"
                                      title="Add Book"
                                    >
                                      <div className="relative flex items-center justify-center text-white transition-transform group-hover:scale-110">
                                        <Icon icon="mdi:book-open-outline" className="w-5 h-5 text-white/90" />
                                        <span className="absolute -bottom-1 -right-1 text-[10px] font-black text-white leading-none">+</span>
                                      </div>
                                      <span className="text-[9px] font-medium text-white/90 group-hover:text-white tracking-wide">
                                        Add Book
                                      </span>
                                    </div>
                                  ) : null}
                                </div>
                              );
                            }

                            return (
                              <div
                                key={book.v_id || `book-${bIdx}`}
                                draggable
                                onDragStart={(e) => handleDragStart(e, bookIndex)}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, bookIndex)}
                                onDragEnd={handleDragEnd}
                                className={`relative group cursor-pointer flex justify-center items-end ${activeShelfStyle === 'customize2' ? (i === activeAssets.rowCount - 1 ? 'translate-y-4' : 'translate-y-0') : activeShelfStyle === 'customize4' ? 'translate-y-0' : 'translate-y-2'} ${openMenuId === `${i}-${bIdx}` ? 'z-40' : 'hover:z-30'} ${draggedBookIndex === bookIndex ? 'opacity-50' : ''}`}
                                style={{ width: activeAssets.bookWidth || '12%' }}
                              >
                                <div className={`w-[100%] ${activeShelfStyle === 'customize4' ? 'aspect-[2.5/3.25]' : 'aspect-[2.5/3.5]'} relative rounded-[3px] drop-shadow-md transition-transform origin-bottom group-hover:scale-105 overflow-hidden`}>
                                  <LazyPreview
                                    v_id={book.v_id}
                                    emailId={book.rawBook?.userEmail || currentUserEmail}
                                    backendUrl={backendUrl}
                                    iframeBaseUrl=""
                                    title={book.title}
                                    imageUrl={null}
                                  />
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeAssets.type === 'green_shelf' && (
            <GreenShelf
              filteredBooks={filteredBooks}
              decors={decors}
              setDecors={setDecors}
              showLightSwitch={showLightSwitch}
              lightOpacity={lightOpacity}
              selectedLightTheme={selectedLightTheme}
              selectedWallTheme={selectedWallTheme}
              openMenuId={openMenuId}
              setOpenMenuId={setOpenMenuId}
              hoveredInfoId={hoveredInfoId}
              setHoveredInfoId={setHoveredInfoId}
              draggedBookIndex={draggedBookIndex}
              handleDragStart={handleDragStart}
              handleDragOver={handleDragOver}
              handleDrop={handleDrop}
              handleDragEnd={handleDragEnd}
              handleRemoveBook={handleRemoveBook}
              setSelectedBookIdsToAdd={setSelectedBookIdsToAdd}
              setAddBookSearch={setAddBookSearch}
              setShowAddBookModal={setShowAddBookModal}
              LazyPreview={LazyPreview}
              backendUrl={backendUrl}
              currentUserEmail={currentUserEmail}
            />
          )}

          {activeAssets.type === 'green_light_shelf' && (
            <GreenLightShelf
              filteredBooks={filteredBooks}
              decors={decors}
              setDecors={setDecors}
              showLightSwitch={showLightSwitch}
              lightOpacity={lightOpacity}
              selectedLightTheme={selectedLightTheme}
              selectedWallTheme={selectedWallTheme}
              openMenuId={openMenuId}
              setOpenMenuId={setOpenMenuId}
              hoveredInfoId={hoveredInfoId}
              setHoveredInfoId={setHoveredInfoId}
              draggedBookIndex={draggedBookIndex}
              handleDragStart={handleDragStart}
              handleDragOver={handleDragOver}
              handleDrop={handleDrop}
              handleDragEnd={handleDragEnd}
              handleRemoveBook={handleRemoveBook}
              setSelectedBookIdsToAdd={setSelectedBookIdsToAdd}
              setAddBookSearch={setAddBookSearch}
              setShowAddBookModal={setShowAddBookModal}
              LazyPreview={LazyPreview}
              backendUrl={backendUrl}
              currentUserEmail={currentUserEmail}
            />
          )}

          {activeAssets.type === 'light_shelf' && (
            <LightShelf
              filteredBooks={filteredBooks}
              decors={decors}
              setDecors={setDecors}
              showLightSwitch={showLightSwitch}
              lightOpacity={lightOpacity}
              selectedLightTheme={selectedLightTheme}
              selectedWallTheme={selectedWallTheme}
              openMenuId={openMenuId}
              setOpenMenuId={setOpenMenuId}
              hoveredInfoId={hoveredInfoId}
              setHoveredInfoId={setHoveredInfoId}
              draggedBookIndex={draggedBookIndex}
              handleDragStart={handleDragStart}
              handleDragOver={handleDragOver}
              handleDrop={handleDrop}
              handleDragEnd={handleDragEnd}
              handleRemoveBook={handleRemoveBook}
              setSelectedBookIdsToAdd={setSelectedBookIdsToAdd}
              setAddBookSearch={setAddBookSearch}
              setShowAddBookModal={setShowAddBookModal}
              LazyPreview={LazyPreview}
              backendUrl={backendUrl}
              currentUserEmail={currentUserEmail}
            />
          )}

          {activeAssets.type === 'plant_light_shelf' && (
            <PlantLightShelf
              filteredBooks={filteredBooks}
              decors={decors}
              setDecors={setDecors}
              showLightSwitch={showLightSwitch}
              lightOpacity={lightOpacity}
              selectedLightTheme={selectedLightTheme}
              selectedWallTheme={selectedWallTheme}
              openMenuId={openMenuId}
              setOpenMenuId={setOpenMenuId}
              hoveredInfoId={hoveredInfoId}
              setHoveredInfoId={setHoveredInfoId}
              draggedBookIndex={draggedBookIndex}
              handleDragStart={handleDragStart}
              handleDragOver={handleDragOver}
              handleDrop={handleDrop}
              handleDragEnd={handleDragEnd}
              handleRemoveBook={handleRemoveBook}
              setSelectedBookIdsToAdd={setSelectedBookIdsToAdd}
              setAddBookSearch={setAddBookSearch}
              setShowAddBookModal={setShowAddBookModal}
              LazyPreview={LazyPreview}
              backendUrl={backendUrl}
              currentUserEmail={currentUserEmail}
            />
          )}

          {activeAssets.type === 'blue_rope_shelf' && (
            <BlueRopeShelf
              filteredBooks={filteredBooks}
              decors={decors}
              setDecors={setDecors}
              showLightSwitch={showLightSwitch}
              lightOpacity={lightOpacity}
              selectedLightTheme={selectedLightTheme}
              selectedWallTheme={selectedWallTheme}
              openMenuId={openMenuId}
              setOpenMenuId={setOpenMenuId}
              hoveredInfoId={hoveredInfoId}
              setHoveredInfoId={setHoveredInfoId}
              draggedBookIndex={draggedBookIndex}
              handleDragStart={handleDragStart}
              handleDragOver={handleDragOver}
              handleDrop={handleDrop}
              handleDragEnd={handleDragEnd}
              handleRemoveBook={handleRemoveBook}
              setSelectedBookIdsToAdd={setSelectedBookIdsToAdd}
              setAddBookSearch={setAddBookSearch}
              setShowAddBookModal={setShowAddBookModal}
              LazyPreview={LazyPreview}
              backendUrl={backendUrl}
              currentUserEmail={currentUserEmail}
            />
          )}

          {activeAssets.type === 'window_shelf' && (
            <WindowShelf
              filteredBooks={filteredBooks}
              decors={decors}
              setDecors={setDecors}
              showLightSwitch={showLightSwitch}
              lightOpacity={lightOpacity}
              selectedLightTheme={selectedLightTheme}
              selectedWallTheme={selectedWallTheme}
              openMenuId={openMenuId}
              setOpenMenuId={setOpenMenuId}
              hoveredInfoId={hoveredInfoId}
              setHoveredInfoId={setHoveredInfoId}
              draggedBookIndex={draggedBookIndex}
              handleDragStart={handleDragStart}
              handleDragOver={handleDragOver}
              handleDrop={handleDrop}
              handleDragEnd={handleDragEnd}
              handleRemoveBook={handleRemoveBook}
              setSelectedBookIdsToAdd={setSelectedBookIdsToAdd}
              setAddBookSearch={setAddBookSearch}
              setShowAddBookModal={setShowAddBookModal}
              LazyPreview={LazyPreview}
              backendUrl={backendUrl}
              currentUserEmail={currentUserEmail}
            />
          )}

          {activeAssets.type === 'orange_shelf' && (
            <OrangeShelf
              filteredBooks={filteredBooks}
              decors={decors}
              setDecors={setDecors}
              showLightSwitch={showLightSwitch}
              lightOpacity={lightOpacity}
              selectedLightTheme={selectedLightTheme}
              selectedWallTheme={selectedWallTheme}
              openMenuId={openMenuId}
              setOpenMenuId={setOpenMenuId}
              hoveredInfoId={hoveredInfoId}
              setHoveredInfoId={setHoveredInfoId}
              draggedBookIndex={draggedBookIndex}
              handleDragStart={handleDragStart}
              handleDragOver={handleDragOver}
              handleDrop={handleDrop}
              handleDragEnd={handleDragEnd}
              handleRemoveBook={handleRemoveBook}
              setSelectedBookIdsToAdd={setSelectedBookIdsToAdd}
              setAddBookSearch={setAddBookSearch}
              setShowAddBookModal={setShowAddBookModal}
              LazyPreview={LazyPreview}
              backendUrl={backendUrl}
              currentUserEmail={currentUserEmail}
            />
          )}

          {activeAssets.type === 'golden_shelf' && (
            <GoldenShelf
              filteredBooks={filteredBooks}
              decors={decors}
              setDecors={setDecors}
              showLightSwitch={showLightSwitch}
              lightOpacity={lightOpacity}
              selectedLightTheme={selectedLightTheme}
              selectedWallTheme={selectedWallTheme}
              openMenuId={openMenuId}
              setOpenMenuId={setOpenMenuId}
              hoveredInfoId={hoveredInfoId}
              setHoveredInfoId={setHoveredInfoId}
              draggedBookIndex={draggedBookIndex}
              handleDragStart={handleDragStart}
              handleDragOver={handleDragOver}
              handleDrop={handleDrop}
              handleDragEnd={handleDragEnd}
              handleRemoveBook={handleRemoveBook}
              setSelectedBookIdsToAdd={setSelectedBookIdsToAdd}
              setAddBookSearch={setAddBookSearch}
              setShowAddBookModal={setShowAddBookModal}
              LazyPreview={LazyPreview}
              backendUrl={backendUrl}
              currentUserEmail={currentUserEmail}
            />
          )}

          {activeAssets.type === 'blue_shelf' && (
            <BlueShelf
              filteredBooks={filteredBooks}
              decors={decors}
              setDecors={setDecors}
              showLightSwitch={showLightSwitch}
              lightOpacity={lightOpacity}
              selectedLightTheme={selectedLightTheme}
              selectedWallTheme={selectedWallTheme}
              openMenuId={openMenuId}
              setOpenMenuId={setOpenMenuId}
              hoveredInfoId={hoveredInfoId}
              setHoveredInfoId={setHoveredInfoId}
              draggedBookIndex={draggedBookIndex}
              handleDragStart={handleDragStart}
              handleDragOver={handleDragOver}
              handleDrop={handleDrop}
              handleDragEnd={handleDragEnd}
              handleRemoveBook={handleRemoveBook}
              setSelectedBookIdsToAdd={setSelectedBookIdsToAdd}
              setAddBookSearch={setAddBookSearch}
              setShowAddBookModal={setShowAddBookModal}
              LazyPreview={LazyPreview}
              backendUrl={backendUrl}
              currentUserEmail={currentUserEmail}
            />
          )}

          {/* Shelf Logo predefined box with light shadow on left wall */}
          <div
            className="absolute z-15 transition-all duration-300 group"
            style={{
              top: activeShelfStyle === 'customize_bluerope'
                ? '3.5%'
                : activeShelfStyle === 'customize_plantlight'
                  ? '2.8%'
                : activeShelfStyle === 'customize_light'
                  ? '3.8%'
                  : activeShelfStyle === 'customize_greenlight'
                    ? '5.8%'
                    : activeShelfStyle === 'customize_green'
                      ? '6.0%'
                      : '6.2%',
              left: activeShelfStyle === 'customize_windowshelf'
                ? '16.5%'
                : activeShelfStyle === 'customize_bluerope'
                  ? '14.2%'
                  : activeShelfStyle === 'customize_golden'
                    ? '5.8%'
                    : activeShelfStyle === 'customize_greenlight'
                      ? '8.5%'
                      : activeShelfStyle === 'customize4'
                        ? '12.5%'
                        : activeShelfStyle === 'customize_green'
                          ? '12.0%'
                          : '8.8%',
              width: '11.2%',
              aspectRatio: '16 / 9'
            }}
          >
            {shelfLogo?.url ? (
              <div
                className="w-full h-full flex items-center justify-center overflow-hidden transition-all duration-200"
                style={{
                  opacity: (logoOpacity ?? 100) / 100
                }}
              >
                <img
                  src={shelfLogo.url}
                  alt="Shelf Logo"
                  className="w-full h-full block rounded-md"
                  style={{
                    objectFit: logoFixType === 'Fill' ? 'fill' : 'contain'
                  }}
                />
              </div>
            ) : (
              <div
                onClick={() => setShowLogoModal(true)}
                className="w-full h-full rounded-lg border border-dashed border-white/40 hover:border-white/80 bg-white/10 hover:bg-white/20 backdrop-blur-[2px] shadow-[0_4px_12px_rgba(0,0,0,0.08)] flex flex-col items-center justify-center gap-1 cursor-pointer transition-all duration-200 group-hover:scale-[1.02]"
                title="Add Logo"
              >
                <Icon icon="lucide:image-plus" className="w-4 h-4 text-white/70 group-hover:text-white transition-colors" />
                <span className="text-[10px] font-medium text-white/80 group-hover:text-white transition-colors">
                  Add Logo
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Shelf Styles Carousel / Pagination */}
        <div className="mt-2 mb-0 flex flex-col gap-1.5 shrink-0">
          {(() => {
            const allStyles = [
              { id: 'customize4', img: blueshade, title: 'Pumps Shelf', bookCount: 8 },
              { id: 'customize_green', img: greenshade, title: 'Green Shelf', bookCount: 8 },
              { id: 'customize_light', img: lightShelfImg, title: 'Light Shelf', bookCount: 8 },
              { id: 'customize_plantlight', img: plantLightShelfImg, title: 'Plant-Light Shelf', bookCount: 8 },
              { id: 'customize_greenlight', img: greenLightShelfImg, title: 'Green-Light Shelf', bookCount: 8 },
              { id: 'customize_bluerope', img: blueRopeShelfImg, title: 'Blue Rope Shelf', bookCount: 4 },
              { id: 'customize_windowshelf', img: windowShelfImg, title: 'Window Shelf', bookCount: 2 },
              { id: 'customize_orange', img: orangeShelfImg, title: 'Orange Shelf', bookCount: 2 },
              { id: 'customize_golden', img: goldenShelfImg, title: 'Golden Shelf', bookCount: 4 },
            ];

            const filteredStyles = selectedBookCountFilter === 'All'
              ? allStyles
              : allStyles.filter(s => String(s.bookCount) === selectedBookCountFilter);

            const itemsPerPage = 5;
            const totalPages = Math.max(1, Math.ceil(filteredStyles.length / itemsPerPage));
            const currentPage = Math.min(shelfStylesPage, totalPages);
            const startIndex = (currentPage - 1) * itemsPerPage;
            const visibleStyles = filteredStyles.slice(startIndex, startIndex + itemsPerPage);

            return (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xs font-bold text-gray-900 tracking-tight">Shelf Styles</h3>
                    <div className="inline-flex items-center bg-gray-100/90 p-0.5 rounded-full border border-gray-200/80 shadow-2xs">
                      {[
                        { id: 'All', label: 'All' },
                        { id: '8', label: '8 Books' },
                        { id: '4', label: '4 Books' },
                        { id: '2', label: '2 Books' }
                      ].map(tab => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => {
                            setSelectedBookCountFilter(tab.id);
                            setShelfStylesPage(1);
                          }}
                          className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-full transition-all duration-150 cursor-pointer ${
                            selectedBookCountFilter === tab.id
                              ? 'bg-[#FF5733] text-white shadow-xs'
                              : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <span className="text-[11px] text-gray-500 font-medium">
                    {currentPage} / {totalPages}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setShelfStylesPage(prev => (prev > 1 ? prev - 1 : totalPages))}
                    className="p-0.5 text-gray-400 hover:text-gray-700 transition-colors"
                  >
                    <Icon icon="lucide:chevron-left" className="w-3.5 h-3.5" />
                  </button>

                  <div className="grid grid-cols-5 gap-2 flex-1">
                    {visibleStyles.map((style) => {
                      const isSelected = activeShelfStyle === style.id;
                      return (
                        <div
                          key={style.id}
                          onClick={() => {
                            setActiveShelfStyle(style.id);
                            if (setSelectedWallTheme) setSelectedWallTheme(null);
                          }}
                          className={`aspect-[354/200] rounded-lg overflow-hidden border-2 cursor-pointer transition-all duration-150 relative group bg-white shadow-xs ${
                            isSelected
                              ? 'border-[#FF5733] ring-2 ring-orange-200/70 shadow-sm'
                              : 'border-gray-200/90 hover:border-gray-300'
                          }`}
                        >
                          <img
                            src={style.img}
                            alt={style.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setShelfStylesPage(prev => (prev < totalPages ? prev + 1 : 1))}
                    className="p-0.5 text-gray-400 hover:text-gray-700 transition-colors"
                  >
                    <Icon icon="lucide:chevron-right" className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            );
          })()}
        </div>
      </div>
    );
  }

  // List View Column
  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-y-auto pr-2 pb-4">
      {listDropdown && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setListDropdown(null)}
        />
      )}
      <div className="flex gap-4 mb-4 relative z-20">
        <div className="relative flex-1 max-w-xs">
          <svg className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input type="text" placeholder="Search Flipbook..." className="w-full pl-10 pr-4 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none" />
        </div>

        {/* Flipbook Dropdown */}
        <div className="relative">
          <button
            onClick={() => setListDropdown(listDropdown === 'flipbooks' ? null : 'flipbooks')}
            className="flex items-center justify-between w-40 px-4 py-1.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none"
          >
            <span className="text-[#5B738B]">{selectedFolder === 'add_shelf' ? 'Add Shelf' : selectedFolder}</span>
            <Icon icon={listDropdown === 'flipbooks' ? "mdi:chevron-up" : "mdi:chevron-down"} className="w-4 h-4 text-[#8BA3BA]" />
          </button>

          {listDropdown === 'flipbooks' && (
            <div className="absolute z-50 w-full mt-1.5 bg-white border border-gray-100 rounded-lg shadow-[0_4px_20px_rgb(0,0,0,0.08)] py-1 overflow-hidden">
              {folders.map(folder => (
                <div
                  key={folder.name}
                  className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-50 transition-colors ${selectedFolder === folder.name ? 'bg-gray-50 text-[#334155]' : 'text-[#475569]'}`}
                  onClick={() => {
                    handleFlipbookSelect({ target: { value: folder.name } });
                    setListDropdown(null);
                  }}
                >
                  {folder.name}
                </div>
              ))}
              <div
                className={`px-4 py-2 text-sm cursor-pointer border-t border-gray-100 hover:bg-gray-50 transition-colors ${selectedFolder === 'add_shelf' ? 'bg-gray-50 text-[#334155]' : 'text-[#475569]'}`}
                onClick={() => {
                  handleFlipbookSelect({ target: { value: 'add_shelf' } });
                  setListDropdown(null);
                }}
              >
                + Add Shelf
              </div>
            </div>
          )}
        </div>

        {/* Status Dropdown */}
        <div className="relative">
          <button
            onClick={() => setListDropdown(listDropdown === 'status' ? null : 'status')}
            className="flex items-center justify-between w-48 px-4 py-1.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none"
          >
            <span className="text-[#5B738B] truncate mr-2 text-left w-full">{selectedStatus}</span>
            <Icon icon={listDropdown === 'status' ? "mdi:chevron-up" : "mdi:chevron-down"} className="w-4 h-4 text-[#8BA3BA] shrink-0" />
          </button>

          {listDropdown === 'status' && (
            <div className="absolute z-50 w-full mt-1.5 bg-white border border-gray-100 rounded-lg shadow-[0_4px_20px_rgb(0,0,0,0.08)] py-1 overflow-hidden">
              {['All Status', 'Published - Public', 'Published - Private', 'Unpublished - Public', 'Unpublished - Private'].map((status) => (
                <div
                  key={status}
                  className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-50 transition-colors ${selectedStatus === status ? 'bg-gray-50 text-[#334155]' : 'text-[#475569]'}`}
                  onClick={() => {
                    setSelectedStatus(status);
                    setListDropdown(null);
                  }}
                >
                  {status}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {openMenuId && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => setOpenMenuId(null)}
        />
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading ? (
          <div className="col-span-full py-20 flex justify-center items-center">
            <div className="flex flex-col items-center gap-3 bg-white px-6 py-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100">
              <Icon icon="eos-icons:loading" className="w-8 h-8 text-blue-600" />
              <span className="text-sm font-semibold text-gray-700">Loading Flipbooks...</span>
            </div>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="col-span-full py-10 flex justify-center text-gray-500">No flipbooks found.</div>
        ) : (
          filteredBooks.map((book, idx) => (
            <div key={book.v_id || idx} className="bg-white rounded-2xl overflow-hidden flex flex-col shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-shadow border border-transparent hover:border-gray-100">
              {/* Image Area Wrapper */}
              <div className="relative w-full aspect-square bg-[#e2b58d] overflow-hidden">
                <img src={book.cover || listFrame} alt={book.title || "Flipbook"} className="w-full h-full object-cover" />

                <button
                  onClick={() => setOpenMenuId(openMenuId === book.v_id ? null : book.v_id)}
                  className="absolute top-3 right-3 text-white hover:text-gray-200 bg-black/20 rounded-md p-0.5 transition-colors z-30"
                >
                  <Icon icon="mdi:dots-vertical" className="w-5 h-5" />
                </button>

                {openMenuId === book.v_id && (
                  <div className="absolute top-[2.5vw] right-[0.8vw] bg-white rounded-[0.5vw] shadow-xl border border-gray-100 py-[0.5vw] w-[9vw] z-40 overflow-hidden">
                    <button
                      onClick={() => {
                        const targetShareId = book.shareId || book.v_id;
                        const rawAcc = String(book.access || 'public').toLowerCase();
                        if (targetShareId) {
                          window.open(`/share=${rawAcc}/${targetShareId}`, '_blank');
                        }
                        setOpenMenuId(null);
                      }}
                      className="w-full text-left px-[1vw] py-[0.5vw] text-[0.75vw] font-medium text-gray-600 hover:text-black hover:bg-gray-50 flex items-center gap-[0.5vw] transition-colors"
                    >
                      <Icon icon="mdi:book-open-outline" className="w-[1vw] h-[1vw] text-gray-400" />
                      Open Book
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveBook(book.v_id);
                        setOpenMenuId(null);
                      }}
                      className="w-full text-left px-[1vw] py-[0.5vw] text-[0.75vw] font-medium text-red-500 hover:text-red-600 hover:bg-red-50 flex items-center gap-[0.5vw] transition-colors"
                    >
                      <Icon icon="mdi:trash-can-outline" className="w-[1vw] h-[1vw] text-red-400" />
                      Remove Book
                    </button>
                  </div>
                )}
              </div>

              {/* Card Details */}
              <div className="p-4 flex flex-col flex-1 bg-white">
                {/* Author Info */}
                <div className="flex items-center gap-3">
                  {book.authorPicture && book.authorPicture !== 'color_only' ? (
                    <img
                      src={book.authorPicture}
                      alt={book.authorName}
                      className="w-9 h-9 rounded-full border border-gray-200 object-cover shrink-0"
                    />
                  ) : (
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-inner"
                      style={{ backgroundColor: book.authorBgColor }}
                    >
                      {(book.authorName || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex flex-col min-w-0 pr-1">
                    <span className="text-sm font-semibold text-gray-900 leading-tight truncate">{book.authorName}</span>
                    <span className="flex items-center gap-1 text-[11px] text-gray-400 mt-0.5 truncate">
                      <Icon icon="lucide:map-pin" className="w-3 h-3 text-gray-400 shrink-0" />
                      <span className="truncate">{String(book.location).replace(/📍/g, '').trim()}</span>
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-2 justify-start text-xs text-gray-700 font-medium mt-4 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <span className="text-black font-semibold">{book.pages || 0}</span>
                    <span className="font-normal text-gray-500">Pages</span>
                  </div>
                  <span className="text-gray-300">|</span>
                  <span className="flex items-center gap-1">
                    <Icon icon="lucide:eye" className="w-3.5 h-3.5 text-gray-400" />
                    {book.views || '1.2k'}
                  </span>
                  <span className="text-gray-300">|</span>
                  <span className="flex items-center gap-1">
                    <Icon icon="material-symbols:star" className="w-4 h-4 text-yellow-400" />
                    {book.rating || 4.5}
                  </span>
                </div>

                {/* Title & Desc & Button */}
                <div className="relative flex-1 mt-3">
                  <h4 className="text-[15px] font-semibold text-black truncate tracking-tight mb-1">{book.title}</h4>
                  <p className="text-[12px] text-gray-500 leading-relaxed pr-10 line-clamp-2">{book.description}</p>

                  <button
                    onClick={() => {
                      const targetShareId = book.shareId || book.v_id;
                      const rawAcc = String(book.access || 'public').toLowerCase();
                      if (targetShareId) {
                        window.open(`/share=${rawAcc}/${targetShareId}`, '_blank');
                      }
                    }}
                    className="absolute bottom-0 right-0 bg-black text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors shadow-md cursor-pointer"
                  >
                    <Icon icon="mdi:arrow-top-right" className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ShelfDetailView;

