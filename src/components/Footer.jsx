import React, { useState, useEffect } from 'react';
import apiClient from '../config/api';

const Footer = () => {
  const [socialMediaUrls, setSocialMediaUrls] = useState({
    instagramUrl: '',
    twitterUrl: '',
    facebookUrl: '',
    linkedinUrl: '',
    youtubeUrl: ''
  });

  useEffect(() => {
    fetchSocialMediaUrls();
  }, []);

  const fetchSocialMediaUrls = async () => {
    try {
      const response = await apiClient.get('/api/admin/settings');
      setSocialMediaUrls({
        instagramUrl: response.data.instagramUrl || '',
        twitterUrl: response.data.twitterUrl || '',
        facebookUrl: response.data.facebookUrl || '',
        linkedinUrl: response.data.linkedinUrl || '',
        youtubeUrl: response.data.youtubeUrl || ''
      });
    } catch (error) {
      // If API fails, use empty URLs
      console.log('Failed to fetch social media URLs');
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
            <h4 className="footer-subtitle">Follow Us</h4>
            <div className="social-links">
              {activeLinks.length > 0 ? (
                activeLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link"
                    style={{ '--social-color': link.color }}
                    title={`Follow us on ${link.name}`}
                  >
                    <span className="social-name">{link.name}</span>
                  </a>
                ))
              ) : (
                <p className="no-social-links">
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
