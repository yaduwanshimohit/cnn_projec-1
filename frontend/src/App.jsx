import React, { useState, useEffect } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import ImageUpload from './components/ImageUpload';
import ImagePreview from './components/ImagePreview';
import PredictionResult from './components/PredictionResult';
import Footer from './components/Footer';
import { uploadAndPredict, checkBackendHealth } from './services/predictionService';

export default function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [predictionResult, setPredictionResult] = useState(null);
  const [backendStatus, setBackendStatus] = useState(null);

  // Check backend health on initial load and periodically
  useEffect(() => {
    async function verifyHealth() {
      const status = await checkBackendHealth();
      setBackendStatus(status);
    }
    verifyHealth();
    const interval = setInterval(verifyHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleImageSelected = (file) => {
    setSelectedFile(file);
    setFileName(file.name);
    setFileSize(file.size);
    setPredictionResult(null);
    setError(null);

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleReset = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setFileName('');
    setFileSize(null);
    setPredictionResult(null);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError('Please select or upload a potato leaf image first.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await uploadAndPredict(selectedFile);
      setPredictionResult(result);
    } catch (err) {
      console.error('Analysis error:', err);
      setError(
        err.message ||
          'Failed to connect to the prediction backend. Ensure backend and AI service are running.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to load sample synthetic canvas image for quick testing
  const handleLoadSample = (sampleType) => {
    handleReset();
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    // Draw realistic leaf representation
    if (sampleType === 'healthy') {
      ctx.fillStyle = '#2e7d32';
      ctx.fillRect(0, 0, 128, 128);
      ctx.fillStyle = '#4caf50';
      ctx.beginPath();
      ctx.ellipse(64, 64, 50, 25, Math.PI / 4, 0, 2 * Math.PI);
      ctx.fill();
    } else if (sampleType === 'early_blight') {
      ctx.fillStyle = '#558b2f';
      ctx.fillRect(0, 0, 128, 128);
      // Concentric rings (target spots)
      ctx.fillStyle = '#3e2723';
      ctx.beginPath();
      ctx.arc(64, 64, 28, 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = '#d7ccc8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(64, 64, 18, 0, 2 * Math.PI);
      ctx.stroke();
    } else if (sampleType === 'late_blight') {
      ctx.fillStyle = '#33691e';
      ctx.fillRect(0, 0, 128, 128);
      // Water-soaked irregular dark patch
      ctx.fillStyle = '#1b1b1b';
      ctx.beginPath();
      ctx.ellipse(55, 60, 42, 30, Math.PI / 6, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillStyle = '#eceff1';
      ctx.beginPath();
      ctx.arc(75, 75, 10, 0, 2 * Math.PI);
      ctx.fill();
    }

    canvas.toBlob((blob) => {
      const sampleNames = {
        healthy: 'sample_healthy_leaf.jpg',
        early_blight: 'sample_early_blight.jpg',
        late_blight: 'sample_late_blight.jpg',
      };
      const file = new File([blob], sampleNames[sampleType], { type: 'image/jpeg' });
      handleImageSelected(file);
    }, 'image/jpeg');
  };

  return (
    <div className="app-wrapper">
      <Navbar backendStatus={backendStatus} />

      <main className="main-content">
        {/* Hero Section */}
        <section className="hero-header">
          <span className="hero-chip">AI Agricultural Diagnostic</span>
          <h1 className="hero-title">Potato Leaf Disease Classifier</h1>
          <p className="hero-description">
            Upload high-resolution potato foliage photographs to identify Early Blight, Late Blight,
            or confirm healthy crops with deep learning neural networks.
          </p>
        </section>

        {/* Quick Sample Selector */}
        <section className="samples-bar">
          <div className="samples-label">
            <span>🔬</span> Test with dataset sample:
          </div>
          <div className="samples-buttons">
            <button
              type="button"
              className="sample-chip-btn"
              onClick={() => handleLoadSample('healthy')}
            >
              🌿 Healthy Leaf
            </button>
            <button
              type="button"
              className="sample-chip-btn"
              onClick={() => handleLoadSample('early_blight')}
            >
              🍂 Early Blight (Target Spots)
            </button>
            <button
              type="button"
              className="sample-chip-btn"
              onClick={() => handleLoadSample('late_blight')}
            >
              🥀 Late Blight (Water Soaked)
            </button>
          </div>
        </section>

        {/* Error Banner */}
        {error && (
          <div className="error-banner">
            <span>⚠️</span>
            <div>
              <strong>Error:</strong> {error}
            </div>
          </div>
        )}

        {/* Interactive Workspace Grid */}
        <section className="app-grid">
          {/* Left Column: Upload or Preview */}
          <div className="app-col-input">
            {!previewUrl ? (
              <ImageUpload
                onImageSelected={handleImageSelected}
                isLoading={isLoading}
              />
            ) : (
              <ImagePreview
                previewUrl={previewUrl}
                fileName={fileName}
                fileSize={fileSize}
                onAnalyze={handleAnalyze}
                onReset={handleReset}
                isLoading={isLoading}
              />
            )}
          </div>

          {/* Right Column: Prediction Results or Placeholder */}
          <div className="app-col-output">
            {predictionResult ? (
              <PredictionResult result={predictionResult} onReset={handleReset} />
            ) : (
              <div className="result-card" style={{ padding: '2.5rem 1.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📷</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                  No Prediction Yet
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', maxWidth: '380px', margin: '0 auto' }}>
                  Select or drop a potato leaf photo on the left, then click{' '}
                  <strong>"Diagnose Leaf"</strong> to generate clinical AI findings, severity scores, and treatments.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Educational Cards for Project Data Knowledge */}
        <section className="education-section">
          <h3 className="education-title">Detectable Pathologies in Dataset</h3>
          <div className="cards-grid">
            <div className="edu-card">
              <span className="edu-badge badge-moderate">Moderate Threat</span>
              <h4 className="edu-title">Early Blight</h4>
              <p className="edu-text">
                Caused by <em>Alternaria solani</em>. Characterized by dark brown concentric target-like rings on older leaves. Can lead to premature leaf drop and tuber loss.
              </p>
            </div>

            <div className="edu-card">
              <span className="edu-badge badge-critical">Severe Threat</span>
              <h4 className="edu-title">Late Blight</h4>
              <p className="edu-text">
                Caused by <em>Phytophthora infestans</em>. Characterized by water-soaked, dark lesions and white mildew in high humidity. Requires prompt fungicide intervention.
              </p>
            </div>

            <div className="edu-card">
              <span className="edu-badge badge-healthy">Optimal</span>
              <h4 className="edu-title">Healthy Leaf</h4>
              <p className="edu-text">
                Vibrant green foliage with no fungal lesions or chlorosis. Demonstrates optimal nutrient balance and vigorous potato vegetative development.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
