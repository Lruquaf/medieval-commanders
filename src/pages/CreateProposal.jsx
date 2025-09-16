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
    description: '',
    birthYear: '',
    deathYear: ''
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [emailError, setEmailError] = useState('');

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

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

      // Validate email when it changes
      if (name === 'email') {
        if (value && !validateEmail(value)) {
          setEmailError('Please enter a valid email address');
        } else {
          setEmailError('');
        }
      }
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

    // Validate email before submitting
    if (!validateEmail(formData.email)) {
      setEmailError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('email', formData.email);
      submitData.append('attributes', JSON.stringify(formData.attributes));
      submitData.append('tier', formData.tier);
      submitData.append('description', formData.description);
      submitData.append('birthDate', formData.birthYear || '');
      submitData.append('deathDate', formData.deathYear || '');
      
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
          <p className="form-description">You will be notified by email if the proposal is approved or rejected.</p>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={`form-input ${emailError ? 'error' : ''}`}
            required
            placeholder="your.email@example.com"
          />
          {emailError && (
            <div className="field-error">
              {emailError}
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="image" className="form-label">Commander Image <span className="optional-text">(optional)</span></label>
          <p className="form-description">Upload an image to represent your commander. If no image is provided, a placeholder will be used.</p>
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
          <p className="form-description">Select the rarity tier for your commander. Higher tiers should represent more historically significant or powerful figures.</p>
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
          <p className="form-description">Set the combat and leadership stats for your commander. Each attribute ranges from 0-100 and should reflect the historical figure's capabilities.</p>
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
          <p className="form-description">Provide a detailed description of your commander's background, achievements, and historical significance. This will help others understand their story and impact.</p>
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
          <label htmlFor="birthYear" className="form-label">Birth Year <span className="optional-text">(optional)</span></label>
          <p className="form-description">Enter the commander's birth year if known (e.g., 1157).</p>
          <input
            type="number"
            id="birthYear"
            name="birthYear"
            value={formData.birthYear}
            onChange={handleInputChange}
            className="form-input"
            placeholder="e.g., 1157"
            min="1"
            max="2100"
          />
        </div>

        <div className="form-group">
          <label htmlFor="deathYear" className="form-label">Death Year <span className="optional-text">(optional)</span></label>
          <p className="form-description">Enter the commander's death year if known (e.g., 1199).</p>
          <input
            type="number"
            id="deathYear"
            name="deathYear"
            value={formData.deathYear}
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
