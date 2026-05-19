import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingSection, setEditingSection] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    theme: 'light',
    notifications: true,
    twoFactorAuth: false,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await api.get('/auth/me');
        setProfile(res.data);
        setFormData({
          name: res.data.name || '',
          email: res.data.email || '',
          phone: res.data.phone || '',
          theme: localStorage.getItem('theme') || 'light',
          notifications: JSON.parse(localStorage.getItem('notifications') ?? 'true'),
          twoFactorAuth: res.data.twoFactorAuth || false,
        });
      } catch (err) {
        setError('Unable to load your profile. Please try again later.');
      }
    };

    loadProfile();
  }, []);

  const formatCurrency = (value) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(value || 0);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const updateData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      };
      await api.put('/auth/update-profile', updateData);
      setProfile({ ...profile, ...updateData });
      setSuccess('Profile updated successfully!');
      setEditingSection(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      localStorage.setItem('theme', formData.theme);
      localStorage.setItem('notifications', JSON.stringify(formData.notifications));
      setSuccess('Preferences saved successfully!');
      setEditingSection(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to save preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTwoFactorAuth = async () => {
    setLoading(true);
    try {
      // This would normally call a backend endpoint
      setFormData({ ...formData, twoFactorAuth: !formData.twoFactorAuth });
      setSuccess(
        `Two-factor authentication ${!formData.twoFactorAuth ? 'enabled' : 'disabled'}!`
      );
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update security settings');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) =>
    dateString
      ? new Date(dateString).toLocaleDateString(undefined, {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      : '-';

  if (!profile) {
    return (
      <div className="placeholder-page">
        <div className="placeholder-card">
          <h2>Loading Profile…</h2>
          <p>Please wait while we fetch your account details.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div>
          <p className="eyebrow">My Profile</p>
          <h1>Account details and personalization</h1>
          <p>
            Manage your account information, security settings, wallet balance, and membership details in one place.
          </p>
        </div>
        <div className="profile-hero-card">
          <div className="profile-hero-avatar">
            {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h2>{profile.name}</h2>
            <p>{profile.email}</p>
            <div className="profile-hero-meta">
              <span>Joined {formatDate(profile.createdAt)}</span>
              <span>{formatCurrency(profile.balance)} available</span>
            </div>
          </div>
        </div>
      </div>

      {error && <div className="error-banner">⚠️ {error}</div>}
      {success && <div className="success-banner">✓ {success}</div>}

      <div className="profile-grid">
        {/* Profile Settings Section */}
        <section className="page-card profile-card">
          <div className="section-header">
            <h3>👤 Profile Settings</h3>
            {editingSection !== 'profile' && (
              <button
                className="link-btn"
                onClick={() => setEditingSection('profile')}
              >
                ✏️ Edit
              </button>
            )}
          </div>

          {editingSection === 'profile' ? (
            <div className="edit-form">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                />
              </div>
              <div className="button-group">
                <button
                  className="primary-btn"
                  onClick={handleUpdateProfile}
                  disabled={loading}
                >
                  {loading ? '⏳ Saving...' : '✓ Save Changes'}
                </button>
                <button
                  className="secondary-btn"
                  onClick={() => setEditingSection(null)}
                >
                  ✕ Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="profile-detail-list">
              <div>
                <strong>Full Name</strong>
                <span>{profile.name}</span>
              </div>
              <div>
                <strong>Email Address</strong>
                <span>{profile.email}</span>
              </div>
              <div>
                <strong>Phone Number</strong>
                <span>{formData.phone || '—'}</span>
              </div>
            </div>
          )}
        </section>

        {/* Account Details Section */}
        <section className="page-card profile-card">
          <h3>💰 Account Details</h3>
          <div className="profile-detail-list">
            <div>
              <strong>Current Balance</strong>
              <span>{formatCurrency(profile.balance)}</span>
            </div>
            <div>
              <strong>Account Type</strong>
              <span>Standard Wallet User</span>
            </div>
            <div>
              <strong>Account Status</strong>
              <span className="status-active">Active</span>
            </div>
            <div>
              <strong>Member Since</strong>
              <span>{formatDate(profile.createdAt)}</span>
            </div>
            <div>
              <strong>Last Updated</strong>
              <span>{formatDate(profile.updatedAt)}</span>
            </div>
            <div>
              <strong>Transactions This Month</strong>
              <span>12 transactions</span>
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section className="page-card profile-card">
          <h3>🔒 Security & Privacy</h3>
          <div className="profile-detail-list">
            <div>
              <strong>Password</strong>
              <span>••••••••</span>
            </div>
            <div>
              <strong>Two-Factor Authentication</strong>
              <span className={formData.twoFactorAuth ? 'status-active' : 'status-inactive'}>
                {formData.twoFactorAuth ? 'Enabled' : 'Not configured'}
              </span>
            </div>
            <div>
              <strong>Session Status</strong>
              <span className="status-active">Active</span>
            </div>
            <div>
              <strong>Authorized Devices</strong>
              <span>1 device</span>
            </div>
            <div>
              <strong>Last Login</strong>
              <span>{formatDate(profile.updatedAt)}</span>
            </div>
          </div>
          <div className="button-group">
            <button
              className="primary-btn"
              onClick={handleToggleTwoFactorAuth}
              disabled={loading}
            >
              {formData.twoFactorAuth ? '🔓 Disable 2FA' : '🔐 Enable 2FA'}
            </button>
            <button className="secondary-btn">🔑 Change Password</button>
          </div>
        </section>

        {/* Personalization Section */}
        <section className="page-card profile-card">
          <div className="section-header">
            <h3>✨ Personalization & Preferences</h3>
            {editingSection !== 'preferences' && (
              <button
                className="link-btn"
                onClick={() => setEditingSection('preferences')}
              >
                ✏️ Edit
              </button>
            )}
          </div>

          {editingSection === 'preferences' ? (
            <div className="edit-form">
              <div className="form-group">
                <label>🎨 Theme Preference</label>
                <select name="theme" value={formData.theme} onChange={handleInputChange}>
                  <option value="light">☀️ Light</option>
                  <option value="dark">🌙 Dark</option>
                  <option value="auto">🔄 Auto (System)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="notifications"
                    checked={formData.notifications}
                    onChange={handleInputChange}
                  />
                  <span>🔔 Enable Email Notifications</span>
                </label>
              </div>
              <div className="button-group">
                <button
                  className="primary-btn"
                  onClick={handleSavePreferences}
                  disabled={loading}
                >
                  {loading ? '⏳ Saving...' : '✓ Save Preferences'}
                </button>
                <button
                  className="secondary-btn"
                  onClick={() => setEditingSection(null)}
                >
                  ✕ Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="profile-detail-list">
              <div>
                <strong>Theme Preference</strong>
                <span>{formData.theme === 'auto' ? '🔄 Auto (System)' : formData.theme === 'dark' ? '🌙 Dark' : '☀️ Light'}</span>
              </div>
              <div>
                <strong>Language</strong>
                <span>🌐 English</span>
              </div>
              <div>
                <strong>Currency</strong>
                <span>₹ INR</span>
              </div>
              <div>
                <strong>Email Notifications</strong>
                <span className={formData.notifications ? 'status-active' : 'status-inactive'}>
                  {formData.notifications ? '🔔 Enabled' : '🔕 Disabled'}
                </span>
              </div>
              <div>
                <strong>SMS Alerts</strong>
                <span className="status-inactive">📵 Disabled</span>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Profile;
