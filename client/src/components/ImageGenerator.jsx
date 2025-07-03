import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ImageGenerator.css';

const ImageGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState('dalle');
  const [generationHistory, setGenerationHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  
  // Provider-specific options
  const [dalleOptions, setDalleOptions] = useState({
    size: '1024x1024',
    quality: 'standard',
    style: 'vivid'
  });
  
  const [stabilityOptions, setStabilityOptions] = useState({
    width: 1024,
    height: 1024,
    steps: 30,
    cfg_scale: 7
  });
  
  const [replicateOptions, setReplicateOptions] = useState({
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
      let requestData = {
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
    } catch (error) {
      console.error('Generation error:', error);
      setError(error.response?.data?.error || 'Failed to generate image');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = async (imageUrl) => {
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
            <h4>DALL-E Options</h4>
            <div className="option-group">
              <label>Size:</label>
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
              <label>Quality:</label>
              <select
                value={dalleOptions.quality}
                onChange={(e) => setDalleOptions({...dalleOptions, quality: e.target.value})}
              >
                <option value="standard">Standard</option>
                <option value="hd">HD</option>
              </select>
            </div>
            <div className="option-group">
              <label>Style:</label>
              <select
                value={dalleOptions.style}
                onChange={(e) => setDalleOptions({...dalleOptions, style: e.target.value})}
              >
                <option value="vivid">Vivid</option>
                <option value="natural">Natural</option>
              </select>
            </div>
          </div>
        );

      case 'stability':
        return (
          <div className="provider-options">
            <h4>Stability AI Options</h4>
            <div className="option-group">
              <label>Width:</label>
              <input
                type="number"
                value={stabilityOptions.width}
                onChange={(e) => setStabilityOptions({...stabilityOptions, width: parseInt(e.target.value)})}
                min="512"
                max="2048"
                step="64"
              />
            </div>
            <div className="option-group">
              <label>Height:</label>
              <input
                type="number"
                value={stabilityOptions.height}
                onChange={(e) => setStabilityOptions({...stabilityOptions, height: parseInt(e.target.value)})}
                min="512"
                max="2048"
                step="64"
              />
            </div>
            <div className="option-group">
              <label>Steps:</label>
              <input
                type="number"
                value={stabilityOptions.steps}
                onChange={(e) => setStabilityOptions({...stabilityOptions, steps: parseInt(e.target.value)})}
                min="10"
                max="150"
              />
            </div>
            <div className="option-group">
              <label>CFG Scale:</label>
              <input
                type="number"
                value={stabilityOptions.cfg_scale}
                onChange={(e) => setStabilityOptions({...stabilityOptions, cfg_scale: parseFloat(e.target.value)})}
                min="1"
                max="20"
                step="0.5"
              />
            </div>
          </div>
        );

      case 'replicate':
        return (
          <div className="provider-options">
            <h4>Replicate Options</h4>
            <div className="option-group">
              <label>Model:</label>
              <select
                value={replicateOptions.model}
                onChange={(e) => setReplicateOptions({...replicateOptions, model: e.target.value})}
              >
                <option value="stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b">SDXL</option>
                <option value="cjwb/animegan-v2:4020336909787e8a23c7513c3bde3998583447e45c446979a7c7378a5171b8de">AnimeGAN v2</option>
              </select>
            </div>
            <div className="option-group">
              <label>Width:</label>
              <input
                type="number"
                value={replicateOptions.width}
                onChange={(e) => setReplicateOptions({...replicateOptions, width: parseInt(e.target.value)})}
                min="256"
                max="2048"
                step="64"
              />
            </div>
            <div className="option-group">
              <label>Height:</label>
              <input
                type="number"
                value={replicateOptions.height}
                onChange={(e) => setReplicateOptions({...replicateOptions, height: parseInt(e.target.value)})}
                min="256"
                max="2048"
                step="64"
              />
            </div>
            <div className="option-group">
              <label>Inference Steps:</label>
              <input
                type="number"
                value={replicateOptions.num_inference_steps}
                onChange={(e) => setReplicateOptions({...replicateOptions, num_inference_steps: parseInt(e.target.value)})}
                min="10"
                max="100"
              />
            </div>
            <div className="option-group">
              <label>Guidance Scale:</label>
              <input
                type="number"
                value={replicateOptions.guidance_scale}
                onChange={(e) => setReplicateOptions({...replicateOptions, guidance_scale: parseFloat(e.target.value)})}
                min="1"
                max="20"
                step="0.5"
              />
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
              rows="3"
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