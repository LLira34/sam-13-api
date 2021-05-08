const express = require('express');
const router = express.Router();
const user = require('../controllers/user');

router.get('/users', user.getUsers);
router.get('/user/:id', user.getUser);
router.put('/user/:id', user.editUser);

module.exports = router;
