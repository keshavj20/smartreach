const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/audienceController');
const { aiRateLimiter } = require('../middleware/rateLimiter');

router.get('/discover', ctrl.discoverAudiences);
router.post('/ai-recommendation', aiRateLimiter, ctrl.getAIRecommendation);
router.get('/saved', ctrl.getSavedDiscoveries);

module.exports = router;
