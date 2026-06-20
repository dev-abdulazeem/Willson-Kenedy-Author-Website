const pool = require('../config/db');
const slugify = require('slugify');
const cloudinary = require('../config/cloudinary');

// Helper: upload buffer to Cloudinary
const uploadToCloudinary = (buffer, mimetype) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'willson-kenedy-blog',
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
};

// Get all published posts
exports.getPosts = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM posts WHERE is_published = true ORDER BY published_at DESC NULLS LAST'
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
    const { title, content, excerpt } = req.body;
    const is_published = req.body.is_published === 'true' || req.body.is_published === true;
    
    // Upload to Cloudinary if file exists
    let cover_image = null;
    if (req.file) {
      cover_image = await uploadToCloudinary(req.file.buffer, req.file.mimetype);
    }
    
    const slug = slugify(title, { lower: true, strict: true });
    const published_at = is_published ? new Date() : null;
    
    const result = await pool.query(
      `INSERT INTO posts (title, slug, content, excerpt, cover_image, is_published, published_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [title, slug, content, excerpt, cover_image, is_published, published_at]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create post error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Admin: Update post
exports.updatePost = async (req, res) => {
  try {
    const { title, content, excerpt } = req.body;
    const is_published = req.body.is_published === 'true' || req.body.is_published === true;
    
    // Upload new image to Cloudinary if file exists, otherwise keep existing
    let cover_image;
    if (req.file) {
      cover_image = await uploadToCloudinary(req.file.buffer, req.file.mimetype);
    } else if (req.body.existing_image && req.body.existing_image !== 'null' && req.body.existing_image !== '') {
      cover_image = req.body.existing_image;
    } else {
      cover_image = null;
    }
    
    const slug = slugify(title, { lower: true, strict: true });
    
    const currentPost = await pool.query('SELECT is_published, published_at FROM posts WHERE id = $1', [req.params.id]);
    const wasPublished = currentPost.rows[0]?.is_published;
    const published_at = (is_published && !wasPublished) ? new Date() : currentPost.rows[0]?.published_at;
    
    const result = await pool.query(
      `UPDATE posts SET title = $1, slug = $2, content = $3, excerpt = $4, 
       cover_image = $5, is_published = $6, published_at = $7, updated_at = NOW()
       WHERE id = $8 RETURNING *`,
      [title, slug, content, excerpt, cover_image, is_published, published_at, req.params.id]
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update post error:', err);
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