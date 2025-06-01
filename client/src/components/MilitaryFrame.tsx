import React from 'react';

interface MilitaryFrameProps {
  title?: string;
  classification?: string;
  missionId?: string;
  children?: React.ReactNode;
}

const MilitaryFrame: React.FC<MilitaryFrameProps> = ({
  title = 'MILITARY FRAME',
  classification = 'UNCLASSIFIED',
  missionId = 'N/A',
  children,
}) => {
  return (
    <div style={{
      border: '3px solid #0af',
      borderRadius: '10px',
      padding: '16px',
      background: '#101c2c',
      color: '#0af',
      margin: '16px 0',
      fontFamily: 'monospace'
    }}>
      <div style={{ marginBottom: 8 }}>
        <strong>{title}</strong> | <span>{classification}</span> | <span>ID: {missionId}</span>
      </div>
      <div>
        {children}
      </div>
    </div>
  );
};

export default MilitaryFrame;