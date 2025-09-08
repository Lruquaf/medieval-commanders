import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
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
      const response = await axios.get('/api/cards');
      setCards(response.data);
    } catch (err) {
      setError('Failed to load cards');
      console.error('Error fetching cards:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCards = cards.filter(card => {
    if (filter === 'all') return true;
    return card.tier.toLowerCase() === filter.toLowerCase();
  });

  const getTierCounts = () => {
    const counts = { all: cards.length };
    cards.forEach(card => {
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
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          {Object.entries(tierCounts).map(([tier, count]) => (
            <button
              key={tier}
              onClick={() => setFilter(tier)}
              className={`btn ${filter === tier ? 'btn-primary' : 'btn-secondary'}`}
              style={{ textTransform: 'capitalize' }}
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
