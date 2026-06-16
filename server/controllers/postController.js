const pool = require('../config/db');
const slugify = require('slugify');

// Get all published posts
exports.getPosts = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM posts WHERE is_published = true ORDER BY published_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get single post by slug
exports.getPostBySlug = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM posts WHERE slug = $1', [req.params.slug]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: Get all posts
exports.getAllPostsAdmin = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM posts ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: Create post
exports.createPost = async (req, res) => {
  try {
    const { title, content, excerpt, is_published } = req.body;
    const cover_image = req.file ? `/uploads/${req.file.filename}` : null;
    const slug = slugify(title, { lower: true, strict: true });
    const published_at = is_published ? new Date() : null;
    
    const result = await pool.query(
      `INSERT INTO posts (title, slug, content, excerpt, cover_image, is_published, published_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [title, slug, content, excerpt, cover_image, is_published || false, published_at]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: Update post
exports.updatePost = async (req, res) => {
  try {
    const { title, content, excerpt, is_published } = req.body;
    const cover_image = req.file ? `/uploads/${req.file.filename}` : req.body.existing_image;
    const slug = slugify(title, { lower: true, strict: true });
    
    const result = await pool.query(
      `UPDATE posts SET title = $1, slug = $2, content = $3, excerpt = $4, 
       cover_image = $5, is_published = $6, updated_at = NOW()
       WHERE id = $7 RETURNING *`,
      [title, slug, content, excerpt, cover_image, is_published, req.params.id]
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: Delete post
exports.deletePost = async (req, res) => {
  try {
    await pool.query('DELETE FROM posts WHERE id = $1', [req.params.id]);
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};