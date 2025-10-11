import React from 'react';
import Card from '../../components/Card';

const CardsTab = ({ cards, sortBy, sortOrder, setSortBy, setSortOrder, onCreateCard, onEditCard, onDeleteCard }) => {
  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2 className="section-title">Manage Cards</h2>
        <button onClick={onCreateCard} className="btn btn-primary">
          Create New Card
        </button>
      </div>

      {cards.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#e6d7c3', padding: '2rem' }}>
          No cards found
        </p>
      ) : (
        <div>
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
                <option value="birthYear">Birth Year</option>
                <option value="deathYear">Death Year</option>
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
                  case 'birthYear':
                    aValue = a.birthYear || 0;
                    bValue = b.birthYear || 0;
                    break;
                  case 'deathYear':
                    aValue = a.deathYear || 0;
                    bValue = b.deathYear || 0;
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
                    onEdit={onEditCard}
                    onDelete={onDeleteCard}
                  />
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CardsTab;


