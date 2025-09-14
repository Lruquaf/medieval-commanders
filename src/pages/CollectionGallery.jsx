import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../config/api';
import Card from '../components/Card';

const CollectionGallery = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

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
      
      console.log('Fetched gallery cards data:', cardsData);
      console.log('Sample gallery card image:', cardsData[0]?.image);
      
      setCards(cardsData);
    } catch (err) {
      console.error('Error fetching cards:', err);
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
      </div>

      {filteredCards.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'white' }}>
          <h3>No cards found</h3>
          <p>Try adjusting your filter or check back later for new additions.</p>
        </div>
      ) : (
        <div className="card-grid">
          {filteredCards.map(card => (
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
