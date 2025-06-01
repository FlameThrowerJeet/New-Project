import React, { useState, useEffect, useRef } from 'react';
import GPSMap from './GPSMap';
import TerrainMap from './TerrainMap';
import RadarDisplay from './RadarDisplay';
import StatusConsole from './StatusConsole';
import PilotStatus from './PilotStatus';
import CommandOutput from './CommandOutput';
import DataReadout from './DataReadout';
import MilitaryFrame from './MilitaryFrame';
import Terminal from './Terminal';
import './Images.css';
import axios from 'axios';

interface Image {
  id: number;
  url: string;
  title: string;
  description: string;
  category: string;
}

const CATEGORIES = ['History', 'Science', 'Geo-Politics', 'News'];

const PEXELS_API_KEY = '563492ad6f91700001000001cfb1e2b6b6e94e7e8e1e2e3e4e5e6e7e'; // Demo key, replace with your own for production

const categoryQueries: Record<string, string> = {
  'History': 'history india',
  'Science': 'science technology',
  'Geo-Politics': 'india geopolitics',
  'News': 'india news',
};

const Images: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const [images, setImages] = useState<Image[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [currentPosition, setCurrentPosition] = useState({ lat: 20, lon: 77 });
  const [showTerminal, setShowTerminal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.title = 'F-16 Mission Images';
    // Remove mockImages, do not set any default images
  }, []);

  // Simulate position updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPosition(prev => ({
        lat: prev.lat + (Math.random() - 0.5) * 0.1,
        lon: prev.lon + (Math.random() - 0.5) * 0.1
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Fetch and fill at least 10 images for each category on initial load, then update every 3 minutes
  useEffect(() => {
    let isMounted = true;
    let loading = true;
    async function fetchImages() {
      for (const cat of CATEGORIES) {
        try {
          const res = await axios.get('/api/pexels', {
            params: { query: categoryQueries[cat], per_page: 10 }
          });
          console.log('Fetched images for', cat, res.data);
          if (isMounted && res.data && res.data.photos) {
            setImages(prev => [
              ...prev.filter(img => img.category !== cat || img.url.startsWith('blob:')), // keep user uploads
              ...res.data.photos.map((img: any) => ({
                id: img.id,
                url: img.src.medium,
                title: img.alt || img.photographer || cat,
                description: img.photographer || '',
                category: cat
              }))
            ]);
          }
        } catch (e: any) {
          console.error('Error fetching images for', cat, e);
          if (isMounted) {
            setImages(prev => prev.filter(img => img.category !== cat));
          }
        }
      }
      loading = false;
    }
    fetchImages();
    const interval = setInterval(fetchImages, 180000); // every 3 minutes
    return () => { isMounted = false; clearInterval(interval); };
  }, []);

  // Filter images by selected category
  const categoryImages = images.filter(img => img.category === selectedCategory);
  const selectedImage = categoryImages[selectedImageIndex] || null;

  // Handle image upload
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newImages: Image[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const url = URL.createObjectURL(file);
      newImages.push({
        id: Date.now() + i,
        url,
        title: file.name,
        description: '',
        category: selectedCategory
      });
    }
    setImages(prev => [...prev, ...newImages]);
    setSelectedImageIndex(categoryImages.length); // Show the first new image
  };

  // Category switch
  const handleCategorySwitch = (cat: string) => {
    setSelectedCategory(cat);
    setSelectedImageIndex(0);
  };

  // Image navigation
  const handlePrev = () => {
    setSelectedImageIndex(idx => Math.max(0, idx - 1));
  };
  const handleNext = () => {
    setSelectedImageIndex(idx => Math.min(categoryImages.length - 1, idx + 1));
  };

  // Mock data for DataReadout
  const dataReadout = [
    { label: 'Altitude', value: 12000, unit: 'ft', status: 'normal' as const },
    { label: 'Speed', value: 480, unit: 'kn', status: 'normal' as const },
    { label: 'Heading', value: 270, unit: '°', status: 'normal' as const },
    { label: 'Fuel', value: 78, unit: '%', status: 'warning' as const },
    { label: 'Weapons', value: 'ARMED', status: 'normal' as const }
  ];

  // Mock messages for StatusConsole
  const statusMessages = [
    { id: 1, text: 'Mission system online.', type: 'info' as const, timestamp: new Date() },
    { id: 2, text: 'GPS lock acquired.', type: 'success' as const, timestamp: new Date() },
    { id: 3, text: 'Image feed active.', type: 'info' as const, timestamp: new Date() }
  ];

  return (
    <div style={{ position: 'relative', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      {/* Scanline overlay behind everything */}
      <div className="scanline-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none' }} />
      <div style={{ display: 'flex', flexDirection: 'row', height: '100vh', background: 'transparent' }}>
        {/* Left Tactical Panel */}
        <div style={{ flex: 1.2, minWidth: 0, display: 'flex', flexDirection: 'column', borderRight: '2px solid #0f0', background: 'rgba(0,16,16,0.7)', boxShadow: '0 0 24px #0ff4', backdropFilter: 'blur(2px)' }}>
          <MilitaryFrame title="GPS Tracking" classification="TACTICAL" missionId="F16-OPS-001">
            <GPSMap lat={currentPosition.lat} lon={currentPosition.lon} />
          </MilitaryFrame>
          <MilitaryFrame title="Terrain Map" classification="TOPOGRAPHY" missionId="F16-OPS-001">
            <TerrainMap lat={currentPosition.lat} lon={currentPosition.lon} />
          </MilitaryFrame>
          <MilitaryFrame title="Pilot Status" classification="VITALS" missionId="F16-OPS-001">
            <PilotStatus region="Coast" regionName="Coastal Patrol" />
          </MilitaryFrame>
          <MilitaryFrame title="Radar" classification="SENSOR" missionId="F16-OPS-001">
            <RadarDisplay />
          </MilitaryFrame>
        </div>
        {/* Center Tactical Panel */}
        <div style={{ flex: 2, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(18,18,18,0.7)', borderRight: '2px solid #0f0', boxShadow: '0 0 32px #0ff6', backdropFilter: 'blur(2px)' }}>
          <MilitaryFrame title="Mission Images" classification="RECON" missionId="F16-OPS-001">
            {/* Category Switcher */}
            <div style={{ display: 'flex', gap: 12, margin: '16px 0' }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => handleCategorySwitch(cat)}
                  style={{
                    background: selectedCategory === cat ? '#0f0' : 'rgba(34,34,34,0.7)',
                    color: selectedCategory === cat ? '#111' : '#0f0',
                    border: '1.5px solid #0f0',
                    borderRadius: 6,
                    padding: '6px 18px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontSize: 16,
                    boxShadow: selectedCategory === cat ? '0 0 8px #0f0' : 'none',
                    textShadow: selectedCategory === cat ? '0 0 4px #0f0' : '0 0 2px #0f0'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
            {/* Upload Button */}
            <div style={{ marginBottom: 16 }}>
              <button
                style={{ background: '#0f0', color: '#111', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 'bold', cursor: 'pointer', fontSize: 16, boxShadow: '0 0 8px #0f0', textShadow: '0 0 2px #0f0' }}
                onClick={() => fileInputRef.current?.click()}
              >
                Upload Image
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={handleUpload}
              />
            </div>
            {/* Image Viewer with TargetingFrame */}
            <div style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              {categoryImages.length === 0 ? (
                <div style={{ color: '#f00', fontSize: 18, textShadow: '0 0 8px #f00' }}>No images in this section or failed to load images. Please check your API key or network.</div>
              ) : selectedImage ? (
                <MilitaryFrame title="Targeting Frame" classification="VISUAL" missionId={String(selectedImage.id)}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                    <button onClick={handlePrev} disabled={selectedImageIndex === 0} style={{ fontSize: 32, color: '#0f0', background: 'none', border: 'none', cursor: 'pointer', opacity: selectedImageIndex === 0 ? 0.3 : 1, textShadow: '0 0 8px #0f0' }}>&lt;</button>
                    <div style={{ margin: '0 24px', textAlign: 'center', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <img src={selectedImage.url} alt={selectedImage.title} style={{ width: '100%', maxWidth: 500, maxHeight: 350, objectFit: 'contain', border: '2px solid #0f0', borderRadius: 8, background: '#000', display: 'block', boxShadow: '0 0 24px #0f08', filter: 'drop-shadow(0 0 12px #0f0)' }} />
                      <div style={{ color: '#0f0', fontWeight: 'bold', marginTop: 8, textShadow: '0 0 8px #0f0' }}>{selectedImage.title}</div>
                      <div style={{ color: '#aaa', fontSize: 14 }}>{selectedImage.description}</div>
                    </div>
                    <button onClick={handleNext} disabled={selectedImageIndex === categoryImages.length - 1} style={{ fontSize: 32, color: '#0f0', background: 'none', border: 'none', cursor: 'pointer', opacity: selectedImageIndex === categoryImages.length - 1 ? 0.3 : 1, textShadow: '0 0 8px #0f0' }}>&gt;</button>
                  </div>
                  {/* Thumbnails */}
                  <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'center' }}>
                    {categoryImages.map((img, idx) => (
                      <img
                        key={img.id}
                        src={img.url}
                        alt={img.title}
                        style={{
                          width: 60,
                          height: 40,
                          objectFit: 'cover',
                          border: idx === selectedImageIndex ? '2px solid #0f0' : '2px solid #333',
                          borderRadius: 4,
                          cursor: 'pointer',
                          background: '#000',
                          boxShadow: idx === selectedImageIndex ? '0 0 8px #0f0' : 'none'
                        }}
                        onClick={() => setSelectedImageIndex(idx)}
                      />
                    ))}
                  </div>
                  {/* DataReadout for image meta */}
                  <DataReadout title="Image Data" data={dataReadout} compact refreshRate={0} />
                </MilitaryFrame>
              ) : (
                <div style={{ color: '#888', fontSize: 18 }}>No images in this section.</div>
              )}
            </div>
            {/* CommandOutput below image viewer */}
            <div style={{ marginTop: 16 }}>
              <CommandOutput />
            </div>
          </MilitaryFrame>
        </div>
        {/* Right Tactical Panel */}
        <div style={{ flex: 0.8, minWidth: 0, display: 'flex', flexDirection: 'column', background: 'rgba(0,16,16,0.7)', boxShadow: '0 0 24px #0ff4', backdropFilter: 'blur(2px)' }}>
          <MilitaryFrame title="Status Console" classification="SYSTEM" missionId="F16-OPS-001">
            <StatusConsole messages={statusMessages} />
          </MilitaryFrame>
          <MilitaryFrame title="Terminal" classification="INTERACTIVE" missionId="F16-OPS-001">
            <button onClick={() => setShowTerminal(s => !s)} style={{ background: '#0f0', color: '#111', border: 'none', borderRadius: 6, padding: '6px 18px', fontWeight: 'bold', cursor: 'pointer', fontSize: 16, marginBottom: 8, boxShadow: '0 0 8px #0f0', textShadow: '0 0 2px #0f0' }}>
              {showTerminal ? 'Hide Terminal' : 'Show Terminal'}
            </button>
            {showTerminal && <Terminal />}
          </MilitaryFrame>
        </div>
      </div>
    </div>
  );
};

export default Images;