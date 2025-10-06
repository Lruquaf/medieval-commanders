import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import apiClient from '../config/api';

const Card = ({ card, isAdmin = false, onEdit, onDelete }) => {
  const [showModal, setShowModal] = useState(false);

  const getTierClass = (tier) => {
    return `tier-${tier.toLowerCase()}`;
  };

  const handleCardClick = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  // Helper function to get image URL with optional transformations
  const getImageUrl = (imagePath, transformations = '') => {
    if (!imagePath) return '/placeholder-commander.svg';
    
    // If it's a base64 data URL (legacy), return as is
    if (imagePath.startsWith('data:')) {
      return imagePath;
    }
    
    // If it's a Cloudinary URL and transformations are requested
    if (imagePath.startsWith('http') && imagePath.includes('cloudinary.com') && transformations) {
      // Insert transformations into Cloudinary URL
      const parts = imagePath.split('/upload/');
      if (parts.length === 2) {
        return `${parts[0]}/upload/${transformations}/${parts[1]}`;
      }
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
    
    // For any other cases, return placeholder
    return '/placeholder-commander.svg';
  };

  return (
    <>
      <div className="card" onClick={handleCardClick}>
        <div className="card-image-container">
          <img 
            src={getImageUrl(card.image)} 
            alt={card.name}
            className="card-image"
            onError={(e) => {
              e.target.src = '/placeholder-commander.svg';
            }}
          />
        </div>
        <div className="card-content">
          <h3 className="card-name">{card.name}</h3>
          <div className={`card-tier ${getTierClass(card.tier)}`}>
            {card.tier}
          </div>
        </div>
      </div>

      {showModal && createPortal(
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={handleCloseModal}>×</button>
            
            {/* Admin action buttons - top left corner */}
            {isAdmin && (
              <div className="modal-admin-actions">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowModal(false);
                    onEdit && onEdit(card);
                  }}
                  className="btn btn-secondary modal-admin-btn"
                  title="Edit Card"
                >
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowModal(false);
                    onDelete && onDelete(card);
                  }}
                  className="btn btn-danger modal-admin-btn"
                  title="Delete Card"
                >
                  Delete
                </button>
              </div>
            )}
            
            <div className="modal-header">
              <h2 className="modal-title">{card.name}</h2>
              <div className={`modal-tier ${getTierClass(card.tier)}`}>
                {card.tier}
              </div>
            </div>

            {/* Birth and Death Dates - Above Image */}
            {(card.birthYear || card.deathYear) && (
              <div className="modal-dates">
                <div className="modal-date-range">
                  {(() => {
                    const birthYear = card.birthYear;
                    const deathYear = card.deathYear;
                    
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

            <img 
              src={getImageUrl(card.image)} 
              alt={card.name}
              className="modal-image"
              onError={(e) => {
                e.target.src = '/placeholder-commander.svg';
              }}
            />

            <p className="modal-description">{card.description}</p>

            <div className="modal-attributes">
              <div className="modal-attribute">
                <span className="modal-attribute-name">Strength</span>
                <span className="modal-attribute-value">{card.attributes.strength}</span>
              </div>
              <div className="modal-attribute">
                <span className="modal-attribute-name">Intelligence</span>
                <span className="modal-attribute-value">{card.attributes.intelligence}</span>
              </div>
              <div className="modal-attribute">
                <span className="modal-attribute-name">Charisma</span>
                <span className="modal-attribute-value">{card.attributes.charisma}</span>
              </div>
              <div className="modal-attribute">
                <span className="modal-attribute-name">Leadership</span>
                <span className="modal-attribute-value">{card.attributes.leadership}</span>
              </div>
              <div className="modal-attribute">
                <span className="modal-attribute-name">Attack</span>
                <span className="modal-attribute-value">{card.attributes.attack}</span>
              </div>
              <div className="modal-attribute">
                <span className="modal-attribute-name">Defense</span>
                <span className="modal-attribute-value">{card.attributes.defense}</span>
              </div>
              <div className="modal-attribute">
                <span className="modal-attribute-name">Speed</span>
                <span className="modal-attribute-value">{card.attributes.speed}</span>
              </div>
              <div className="modal-attribute">
                <span className="modal-attribute-name">Health</span>
                <span className="modal-attribute-value">{card.attributes.health}</span>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default Card;
