import React, { useState, useEffect } from 'react';
import '../styles/DataReadout.css';

interface DataItem {
  label: string;
  value: number | string;
  unit?: string;
  status: 'normal' | 'warning' | 'critical';
}

interface DataReadoutProps {
  title: string;
  data: DataItem[];
  compact?: boolean;
  refreshRate?: number;
}

const DataReadout: React.FC<DataReadoutProps> = ({ title, data, compact = false, refreshRate = 0 }) => {
  const [currentData, setCurrentData] = useState(data);

  useEffect(() => {
    setCurrentData(data);
    
    if (refreshRate > 0) {
      const interval = setInterval(() => {
        // This would typically fetch or update data
        // For now, just re-render with the same data
        setCurrentData([...data]);
      }, refreshRate);
      
      return () => clearInterval(interval);
    }
  }, [data, refreshRate]);

  return (
    <div className={`data-readout ${compact ? 'compact' : ''}`}>
      <div className="data-readout-title">{title}</div>
      <div className="data-readout-items">
        {currentData.map((item, index) => (
          <div key={index} className={`data-item status-${item.status}`}>
            <span className="data-label">{item.label}:</span>
            <span className="data-value">
              {item.value}{item.unit && <span className="data-unit">{item.unit}</span>}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DataReadout;