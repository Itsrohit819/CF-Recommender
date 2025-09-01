import React, { useState } from 'react';
import { api } from '../services/api';

const UserProfile = ({ user, setUser }) => {
  const [cfHandle, setCfHandle] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!cfHandle.trim()) return;

    setLoading(true);
    try {
      const response = await api.addUser(cfHandle);
      if (response.user) {
        setUser(response.user);
        alert('User added successfully!');
      }
    } catch (error) {
      console.error('Error adding user:', error);
      alert('Error adding user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-profile">
      <h2>Add Your Codeforces Handle</h2>
      <form onSubmit={handleAddUser}>
        <input
          type="text"
          placeholder="Enter CF handle (e.g., defender087)"
          value={cfHandle}
          className='input-box-user'
          onChange={(e) => setCfHandle(e.target.value)}
          disabled={loading}
        />
        <button type="submit" disabled={loading} className='btn-add-user'>
          {loading ? 'Adding...' : 'Add User'}
        </button>
      </form>
    </div>
  );
};

export default UserProfile; // Default export
