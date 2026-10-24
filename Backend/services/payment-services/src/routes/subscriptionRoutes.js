const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middlewares/authMiddleware');
const subscriptionController = require('../controllers/subscriptionController');

router.use(authenticateUser);

router.get('/my-subscription', subscriptionController.getMySubscription);
router.post('/subscribe', subscriptionController.subscribePlan);

module.exports = router;
