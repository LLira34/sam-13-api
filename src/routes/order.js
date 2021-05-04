const express = require('express');
const router = express.Router();
const order = require('../controllers/order');

router.post('/', order.createOrder);
router.get('/', order.getOrders);
router.delete('/:id', order.deleteOrder);
router.get('/:id/download', order.download);

module.exports = router;
