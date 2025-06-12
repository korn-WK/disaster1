import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card } from 'react-bootstrap';
import axios from 'axios';

type Message = {
  role: 'user' | 'ai';
  text: string;
  createdAt?: string;
};

const userId = 'user123'; // กำหนด user id แบบคงที่ (เปลี่ยนตามระบบจริงได้)

export default function Chat() {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  // โหลดประวัติแชทเมื่อ component mount
  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await axios.get(`http://localhost:5000/api/chat/${userId}`);
        setChat(res.data.messages || []);
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    }
    fetchHistory();
  }, []);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMsg: Message = { role: 'user', text: message, createdAt: new Date().toISOString() };
    setChat(prev => [...prev, userMsg]);
    setMessage('');
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/api/chat/chat', { userId, message });
      const aiMsg: Message = { role: 'ai', text: res.data.response, createdAt: new Date().toISOString() };
      setChat(prev => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg: Message = { role: 'ai', text: '❌ Error connecting to server.' };
      setChat(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5" style={{ maxWidth: 600 }}>
      <h2 className="text-center mb-4">Chat with Gemma</h2>
      <Card className="p-3 mb-3" style={{ height: '400px', overflowY: 'auto', backgroundColor: '#f8f9fa' }}>
        {chat.length === 0 && <p className="text-center text-muted">No chat history</p>}
        {chat.map((msg, i) => (
          <div
            key={i}
            className={`mb-3 d-flex flex-column ${msg.role === 'user' ? 'align-items-end' : 'align-items-start'}`}
          >
            <div
              style={{
                maxWidth: '75%',
                padding: '8px 12px',
                borderRadius: '15px',
                backgroundColor: msg.role === 'user' ? '#ffc107' : '#343a40',
                color: msg.role === 'user' ? '#212529' : '#f8f9fa',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {msg.text}
            </div>
            {msg.createdAt && (
              <small className="text-muted mt-1" style={{ fontSize: '0.7rem' }}>
                {new Date(msg.createdAt).toLocaleTimeString()}
              </small>
            )}
          </div>
        ))}
      </Card>

      <Form
        onSubmit={(e) => {
          e.preventDefault();
          if (!loading) sendMessage();
        }}
      >
        <Form.Group className="d-flex">
          <Form.Control
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={loading ? 'Waiting for response...' : 'Ask something...'}
            disabled={loading}
          />
          <Button type="submit" className="ms-2" disabled={loading || !message.trim()}>
            {loading ? 'Sending...' : 'Send'}
          </Button>
        </Form.Group>
      </Form>
    </Container>
  );
}