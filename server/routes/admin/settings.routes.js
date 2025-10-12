const router = require('express').Router();
const ctrl = require('../../controllers/admin/settings.controller');
const asyncHandler = require('../../middlewares/asyncHandler');
const validate = require('../../middlewares/validate');
const { updateSettingsBody } = require('../../validators/admin.schema');

router.get('/settings', asyncHandler(ctrl.get));
router.put('/settings', validate(updateSettingsBody), asyncHandler(ctrl.update));

module.exports = router;


