import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MiinaAnimeViewer.css'; // Import the new CSS file

interface Image {
  id: string | number;
  url: string;
  title: string;
}

const MiinaAnimeViewer: React.FC = () => {
  const [animeImages, setAnimeImages] = useState<Image[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Load anime images from local storage
    const savedAnimeImages = localStorage.getItem('animeImages');
    if (savedAnimeImages) {
      setAnimeImages(JSON.parse(savedAnimeImages));
    }
    setIsLoading(false);
  }, []);

  // Helper function to convert a local image URL to a Data URI the API can process
  const toDataURL = (url: string): Promise<string> =>
    fetch(url)
      .then(response => response.blob())
      .then(blob => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      }));

  const processExistingImages = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch('/images/miina-manifest.json');
      const manifest = await response.json();
      const allImages: any[] = Object.values(manifest).flat();
      
      // Pick 5 random images to process
      const randomImages = allImages.sort(() => 0.5 - Math.random()).slice(0, 5);

      for (const image of randomImages) {
        // Construct absolute URL and convert to Data URI for the API
        const imageUrl = `${window.location.origin}${image.url}`;
        const imageDataUri = await toDataURL(imageUrl);
        const res = await axios.post('/api/anime-filter', { imageUrl: imageDataUri });

        if (res.data && res.data.animeImageUrl) {
          const newAnimeImage = {
            id: res.data.animeImageUrl, // Use URL as unique ID
            url: res.data.animeImageUrl,
            title: `[ANIME] ${image.title}`,
          };
          
          setAnimeImages(prev => {
            const updated = [newAnimeImage, ...prev];
            localStorage.setItem('animeImages', JSON.stringify(updated));
            return updated;
          });
        }
      }
    } catch (error) {
      console.error("Failed to process existing images:", error);
    }
    setIsProcessing(false);
  };

  if (isLoading) {
    return <div className="loading-message">Loading...</div>;
  }

  return (
    <div className="viewer-container">
      <div className="viewer-header">
        <h2 className="viewer-title">Miina Anime Collection</h2>
        <button onClick={processExistingImages} disabled={isProcessing} className="process-button">
          {isProcessing ? 'Processing...' : 'Process Images'}
        </button>
      </div>
      <div className="viewer-content">
        <div className="image-grid">
          {animeImages.length > 0 ? (
            animeImages.map(img => (
              <div key={img.id} className="image-card">
                <img src={img.url} alt={img.title} className="card-image" />
                <div className="card-title">{img.title}</div>
              </div>
            ))
          ) : (
            <div className="no-images-message">
              No anime images yet. Click "Process Images" to generate.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MiinaAnimeViewer; 