import React, { useState } from 'react';

const Card = ({ card }) => {
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

  return (
    <>
      <div className="card" onClick={handleCardClick}>
        <div className="card-image-container">
          <img 
            src={card.image || '/placeholder-commander.svg'} 
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

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={handleCloseModal}>×</button>
            
            <div className="modal-header">
              <h2 className="modal-title">{card.name}</h2>
              <div className={`modal-tier ${getTierClass(card.tier)}`}>
                {card.tier}
              </div>
            </div>

            <img 
              src={card.image || '/placeholder-commander.svg'} 
              alt={card.name}
              className="modal-image"
              onError={(e) => {
                e.target.src = '/placeholder-commander.svg';
              }}
            />

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

            <p className="modal-description">{card.description}</p>
          </div>
        </div>
      )}
    </>
  );
};

export default Card;
