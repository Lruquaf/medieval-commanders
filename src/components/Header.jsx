import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();
  const isAdminPage = location.pathname === '/admin';

  return (
    <header className="header">
      <div className="container">
        <nav className="nav">
          <Link to="/" className="logo">
            ⚔️ Medieval Commanders
          </Link>
          <ul className="nav-links">
            {!isAdminPage && (
              <li>
                <Link to="/">Collection</Link>
              </li>
            )}
            {!isAdminPage && (
              <li>
                <Link to="/propose">Propose Card</Link>
              </li>
            )}
            {!isAdminPage && (
              <li>
                <Link to="/admin">Admin Panel</Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
