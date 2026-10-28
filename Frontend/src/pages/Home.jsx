import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';

import CreateFlipbookModal from '../components/CreateFlipbookModal';
import AlertModal from '../components/AlertModal';
import PdfProcessingLoader from '../components/PdfProcessingLoader';
import Footer from './Footer';
import { convertPdfWithInkscape, generatePdfPageSvg, getOfficeDocType, svgToDataUrl } from '../utils/pdfUtils';

// Modular Sections
import HeroSection from './Home/HeroSection';
import InteractiveDemo from './Home/InteractiveDemo';
import AboutUsSection from './Home/AboutUsSection';
import WhyChooseFlipibook from './Home/WhyChooseFlipibook';
import ExploreShowcase from './Home/ExploreShowcase';
import SmartSolutionsSection from './Home/SmartSolutionsSection';
import ArIntegrationSection from './Home/ArIntegrationSection';
import ReadingExperienceDark from './Home/ReadingExperienceDark';
import HowItWorksSection from './Home/HowItWorksSection';
import FAQSection from './Home/FAQSection';
import BuildYourDreamCta from './Home/BuildYourDreamCta';

// Assets for Hero Flipbook
import page1 from '../assets/Home/A4_1.png';
import page2 from '../assets/Home/A4_2.png';
import page3 from '../assets/Home/A4_3.png';
import page4 from '../assets/Home/A4_4.png';
import page5 from '../assets/Home/A4_5.png';
import page6 from '../assets/Home/A4_6.png';

export default function Home() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const navigate = useNavigate();

  // User Data
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;
  const emailId = user?.emailId;
  const backendUrl = import.meta.env.VITE_BACKEND_URL || '';

  const [isLoading, setIsLoading] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(null);
  const isUploadCancelledRef = useRef(false);
  const createdFlipbookVIdRef = useRef(null);
  const [alertState, setAlertState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'error',
    showCancel: false,
    onConfirm: null
  });

  const showAlert = (title, message, type = 'error') => {
    setAlertState({
      isOpen: true,
      title,
      message,
      type,
      showCancel: false,
      onConfirm: () => setAlertState(prev => ({ ...prev, isOpen: false }))
    });
  };

  const blobToBase64 = (blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const handleUploadPDF = async (files, customName) => {
    if (!files || files.length === 0) return;
    setIsCreateModalOpen(false);
    setIsLoading(true);
    isUploadCancelledRef.current = false;
    createdFlipbookVIdRef.current = null;

    const firstFile = files[0];
    const initialDocType = firstFile._docType || getOfficeDocType(firstFile.name);
    const initialDocLabel = initialDocType === 'word' ? 'Word document' : initialDocType === 'powerpoint' ? 'PowerPoint presentation' : 'file';
    const initialPageCount = firstFile._pageCount || 1;

    setProcessingProgress({
      current: 1,
      total: files.length,
      fileIndex: 0,
      totalFiles: files.length,
      pageCount: initialPageCount,
      message: files.length > 1
        ? `Converting queued ${initialDocLabel} 1 of ${files.length} (${firstFile.name})...`
        : `Converting ${initialDocLabel}: ${firstFile.name}...`,
      fileName: firstFile.name,
      stage: 'converting'
    });

    try {
      const MAX_TOTAL_PAGES = Infinity;
      let totalPdfSize = 0;
      for (const file of files) {
        totalPdfSize += file.size || 0;
      }
      let allImages = [];

      for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
        if (isUploadCancelledRef.current) return;
        const file = files[fileIndex];
        if (allImages.length >= MAX_TOTAL_PAGES) break;

        const remainingPages = MAX_TOTAL_PAGES - allImages.length;
        const docType = file._docType || getOfficeDocType(file.name);
        const docLabel = docType === 'word' ? 'Word document' : docType === 'powerpoint' ? 'PowerPoint presentation' : 'file';
        const detectedCount = file._pageCount || 1;

        setProcessingProgress({
          current: fileIndex + 1,
          total: files.length,
          fileIndex,
          totalFiles: files.length,
          pageCount: detectedCount,
          message: files.length > 1
            ? `Converting queued ${docLabel} ${fileIndex + 1} of ${files.length} (${file.name})...`
            : `Converting ${docLabel}: ${file.name}...`,
          fileName: file.name,
          stage: 'converting'
        });
        const images = await convertPdfWithInkscape(file, remainingPages, backendUrl);
        if (isUploadCancelledRef.current) return;
        allImages = [...allImages, ...images];
      }

      if (isUploadCancelledRef.current) return;

      if (allImages.length === 0) {
        showAlert("Error", "No pages could be extracted from the selected files.");
        return;
      }

      const firstW = allImages[0].width;
      const firstH = allImages[0].height;
      const isUniform = allImages.every(img =>
        Math.abs(img.width - firstW) < 1 &&
        Math.abs(img.height - firstH) < 1
      );
      if (!isUniform) {
        showAlert("Uniformity Error", "Selected PDF pages have different dimensions. All pages in a flipbook must have the same size to ensure a professional layout.");
        return;
      }
      const maxWidth = firstW;
      const maxHeight = firstH;

      const now = new Date();
      const timeString = now.toISOString().replace(/[-:T.]/g, '').slice(0, 14);
      const defaultPrefix = initialDocType === 'word' ? 'Word_Flipbook_' : initialDocType === 'powerpoint' ? 'PPT_Flipbook_' : 'PDF_Flipbook_';
      let uniqueName = customName;
      if (!uniqueName || (uniqueName.startsWith('PDF_Flipbook_') && initialDocType !== 'pdf')) {
        uniqueName = customName ? customName.replace(/^PDF_Flipbook_/, defaultPrefix) : `${defaultPrefix}${timeString}`;
      }
      const targetFolder = 'My_Flipbooks';

      setProcessingProgress({
        current: 0,
        total: allImages.length,
        totalFiles: files.length,
        message: 'Saving pages & binding flipbook...',
        fileName: uniqueName,
        stage: 'saving'
      });
      const allPages = await Promise.all(allImages.map(async (img, idx) => {
        const pageIndex = idx + 1;
        const base64Url = img.dataUrl || (img.content ? svgToDataUrl(img.content) : "") || (img.blob ? await blobToBase64(img.blob) : "");
        const html = img.content || generatePdfPageSvg(base64Url, `Page ${pageIndex}`, maxWidth, maxHeight, true);
        return {
          pageName: `Page ${pageIndex}`,
          content: html,
          pageNumber: pageIndex
        };
      }));

      if (isUploadCancelledRef.current) return;

      if (allPages.length <= 20) {
        setProcessingProgress({
          current: allPages.length,
          total: allPages.length,
          totalFiles: files.length,
          message: 'Saving pages & binding flipbook...',
          fileName: uniqueName,
          stage: 'saving'
        });
        const createRes = await axios.post(`${backendUrl}/api/flipbook/save`, {
          emailId,
          flipbookName: uniqueName,
          pages: allPages,
          overwrite: true,
          folderName: targetFolder,
          keepBase64: true,
          fileSize: totalPdfSize || allImages.reduce((sum, img) => sum + (img.blob?.size || 0), 0)
        });
        const v_id = createRes.data.v_id;
        createdFlipbookVIdRef.current = v_id;

        if (isUploadCancelledRef.current) {
          axios.delete(`${backendUrl}/api/flipbook/delete/${v_id}`, { params: { emailId } }).catch(() => { });
          return;
        }

        setProcessingProgress({
          current: allPages.length,
          total: allPages.length,
          totalFiles: files.length,
          message: 'Opening flipbook...',
          fileName: uniqueName,
          stage: 'done'
        });

        const isFolId = (val) => Boolean(val && typeof val === 'string' && val.startsWith('fol_'));
        const folderVId = (isFolId(createRes?.data?.folder_v_id) ? createRes.data.folder_v_id : null) ||
          (isFolId(createRes?.data?.folder_id) ? createRes.data.folder_id : null) ||
          'fol_default';
        navigate(`/editor/${encodeURIComponent(folderVId)}/${v_id}`);
        return;
      }

      const initialBatch = allPages.slice(0, 20);
      const createRes = await axios.post(`${backendUrl}/api/flipbook/save`, {
        emailId,
        flipbookName: uniqueName,
        pages: initialBatch,
        overwrite: true,
        folderName: targetFolder,
        keepBase64: true,
        fileSize: totalPdfSize || allImages.reduce((sum, img) => sum + (img.blob?.size || 0), 0)
      });
      const v_id = createRes.data.v_id;
      createdFlipbookVIdRef.current = v_id;

      const BATCH_SIZE = 15;
      for (let i = 20; i < allPages.length; i += BATCH_SIZE) {
        if (isUploadCancelledRef.current) {
          axios.delete(`${backendUrl}/api/flipbook/delete/${v_id}`, { params: { emailId } }).catch(() => { });
          return;
        }
        const batchPages = allPages.slice(i, i + BATCH_SIZE);
        setProcessingProgress({
          current: Math.min(i + BATCH_SIZE, allPages.length),
          total: allPages.length,
          totalFiles: files.length,
          message: `Saving pages ${i + 1} to ${Math.min(i + BATCH_SIZE, allPages.length)} of ${allPages.length}...`,
          fileName: uniqueName,
          stage: 'saving'
        });
        await axios.post(`${backendUrl}/api/flipbook/save-pages-batch`, {
          emailId,
          v_id,
          pages: batchPages,
          keepBase64: true,
          fileSize: totalPdfSize
        });
      }

      if (isUploadCancelledRef.current) {
        axios.delete(`${backendUrl}/api/flipbook/delete/${v_id}`, { params: { emailId } }).catch(() => { });
        return;
      }

      setProcessingProgress({
        current: allPages.length,
        total: allPages.length,
        totalFiles: files.length,
        message: 'Opening flipbook...',
        fileName: uniqueName,
        stage: 'done'
      });

      const isFolId = (val) => Boolean(val && typeof val === 'string' && val.startsWith('fol_'));
      const folderVId = (isFolId(createRes?.data?.folder_v_id) ? createRes.data.folder_v_id : null) ||
        (isFolId(createRes?.data?.folder_id) ? createRes.data.folder_id : null) ||
        'fol_default';
      navigate(`/editor/${encodeURIComponent(folderVId)}/${v_id}`);

    } catch (error) {
      if (!isUploadCancelledRef.current) {
        console.error("PDF/Document conversion error:", error);
        const rawMsg = error.response?.data?.message || error.message || "";
        const isCorrupt = error.response?.data?.isCorrupted ||
          /corrupt|cannot be read|not be loaded|damaged|password|format error|failed to parse|invalid pdf|syntax error/i.test(rawMsg);
        const userMessage = isCorrupt
          ? (rawMsg.includes("is corrupted") || rawMsg.includes("corrupted, unreadable") ? rawMsg : "Your file is corrupted, unreadable, or password-protected. Please check your document and try again.")
          : (rawMsg || "Failed to process document. Please try again.");
        showAlert(isCorrupt ? "File Corrupted" : "Error", userMessage);
      }
    } finally {
      setIsLoading(false);
      setProcessingProgress(null);
      isUploadCancelledRef.current = false;
    }
  };

  const handleCancelUploadPDF = () => {
    isUploadCancelledRef.current = true;
    setIsLoading(false);
    setProcessingProgress(null);
    if (createdFlipbookVIdRef.current) {
      axios.delete(`${backendUrl}/api/flipbook/delete/${createdFlipbookVIdRef.current}`, { params: { emailId } }).catch(() => { });
      createdFlipbookVIdRef.current = null;
    }
  };

  const handleUseTemplate = async (templateData) => {
    setIsCreateModalOpen(false);
    if (!templateData) return;

    if (!emailId) {
      navigate('/editor', { state: templateData });
      return;
    }

    setIsLoading(true);
    try {
      const pageCount = templateData.pageCount || 12;
      const pages = Array.from({ length: pageCount }, (_, i) => ({
        pageName: `Page ${i + 1}`,
        content: ''
      }));

      const now = new Date();
      const timeString = now.toISOString().replace(/[-:T.]/g, '').slice(0, 14);
      const uniqueName = templateData.flipbookName || `Flipbook_${timeString}`;
      const targetFolder = 'My_Flipbooks';

      const res = await axios.post(`${backendUrl}/api/flipbook/save`, {
        emailId,
        flipbookName: uniqueName,
        pages: pages,
        overwrite: true,
        folderName: targetFolder,
        meta: {
          width: templateData.width,
          height: templateData.height,
          templateId: templateData.templateId,
          orientation: templateData.orientation
        }
      });

      if (res.data && res.data.v_id) {
        const folderVId = res.data?.folder_v_id || res.data?.folder_id || res.data?.book?.folder_v_id || 'fol_default';
        navigate(`/editor/${encodeURIComponent(folderVId)}/${res.data.v_id}`, { state: { ...templateData, folder_v_id: folderVId } });
      } else {
        navigate('/editor', { state: templateData });
      }
    } catch (e) {
      console.error("Creation failed", e);
      navigate('/editor', { state: templateData });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white text-[#1a1a1a] font-poppins overflow-x-hidden scroll-smooth">
      
      {/* 1. HERO SECTION: IDC & Interactive Catalogue */}
      <HeroSection
        navigate={navigate}
        page1={page1}
        page2={page2}
        page3={page3}
        page4={page4}
        page5={page5}
        page6={page6}
      />

      {/* 2. INTERACTIVE DEMO: Experience Flipbooks in Action (5 Books shelf) */}
      <InteractiveDemo />

      {/* 3. ABOUT US: We Transform Digital Ideas (Multi-device display) */}
      <AboutUsSection />

      {/* 4. WHY CHOOSE FLIPBOOK? (Dark Theme with Milestones & Paper Plane curve) */}
      <WhyChooseFlipibook />

      {/* 5. EXPLORE: Discover. Read. Get Inspired (5 Community Cards Slider) */}
      <ExploreShowcase
        navigate={navigate}
        onOpenCreateModal={handleOpenCreateModal}
      />

      {/* 6. FEATURES: IT STARTS WITH A CLICK (3D Model Viewer & Smart Solutions) */}
      <SmartSolutionsSection />

      {/* 7. AR INTEGRATION: See Products in Real Space */}
      <ArIntegrationSection />

      {/* 8. FEATURES: Not Just Pages. A 3D Reading Experience (Dark Living Room 3D model) */}
      <ReadingExperienceDark
        onOpenCreateModal={handleOpenCreateModal}
      />

      {/* 9. HOW IT WORKS: Create Your Flipbook in 4 Simple Steps */}
      <HowItWorksSection />

      {/* 10. COMMON QUESTIONS ABOUT FLIPIBOOK (FAQ Accordion Grid) */}
      <FAQSection />

      {/* 11. LET'S BUILD YOUR DREAM INTERACTIVE DIGITAL CATALOGUE (IDC Pre-footer) */}
      <BuildYourDreamCta
        onOpenCreateModal={handleOpenCreateModal}
      />

      {/* 12. GLOBAL FOOTER */}
      <Footer />

      {/* Modals & Overlays */}
      <CreateFlipbookModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onUpload={handleUploadPDF}
        onTemplate={handleUseTemplate}
      />

      <PdfProcessingLoader progress={processingProgress} onCancel={handleCancelUploadPDF} />

      <AnimatePresence>
        {isLoading && !processingProgress && (
          <motion.div
            key="home-loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm gap-3"
          >
            <div className="w-10 h-10 border-4 border-orange-500/30 border-t-[#ea7233] rounded-full animate-spin"></div>
            <span className="text-sm font-semibold text-gray-700 tracking-wide">Loading...</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AlertModal
        isOpen={alertState.isOpen}
        onClose={() => setAlertState(prev => ({ ...prev, isOpen: false }))}
        type={alertState.type}
        title={alertState.title}
        message={alertState.message}
        showCancel={alertState.showCancel}
        onConfirm={alertState.onConfirm}
      />

    </div>
  );
}