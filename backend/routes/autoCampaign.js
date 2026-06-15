const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/autoCampaignController');
const { aiRateLimiter } = require('../middleware/rateLimiter');

router.get('/segments', ctrl.getSegments);
router.post('/preview', aiRateLimiter, ctrl.previewOffer);
router.post('/generate', aiRateLimiter, ctrl.generateAndSend);

module.exports = router;
