const express = require('express');
const {
  getDashboardOverview,
  getMicroservicesHealth,
  getAuditLogs
} = require('../controllers/adminDashboardController');

const router = express.Router();

router.get('/overview', getDashboardOverview);
router.get('/services-health', getMicroservicesHealth);
router.get('/logs', getAuditLogs);

module.exports = router;
