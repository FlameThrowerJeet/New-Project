import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ImageGenerator.css';

interface Provider {
  name: string;
  displayName: string;
}

interface GeneratedImage {
  id?: string;
  imageUrl: string;
  prompt: string;
  provider: string;
  metadata?: any;
}

interface DalleOptions {
  size: string;
  quality: string;
  style: string;
}

interface StabilityOptions {
  width: number;
  height: number;
  steps: number;
  cfg_scale: number;
}

interface ReplicateOptions {
  model: string;
  width: number;
  height: number;
  num_inference_steps: number;
  guidance_scale: number;
}

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState('dalle');
  const [generationHistory, setGenerationHistory] = useState<GeneratedImage[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  
  // Provider-specific options
  const [dalleOptions, setDalleOptions] = useState<DalleOptions>({
    size: '1024x1024',
    quality: 'standard',
    style: 'vivid'
  });
  
  const [stabilityOptions, setStabilityOptions] = useState<StabilityOptions>({
    width: 1024,
    height: 1024,
    steps: 30,
    cfg_scale: 7
  });
  
  const [replicateOptions, setReplicateOptions] = useState<ReplicateOptions>({
    model: 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
    width: 1024,
    height: 1024,
    num_inference_steps: 50,
    guidance_scale: 7.5
  });

  useEffect(() => {
    fetchProviders();
    fetchGenerationHistory();
  }, []);

  const fetchProviders = async () => {
    try {
      const response = await axios.get('/api/image-providers');
      setProviders(response.data.providers);
    } catch (error) {
      console.error('Error fetching providers:', error);
    }
  };

  const fetchGenerationHistory = async () => {
    try {
      const response = await axios.get('/api/generation-history');
      setGenerationHistory(response.data);
    } catch (error) {
      console.error('Error fetching generation history:', error);
    }
  };

  const generateImage = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);

    try {
      let endpoint = '/api/generate-image';
      let requestData: any = {
        prompt: prompt.trim(),
        preferredProvider: selectedProvider
      };

      // Add provider-specific options
      switch (selectedProvider) {
        case 'dalle':
          requestData = { ...requestData, ...dalleOptions };
          break;
        case 'stability':
          requestData = { ...requestData, ...stabilityOptions };
          break;
        case 'replicate':
          requestData = { ...requestData, ...replicateOptions };
          break;
      }

      const response = await axios.post(endpoint, requestData);

      if (response.data.success) {
        setGeneratedImage(response.data);
        // Refresh generation history
        fetchGenerationHistory();
      } else {
        setError(response.data.error || 'Generation failed');
      }
    } catch (error: any) {
      console.error('Generation error:', error);
      setError(error.response?.data?.error || 'Failed to generate image');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = async (imageUrl: string) => {
    try {
      const response = await axios.get(imageUrl, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `generated-image-${Date.now()}.png`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Download error:', error);
      setError('Failed to download image');
    }
  };

  const renderProviderOptions = () => {
    switch (selectedProvider) {
      case 'dalle':
        return (
          <div className="provider-options">
            <h4>डाल-ई विकल्प</h4>
            <div className="option-group">
              <label>आकार:</label>
              <select
                value={dalleOptions.size}
                onChange={(e) => setDalleOptions({...dalleOptions, size: e.target.value})}
              >
                <option value="1024x1024">1024x1024</option>
                <option value="1792x1024">1792x1024</option>
                <option value="1024x1792">1024x1792</option>
              </select>
            </div>
            <div className="option-group">
              <label>गुणवत्ता:</label>
              <select
                value={dalleOptions.quality}
                onChange={(e) => setDalleOptions({...dalleOptions, quality: e.target.value})}
              >
                <option value="standard">मानक</option>
                <option value="hd">एचडी</option>
              </select>
            </div>
            <div className="option-group">
              <label>शैली:</label>
              <select
                value={dalleOptions.style}
                onChange={(e) => setDalleOptions({...dalleOptions, style: e.target.value})}
              >
                <option value="vivid">चमकदार</option>
                <option value="natural">प्राकृतिक</option>
              </select>
            </div>
          </div>
        );

      case 'stability':
        return (
          <div className="provider-options">
            <h4>स्टेबिलिटी एआई विकल्प</h4>
            <div className="option-group">
              <label>चौड़ाई:</label>
              <input type="number" value={stabilityOptions.width} onChange={e => setStabilityOptions({...stabilityOptions, width: Number(e.target.value)})} />
            </div>
            <div className="option-group">
              <label>ऊंचाई:</label>
              <input type="number" value={stabilityOptions.height} onChange={e => setStabilityOptions({...stabilityOptions, height: Number(e.target.value)})} />
            </div>
            <div className="option-group">
              <label>कदम:</label>
              <input type="number" value={stabilityOptions.steps} onChange={e => setStabilityOptions({...stabilityOptions, steps: Number(e.target.value)})} />
            </div>
            <div className="option-group">
              <label>सीएफजी स्केल:</label>
              <input type="number" value={stabilityOptions.cfg_scale} onChange={e => setStabilityOptions({...stabilityOptions, cfg_scale: Number(e.target.value)})} />
            </div>
          </div>
        );

      case 'replicate':
        return (
          <div className="provider-options">
            <h4>रिप्लिकेट विकल्प</h4>
            <div className="option-group">
              <label>मॉडल:</label>
              <input type="text" value={replicateOptions.model} onChange={e => setReplicateOptions({...replicateOptions, model: e.target.value})} />
            </div>
            <div className="option-group">
              <label>चौड़ाई:</label>
              <input type="number" value={replicateOptions.width} onChange={e => setReplicateOptions({...replicateOptions, width: Number(e.target.value)})} />
            </div>
            <div className="option-group">
              <label>ऊंचाई:</label>
              <input type="number" value={replicateOptions.height} onChange={e => setReplicateOptions({...replicateOptions, height: Number(e.target.value)})} />
            </div>
            <div className="option-group">
              <label>इन्फरेंस स्टेप्स:</label>
              <input type="number" value={replicateOptions.num_inference_steps} onChange={e => setReplicateOptions({...replicateOptions, num_inference_steps: Number(e.target.value)})} />
            </div>
            <div className="option-group">
              <label>गाइडेंस स्केल:</label>
              <input type="number" value={replicateOptions.guidance_scale} onChange={e => setReplicateOptions({...replicateOptions, guidance_scale: Number(e.target.value)})} />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="image-generator">
      <div className="generator-header">
        <h2>🎨 AI Image Generator</h2>
        <p>Generate stunning images using multiple AI providers</p>
      </div>

      <div className="generator-container">
        <div className="input-section">
          <div className="prompt-input">
            <label htmlFor="prompt">Describe the image you want to generate:</label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A majestic dragon flying over a medieval castle at sunset, digital art style..."
              rows={3}
            />
          </div>

          <div className="provider-selection">
            <label>Choose AI Provider:</label>
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
            >
              {providers.map(provider => (
                <option key={provider.name} value={provider.name}>
                  {provider.displayName}
                </option>
              ))}
            </select>
          </div>

          {renderProviderOptions()}

          <button
            className="generate-btn"
            onClick={generateImage}
            disabled={isGenerating || !prompt.trim()}
          >
            {isGenerating ? '🎨 Generating...' : '🎨 Generate Image'}
          </button>

          {error && (
            <div className="error-message">
              ❌ {error}
            </div>
          )}
        </div>

        <div className="output-section">
          {generatedImage && (
            <div className="generated-image">
              <h3>Generated Image ({generatedImage.provider})</h3>
              <div className="image-container">
                <img
                  src={generatedImage.imageUrl}
                  alt={generatedImage.prompt}
                  onError={() => setError('Failed to load generated image')}
                />
              </div>
              <div className="image-actions">
                <button onClick={() => downloadImage(generatedImage.imageUrl)}>
                  📥 Download
                </button>
                <button onClick={() => setGeneratedImage(null)}>
                  🗑️ Clear
                </button>
              </div>
              <div className="image-metadata">
                <p><strong>Prompt:</strong> {generatedImage.prompt}</p>
                <p><strong>Provider:</strong> {generatedImage.provider}</p>
                {generatedImage.metadata && (
                  <p><strong>Settings:</strong> {JSON.stringify(generatedImage.metadata)}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="history-section">
        <button
          className="history-toggle"
          onClick={() => setShowHistory(!showHistory)}
        >
          {showHistory ? '📚 Hide History' : '📚 Show Generation History'}
        </button>

        {showHistory && (
          <div className="generation-history">
            <h3>Recent Generations</h3>
            {generationHistory.length === 0 ? (
              <p>No generation history yet.</p>
            ) : (
              <div className="history-grid">
                {generationHistory.slice(0, 6).map((item) => (
                  <div key={item.id} className="history-item">
                    <img
                      src={item.imageUrl}
                      alt={item.prompt}
                      onClick={() => setGeneratedImage(item)}
                    />
                    <p className="history-prompt">{item.prompt}</p>
                    <p className="history-provider">{item.provider}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGenerator; 