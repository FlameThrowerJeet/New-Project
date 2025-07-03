import React, { useState } from 'react';
import { getChoudharyByState, getAllChoudharyMembers } from '../data/choudharyRegistry';
import './Maps.css';

interface MapData {
  id: string;
  title: string;
  description: string;
  type: 'demographic' | 'geographic' | 'cultural' | 'economic';
  imageUrl?: string;
  data?: any;
}

const Maps: React.FC = () => {
  const [activeMap, setActiveMap] = useState<string>('demographic');
  const [selectedState, setSelectedState] = useState<string>('all');

  const members = getAllChoudharyMembers();
  const states = [...new Set(members.map(m => m.state))].sort();

  const mapData: MapData[] = [
    {
      id: 'demographic',
      title: 'जनसांख्यिकीय वितरण',
      description: 'भारत भर में चौधरी समुदाय का जनसंख्या वितरण',
      type: 'demographic',
      data: {
        totalMembers: members.length,
        maleCount: members.filter(m => m.gender === 'Male').length,
        femaleCount: members.filter(m => m.gender === 'Female').length,
        stateDistribution: states.map(state => ({
          state,
          count: members.filter(m => m.state === state).length
        }))
      }
    },
    {
      id: 'geographic',
      title: 'भौगोलिक फैलाव',
      description: 'भौगोलिक वितरण और प्रवास पैटर्न',
      type: 'geographic',
      data: {
        states: states.length,
        cities: [...new Set(members.map(m => m.city))].length,
        regions: {
          north: members.filter(m => ['Delhi', 'Punjab', 'Uttar Pradesh', 'Bihar', 'Jharkhand'].includes(m.state)).length,
          south: members.filter(m => ['Karnataka', 'Tamil Nadu', 'Kerala', 'Telangana'].includes(m.state)).length,
          east: members.filter(m => ['West Bengal', 'Odisha', 'Assam'].includes(m.state)).length,
          west: members.filter(m => ['Maharashtra', 'Gujarat', 'Rajasthan'].includes(m.state)).length
        }
      }
    },
    {
      id: 'cultural',
      title: 'सांस्कृतिक केंद्र',
      description: 'क्षेत्रों में सांस्कृतिक और समुदाय केंद्र',
      type: 'cultural',
      data: {
        centers: [
          { name: 'मुंबई सांस्कृतिक केंद्र', location: 'मुंबई, महाराष्ट्र', members: 1 },
          { name: 'दिल्ली समुदाय हब', location: 'नई दिल्ली, दिल्ली', members: 1 },
          { name: 'बैंगलोर सांस्कृतिक केंद्र', location: 'बैंगलोर, कर्नाटक', members: 1 },
          { name: 'चेन्नई समुदाय हब', location: 'चेन्नई, तमिलनाडु', members: 1 }
        ]
      }
    },
    {
      id: 'economic',
      title: 'आर्थिक गतिविधि',
      description: 'आर्थिक वितरण और व्यावसायिक विविधता',
      type: 'economic',
      data: {
        occupations: members.reduce((acc, member) => {
          const occ = member.occupation || 'अनिर्दिष्ट';
          acc[occ] = (acc[occ] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      }
    }
  ];

  const currentMap = mapData.find(m => m.id === activeMap);

  const DemographicMap = () => (
    <div className="map-content">
      <div className="map-stats">
        <div className="stat-card">
          <h3>
            <span className="hindi-text">कुल सदस्य</span>
            <span className="english-text">Total Members</span>
          </h3>
          <div className="stat-value">{currentMap?.data?.totalMembers || 0}</div>
        </div>
        <div className="stat-card">
          <h3>
            <span className="hindi-text">पुरुष</span>
            <span className="english-text">Male</span>
          </h3>
          <div className="stat-value">{currentMap?.data?.maleCount || 0}</div>
        </div>
        <div className="stat-card">
          <h3>
            <span className="hindi-text">महिला</span>
            <span className="english-text">Female</span>
          </h3>
          <div className="stat-value">{currentMap?.data?.femaleCount || 0}</div>
        </div>
      </div>
      
      <div className="state-distribution">
        <h3>
          <span className="hindi-text">राज्यवार वितरण</span>
          <span className="english-text">State-wise Distribution</span>
        </h3>
        <div className="distribution-chart">
          {(currentMap?.data?.stateDistribution || []).map((item: any) => (
            <div key={item.state} className="state-bar">
              <div className="state-name">{item.state}</div>
              <div className="bar-container">
                <div 
                  className="bar-fill" 
                  style={{ width: `${(item.count / (currentMap?.data?.totalMembers || 1)) * 100}%` }}
                ></div>
                <span className="bar-value">{item.count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const GeographicMap = () => (
    <div className="map-content">
      <div className="map-stats">
        <div className="stat-card">
          <h3>
            <span className="hindi-text">कवर किए गए राज्य</span>
            <span className="english-text">States Covered</span>
          </h3>
          <div className="stat-value">{currentMap?.data?.states || 0}</div>
        </div>
        <div className="stat-card">
          <h3>
            <span className="hindi-text">शहर</span>
            <span className="english-text">Cities</span>
          </h3>
          <div className="stat-value">{currentMap?.data?.cities || 0}</div>
        </div>
      </div>
      
      <div className="regional-distribution">
        <h3>
          <span className="hindi-text">क्षेत्रीय वितरण</span>
          <span className="english-text">Regional Distribution</span>
        </h3>
        <div className="region-grid">
          <div className="region-card">
            <h4>
              <span className="hindi-text">उत्तर भारत</span>
              <span className="english-text">North India</span>
            </h4>
            <div className="region-count">{currentMap?.data?.regions?.north || 0}</div>
          </div>
          <div className="region-card">
            <h4>
              <span className="hindi-text">दक्षिण भारत</span>
              <span className="english-text">South India</span>
            </h4>
            <div className="region-count">{currentMap?.data?.regions?.south || 0}</div>
          </div>
          <div className="region-card">
            <h4>
              <span className="hindi-text">पूर्वी भारत</span>
              <span className="english-text">East India</span>
            </h4>
            <div className="region-count">{currentMap?.data?.regions?.east || 0}</div>
          </div>
          <div className="region-card">
            <h4>
              <span className="hindi-text">पश्चिमी भारत</span>
              <span className="english-text">West India</span>
            </h4>
            <div className="region-count">{currentMap?.data?.regions?.west || 0}</div>
          </div>
        </div>
      </div>
    </div>
  );

  const CulturalMap = () => (
    <div className="map-content">
      <div className="cultural-centers">
        <h3>
          <span className="hindi-text">सांस्कृतिक केंद्र</span>
          <span className="english-text">Cultural Centers</span>
        </h3>
        <div className="centers-grid">
          {(currentMap?.data?.centers || []).map((center: any) => (
            <div key={center.name} className="center-card">
              <div className="center-icon">🏛️</div>
              <h4>
                <span className="hindi-text">{center.name}</span>
                <span className="english-text">{center.name.replace('मुंबई', 'Mumbai').replace('दिल्ली', 'Delhi').replace('बैंगलोर', 'Bangalore').replace('चेन्नई', 'Chennai').replace('सांस्कृतिक केंद्र', 'Cultural Center').replace('समुदाय हब', 'Community Hub')}</span>
              </h4>
              <p>
                <span className="hindi-text">{center.location}</span>
                <span className="english-text">{center.location.replace('मुंबई', 'Mumbai').replace('नई दिल्ली', 'New Delhi').replace('बैंगलोर', 'Bangalore').replace('चेन्नई', 'Chennai').replace('महाराष्ट्र', 'Maharashtra').replace('दिल्ली', 'Delhi').replace('कर्नाटक', 'Karnataka').replace('तमिलनाडु', 'Tamil Nadu')}</span>
              </p>
              <div className="center-members">
                <span className="hindi-text">{center.members} सदस्य</span>
                <span className="english-text">{center.members} Members</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const EconomicMap = () => (
    <div className="map-content">
      <div className="occupation-distribution">
        <h3>
          <span className="hindi-text">व्यावसायिक वितरण</span>
          <span className="english-text">Occupational Distribution</span>
        </h3>
        <div className="occupation-list">
          {Object.entries(currentMap?.data?.occupations || {}).map(([occupation, count]) => (
            <div key={occupation} className="occupation-item">
              <span className="occupation-name">
                <span className="hindi-text">{occupation}</span>
                <span className="english-text">{occupation === 'अनिर्दिष्ट' ? 'Unspecified' : occupation}</span>
              </span>
              <span className="occupation-count">{count as number}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderMapContent = () => {
    switch (activeMap) {
      case 'demographic':
        return <DemographicMap />;
      case 'geographic':
        return <GeographicMap />;
      case 'cultural':
        return <CulturalMap />;
      case 'economic':
        return <EconomicMap />;
      default:
        return <DemographicMap />;
    }
  };

  return (
    <div className="maps-root">
      <div className="maps-header">
        <h1>
          <span className="hindi-text">समुदाय मैप्स और विश्लेषण</span>
          <span className="english-text">Community Maps & Analytics</span>
        </h1>
        <p>
          <span className="hindi-text">चौधरी समुदाय का विस्तृत जनसांख्यिकीय और भौगोलिक विश्लेषण</span>
          <span className="english-text">Comprehensive demographic and geographic analysis of the Choudhary community</span>
        </p>
      </div>

      <div className="maps-navigation">
        {mapData.map((map) => (
          <button
            key={map.id}
            className={`map-nav-button ${activeMap === map.id ? 'active' : ''}`}
            onClick={() => setActiveMap(map.id)}
          >
            <div className="map-nav-content">
              <div className="map-nav-icon">
                {map.type === 'demographic' && '📊'}
                {map.type === 'geographic' && '🗺️'}
                {map.type === 'cultural' && '🏛️'}
                {map.type === 'economic' && '💰'}
              </div>
              <div className="map-nav-text">
                <span className="hindi-text">{map.title}</span>
                <span className="english-text">
                  {map.type === 'demographic' && 'Demographic Distribution'}
                  {map.type === 'geographic' && 'Geographic Spread'}
                  {map.type === 'cultural' && 'Cultural Centers'}
                  {map.type === 'economic' && 'Economic Activity'}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="maps-content">
        <div className="map-description">
          <h2>
            <span className="hindi-text">{currentMap?.title}</span>
            <span className="english-text">
              {currentMap?.type === 'demographic' && 'Demographic Distribution'}
              {currentMap?.type === 'geographic' && 'Geographic Spread'}
              {currentMap?.type === 'cultural' && 'Cultural Centers'}
              {currentMap?.type === 'economic' && 'Economic Activity'}
            </span>
          </h2>
          <p>
            <span className="hindi-text">{currentMap?.description}</span>
            <span className="english-text">
              {currentMap?.type === 'demographic' && 'Population distribution of the Choudhary community across India'}
              {currentMap?.type === 'geographic' && 'Geographic distribution and migration patterns'}
              {currentMap?.type === 'cultural' && 'Cultural and community centers in regions'}
              {currentMap?.type === 'economic' && 'Economic distribution and occupational diversity'}
            </span>
          </p>
        </div>
        
        <div className="map-visualization">
          {renderMapContent()}
        </div>
      </div>

      <div className="maps-footer">
        <div className="map-controls">
          <select 
            value={selectedState} 
            onChange={(e) => setSelectedState(e.target.value)}
            className="state-filter"
          >
            <option value="all">सभी राज्य</option>
            {states.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default Maps; 