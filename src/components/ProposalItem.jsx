import React from 'react';
import apiClient from '../config/api';

const ProposalItem = ({ proposal, onApprove, onReject }) => {
  const getTierClass = (tier) => {
    return `tier-${tier.toLowerCase()}`;
  };

  const getStatusClass = (status) => {
    return `status-${status.toLowerCase()}`;
  };

  // Helper function to get image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    // If it's a base64 data URL (legacy), return as is
    if (imagePath.startsWith('data:')) {
      return imagePath;
    }
    
    // If it's already a full URL (Cloudinary or other), return as is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // For any other cases, return null (no image)
    return null;
  };

  return (
    <div className="proposal-item">
      <div className="proposal-header">
        <h3 className="proposal-name">{proposal.name}</h3>
        <div className={`proposal-status ${getStatusClass(proposal.status)}`}>
          {proposal.status}
        </div>
      </div>

      <div className="proposal-content">
        {/* Birth and Death Dates - Above Image */}
        {(proposal.birthYear || proposal.deathYear) && (
          <div className="proposal-dates-section">
            <div className="proposal-date-range">
              {(() => {
                const birthYear = proposal.birthYear;
                const deathYear = proposal.deathYear;
                
                if (birthYear && deathYear) {
                  return `${birthYear}-${deathYear}`;
                } else if (birthYear) {
                  return `Born: ${birthYear}`;
                } else if (deathYear) {
                  return `Died: ${deathYear}`;
                }
                return null;
              })()}
            </div>
          </div>
        )}

        {/* Image Section */}
        <div className="proposal-image-section">
          {proposal.image && (
            <div className="proposal-image-container">
              <img
                src={getImageUrl(proposal.image)}
                alt={proposal.name}
                className="proposal-image"
              />
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="proposal-features-section">
          <div className="proposal-tier-section">
            <div className={`card-tier ${getTierClass(proposal.tier)}`}>
              {proposal.tier}
            </div>
          </div>

          <div className="proposal-attributes">
            <div className="attribute">
              <span className="attribute-name">Strength</span>
              <span className="attribute-value">{proposal.attributes.strength}</span>
            </div>
            <div className="attribute">
              <span className="attribute-name">Intelligence</span>
              <span className="attribute-value">{proposal.attributes.intelligence}</span>
            </div>
            <div className="attribute">
              <span className="attribute-name">Charisma</span>
              <span className="attribute-value">{proposal.attributes.charisma}</span>
            </div>
            <div className="attribute">
              <span className="attribute-name">Leadership</span>
              <span className="attribute-value">{proposal.attributes.leadership}</span>
            </div>
            <div className="attribute">
              <span className="attribute-name">Attack</span>
              <span className="attribute-value">{proposal.attributes.attack}</span>
            </div>
            <div className="attribute">
              <span className="attribute-name">Defense</span>
              <span className="attribute-value">{proposal.attributes.defense}</span>
            </div>
            <div className="attribute">
              <span className="attribute-name">Speed</span>
              <span className="attribute-value">{proposal.attributes.speed}</span>
            </div>
            <div className="attribute">
              <span className="attribute-name">Health</span>
              <span className="attribute-value">{proposal.attributes.health}</span>
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="proposal-description-section">
          <p className="proposal-description">{proposal.description}</p>
        </div>
      </div>

      {proposal.status === 'pending' && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button 
              onClick={onApprove} 
              className="btn btn-success"
              style={{ 
                padding: '0.5rem 1.25rem', 
                fontSize: '0.9rem',
                minWidth: '80px'
              }}
            >
              Approve
            </button>
            <button 
              onClick={onReject} 
              className="btn btn-danger"
              style={{ 
                padding: '0.5rem 1.25rem', 
                fontSize: '0.9rem',
                minWidth: '80px'
              }}
            >
              Reject
            </button>
          </div>
        </div>
      )}

      <div style={{ fontSize: '0.8rem', color: '#e6d7c3', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#d4af37', fontWeight: '500' }}>Submitted: {new Date(proposal.createdAt).toLocaleDateString()}</span>
        <span style={{ color: '#d4af37', fontWeight: '500' }}>
          Proposer: {proposal.email || 'N/A'}
        </span>
      </div>
    </div>
  );
};

export default ProposalItem;
