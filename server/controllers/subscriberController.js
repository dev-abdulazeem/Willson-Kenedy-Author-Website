const pool = require('../config/db');

// Public: Subscribe
exports.subscribe = async (req, res) => {
  try {
    const { email } = req.body;
    
    const existing = await pool.query('SELECT * FROM subscribers WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'Email already subscribed' });
    }
    
    const result = await pool.query(
      'INSERT INTO subscribers (email) VALUES ($1) RETURNING *',
      [email]
    );
    
    res.status(201).json({ message: 'Subscribed successfully', subscriber: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: Get all subscribers
exports.getSubscribers = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM subscribers ORDER BY subscribed_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: Delete subscriber
exports.deleteSubscriber = async (req, res) => {
  try {
    await pool.query('DELETE FROM subscribers WHERE id = $1', [req.params.id]);
    res.json({ message: 'Subscriber removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};