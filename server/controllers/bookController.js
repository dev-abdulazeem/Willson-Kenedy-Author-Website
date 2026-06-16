const pool = require('../config/db');
const slugify = require('slugify');
const { sendToAllSubscribers } = require('../services/emailService');

// Get all published books
exports.getBooks = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM books WHERE is_published = true ORDER BY release_date DESC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get single book by slug
exports.getBookBySlug = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM books WHERE slug = $1', [req.params.slug]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: Get all books (including unpublished)
exports.getAllBooksAdmin = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM books ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: Create book
exports.createBook = async (req, res) => {
  try {
    const { title, synopsis, genre, release_date, price, buy_link, is_published } = req.body;
    const cover_image_url = req.file ? `/uploads/${req.file.filename}` : null;
    const slug = slugify(title, { lower: true, strict: true });
    
    const result = await pool.query(
      `INSERT INTO books (title, slug, synopsis, cover_image_url, genre, release_date, price, buy_link, is_published)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [title, slug, synopsis, cover_image_url, genre, release_date, price, buy_link, is_published || false]
    );
    
    const newBook = result.rows[0];
    
    // If published, send email to all subscribers in background
    if (newBook.is_published) {
      sendToAllSubscribers(newBook, pool).catch(err => {
        console.error('Failed to send subscriber emails:', err);
      });
    }
    
    res.status(201).json(newBook);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: Update book
exports.updateBook = async (req, res) => {
  try {
    const { title, synopsis, genre, release_date, price, buy_link, is_published } = req.body;
    const cover_image_url = req.file ? `/uploads/${req.file.filename}` : req.body.existing_image;
    const slug = slugify(title, { lower: true, strict: true });
    
    // Check if book was previously unpublished
    const oldBook = await pool.query('SELECT is_published FROM books WHERE id = $1', [req.params.id]);
    const wasPublished = oldBook.rows[0]?.is_published;
    
    const result = await pool.query(
      `UPDATE books SET title = $1, slug = $2, synopsis = $3, cover_image_url = $4, 
       genre = $5, release_date = $6, price = $7, buy_link = $8, is_published = $9, updated_at = NOW()
       WHERE id = $10 RETURNING *`,
      [title, slug, synopsis, cover_image_url, genre, release_date, price, buy_link, is_published, req.params.id]
    );
    
    const updatedBook = result.rows[0];
    
    // If just published now (was draft before), send emails
    if (is_published && !wasPublished) {
      sendToAllSubscribers(updatedBook, pool).catch(err => {
        console.error('Failed to send subscriber emails:', err);
      });
    }
    
    res.json(updatedBook);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: Delete book
exports.deleteBook = async (req, res) => {
  try {
    await pool.query('DELETE FROM books WHERE id = $1', [req.params.id]);
    res.json({ message: 'Book deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};