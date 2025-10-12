import React from 'react';

const EmptyState = ({ title = 'No data', description }) => {
  return (
    <div role="region" aria-label="Empty state" style={{ textAlign: 'center', padding: '3rem', color: 'white' }}>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
    </div>
  );
};

export default EmptyState;


