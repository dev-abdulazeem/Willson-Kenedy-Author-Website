const pool = require('../config/db');

// Public: Send message
exports.sendMessage = async (req, res) => {
  try {
    const { name, email, subject, body } = req.body;
    
    const result = await pool.query(
      'INSERT INTO messages (name, email, subject, body) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, subject, body]
    );
    
    res.status(201).json({ message: 'Message sent', data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: Get all messages
exports.getMessages = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM messages ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: Mark as read
exports.markAsRead = async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE messages SET is_read = true WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: Delete message
exports.deleteMessage = async (req, res) => {
  try {
    await pool.query('DELETE FROM messages WHERE id = $1', [req.params.id]);
    res.json({ message: 'Message deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};