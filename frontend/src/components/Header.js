import React from 'react';

const Header = ({ currentPage, setCurrentPage, user }) => {
  return (
    <header className="header">
      <div className="header-content">
        <h2 className="logo">CF Recommender</h2>
        <nav className="nav">
          <button 
            className={currentPage === 'home' ? 'nav-btn active' : 'nav-btn'}
            onClick={() => setCurrentPage('home')}
          >
            Home
          </button>
          <button 
            className={currentPage === 'dashboard' ? 'nav-btn active' : 'nav-btn'}
            onClick={() => setCurrentPage('dashboard')}
            disabled={!user}
          >
            Dashboard
          </button>
          <button 
            className={currentPage === 'analytics' ? 'nav-btn active' : 'nav-btn'}
            onClick={() => setCurrentPage('analytics')}
            disabled={!user}
          >
            Analytics
          </button>
          <button 
            className={currentPage === 'problems' ? 'nav-btn active' : 'nav-btn'}
            onClick={() => setCurrentPage('problems')}
          >
            Problems
          </button>
          <button 
            className={currentPage === 'profile' ? 'nav-btn active' : 'nav-btn'}
            onClick={() => setCurrentPage('profile')}
          >
            Profile
          </button>
        </nav>
        {user && (
          <div className="user-info">
            <span>{user.cf_handle}</span>
            <span className="rating">({user.rating})</span>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
