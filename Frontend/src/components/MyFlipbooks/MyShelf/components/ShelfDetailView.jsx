import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { getAssetBaseUrl } from '../../../../utils/assetUtils';
import ShelfBookSlot from '../Shelves/ShelfBookSlot';
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
import CustomScrollbar from '../../../CustomScrollbar';
import ShelfLoadingOverlay from './ShelfLoadingOverlay';

const ShelfDetailBookItem = ({
  book,
  bookIndex,
  i,
  bIdx,
  activeShelfStyle,
  activeAssets,
  draggedBookIndex,
  openMenuId,
  setOpenMenuId,
  hoveredInfoId,
  setHoveredInfoId,
  handleRemoveBook,
  handleDragStart,
  handleDragOver,
  handleDrop,
  handleDragEnd,
  backendUrl,
  currentUserEmail,
  LazyPreviewComponent,
  isFs = false,
}) => {
  const customTransform =
    activeShelfStyle === 'customize2'
      ? (i === activeAssets?.rowCount - 1 ? 'translate-y-4' : 'translate-y-0')
      : activeShelfStyle === 'customize4'
      ? 'translate-y-0'
      : 'translate-y-2';

  return (
    <ShelfBookSlot
      book={book}
      bookIndex={bookIndex}
      i={i}
      bIdx={bIdx}
      className={customTransform}
      shelfKey={isFs ? `fs-shelf-${i}` : `shelf-${i}`}
      openMenuId={openMenuId}
      setOpenMenuId={setOpenMenuId}
      hoveredInfoId={hoveredInfoId}
      setHoveredInfoId={setHoveredInfoId}
      handleDragStart={handleDragStart}
      handleDragOver={handleDragOver}
      handleDrop={handleDrop}
      handleDragEnd={handleDragEnd}
      draggedBookIndex={draggedBookIndex}
      handleRemoveBook={handleRemoveBook}
      backendUrl={backendUrl}
      currentUserEmail={currentUserEmail}
      LazyPreviewComponent={LazyPreviewComponent}
      landscapeWidth="22%"
      squareWidth="18%"
      portraitWidth={activeAssets?.bookWidth || '12%'}
    />
  );
};

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
  hasUnsavedChanges = false,
  isSaving = false,
  activeAssets,
  newTopOffset,
  newSpacing,
  isLoading,
  shelfLoadingTitle,
  shelfLoadingSubtitle,
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
        <div className="flex flex-col mb-[0.7vw] w-full -mt-[0.2vw]">
          {/* Back to My Shelf Link */}
          <div className="flex items-center gap-[0.4vw] mb-[0.3vw]">
            <button
              onClick={() => setCurrentView('overview')}
              className="flex items-center gap-[0.2vw] text-[#FF5733] hover:text-[#E04D2D] text-[0.8vw] font-semibold transition-colors cursor-pointer"
            >
              <Icon icon="lucide:chevron-left" className="w-[0.9vw] h-[0.9vw]" />
              <span>My Shelf</span>
            </button>
          </div>

          {/* Title Row aligned straight with Action Buttons at the shelf right edge */}
          <div className="w-full">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-[0.5vw]">
                {isEditingShelfName ? (
                  <div className="flex items-center gap-[0.35vw]">
                    <input
                      type="text"
                      value={editingShelfNameValue}
                      onChange={(e) => setEditingShelfNameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveShelfName();
                        if (e.key === 'Escape') setIsEditingShelfName(false);
                      }}
                      autoFocus
                      className="text-[1.1vw] font-bold text-gray-900 border-b-2 border-[#FF5733] bg-transparent outline-none px-[0.2vw] py-[0.1vw]"
                    />
                    <button
                      onClick={handleSaveShelfName}
                      className="w-[1.7vw] h-[1.7vw] flex items-center justify-center text-green-600 hover:text-green-700 hover:bg-green-50 rounded-[0.4vw] transition-colors cursor-pointer"
                      title="Save name"
                    >
                      <Icon icon="lucide:check" className="w-[0.9vw] h-[0.9vw]" />
                    </button>
                    <button
                      onClick={() => setIsEditingShelfName(false)}
                      className="w-[1.7vw] h-[1.7vw] flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-[0.4vw] transition-colors cursor-pointer"
                      title="Cancel"
                    >
                      <Icon icon="lucide:x" className="w-[0.9vw] h-[0.9vw]" />
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-[1.1vw] font-bold text-gray-900 tracking-tight leading-none">
                      {selectedFolder || (activeShelfStyle === 'customize_golden' ? 'Golden Shelf' : activeShelfStyle === 'customize_orange' ? 'Orange Shelf' : activeShelfStyle === 'customize_windowshelf' ? 'Window Shelf' : activeShelfStyle === 'customize_bluerope' ? 'Blue Rope Shelf' : activeShelfStyle === 'customize_plantlight' ? 'Plant-Light Shelf' : activeShelfStyle === 'customize_light' ? 'Light Shelf' : activeShelfStyle === 'customize_greenlight' ? 'Green-Light Shelf' : activeShelfStyle === 'customize_green' ? 'Green Shelf' : 'My Shelf')}
                    </h2>
                    <button
                      onClick={() => {
                        setEditingShelfNameValue(selectedFolder || '');
                        setIsEditingShelfName(true);
                      }}
                      className="text-gray-400 hover:text-[#FF5733] transition-colors p-[0.2vw] rounded-[0.4vw] hover:bg-orange-50/50 cursor-pointer"
                      title="Rename shelf"
                    >
                      <Icon icon="lucide:edit-3" className="w-[0.85vw] h-[0.85vw]" />
                    </button>
                  </>
                )}
              </div>

              <div className="flex items-center gap-[0.5vw]">
                <button
                  onClick={toggleShelfFullscreen}
                  className="flex items-center justify-center w-[2vw] h-[2vw] border border-gray-300 rounded-[0.4vw] text-gray-700 bg-white hover:bg-gray-50 shadow-2xs hover:border-gray-400 active:scale-95 transition-all cursor-pointer"
                  title={isShelfFullscreen ? "Exit Fullscreen" : "Fullscreen Shelf"}
                >
                  <Icon icon={isShelfFullscreen ? "lucide:minimize" : "lucide:maximize"} className="w-[0.85vw] h-[0.85vw] text-gray-600" />
                </button>

                <button
                  onClick={() => setShowShareShelfModal(true)}
                  className="flex items-center gap-[0.4vw] h-[2vw] px-[0.85vw] border border-gray-300 rounded-[0.4vw] text-[0.8vw] font-medium text-gray-700 bg-white hover:bg-gray-50 shadow-2xs hover:border-gray-400 active:scale-95 transition-all cursor-pointer"
                >
                  <Icon icon="lucide:share-2" className="w-[0.85vw] h-[0.85vw] text-gray-600" />
                  <span>Share Shelf</span>
                </button>

                <button
                  type="button"
                  onClick={applyShelfStyle}
                  disabled={!hasUnsavedChanges || isSaving}
                  className={`flex items-center gap-[0.35vw] h-[2vw] px-[0.95vw] text-[0.8vw] font-medium rounded-[0.4vw] transition-all ${
                    hasUnsavedChanges && !isSaving
                      ? 'bg-[#FF5733] hover:bg-[#E04D2D] active:scale-95 text-white shadow-2xs hover:shadow-sm cursor-pointer'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-200 shadow-none'
                  }`}
                  title={hasUnsavedChanges ? "Save your shelf customizations" : "No unsaved changes"}
                >
                  {isSaving ? (
                    <Icon icon="eos-icons:loading" className="w-[0.85vw] h-[0.85vw]" />
                  ) : (
                    <Icon icon="lucide:check" className="w-[0.85vw] h-[0.85vw]" />
                  )}
                  <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
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

            <ShelfLoadingOverlay
              isLoading={isLoading}
              title={shelfLoadingTitle}
            />

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
                                <ShelfDetailBookItem
                                  key={book.v_id || `fs-book-${bIdx}`}
                                  book={book}
                                  bookIndex={bookIndex}
                                  i={i}
                                  bIdx={bIdx}
                                  activeShelfStyle={activeShelfStyle}
                                  activeAssets={activeAssets}
                                  draggedBookIndex={draggedBookIndex}
                                  openMenuId={openMenuId}
                                  setOpenMenuId={setOpenMenuId}
                                  hoveredInfoId={hoveredInfoId}
                                  setHoveredInfoId={setHoveredInfoId}
                                  handleRemoveBook={handleRemoveBook}
                                  handleDragStart={handleDragStart}
                                  handleDragOver={handleDragOver}
                                  handleDrop={handleDrop}
                                  handleDragEnd={handleDragEnd}
                                  backendUrl={backendUrl}
                                  currentUserEmail={currentUserEmail}
                                  LazyPreviewComponent={LazyPreview}
                                  isFs={true}
                                />
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
                isFs={true}
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
                isFs={true}
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
                isFs={true}
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
                isFs={true}
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
                isFs={true}
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
                isFs={true}
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
                isFs={true}
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
                isFs={true}
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
                isFs={true}
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
                  src={typeof shelfLogo === 'object' ? (shelfLogo?.url || '') : shelfLogo}
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

          <ShelfLoadingOverlay
            isLoading={isLoading}
            title={shelfLoadingTitle}
          />

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
                              <ShelfDetailBookItem
                                key={book.v_id || `book-${bIdx}`}
                                book={book}
                                bookIndex={bookIndex}
                                i={i}
                                bIdx={bIdx}
                                activeShelfStyle={activeShelfStyle}
                                activeAssets={activeAssets}
                                draggedBookIndex={draggedBookIndex}
                                openMenuId={openMenuId}
                                setOpenMenuId={setOpenMenuId}
                                hoveredInfoId={hoveredInfoId}
                                setHoveredInfoId={setHoveredInfoId}
                                handleRemoveBook={handleRemoveBook}
                                handleDragStart={handleDragStart}
                                handleDragOver={handleDragOver}
                                handleDrop={handleDrop}
                                handleDragEnd={handleDragEnd}
                                backendUrl={backendUrl}
                                currentUserEmail={currentUserEmail}
                                LazyPreviewComponent={LazyPreview}
                                isFs={false}
                              />
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
              isFs={false}
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
              isFs={false}
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
              isFs={false}
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
              isFs={false}
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
              isFs={false}
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
              isFs={false}
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
              isFs={false}
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
              isFs={false}
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
              isFs={false}
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
            {(typeof shelfLogo === 'object' ? shelfLogo?.url : shelfLogo) ? (
              <div
                className="w-full h-full flex items-center justify-center overflow-hidden transition-all duration-200"
                style={{
                  opacity: (logoOpacity ?? 100) / 100
                }}
              >
                <img
                  src={typeof shelfLogo === 'object' ? (shelfLogo?.url || '') : shelfLogo}
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
                  <div className="flex items-center gap-[0.8vw]">
                    <h3 className="text-[0.85vw] font-semibold text-gray-900 tracking-tight">Shelf Styles</h3>
                    <div className="inline-flex items-center bg-gray-100/90 p-[0.15vw] rounded-full border border-gray-200/80 shadow-2xs">
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
                          className={`px-[0.6vw] py-[0.15vw] text-[0.72vw] font-medium rounded-full transition-all duration-150 cursor-pointer ${
                            selectedBookCountFilter === tab.id
                              ? 'bg-[#FF5733] text-white shadow-2xs'
                              : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <span className="text-[0.75vw] text-gray-500 font-medium">
                    {currentPage} / {totalPages}
                  </span>
                </div>

                <div className="flex items-center gap-[0.4vw]">
                  <button
                    type="button"
                    onClick={() => setShelfStylesPage(prev => (prev > 1 ? prev - 1 : totalPages))}
                    className="w-[1.8vw] h-[1.8vw] rounded-[0.4vw] border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 shadow-2xs flex items-center justify-center transition-all active:scale-95 cursor-pointer shrink-0"
                    title="Previous page"
                  >
                    <Icon icon="lucide:chevron-left" className="w-[0.9vw] h-[0.9vw]" />
                  </button>

                  {/* Smooth Sliding Track Container */}
                  <div className="overflow-hidden flex-1 rounded-[0.45vw]">
                    <div
                      className="flex transition-transform duration-500 ease-out"
                      style={{ transform: `translateX(-${(currentPage - 1) * 100}%)` }}
                    >
                      {Array.from({ length: totalPages }, (_, pIdx) => {
                        const pageStyles = filteredStyles.slice(pIdx * itemsPerPage, (pIdx + 1) * itemsPerPage);
                        return (
                          <div key={pIdx} className="grid grid-cols-5 gap-[0.5vw] w-full shrink-0">
                            {pageStyles.map((style) => {
                              const isSelected = activeShelfStyle === style.id;
                              return (
                                <div
                                  key={style.id}
                                  onClick={() => {
                                    setActiveShelfStyle(style.id);
                                    if (typeof setSelectedWallTheme === 'function') setSelectedWallTheme(null);
                                  }}
                                  className={`aspect-[354/200] rounded-[0.45vw] overflow-hidden border-2 cursor-pointer transition-all duration-200 relative group bg-white shadow-2xs hover:shadow-md hover:scale-[1.02] ${
                                    isSelected
                                      ? 'border-[#FF5733] ring-2 ring-orange-200/70 shadow-sm'
                                      : 'border-gray-200/90 hover:border-gray-300'
                                  }`}
                                >
                                  <img
                                    src={style.img}
                                    alt={style.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShelfStylesPage(prev => (prev < totalPages ? prev + 1 : 1))}
                    className="w-[1.8vw] h-[1.8vw] rounded-[0.4vw] border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 shadow-2xs flex items-center justify-center transition-all active:scale-95 cursor-pointer shrink-0"
                    title="Next page"
                  >
                    <Icon icon="lucide:chevron-right" className="w-[0.9vw] h-[0.9vw]" />
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
    <CustomScrollbar
      color="#d1d5db"
      hoverColor="#9ca3af"
      width="4px"
      className="flex-1 flex flex-col min-w-0 pr-[0.5vw] pb-[1vw]"
    >
      {listDropdown && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setListDropdown(null)}
        />
      )}
      <div className="flex gap-[0.8vw] mb-[1vw] relative z-20">
        <div className="relative flex-1 max-w-[18vw]">
          <svg className="absolute left-[0.7vw] top-1/2 transform -translate-y-1/2 text-gray-400 w-[0.9vw] h-[0.9vw]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input type="text" placeholder="Search Flipbook..." className="w-full h-[2vw] pl-[2.2vw] pr-[0.8vw] border border-gray-300 rounded-[0.4vw] text-[0.8vw] font-medium text-gray-700 placeholder-gray-400 focus:outline-none focus:border-gray-400 shadow-2xs" />
        </div>

        {/* Flipbook Dropdown */}
        <div className="relative">
          <button
            onClick={() => setListDropdown(listDropdown === 'flipbooks' ? null : 'flipbooks')}
            className="flex items-center justify-between w-[9.5vw] h-[2vw] px-[0.8vw] bg-white border border-gray-300 rounded-[0.4vw] text-[0.8vw] font-medium shadow-2xs hover:bg-gray-50 focus:outline-none transition-colors cursor-pointer"
          >
            <span className="text-gray-700 truncate">{selectedFolder === 'add_shelf' ? 'Add Shelf' : selectedFolder}</span>
            <Icon icon={listDropdown === 'flipbooks' ? "mdi:chevron-up" : "mdi:chevron-down"} className="w-[0.9vw] h-[0.9vw] text-gray-500 shrink-0 ml-[0.3vw]" />
          </button>

          {listDropdown === 'flipbooks' && (
            <div className="absolute z-50 w-full mt-[0.3vw] bg-white border border-gray-100 rounded-[0.45vw] shadow-xl py-[0.25vw] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              {folders.map(folder => (
                <div
                  key={folder.name}
                  className={`px-[0.8vw] py-[0.4vw] text-[0.8vw] font-medium cursor-pointer hover:bg-gray-50 transition-colors ${selectedFolder === folder.name ? 'bg-gray-50 text-[#FF5733] font-semibold' : 'text-gray-700'}`}
                  onClick={() => {
                    handleFlipbookSelect({ target: { value: folder.name } });
                    setListDropdown(null);
                  }}
                >
                  {folder.name}
                </div>
              ))}
              <div
                className={`px-[0.8vw] py-[0.4vw] text-[0.8vw] font-medium cursor-pointer border-t border-gray-100 hover:bg-gray-50 transition-colors ${selectedFolder === 'add_shelf' ? 'bg-gray-50 text-[#FF5733] font-semibold' : 'text-gray-700'}`}
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
            className="flex items-center justify-between w-[11.5vw] h-[2vw] px-[0.8vw] bg-white border border-gray-300 rounded-[0.4vw] text-[0.8vw] font-medium shadow-2xs hover:bg-gray-50 focus:outline-none transition-colors cursor-pointer"
          >
            <span className="text-gray-700 truncate mr-[0.4vw] text-left w-full">{selectedStatus}</span>
            <Icon icon={listDropdown === 'status' ? "mdi:chevron-up" : "mdi:chevron-down"} className="w-[0.9vw] h-[0.9vw] text-gray-500 shrink-0" />
          </button>

          {listDropdown === 'status' && (
            <div className="absolute z-50 w-full mt-[0.3vw] bg-white border border-gray-100 rounded-[0.45vw] shadow-xl py-[0.25vw] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              {['All Status', 'Published - Public', 'Published - Private', 'Unpublished - Public', 'Unpublished - Private'].map((status) => (
                <div
                  key={status}
                  className={`px-[0.8vw] py-[0.4vw] text-[0.8vw] font-medium cursor-pointer hover:bg-gray-50 transition-colors ${selectedStatus === status ? 'bg-gray-50 text-[#FF5733] font-semibold' : 'text-gray-700'}`}
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[1.2vw]">
        {isLoading ? (
          <div className="col-span-full py-16 flex justify-center items-center relative min-h-[30vh]">
            <ShelfLoadingOverlay
              isLoading={true}
              title={shelfLoadingTitle || "Loading Bookshelf..."}
            />
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="col-span-full py-10 flex justify-center text-gray-500 text-[0.82vw] font-medium">No flipbooks found.</div>
        ) : (
          filteredBooks.map((book, idx) => (
            <div key={book.v_id || idx} className="bg-white rounded-[0.55vw] overflow-hidden flex flex-col shadow-2xs hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-gray-300">
              {/* Image Area Wrapper */}
              <div className="relative w-full aspect-square bg-[#e2b58d] overflow-hidden">
                <img src={book.cover || listFrame} alt={book.title || "Flipbook"} className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" />

                <button
                  onClick={() => setOpenMenuId(openMenuId === book.v_id ? null : book.v_id)}
                  className="absolute top-[0.6vw] right-[0.6vw] text-white hover:text-white bg-black/35 hover:bg-black/55 rounded-[0.35vw] p-[0.3vw] transition-colors z-30 cursor-pointer"
                >
                  <Icon icon="mdi:dots-vertical" className="w-[1vw] h-[1vw]" />
                </button>

                {openMenuId === book.v_id && (
                  <div className="absolute top-[2.2vw] right-[0.6vw] bg-white rounded-[0.45vw] shadow-xl border border-gray-100 py-[0.25vw] w-[8.5vw] z-40 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                    <button
                      onClick={() => {
                        const targetShareId = book.shareId || book.v_id;
                        const rawAcc = String(book.access || 'public').toLowerCase();
                        if (targetShareId) {
                          window.open(`/share=${rawAcc}/${targetShareId}`, '_blank');
                        }
                        setOpenMenuId(null);
                      }}
                      className="w-full text-left px-[0.7vw] py-[0.4vw] text-[0.75vw] font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 flex items-center gap-[0.4vw] transition-colors cursor-pointer"
                    >
                      <Icon icon="mdi:book-open-outline" className="w-[0.9vw] h-[0.9vw] text-gray-400" />
                      <span>Open Book</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveBook(book.v_id);
                        setOpenMenuId(null);
                      }}
                      className="w-full text-left px-[0.7vw] py-[0.4vw] text-[0.75vw] font-medium text-red-600 hover:bg-red-50 flex items-center gap-[0.4vw] transition-colors cursor-pointer"
                    >
                      <Icon icon="mdi:trash-can-outline" className="w-[0.9vw] h-[0.9vw] text-red-500" />
                      <span>Remove Book</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Card Details */}
              <div className="p-[0.9vw] flex flex-col flex-1 bg-white">
                {/* Author Info */}
                <div className="flex items-center gap-[0.6vw]">
                  {book.authorPicture && book.authorPicture !== 'color_only' ? (
                    <img
                      src={book.authorPicture}
                      alt={book.authorName}
                      className="w-[2vw] h-[2vw] rounded-full border border-gray-200 object-cover shrink-0"
                    />
                  ) : (
                    <div
                      className="w-[2vw] h-[2vw] rounded-full flex items-center justify-center text-white text-[0.8vw] font-bold shrink-0 shadow-inner"
                      style={{ backgroundColor: book.authorBgColor }}
                    >
                      {(book.authorName || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex flex-col min-w-0 pr-1">
                    <span className="text-[0.82vw] font-semibold text-gray-900 leading-tight truncate">{book.authorName}</span>
                    <span className="flex items-center gap-[0.2vw] text-[0.7vw] text-gray-400 mt-[0.1vw] truncate">
                      <Icon icon="lucide:map-pin" className="w-[0.75vw] h-[0.75vw] text-gray-400 shrink-0" />
                      <span className="truncate">{String(book.location).replace(/📍/g, '').trim()}</span>
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-[0.5vw] justify-start text-[0.72vw] text-gray-600 font-medium mt-[0.7vw] whitespace-nowrap">
                  <div className="flex items-center gap-[0.2vw]">
                    <span className="text-gray-900 font-semibold">
                      {Array.isArray(book.pages) ? book.pages.length : (typeof book.pages === 'number' ? book.pages : 0)}
                    </span>
                    <span className="text-gray-500">Pages</span>
                  </div>
                  <span className="text-gray-300">|</span>
                  <span className="flex items-center gap-[0.2vw]">
                    <Icon icon="lucide:eye" className="w-[0.8vw] h-[0.8vw] text-gray-400" />
                    <span>{book.views || '1.2k'}</span>
                  </span>
                  <span className="text-gray-300">|</span>
                  <span className="flex items-center gap-[0.2vw]">
                    <Icon icon="material-symbols:star" className="w-[0.85vw] h-[0.85vw] text-yellow-400" />
                    <span>{book.rating || 4.5}</span>
                  </span>
                </div>

                {/* Title & Desc & Button */}
                <div className="relative flex-1 mt-[0.6vw]">
                  <h4 className="text-[0.85vw] font-semibold text-gray-900 truncate tracking-tight mb-[0.2vw]">{book.title}</h4>
                  <p className="text-[0.72vw] text-gray-500 font-medium leading-relaxed pr-[2.2vw] line-clamp-2">{book.description}</p>

                  <button
                    onClick={() => {
                      const targetShareId = book.shareId || book.v_id;
                      const rawAcc = String(book.access || 'public').toLowerCase();
                      if (targetShareId) {
                        window.open(`/share=${rawAcc}/${targetShareId}`, '_blank');
                      }
                    }}
                    className="absolute bottom-0 right-0 bg-gray-900 hover:bg-[#FF5733] text-white w-[1.8vw] h-[1.8vw] rounded-full flex items-center justify-center transition-colors shadow-2xs active:scale-95 cursor-pointer"
                  >
                    <Icon icon="mdi:arrow-top-right" className="w-[1vw] h-[1vw]" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </CustomScrollbar>
  );
};

export default ShelfDetailView;

