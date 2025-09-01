import React, { useState, useEffect } from 'react';
import { color, motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { TrendingUp, Target, Award, Activity, Calendar, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { api } from '../services/api';

const Analytics = ({ user }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeChart, setActiveChart] = useState('difficulty');
  const [timeRange, setTimeRange] = useState('all');

  useEffect(() => {
    if (user?.cf_handle) {
      fetchAnalytics();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await api.analyzeUser(user.cf_handle);
      
      // If no real data, use mock data
      if (!response.analysis || Object.keys(response.analysis.tag_stats || {}).length === 0) {
        setAnalytics(getMockAnalytics());
      } else {
        setAnalytics(response.analysis);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setAnalytics(getMockAnalytics());
    } finally {
      setLoading(false);
    }
  };

  const getMockAnalytics = () => ({
    tag_stats: {
      'implementation': { solved: 15, attempted: 20, accuracy: 0.75 },
      'math': { solved: 8, attempted: 12, accuracy: 0.67 },
      'greedy': { solved: 5, attempted: 10, accuracy: 0.5 },
      'dp': { solved: 3, attempted: 8, accuracy: 0.375 },
      'graphs': { solved: 2, attempted: 6, accuracy: 0.33 }
    },
    rating_stats: {
      '800-899': { solved: 10, attempted: 12, accuracy: 0.83 },
      '900-999': { solved: 8, attempted: 15, accuracy: 0.53 },
      '1000-1099': { solved: 6, attempted: 12, accuracy: 0.5 },
      '1100-1199': { solved: 4, attempted: 10, accuracy: 0.4 },
      '1200-1299': { solved: 2, attempted: 8, accuracy: 0.25 }
    },
    weak_tags: ['dp', 'graphs', 'number theory'],
    strong_tags: ['implementation', 'math', 'greedy'],
    weak_tags_detailed: [
      { tag: 'dp', accuracy: 0.375, attempted: 8, solved: 3 },
      { tag: 'graphs', accuracy: 0.33, attempted: 6, solved: 2 },
      { tag: 'number theory', accuracy: 0.2, attempted: 5, solved: 1 }
    ],
    strong_tags_detailed: [
      { tag: 'implementation', accuracy: 0.75, attempted: 20, solved: 15 },
      { tag: 'math', accuracy: 0.67, attempted: 12, solved: 8 }
    ],
    total_submissions: 56,
    recent_performance: {
      accuracy: 0.6,
      total_submissions: 25,
      solved: 15
    }
  });

  const getDifficultyData = () => {
    if (!analytics?.rating_stats) return [];
    
    return Object.entries(analytics.rating_stats)
      .map(([range, stats]) => ({
        range: range.replace('-', ' - '),
        solved: stats.solved,
        attempted: stats.attempted,
        accuracy: stats.attempted > 0 ? ((stats.solved / stats.attempted) * 100).toFixed(1) : 0
      }))
      .sort((a, b) => parseInt(a.range) - parseInt(b.range));
  };

  const getTagData = () => {
    if (!analytics?.tag_stats) return [];
    
    return Object.entries(analytics.tag_stats)
      .filter(([_, stats]) => stats.attempted >= 2)
      .sort((a, b) => b[1].attempted - a[1].attempted)
      .slice(0, 12)
      .map(([tag, stats]) => ({
        tag: tag.length > 12 ? tag.substring(0, 12) + '...' : tag,
        fullTag: tag,
        solved: stats.solved,
        attempted: stats.attempted,
        accuracy: (stats.accuracy * 100).toFixed(1)
      }));
  };

  const getWeaknessData = () => {
    if (!analytics?.weak_tags_detailed) return [];
    
    return analytics.weak_tags_detailed.slice(0, 6).map((tag, index) => ({
      name: tag.tag,
      value: tag.attempted,
      accuracy: (tag.accuracy * 100).toFixed(1),
      color: COLORS[index % COLORS.length]
    }));
  };

  const getProgressData = () => {
    // Mock progress data - in real app, this would come from historical data
    const baseRating = user?.rating || 1200;
    return Array.from({ length: 12 }, (_, i) => ({
      month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
      rating: baseRating + Math.random() * 200 - 100,
      problems: Math.floor(Math.random() * 50) + 10
    }));
  };

  const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="loading-spinner"></div>
        <p>Analyzing your performance...</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="analytics-error">
        <p>Unable to load analytics. Please try again.</p>
        <button onClick={fetchAnalytics} className="btn-primary">
          Retry
        </button>
      </div>
    );
  }

  return (
    <motion.div 
      className="analytics"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div className="analytics-header" variants={itemVariants}>
        <h1 style={{color : 'white'}}>📊 Performance Analytics</h1>
        <p>Deep dive into your competitive programming journey</p>
      </motion.div>

      {/* Summary Cards */}
      <motion.div className="analytics-summary" variants={itemVariants}>
        <div className="summary-card">
          <div className="summary-icon" style={{ backgroundColor: '#4F46E520', color: '#4F46E5' }}>
            <Activity size={24} />
          </div>
          <div className="summary-content">
            <h3>{analytics.total_submissions || 0}</h3>
            <p>Total Submissions</p>
            <span className="summary-change">+{analytics.recent_performance?.total_submissions || 0} this month</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon" style={{ backgroundColor: '#059669520', color: '#059669' }}>
            <Target size={24} />
          </div>
          <div className="summary-content">
            <h3>{((analytics.recent_performance?.accuracy || 0) * 100).toFixed(1)}%</h3>
            <p>Recent Accuracy</p>
            <span className="summary-change">Last 30 days</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon" style={{ backgroundColor: '#DC262620', color: '#DC2626' }}>
            <Award size={24} />
          </div>
          <div className="summary-content">
            <h3>{analytics.strong_tags?.length || 0}</h3>
            <p>Strong Areas</p>
            <span className="summary-change">Topics mastered</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon" style={{ backgroundColor: '#7C3AED20', color: '#7C3AED' }}>
            <TrendingUp size={24} />
          </div>
          <div className="summary-content">
            <h3>{analytics.weak_tags?.length || 0}</h3>
            <p>Focus Areas</p>
            <span className="summary-change">Need improvement</span>
          </div>
        </div>
      </motion.div>

      {/* Chart Controls */}
      <motion.div className="chart-controls" variants={itemVariants}>
        <div className="chart-tabs">
          <button 
            className={`chart-tab ${activeChart === 'difficulty' ? 'active' : ''}`}
            onClick={() => setActiveChart('difficulty')}
          >
            <BarChart3 size={18} />
            Difficulty Analysis
          </button>
          <button 
            className={`chart-tab ${activeChart === 'topics' ? 'active' : ''}`}
            onClick={() => setActiveChart('topics')}
          >
            <PieChartIcon size={18} />
            Topic Performance
          </button>
          <button 
            className={`chart-tab ${activeChart === 'progress' ? 'active' : ''}`}
            onClick={() => setActiveChart('progress')}
          >
            <TrendingUp size={18} />
            Progress Tracking
          </button>
          <button 
            className={`chart-tab ${activeChart === 'weakness' ? 'active' : ''}`}
            onClick={() => setActiveChart('weakness')}
          >
            <Target size={18} />
            Weakness Analysis
          </button>
        </div>

        <div className="time-range-selector">
          <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
            <option value="all" style={{backgroundColor : '#18182b', padding : 10}}>All Time</option>
            <option value="year" style={{backgroundColor : '#18182b', padding : 10}}>This Year</option>
            <option value="month" style={{backgroundColor : '#18182b', padding : 10}}>This Month</option>
            <option value="week" style={{backgroundColor : '#18182b', padding : 10}}>This Week</option>
          </select>
        </div>
      </motion.div>

      {/* Main Chart Area */}
      <motion.div className="main-chart-area" variants={itemVariants}>
        {activeChart === 'difficulty' && (
          <div className="chart-container">
            <h3>📈 Performance by Difficulty</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={getDifficultyData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [value, name === 'solved' ? 'Solved' : 'Attempted']}
                  labelFormatter={(label) => `Rating: ${label}`}
                />
                <Bar dataKey="solved" fill="#4F46E5" name="Solved" radius={[4, 4, 0, 0]} />
                <Bar dataKey="attempted" fill="#E5E7EB" name="Attempted" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeChart === 'topics' && (
          <div className="chart-container">
            <h3>🎯 Topic Performance</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={getTagData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="tag" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [value, name === 'solved' ? 'Solved' : 'Attempted']}
                  labelFormatter={(label) => getTagData().find(item => item.tag === label)?.fullTag || label}
                />
                <Bar dataKey="solved" fill="#059669" name="Solved" radius={[4, 4, 0, 0]} />
                <Bar dataKey="attempted" fill="#D1D5DB" name="Attempted" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeChart === 'progress' && (
          <div className="chart-container">
            <h3>📅 Progress Over Time</h3>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={getProgressData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="rating" 
                  stroke="#4F46E5" 
                  fill="#4F46E520" 
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeChart === 'weakness' && (
          <div className="chart-container">
            <h3>🎯 Areas for Improvement</h3>
            <div className="weakness-analysis-container">
              <div className="weakness-chart">
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
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="weakness-details">
                <h4>🎯 Focus Recommendations</h4>
                {analytics.weak_tags_detailed?.slice(0, 5).map((tag, index) => (
                  <div key={tag.tag} className="weakness-item">
                    <div className="weakness-header">
                      <span className="weakness-tag">{tag.tag}</span>
                      <span className="weakness-accuracy">{(tag.accuracy * 100).toFixed(1)}%</span>
                    </div>
                    <div className="weakness-progress">
                      <div 
                        className="weakness-bar" 
                        style={{ 
                          width: `${tag.accuracy * 100}%`,
                          backgroundColor: COLORS[index % COLORS.length]
                        }}
                      ></div>
                    </div>
                    <div className="weakness-stats">
                      {tag.solved}/{tag.attempted} problems solved
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Insights Section */}
      <motion.div className="insights-section" variants={itemVariants}>
        <h3>💡 Key Insights</h3>
        <div className="insights-grid">
          <div className="insight-card strength">
            <h4>🏆 Your Strengths</h4>
            <ul>
              {analytics.strong_tags?.slice(0, 4).map(tag => (
                <li key={tag}>✅ {tag}</li>
              ))}
            </ul>
          </div>
          
          <div className="insight-card improvement">
            <h4>🎯 Areas to Improve</h4>
            <ul>
              {analytics.weak_tags?.slice(0, 4).map(tag => (
                <li key={tag}>📈 {tag}</li>
              ))}
            </ul>
          </div>
          
          <div className="insight-card recommendation">
            <h4>🚀 Recommendations</h4>
            <ul>
              <li>🔥 Focus on {analytics.weak_tags?.[0] || 'dynamic programming'} problems</li>
              <li>⭐ Maintain strength in {analytics.strong_tags?.[0] || 'implementation'}</li>
              <li>📚 Solve 3-5 problems daily</li>
              <li>🎪 Participate in contests regularly</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Analytics;
