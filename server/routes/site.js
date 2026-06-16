const express = require('express');
const router = express.Router();
const siteController = require('../controllers/siteController');
const auth = require('../middleware/auth');

router.get('/', siteController.getSettings);
router.put('/', auth, siteController.updateSetting);
router.put('/bulk', auth, siteController.updateSettings);

module.exports = router;