import React, { useEffect, useState } from 'react';
import { api } from '../services/api'; // Ensure this has getRecentActivity

const formatTimeAgo = (unixTime) => {
  const now = Date.now() / 1000;
  const diff = now - unixTime;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return `${Math.floor(diff / 86400)} days ago`;
};

const RecentActivity = ({ cfHandle }) => {
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!cfHandle) return;
    setLoading(true);
    api.getRecentActivity(cfHandle)
      .then(res => setActivity((res.activity || []).slice(0, 5))) // Only top 5
      .finally(() => setLoading(false));
  }, [cfHandle]);

  if (!cfHandle) {
    return <div className="recent-activity">No user selected.</div>;
  }

  return (
    <div className="recent-activity">
      <h3>📅 Recent Activity</h3>
      {loading ? (
        <div className="loading">Loading...</div>
      ) : activity.length === 0 ? (
        <div>No recent activity found.</div>
      ) : (
        <div className="activity-list">
          {activity.map((item, idx) => (
            <div className="activity-item" key={idx}>
              <span className="activity-time">{formatTimeAgo(item.time)}</span>
              <span className="activity-text">
                <a href={item.url} target="_blank" rel="noopener noreferrer">
                  {item.problem}
                </a>
                {item.verdict === 'OK' ? ' — Solved' : ` — ${item.verdict.replace('_', ' ')}`}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentActivity;
