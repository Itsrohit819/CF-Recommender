import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Target, Award, Activity } from 'lucide-react';

const QuickStats = ({ user, analytics }) => {
  const currentRating = user?.rating ?? 1200;
  const maxRating = user?.max_rating ?? currentRating;

  const recentAccuracy = analytics?.recent_performance?.accuracy ?? 0;
  const recentSubmissions = analytics?.recent_performance?.total_submissions ?? 0;
  const totalProblemsSolved = analytics?.recent_performance?.solved ?? 0;

  const stats = [
    {
      icon: <TrendingUp size={24} />,
      label: 'Current Rating',
      value: currentRating,
      // change: `${maxRating - currentRating === 0 ? 'Stable' : `${currentRating >= maxRating ? 'New High' : `-${maxRating - currentRating}`}`}`,
      color: '#4F46E5'
    },
    {
      icon: <Target size={24} />,
      label: 'Problems Solved',
      value: totalProblemsSolved,
      // change: `${recentSubmissions} submissions`,
      color: '#059669'
    },
    {
      icon: <Award size={24} />,
      label: 'Max Rating',
      value: maxRating,
      // change: 'All time high',
      color: '#DC2626'
    },
    {
      icon: <Activity size={24} />,
      label: 'Recent Accuracy',
      value: `${Math.round(recentAccuracy * 100)}%`,
      // change: recentSubmissions > 0 ? `${recentSubmissions} submissions` : 'No data',
      color: '#7C3AED'
    }
  ];

  return (
    <div className="quick-stats">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          className="stat-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.05 }}
        >
          <div className="stat-icon" style={{ backgroundColor: `${stat.color}20`, color: stat.color }}>
            {stat.icon}
          </div>
          <div className="stat-content">
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
            <div className="stat-change">{stat.change}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default QuickStats;
