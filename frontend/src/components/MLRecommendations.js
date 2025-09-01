import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import ProblemCard from './ProblemCard';

const MLRecommendations = ({ cfHandle }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState('hybrid');
  const [modelStats, setModelStats] = useState(null);
  const [similarUsers, setSimilarUsers] = useState([]);

  useEffect(() => {
    if (cfHandle) {
      fetchRecommendations();
      fetchSimilarUsers();
    }
  }, [cfHandle, method]);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const response = await api.getMLRecommendations(cfHandle, method, 8);
      setRecommendations(response.recommendations || []);
    } catch (error) {
      console.error('Error fetching ML recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSimilarUsers = async () => {
    try {
      const response = await api.getSimilarUsers(cfHandle);
      setSimilarUsers(response.similar_users || []);
    } catch (error) {
      console.error('Error fetching similar users:', error);
    }
  };

  const buildModel = async () => {
    setLoading(true);
    try {
      const response = await api.buildRecommendationModel();
      setModelStats(response);
      alert('Model built successfully!');
    } catch (error) {
      console.error('Error building model:', error);
      alert('Failed to build model');
    } finally {
      setLoading(false);
    }
  };

  const explainRecommendation = async (problemId) => {
    try {
      const response = await api.explainRecommendation(cfHandle, problemId);
      
      // Create explanation popup
      const explanations = response.explanations.join('\n• ');
      alert(`Why this problem was recommended:\n\n• ${explanations}`);
    } catch (error) {
      console.error('Error explaining recommendation:', error);
    }
  };

  const getRatingColor = (rating) => {
    if (rating < 1200) return '#808080';
    if (rating < 1400) return '#008000';
    if (rating < 1600) return '#03A89E';
    if (rating < 1900) return '#0000FF';
    if (rating < 2100) return '#AA00AA';
    if (rating < 2400) return '#FF8C00';
    return '#FF0000';
  };

  return (
    <div className="ml-recommendations">
      <div className="recommendations-header">
        <h2>🤖 AI-Powered Recommendations</h2>
        
        <div className="method-selector">
          <label>Recommendation Method:</label>
          <select 
            value={method} 
            onChange={(e) => setMethod(e.target.value)}
            disabled={loading}
          >
            <option value="hybrid">Hybrid (Best)</option>
            <option value="collaborative">Collaborative Filtering</option>
            <option value="content">Content-Based</option>
          </select>
          
          <button onClick={buildModel} disabled={loading} className="build-model-btn">
            🔄 Rebuild Model
          </button>
        </div>
      </div>

      {modelStats && (
        <div className="model-stats">
          <h3>📊 Model Statistics</h3>
          <div className="stats-grid">
            <div className="stat">
              <span className="stat-label">Users:</span>
              <span className="stat-value">{modelStats.users_count}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Problems:</span>
              <span className="stat-value">{modelStats.items_count}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Sparsity:</span>
              <span className="stat-value">{modelStats.sparsity}</span>
            </div>
          </div>
        </div>
      )}

      <div className="recommendations-content">
        <div className="main-recommendations">
          <h3>🎯 Recommended Problems</h3>
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              Generating AI recommendations...
            </div>
          ) : (
            <div className="problems-grid">
              {recommendations.map(problem => (
                <div key={problem.id} className="enhanced-problem-card">
                  <ProblemCard problem={problem} />
                  <div className="recommendation-details">
                    <div className="ml-score">
                      <span>AI Score: {(problem.score * 100).toFixed(1)}%</span>
                    </div>
                    <button 
                      className="explain-btn"
                      onClick={() => explainRecommendation(problem.id)}
                    >
                      💡 Why this?
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {recommendations.length === 0 && !loading && (
            <div className="no-recommendations">
              <p>No recommendations available. Try building the model first!</p>
              <button onClick={buildModel} className="build-model-btn">
                🔄 Build Model
              </button>
            </div>
          )}
        </div>

        <div className="sidebar" style={{ display: 'none' }}>
          <div className="similar-users">
            <h3>👥 Similar Users</h3>
            {similarUsers.slice(0, 5).map(user => (
              <div key={user.cf_handle} className="similar-user">
                <div className="user-info">
                  <span className="user-handle">{user.cf_handle}</span>
                  <span 
                    className="user-rating"
                    style={{ color: getRatingColor(user.rating) }}
                  >
                    {user.rating}
                  </span>
                </div>
                <div className="similarity-score">
                  {(user.similarity * 100).toFixed(1)}% similar
                </div>
              </div>
            ))}
          </div>

          <div className="method-info">
            <h3>🔍 Current Method</h3>
            <div className="method-description">
              {method === 'hybrid' && (
                <p>Combines collaborative filtering and content-based approaches for best results.</p>
              )}
              {method === 'collaborative' && (
                <p>Recommends problems based on users with similar solving patterns.</p>
              )}
              {method === 'content' && (
                <p>Recommends problems similar to ones you've already solved.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MLRecommendations;
