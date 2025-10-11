import React from 'react';

const SettingsTab = ({ adminEmail, setAdminEmail, socialMediaUrls, setSocialMediaUrls, emailError, emailSuccess, onSubmit }) => {
  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2 className="section-title">Admin Settings</h2>
      </div>

      <div className="form-container" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label htmlFor="adminEmail" className="form-label">
              Admin Email Address
            </label>
            <p style={{ color: '#e6d7c3', fontSize: '0.9rem', marginBottom: '1rem' }}>
              This email will receive notifications when new proposals are submitted.
            </p>
            <input
              type="email"
              id="adminEmail"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              className="form-input"
              placeholder="admin@example.com"
              required
            />
          </div>

          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ color: '#e6d7c3', marginBottom: '1rem' }}>Social Media Links</h3>
            <p style={{ color: '#e6d7c3', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              These links will appear in the footer of your website.
            </p>

            {[
              ['instagramUrl', 'Instagram URL', 'https://instagram.com/yourusername'],
              ['twitterUrl', 'Twitter URL', 'https://twitter.com/yourusername'],
              ['facebookUrl', 'Facebook URL', 'https://facebook.com/yourpage'],
              ['linkedinUrl', 'LinkedIn URL', 'https://linkedin.com/in/yourprofile'],
              ['youtubeUrl', 'YouTube URL', 'https://youtube.com/channel/yourchannel'],
            ].map(([key, label, placeholder]) => (
              <div className="form-group" key={key}>
                <label htmlFor={key} className="form-label">{label}</label>
                <input
                  type="url"
                  id={key}
                  value={socialMediaUrls[key]}
                  onChange={(e) => setSocialMediaUrls({ ...socialMediaUrls, [key]: e.target.value })}
                  className="form-input"
                  placeholder={placeholder}
                />
              </div>
            ))}
          </div>

          {emailError && (
            <div className="error" style={{ marginBottom: '1rem' }}>
              {emailError}
            </div>
          )}

          {emailSuccess && (
            <div style={{ 
              color: '#4CAF50', 
              backgroundColor: '#1B5E20', 
              padding: '0.75rem', 
              borderRadius: '4px', 
              marginBottom: '1rem',
              textAlign: 'center'
            }}>
              {emailSuccess}
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            Update Settings
          </button>
        </form>

        <div style={{ 
          marginTop: '2rem', 
          padding: '1rem', 
          backgroundColor: 'rgba(255, 255, 255, 0.05)', 
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <h3 style={{ color: '#e6d7c3', marginBottom: '1rem' }}>Email Notifications</h3>
          <p style={{ color: '#e6d7c3', fontSize: '0.9rem', lineHeight: '1.5' }}>
            The admin email address is used to send notifications for:
          </p>
          <ul style={{ color: '#e6d7c3', fontSize: '0.9rem', marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
            <li>New proposal submissions</li>
            <li>System alerts and updates</li>
          </ul>
          <p style={{ color: '#e6d7c3', fontSize: '0.9rem', marginTop: '1rem', fontStyle: 'italic' }}>
            Note: Users who submit proposals will also receive email notifications when their proposals are approved or rejected.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;


