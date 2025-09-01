import React from 'react';

const ProblemCard = ({ problem, onSelect }) => {
  const getDifficultyColor = (rating) => {
    if (rating < 1200) return '#ffffffff';
    if (rating < 1400) return '#79fff8ff';
    if (rating < 1600) return '#03A89E';
    if (rating < 1900) return '#e1f65bff';
    if (rating < 2100) return '#AA00AA';
    if (rating < 2400) return '#6fff00ff';
    return '#FF0000';
  };

  const formatTags = (tags) => {
    return tags.slice(0, 3).map(tag => (
      <span key={tag} className="tag">
        {tag}
      </span>
    ));
  };

  return (
    <div className="problem-card" onClick={() => onSelect && onSelect(problem)}>
      <div className="problem-header">
        <h3 className="problem-title">
          {problem.contest_id}{problem.index}. {problem.name}
        </h3>
        <span 
          className="problem-rating"
          style={{ color: getDifficultyColor(problem.rating) }}
        >
          {problem.rating}
        </span>
      </div>
      
      <div className="problem-tags">
        {formatTags(problem.tags)}
        {problem.tags.length > 3 && (
          <span className="tag-more">+{problem.tags.length - 3} more</span>
        )}
      </div>
      
      <div className="problem-stats">
        <span className="solved-count">
          ✓ {problem.solved_count} solved
        </span>
        <a 
          href={problem.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="problem-link"
          onClick={(e) => e.stopPropagation()}
        >
          View Problem →
        </a>
      </div>
    </div>
  );
};

export default ProblemCard;
