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
  const [adminEmail, setAdminEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailSuccess, setEmailSuccess] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [proposalSortBy, setProposalSortBy] = useState('createdAt');
  const [proposalSortOrder, setProposalSortOrder] = useState('desc');

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
      const [cardsResponse, proposalsResponse, settingsResponse] = await Promise.all([
        apiClient.get('/api/admin/cards'),
        apiClient.get('/api/admin/proposals'),
        apiClient.get('/api/admin/settings')
      ]);
      // Ensure response.data is an array
      const cardsData = Array.isArray(cardsResponse.data) ? cardsResponse.data : [];
      const proposalsData = Array.isArray(proposalsResponse.data) ? proposalsResponse.data : [];
      
      
      setCards(cardsData);
      setProposals(proposalsData);
      setAdminEmail(settingsResponse.data.email || '');
    } catch (err) {
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

  const handleEmailUpdate = async (e) => {
    e.preventDefault();
    setEmailError('');
    setEmailSuccess('');

    if (!adminEmail || !adminEmail.includes('@')) {
      setEmailError('Please enter a valid email address');
      return;
    }

    try {
      await apiClient.put('/api/admin/settings', { email: adminEmail });
      setEmailSuccess('Email address updated successfully!');
      setTimeout(() => setEmailSuccess(''), 3000);
    } catch (err) {
      setEmailError('Failed to update email address');
    }
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

      <div className="container">
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
      <div className="admin-tabs-container">
        <div className="admin-tabs">
          <button
            onClick={() => setActiveTab('proposals')}
            className={`btn ${activeTab === 'proposals' ? 'btn-primary' : 'btn-secondary'} admin-tab-btn`}
          >
            Proposals ({(proposals || []).filter(p => p.status === 'pending').length})
          </button>
          <button
            onClick={() => setActiveTab('cards')}
            className={`btn ${activeTab === 'cards' ? 'btn-primary' : 'btn-secondary'} admin-tab-btn`}
          >
            Cards ({cards.length})
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`btn ${activeTab === 'settings' ? 'btn-primary' : 'btn-secondary'} admin-tab-btn`}
          >
            Settings
          </button>
        </div>
      </div>

      {/* Proposals Tab */}
      {activeTab === 'proposals' && (
        <div className="admin-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 className="section-title">Card Proposals</h2>
          </div>
          
          {/* Proposal Sorting Controls */}
          <div className="sorting-controls" style={{ marginBottom: '1.5rem' }}>
            <div className="sort-group">
              <label htmlFor="proposalSortBy" className="sort-label">Sort by:</label>
              <select
                id="proposalSortBy"
                value={proposalSortBy}
                onChange={(e) => setProposalSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="createdAt">Submission Date</option>
                <option value="name">Name</option>
                <option value="birthDate">Birth Year</option>
                <option value="deathDate">Death Year</option>
                <option value="tier">Tier</option>
                <option value="status">Status</option>
              </select>
            </div>
            
            <div className="sort-group">
              <label htmlFor="proposalSortOrder" className="sort-label">Order:</label>
              <select
                id="proposalSortOrder"
                value={proposalSortOrder}
                onChange={(e) => setProposalSortOrder(e.target.value)}
                className="sort-select"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>
          
          {proposals.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#e6d7c3', padding: '2rem' }}>
              No proposals found
            </p>
          ) : (
            <div>
              {proposals
                .sort((a, b) => {
                  // Sort pending proposals first, then by selected criteria
                  if (a.status === 'pending' && b.status !== 'pending') return -1;
                  if (a.status !== 'pending' && b.status === 'pending') return 1;
                  
                  let aValue, bValue;
                  
                  switch (proposalSortBy) {
                    case 'createdAt':
                      aValue = new Date(a.createdAt);
                      bValue = new Date(b.createdAt);
                      break;
                    case 'name':
                      aValue = a.name.toLowerCase();
                      bValue = b.name.toLowerCase();
                      break;
                    case 'birthDate':
                      aValue = a.birthDate ? parseInt(a.birthDate.split('-')[0] || a.birthDate) : 0;
                      bValue = b.birthDate ? parseInt(b.birthDate.split('-')[0] || b.birthDate) : 0;
                      break;
                    case 'deathDate':
                      aValue = a.deathDate ? parseInt(a.deathDate.split('-')[0] || a.deathDate) : 0;
                      bValue = b.deathDate ? parseInt(b.deathDate.split('-')[0] || b.deathDate) : 0;
                      break;
                    case 'tier':
                      const tierOrder = { 'Common': 1, 'Rare': 2, 'Epic': 3, 'Legendary': 4, 'Mythic': 5 };
                      aValue = tierOrder[a.tier] || 0;
                      bValue = tierOrder[b.tier] || 0;
                      break;
                    case 'status':
                      aValue = a.status.toLowerCase();
                      bValue = b.status.toLowerCase();
                      break;
                    default:
                      aValue = new Date(a.createdAt);
                      bValue = new Date(b.createdAt);
                  }
                  
                  if (aValue < bValue) return proposalSortOrder === 'asc' ? -1 : 1;
                  if (aValue > bValue) return proposalSortOrder === 'asc' ? 1 : -1;
                  return 0;
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
          <div className="admin-section-header">
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
            <div>
              {/* Sorting controls for admin cards */}
              <div className="sorting-controls" style={{ marginBottom: '2rem' }}>
                <div className="sort-group">
                  <label htmlFor="adminSortBy" className="sort-label">Sort by:</label>
                  <select
                    id="adminSortBy"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="sort-select"
                  >
                    <option value="name">Name</option>
                    <option value="birthDate">Birth Date</option>
                    <option value="deathDate">Death Date</option>
                    <option value="tier">Tier</option>
                  </select>
                </div>
                
                <div className="sort-group">
                  <label htmlFor="adminSortOrder" className="sort-label">Order:</label>
                  <select
                    id="adminSortOrder"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="sort-select"
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                </div>
              </div>

              <div className="card-grid">
                {cards
                  .sort((a, b) => {
                    let aValue, bValue;
                    
                    switch (sortBy) {
                      case 'name':
                        aValue = a.name.toLowerCase();
                        bValue = b.name.toLowerCase();
                        break;
                      case 'birthDate':
                        aValue = a.birthDate ? parseInt(a.birthDate.split('-')[0] || a.birthDate) : 0;
                        bValue = b.birthDate ? parseInt(b.birthDate.split('-')[0] || b.birthDate) : 0;
                        break;
                      case 'deathDate':
                        aValue = a.deathDate ? parseInt(a.deathDate.split('-')[0] || a.deathDate) : 0;
                        bValue = b.deathDate ? parseInt(b.deathDate.split('-')[0] || b.deathDate) : 0;
                        break;
                      case 'tier':
                        const tierOrder = { 'Common': 1, 'Rare': 2, 'Epic': 3, 'Legendary': 4, 'Mythic': 5 };
                        aValue = tierOrder[a.tier] || 0;
                        bValue = tierOrder[b.tier] || 0;
                        break;
                      default:
                        aValue = a.name.toLowerCase();
                        bValue = b.name.toLowerCase();
                    }
                    
                    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
                    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
                    return 0;
                  })
                  .map(card => (
                    <div key={card.id} className="admin-card-wrapper">
                      <Card 
                        card={card} 
                        isAdmin={true}
                        onEdit={handleEditCard}
                        onDelete={handleDeleteCard}
                      />
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="admin-section">
          <div className="admin-section-header">
            <h2 className="section-title">Admin Settings</h2>
          </div>
          
          <div className="form-container" style={{ maxWidth: '500px', margin: '0 auto' }}>
            <form onSubmit={handleEmailUpdate}>
              <div className="form-group">
                <label htmlFor="adminEmail" className="form-label">
                  Admin Email Address
                </label>
                <p style={{ color: '#e6d7c3', fontSize: '0.9rem', marginBottom: '1rem' }}>
                  This email will receive notifications when new proposals are submitted.
                </p>
                <input
                  type="email"
                  id="adminEmail"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="form-input"
                  placeholder="admin@example.com"
                  required
                />
              </div>

              {emailError && (
                <div className="error" style={{ marginBottom: '1rem' }}>
                  {emailError}
                </div>
              )}

              {emailSuccess && (
                <div style={{ 
                  color: '#4CAF50', 
                  backgroundColor: '#1B5E20', 
                  padding: '0.75rem', 
                  borderRadius: '4px', 
                  marginBottom: '1rem',
                  textAlign: 'center'
                }}>
                  {emailSuccess}
                </div>
              )}

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Update Email Address
              </button>
            </form>

            <div style={{ 
              marginTop: '2rem', 
              padding: '1rem', 
              backgroundColor: 'rgba(255, 255, 255, 0.05)', 
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <h3 style={{ color: '#e6d7c3', marginBottom: '1rem' }}>Email Notifications</h3>
              <p style={{ color: '#e6d7c3', fontSize: '0.9rem', lineHeight: '1.5' }}>
                The admin email address is used to send notifications for:
              </p>
              <ul style={{ color: '#e6d7c3', fontSize: '0.9rem', marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                <li>New proposal submissions</li>
                <li>System alerts and updates</li>
              </ul>
              <p style={{ color: '#e6d7c3', fontSize: '0.9rem', marginTop: '1rem', fontStyle: 'italic' }}>
                Note: Users who submit proposals will also receive email notifications when their proposals are approved or rejected.
              </p>
            </div>
          </div>
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
