import React, { useState } from 'react';
import apiClient from '../config/api';

const ProposalItem = ({ proposal, onApprove, onReject, onEdit, onDelete }) => {
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
    
    // Local uploads path from backend static server
    if (imagePath.includes('/uploads/')) {
      const baseURL = apiClient.defaults.baseURL?.replace(/\/$/, '');
      return `${baseURL}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
    }
    
    // Bare filenames from seed should map to public assets
    if (imagePath === 'placeholder-commander.jpg' || imagePath === 'placeholder-commander.svg') {
      return `/${imagePath}`;
    }
    
    // For any other cases, return null (no image)
    return null;
  };

  const [expanded, setExpanded] = useState(false);

  const yearsInline = (() => {
    const birthYear = proposal.birthYear;
    const deathYear = proposal.deathYear;
    if (birthYear && deathYear) return `${birthYear}-${deathYear}`;
    if (birthYear) return `Born: ${birthYear}`;
    if (deathYear) return `Died: ${deathYear}`;
    return '';
  })();

  const proposerInfo = (() => {
    const name = proposal.proposerName && String(proposal.proposerName).trim();
    const ig = proposal.proposerInstagram && String(proposal.proposerInstagram).trim();
    if (name || ig) {
      return (
        <>
          Proposer: {name || ''} {ig ? (
            <a
              href={`https://instagram.com/${ig.replace(/^@/, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#f4d03f', textDecoration: 'none' }}
            >
              @{ig.replace(/^@/, '')}
            </a>
          ) : null}
        </>
      );
    }
    if (proposal.email) return <>Proposer: {proposal.email}</>;
    return <>Proposer: N/A</>;
  })();

  const imageSrc = (() => {
    const src = proposal.image ? getImageUrl(proposal.image) : '/placeholder-commander.jpg';
    return src || '/placeholder-commander.jpg';
  })();

  return (
    <div className={`proposal-item ${expanded ? 'expanded' : 'collapsed'}`}>
      <div className="proposal-header" onClick={() => setExpanded(prev => !prev)} style={{ cursor: 'pointer' }}>
        <h3 className="proposal-name" style={{ marginRight: '0.5rem', flex: '0 1 auto' }}>{proposal.name}</h3>
        <div className="proposal-years" style={{ margin: '0 auto', flex: '0 0 auto' }}>
          {yearsInline}
        </div>
        <div className={`proposal-status ${getStatusClass(proposal.status)}`} style={{ flex: '0 0 auto' }}>
          {proposal.status}
        </div>
      </div>

      {expanded && (
        <>
          <div className="proposal-content">
            {/* Image Section (left) */}
            <div className="proposal-image-section">
              <div className="proposal-image-container">
                <img
                  src={imageSrc}
                  alt={proposal.name}
                  className="proposal-image"
                />
              </div>
            </div>

            {/* Description (middle) */}
            <div className="proposal-description-section">
              <p className="proposal-description">{proposal.description}</p>
            </div>

            {/* Tier & Attributes (right) */}
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
          </div>

          {/* Actions */}
          {proposal.status === 'pending' && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button 
                  onClick={onApprove} 
                  className="btn btn-success"
                  style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem', minWidth: '80px' }}
                >
                  Approve
                </button>
                <button 
                  onClick={onEdit}
                  className="btn btn-warning"
                  style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem', minWidth: '80px' }}
                >
                  Edit
                </button>
                <button 
                  onClick={onReject} 
                  className="btn btn-danger"
                  style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem', minWidth: '80px' }}
                >
                  Reject
                </button>
              </div>
            </div>
          )}

          {proposal.status !== 'pending' && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button 
                  onClick={onDelete} 
                  className="btn btn-danger"
                  style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem', minWidth: '80px' }}
                >
                  Delete
                </button>
              </div>
            </div>
          )}

          {/* Footer info */}
          <div style={{ fontSize: '0.8rem', color: '#e6d7c3', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ color: '#d4af37', fontWeight: '500' }}>Submitted: {new Date(proposal.createdAt).toLocaleDateString()}</span>
            <span style={{ color: '#d4af37', fontWeight: '500' }}>{proposerInfo}</span>
          </div>
        </>
      )}
    </div>
  );
};

export default ProposalItem;
