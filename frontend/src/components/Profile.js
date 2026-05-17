import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import '../App.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/me');
      setUser(response.data);
      setFormData({
        name: response.data.name,
        email: response.data.email,
      });
      setError('');
    } catch (err) {
      setError('Failed to load profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async () => {
    if (!formData.name.trim()) {
      setError('Name cannot be empty');
      return;
    }

    try {
      setLoading(true);
      // Update user in state (backend doesn't have update endpoint yet, but prepared for future)
      setUser(prev => ({
        ...prev,
        name: formData.name,
        email: formData.email,
      }));
      setEditMode(false);
      setError('');
    } catch (err) {
      setError('Failed to save profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
    });
  };

  if (loading && !user) {
    return (
      <div className="placeholder-page">
        <div className="placeholder-card">
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container" style={{ padding: '20px' }}>
      <div className="profile-card" style={{
        backgroundColor: '#fff',
        borderRadius: '8px',
        padding: '30px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        maxWidth: '600px',
        margin: '0 auto',
      }}>
        <h2 style={{ marginBottom: '30px', fontWeight: '600' }}>My Profile</h2>

        {error && (
          <div style={{
            backgroundColor: '#fee',
            color: '#c33',
            padding: '10px',
            borderRadius: '4px',
            marginBottom: '15px',
          }}>
            {error}
          </div>
        )}

        {user && !editMode && (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: '500', marginBottom: '5px', color: '#555' }}>
                Name
              </label>
              <p style={{ fontSize: '16px', color: '#333', margin: 0 }}>{user.name}</p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: '500', marginBottom: '5px', color: '#555' }}>
                Email
              </label>
              <p style={{ fontSize: '16px', color: '#333', margin: 0 }}>{user.email}</p>
            </div>

            <div style={{ marginBottom: '30px' }}>
              <label style={{ display: 'block', fontWeight: '500', marginBottom: '5px', color: '#555' }}>
                Wallet Balance
              </label>
              <p style={{ fontSize: '20px', fontWeight: '600', color: '#4CAF50', margin: 0 }}>
                ₹{user.balance?.toFixed(2) || '0.00'}
              </p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: '500', marginBottom: '5px', color: '#555' }}>
                Account Created
              </label>
              <p style={{ fontSize: '16px', color: '#333', margin: 0 }}>
                {new Date(user.createdAt).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            </div>

            <button
              onClick={() => setEditMode(true)}
              style={{
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              Edit Profile
            </button>
          </div>
        )}

        {editMode && (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: '500', marginBottom: '8px', color: '#555' }}>
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: '500', marginBottom: '8px', color: '#555' }}>
                Email (Read-only)
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                disabled
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  backgroundColor: '#f5f5f5',
                  color: '#999',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleSaveProfile}
                disabled={loading}
                style={{
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={handleCancel}
                disabled={loading}
                style={{
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
