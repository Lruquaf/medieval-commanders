const router = require('express').Router();
const { env } = require('../config/env');

router.use('/health', require('./health.routes'));
if (!env.IS_PRODUCTION) {
  router.use('/debug', require('./debug.routes'));
}
router.use('/cards', require('./cards.routes'));
router.use('/proposals', require('./proposals.routes'));
router.use('/admin/cards', require('./admin/cards.routes'));
router.use('/admin/proposals', require('./admin/proposals.routes'));
router.use('/admin', require('./admin/settings.routes'));

module.exports = router;


