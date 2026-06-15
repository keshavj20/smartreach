const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/settingsController');
router.get('/', ctrl.getSettings);
router.post('/', ctrl.updateSettings);
module.exports = router;

// Test email connection
router.get('/test-email', async (req, res) => {
  const emailService = require('../services/emailService');
  const result = await emailService.verifyConnection();
  res.json(result);
});
