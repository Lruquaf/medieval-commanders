import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import CollectionGallery from './pages/CollectionGallery';
import CreateProposal from './pages/CreateProposal';
import AdminPanel from './pages/AdminPanel';

function AppContent() {
  const location = useLocation();
  const isAdminPage = location.pathname === '/admin';

  return (
    <div className="App">
      {!isAdminPage && <Header />}
      <Routes>
        <Route path="/" element={<CollectionGallery />} />
        <Route path="/propose" element={<CreateProposal />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
