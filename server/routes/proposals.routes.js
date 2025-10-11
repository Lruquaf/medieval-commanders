const router = require('express').Router();
const ctrl = require('../controllers/proposals.controller');
const upload = require('../middlewares/upload');
const asyncHandler = require('../middlewares/asyncHandler');
const validate = require('../middlewares/validate');
const { createBody, idParam } = require('../validators/proposals.schema');

router.get('/', asyncHandler(ctrl.listPublic));
router.get('/:id', validate(idParam), asyncHandler(ctrl.getById));
router.post('/', upload, validate(createBody), asyncHandler(ctrl.create));

module.exports = router;


