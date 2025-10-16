const router = require('express').Router();
const ctrl = require('../../controllers/admin/settings.controller');
const asyncHandler = require('../../middlewares/asyncHandler');
const validate = require('../../middlewares/validate');
const { updateSettingsBody } = require('../../validators/admin.schema');
const { authenticateAdmin } = require('../../middlewares/auth');

router.get('/settings', authenticateAdmin, asyncHandler(ctrl.get));
router.put('/settings', authenticateAdmin, validate(updateSettingsBody), asyncHandler(ctrl.update));

module.exports = router;


