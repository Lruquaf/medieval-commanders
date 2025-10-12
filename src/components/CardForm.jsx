import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cardSchema } from '../validators/card.schema';
import { getOptimizedImage } from '../utils/imageCompression';

const CardForm = ({ card, onSubmit, onCancel }) => {
  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(cardSchema),
    defaultValues: {
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
      birthYear: undefined,
      deathYear: undefined
    }
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    if (card) {
      reset({
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
        birthYear: card.birthYear ?? undefined,
        deathYear: card.deathYear ?? undefined
      });
      if (card.image) {
        setImagePreview(card.image);
      }
    }
  }, [card, reset]);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        // Optimize image for mobile uploads
        const optimizedFile = await getOptimizedImage(file);
        setImage(optimizedFile);
        
        // Create preview URL
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target.result);
        };
        reader.readAsDataURL(optimizedFile);
      } catch (error) {
        console.error('Error optimizing image:', error);
        // Fallback to original file
        setImage(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const onSubmitForm = async (values) => {
    setLoading(true);
    setError(null);

    // Retry logic for mobile upload issues
    const maxRetries = 3;
    let attempt = 0;

    const attemptSubmit = async () => {
      try {
        const submitData = new FormData();
        submitData.append('name', values.name);
        submitData.append('attributes', JSON.stringify(values.attributes));
        submitData.append('tier', values.tier);
        submitData.append('description', values.description);
        submitData.append('birthDate', values.birthYear ?? '');
        submitData.append('deathDate', values.deathYear ?? '');
        
        if (image) {
          submitData.append('image', image);
        }

        await onSubmit(submitData);
      } catch (err) {
        attempt++;
        
        // Check if this is a retryable error
        const isRetryableError = 
          err.response?.status === 408 || // Timeout
          err.response?.status === 502 || // Bad Gateway
          err.response?.status === 503 || // Service Unavailable
          err.response?.data?.code === 'UPLOAD_TIMEOUT' ||
          err.response?.data?.code === 'SERVICE_UNAVAILABLE' ||
          err.code === 'ECONNABORTED' || // Axios timeout
          err.code === 'NETWORK_ERROR';

        if (isRetryableError && attempt < maxRetries) {
          console.log(`Retry attempt ${attempt} for upload error:`, err.response?.data?.error || err.message);
          setIsRetrying(true);
          setUploadProgress(attempt * 25); // Show progress for retries
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, attempt * 2000));
          return attemptSubmit();
        }
        
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
          
          // Add helpful suggestions for common errors
          if (err.response.data.code === 'UPLOAD_TIMEOUT') {
            errorMessage += '\n\nTip: Try using a smaller image or check your internet connection.';
          } else if (err.response.data.code === 'SERVICE_UNAVAILABLE') {
            errorMessage += '\n\nTip: The upload service is temporarily busy. Please try again in a moment.';
          }
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        setError(errorMessage);
      }
    };

    await attemptSubmit();
    setLoading(false);
    setUploadProgress(0);
    setIsRetrying(false);
  };

  return (
    <div style={{ textAlign: 'center', margin: '2rem 0' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'white' }}>
        {card ? 'Edit Card' : 'Create New Card'}
      </h1>
      
      <form onSubmit={handleSubmit(onSubmitForm)} className="form-container">
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
            {...register('name')}
            className="form-input"
            required
            placeholder="e.g., William the Conqueror"
          />
          {errors.name && (
            <div className="error">{errors.name.message}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="image" className="form-label">Commander Image</label>
          
          {/* Image Preview */}
          {imagePreview && (
            <div 
              className="image-preview-container"
              style={{ 
                marginBottom: '1rem', 
                textAlign: 'center',
                padding: '1rem',
                background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(244, 208, 63, 0.1) 100%)',
                borderRadius: '8px',
                border: '2px solid rgba(212, 175, 55, 0.3)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '200px'
              }}
            >
              <div 
                className="image-preview-wrapper"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  height: '180px',
                  overflow: 'hidden',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.05), rgba(139, 69, 19, 0.05))',
                  position: 'relative'
                }}
              >
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="image-preview-img"
                  style={{ 
                    maxWidth: '90%', 
                    maxHeight: '90%', 
                    width: 'auto',
                    height: 'auto',
                    objectFit: 'contain',
                    borderRadius: '6px',
                    border: '2px solid rgba(212, 175, 55, 0.5)',
                    display: 'block',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)'
                  }}
                />
              </div>
              <p 
                className="image-preview-text"
                style={{ 
                  marginTop: '0.5rem', 
                  color: '#d4af37', 
                  fontSize: '0.9rem',
                  wordBreak: 'break-word',
                  maxWidth: '100%'
                }}
              >
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
            {...register('tier')}
            className="form-select"
            required
          >
            <option value="Common">Common</option>
            <option value="Rare">Rare</option>
            <option value="Epic">Epic</option>
            <option value="Legendary">Legendary</option>
            <option value="Mythic">Mythic</option>
          </select>
          {errors.tier && (
            <div className="error">{errors.tier.message}</div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Attributes *</label>
          <div className="attributes-grid">
            {Object.entries(watch('attributes')).map(([attr, value]) => (
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
                  {...register(`attributes.${attr}`, { valueAsNumber: true })}
                  min="0"
                  max="100"
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
            {...register('description')}
            className="form-textarea"
            required
            placeholder="Describe the commander's background, achievements, and historical significance..."
          />
          {errors.description && (
            <div className="error">{errors.description.message}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="birthYear" className="form-label">Birth Year <span className="optional-text">(optional)</span></label>
          <input
            type="number"
            id="birthYear"
            {...register('birthYear', { setValueAs: (v) => v === '' ? undefined : Number(v) })}
            className="form-input"
            placeholder="e.g., 1157"
            min="1"
            max="2100"
          />
          {errors.birthYear && (
            <div className="error">{errors.birthYear.message}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="deathYear" className="form-label">Death Year <span className="optional-text">(optional)</span></label>
          <input
            type="number"
            id="deathYear"
            {...register('deathYear', { setValueAs: (v) => v === '' ? undefined : Number(v) })}
            className="form-input"
            placeholder="e.g., 1199"
            min="1"
            max="2100"
          />
          {errors.deathYear && (
            <div className="error">{errors.deathYear.message}</div>
          )}
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
            disabled={loading || isSubmitting}
            className="btn btn-primary"
          >
            {loading ? (isRetrying ? 'Retrying...' : 'Saving...') : (card ? 'Update Card' : 'Create Card')}
          </button>
          {loading && uploadProgress > 0 && (
            <div style={{ 
              width: '200px', 
              height: '4px', 
              backgroundColor: '#333', 
              borderRadius: '2px', 
              margin: '10px auto',
              overflow: 'hidden'
            }}>
              <div style={{ 
                width: `${uploadProgress}%`, 
                height: '100%', 
                backgroundColor: '#ffd700',
                transition: 'width 0.3s ease'
              }}></div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default CardForm;
