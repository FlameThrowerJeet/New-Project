import React, { useState, useEffect, useRef, useCallback } from 'react';
import GPSMap from './GPSMap';
import TerrainMap from './TerrainMap';
import RadarDisplay from './RadarDisplay';
import StatusConsole from './StatusConsole';
import PilotStatus from './PilotStatus';
import CommandOutput from './CommandOutput';
import DataReadout from './DataReadout';
import MilitaryFrame from './MilitaryFrame';
import Terminal from './Terminal';
import OptimizedImage from './OptimizedImage';
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
const IMAGES_PER_PAGE = 10;
const REFRESH_INTERVAL = 180000; // 3 minutes

const PHONE_STREAM_URLS = {
  phone1: 'http://192.168.29.208:8080',
  phone2: 'http://192.168.29.21:8989'
};

const categoryQueries: Record<string, string> = {
  'History': 'history india',
  'Science': 'science technology',
  'Geo-Politics': 'india geopolitics',
  'News': 'india news',
};

// Accept sectionIndex, setSectionIndex, imageIndex, setImageIndex as props
interface ImagesProps {
  sectionIndex: number;
  setSectionIndex: (idx: number) => void;
  imageIndex: number;
  setImageIndex: (idx: number) => void;
}

const Images: React.FC<ImagesProps> = ({ sectionIndex, setSectionIndex, imageIndex, setImageIndex }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<Image[]>([]);
  const [zoom, setZoom] = useState(1);

  // Section/category logic
  const selectedCategory = CATEGORIES[sectionIndex];
  const categoryImages = images.filter(img => img.category === selectedCategory);
  const selectedImage = categoryImages[imageIndex] || null;

  // Upload handler
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
    setImageIndex(categoryImages.length);
  };

  // Zoom controls
  const handleZoomIn = () => setZoom(z => Math.min(z + 0.2, 3));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.2, 0.2));
  const handleResetZoom = () => setZoom(1);

  // --- Cockpit-style section previews (top row) ---
  const sectionPreviews = (
    <div className="cockpit-top-links">
      {CATEGORIES.map((cat, idx) => (
        <div
          key={cat}
          className={`cockpit-link-box${sectionIndex === idx ? ' selected' : ''}`}
          onClick={() => { setSectionIndex(idx); setImageIndex(0); }}
          tabIndex={0}
        >
          {cat}
        </div>
      ))}
    </div>
  );

  // --- Cockpit-style image previews (bottom row) ---
  const imagePreviews = (
    <div className="cockpit-bottom-links">
      {categoryImages.slice(0, 8).map((img, idx) => (
        <div
          key={img.id}
          className={`cockpit-link-box${imageIndex === idx ? ' selected' : ''}`}
          onClick={() => setImageIndex(idx)}
          tabIndex={0}
          style={{ background: `url(${img.url}) center/cover, rgba(0,10,20,0.92)` }}
        >
          <span style={{ background: 'rgba(0,0,0,0.55)', padding: '2px 10px', borderRadius: 4, color: '#00fff7', fontWeight: 'bold', fontSize: 14, marginBottom: 8, textShadow: '0 0 8px #00fff7' }}>{img.title}</span>
        </div>
      ))}
    </div>
  );

  // --- Main cockpit image viewer ---
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      {/* Top: Section previews */}
      {sectionPreviews}
      {/* Center: Image viewer and controls */}
      <div style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 0, minWidth: 0 }}>
        {/* Upload and zoom controls */}
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 16, margin: '18px 0' }}>
          <button
            style={{ background: '#00fff7', color: '#181b1c', border: 'none', borderRadius: 8, padding: '10px 22px', fontWeight: 'bold', fontSize: 16, boxShadow: '0 0 12px #00fff7', textShadow: '0 0 2px #00fff7', letterSpacing: '0.08em', cursor: 'pointer' }}
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
          <button onClick={handleZoomOut} style={{ fontSize: 22, background: '#00fff7', color: '#181b1c', border: 'none', borderRadius: 6, padding: '6px 14px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 0 8px #00fff7' }}>-</button>
          <button onClick={handleResetZoom} style={{ fontSize: 16, background: '#00fff7', color: '#181b1c', border: 'none', borderRadius: 6, padding: '6px 14px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 0 8px #00fff7' }}>Reset</button>
          <button onClick={handleZoomIn} style={{ fontSize: 22, background: '#00fff7', color: '#181b1c', border: 'none', borderRadius: 6, padding: '6px 14px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 0 8px #00fff7' }}>+</button>
        </div>
        {/* Image viewer */}
        <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0, minWidth: 0 }}>
          {categoryImages.length === 0 ? (
            <div style={{ color: '#888', fontSize: 22, textAlign: 'center' }}>No images uploaded for this section yet.</div>
          ) : selectedImage ? (
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                <button
                  onClick={() => setImageIndex(Math.max(0, imageIndex - 1))}
                  disabled={imageIndex === 0}
                  style={{ fontSize: 36, color: '#00fff7', background: 'none', border: 'none', cursor: 'pointer', opacity: imageIndex === 0 ? 0.3 : 1, textShadow: '0 0 8px #00fff7' }}
                >
                  &lt;
                </button>
                <div style={{ margin: '0 32px', textAlign: 'center', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <OptimizedImage
                    src={selectedImage.url}
                    alt={selectedImage.title}
                    style={{ width: `${zoom * 100}%`, height: 'auto', maxWidth: '80vw', maxHeight: '60vh', objectFit: 'contain', border: '2px solid #00fff7', borderRadius: 8, background: '#000', display: 'block', boxShadow: '0 0 24px #00fff7', filter: 'drop-shadow(0 0 12px #00fff7)' }}
                  />
                  <div style={{ color: '#00fff7', fontWeight: 'bold', marginTop: 10, textShadow: '0 0 8px #00fff7', fontSize: 18 }}>{selectedImage.title}</div>
                  <div style={{ color: '#aaa', fontSize: 15 }}>{selectedImage.description}</div>
                </div>
                <button
                  onClick={() => setImageIndex(Math.min(categoryImages.length - 1, imageIndex + 1))}
                  disabled={imageIndex === categoryImages.length - 1}
                  style={{ fontSize: 36, color: '#00fff7', background: 'none', border: 'none', cursor: 'pointer', opacity: imageIndex === categoryImages.length - 1 ? 0.3 : 1, textShadow: '0 0 8px #00fff7' }}
                >
                  &gt;
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
      {/* Bottom: Image previews */}
      {imagePreviews}
    </div>
  );
};

export default Images;