const express = require('express');
const router = express.Router();
const pdfEditorController = require('../controllers/pdfEditorController');
const { pdfUpload } = require('../middlewares/uploadMiddleware');
const { authenticateUser } = require('../middlewares/authMiddleware');

// Public status / health endpoints (same as page-editor-service /status)
router.get('/status', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'PDF Editor Service is operational',
    timestamp: new Date().toISOString()
  });
});

router.get('/inkscape-status', pdfEditorController.getInkscapeStatus);
router.get('/check-inkscape', pdfEditorController.getInkscapeStatus);

router.get('/office-status', pdfEditorController.getOfficeStatus);
router.get('/check-libreoffice', pdfEditorController.getOfficeStatus);

// Protected routes (requires authenticated user like page-editor-service)

// Office Document to PDF conversion
router.post(
  '/convert-office-to-pdf',
  authenticateUser,
  pdfUpload.single('document'),
  pdfEditorController.convertOfficeToPdfHandler
);

// Inspect Document (PPTX / DOCX / PDF page count & dimensions)
router.post(
  '/inspect-document',
  authenticateUser,
  pdfUpload.single('document'),
  pdfEditorController.inspectDocumentHandler
);

// Convert PDF or Office Document to Vector SVGs with Inkscape
router.post(
  '/convert-pdf-inkscape',
  authenticateUser,
  pdfUpload.any(),
  pdfEditorController.convertPdfInkscapeHandler
);

// Legacy / alias conversion route
router.post(
  '/convert',
  authenticateUser,
  pdfUpload.any(),
  pdfEditorController.convertPdfInkscapeHandler
);

// Export SVGs to Vector PDF
router.post(
  '/export-vector-pdf',
  authenticateUser,
  pdfEditorController.exportVectorPdfHandler
);

module.exports = router;
