const express = require('express');
const router = express.Router();
const pdfEditorController = require('../controllers/pdfEditorController');
const { authenticateUser } = require('../middlewares/authMiddleware');

// Public status / health endpoint
router.get('/status', pdfEditorController.getServiceStatus);

// Protected conversion route (requires authenticated user)
router.post('/convert', authenticateUser, pdfEditorController.convertPdfToSvg);

module.exports = router;
