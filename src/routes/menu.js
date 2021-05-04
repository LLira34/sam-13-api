const express = require('express');
const router = express.Router();
const {
  findAll,
  findById,
  insert,
  update,
  destroy,
} = require('../controllers/menu');

router.get('/', findAll);
router.post('/', insert);
router.get('/:id', findById);
router.put('/:id', update);
router.delete('/:id', destroy);

module.exports = router;
