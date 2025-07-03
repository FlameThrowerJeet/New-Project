import React from 'react';

interface TargetingFrameProps {
  title: string;
  targetId: string;
  targetType: string;
  status: string;
  isSelected: boolean;
  onClick: () => void;
  children?: React.ReactNode; // <-- Add this line
}

const TargetingFrame: React.FC<TargetingFrameProps> = ({
  title,
  targetId,
  targetType,
  status,
  isSelected,
  onClick,
  children
}) => (
  <div
    onClick={onClick}
    style={{
      border: isSelected ? '2px solid #0f0' : '2px solid #f00',
      padding: 12,
      margin: 8,
      borderRadius: 8,
      background: isSelected ? '#112' : '#222',
      cursor: 'pointer'
    }}
  >
    <h4>{title}</h4>
    <p>ID: {targetId}</p>
    <p>Type: {targetType}</p>
    <p>Status: {status}</p>
    {children}
  </div>
);

export default TargetingFrame;