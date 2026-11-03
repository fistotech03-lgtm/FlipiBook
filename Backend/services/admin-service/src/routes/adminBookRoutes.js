const express = require('express');
const {
  listFlipbooks,
  getFlipbookDetails,
  moderateFlipbook,
  deleteFlipbook
} = require('../controllers/adminBookController');

const router = express.Router();

router.get('/', listFlipbooks);
router.get('/:id', getFlipbookDetails);
router.patch('/:id/moderate', moderateFlipbook);
router.delete('/:id', deleteFlipbook);

module.exports = router;
