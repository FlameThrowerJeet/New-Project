import React, { useEffect, useState } from 'react';
import './FaceSwap.css';

// Helper to convert a File to an HTMLImageElement
const fileToImage = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const FaceSwap: React.FC = () => {
  const [baseFile, setBaseFile] = useState<File | null>(null);
  const [faceFile, setFaceFile] = useState<File | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [basePreview, setBasePreview] = useState<string | null>(null);
  const [facePreview, setFacePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSwap = async () => {
    if (!baseFile || !faceFile) return;
    setLoading(true);
    try {
      const form = new FormData();
      form.append('base', baseFile);
      form.append('face', faceFile);

      const resp = await fetch('/api/face-swap', { method: 'POST', body: form });
      if (!resp.ok) throw new Error('Swap failed');

      const blob = await resp.blob();
      setResultUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error('Face swap error:', err);
      alert('Face swap failed. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="face-swap-root">
      <div className="face-swap-header">
        <h2 className="face-swap-title">AI Face Swap</h2>
        <button className="swap-btn" onClick={handleSwap} disabled={!baseFile || !faceFile || loading}>
          {loading ? 'Working...' : 'Swap'}
        </button>
      </div>

      {/* Main layout: previews column + phone */}
      <div className="face-swap-layout">
        {/* Stacked previews on left */}
        <div className="preview-column">
          {/* Original group */}
          <div className="preview-group">
            <label className="upload-btn">
              Select Original Image
              <input
                type="file"
                accept="image/*"
                onChange={e => {
                  if (e.target.files && e.target.files[0]) {
                    const f = e.target.files[0];
                    setBaseFile(f);
                    setBasePreview(URL.createObjectURL(f));
                  }
                }}
              />
            </label>
            <div className="preview-box">
              <span className="preview-label">Original</span>
              {basePreview ? (
                <img src={basePreview} alt="Original preview" />
              ) : (
                <div className="preview-placeholder">No Image</div>
              )}
            </div>
          </div>

          {/* Face group */}
          <div className="preview-group">
            <label className="upload-btn">
              Select Face Image
              <input
                type="file"
                accept="image/*"
                onChange={e => {
                  if (e.target.files && e.target.files[0]) {
                    const f = e.target.files[0];
                    setFaceFile(f);
                    setFacePreview(URL.createObjectURL(f));
                  }
                }}
              />
            </label>
            <div className="preview-box">
              <span className="preview-label">Face</span>
              {facePreview ? (
                <img src={facePreview} alt="Face preview" />
              ) : (
                <div className="preview-placeholder">No Image</div>
              )}
            </div>
          </div>
        </div>

        {/* iPhone display on right */}
        <div className="iphone-shape face-swap-phone">
          <div className="phone-notch"></div>
          <div className="phone-screen">
            {resultUrl ? (
              <img src={resultUrl} alt="Face swapped result" className="swap-result-img" />
            ) : basePreview ? (
              <img src={basePreview} alt="Preview" className="swap-result-img" />
            ) : (
              <div className="preview-placeholder">Result</div>
            )}
          </div>
          <div className="phone-home-indicator"></div>
        </div>
      </div>
    </div>
  );
};

export default FaceSwap; 