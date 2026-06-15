const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/analyticsController');
router.get('/dashboard', ctrl.getDashboard);
module.exports = router;
