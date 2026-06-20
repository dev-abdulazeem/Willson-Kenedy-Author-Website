const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');  // <-- removed { }

router.post('/', auth, upload.single('image'), uploadController.uploadImage);
router.delete('/', auth, uploadController.deleteImage);

module.exports = router;