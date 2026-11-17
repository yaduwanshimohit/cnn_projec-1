import React from 'react';

export default function Navbar({ backendStatus }) {
  const isOnline = backendStatus && backendStatus.status === 'online';

  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <div className="navbar-logo-badge">🌱</div>
          <div className="navbar-brand-text">
            <h1 className="brand-title">PotatoLeaf AI</h1>
            <span className="brand-tagline">Deep Learning Crop Pathology</span>
          </div>
        </div>

        <div className="navbar-actions">
          <div className={`status-pill ${isOnline ? 'status-online' : 'status-offline'}`}>
            <span className="status-dot"></span>
            <span className="status-text">
              {isOnline ? 'System Online' : 'Connecting to Backend...'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
