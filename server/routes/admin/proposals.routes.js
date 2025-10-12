const router = require('express').Router();
const ctrl = require('../../controllers/admin/proposals.controller');
const upload = require('../../middlewares/upload');
const asyncHandler = require('../../middlewares/asyncHandler');
const validate = require('../../middlewares/validate');
const { idParam, updateBody } = require('../../validators/proposals.schema');
const { adminLimiter } = require('../../config/security');

router.get('/', adminLimiter, asyncHandler(ctrl.list));
router.post('/:id/approve', adminLimiter, validate(idParam), asyncHandler(ctrl.approve));
router.post('/:id/reject', adminLimiter, validate(idParam), asyncHandler(ctrl.reject));
router.delete('/:id', adminLimiter, validate(idParam), asyncHandler(ctrl.remove));
router.put('/:id', adminLimiter, validate(idParam), upload, validate(updateBody), asyncHandler(ctrl.update));

module.exports = router;


