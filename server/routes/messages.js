const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const auth = require('../middleware/auth');

router.post('/', messageController.sendMessage);
router.get('/', auth, messageController.getMessages);
router.put('/:id/read', auth, messageController.markAsRead);
router.delete('/:id', auth, messageController.deleteMessage);

module.exports = router;