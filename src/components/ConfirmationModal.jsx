import React from 'react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Delete", cancelText = "Cancel" }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
        <div className="modal-header">
          <h3 className="modal-title" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
            {title}
          </h3>
        </div>
        
        <div style={{ marginBottom: '2rem' }}>
          <p style={{ color: '#e6d7c3', fontSize: '1rem', lineHeight: '1.6' }}>
            {message}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{ padding: '0.75rem 1.5rem' }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="btn btn-danger"
            style={{ padding: '0.75rem 1.5rem' }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
