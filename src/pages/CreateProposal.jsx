import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../config/api';

const CreateProposal = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    proposerName: '',
    proposerInstagram: '',
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
    return email ? emailRegex.test(email) : true;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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

    // No email mandatory in simplified flow

    console.log('🚀 Starting proposal submission...');
    console.log('📝 Form data:', {
      name: formData.name,
      proposerName: formData.proposerName,
      proposerInstagram: formData.proposerInstagram,
      description: formData.description,
      birthYear: formData.birthYear,
      deathYear: formData.deathYear,
      image: image ? { name: image.name, size: image.size, type: image.type } : null
    });

    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      if (formData.proposerName) submitData.append('proposerName', formData.proposerName);
      if (formData.proposerInstagram) submitData.append('proposerInstagram', formData.proposerInstagram);
      submitData.append('description', formData.description);
      submitData.append('birthDate', formData.birthYear || '');
      submitData.append('deathDate', formData.deathYear || '');
      
      if (image) {
        submitData.append('image', image);
        console.log('📷 Image attached:', { name: image.name, size: image.size, type: image.type });
      }

      console.log('🌐 Sending request to:', apiClient.defaults.baseURL + '/api/proposals');
      
      const response = await apiClient.post('/api/proposals', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 120000, // 120 second timeout (2 minutes)
      });

      console.log('✅ Proposal submitted successfully:', response.data);
      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      console.error('❌ Proposal submission failed:');
      console.error('Error object:', err);
      console.error('Error message:', err.message);
      console.error('Error code:', err.code);
      console.error('Error response:', err.response);
      console.error('Error status:', err.response?.status);
      console.error('Error data:', err.response?.data);
      console.error('Error config:', err.config);
      
      // More detailed error messages
      let errorMessage = 'Failed to submit proposal';
      
      if (err.code === 'ECONNABORTED') {
        errorMessage = 'Request timed out. Please check your internet connection and try again.';
      } else if (err.response?.status === 499) {
        errorMessage = 'Server timeout occurred. The proposal was created but email notification failed. Please contact support.';
      } else if (err.response?.status === 500) {
        errorMessage = 'Server error occurred. Please try again later or contact support.';
      } else if (err.response?.status === 400) {
        errorMessage = err.response?.data?.error || 'Invalid data provided. Please check your input.';
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
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
          Submit a commander proposal for review
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

        

        {/* Image removed in simplified proposer flow */}

        {/* Tier removed in simplified proposer flow */}

        {/* Attributes removed in simplified proposer flow */}

        <div className="form-group">
          <label htmlFor="description" className="form-label">Description *</label>
          <p className="form-description">Briefly identify exactly who this commander is. Admins will refine the full biography later. Example: "Louis I (King of Hungary), 14th c.; Angevin dynasty".</p>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="form-textarea"
            required
            placeholder="e.g., Louis I (King of Hungary), 14th c.; Angevin dynasty"
          />
        </div>

        <div className="form-group">
          <div className="form-row-2">
            <div>
              <label htmlFor="birthYear" className="form-label">Birth Year <span className="optional-text">(optional)</span></label>
              <p className="form-description">Enter if known (e.g., 1157).</p>
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
                inputMode="numeric"
                pattern="[0-9]*"
              />
            </div>
            <div>
              <label htmlFor="deathYear" className="form-label">Death Year <span className="optional-text">(optional)</span></label>
              <p className="form-description">Enter if known (e.g., 1199).</p>
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
                inputMode="numeric"
                pattern="[0-9]*"
              />
            </div>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Proposer Info</label>
          <p className="form-description">Optional info about the person submitting the proposal. Instagram is used for social tagging.</p>
          <div className="form-row-2">
            <input
              type="text"
              id="proposerName"
              name="proposerName"
              value={formData.proposerName}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Your name"
            />
            <input
              type="text"
              id="proposerInstagram"
              name="proposerInstagram"
              value={formData.proposerInstagram}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Instagram username (optional)"
            />
          </div>
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
