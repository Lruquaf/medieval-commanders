import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { getImageUrl } from '../utils/images';
import { formatYearRange } from '../utils/years';

const Card = React.memo(({ card, isAdmin = false, onEdit, onDelete }) => {
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

  React.useEffect(() => {
    if (!showModal) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setShowModal(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [showModal]);

  // Focus management and scroll lock for modal
  const firstFocusableRef = React.useRef(null);
  React.useEffect(() => {
    if (showModal) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      // focus the close button
      firstFocusableRef.current && firstFocusableRef.current.focus();
      const onKeyDown = (e) => {
        if (e.key !== 'Tab') return;
        const dialog = document.querySelector('.modal-content');
        if (!dialog) return;
        const focusable = dialog.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last && last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first && first.focus();
        }
      };
      document.addEventListener('keydown', onKeyDown);
      return () => {
        document.body.style.overflow = previousOverflow;
        document.removeEventListener('keydown', onKeyDown);
      };
    }
  }, [showModal]);

  // use shared getImageUrl util

  return (
    <>
      <div className="card" onClick={handleCardClick}>
        <div className="card-image-container">
          <img 
            src={getImageUrl(card.image)} 
            alt={card.name}
            loading="lazy"
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
        <div className="modal-overlay" role="presentation" onClick={handleCloseModal}>
          <div className="modal-content" role="dialog" aria-modal="true" aria-label={card.name} onClick={(e) => e.stopPropagation()}>
            <button ref={firstFocusableRef} className="modal-close" aria-label="Close modal" onClick={handleCloseModal}>×</button>
            
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
            <div className="modal-dates">
              <div className="modal-date-range">
                {formatYearRange(card.birthYear ?? null, card.deathYear ?? null)}
              </div>
            </div>

            <img 
              src={getImageUrl(card.image)} 
              alt={card.name}
              loading="lazy"
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
});

export default Card;
