import React from 'react';

const LoadingSpinner = ({ label = 'Loading…' }) => {
  return (
    <div role="status" aria-live="polite" className="loading" style={{ textAlign: 'center', padding: '2rem' }}>
      <div className="spinner" aria-hidden="true" style={{ margin: '0 auto 0.5rem' }} />
      <span>{label}</span>
    </div>
  );
};

export default LoadingSpinner;


