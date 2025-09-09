import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../config/api';

const CreateProposal = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
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
    description: ''
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

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
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('email', formData.email);
      submitData.append('attributes', JSON.stringify(formData.attributes));
      submitData.append('tier', formData.tier);
      submitData.append('description', formData.description);
      
      if (image) {
        submitData.append('image', image);
      }

      await apiClient.post('/api/proposals', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit proposal');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container">
        <div className="form-container" style={{ textAlign: 'center' }}>
          <h2 style={{ color: '#38a169', marginBottom: '1rem' }}>✅ Proposal Submitted!</h2>
          <p>Your commander proposal has been submitted for review. You'll be redirected to the collection shortly.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ textAlign: 'center', margin: '2rem 0' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'white' }}>
          Propose a New Commander
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'rgba(255, 255, 255, 0.9)' }}>
          Submit your own medieval commander for the collection
        </p>
      </div>

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
          <label htmlFor="email" className="form-label">Your Email Address *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="form-input"
            required
            placeholder="your.email@example.com"
          />
        </div>

        <div className="form-group">
          <label htmlFor="image" className="form-label">Commander Image</label>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
            {Object.entries(formData.attributes).map(([attr, value]) => (
              <div key={attr} style={{ padding: '1rem', background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(244, 208, 63, 0.15) 100%)', borderRadius: '8px', border: '2px solid rgba(212, 175, 55, 0.3)', boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)' }}>
                <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ textTransform: 'capitalize', fontWeight: '600', color: '#d4af37', fontSize: '0.9rem', marginBottom: '0.1rem' }}>
                    {attr}
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#f4d03f', textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)' }}>
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
                  style={{ width: '100%', marginBottom: '0.5rem' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#e6d7c3' }}>
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

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Submitting...' : 'Submit Proposal'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProposal;
