import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const RatingProgressChart = ({ cfHandle = 'tourist' }) => {
  const [ratingData, setRatingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (cfHandle) {
      fetchRatingHistory();
    }
  }, [cfHandle]);

  const fetchRatingHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://codeforces.com/api/user.rating?handle=${cfHandle}`);
      const result = await response.json();

      if (result.status === 'OK') {
        const formattedData = result.result.map(entry => ({
          contest: entry.contestName,
          rating: entry.newRating,
          date: new Date(entry.ratingUpdateTimeSeconds * 1000).toLocaleDateString()
        }));

        setRatingData(formattedData);
        setError(null);
      } else {
        setError(result.comment || 'Unknown API error');
        setRatingData([]);
      }
    } catch (err) {
      console.error('Error fetching rating history:', err);
      setError('Network error or invalid handle');
      setRatingData([]);
    } finally {
      setLoading(false);
    }
  };

  const getRatingColor = (rating) => {
    if (rating < 1200) return '#808080'; // Gray
    if (rating < 1400) return '#008000'; // Green
    if (rating < 1600) return '#03A89E'; // Cyan
    if (rating < 1900) return '#0000FF'; // Blue
    if (rating < 2100) return '#AA00AA'; // Violet
    if (rating < 2400) return '#FF8C00'; // Orange
    return '#FF0000'; // Red
  };

  const currentRating = ratingData[ratingData.length - 1]?.rating || 0;
  const ratingColor = getRatingColor(currentRating);

  return (
    <div className="rating-progress-chart" style={{ padding: '1rem' }}>
      <div className="chart-header" style={{ marginBottom: '1rem', textAlign: 'center' }}>
        <div className="current-rating">
          <span
            className="rating-value"
            style={{ color: ratingColor, fontSize: '2rem', fontWeight: 'bold' }}
          >
            {currentRating || '—'}
          </span>
          <div className="rating-label" style={{ fontSize: '1rem', color: '#888' }}>
            Current Rating
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center' }}>Loading rating history...</div>
      ) : error ? (
        <div style={{ textAlign: 'center', color: 'red' }}>{error}</div>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={ratingData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="contest"
              tick={{ fontSize: 11 }}
              interval="preserveStartEnd"
              minTickGap={10}
            />
            <YAxis
              domain={['dataMin - 100', 'dataMax + 100']}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              formatter={(value) => [value, 'Rating']}
              labelFormatter={(label) => `Contest: ${label}`}
            />
            <Line
              type="monotone"
              dataKey="rating"
              stroke={ratingColor}
              strokeWidth={3}
              dot={{ fill: ratingColor, r: 3 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default RatingProgressChart;
