import React, { useState } from 'react';

const YouTubeDownloader: React.FC = () => {
  const [url, setUrl] = useState('');
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      if (response.ok) {
        const blob = await response.blob();
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = 'video.mp4';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        alert('Failed to download video.');
      }
    } catch (err) {
      alert('Error occurred while downloading.');
    }
    setDownloading(false);
  };

  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center', justifyContent: 'center', padding: 0, background: 'none', borderRadius: 0, margin: 0 }}>
      <input
        type="text"
        placeholder="YouTube link"
        value={url}
        onChange={e => setUrl(e.target.value)}
        style={{ flex: 1, minWidth: 0, padding: '2px 6px', borderRadius: 0, border: '1px solid #0ff', background: '#000', color: '#0ff', fontSize: 13, height: 28, outline: 'none' }}
      />
      <button
        onClick={handleDownload}
        disabled={downloading || !url}
        style={{ width: 28, height: 28, borderRadius: 0, border: '1px solid #0ff', background: '#000', color: '#0ff', fontWeight: 'bold', fontSize: 16, cursor: downloading ? 'not-allowed' : 'pointer', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        {downloading ? '...' : '↓'}
      </button>
    </div>
  );
};

export default YouTubeDownloader; 