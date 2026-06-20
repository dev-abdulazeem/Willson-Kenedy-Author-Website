const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');  // <-- removed { }

router.get('/', bookController.getPublishedBooks);
router.get('/:id', bookController.getBookById);
router.get('/admin/all', auth, bookController.getAllBooks);
router.post('/', auth, upload.single('cover'), bookController.createBook);
router.put('/:id', auth, upload.single('cover'), bookController.updateBook);
router.delete('/:id', auth, bookController.deleteBook);

module.exports = router;