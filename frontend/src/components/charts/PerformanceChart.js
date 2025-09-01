import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';

const PerformanceChart = ({ cfHandle, analytics }) => {
  const [chartType, setChartType] = useState('difficulty');

  const getDifficultyData = () => {
    if (!analytics?.rating_stats) return [];
    
    return Object.entries(analytics.rating_stats).map(([range, stats]) => ({
      range,
      solved: stats.solved,
      attempted: stats.attempted,
      accuracy: stats.attempted > 0 ? (stats.solved / stats.attempted * 100).toFixed(1) : 0
    }));
  };

  const getTagData = () => {
    if (!analytics?.tag_stats) return [];
    
    return Object.entries(analytics.tag_stats)
      .filter(([_, stats]) => stats.attempted >= 3)
      .sort((a, b) => b[1].attempted - a[1].attempted)
      .slice(0, 10)
      .map(([tag, stats]) => ({
        tag,
        solved: stats.solved,
        attempted: stats.attempted,
        accuracy: (stats.accuracy * 100).toFixed(1)
      }));
  };

  const getWeaknessData = () => {
    if (!analytics?.weak_tags_detailed) return [];
    
    return analytics.weak_tags_detailed.map(tag => ({
      name: tag.tag,
      value: tag.attempted,
      accuracy: (tag.accuracy * 100).toFixed(1)
    }));
  };

  const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];

  const renderDifficultyChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={getDifficultyData()}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="range" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="solved" fill="#4F46E5" name="Solved" />
        <Bar dataKey="attempted" fill="#E5E7EB" name="Attempted" />
      </BarChart>
    </ResponsiveContainer>
  );

  const renderTagChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={getTagData()}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="tag" angle={-45} textAnchor="end" height={100} />
        <YAxis />
        <Tooltip />
        <Bar dataKey="solved" fill="#059669" name="Solved" />
      </BarChart>
    </ResponsiveContainer>
  );

  const renderWeaknessChart = () => (
    <div className="weakness-analysis">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={getWeaknessData()}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, accuracy }) => `${name} (${accuracy}%)`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {getWeaknessData().map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
      
      <div className="weakness-recommendations">
        <h4>🎯 Areas for Improvement</h4>
        {analytics?.weak_tags_detailed?.slice(0, 3).map((tag, index) => (
          <div key={tag.tag} className="weakness-item">
            <span className="weakness-tag">{tag.tag}</span>
            <div className="weakness-stats">
              <span>{tag.solved}/{tag.attempted} solved</span>
              <span className="accuracy-low">{(tag.accuracy * 100).toFixed(1)}% accuracy</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <motion.div 
      className="performance-chart"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="chart-controls">
        <h2>📊 Performance Analytics</h2>
        <div className="chart-tabs">
          <button 
            className={chartType === 'difficulty' ? 'active' : ''}
            onClick={() => setChartType('difficulty')}
          >
            Difficulty Analysis
          </button>
          <button 
            className={chartType === 'tags' ? 'active' : ''}
            onClick={() => setChartType('tags')}
          >
            Topic Performance
          </button>
          <button 
            className={chartType === 'weakness' ? 'active' : ''}
            onClick={() => setChartType('weakness')}
          >
            Weakness Analysis
          </button>
        </div>
      </div>

      <div className="chart-content">
        {chartType === 'difficulty' && renderDifficultyChart()}
        {chartType === 'tags' && renderTagChart()}
        {chartType === 'weakness' && renderWeaknessChart()}
      </div>

      <div className="performance-insights">
        <h3>💡 Key Insights</h3>
        <div className="insights-grid">
          <div className="insight-card">
            <h4>Strong Areas</h4>
            <ul>
              {analytics?.strong_tags?.slice(0, 3).map(tag => (
                <li key={tag}>✅ {tag}</li>
              ))}
            </ul>
          </div>
          <div className="insight-card">
            <h4>Focus Areas</h4>
            <ul>
              {analytics?.weak_tags?.slice(0, 3).map(tag => (
                <li key={tag}>🎯 {tag}</li>
              ))}
            </ul>
          </div>
          <div className="insight-card">
            <h4>Recent Performance</h4>
            <p>
              {analytics?.recent_performance?.solved || 0} problems solved in last 30 days
              <br />
              {((analytics?.recent_performance?.accuracy || 0) * 100).toFixed(1)}% accuracy
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PerformanceChart;
