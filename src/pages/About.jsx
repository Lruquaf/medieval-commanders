import React, { useEffect, useState } from 'react';
import { useAdmin } from '../hooks/useAdmin';

const About = () => {
  const admin = useAdmin();
  const [adminEmail, setAdminEmail] = useState('');
  const [socialMediaUrls, setSocialMediaUrls] = useState({
    instagramUrl: '',
    twitterUrl: '',
    facebookUrl: '',
    linkedinUrl: '',
    youtubeUrl: ''
  });

  useEffect(() => {
    const load = async () => {
      try {
        const settings = await admin.fetchSettings();
        setAdminEmail(settings?.email || '');
        setSocialMediaUrls({
          instagramUrl: settings?.instagramUrl || '',
          twitterUrl: settings?.twitterUrl || '',
          facebookUrl: settings?.facebookUrl || '',
          linkedinUrl: settings?.linkedinUrl || '',
          youtubeUrl: settings?.youtubeUrl || ''
        });
      } catch (_) {}
    };
    load();
  }, []);

  const handleEmailClick = () => {
    if (!adminEmail) return;
    const subject = encodeURIComponent('Medieval Commanders - Contact');
    const body = encodeURIComponent('Hello Medieval Commanders team,');
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(adminEmail)}&su=${subject}&body=${body}`;
    try {
      window.open(gmailUrl, '_blank', 'noopener,noreferrer');
    } catch (_) {
      window.location.href = `mailto:${adminEmail}?subject=${subject}&body=${body}`;
    }
  };

  const socialMediaLinks = [
    { name: 'Instagram', url: socialMediaUrls.instagramUrl, color: '#E4405F' },
    { name: 'Twitter', url: socialMediaUrls.twitterUrl, color: '#1DA1F2' },
    { name: 'Facebook', url: socialMediaUrls.facebookUrl, color: '#1877F2' },
    { name: 'LinkedIn', url: socialMediaUrls.linkedinUrl, color: '#0A66C2' },
    { name: 'YouTube', url: socialMediaUrls.youtubeUrl, color: '#FF0000' },
  ].filter(link => link.url && link.url.trim() !== '');

  return (
    <div className="container" style={{ marginTop: '2rem', marginBottom: '2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.2rem', color: 'white', marginBottom: '0.75rem' }}>About</h1>
        <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.9)' }}>
          The story, mission, and roadmap of the Medieval Commanders collection
        </p>
      </div>

      <section className="admin-section" style={{ maxWidth: 900, margin: '0 auto' }}>
        <h2 className="section-title">Our Mission</h2>
        <p className="proposal-description">
          To make the exploration of medieval commanders engaging and accessible, while presenting
          a visually rich, coherent, and educational collection.
        </p>

        <h2 className="section-title" style={{ marginTop: '1.5rem' }}>Curation Principles</h2>
        <ul style={{ color: '#e6d7c3', lineHeight: 1.7, marginLeft: '1rem' }}>
          <li>Biographical details grounded in reliable sources</li>
          <li>Clear and consistent visual standards</li>
          <li>Tier classification aligned with historical impact</li>
          <li>Transparent evaluation of community contributions</li>
        </ul>

        <h2 className="section-title" style={{ marginTop: '1.5rem' }}>Tier System</h2>
        <p className="proposal-description">
          Commanders are classified into five tiers: Common, Rare, Epic, Legendary, and Mythic,
          based on criteria such as historical influence, leadership, and legacy.
        </p>

        <h2 className="section-title" style={{ marginTop: '1.5rem' }}>Community & Contributions</h2>
        <p className="proposal-description">
          We welcome new commander proposals and improvement suggestions. You can contribute and
          join the conversation via the “Proposals” page.
        </p>

        <h2 className="section-title" style={{ marginTop: '1.5rem' }}>Contact</h2>
        <p className="proposal-description" style={{ marginBottom: '0.75rem' }}>
          For questions, feedback, or partnership inquiries, please reach out through the channels below.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          {adminEmail && (
            <button type="button" className="social-link" onClick={handleEmailClick} title={`Email us at ${adminEmail}`}>
              <span className="social-name">E-mail</span>
            </button>
          )}
          {socialMediaLinks.map(link => (
            <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer" className="social-link" style={{ '--social-color': link.color }}>
              <span className="social-name">{link.name}</span>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
};

export default About;


