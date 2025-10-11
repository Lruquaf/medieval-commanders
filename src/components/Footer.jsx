import React, { useState, useEffect } from 'react';
import { useAdmin } from '../hooks/useAdmin';

const Footer = () => {
  const [socialMediaUrls, setSocialMediaUrls] = useState({
    instagramUrl: '',
    twitterUrl: '',
    facebookUrl: '',
    linkedinUrl: '',
    youtubeUrl: ''
  });
  const [adminEmail, setAdminEmail] = useState('');

  const admin = useAdmin();

  useEffect(() => {
    fetchSocialMediaUrls();
  }, []);

  const fetchSocialMediaUrls = async () => {
    try {
      const settings = await admin.fetchSettings();
      setSocialMediaUrls({
        instagramUrl: settings?.instagramUrl || '',
        twitterUrl: settings?.twitterUrl || '',
        facebookUrl: settings?.facebookUrl || '',
        linkedinUrl: settings?.linkedinUrl || '',
        youtubeUrl: settings?.youtubeUrl || ''
      });
      setAdminEmail(settings?.email || '');
    } catch (error) {
      // If API fails, use empty URLs
    }
  };

  const handleEmailClick = (e) => {
    if (!adminEmail) return;
    // Prefer Gmail compose if available
    const subject = encodeURIComponent('Medieval Commanders - Contact');
    const body = encodeURIComponent('Hello Medieval Commanders team,');
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(adminEmail)}&su=${subject}&body=${body}`;
    try {
      window.open(gmailUrl, '_blank', 'noopener,noreferrer');
    } catch (_) {
      // Fallback to mailto
      window.location.href = `mailto:${adminEmail}?subject=${subject}&body=${body}`;
    }
  };

  const socialMediaLinks = [
    {
      name: 'Instagram',
      url: socialMediaUrls.instagramUrl,
      color: '#E4405F'
    },
    {
      name: 'Twitter',
      url: socialMediaUrls.twitterUrl,
      color: '#1DA1F2'
    },
    {
      name: 'Facebook',
      url: socialMediaUrls.facebookUrl,
      color: '#1877F2'
    },
    {
      name: 'LinkedIn',
      url: socialMediaUrls.linkedinUrl,
      color: '#0A66C2'
    },
    {
      name: 'YouTube',
      url: socialMediaUrls.youtubeUrl,
      color: '#FF0000'
    }
  ];

  const activeLinks = socialMediaLinks.filter(link => link.url && link.url.trim() !== '');

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-title">⚔️ Medieval Commanders</h3>
            <p className="footer-description">
              Discover legendary commanders from the medieval era. 
              Explore their stories, achievements, and legacies.
            </p>
          </div>
          
          <div className="footer-section">
            <h4 className="footer-subtitle" style={{ textAlign: 'center' }}>Contact & Follow Us</h4>
            {adminEmail ? (
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
                <button
                  type="button"
                  className="social-link"
                  onClick={handleEmailClick}
                  title={`Email us at ${adminEmail}`}
                  aria-label={`Email us at ${adminEmail}`}
                >
                  <span className="social-name">E-mail</span>
                </button>
              </div>
            ) : null}
            <div className="social-links grid-responsive">
              {activeLinks.length > 0 ? (
                (() => {
                  const firstRow = activeLinks.slice(0, 3);
                  const secondRow = activeLinks.slice(3);
                  return (
                    <>
                      {firstRow.map((link) => (
                        <a
                          key={`row1-${link.name}`}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="social-link"
                          style={{ '--social-color': link.color }}
                          title={`Follow us on ${link.name}`}
                        >
                          <span className="social-name">{link.name}</span>
                        </a>
                      ))}
                      {secondRow.map((link) => (
                        <a
                          key={`row2-${link.name}`}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="social-link"
                          style={{ '--social-color': link.color }}
                          title={`Follow us on ${link.name}`}
                        >
                          <span className="social-name">{link.name}</span>
                        </a>
                      ))}
                    </>
                  );
                })()
              ) : (
                <p className="no-social-links" style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
                  Social media links will appear here when configured by admin.
                </p>
              )}
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <div className="footer-copyright">
            <p>&copy; 2025 Medieval Commanders Collection. All rights reserved.</p>
            <p className="footer-tagline">
              Built with passion for medieval history and legendary commanders.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
