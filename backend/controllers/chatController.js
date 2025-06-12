const ChatMessage = require('../models/ChatMessage');
const fetch = require('node-fetch');

exports.getChatHistory = async (req, res) => {
  const { userId } = req.params;
  try {
    const messages = await ChatMessage.find({ userId }).sort({ createdAt: 1 });
    res.json({ messages });
  } catch (error) {
    console.error('Error getting chat history:', error);
    res.status(500).json({ error: 'Failed to get chat history' });
  }
};

exports.sendMessage = async (req, res) => {
  const { userId, message } = req.body;

  if (!userId || !message) {
    return res.status(400).json({ error: 'Missing userId or message' });
  }

  try {
    // บันทึกข้อความ user ลง DB
    const userMsg = new ChatMessage({ userId, role: 'user', text: message });
    await userMsg.save();

    // ส่งข้อความไป Ollama gemma3
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gemma3',
        prompt: message,
        stream: false
      })
    });
    const data = await response.json();
    const aiText = data.response;

    // บันทึกข้อความ AI ลง DB
    const aiMsg = new ChatMessage({ userId, role: 'ai', text: aiText });
    await aiMsg.save();

    res.json({ response: aiText });

  } catch (error) {
    console.error('Error in sendMessage:', error);
    res.status(500).json({ error: 'Ollama connection failed or DB error' });
  }
}; 