const express = require('express');
const router = express.Router();
const pageController = require('../controllers/pageController');
const { authenticateUser } = require('../middlewares/authMiddleware');

// All page operations strictly authenticate user first
router.post('/save-page', authenticateUser, pageController.savePage);
router.post('/save-pages-batch', authenticateUser, pageController.savePagesBatch);
router.get('/get-page', authenticateUser, pageController.getPage);
router.post('/rename-page', authenticateUser, pageController.renamePage);
router.post('/delete-page', authenticateUser, pageController.deletePage);
router.post('/inline-svgs', authenticateUser, pageController.inlineSvgs);

module.exports = router;
