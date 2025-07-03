import React, { useState, useEffect } from 'react';
import './StatusConsole.css';
import WorldMap3D from './WorldMap3D';

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

interface TacticalData {
  activeThreats: number;
  systemStatus: string;
  lastUpdate: string;
  coordinates: { lat: number; lon: number };
  altitude: number;
  speed: number;
}

interface StatusConsoleProps {
  messages?: StatusMessage[];
  systemStatus?: SystemStatus;
  region?: string;
  regionName?: string;
  lat?: number;
  lon?: number;
}

const StatusConsole: React.FC<StatusConsoleProps> = ({
  messages = [],
  systemStatus = { power: 100, connection: true, mode: 'OPERATIONAL' },
  region = 'UNKNOWN',
  regionName = 'अज्ञात क्षेत्र',
  lat = 0,
  lon = 0
}) => {
  const [activeTab, setActiveTab] = useState<'map' | 'status' | 'tactical'>('map');
  const [tacticalData, setTacticalData] = useState<TacticalData>({
    activeThreats: 12,
    systemStatus: 'OPERATIONAL',
    lastUpdate: new Date().toLocaleTimeString(),
    coordinates: { lat: 20.5937, lon: 78.9629 }, // India center
    altitude: 35000,
    speed: 850
  });

  // Simulate real-time tactical data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setTacticalData(prev => ({
        ...prev,
        lastUpdate: new Date().toLocaleTimeString(),
        altitude: prev.altitude + (Math.random() - 0.5) * 100,
        speed: prev.speed + (Math.random() - 0.5) * 10,
        activeThreats: Math.max(0, prev.activeThreats + (Math.random() > 0.5 ? 1 : -1))
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const renderMapView = () => (
    <div className="map-view-container">
      <WorldMap3D />
    </div>
  );

  const renderStatusView = () => (
    <div className="status-view-container">
      <div className="system-status-panel">
        <h3 className="panel-title">
          <span className="hindi-text">सिस्टम स्थिति</span>
          <span className="english-text">System Status</span>
        </h3>
        <div className="status-grid">
          <div className="status-item">
            <span className="status-label">
              <span className="hindi-text">बिजली:</span>
              <span className="english-text">Power:</span>
            </span>
            <span className="status-value">{systemStatus.power}%</span>
          </div>
          <div className="status-item">
            <span className="status-label">
              <span className="hindi-text">कनेक्शन:</span>
              <span className="english-text">Connection:</span>
            </span>
            <span className={`status-value ${systemStatus.connection ? 'online' : 'offline'}`}>
              <span className="hindi-text">{systemStatus.connection ? 'ऑनलाइन' : 'ऑफलाइन'}</span>
              <span className="english-text">{systemStatus.connection ? 'Online' : 'Offline'}</span>
            </span>
          </div>
          <div className="status-item">
            <span className="status-label">
              <span className="hindi-text">मोड:</span>
              <span className="english-text">Mode:</span>
            </span>
            <span className="status-value">{systemStatus.mode}</span>
          </div>
          <div className="status-item">
            <span className="status-label">
              <span className="hindi-text">क्षेत्र:</span>
              <span className="english-text">Region:</span>
            </span>
            <span className="status-value">
              <span className="hindi-text">{regionName}</span>
              <span className="english-text">{regionName === 'अज्ञात क्षेत्र' ? 'Unknown Region' : regionName}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="message-log-panel">
        <h3 className="panel-title">
          <span className="hindi-text">सिस्टम लॉग</span>
          <span className="english-text">System Log</span>
        </h3>
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
              <span className="message-text">
                <span className="hindi-text">सिस्टम ऑनलाइन। कोई संदेश प्रदर्शित करने के लिए नहीं।</span>
                <span className="english-text">System online. No messages to display.</span>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderTacticalView = () => (
    <div className="tactical-view-container">
      <div className="tactical-header">
        <h3 className="panel-title">
          <span className="hindi-text">रणनीतिक प्रदर्शन</span>
          <span className="english-text">Tactical Display</span>
        </h3>
        <div className="tactical-status">
          <span className="status-indicator online">
            <span className="hindi-text">कार्यात्मक</span>
            <span className="english-text">Operational</span>
          </span>
          <span className="update-time">
            <span className="hindi-text">अंतिम अपडेट:</span>
            <span className="english-text">Last Update:</span>
            {' '}{tacticalData.lastUpdate}
          </span>
        </div>
      </div>

      <div className="tactical-grid">
        <div className="tactical-panel">
          <h4>
            <span className="hindi-text">खतरा मूल्यांकन</span>
            <span className="english-text">Threat Assessment</span>
          </h4>
          <div className="threat-display">
            <div className="threat-counter">
              <span className="threat-number">{tacticalData.activeThreats}</span>
              <span className="threat-label">
                <span className="hindi-text">सक्रिय खतरे</span>
                <span className="english-text">Active Threats</span>
              </span>
            </div>
            <div className="threat-level">
              <div className={`threat-indicator ${tacticalData.activeThreats > 10 ? 'high' : tacticalData.activeThreats > 5 ? 'medium' : 'low'}`}></div>
              <span>
                <span className="hindi-text">खतरा स्तर</span>
                <span className="english-text">Threat Level</span>
              </span>
            </div>
          </div>
        </div>

        <div className="tactical-panel">
          <h4>
            <span className="hindi-text">स्थिति डेटा</span>
            <span className="english-text">Position Data</span>
          </h4>
          <div className="position-data">
            <div className="data-row">
              <span>
                <span className="hindi-text">अक्षांश:</span>
                <span className="english-text">Latitude:</span>
              </span>
              <span>{tacticalData.coordinates.lat.toFixed(4)}°</span>
            </div>
            <div className="data-row">
              <span>
                <span className="hindi-text">देशांतर:</span>
                <span className="english-text">Longitude:</span>
              </span>
              <span>{tacticalData.coordinates.lon.toFixed(4)}°</span>
            </div>
            <div className="data-row">
              <span>
                <span className="hindi-text">ऊंचाई:</span>
                <span className="english-text">Altitude:</span>
              </span>
              <span>
                <span className="hindi-text">{Math.round(tacticalData.altitude)} फीट</span>
                <span className="english-text">{Math.round(tacticalData.altitude)} ft</span>
              </span>
            </div>
            <div className="data-row">
              <span>
                <span className="hindi-text">गति:</span>
                <span className="english-text">Speed:</span>
              </span>
              <span>
                <span className="hindi-text">{Math.round(tacticalData.speed)} समुद्री मील</span>
                <span className="english-text">{Math.round(tacticalData.speed)} knots</span>
              </span>
            </div>
          </div>
        </div>

        <div className="tactical-panel">
          <h4>
            <span className="hindi-text">सिस्टम स्वास्थ्य</span>
            <span className="english-text">System Health</span>
          </h4>
          <div className="health-indicators">
            <div className="health-item">
              <span>
                <span className="hindi-text">नेविगेशन</span>
                <span className="english-text">Navigation</span>
              </span>
              <div className="health-bar">
                <div className="health-fill" style={{ width: '95%' }}></div>
              </div>
            </div>
            <div className="health-item">
              <span>
                <span className="hindi-text">संचार</span>
                <span className="english-text">Communication</span>
              </span>
              <div className="health-bar">
                <div className="health-fill" style={{ width: '88%' }}></div>
              </div>
            </div>
            <div className="health-item">
              <span>
                <span className="hindi-text">हथियार</span>
                <span className="english-text">Weapons</span>
              </span>
              <div className="health-bar">
                <div className="health-fill" style={{ width: '92%' }}></div>
              </div>
            </div>
            <div className="health-item">
              <span>
                <span className="hindi-text">सेंसर</span>
                <span className="english-text">Sensors</span>
              </span>
              <div className="health-bar">
                <div className="health-fill" style={{ width: '97%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="tactical-panel">
          <h4>
            <span className="hindi-text">मिशन स्थिति</span>
            <span className="english-text">Mission Status</span>
          </h4>
          <div className="mission-status">
            <div className="status-item">
              <span className="status-label">
                <span className="hindi-text">मिशन चरण:</span>
                <span className="english-text">Mission Phase:</span>
              </span>
              <span className="status-value">
                <span className="hindi-text">सक्रिय</span>
                <span className="english-text">Active</span>
              </span>
            </div>
            <div className="status-item">
              <span className="status-label">
                <span className="hindi-text">लक्ष्य:</span>
                <span className="english-text">Target:</span>
              </span>
              <span className="status-value">
                <span className="hindi-text">अनुसरण</span>
                <span className="english-text">Tracking</span>
              </span>
            </div>
            <div className="status-item">
              <span className="status-label">
                <span className="hindi-text">ईंधन:</span>
                <span className="english-text">Fuel:</span>
              </span>
              <span className="status-value">87%</span>
            </div>
            <div className="status-item">
              <span className="status-label">
                <span className="hindi-text">समय:</span>
                <span className="english-text">Time:</span>
              </span>
              <span className="status-value">
                <span className="hindi-text">2:34:17</span>
                <span className="english-text">2:34:17</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="status-console-root">
      <div className="status-console-header">
        <h1>
          <span className="hindi-text">स्टेटस कंसोल</span>
          <span className="english-text">Status Console</span>
        </h1>
        <p>
          <span className="hindi-text">सिस्टम स्थिति और रणनीतिक प्रदर्शन मॉनिटरिंग</span>
          <span className="english-text">System Status & Tactical Display Monitoring</span>
        </p>
      </div>

      <div className="status-console-tabs">
        <button 
          className={`tab-button ${activeTab === 'map' ? 'active' : ''}`}
          onClick={() => setActiveTab('map')}
        >
          <span className="tab-icon">🗺️</span>
          <span className="tab-text">
            <span className="hindi-text">मानचित्र</span>
            <span className="english-text">Map</span>
          </span>
        </button>
        <button 
          className={`tab-button ${activeTab === 'status' ? 'active' : ''}`}
          onClick={() => setActiveTab('status')}
        >
          <span className="tab-icon">📊</span>
          <span className="tab-text">
            <span className="hindi-text">स्थिति</span>
            <span className="english-text">Status</span>
          </span>
        </button>
        <button 
          className={`tab-button ${activeTab === 'tactical' ? 'active' : ''}`}
          onClick={() => setActiveTab('tactical')}
        >
          <span className="tab-icon">⚡</span>
          <span className="tab-text">
            <span className="hindi-text">रणनीतिक</span>
            <span className="english-text">Tactical</span>
          </span>
        </button>
      </div>

      <div className="status-console-content">
        {activeTab === 'map' && renderMapView()}
        {activeTab === 'status' && renderStatusView()}
        {activeTab === 'tactical' && renderTacticalView()}
      </div>
    </div>
  );
};

export default StatusConsole;