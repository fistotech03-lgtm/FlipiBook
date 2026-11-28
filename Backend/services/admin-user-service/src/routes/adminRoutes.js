const express = require('express');
const { verifyAdmin } = require('../middlewares/adminAuthMiddleware');
const adminDashboardRoutes = require('./adminDashboardRoutes');
const adminUserRoutes = require('./adminUserRoutes');
const adminBookRoutes = require('./adminBookRoutes');
const adminForumRoutes = require('./adminForumRoutes');
const editor3dRoutes = require('../3d_editor/routes');
const adminRoleManagementRoutes = require('./adminRoleManagementRoutes');
const adminAuthRoutes = require('./adminAuthRoutes');

const router = express.Router();

// Public Admin Auth Sub-module (login / logout)
router.use('/auth', adminAuthRoutes);

// Enforce admin privileges across all protected admin routes below
router.use(verifyAdmin);

// Sub-modules
router.use('/dashboard', adminDashboardRoutes);
router.use('/users', adminUserRoutes);
router.use('/flipbooks', adminBookRoutes);
router.use('/forum', adminForumRoutes);
router.use('/3d-editor', editor3dRoutes);
router.use('/', adminRoleManagementRoutes);

module.exports = router;
