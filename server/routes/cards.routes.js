const router = require('express').Router();
const ctrl = require('../controllers/cards.controller');
const asyncHandler = require('../middlewares/asyncHandler');

router.get('/', asyncHandler(ctrl.getApproved));
router.get('/all', asyncHandler(ctrl.getAll));
router.get('/:id', asyncHandler(ctrl.getById));

module.exports = router;


