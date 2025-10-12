import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { proposalSchema } from '../validators/proposal.schema';
import { useProposals } from '../hooks/useProposals';

const ProposalFormModal = ({ isOpen, onClose, onSubmitted }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
    resolver: zodResolver(proposalSchema),
    defaultValues: {
      name: '',
      proposerName: '',
      proposerInstagram: '',
      description: '',
      birthYear: undefined,
      deathYear: undefined,
    }
  });
  const [error, setError] = React.useState(null);
  const { submitPublicProposal } = useProposals();

  const onSubmitForm = async (values) => {
    setError(null);
    try {
      const submitData = new FormData();
      submitData.append('name', values.name);
      if (values.proposerName) submitData.append('proposerName', values.proposerName);
      if (values.proposerInstagram) submitData.append('proposerInstagram', values.proposerInstagram);
      submitData.append('description', values.description);
      submitData.append('birthDate', values.birthYear ?? '');
      submitData.append('deathDate', values.deathYear ?? '');
      const responseData = await submitPublicProposal(submitData);
      reset();
      if (typeof onSubmitted === 'function') onSubmitted(responseData);
      onClose();
    } catch (err) {
      let errorMessage = 'Failed to submit proposal';
      if (err.code === 'ECONNABORTED') errorMessage = 'Request timed out. Please try again.';
      else if (err.response?.status === 499) errorMessage = 'Server timeout occurred. Proposal created but email failed.';
      else if (err.response?.status === 500) errorMessage = 'Server error occurred. Please try again later.';
      else if (err.response?.status === 400) errorMessage = err.response?.data?.error || 'Invalid data provided.';
      else if (err.response?.data?.error) errorMessage = err.response.data.error;
      else if (err.message) errorMessage = err.message;
      setError(errorMessage);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '720px' }}>
        <button
          type="button"
          aria-label="Close"
          className="modal-close"
          onClick={onClose}
        >
          ×
        </button>
        <div className="modal-header">
          <h3 className="modal-title" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
            Propose a New Commander
          </h3>
        </div>

        <form onSubmit={handleSubmit(onSubmitForm)} className="form-container" style={{ boxShadow: 'none' }}>
          {error && (
            <div className="error">
              {error}
            </div>
          )}

          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
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

          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label htmlFor="description" className="form-label">Description *</label>
            <p className="form-description">Briefly identify exactly who this commander is. Admins will refine the full biography later. Example: "Louis I (King of Hungary), 14th c.; Angevin dynasty".</p>
            <textarea
              id="description"
              {...register('description')}
              className="form-textarea"
              required
              placeholder="e.g., Louis I (King of Hungary), 14th c.; Angevin dynasty"
            />
            {errors.description && (
              <div className="error">{errors.description.message}</div>
            )}
          </div>

          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <div className="form-row-2">
              <div>
                <label htmlFor="birthYear" className="form-label">Birth Year <span className="optional-text">(optional)</span></label>
                <p className="form-description">Enter if known (e.g., 1157).</p>
                <input
                  type="number"
                  id="birthYear"
                  {...register('birthYear', { setValueAs: (v) => v === '' ? undefined : Number(v) })}
                  className="form-input"
                  placeholder="e.g., 1157"
                  min="1"
                  max="2100"
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
                {errors.birthYear && (
                  <div className="error">{errors.birthYear.message}</div>
                )}
              </div>
              <div>
                <label htmlFor="deathYear" className="form-label">Death Year <span className="optional-text">(optional)</span></label>
                <p className="form-description">Enter if known (e.g., 1199).</p>
                <input
                  type="number"
                  id="deathYear"
                  {...register('deathYear', { setValueAs: (v) => v === '' ? undefined : Number(v) })}
                  className="form-input"
                  placeholder="e.g., 1199"
                  min="1"
                  max="2100"
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
                {errors.deathYear && (
                  <div className="error">{errors.deathYear.message}</div>
                )}
              </div>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Proposer Info</label>
            <p className="form-description">Optional info about the person submitting the proposal. Instagram is used for social tagging.</p>
            <div className="form-row-2">
              <input
                type="text"
                id="proposerName"
                {...register('proposerName')}
                className="form-input"
                placeholder="Your name"
              />
              <input
                type="text"
                id="proposerInstagram"
                {...register('proposerInstagram')}
                className="form-input"
                placeholder="Instagram username (optional)"
              />
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Proposal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProposalFormModal;


