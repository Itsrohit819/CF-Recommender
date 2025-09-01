import React, { useState } from 'react';
import './App.css';
import './styles/Dashboard.css';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import UserProfile from './components/UserProfile';
import ProblemSearch from './components/ProblemSearch';
import Analytics from './components/Analytics';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('home');

  const renderPage = () => {
    switch(currentPage) {
      case 'dashboard':
        return <Dashboard user={currentUser} />;
      case 'profile':
        return <UserProfile user={currentUser} setUser={setCurrentUser} />;
      case 'problems':
        return <ProblemSearch />;
      case 'analytics':
        return <Analytics user={currentUser} />;
      default:
        return (
          <div className="home-page">
            <h1>🚀 CF Recommender</h1>
            <p>AI-Powered Competitive Programming Assistant</p>
            <div className="feature-grid">
              <div className="feature-card">
                <h3>🤖 Smart Recommendations</h3>
                <p>Get personalized problem suggestions based on your solving patterns</p>
              </div>
              <div className="feature-card">
                <h3>📊 Performance Analytics</h3>
                <p>Track your progress with detailed charts and insights</p>
              </div>
              <div className="feature-card">
                <h3>🎯 Skill Analysis</h3>
                <p>Identify your strengths and areas for improvement</p>
              </div>
            </div>
            <button 
              className="btn-primary"
              onClick={() => setCurrentPage('profile')}
            >
              Get Started
            </button>
          </div>
        );
    }
  };

  return (
    <div className="App">
      <Header 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage}
        user={currentUser}
      />
      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
