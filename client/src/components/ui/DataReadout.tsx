import React, { useState, useEffect } from 'react';
import '../../styles/DataReadout.css';

interface DataItem {
  label: string;
  value: string | number;
  unit?: string;
  status?: 'normal' | 'warning' | 'critical' | 'inactive';
}

interface DataReadoutProps {
  title?: string;
  data: DataItem[];
  compact?: boolean;
  refreshRate?: number;
  pulsing?: boolean;
}

const DataReadout: React.FC<DataReadoutProps> = ({
  title = 'SYSTEM STATUS',
  data = [],
  compact = false,
  refreshRate = 0,
  pulsing = true,
}) => {
  const [currentData, setCurrentData] = useState(data);
  const [refreshCounter, setRefreshCounter] = useState(0);
  
  useEffect(() => {
    if (refreshRate > 0) {
      const interval = setInterval(() => {
        setRefreshCounter(prev => prev + 1);
      }, refreshRate);
      
      return () => clearInterval(interval);
    }
  }, [refreshRate]);
  
  useEffect(() => {
    // Update the displayed data, simulating real-time changes
    setCurrentData(data);
  }, [data, refreshCounter]);
  
  return (
    <div className={`data-readout ${compact ? 'compact' : ''}`}>
      <div className="readout-header">
        <div className="readout-title">{title}</div>
        <div className="readout-status">
          <span className={`status-indicator ${pulsing ? 'pulsing' : ''}`}></span>
          <span className="status-text">ACTIVE</span>
        </div>
      </div>
      
      <div className="readout-content">
        {currentData.map((item, index) => (
          <div 
            key={index} 
            className={`data-row ${item.status ? item.status : 'normal'}`}
          >
            <div className="data-label">{item.label}:</div>
            <div className="data-value">
              {item.value}
              {item.unit && <span className="data-unit">{item.unit}</span>}
            </div>
          </div>
        ))}
        
        {currentData.length === 0 && (
          <div className="no-data">NO DATA AVAILABLE</div>
        )}
      </div>
      
      <div className="readout-footer">
        <div className="refresh-info">
          {refreshRate > 0 ? (
            <span>REFRESH: {refreshRate}ms</span>
          ) : (
            <span>STATIC DATA</span>
          )}
        </div>
        <div className="timestamp">
          {new Date().toISOString().split('.')[0].replace('T', ' ')}
        </div>
      </div>
    </div>
  );
};

export default DataReadout;