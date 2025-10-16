const router = require('express').Router();
const ctrl = require('../../controllers/admin/cards.controller');
const upload = require('../../middlewares/upload');
const asyncHandler = require('../../middlewares/asyncHandler');
const validate = require('../../middlewares/validate');
const { idParam, createBody, updateBody } = require('../../validators/cards.schema');
const { adminLimiter } = require('../../config/security');
const { authenticateAdmin } = require('../../middlewares/auth');

router.get('/', adminLimiter, authenticateAdmin, asyncHandler(ctrl.list));
router.put('/:id', adminLimiter, authenticateAdmin, validate(idParam), upload, validate(updateBody), asyncHandler(ctrl.update));
router.post('/', adminLimiter, authenticateAdmin, upload, validate(createBody), asyncHandler(ctrl.create));
router.delete('/:id', adminLimiter, authenticateAdmin, validate(idParam), asyncHandler(ctrl.remove));

module.exports = router;


