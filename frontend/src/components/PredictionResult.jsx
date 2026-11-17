import React, { useState } from 'react';

export default function PredictionResult({ result, onReset }) {
  const [activeTab, setActiveTab] = useState('treatment');
  const [copied, setCopied] = useState(false);

  if (!result || !result.prediction) return null;

  const { prediction } = result;
  const isHealthy = prediction.class_raw === 'Potato___healthy';
  const isLateBlight = prediction.class_raw === 'Potato___Late_blight';

  const severityColor = isHealthy
    ? 'badge-healthy'
    : isLateBlight
    ? 'badge-critical'
    : 'badge-moderate';

  const handleCopySummary = () => {
    const summary = `
[Potato Leaf Disease AI Diagnosis]
Diagnosis: ${prediction.display_name} (${prediction.scientific_name})
Confidence: ${prediction.confidence}%
Severity: ${prediction.severity}
Status: ${prediction.status}

Symptoms:
${prediction.symptoms.map((s) => `• ${s}`).join('\n')}

Treatments:
${prediction.treatments.map((t) => `• ${t}`).join('\n')}

Prevention:
${prediction.prevention.map((p) => `• ${p}`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="result-card">
      {/* Header Banner */}
      <div className={`result-header ${severityColor}-header`}>
        <div className="result-header-main">
          <span className="result-eyebrow">Diagnostic Result</span>
          <h2 className="result-title">{prediction.display_name}</h2>
          <span className="result-scientific">{prediction.scientific_name}</span>
        </div>

        <div className="result-header-badges">
          <span className={`status-badge ${severityColor}`}>
            {prediction.status} • {prediction.severity}
          </span>
          <div className="confidence-pill">
            <span className="confidence-label">Confidence:</span>
            <span className="confidence-value">{prediction.confidence}%</span>
          </div>
        </div>
      </div>

      <div className="result-body">
        {/* Description */}
        <p className="result-description">{prediction.description}</p>

        {/* Confidence Probability Breakdown */}
        {prediction.breakdown && prediction.breakdown.length > 0 && (
          <div className="breakdown-section">
            <h4 className="section-heading">Class Probability Distribution</h4>
            <div className="breakdown-list">
              {prediction.breakdown.map((item) => (
                <div key={item.class_raw} className="breakdown-item">
                  <div className="breakdown-info">
                    <span className="breakdown-name">{item.display_name}</span>
                    <span className="breakdown-percent">{item.probability}%</span>
                  </div>
                  <div className="progress-bar-bg">
                    <div
                      className={`progress-bar-fill ${
                        item.class_raw === prediction.class_raw
                          ? isHealthy
                            ? 'fill-healthy'
                            : isLateBlight
                            ? 'fill-critical'
                            : 'fill-moderate'
                          : 'fill-dim'
                      }`}
                      style={{ width: `${Math.max(item.probability, 2)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Navigation for Clinical Information */}
        <div className="tabs-container">
          <div className="tabs-header">
            <button
              type="button"
              className={`tab-btn ${activeTab === 'treatment' ? 'tab-btn-active' : ''}`}
              onClick={() => setActiveTab('treatment')}
            >
              💊 Treatments
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === 'symptoms' ? 'tab-btn-active' : ''}`}
              onClick={() => setActiveTab('symptoms')}
            >
              🔍 Symptoms
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === 'prevention' ? 'tab-btn-active' : ''}`}
              onClick={() => setActiveTab('prevention')}
            >
              🛡️ Prevention
            </button>
            {prediction.causes && prediction.causes.length > 0 && (
              <button
                type="button"
                className={`tab-btn ${activeTab === 'causes' ? 'tab-btn-active' : ''}`}
                onClick={() => setActiveTab('causes')}
              >
                ⚠️ Causes
              </button>
            )}
          </div>

          <div className="tab-content">
            {activeTab === 'treatment' && (
              <ul className="info-list">
                {prediction.treatments && prediction.treatments.length > 0 ? (
                  prediction.treatments.map((t, idx) => (
                    <li key={idx} className="info-item">
                      <span className="bullet-icon">✓</span>
                      <span>{t}</span>
                    </li>
                  ))
                ) : (
                  <p className="no-data">No special treatment required for healthy foliage.</p>
                )}
              </ul>
            )}

            {activeTab === 'symptoms' && (
              <ul className="info-list">
                {prediction.symptoms && prediction.symptoms.length > 0 ? (
                  prediction.symptoms.map((s, idx) => (
                    <li key={idx} className="info-item">
                      <span className="bullet-icon">●</span>
                      <span>{s}</span>
                    </li>
                  ))
                ) : (
                  <p className="no-data">No abnormal symptoms detected.</p>
                )}
              </ul>
            )}

            {activeTab === 'prevention' && (
              <ul className="info-list">
                {prediction.prevention && prediction.prevention.length > 0 ? (
                  prediction.prevention.map((p, idx) => (
                    <li key={idx} className="info-item">
                      <span className="bullet-icon">🛡️</span>
                      <span>{p}</span>
                    </li>
                  ))
                ) : (
                  <p className="no-data">Standard preventive scouting recommended.</p>
                )}
              </ul>
            )}

            {activeTab === 'causes' && (
              <ul className="info-list">
                {prediction.causes && prediction.causes.length > 0 ? (
                  prediction.causes.map((c, idx) => (
                    <li key={idx} className="info-item">
                      <span className="bullet-icon">⚡</span>
                      <span>{c}</span>
                    </li>
                  ))
                ) : (
                  <p className="no-data">None identified.</p>
                )}
              </ul>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="result-footer-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={handleCopySummary}
          >
            {copied ? '✅ Summary Copied!' : '📋 Copy Report Summary'}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onReset}
          >
            🌿 Analyze Another Leaf
          </button>
        </div>
      </div>
    </div>
  );
}
