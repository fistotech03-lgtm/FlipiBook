const express = require('express');
const router = express.Router();
const planController = require('../controllers/planController');

// Public routes for viewing plans
router.get('/', planController.getPlans);
router.get('/seed', planController.seedPlans);
router.post('/seed', planController.seedPlans);
router.get('/:planId', planController.getPlanById);

module.exports = router;
