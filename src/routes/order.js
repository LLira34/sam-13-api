const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
  deleteOrder,
  download,
} = require('../controllers/order');

router.post('/', createOrder);
router.get('/', getOrders);
router.delete('/:id', deleteOrder);
router.get('/:id/download', download);

module.exports = router;
