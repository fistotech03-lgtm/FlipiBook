const express = require('express');
const { verifyAdmin } = require('../middlewares/adminAuthMiddleware');
const adminDashboardRoutes = require('./adminDashboardRoutes');
const adminUserRoutes = require('./adminUserRoutes');
const adminBookRoutes = require('./adminBookRoutes');
const adminForumRoutes = require('./adminForumRoutes');

const router = express.Router();

// Enforce admin privileges across all admin routes
router.use(verifyAdmin);

// Sub-modules
router.use('/dashboard', adminDashboardRoutes);
router.use('/users', adminUserRoutes);
router.use('/flipbooks', adminBookRoutes);
router.use('/forum', adminForumRoutes);

module.exports = router;
