const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/campaignController');

const validate = [
  body('name').trim().notEmpty().withMessage('Campaign name is required'),
  body('audienceName').trim().notEmpty().withMessage('Audience name is required'),
  body('channel').notEmpty().withMessage('Channel is required'),
  body('message').trim().notEmpty().withMessage('Message is required')
];

router.get('/', ctrl.getCampaigns);
router.get('/:id', ctrl.getCampaign);
router.get('/:id/stats', ctrl.getCampaignStats);
router.post('/', validate, ctrl.createCampaign);
router.put('/:id', ctrl.updateCampaign);
router.delete('/:id', ctrl.deleteCampaign);
router.post('/:id/send', ctrl.sendCampaign);

module.exports = router;
