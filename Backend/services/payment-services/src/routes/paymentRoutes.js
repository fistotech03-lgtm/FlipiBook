const express = require('express');
const router = express.Router();
const planRoutes = require('./planRoutes');
const subscriptionRoutes = require('./subscriptionRoutes');

// Mount sub-routes
router.use('/plans', planRoutes);
router.use('/subscription', subscriptionRoutes);

module.exports = router;
