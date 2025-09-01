const API_BASE =
  process.env.NODE_ENV === "production"
    ? "https://cf-recommender-i50o.onrender.com/api"
    : "http://localhost:5000/api";


export const api = {
  // User operations
  addUser: async (cfHandle) => {
    const response = await fetch(`${API_BASE}/users/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cf_handle: cfHandle }),
    });
    return response.json();
  },

  getRecentActivity: async (cfHandle) => {
  const response = await fetch(`${API_BASE}/users/${cfHandle}/recent-activity`);
  return response.json();
  },

  getUser: async (cfHandle) => {
    const response = await fetch(`${API_BASE}/users/${cfHandle}`);
    return response.json();
  },

  // Health check
  healthCheck: async () => {
    const response = await fetch(`${API_BASE}/health`);
    return response.json();
  },

  // Problem operations
  searchProblems: async (filters) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    
    const response = await fetch(`${API_BASE}/problems/search?${params}`);
    return response.json();
  },

  getTrendingProblems: async (limit = 10) => {
    const response = await fetch(`${API_BASE}/problems/trending?limit=${limit}`);
    return response.json();
  },

  getAvailableTags: async () => {
    const response = await fetch(`${API_BASE}/problems/tags`);
    return response.json();
  },

  // ML Recommendations
  getMLRecommendations: async (cfHandle, method = 'hybrid', count = 5) => {
    const response = await fetch(
      `${API_BASE}/recommendations/ml/${cfHandle}?method=${method}&count=${count}`
    );
    return response.json();
  },

  // Analytics
  analyzeUser: async (cfHandle) => {
    const response = await fetch(`${API_BASE}/recommendations/analyze/${cfHandle}`);
    return response.json();
  }
};
