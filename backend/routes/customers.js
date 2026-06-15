// routes/customers.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/customerController');

const validate = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').optional().trim(),
  body('city').optional().trim(),
  body('totalSpent').optional().isNumeric()
];

router.get('/', ctrl.getCustomers);
router.get('/:id', ctrl.getCustomer);
router.get('/:id/stats', ctrl.getCustomerStats);
router.post('/', validate, ctrl.createCustomer);
router.put('/:id', validate, ctrl.updateCustomer);
router.delete('/:id', ctrl.deleteCustomer);

module.exports = router;
