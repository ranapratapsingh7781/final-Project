import React, { useState } from 'react';
import '../App.css';

const Notifications = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'transaction',
      title: 'Money Received',
      message: 'You received ₹5,000 from Rajesh Kumar',
      timestamp: new Date(Date.now() - 2 * 60000), // 2 minutes ago
      read: false,
      icon: '💰',
    },
    {
      id: 2,
      type: 'bill_reminder',
      title: 'Bill Payment Reminder',
      message: 'Your electricity bill of ₹2,500 is due in 3 days',
      timestamp: new Date(Date.now() - 1 * 3600000), // 1 hour ago
      read: false,
      icon: '📅',
    },
    {
      id: 3,
      type: 'security',
      title: 'Security Alert',
      message: 'New login detected from Chrome on Windows',
      timestamp: new Date(Date.now() - 5 * 3600000), // 5 hours ago
      read: true,
      icon: '🔒',
    },
    {
      id: 4,
      type: 'transaction',
      title: 'Money Sent',
      message: 'You sent ₹1,500 to Priya Singh',
      timestamp: new Date(Date.now() - 1 * 86400000), // 1 day ago
      read: true,
      icon: '💸',
    },
    {
      id: 5,
      type: 'system',
      title: 'System Update',
      message: 'The app has been updated with new features',
      timestamp: new Date(Date.now() - 2 * 86400000), // 2 days ago
      read: true,
      icon: '⚙️',
    },
    {
      id: 6,
      type: 'bill_reminder',
      title: 'Bill Payment Reminder',
      message: 'Your internet bill of ₹999 is due tomorrow',
      timestamp: new Date(Date.now() - 3 * 86400000), // 3 days ago
      read: true,
      icon: '📅',
    },
    {
      id: 7,
      type: 'transaction',
      title: 'Transfer Request',
      message: 'Amit Patel requested ₹2,000 from you',
      timestamp: new Date(Date.now() - 4 * 86400000), // 4 days ago
      read: true,
      icon: '🔄',
    },
  ]);

  const [filterType, setFilterType] = useState('all');
  const [preferences, setPreferences] = useState({
    transactionAlerts: true,
    billReminders: true,
    securityAlerts: true,
    systemUpdates: true,
  });
  const [showPreferences, setShowPreferences] = useState(false);

  const filteredNotifications = filterType === 'all' 
    ? notifications 
    : notifications.filter(n => n.type === filterType);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationColor = (type) => {
    switch (type) {
      case 'transaction':
        return '#4CAF50';
      case 'bill_reminder':
        return '#FF9800';
      case 'security':
        return '#f44336';
      case 'system':
        return '#2196F3';
      default:
        return '#9E9E9E';
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleMarkAsRead = (id) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleDelete = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to delete all notifications?')) {
      setNotifications([]);
    }
  };

  const handlePreferenceChange = (key) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h1 style={{ marginBottom: '5px', color: '#333' }}>Notifications</h1>
            {unreadCount > 0 && (
              <p style={{ color: '#666', margin: 0, fontSize: '14px' }}>
                You have <strong>{unreadCount}</strong> unread notification{unreadCount !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          <button
            onClick={() => setShowPreferences(!showPreferences)}
            style={{
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              padding: '10px 15px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
            }}
          >
            ⚙️ Preferences
          </button>
        </div>

        {/* Preferences Panel */}
        {showPreferences && (
          <div style={{
            backgroundColor: '#fff',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            marginBottom: '30px',
            border: '1px solid #2196F3',
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#333' }}>Notification Preferences</h3>

            {Object.entries(preferences).map(([key, value]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                <input
                  type="checkbox"
                  id={key}
                  checked={value}
                  onChange={() => handlePreferenceChange(key)}
                  style={{ marginRight: '10px', cursor: 'pointer', width: '18px', height: '18px' }}
                />
                <label htmlFor={key} style={{ cursor: 'pointer', color: '#555', margin: 0, flex: 1 }}>
                  {key === 'transactionAlerts' && 'Transaction Alerts'}
                  {key === 'billReminders' && 'Bill Reminders'}
                  {key === 'securityAlerts' && 'Security Alerts'}
                  {key === 'systemUpdates' && 'System Updates'}
                </label>
              </div>
            ))}

            <button
              onClick={() => setShowPreferences(false)}
              style={{
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                marginTop: '10px',
              }}
            >
              Save Preferences
            </button>
          </div>
        )}

        {/* Filter Buttons */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {['all', 'transaction', 'bill_reminder', 'security', 'system'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              style={{
                backgroundColor: filterType === type ? '#4CAF50' : '#fff',
                color: filterType === type ? 'white' : '#555',
                border: `1px solid ${filterType === type ? '#4CAF50' : '#ddd'}`,
                padding: '8px 15px',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '500',
                transition: 'all 0.2s',
              }}
            >
              {type === 'all' && 'All'}
              {type === 'transaction' && '💰 Transactions'}
              {type === 'bill_reminder' && '📅 Bills'}
              {type === 'security' && '🔒 Security'}
              {type === 'system' && '⚙️ System'}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        {notifications.length > 0 && (
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', justifyContent: 'flex-end' }}>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                style={{
                  backgroundColor: '#2196F3',
                  color: 'white',
                  border: 'none',
                  padding: '8px 15px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '600',
                }}
              >
                Mark All as Read
              </button>
            )}
            <button
              onClick={handleClearAll}
              style={{
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                padding: '8px 15px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '600',
              }}
            >
              Clear All
            </button>
          </div>
        )}

        {/* Notifications List */}
        {filteredNotifications.length > 0 ? (
          <div>
            {filteredNotifications.map(notification => (
              <div
                key={notification.id}
                style={{
                  backgroundColor: notification.read ? '#fff' : '#f9f9f9',
                  padding: '15px',
                  marginBottom: '10px',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  borderLeft: `4px solid ${getNotificationColor(notification.type)}`,
                  display: 'flex',
                  gap: '15px',
                  alignItems: 'flex-start',
                }}
              >
                <div style={{ fontSize: '24px' }}>{notification.icon}</div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '5px' }}>
                    <h4 style={{
                      margin: 0,
                      color: '#333',
                      fontSize: '15px',
                      fontWeight: notification.read ? '500' : '700',
                    }}>
                      {notification.title}
                      {!notification.read && (
                        <span style={{
                          marginLeft: '8px',
                          display: 'inline-block',
                          width: '8px',
                          height: '8px',
                          backgroundColor: '#4CAF50',
                          borderRadius: '50%',
                        }}></span>
                      )}
                    </h4>
                    <span style={{ color: '#999', fontSize: '12px', whiteSpace: 'nowrap', marginLeft: '10px' }}>
                      {formatTime(notification.timestamp)}
                    </span>
                  </div>

                  <p style={{
                    color: '#666',
                    margin: '5px 0',
                    fontSize: '14px',
                  }}>
                    {notification.message}
                  </p>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    {!notification.read && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        style={{
                          backgroundColor: 'transparent',
                          color: '#2196F3',
                          border: 'none',
                          padding: 0,
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '600',
                          textDecoration: 'underline',
                        }}
                      >
                        Mark as Read
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notification.id)}
                      style={{
                        backgroundColor: 'transparent',
                        color: '#f44336',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '600',
                        textDecoration: 'underline',
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            backgroundColor: '#fff',
            padding: '60px 30px',
            borderRadius: '8px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}>
            <p style={{ fontSize: '40px', margin: '0 0 10px 0' }}>📭</p>
            <h3 style={{ color: '#999', margin: '0 0 10px 0' }}>No Notifications</h3>
            <p style={{ color: '#bbb', margin: 0 }}>
              {filterType === 'all'
                ? "You're all caught up! Check back later."
                : `No ${filterType.replace('_', ' ')} notifications found.`}
            </p>
          </div>
        )}

        {/* Notification Types Legend */}
        {notifications.length > 0 && (
          <div style={{
            backgroundColor: '#f5f5f5',
            padding: '20px',
            borderRadius: '8px',
            marginTop: '30px',
          }}>
            <h4 style={{ marginTop: 0, marginBottom: '15px', color: '#333' }}>📌 Notification Types</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
              <div>
                <p style={{ color: '#4CAF50', fontWeight: '600', margin: '0 0 5px 0' }}>💰 Transactions</p>
                <p style={{ color: '#666', fontSize: '12px', margin: 0 }}>Money sent, received, and transfers</p>
              </div>
              <div>
                <p style={{ color: '#FF9800', fontWeight: '600', margin: '0 0 5px 0' }}>📅 Bills</p>
                <p style={{ color: '#666', fontSize: '12px', margin: 0 }}>Bill payment reminders and due dates</p>
              </div>
              <div>
                <p style={{ color: '#f44336', fontWeight: '600', margin: '0 0 5px 0' }}>🔒 Security</p>
                <p style={{ color: '#666', fontSize: '12px', margin: 0 }}>Alerts about account security</p>
              </div>
              <div>
                <p style={{ color: '#2196F3', fontWeight: '600', margin: '0 0 5px 0' }}>⚙️ System</p>
                <p style={{ color: '#666', fontSize: '12px', margin: 0 }}>App updates and announcements</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
