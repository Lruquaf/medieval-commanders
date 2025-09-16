import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CardForm = ({ card, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    attributes: {
      strength: 50,
      intelligence: 50,
      charisma: 50,
      leadership: 50,
      attack: 50,
      defense: 50,
      speed: 50,
      health: 50
    },
    tier: 'Common',
    description: '',
    birthDate: '',
    deathDate: ''
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (card) {
      setFormData({
        name: card.name || '',
        attributes: card.attributes || {
          strength: 50,
          intelligence: 50,
          charisma: 50,
          leadership: 50,
          attack: 50,
          defense: 50,
          speed: 50,
          health: 50
        },
        tier: card.tier || 'Common',
        description: card.description || '',
        birthDate: card.birthDate ? (card.birthDate.split('-')[0] || card.birthDate) : '',
        deathDate: card.deathDate ? (card.deathDate.split('-')[0] || card.deathDate) : ''
      });
      // Set current image preview if editing
      if (card.image) {
        setImagePreview(card.image);
      }
    }
  }, [card]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('attributes.')) {
      const attrName = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        attributes: {
          ...prev.attributes,
          [attrName]: parseInt(value) || 0
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('attributes', JSON.stringify(formData.attributes));
      submitData.append('tier', formData.tier);
      submitData.append('description', formData.description);
      submitData.append('birthDate', formData.birthDate || '');
      submitData.append('deathDate', formData.deathDate || '');
      
      if (image) {
        submitData.append('image', image);
      }

      await onSubmit(submitData);
    } catch (err) {
      
      // Extract error message from response
      let errorMessage = 'Failed to save card';
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
        
        // Add details if available
        if (err.response.data.details) {
          if (typeof err.response.data.details === 'string') {
            errorMessage += `: ${err.response.data.details}`;
          } else if (typeof err.response.data.details === 'object') {
            const details = Object.values(err.response.data.details).filter(Boolean);
            if (details.length > 0) {
              errorMessage += `: ${details.join(', ')}`;
            }
          }
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: 'center', margin: '2rem 0' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'white' }}>
        {card ? 'Edit Card' : 'Create New Card'}
      </h1>
      
      <form onSubmit={handleSubmit} className="form-container">
        {error && (
          <div className="error">
            {error}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="name" className="form-label">Commander Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="form-input"
            required
            placeholder="e.g., William the Conqueror"
          />
        </div>

        <div className="form-group">
          <label htmlFor="image" className="form-label">Commander Image</label>
          
          {/* Image Preview */}
          {imagePreview && (
            <div style={{ 
              marginBottom: '1rem', 
              textAlign: 'center',
              padding: '1rem',
              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(244, 208, 63, 0.1) 100%)',
              borderRadius: '8px',
              border: '2px solid rgba(212, 175, 55, 0.3)'
            }}>
              <img 
                src={imagePreview} 
                alt="Preview" 
                style={{ 
                  maxWidth: '300px', 
                  maxHeight: '300px', 
                  width: 'auto',
                  height: 'auto',
                  objectFit: 'contain',
                  borderRadius: '8px',
                  border: '2px solid rgba(212, 175, 55, 0.5)',
                  background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.05), rgba(139, 69, 19, 0.05))'
                }}
              />
              <p style={{ marginTop: '0.5rem', color: '#d4af37', fontSize: '0.9rem' }}>
                {image ? `New: ${image.name}` : 'Current Image'}
              </p>
            </div>
          )}
          
          <div className="file-input" onClick={() => document.getElementById('image').click()}>
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
            <div>
              {image ? (
                <p>Selected: {image.name}</p>
              ) : card?.image ? (
                <p>Click to change current image</p>
              ) : (
                <p>Click to select an image or drag and drop</p>
              )}
            </div>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="tier" className="form-label">Tier *</label>
          <select
            id="tier"
            name="tier"
            value={formData.tier}
            onChange={handleInputChange}
            className="form-select"
            required
          >
            <option value="Common">Common</option>
            <option value="Rare">Rare</option>
            <option value="Epic">Epic</option>
            <option value="Legendary">Legendary</option>
            <option value="Mythic">Mythic</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Attributes *</label>
          <div className="attributes-grid">
            {Object.entries(formData.attributes).map(([attr, value]) => (
              <div key={attr} className="attribute-input">
                <div className="attribute-header">
                  <div className="attribute-name">
                    {attr}
                  </div>
                  <div className="attribute-value">
                    {value}
                  </div>
                </div>
                <input
                  type="range"
                  id={attr}
                  name={`attributes.${attr}`}
                  min="0"
                  max="100"
                  value={value}
                  onChange={handleInputChange}
                  className="attribute-range"
                />
                <div className="attribute-scale">
                  <span>0</span>
                  <span>50</span>
                  <span>100</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description" className="form-label">Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="form-textarea"
            required
            placeholder="Describe the commander's background, achievements, and historical significance..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="birthDate" className="form-label">Birth Year <span className="optional-text">(optional)</span></label>
          <input
            type="number"
            id="birthDate"
            name="birthDate"
            value={formData.birthDate}
            onChange={handleInputChange}
            className="form-input"
            placeholder="e.g., 1157"
            min="1"
            max="2100"
          />
        </div>

        <div className="form-group">
          <label htmlFor="deathDate" className="form-label">Death Year <span className="optional-text">(optional)</span></label>
          <input
            type="number"
            id="deathDate"
            name="deathDate"
            value={formData.deathDate}
            onChange={handleInputChange}
            className="form-input"
            placeholder="e.g., 1199"
            min="1"
            max="2100"
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Saving...' : (card ? 'Update Card' : 'Create Card')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CardForm;
