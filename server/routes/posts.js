const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public
router.get('/', postController.getPosts);
router.get('/:slug', postController.getPostBySlug);

// Admin
router.get('/admin/all', auth, postController.getAllPostsAdmin);
router.post('/', auth, upload.single('cover'), postController.createPost);
router.put('/:id', auth, upload.single('cover'), postController.updatePost);
router.delete('/:id', auth, postController.deletePost);

module.exports = router;