const cloudinary = require('../config/cloudinary');

// Upload single image
exports.uploadImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  // Cloudinary gives us the URL directly
  res.json({ imageUrl: req.file.path });
};

// Delete image
exports.deleteImage = async (req, res) => {
  try {
    // Extract public_id from Cloudinary URL
    // URL format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/filename.jpg
    const url = req.body.imageUrl; // send the full URL from frontend when deleting
    
    if (!url) {
      return res.status(400).json({ message: 'imageUrl required in body' });
    }

    // Extract public_id
    const splitUrl = url.split('/upload/')[1]; // gets: v1234567890/folder/filename.jpg
    const publicId = splitUrl.split('.')[0]; // removes extension: v1234567890/folder/filename

    await cloudinary.uploader.destroy(publicId);
    
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting image', error: error.message });
  }
};