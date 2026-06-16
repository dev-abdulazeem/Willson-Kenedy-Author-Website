const pool = require('../config/db');

// Get all site settings
exports.getSettings = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM site_settings');
    const settings = {};
    result.rows.forEach(row => {
      settings[row.key] = row.value;
    });
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update site setting
exports.updateSetting = async (req, res) => {
  try {
    const { key, value } = req.body;
    
    const result = await pool.query(
      `INSERT INTO site_settings (key, value, type) 
       VALUES ($1, $2, $3)
       ON CONFLICT (key) 
       DO UPDATE SET value = $2, updated_at = NOW()
       RETURNING *`,
      [key, value, req.body.type || 'text']
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Bulk update settings
exports.updateSettings = async (req, res) => {
  try {
    const { settings } = req.body; // Array of {key, value, type}
    
    const results = [];
    for (const setting of settings) {
      const result = await pool.query(
        `INSERT INTO site_settings (key, value, type) 
         VALUES ($1, $2, $3)
         ON CONFLICT (key) 
         DO UPDATE SET value = $2, updated_at = NOW()
         RETURNING *`,
        [setting.key, setting.value, setting.type || 'text']
      );
      results.push(result.rows[0]);
    }
    
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};