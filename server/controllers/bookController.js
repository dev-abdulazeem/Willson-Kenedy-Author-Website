const pool = require('../config/db');
const cloudinary = require('../config/cloudinary');

// Helper: Upload buffer to Cloudinary
const uploadToCloudinary = (buffer, folder = 'willson-kenedy/books') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image', transformation: [{ quality: 'auto' }] },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    const streamifier = require('streamifier');
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

// Helper: Delete from Cloudinary
const deleteFromCloudinary = async (imageUrl) => {
  if (!imageUrl || !imageUrl.includes('cloudinary')) return;
  try {
    const urlParts = imageUrl.split('/upload/');
    if (urlParts.length !== 2) return;
    let publicId = urlParts[1];
    if (publicId.startsWith('v')) {
      publicId = publicId.substring(publicId.indexOf('/') + 1);
    }
    publicId = publicId.split('.')[0];
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.log('Cloudinary delete error:', err.message);
  }
};

// GET all published books (public)
exports.getPublishedBooks = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM books WHERE is_published = true ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET all books (admin)
exports.getAllBooks = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM books ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET single book
exports.getBookById = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM books WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE book
exports.createBook = async (req, res) => {
  try {
    const { title, synopsis, genre, release_date, price, buy_link, is_published } = req.body;
    
    let cover_image_url = null;
    
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      cover_image_url = result.secure_url;
    }

    const result = await pool.query(
      `INSERT INTO books (title, synopsis, genre, release_date, price, buy_link, is_published, cover_image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        title,
        synopsis,
        genre || null,
        release_date ? new Date(release_date) : null,
        price ? parseFloat(price) : null,
        buy_link || null,
        is_published === 'true' || is_published === true,
        cover_image_url
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE book
exports.updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, synopsis, genre, release_date, price, buy_link, is_published } = req.body;
    
    const current = await pool.query('SELECT * FROM books WHERE id = $1', [id]);
    if (current.rows.length === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    const book = current.rows[0];
    let cover_image_url = book.cover_image_url;

    if (req.file) {
      if (book.cover_image_url) {
        await deleteFromCloudinary(book.cover_image_url);
      }
      const result = await uploadToCloudinary(req.file.buffer);
      cover_image_url = result.secure_url;
    }

    const result = await pool.query(
      `UPDATE books 
       SET title = $1, synopsis = $2, genre = $3, release_date = $4, 
           price = $5, buy_link = $6, is_published = $7, cover_image_url = $8,
           updated_at = NOW()
       WHERE id = $9 RETURNING *`,
      [
        title || book.title,
        synopsis !== undefined ? synopsis : book.synopsis,
        genre !== undefined ? genre : book.genre,
        release_date ? new Date(release_date) : book.release_date,
        price !== undefined ? (price ? parseFloat(price) : null) : book.price,
        buy_link !== undefined ? buy_link : book.buy_link,
        is_published !== undefined ? (is_published === 'true' || is_published === true) : book.is_published,
        cover_image_url,
        id
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE book
exports.deleteBook = async (req, res) => {
  try {
    const { id } = req.params;
    
    const current = await pool.query('SELECT * FROM books WHERE id = $1', [id]);
    if (current.rows.length === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }

    if (current.rows[0].cover_image_url) {
      await deleteFromCloudinary(current.rows[0].cover_image_url);
    }

    await pool.query('DELETE FROM books WHERE id = $1', [id]);
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};