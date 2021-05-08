const express = require('express');
const router = express.Router();
const { insert, findAll, destroy, download } = require('../controllers/order');

router.post('/', insert);
router.get('/', findAll);
router.delete('/:id', destroy);
router.get('/:id/download', download);

module.exports = router;
