const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/', auth, upload.single('image'), uploadController.uploadImage);
router.delete('/:filename', auth, uploadController.deleteImage);

module.exports = router;