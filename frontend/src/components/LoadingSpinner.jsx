import React from 'react';

const LoadingSpinner = ({ text = 'Loading data...', fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 bg-light">
        <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted fw-medium">{text}</p>
      </div>
    );
  }

  return (
    <div className="text-center py-5">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="mt-2 text-muted small">{text}</p>
    </div>
  );
};

export default LoadingSpinner;
