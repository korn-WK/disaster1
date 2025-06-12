const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// ดึงประวัติแชทของ userId
router.get('/:userId', chatController.getChatHistory);

// ส่งข้อความและรับคำตอบ
router.post('/chat', chatController.sendMessage);

module.exports = router;