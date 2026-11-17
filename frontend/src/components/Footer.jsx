import React from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand-info">
          <div className="footer-logo">🌱 PotatoLeaf AI Platform</div>
          <p className="footer-desc">
            An end-to-end intelligent crop pathology system powered by Convolutional Neural
            Networks (CNN) to detect potato leaf blight early and safeguard crop yields.
          </p>
        </div>

        <div className="footer-grid">
          <div className="footer-column">
            <h5 className="footer-title">Detected Pathologies</h5>
            <ul className="footer-links">
              <li>• Early Blight (<em>Alternaria solani</em>)</li>
              <li>• Late Blight (<em>Phytophthora infestans</em>)</li>
              <li>• Healthy Potato Foliage</li>
            </ul>
          </div>

          <div className="footer-column">
            <h5 className="footer-title">Architecture</h5>
            <ul className="footer-links">
              <li>• Deep CNN with BatchNormalization</li>
              <li>• 128×128 RGB Image Pipeline</li>
              <li>• FastAPI & Node.js Microservices</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          &copy; {currentYear} PotatoLeaf AI. For agricultural advisory and scouting assistance.
        </p>
      </div>
    </footer>
  );
}
