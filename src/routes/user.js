const express = require('express');
const router = express.Router();
const { findAll, findById, update } = require('../controllers/user');

router.get('/users', findAll);
router.get('/user/:id', findById);
router.put('/user/:id', update);

module.exports = router;
