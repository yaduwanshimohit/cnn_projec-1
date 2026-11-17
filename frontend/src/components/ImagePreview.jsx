import React from 'react';

export default function ImagePreview({
  previewUrl,
  fileName,
  fileSize,
  onAnalyze,
  onReset,
  isLoading,
}) {
  const formatSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="preview-card">
      <div className="preview-image-wrapper">
        <img src={previewUrl} alt="Potato leaf preview" className="preview-image" />
        {isLoading && (
          <div className="preview-overlay-spinner">
            <div className="spinner"></div>
            <p className="spinnerText">Analyzing with AI CNN...</p>
          </div>
        )}
      </div>

      <div className="preview-details">
        <div className="preview-meta">
          <span className="file-name" title={fileName}>
            📄 {fileName || 'potato_leaf.jpg'}
          </span>
          {fileSize && <span className="file-size">({formatSize(fileSize)})</span>}
        </div>

        <div className="preview-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onReset}
            disabled={isLoading}
          >
            Clear / Select Other
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={onAnalyze}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="btn-spinner"></span> Classifying...
              </>
            ) : (
              '🔍 Diagnose Leaf'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
