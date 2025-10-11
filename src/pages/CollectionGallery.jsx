import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ThemedSelect from '../components/ThemedSelect';
import { useCards } from '../hooks/useCards';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Card from '../components/Card';
import CardListItem from '../components/CardListItem';

const CollectionGallery = () => {
  const [cards, setCards] = useState([]);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState(() => localStorage.getItem('mc.sortBy') || 'name');
  const [sortOrder, setSortOrder] = useState(() => localStorage.getItem('mc.sortOrder') || 'asc');
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('mc.viewMode') || 'grid'); // 'grid' | 'list' | 'small'

  const { cards: fetchedCards, fetchCards, loading: cardsLoading, error: cardsError } = useCards({ admin: false });

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  // Persist preferences
  useEffect(() => {
    localStorage.setItem('mc.sortBy', sortBy);
  }, [sortBy]);
  useEffect(() => {
    localStorage.setItem('mc.sortOrder', sortOrder);
  }, [sortOrder]);
  useEffect(() => {
    localStorage.setItem('mc.viewMode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    setCards(Array.isArray(fetchedCards) ? fetchedCards : []);
  }, [fetchedCards]);

  // removed duplicate local fetchCards; rely on hook and sync via effect

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

  if (cardsLoading) {
    return (
      <div className="container">
        <LoadingSpinner label="Loading collection..." />
      </div>
    );
  }

  if (cardsError) {
    return (
      <div className="container">
        <div className="error" role="alert">
          {'Failed to load cards.'}
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
          {(() => {
            const order = ['all', 'mythic', 'legendary', 'epic', 'rare', 'common'];
            return order
              .filter((t) => typeof tierCounts[t] !== 'undefined')
              .map((tier) => (
                <button
                  key={tier}
                  onClick={() => setFilter(tier)}
                  className={`btn ${filter === tier ? 'btn-primary' : 'btn-secondary'} filter-btn`}
                >
                  {tier} ({tierCounts[tier]})
                </button>
              ));
          })()}
        </div>

        {/* Sorting controls */}
        <div className="sorting-controls">
          <div className="sort-group">
            <label htmlFor="sortBy" className="sort-label">Sort by:</label>
            <ThemedSelect
              id="sortBy"
              value={sortBy}
              onChange={(val) => setSortBy(val)}
              label="Sort by"
              options={[
                { value: 'name', label: 'Name' },
                { value: 'birthYear', label: 'Birth Year' },
                { value: 'deathYear', label: 'Death Year' },
                { value: 'tier', label: 'Tier' },
              ]}
            />
            <button
              type="button"
              className={`order-toggle-btn ${sortOrder === 'desc' ? 'is-desc' : ''}`}
              aria-label={`Toggle order, current ${sortOrder}`}
              title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
              onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
            >
              {sortOrder === 'asc' ? (
                // Sort ascending icon: bars + up arrow
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
                  <path fill="currentColor" d="M3 17h10v2H3v-2Zm0-5h7v2H3v-2Zm0-5h4v2H3V7Z"/>
                  <path fill="currentColor" d="M17 20l-4-4h3V7h2v9h3l-4 4Z"/>
                </svg>
              ) : (
                // Sort descending icon: bars + down arrow
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
                  <path fill="currentColor" d="M3 17h4v2H3v-2Zm0-5h7v2H3v-2Zm0-5h10v2H3V7Z"/>
                  <path fill="currentColor" d="M17 4l4 4h-3v9h-2V8h-3l4-4Z"/>
                </svg>
              )}
            </button>
          </div>

          {/* View toggle: Large Icons, Small Icons, List */}
          <div className="view-toggle" role="group" aria-label="View mode">
            {/* Large icons (grid) */}
            <button
              type="button"
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Large icons"
              aria-pressed={viewMode === 'grid'}
            >
              {/* Large icons SVG: 2x2 thick grid */}
              <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
                <rect x="1" y="1" width="6" height="6" fill="currentColor" rx="1"></rect>
                <rect x="11" y="1" width="6" height="6" fill="currentColor" rx="1"></rect>
                <rect x="1" y="11" width="6" height="6" fill="currentColor" rx="1"></rect>
                <rect x="11" y="11" width="6" height="6" fill="currentColor" rx="1"></rect>
              </svg>
            </button>
            {/* Small icons */}
            <button
              type="button"
              className={`view-btn ${viewMode === 'small' ? 'active' : ''}`}
              onClick={() => setViewMode('small')}
              title="Small icons"
              aria-pressed={viewMode === 'small'}
            >
              {/* Small icons SVG: 3x3 tiny grid */}
              <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
                {Array.from({ length: 3 }).map((_, row) => (
                  Array.from({ length: 3 }).map((_, col) => (
                    <rect key={`${row}-${col}`} x={1 + col * 6} y={1 + row * 6} width="3" height="3" fill="currentColor" rx="0.5"></rect>
                  ))
                ))}
              </svg>
            </button>
            {/* List */}
            <button
              type="button"
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List view"
              aria-pressed={viewMode === 'list'}
            >
              {/* List SVG: stacked lines */}
              <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
                <rect x="2" y="3" width="14" height="2" fill="currentColor" rx="1"></rect>
                <rect x="2" y="8" width="14" height="2" fill="currentColor" rx="1"></rect>
                <rect x="2" y="13" width="14" height="2" fill="currentColor" rx="1"></rect>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {sortedCards.length === 0 ? (
        <EmptyState title="No cards found" description="Try adjusting your filter or check back later for new additions." />
      ) : (
        (
          viewMode === 'grid' ? (
            <div className="card-grid">
              {sortedCards.map(card => (
                <Card key={card.id} card={card} />
              ))}
            </div>
          ) : viewMode === 'small' ? (
            <div className="card-grid small-grid">
              {sortedCards.map(card => (
                <Card key={card.id} card={card} />
              ))}
            </div>
          ) : (
            <div className="card-list">
              {sortedCards.map(card => (
                <CardListItem key={card.id} card={card} />
              ))}
            </div>
          )
        )
      )}

      {/* Propose button removed to simplify navigation; proposing is available on /proposals */}
    </div>
  );
};

export default CollectionGallery;
