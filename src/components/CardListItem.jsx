import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import apiClient from '../config/api';

const CardListItem = ({ card }) => {
  const [showModal, setShowModal] = useState(false);

  const getTierClass = (tier) => `tier-${String(tier || '').toLowerCase()}`;

  const attributes = useMemo(() => {
    if (!card) return {};
    const value = card.attributes;
    if (!value) return {};
    if (typeof value === 'string') {
      try {
        return JSON.parse(value) || {};
      } catch (_) {
        return {};
      }
    }
    return value;
  }, [card]);

  const getImageUrl = (imagePath, transformations = '') => {
    if (!imagePath) return '/placeholder-commander.svg';

    if (imagePath.startsWith('data:')) {
      return imagePath;
    }

    if (imagePath.startsWith('http') && imagePath.includes('cloudinary.com') && transformations) {
      const parts = imagePath.split('/upload/');
      if (parts.length === 2) {
        return `${parts[0]}/upload/${transformations}/${parts[1]}`;
      }
    }

    if (imagePath.startsWith('http')) {
      return imagePath;
    }

    if (imagePath.includes('/uploads/')) {
      const baseURL = apiClient.defaults.baseURL?.replace(/\/$/, '');
      return `${baseURL}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
    }

    if (imagePath === 'placeholder-commander.jpg' || imagePath === 'placeholder-commander.svg') {
      return `/${imagePath}`;
    }

    return '/placeholder-commander.svg';
  };

  const handleClick = () => setShowModal(true);
  const handleClose = () => setShowModal(false);

  return (
    <>
      <div className="card-list-item" onClick={handleClick}>
        <div className="card-list-image-container">
          <img
            src={getImageUrl(card.image)}
            alt={card.name}
            className="card-list-image"
            onError={(e) => {
              e.currentTarget.src = '/placeholder-commander.svg';
            }}
          />
        </div>
        <div className="card-list-name">{card.name}</div>
        <div className={`card-tier ${getTierClass(card.tier)}`}>{card.tier}</div>
      </div>

      {showModal && createPortal(
        <div className="modal-overlay" onClick={handleClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={handleClose}>×</button>

            <div className="modal-header">
              <h2 className="modal-title">{card.name}</h2>
              <div className={`modal-tier ${getTierClass(card.tier)}`}>{card.tier}</div>
            </div>

            {(card.birthYear || card.deathYear) && (
              <div className="modal-dates">
                <div className="modal-date-range">
                  {(() => {
                    const { birthYear, deathYear } = card;
                    if (birthYear && deathYear) return `${birthYear}-${deathYear}`;
                    if (birthYear) return `Born: ${birthYear}`;
                    if (deathYear) return `Died: ${deathYear}`;
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
                e.currentTarget.src = '/placeholder-commander.svg';
              }}
            />

            {card.description && (
              <p className="modal-description">{card.description}</p>
            )}

            <div className="modal-attributes">
              <div className="modal-attribute">
                <span className="modal-attribute-name">Strength</span>
                <span className="modal-attribute-value">{attributes.strength ?? '-'}</span>
              </div>
              <div className="modal-attribute">
                <span className="modal-attribute-name">Intelligence</span>
                <span className="modal-attribute-value">{attributes.intelligence ?? '-'}</span>
              </div>
              <div className="modal-attribute">
                <span className="modal-attribute-name">Charisma</span>
                <span className="modal-attribute-value">{attributes.charisma ?? '-'}</span>
              </div>
              <div className="modal-attribute">
                <span className="modal-attribute-name">Leadership</span>
                <span className="modal-attribute-value">{attributes.leadership ?? '-'}</span>
              </div>
              <div className="modal-attribute">
                <span className="modal-attribute-name">Attack</span>
                <span className="modal-attribute-value">{attributes.attack ?? '-'}</span>
              </div>
              <div className="modal-attribute">
                <span className="modal-attribute-name">Defense</span>
                <span className="modal-attribute-value">{attributes.defense ?? '-'}</span>
              </div>
              <div className="modal-attribute">
                <span className="modal-attribute-name">Speed</span>
                <span className="modal-attribute-value">{attributes.speed ?? '-'}</span>
              </div>
              <div className="modal-attribute">
                <span className="modal-attribute-name">Health</span>
                <span className="modal-attribute-value">{attributes.health ?? '-'}</span>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default CardListItem;


