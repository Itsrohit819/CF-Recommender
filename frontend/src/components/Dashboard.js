import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Target, 
  Award, 
  Activity, 
  Users, 
  BookOpen,
  Calendar,
  Star
} from 'lucide-react';
import { api } from '../services/api';
import PerformanceChart from './charts/PerformanceChart';
import SkillRadarChart from './charts/SkillRadarChart';
import RatingProgressChart from './charts/RatingProgressChart';
import RecentActivity from './RecentActivity';
import QuickStats from './QuickStats';
import MLRecommendations from './MLRecommendations';
import '../styles/Dashboard.css'

const Dashboard = ({ user }) => {
  const [analytics, setAnalytics] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user?.cf_handle) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, recommendationsRes] = await Promise.all([
        api.analyzeUser(user.cf_handle),
        api.getMLRecommendations(user.cf_handle, 'hybrid', 5)
      ]);
      
      setAnalytics(analyticsRes.analysis);
      setRecommendations(recommendationsRes.recommendations || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your personalized dashboard...</p>
      </div>
    );
  }

  return (
    <motion.div 
      className="dashboard"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header Section */}
      <motion.div className="dashboard-header" variants={itemVariants}>
        <div className="welcome-section">
          <h1>Welcome back, <span className="highlight">{user.cf_handle}</span>! 👋</h1>
          <p>Here's your competitive programming journey at a glance</p>
        </div>
        <div className="user-rating-badge">
          <div className="rating-circle">
            <span className="rating-number"> {user.rating || 1200}</span> <br/>
            <span className="rating-label">Current Rating</span>
          </div>
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <motion.div className="dashboard-tabs" variants={itemVariants}>
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <Activity size={30} />
          Overview
        </button>
        <button 
          className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <TrendingUp size={30} />
          Analytics
        </button>
        <button 
          className={`tab ${activeTab === 'recommendations' ? 'active' : ''}`}
          onClick={() => setActiveTab('recommendations')}
        >
          <Target size={20} />
          AI Recommendations
        </button>
      </motion.div>

      {/* Tab Content */}
      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <motion.div className="overview-tab" variants={containerVariants}>
            <QuickStats user={user} analytics={analytics} />
            <div className="charts-grid">
              <motion.div className="chart-card" variants={itemVariants}>
                <h3>Rating Progress</h3>
                <RatingProgressChart cfHandle={user.cf_handle} />
              </motion.div>
              <motion.div className="chart-card" variants={itemVariants}>
                <h3>Skill Analysis</h3>
                <SkillRadarChart analytics={analytics} />
              </motion.div>
            </div>
            <RecentActivity cfHandle={user.cf_handle} />
          </motion.div>
        )}

        {activeTab === 'analytics' && (
          <motion.div className="analytics-tab" variants={containerVariants}>
            <PerformanceChart cfHandle={user.cf_handle} analytics={analytics} />
          </motion.div>
        )}

        {activeTab === 'recommendations' && (
          <motion.div className="recommendations-tab" variants={containerVariants}>
            <MLRecommendations cfHandle={user.cf_handle} />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default Dashboard;
