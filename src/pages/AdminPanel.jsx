import React, { useState, useEffect } from 'react';
import { useCards } from '../hooks/useCards';
import { useProposals } from '../hooks/useProposals';
import { useAdmin } from '../hooks/useAdmin';
import CardsTab from './Admin/CardsTab';
import ProposalsTab from './Admin/ProposalsTab';
import SettingsTab from './Admin/SettingsTab';
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
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [editingProposal, setEditingProposal] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [cardToDelete, setCardToDelete] = useState(null);
  const [proposalToDelete, setProposalToDelete] = useState(null);
  const [adminEmail, setAdminEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailSuccess, setEmailSuccess] = useState('');
  const [socialMediaUrls, setSocialMediaUrls] = useState({
    instagramUrl: '',
    twitterUrl: '',
    facebookUrl: '',
    linkedinUrl: '',
    youtubeUrl: ''
  });
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [proposalSortBy, setProposalSortBy] = useState('createdAt');
  const [proposalSortOrder, setProposalSortOrder] = useState('desc');

  const cardsHook = useCards({ admin: true });
  const proposalsHook = useProposals();
  const adminHook = useAdmin();

  useEffect(() => {
    if (adminHook.isAuthenticated()) {
      setIsAuthenticated(true);
      fetchData();
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError('');
    
    const ok = adminHook.login(loginData.username, loginData.password);
    if (!ok) {
      setLoginError('Invalid username or password');
      return;
    }
    setIsAuthenticated(true);
    fetchData();
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    adminHook.logout();
    setCards([]);
    setProposals([]);
    setActiveTab('proposals');
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [cardsData, proposalsData, settings] = await Promise.all([
        cardsHook.fetchCards(),
        proposalsHook.fetchProposals(),
        adminHook.fetchSettings(),
      ]);
      setCards(cardsData || []);
      setProposals(proposalsData || []);
      setAdminEmail(settings?.email || '');
      setSocialMediaUrls({
        instagramUrl: settings?.instagramUrl || '',
        twitterUrl: settings?.twitterUrl || '',
        facebookUrl: settings?.facebookUrl || '',
        linkedinUrl: settings?.linkedinUrl || '',
        youtubeUrl: settings?.youtubeUrl || ''
      });
    } catch (err) {
      setError('Failed to load admin data. Using sample data...');
      setCards([]);
      setProposals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveProposal = async (proposalId) => {
    try {
      await proposalsHook.approveProposal(proposalId);
      await fetchData();
    } catch (err) {
      setError('Failed to approve proposal');
    }
  };

  const handleRejectProposal = async (proposalId) => {
    try {
      await proposalsHook.rejectProposal(proposalId);
      await fetchData();
    } catch (err) {
      setError('Failed to reject proposal');
    }
  };

  const handleEditProposal = (proposal) => {
    setEditingProposal(proposal);
    setShowProposalForm(true);
  };

  const handleDeleteCard = (card) => {
    setCardToDelete(card);
    setShowDeleteModal(true);
  };

  const handleSettingsUpdate = async (e) => {
    e.preventDefault();
    setEmailError('');
    setEmailSuccess('');

    if (!adminEmail || !adminEmail.includes('@')) {
      setEmailError('Please enter a valid email address');
      return;
    }

    try {
      await adminHook.updateSettings({ 
        email: adminEmail,
        ...socialMediaUrls
      });
      setEmailSuccess('Settings updated successfully!');
      setTimeout(() => setEmailSuccess(''), 3000);
    } catch (err) {
      setEmailError('Failed to update settings');
    }
  };

  const confirmDeleteCard = async () => {
    if (cardToDelete) {
      try {
        await cardsHook.deleteCard(cardToDelete.id);
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

  const handleDeleteProposal = (proposal) => {
    setProposalToDelete(proposal);
    setShowDeleteModal(true);
  };

  const confirmDeleteProposal = async () => {
    if (proposalToDelete) {
      try {
        await proposalsHook.deleteProposal(proposalToDelete.id);
        await fetchData();
        setShowDeleteModal(false);
        setProposalToDelete(null);
      } catch (err) {
        setError('Failed to delete proposal');
        setShowDeleteModal(false);
        setProposalToDelete(null);
      }
    }
  };

  const cancelDeleteProposal = () => {
    setShowDeleteModal(false);
    setProposalToDelete(null);
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
        await cardsHook.updateCard(editingCard.id, cardData);
      } else {
        await cardsHook.createCard(cardData);
      }
      setShowCardForm(false);
      setEditingCard(null);
      await fetchData();
    } catch (err) {
      setError('Failed to save card');
    }
  };

  const handleProposalFormSubmit = async (proposalData) => {
    try {
      if (editingProposal) {
        await proposalsHook.updateProposal(editingProposal.id, proposalData);
      }
      setShowProposalForm(false);
      setEditingProposal(null);
      await fetchData();
    } catch (err) {
      setError('Failed to save proposal');
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div role="status" aria-live="polite" className="loading" style={{ textAlign: 'center', padding: '2rem' }}>
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
            <div className="error" role="alert">
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

  if (showProposalForm && editingProposal) {
    // Map proposal to CardForm's expected shape
    const cardLike = {
      id: editingProposal.id,
      name: editingProposal.name,
      image: editingProposal.image,
      attributes: editingProposal.attributes,
      tier: editingProposal.tier,
      description: editingProposal.description,
      birthYear: editingProposal.birthYear || '',
      deathYear: editingProposal.deathYear || ''
    };
    return (
      <div className="container">
        <CardForm
          card={cardLike}
          onSubmit={handleProposalFormSubmit}
          onCancel={() => {
            setShowProposalForm(false);
            setEditingProposal(null);
          }}
        />
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
        <div className="error" role="alert">
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

      {activeTab === 'proposals' && (
        <ProposalsTab
          proposals={proposals}
          proposalSortBy={proposalSortBy}
          setProposalSortBy={setProposalSortBy}
          proposalSortOrder={proposalSortOrder}
          setProposalSortOrder={setProposalSortOrder}
          onApprove={handleApproveProposal}
          onReject={handleRejectProposal}
          onEdit={handleEditProposal}
          onDelete={handleDeleteProposal}
        />
      )}

      {/* Cards Tab */}
      {activeTab === 'cards' && (
        <CardsTab
          cards={cards}
          sortBy={sortBy}
          sortOrder={sortOrder}
          setSortBy={setSortBy}
          setSortOrder={setSortOrder}
          onCreateCard={handleCreateCard}
          onEditCard={handleEditCard}
          onDeleteCard={handleDeleteCard}
        />
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <SettingsTab
          adminEmail={adminEmail}
          setAdminEmail={setAdminEmail}
          socialMediaUrls={socialMediaUrls}
          setSocialMediaUrls={setSocialMediaUrls}
          emailError={emailError}
          emailSuccess={emailSuccess}
          onSubmit={handleSettingsUpdate}
        />
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={proposalToDelete ? cancelDeleteProposal : cancelDeleteCard}
        onConfirm={proposalToDelete ? confirmDeleteProposal : confirmDeleteCard}
        title={proposalToDelete ? 'Delete Proposal' : 'Delete Card'}
        message={proposalToDelete 
          ? `Are you sure you want to delete proposal "${proposalToDelete?.name}"? This action cannot be undone.`
          : `Are you sure you want to delete "${cardToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
      </div>
    </div>
  );
};

export default AdminPanel;
