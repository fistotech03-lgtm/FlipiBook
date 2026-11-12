// Backend/services/myflipibook-service/src/analytics_tracking/index.js
const analyticsRoutes = require("./analyticsRoutes");
const FlipbookSessionAnalytics = require("./analyticsModel");
const analyticsController = require("./analyticsController");
const geoIpService = require("./geoIpService");
const deviceService = require("./deviceService");

module.exports = {
  analyticsRoutes,
  FlipbookSessionAnalytics,
  ...analyticsController,
  ...geoIpService,
  ...deviceService
};

