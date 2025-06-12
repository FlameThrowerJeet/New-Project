import React, { useState, useEffect, useRef } from 'react';
import './LiveChat.css';

interface Message {
  id: number;
  text: string;
  hindi?: string;
  sender: string;
  timestamp: Date;
  isUser: boolean;
}

// Placeholder translation function
async function translateToHindi(text: string): Promise<string> {
  // In production, replace with a real translation API call
  // For now, just return a placeholder
  return '[हिंदी अनुवाद]: ' + text;
}

const LiveChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      setIsTranslating(true);
      const hindi = await translateToHindi(newMessage);
      setIsTranslating(false);
      const message: Message = {
        id: Date.now(),
        text: newMessage,
        hindi,
        sender: 'You',
        timestamp: new Date(),
        isUser: true
      };
      setMessages(prev => [...prev, message]);
      setNewMessage('');
    }
  };

  return (
    <div className="live-chat-container">
      <div className="chat-header">
        <h2>Mission Chat</h2>
      </div>
      <div className="messages-container">
        {messages.map(message => (
          <div key={message.id} className={`message ${message.isUser ? 'user' : ''}`}>
            <div className="message-content">
              <div>{message.text}</div>
              {message.hindi && (
                <div className="hindi-translation">{message.hindi}</div>
              )}
            </div>
            <span className="message-time">
              {message.timestamp.toLocaleTimeString()}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="message-input-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="message-input"
          lang="hi"
          dir="ltr"
          disabled={isTranslating}
        />
        <button type="submit" className="send-button" disabled={isTranslating}>
          {isTranslating ? 'Translating...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default LiveChat; 