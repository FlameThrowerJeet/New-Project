import React, { useState } from 'react';
import { getAllChoudharyMembers, getChoudharyStats, ChoudharyMember } from '../data/choudharyRegistry';
import './FileStorage.css';

const FileStorage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'registry' | 'documents' | 'media'>('registry');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterState, setFilterState] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'state' | 'registration'>('name');

  const members = getAllChoudharyMembers();
  const stats = getChoudharyStats();

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesState = filterState === 'all' || member.state === filterState;
    return matchesSearch && matchesState;
  });

  const sortedMembers = [...filteredMembers].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.firstName.localeCompare(b.firstName);
      case 'state':
        return a.state.localeCompare(b.state);
      case 'registration':
        return new Date(a.registrationDate).getTime() - new Date(b.registrationDate).getTime();
      default:
        return 0;
    }
  });

  const states = [...new Set(members.map(m => m.state))].sort();

  const RegistryTab = () => (
    <div className="registry-container">
      <div className="registry-header">
        <h2>
          <span className="hindi-text">चौधरी समुदाय रजिस्ट्री</span>
          <span className="english-text">Choudhary Community Registry</span>
        </h2>
        <div className="registry-stats">
          <div className="stat-item">
            <span className="stat-number">{stats.total}</span>
            <span className="stat-label">
              <span className="hindi-text">कुल सदस्य</span>
              <span className="english-text">Total Members</span>
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.male}</span>
            <span className="stat-label">
              <span className="hindi-text">पुरुष</span>
              <span className="english-text">Male</span>
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.female}</span>
            <span className="stat-label">
              <span className="hindi-text">महिला</span>
              <span className="english-text">Female</span>
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.states}</span>
            <span className="stat-label">
              <span className="hindi-text">राज्य</span>
              <span className="english-text">States</span>
            </span>
          </div>
        </div>
      </div>

      <div className="registry-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="नाम या शहर से खोजें... | Search by name or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filters">
          <select value={filterState} onChange={(e) => setFilterState(e.target.value)}>
            <option value="all">सभी राज्य | All States</option>
            {states.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
            <option value="name">नाम से क्रमबद्ध करें | Sort by Name</option>
            <option value="state">राज्य से क्रमबद्ध करें | Sort by State</option>
            <option value="registration">पंजीकरण से क्रमबद्ध करें | Sort by Registration</option>
          </select>
        </div>
      </div>

      <div className="registry-table">
        <table>
          <thead>
            <tr>
              <th>
                <span className="hindi-text">आईडी</span>
                <span className="english-text">ID</span>
              </th>
              <th>
                <span className="hindi-text">नाम</span>
                <span className="english-text">Name</span>
              </th>
              <th>
                <span className="hindi-text">आधार</span>
                <span className="english-text">Aadhar</span>
              </th>
              <th>
                <span className="hindi-text">स्थान</span>
                <span className="english-text">Location</span>
              </th>
              <th>
                <span className="hindi-text">व्यवसाय</span>
                <span className="english-text">Occupation</span>
              </th>
              <th>
                <span className="hindi-text">स्थिति</span>
                <span className="english-text">Status</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedMembers.map(member => (
              <tr key={member.id}>
                <td>{member.id}</td>
                <td>{member.firstName} {member.lastName}</td>
                <td>{member.aadharNumber}</td>
                <td>{member.city}, {member.state}</td>
                <td>{member.occupation || 'उपलब्ध नहीं | Not Available'}</td>
                <td>
                  <span className={`status-badge ${member.status.toLowerCase()}`}>
                    {member.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const DocumentsTab = () => (
    <div className="documents-container">
      <h2>
        <span className="hindi-text">समुदाय दस्तावेज़</span>
        <span className="english-text">Community Documents</span>
      </h2>
      <div className="documents-grid">
        <div className="document-card">
          <div className="document-icon">📄</div>
          <h3>
            <span className="hindi-text">समुदाय दिशानिर्देश</span>
            <span className="english-text">Community Guidelines</span>
          </h3>
          <p>
            <span className="hindi-text">चौधरी समुदाय सदस्यों के लिए आधिकारिक दिशानिर्देश</span>
            <span className="english-text">Official guidelines for Choudhary community members</span>
          </p>
          <button className="download-btn">
            <span className="hindi-text">डाउनलोड करें</span>
            <span className="english-text">Download</span>
          </button>
        </div>
        <div className="document-card">
          <div className="document-icon">📋</div>
          <h3>
            <span className="hindi-text">पंजीकरण फॉर्म</span>
            <span className="english-text">Registration Form</span>
          </h3>
          <p>
            <span className="hindi-text">नए समुदाय सदस्यों के लिए फॉर्म</span>
            <span className="english-text">Form for new community members</span>
          </p>
          <button className="download-btn">
            <span className="hindi-text">डाउनलोड करें</span>
            <span className="english-text">Download</span>
          </button>
        </div>
        <div className="document-card">
          <div className="document-icon">📊</div>
          <h3>
            <span className="hindi-text">वार्षिक रिपोर्ट 2024</span>
            <span className="english-text">Annual Report 2024</span>
          </h3>
          <p>
            <span className="hindi-text">समुदाय की गतिविधियां और उपलब्धियां</span>
            <span className="english-text">Community activities and achievements</span>
          </p>
          <button className="download-btn">
            <span className="hindi-text">डाउनलोड करें</span>
            <span className="english-text">Download</span>
          </button>
        </div>
      </div>
    </div>
  );

  const MediaTab = () => (
    <div className="media-container">
      <h2>
        <span className="hindi-text">समुदाय मीडिया</span>
        <span className="english-text">Community Media</span>
      </h2>
      <div className="media-grid">
        <div className="media-card">
          <div className="media-icon">📸</div>
          <h3>
            <span className="hindi-text">समुदाय तस्वीरें</span>
            <span className="english-text">Community Photos</span>
          </h3>
          <p>
            <span className="hindi-text">हाल के कार्यक्रम और सभाएं</span>
            <span className="english-text">Recent events and gatherings</span>
          </p>
          <button className="view-btn">
            <span className="hindi-text">गैलरी देखें</span>
            <span className="english-text">View Gallery</span>
          </button>
        </div>
        <div className="media-card">
          <div className="media-icon">🎥</div>
          <h3>
            <span className="hindi-text">कार्यक्रम वीडियो</span>
            <span className="english-text">Event Videos</span>
          </h3>
          <p>
            <span className="hindi-text">समुदाय कार्यक्रमों की रिकॉर्डिंग</span>
            <span className="english-text">Recordings of community events</span>
          </p>
          <button className="view-btn">
            <span className="hindi-text">वीडियो देखें</span>
            <span className="english-text">Watch Videos</span>
          </button>
        </div>
        <div className="media-card">
          <div className="media-icon">📰</div>
          <h3>
            <span className="hindi-text">न्यूज़लेटर</span>
            <span className="english-text">Newsletter</span>
          </h3>
          <p>
            <span className="hindi-text">मासिक समुदाय अपडेट</span>
            <span className="english-text">Monthly community updates</span>
          </p>
          <button className="view-btn">
            <span className="hindi-text">न्यूज़लेटर पढ़ें</span>
            <span className="english-text">Read Newsletter</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="file-storage-root">
      <div className="file-storage-header">
        <h1>
          <span className="hindi-text">फ़ाइल स्टोरेज और रजिस्ट्री</span>
          <span className="english-text">File Storage & Registry</span>
        </h1>
        <p>
          <span className="hindi-text">समुदाय डेटाबेस और दस्तावेज़ प्रबंधन प्रणाली</span>
          <span className="english-text">Community Database & Document Management System</span>
        </p>
      </div>

      <div className="file-storage-tabs">
        <button 
          className={`tab-button ${activeTab === 'registry' ? 'active' : ''}`}
          onClick={() => setActiveTab('registry')}
        >
          <span className="tab-icon">📋</span>
          <span className="tab-text">
            <span className="hindi-text">रजिस्ट्री</span>
            <span className="english-text">Registry</span>
          </span>
        </button>
        <button 
          className={`tab-button ${activeTab === 'documents' ? 'active' : ''}`}
          onClick={() => setActiveTab('documents')}
        >
          <span className="tab-icon">📄</span>
          <span className="tab-text">
            <span className="hindi-text">दस्तावेज़</span>
            <span className="english-text">Documents</span>
          </span>
        </button>
        <button 
          className={`tab-button ${activeTab === 'media' ? 'active' : ''}`}
          onClick={() => setActiveTab('media')}
        >
          <span className="tab-icon">🎥</span>
          <span className="tab-text">
            <span className="hindi-text">मीडिया</span>
            <span className="english-text">Media</span>
          </span>
        </button>
      </div>

      <div className="file-storage-content">
        {activeTab === 'registry' && <RegistryTab />}
        {activeTab === 'documents' && <DocumentsTab />}
        {activeTab === 'media' && <MediaTab />}
      </div>
    </div>
  );
};

export default FileStorage; 