const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public
router.get('/', bookController.getBooks);
router.get('/:slug', bookController.getBookBySlug);

// Admin
router.get('/admin/all', auth, bookController.getAllBooksAdmin);
router.post('/', auth, upload.single('cover'), bookController.createBook);
router.put('/:id', auth, upload.single('cover'), bookController.updateBook);
router.delete('/:id', auth, bookController.deleteBook);

module.exports = router;