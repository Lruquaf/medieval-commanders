import React from 'react';

function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Medieval Commanders Collection</h1>
      <p>App is loading...</p>
      <p>Environment: {import.meta.env.MODE}</p>
      <p>API URL: {import.meta.env.VITE_API_URL || 'Not set'}</p>
    </div>
  );
}

export default App;
