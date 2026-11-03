# FlipiBook LocalStorage Audit & Architecture Guide

This document provides a comprehensive audit of all **35 files** touching `localStorage` across the FlipiBook frontend codebase. It establishes strict rules on **security**, **storage quotas**, and **state distribution** across Redux, IndexedDB, LocalStorage, and the Backend Database.

---

## 1. Storage Boundaries & Architectural Rules

| Storage Medium | What Belongs Here | What is FORBIDDEN Here | Size Limit | Lifetime |
| :--- | :--- | :--- | :--- | :--- |
| **LocalStorage** | Tiny UI preferences (< 100 bytes): active folder tab, route memory, boolean toggles, small caches. | ❌ JWT Tokens, Passwords, Book Schemas, Base64/Data URLs, 3D models, Gallery/Slideshow arrays. | **5 MB domain cap** (sync I/O blocks main thread) | Survives reloads & browser restarts |
| **Redux (RTK)** | Active runtime state: currently loaded book, active tool, unsaved changes dirty flags, event trigger counters. | ❌ Non-serializable complex class instances. | In-Memory (RAM) | Reset on page refresh / tab close |
| **IndexedDB** | Heavy client-side assets: offline draft pages, binary image blobs, high-resolution slideshow frames. | ❌ Sensitive session tokens. | **Hundreds of MBs** (Async, Non-blocking) | Persistent |
| **HttpOnly Cookies** | Session JWT tokens and authentication credentials. | ❌ Business UI data or heavy JSON. | 4 KB | Controlled by `Max-Age` / `Expires` |
| **Backend Database** | Canonical Source of Truth: user profile, book schemas, subscriptions, storage quotas, support tickets. | N/A | Server-side | Permanent |

---

## 2. High-Priority Risks Identified

### 🔴 Risk 1: Large Blobs & Heavy JSON (Quota Exceeded Crashes)
`localStorage` is synchronous and limited to **5 MB**. Writing large data blocks the UI thread and throws `QuotaExceededError`:
1. **`customized_editor_gallery`** (`BackgroundPanel.jsx`, `BrandingPanel.jsx`):
   * Stores full arrays of uploaded gallery images. Code currently has fallback warnings: `console.warn("localStorage quota exceeded")`.
   * **Solution:** Move gallery images to Redux / IndexedDB.
2. **`tempThreedEditModel`** (`InteractionPanel.jsx`, `ThreedEditor.jsx`):
   * Stores full 3D model DataURL / Base64 buffers to pass models across browser tabs when clicking "3D Edit".
   * **Solution:** Pass model `v_id` via URL params or pass via Redux/IndexedDB; never store raw 3D data in `localStorage`.
3. **`slideshow_${v_id}_${layerId}`** (`SlideshowProperties.jsx`, `slideshowEditor.jsx`):
   * Stores full arrays of slideshow image objects.
   * **Solution:** Rely exclusively on IndexedDB (which already exists in the project) and remove the `localStorage` fallback.
4. **`flipibook_support_tickets_v4`** (`ticketData.js`, `useTickets.js`):
   * Stores customer support tickets with complete message histories.
   * **Solution:** Tickets must come strictly from the backend API and be kept in memory/React Query.

### 🟡 Risk 2: Legacy Auth Reads
FlipiBook migrated its authentication tokens to **HttpOnly Cookies** and Redux via `authUtils.js`. However, several files still contain legacy calls attempting to read `localStorage.getItem('user')`:
* `Home.jsx` (Line 38)
* `MyShelf.jsx` (Line 135)
* `ElementAudioProperties.jsx` (Line 329)
* **Impact:** Since `user` is no longer kept in `localStorage`, these calls return `null`, causing silent failures (e.g., upload failures or missing email).
* **Solution:** Replace with `const { user } = useAuth();` from Redux.

### ⚪ Risk 3: Dead & Orphan Keys (Write-Only or Read-Only)
* **`book_thumb_${folderName}_${bookName}`** (`OtherSetup.jsx`): Written on cover uploads, but **never read anywhere in the codebase**.
* **`customized_editor_appearance_${v_id}`** & **`customized_editor_branding_${v_id}`** (`FlipbookPreview.jsx`): Read attempts exist, but no component writes them anymore.

---

## 3. Comprehensive File-by-File Audit (All 35 Files)

| # | File Path | Key(s) Used | Current Functionality | Risk / Classification | Target Action |
|:---|:---|:---|:---|:---|:---|
| **1** | `Frontend/src/components/CustomizedEditor/panels/BackgroundPanel.jsx` | `customized_editor_gallery` | Persists uploaded background gallery images | 🔴 **High (Large Data)** | Move to Redux / IndexedDB |
| **2** | `Frontend/src/components/CustomizedEditor/components/OtherSetup.jsx` | `book_thumb_*`, `customized_editor_appearance_*` | Orphan thumbnail write and ghost appearance read | ⚪ **Dead Code** | Remove completely |
| **3** | `Frontend/src/components/CustomizedEditor/panels/BrandingPanel.jsx` | `customized_editor_gallery` | Persists uploaded branding gallery images | 🔴 **High (Large Data)** | Move to Redux / IndexedDB |
| **4** | `Frontend/src/components/CustomizedEditor/popups/LeadFormPopup.jsx` | `lead_form_submitted_${vId}` | Flags if viewer already submitted lead form | 🟢 **Safe UI Presence** | Keep in LocalStorage |
| **5** | `Frontend/src/components/MyFlipbooks/MyShelf.jsx` | `user`, `user_profile` | Attempts to read user email for book list | 🟡 **Legacy Auth Read** | Switch to `useAuth()` (Redux) |
| **6** | `Frontend/src/components/MyFlipbooks/ThreeDDashboard.jsx` | `3d_model_favorites`, `hide_upgrade_card` | Stores favorite 3D model IDs and banner state | 🟢 **Safe UI Presence** | Keep in LocalStorage |
| **7** | `Frontend/src/components/NavBar/EditorNav.jsx` | `lastEditorPath`, `lastCustomizedPath` | Remembers current book URL for "Editor" nav link | 🟢 **Safe UI Presence** | Keep in LocalStorage |
| **8** | `Frontend/src/components/PageEditor/PageEditor.jsx` | `isRulerEnabled`, `isTrimViewEnabled` | Hydrates ruler & trim view toggles on mount | 🟢 **Safe UI Presence** | Keep in LocalStorage |
| **9** | `Frontend/src/components/PageEditor/LeftActionMenu/Elements/properties/ElementAudioProperties.jsx` | `user` | Reads `user.emailId` for asset uploading | 🟡 **Legacy Auth Read** | Switch to `useAuth()` (Redux) |
| **10** | `Frontend/src/components/PageEditor/LeftActionMenu/Elements/properties/slideshowEditor.jsx` | `slideshow_${v_id}_${layerId}` | Stores slide images | 🔴 **High (Large Data)** | Rely on IndexedDB only |
| **11** | `Frontend/src/components/PageEditor/modals/EditorSettingsModal.jsx` | `isTrimViewEnabled`, `isAutoSaveEnabled`, `isRulerEnabled` | Hydrates settings modal toggles | 🟢 **Safe UI Presence** | Keep in LocalStorage |
| **12** | `Frontend/src/components/PageEditor/modals/FlipbookPreview.jsx` | `customized_editor_*`, `previewDevice` | Dead cache reads + active device viewport | ⚪ **Dead Reads / Safe** | Clean dead reads; keep `previewDevice` |
| **13** | `Frontend/src/components/PageEditor/PageEditorModule/useDocumentImport.js` | `hide_upgrade_card` | Unhides upgrade card if storage quota exceeded | 🟢 **Safe UI Presence** | Keep in LocalStorage |
| **14** | `Frontend/src/components/PageEditor/PageEditorModule/useLayerOperations.js` | `slideshow_${vId}_${layerId}` | Cleanup handler when a layer is deleted | ⚠️ **Cleanup helper** | Update with slideshow migration |
| **15** | `Frontend/src/components/PageEditor/panels/InteractionPanel.jsx` | `tempThreedEditModel` | Passes 3D model dataURL to 3D Editor via new tab | 🔴 **High (Crash Risk)** | Pass `v_id` or via Redux/IndexedDB |
| **16** | `Frontend/src/components/PageEditor/panels/RightSidebar.jsx` | `previewDevice` | Remembers Desktop/Tablet/Mobile view | 🟢 **Safe UI Presence** | Keep in LocalStorage |
| **17** | `Frontend/src/components/PageEditor/properties/ImageEditor.jsx` | `slideshow_${vId}_${id}` | Cleans up legacy slideshow storage on delete | ⚠️ **Cleanup helper** | Keep safe cleanup |
| **18** | `Frontend/src/components/PageEditor/properties/SlideshowProperties.jsx` | `slideshow_${vId}_${id}` | Stores array of slideshow images | 🔴 **High (Large Data)** | Rely on IndexedDB only |
| **19** | `Frontend/src/components/Settings/ProfileModal.jsx` | `isAutoSaveEnabled` | Reads initial auto-save switch | 🟢 **Safe UI Presence** | Keep in LocalStorage |
| **20** | `Frontend/src/components/Settings/SettingsLayout.jsx` | `user_profile`, `token`, `auth_token`, etc. | Extended profile cache & logout cleanup | 🟢 **Safe UI Cache / Cleanup** | Keep safe cleanup |
| **21** | `Frontend/src/components/Settings/Account/Account.jsx` | `user_profile` | Extended profile form inputs | 🟢 **Safe UI Cache** | Keep in LocalStorage |
| **22** | `Frontend/src/components/Settings/Account/AccountOverview.jsx` | `user`, `user_profile`, etc. | Logout session cleaner | 🟢 **Safe Cleanup** | Keep safe cleanup |
| **23** | `Frontend/src/components/Settings/Tickets/data/ticketData.js` | `flipibook_support_tickets_v4` | Stores support tickets with message history | 🔴 **Confidential & Large** | Move to Backend API + Redux |
| **24** | `Frontend/src/components/Settings/Tickets/hooks/useTickets.js` | `flipibook_support_tickets_v4` | Support ticket hook fallback | 🔴 **Confidential & Large** | Rely on Backend API |
| **25** | `Frontend/src/components/ThreedEditor/ThreedEditor.jsx` | `tempThreedEditModel` | Reads 3D model passed from Page Editor | 🔴 **High (Crash Risk)** | Consume from URL `v_id` or Redux |
| **26** | `Frontend/src/components/ThreedEditor/hooks/useThreedModelLoader.js` | `tempThreedEditModel` | Cleans up temporary 3D model storage | ⚠️ **Cleanup helper** | Update with 3D model migration |
| **27** | `Frontend/src/hooks/useUserStorage.js` | `user_storage_settings`, `hide_upgrade_card` | Prevents 0% storage meter flicker | 🟢 **Fast UX Cache** | Keep in LocalStorage |
| **28** | `Frontend/src/Layouts/EditorLayout.jsx` | `isTrimViewEnabled`, `isRulerEnabled` | Hydrates settings on editor mount | 🟢 **Safe UI Presence** | Keep in LocalStorage |
| **29** | `Frontend/src/pages/Home.jsx` | `user` | Reads `user.emailId` for flipbook upload | 🟡 **Legacy Auth Read** | Switch to `useAuth()` (Redux) |
| **30** | `Frontend/src/pages/MyFlipbooks.jsx` | `last_active_folder`, `user_storage_settings`, etc. | Remembers folder tab & storage cache | 🟢 **Safe UI Presence** | Keep in LocalStorage |
| **31** | `Frontend/src/pages/shareviewbook.jsx` | `flipbook_viewer_id` | Anonymous viewer UUID (unique analytics) | 🟢 **Safe UI Presence** | Keep in LocalStorage |
| **32** | `Frontend/src/store/slices/activeBookSlice.js` | `isAutoSaveEnabled` | Redux initial state hydration & persistence | 🟢 **Safe UI Presence** | Keep in LocalStorage |
| **33** | `Frontend/src/store/slices/pageEditorSlice.js` | `isRulerEnabled`, `isTrimViewEnabled` | Redux initial state hydration & persistence | 🟢 **Safe UI Presence** | Keep in LocalStorage |
| **34** | `Frontend/src/utils/authUtils.js` | `user`, `user_profile` (clear only) | Security helper clearing legacy items on logout | 🟢 **Security Cleaner** | Keep |
| **35** | `Frontend/src/utils/storageValidation.js` | `user_storage_settings` | Fast local cache update before upload check | 🟢 **Fast UX Cache** | Keep in LocalStorage |

---

## 4. Classification Summary

### Category A: ❌ Remove Completely / Dead Code
* `book_thumb_*` in `OtherSetup.jsx` (Write-only, never read)
* `customized_editor_appearance_*` & `customized_editor_branding_*` in `FlipbookPreview.jsx` (Dead reads)

### Category B: 🟡 Fix Legacy Auth Reads (Migrate to Redux `useAuth()`)
* `Home.jsx` line 38: Replace `localStorage.getItem('user')` with `useAuth()`.
* `MyShelf.jsx` line 135: Replace `localStorage.getItem('user')` with `useAuth()`.
* `ElementAudioProperties.jsx` line 329: Replace `localStorage.getItem('user')` with `useAuth()`.

### Category C: 📦 Move to Redux / IndexedDB (Heavy / Confidential Data)
* `customized_editor_gallery` (Move to `customizedEditorSlice.js` or IndexedDB)
* `tempThreedEditModel` (Pass `v_id` via URL params or IndexedDB)
* `slideshow_*` fallback in `localStorage` (Rely exclusively on IndexedDB)
* `flipibook_support_tickets_v4` (Move to Backend API + React Query)

### Category D: 🟢 Keep in LocalStorage (Safe UX Presence & Performance)
* `last_active_folder` (Current folder tab memory)
* `lastEditorPath` & `lastCustomizedPath` (Editor route memory)
* `previewDevice` (Device switcher memory: Desktop/Tablet/Mobile)
* `hide_upgrade_card` (Dismissed upgrade banner state)
* `isAutoSaveEnabled`, `isRulerEnabled`, `isTrimViewEnabled` (Editor preference hydration)
* `user_storage_settings` (Fast 0ms hydration of storage bar without layout shifts)
* `lead_form_submitted_${vId}` (Lead form spam prevention)
* `flipbook_viewer_id` (Anonymous analytics UUID)
* `3d_model_favorites` (Set of favorited 3D model IDs)
* `user_profile` in Settings/Account (Non-sensitive profile form cache)
