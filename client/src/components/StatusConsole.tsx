import React from 'react';
import './StatusConsole.css';

interface StatusMessage {
  id: number;
  text: string;
  type: "success" | "info" | "warning" | "error";
  timestamp: Date | string;
}

interface SystemStatus {
  power: number;
  connection: boolean;
  mode: string;
}

interface StatusConsoleProps {
  messages?: StatusMessage[]; // Add this line to include messages prop
  systemStatus?: SystemStatus;
  region?: string;
  regionName?: string;
  lat?: number;
  lon?: number;
}

const StatusConsole: React.FC<StatusConsoleProps> = ({
  messages = [], // Add default empty array
  systemStatus = { power: 100, connection: true, mode: 'OPERATIONAL' },
  region = 'UNKNOWN',
  regionName = 'Unknown Region',
  lat = 0,
  lon = 0
}) => {
  return (
    <div className="status-console">
      <div className="message-log">
        {messages.length > 0 ? (
          messages.map(msg => (
            <div key={msg.id} className={`console-message ${msg.type}`}>
              <span className="message-time">
                {typeof msg.timestamp === 'string' 
                  ? msg.timestamp 
                  : msg.timestamp.toLocaleTimeString()}
              </span>
              <span className="message-text">{msg.text}</span>
            </div>
          ))
        ) : (
          <div className="console-message info">
            <span className="message-text">System online. No messages to display.</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatusConsole;