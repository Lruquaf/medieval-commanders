import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { getImageUrl } from '../utils/images';
import { formatYearRange } from '../utils/years';

const CardListItem = React.memo(({ card }) => {
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

  // use shared getImageUrl util

  const handleClick = () => setShowModal(true);
  const handleClose = () => setShowModal(false);

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

  const Years = () => {
    const { birthYear, deathYear } = card || {};
    const label = formatYearRange(birthYear ?? null, deathYear ?? null);
    return (
      <div className="card-list-years" aria-label="years">
        <span className="card-list-years-badge">{label}</span>
      </div>
    );
  };

  return (
    <>
      <div className="card-list-item" onClick={handleClick}>
        <div className="card-list-image-container">
          <img
            src={getImageUrl(card.image)}
            alt={card.name}
            loading="lazy"
            className="card-list-image"
            onError={(e) => {
              e.currentTarget.src = '/placeholder-commander.svg';
            }}
          />
        </div>
        <div className="card-list-name">{card.name}</div>
        <Years />
        <div className="card-list-tier">
          <span
            className={`card-list-tier-dot ${getTierClass(card.tier)}`}
            title={String(card.tier || '')}
            aria-label={String(card.tier || '')}
          ></span>
        </div>
      </div>

      {showModal && createPortal(
        <div className="modal-overlay" role="presentation" onClick={handleClose}>
          <div className="modal-content" role="dialog" aria-modal="true" aria-label={card.name} onClick={(e) => e.stopPropagation()}>
            <button ref={firstFocusableRef} className="modal-close" aria-label="Close modal" onClick={handleClose}>×</button>

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
              loading="lazy"
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
});

export default CardListItem;


