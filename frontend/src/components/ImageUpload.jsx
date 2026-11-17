import React, { useState, useRef } from 'react';

export default function ImageUpload({ onImageSelected, isLoading }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoading) setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (isLoading) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndPass(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndPass(e.target.files[0]);
    }
  };

  const validateAndPass = (file) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPEG, PNG, or WebP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds the 10MB limit. Please upload a smaller image.');
      return;
    }
    onImageSelected(file);
  };

  return (
    <div className="upload-container">
      <div
        className={`dropzone ${isDragOver ? 'dropzone-active' : ''} ${isLoading ? 'dropzone-disabled' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isLoading && fileInputRef.current && fileInputRef.current.click()}
        role="button"
        tabIndex={0}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="file-input-hidden"
          onChange={handleFileInputChange}
          disabled={isLoading}
        />

        <div className="dropzone-content">
          <div className="upload-icon-wrapper">
            <svg
              className="upload-svg"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>

          <h3 className="dropzone-title">
            {isLoading ? 'Processing Leaf...' : 'Drop your potato leaf photo here'}
          </h3>
          <p className="dropzone-subtitle">or click to browse from your device</p>
          <div className="dropzone-badge-list">
            <span className="badge">JPG</span>
            <span className="badge">PNG</span>
            <span className="badge">WEBP</span>
            <span className="badge">Max 10 MB</span>
          </div>
        </div>
      </div>
    </div>
  );
}
