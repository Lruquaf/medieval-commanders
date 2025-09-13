import React, { useState, useEffect } from 'react';
import apiClient from '../config/api';
import Card from '../components/Card';
import ProposalItem from '../components/ProposalItem';
import CardForm from '../components/CardForm';
import ConfirmationModal from '../components/ConfirmationModal';

const AdminPanel = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState('proposals');
  const [cards, setCards] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCardForm, setShowCardForm] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [cardToDelete, setCardToDelete] = useState(null);

  useEffect(() => {
    // Check if already authenticated
    const authStatus = localStorage.getItem('adminAuthenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
      fetchData();
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError('');
    
    // Simple authentication - in production, this would be server-side
    if (loginData.username === 'admin' && loginData.password === 'admin123') {
      setIsAuthenticated(true);
      localStorage.setItem('adminAuthenticated', 'true');
      fetchData();
    } else {
      setLoginError('Invalid username or password');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('adminAuthenticated');
    setCards([]);
    setProposals([]);
    setActiveTab('proposals');
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [cardsResponse, proposalsResponse] = await Promise.all([
        apiClient.get('/api/admin/cards'),
        apiClient.get('/api/admin/proposals')
      ]);
      // Ensure response.data is an array
      const cardsData = Array.isArray(cardsResponse.data) ? cardsResponse.data : [];
      const proposalsData = Array.isArray(proposalsResponse.data) ? proposalsResponse.data : [];
      
      console.log('Fetched cards data:', cardsData);
      console.log('Sample card image:', cardsData[0]?.image);
      
      setCards(cardsData);
      setProposals(proposalsData);
    } catch (err) {
      console.error('Error fetching admin data:', err);
      setError('Failed to load admin data. Using sample data...');
      // Use sample data if API fails
      setCards([
        {
          id: '1',
          name: 'Richard the Lionheart',
          email: 'richard@example.com',
          image: '/placeholder-commander.jpg',
          attributes: JSON.stringify({
            strength: 85,
            intelligence: 70,
            charisma: 90,
            leadership: 95
          }),
          tier: 'Legendary',
          description: 'King of England and leader of the Third Crusade',
          status: 'approved',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]);
      setProposals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveProposal = async (proposalId) => {
    try {
      await apiClient.post(`/api/admin/proposals/${proposalId}/approve`);
      await fetchData();
    } catch (err) {
      setError('Failed to approve proposal');
    }
  };

  const handleRejectProposal = async (proposalId) => {
    try {
      await apiClient.post(`/api/admin/proposals/${proposalId}/reject`);
      await fetchData();
    } catch (err) {
      setError('Failed to reject proposal');
    }
  };

  const handleDeleteCard = (card) => {
    setCardToDelete(card);
    setShowDeleteModal(true);
  };

  const confirmDeleteCard = async () => {
    if (cardToDelete) {
      try {
        await apiClient.delete(`/api/admin/cards/${cardToDelete.id}`);
        await fetchData();
        setShowDeleteModal(false);
        setCardToDelete(null);
      } catch (err) {
        setError('Failed to delete card');
        setShowDeleteModal(false);
        setCardToDelete(null);
      }
    }
  };

  const cancelDeleteCard = () => {
    setShowDeleteModal(false);
    setCardToDelete(null);
  };

  const handleEditCard = (card) => {
    setEditingCard(card);
    setShowCardForm(true);
  };

  const handleCreateCard = () => {
    setEditingCard(null);
    setShowCardForm(true);
  };

  const handleCardFormSubmit = async (cardData) => {
    try {
      if (editingCard) {
        await apiClient.put(`/api/admin/cards/${editingCard.id}`, cardData, {
          headers: {
            'Content-Type': undefined // Let axios set it automatically for FormData
          }
        });
      } else {
        await apiClient.post('/api/admin/cards', cardData, {
          headers: {
            'Content-Type': undefined // Let axios set it automatically for FormData
          }
        });
      }
      setShowCardForm(false);
      setEditingCard(null);
      await fetchData();
    } catch (err) {
      console.error('Error saving card:', err);
      setError('Failed to save card');
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <h2>Loading admin panel...</h2>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container">
        <div style={{ textAlign: 'center', margin: '2rem 0' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'white' }}>
            Admin Login
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'rgba(255, 255, 255, 0.9)', marginBottom: '2rem' }}>
            Please enter your admin credentials
          </p>
        </div>

        <form onSubmit={handleLogin} className="form-container" style={{ maxWidth: '400px', margin: '0 auto' }}>
          {loginError && (
            <div className="error">
              {loginError}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username" className="form-label">Username *</label>
            <input
              type="text"
              id="username"
              name="username"
              value={loginData.username}
              onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
              className="form-input"
              required
              placeholder="Enter username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={loginData.password}
              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              className="form-input"
              required
              placeholder="Enter password"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              type="submit"
              className="btn btn-primary"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (showCardForm) {
    return (
      <div className="container">
        <CardForm
          card={editingCard}
          onSubmit={handleCardFormSubmit}
          onCancel={() => {
            setShowCardForm(false);
            setEditingCard(null);
          }}
        />
      </div>
    );
  }

  return (
    <div>
      {/* Custom Admin Header */}
      <header className="header">
        <div className="container">
          <nav className="nav">
            <div className="logo" style={{ cursor: 'default' }}>
              ⚔️ Medieval Commanders
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <button
                onClick={handleLogout}
                className="btn btn-secondary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
              >
                Logout
              </button>
            </div>
          </nav>
        </div>
      </header>

      <div className="admin-container">
        <div style={{ textAlign: 'center', margin: '2rem 0' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'white' }}>
            Admin Panel
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'rgba(255, 255, 255, 0.9)' }}>
            Manage cards and review proposals
          </p>
        </div>

      {error && (
        <div className="error">
          {error}
        </div>
      )}

      {/* Tab Navigation */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', background: 'linear-gradient(135deg, rgba(139, 69, 19, 0.3) 0%, rgba(101, 67, 33, 0.3) 100%)', borderRadius: '8px', padding: '4px', border: '2px solid rgba(212, 175, 55, 0.2)' }}>
          <button
            onClick={() => setActiveTab('proposals')}
            className={`btn ${activeTab === 'proposals' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ margin: '0', borderRadius: '6px' }}
          >
            Proposals ({(proposals || []).filter(p => p.status === 'pending').length})
          </button>
          <button
            onClick={() => setActiveTab('cards')}
            className={`btn ${activeTab === 'cards' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ margin: '0', borderRadius: '6px' }}
          >
            Cards ({cards.length})
          </button>
        </div>
      </div>

      {/* Proposals Tab */}
      {activeTab === 'proposals' && (
        <div className="admin-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 className="section-title">Card Proposals</h2>
          </div>
          
          {proposals.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#e6d7c3', padding: '2rem' }}>
              No proposals found
            </p>
          ) : (
            <div>
              {proposals
                .sort((a, b) => {
                  // Sort pending proposals first, then by creation date (newest first)
                  if (a.status === 'pending' && b.status !== 'pending') return -1;
                  if (a.status !== 'pending' && b.status === 'pending') return 1;
                  return new Date(b.createdAt) - new Date(a.createdAt);
                })
                .map(proposal => (
                  <ProposalItem
                    key={proposal.id}
                    proposal={proposal}
                    onApprove={() => handleApproveProposal(proposal.id)}
                    onReject={() => handleRejectProposal(proposal.id)}
                  />
                ))}
            </div>
          )}
        </div>
      )}

      {/* Cards Tab */}
      {activeTab === 'cards' && (
        <div className="admin-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 className="section-title">Manage Cards</h2>
            <button onClick={handleCreateCard} className="btn btn-primary">
              Create New Card
            </button>
          </div>
          
          {cards.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#e6d7c3', padding: '2rem' }}>
              No cards found
            </p>
          ) : (
            <div className="card-grid">
              {cards.map(card => (
                <div key={card.id} style={{ position: 'relative' }}>
                  <Card card={card} />
                  <div style={{ 
                    position: 'absolute', 
                    top: '10px', 
                    right: '10px', 
                    display: 'flex', 
                    gap: '0.5rem' 
                  }}>
                    <button
                      onClick={() => handleEditCard(card)}
                      className="btn btn-secondary"
                      style={{ padding: '0.5rem', fontSize: '0.8rem' }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCard(card)}
                      className="btn btn-danger"
                      style={{ padding: '0.5rem', fontSize: '0.8rem' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={cancelDeleteCard}
        onConfirm={confirmDeleteCard}
        title="Delete Card"
        message={`Are you sure you want to delete "${cardToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
      </div>
    </div>
  );
};

export default AdminPanel;
