import React from 'react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer
} from 'recharts';

const SkillRadarChart = ({ analytics }) => {
  if (!analytics?.tag_stats) {
    return (
      <div className="chart-placeholder" style={{ textAlign: 'center', padding: '1rem' }}>
        <p>Skill data not available.</p>
      </div>
    );
  }

  const processedData = Object.entries(analytics.tag_stats)
    .filter(([_, stats]) => stats.attempted >= 3)
    .sort((a, b) => b[1].attempted - a[1].attempted)
    .slice(0, 8)
    .map(([tag, stats]) => ({
      skill: tag,
      proficiency: Math.round(stats.accuracy * 100),
      attempted: stats.attempted
    }));

  if (processedData.length === 0) {
    return (
      <div className="chart-placeholder" style={{ textAlign: 'center', padding: '1rem' }}>
        <p>Solve more problems to unlock your skill radar!</p>
      </div>
    );
  }

  return (
    <div className="skill-radar-chart" style={{ padding: '1rem' }}>
      <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
        <h3>Your Skill Radar</h3>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={processedData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="skill" />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} />
          <Radar
            name="Proficiency"
            dataKey="proficiency"
            stroke="#4F46E5"
            fill="#4F46E5"
            fillOpacity={0.4}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>

      <div className="skill-legend" style={{ marginTop: '1.5rem' }}>
        <h4 style={{ marginBottom: '0.5rem' }}>Top 5 Tags</h4>
        <div className="skill-list">
          {processedData.slice(0, 5).map((item) => (
            <div
              key={item.skill}
              className="skill-item"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '0.5rem'
              }}
            >
              <span style={{ minWidth: '100px', fontWeight: 500 }}>{item.skill}</span>
              <div
                className="skill-bar"
                style={{
                  flexGrow: 1,
                  background: '#E5E7EB',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  height: '8px'
                }}
              >
                <div
                  className="skill-progress"
                  style={{
                    width: `${item.proficiency}%`,
                    background: '#4F46E5',
                    height: '100%'
                  }}
                />
              </div>
              <span style={{ fontWeight: 500 }}>{item.proficiency}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SkillRadarChart;
