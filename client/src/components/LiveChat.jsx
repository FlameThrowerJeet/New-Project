import React, { useState, useRef, useEffect } from 'react';
import './LiveChat.css';

const personas = [
  {
    name: 'FalconLead',
    avatar: '🦅',
    style: { color: '#00ffea' },
    intro: "FalconLead here, prepping for today's recon mission. Anyone got the latest satellite imagery?"
  },
  {
    name: 'ViperIntel',
    avatar: '🛰️',
    style: { color: '#fffa65' },
    intro: "ViperIntel reporting in. I've uploaded new images from the last sortie to the Images page."
  },
  {
    name: 'MaverickAI',
    avatar: '🛩️',
    style: { color: '#ff6f61' },
    intro: "MaverickAI here. Did you see the debrief video on why Japan lost the air battle? It's on the Videos page."
  },
  {
    name: 'OpsBot',
    avatar: '📡',
    style: { color: '#00ff00' },
    intro: 'OpsBot: Routine tracker updated. Mission planning for tomorrow is underway.'
  }
];

const initialMessages = [
  { id: 1, text: personas[0].intro, sender: 'FalconLead', persona: personas[0] },
  { id: 2, text: personas[1].intro, sender: 'ViperIntel', persona: personas[1] },
  { id: 3, text: personas[2].intro, sender: 'MaverickAI', persona: personas[2] },
  { id: 4, text: personas[3].intro, sender: 'OpsBot', persona: personas[3] },
];

const personaReplies = [
  (msg) => `FalconLead: Copy that. ${msg.includes('image') ? 'Check the Images page for the latest recon photos.' : 'Ready for the next mission.'}`,
  (msg) => `ViperIntel: Analysis complete. ${msg.includes('video') ? 'The Videos page has the latest debrief.' : 'Let me know if you need more intel.'}`,
  (msg) => `MaverickAI: Roger. ${msg.includes('game') ? 'The F-16 Combat Simulator is live!' : "Let's keep the skies clear."}`,
  (msg) => `OpsBot: Mission log updated. ${msg.includes('routine') ? 'Routine tracker is up to date.' : 'All systems nominal.'}`
];

const LiveChat = () => {
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const userMsg = {
        id: Date.now(),
        text: newMessage,
        sender: 'user',
        persona: { name: 'You', avatar: '👨‍✈️', style: { color: '#fff' } }
      };
      setMessages((msgs) => [...msgs, userMsg]);
      setNewMessage('');
      setLoading(true);
      // Pick a random persona to reply
      const personaIdx = Math.floor(Math.random() * personas.length);
      const persona = personas[personaIdx];
      // Simulate a short delay
      setTimeout(() => {
        setMessages((msgs) => [
          ...msgs,
          {
            id: Date.now() + 1,
            text: personaReplies[personaIdx](newMessage),
            sender: persona.name,
            persona,
          },
        ]);
        setLoading(false);
      }, 900 + Math.random() * 800);
    }
  };

  return (
    <div className="live-chat-container">
      <div className="chat-header">
        <h3>Live Chat</h3>
      </div>
      <div className="messages-container">
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.sender !== 'user' ? 'ai' : 'user'}`}> 
            <div className="message-content" style={message.persona?.style}>
              <span style={{fontWeight: 'bold', marginRight: 6}}>{message.persona?.avatar} {message.sender !== 'user' ? message.sender : ''}</span>
              <span>{message.text}</span>
            </div>
          </div>
        ))}
        {loading && (
          <div className="message ai">
            <div className="message-content">
              <p>AI is typing...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="message-input-container">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="message-input"
          disabled={loading}
        />
        <button type="submit" className="send-button" disabled={loading}>
          Send
        </button>
      </form>
    </div>
  );
};

export default LiveChat; 