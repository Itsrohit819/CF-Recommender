import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import ProblemCard from './ProblemCard';

const ProblemSearch = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    rating_min: '',
    rating_max: '',
    tags: '',
    limit: 20
  });
  const [availableTags, setAvailableTags] = useState([]);

  useEffect(() => {
    fetchAvailableTags();
    searchProblems(); // Initial load
  }, []);

  const fetchAvailableTags = async () => {
    try {
      const response = await api.getAvailableTags();
      setAvailableTags(response.tags.slice(0, 20)); // Top 20 tags
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const searchProblems = async () => {
    setLoading(true);
    try {
      const response = await api.searchProblems(filters);
      setProblems(response.problems);
    } catch (error) {
      console.error('Error searching problems:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    searchProblems();
  };

  return (
    <div className="problem-search">
      <div className="search-filters">
        <form onSubmit={handleSearch} className="filter-form">
          <div className="filter-row">
            <div className="filter-group">
              <label>Rating Range:</label>
              <input
                type="number"
                placeholder="Min"
                value={filters.rating_min}
                onChange={(e) => handleFilterChange('rating_min', e.target.value)}
              />
              <input
                type="number"
                placeholder="Max"
                style={{marginTop : 15}}
                value={filters.rating_max}
                onChange={(e) => handleFilterChange('rating_max', e.target.value)}
              />
            </div>
            
            <div className="filter-group">
              <label>Tags:</label>
              <input
                type="text"
                placeholder="e.g., dp,graphs,greedy"
                value={filters.tags}
                onChange={(e) => handleFilterChange('tags', e.target.value)}
              />
            </div>
            
            <button type="submit" className="search-btn" disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>
        
        <div className="popular-tags">
          <span>Popular tags: </span>
          {availableTags.slice(0, 10).map(tag => (
            <button
              key={tag.name}
              className="tag-btn"
              onClick={() => handleFilterChange('tags', tag.name)}
            >
              {tag.name} ({tag.count})
            </button>
          ))}
        </div>
      </div>

      <div className="search-results">
        {loading ? (
          <div className="loading">Wait...</div>
        ) : (
          <div className="problems-grid">
            {problems.map(problem => (
              <ProblemCard
                key={`${problem.contest_id}-${problem.index}`}
                problem={problem}
              />
            ))}
          </div>
        )}
        
        {problems.length === 0 && !loading && (
          <div className="no-results">
            No problems found. Try adjusting your filters.
          </div>
        )}
      </div>
    </div>
  );
};

export default ProblemSearch;
