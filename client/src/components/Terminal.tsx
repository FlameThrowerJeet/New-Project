import React, { useState, useEffect } from 'react';
import './Terminal.css';

const Terminal: React.FC = () => {
  const [command, setCommand] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [outputLines, setOutputLines] = useState<string[]>([
    'FLAME THROWER ZUTT - TERMINAL v1.0',
    'TYPE "help" FOR AVAILABLE COMMANDS',
    '------------------------------------',
  ]);
  
  const processCommand = (cmd: string) => {
    // Add command to history
    setCommandHistory(prev => [...prev, cmd]);
    
    // Process commands
    const lowerCmd = cmd.toLowerCase().trim();
    
    if (lowerCmd === 'help') {
      setOutputLines(prev => [
        ...prev,
        '> ' + cmd,
        'AVAILABLE COMMANDS:',
        '  - help: Show this help menu',
        '  - status: Display system status',
        '  - clear: Clear terminal output',
        '  - version: Show system version',
        '  - date: Show current date/time',
        ''
      ]);
    } else if (lowerCmd === 'status') {
      setOutputLines(prev => [
        ...prev,
        '> ' + cmd,
        'SYSTEM STATUS: OPERATIONAL',
        'SECURITY PROTOCOLS: ACTIVE',
        'CONNECTIONS: SECURE',
        'TASKS: RUNNING',
        ''
      ]);
    } else if (lowerCmd === 'clear') {
      setOutputLines(['TERMINAL CLEARED', '']);
    } else if (lowerCmd === 'version') {
      setOutputLines(prev => [
        ...prev,
        '> ' + cmd,
        'FLAME THROWER ZUTT - TERMINAL v1.0',
        'BUILD DATE: 2025-03-19',
        ''
      ]);
    } else if (lowerCmd === 'date') {
      setOutputLines(prev => [
        ...prev,
        '> ' + cmd,
        'CURRENT DATE: ' + new Date().toLocaleDateString(),
        'CURRENT TIME: ' + new Date().toLocaleTimeString(),
        ''
      ]);
    } else if (lowerCmd === '') {
      setOutputLines(prev => [...prev, '> ', '']);
    } else {
      setOutputLines(prev => [
        ...prev,
        '> ' + cmd,
        'COMMAND NOT RECOGNIZED: ' + cmd,
        ''
      ]);
    }
    
    // Clear input
    setCommand('');
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processCommand(command);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      // Navigate command history
      if (commandHistory.length > 0) {
        const lastCommand = commandHistory[commandHistory.length - 1];
        setCommand(lastCommand);
        setCommandHistory(prev => prev.slice(0, -1));
      }
    }
  };
  
  return (
    <div className="terminal">
      <div className="terminal-header">
        <div className="terminal-title">SYSTEM TERMINAL</div>
        <div className="terminal-controls">
          <span className="terminal-control minimize">_</span>
          <span className="terminal-control maximize">□</span>
          <span className="terminal-control close">×</span>
        </div>
      </div>
      
      <div className="terminal-content">
        {outputLines.map((line, index) => (
          <div key={index} className="terminal-line">
            {line.startsWith('>') ? (
              <span className="command-prompt">{line}</span>
            ) : (
              <span>{line}</span>
            )}
          </div>
        ))}
        
        <form onSubmit={handleSubmit} className="terminal-form">
          <span className="input-prompt">FTZ:~$</span>
          <input
            type="text"
            value={command}
            onChange={e => setCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            className="terminal-input"
            placeholder="Type your command here"
            autoFocus
          />
        </form>
      </div>
    </div>
  );
};

export default Terminal;