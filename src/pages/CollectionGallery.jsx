import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../config/api';
import Card from '../components/Card';

const CollectionGallery = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get('/api/cards');
      // Ensure response.data is an array
      const cardsData = Array.isArray(response.data) ? response.data : [];
      
      
      setCards(cardsData);
    } catch (err) {
      setError('Failed to load cards. Using sample data...');
      // Use sample data if API fails
      setCards([
        {
          id: '1',
          name: 'Richard the Lionheart',
          email: 'richard@example.com',
          image: '/placeholder-commander.jpg',
          attributes: JSON.stringify({
            strength: 85,
            intelligence: 70,
            charisma: 90,
            leadership: 95
          }),
          tier: 'Legendary',
          description: 'King of England and leader of the Third Crusade',
          status: 'approved',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCards = (cards || []).filter(card => {
    if (filter === 'all') return true;
    return card.tier.toLowerCase() === filter.toLowerCase();
  });

  const sortedCards = [...filteredCards].sort((a, b) => {
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
        // Define tier order for proper sorting
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
  });

  const getTierCounts = () => {
    const counts = { all: (cards || []).length };
    (cards || []).forEach(card => {
      counts[card.tier.toLowerCase()] = (counts[card.tier.toLowerCase()] || 0) + 1;
    });
    return counts;
  };

  const tierCounts = getTierCounts();

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <h2>Loading collection...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ textAlign: 'center', margin: '2rem 0' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'white' }}>
          Medieval Commanders Collection
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'rgba(255, 255, 255, 0.9)', marginBottom: '2rem' }}>
          Discover legendary commanders from the medieval era
        </p>
        
        {/* Filter buttons */}
        <div className="filter-buttons">
          {Object.entries(tierCounts).map(([tier, count]) => (
            <button
              key={tier}
              onClick={() => setFilter(tier)}
              className={`btn ${filter === tier ? 'btn-primary' : 'btn-secondary'} filter-btn`}
            >
              {tier} ({count})
            </button>
          ))}
        </div>

        {/* Sorting controls */}
        <div className="sorting-controls">
          <div className="sort-group">
            <label htmlFor="sortBy" className="sort-label">Sort by:</label>
            <select
              id="sortBy"
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
            <label htmlFor="sortOrder" className="sort-label">Order:</label>
            <select
              id="sortOrder"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="sort-select"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>
      </div>

      {sortedCards.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'white' }}>
          <h3>No cards found</h3>
          <p>Try adjusting your filter or check back later for new additions.</p>
        </div>
      ) : (
        <div className="card-grid">
          {sortedCards.map(card => (
            <Card key={card.id} card={card} />
          ))}
        </div>
      )}

      <div style={{ textAlign: 'center', margin: '3rem 0' }}>
        <Link to="/propose" className="btn btn-primary">
          Propose a New Commander
        </Link>
      </div>
    </div>
  );
};

export default CollectionGallery;
