import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();
  const isAdminPage = location.pathname === '/admin';
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="container">
        <nav className="nav">
          <Link to="/" className="logo" onClick={closeMenu}>
            ⚔️ Medieval Commanders
          </Link>
          
          {/* Hamburger menu button */}
          <button 
            className={`hamburger ${isMenuOpen ? 'active' : ''}`}
            onClick={toggleMenu}
            aria-label="Toggle navigation menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <ul className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
            {!isAdminPage && (
              <li>
                <Link to="/" onClick={closeMenu}>Collection</Link>
              </li>
            )}
            {!isAdminPage && (
              <li>
                <Link to="/propose" onClick={closeMenu}>Propose Card</Link>
              </li>
            )}
            {!isAdminPage && (
              <li>
                <Link to="/admin" onClick={closeMenu}>Admin Panel</Link>
              </li>
            )}
          </ul>
          
          {/* Overlay for mobile menu */}
          {isMenuOpen && <div className="nav-overlay" onClick={closeMenu}></div>}
        </nav>
      </div>
    </header>
  );
};

export default Header;
