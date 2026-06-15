const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/orderController');

const validate = [
  body('customerId').notEmpty().withMessage('Customer ID is required'),
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('category').notEmpty().withMessage('Category is required')
];

router.get('/', ctrl.getOrders);
router.get('/:id', ctrl.getOrder);
router.post('/', validate, ctrl.createOrder);
router.put('/:id', validate, ctrl.updateOrder);
router.delete('/:id', ctrl.deleteOrder);

module.exports = router;
