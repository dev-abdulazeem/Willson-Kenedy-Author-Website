const fs = require('fs');
const path = require('path');

// Upload single image
exports.uploadImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  // Build full URL — this is what was missing!
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;

  res.json({ imageUrl });
};

// Delete image
exports.deleteImage = (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(__dirname, '../uploads', filename);

  fs.unlink(filepath, (err) => {
    if (err) {
      return res.status(500).json({ message: 'Error deleting file' });
    }
    res.json({ message: 'File deleted' });
  });
};