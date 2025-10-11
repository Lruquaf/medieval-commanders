const router = require('express').Router();
const ctrl = require('../../controllers/admin/cards.controller');
const upload = require('../../middlewares/upload');
const asyncHandler = require('../../middlewares/asyncHandler');
const validate = require('../../middlewares/validate');
const { idParam, createBody, updateBody } = require('../../validators/cards.schema');
const { adminLimiter } = require('../../config/security');

router.get('/', adminLimiter, asyncHandler(ctrl.list));
router.put('/:id', adminLimiter, validate(idParam), upload, validate(updateBody), asyncHandler(ctrl.update));
router.post('/', adminLimiter, upload, validate(createBody), asyncHandler(ctrl.create));
router.delete('/:id', adminLimiter, validate(idParam), asyncHandler(ctrl.remove));

module.exports = router;


