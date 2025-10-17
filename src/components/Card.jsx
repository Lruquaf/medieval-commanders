import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { getImageUrl } from '../utils/images';
import { renderAndDownloadCard } from '../utils/renderCardImage';
import { formatYearRange } from '../utils/years';

const Card = React.memo(({ card, isAdmin = false, onEdit, onDelete }) => {
  const [showModal, setShowModal] = useState(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);

  const getTierClass = (tier) => {
    return `tier-${tier.toLowerCase()}`;
  };

  const handleCardClick = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setShowDownloadMenu(false);
  };

  const renderAndDownload = (ratioKey) => renderAndDownloadCard(card, ratioKey);

  const firstFocusableRef = React.useRef(null);

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
          <div className={`card-tier ${getTierClass(card.tier)}`}>{card.tier}</div>
        </div>
      </div>

      {showModal && createPortal(
        <div className="modal-overlay" role="presentation" onClick={handleCloseModal}>
          <div className="modal-content" role="dialog" aria-modal="true" aria-label={card.name} onClick={(e) => e.stopPropagation()}>
            <button ref={firstFocusableRef} className="modal-close" aria-label="Close modal" onClick={handleCloseModal}>×</button>

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

                <div className="download-menu-wrapper" style={{ position: 'relative', display: 'inline-block' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDownloadMenu((v) => !v);
                    }}
                    className="btn btn-success modal-admin-btn"
                    title="Download Card Image"
                  >
                    Download
                  </button>
                  {showDownloadMenu && (
                    <div
                      className="download-menu"
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        marginTop: 8,
                        background: '#1b0f0a',
                        border: '1px solid rgba(212,175,55,0.35)',
                        borderRadius: 8,
                        padding: 8,
                        zIndex: 5,
                        minWidth: 160,
                        boxShadow: '0 6px 18px rgba(0,0,0,0.35)'
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        className="btn btn-secondary modal-admin-btn"
                        style={{ width: '100%', marginBottom: 6 }}
                        onClick={(e) => { e.stopPropagation(); setShowDownloadMenu(false); renderAndDownload('2:3'); }}
                      >
                        2:3 (Original)
                      </button>
                      <button
                        className="btn btn-secondary modal-admin-btn"
                        style={{ width: '100%', marginBottom: 6 }}
                        onClick={(e) => { e.stopPropagation(); setShowDownloadMenu(false); renderAndDownload('1:1'); }}
                      >
                        1:1 (Square)
                      </button>
                      <button
                        className="btn btn-secondary modal-admin-btn"
                        style={{ width: '100%' }}
                        onClick={(e) => { e.stopPropagation(); setShowDownloadMenu(false); renderAndDownload('4:5'); }}
                      >
                        4:5 (Instagram)
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="modal-header">
              <h2 className="modal-title">{card.name}</h2>
              <div className={`modal-tier ${getTierClass(card.tier)}`}>
                {card.tier}
              </div>
            </div>

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
