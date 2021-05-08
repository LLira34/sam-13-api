const express = require('express');
const router = express.Router();
const {
  authenticate,
  profile,
  putForgot,
  putReset,
  register,
} = require('../controllers/auth');
const jwtHelper = require('../util/jwt-helper');

router.post('/register', register);
router.post('/authenticate', authenticate);
router.get('/profile', jwtHelper.verifyJwtToken, profile);

router.post('/forgot', putForgot);
router.put('/reset/:token', putReset);

module.exports = router;
