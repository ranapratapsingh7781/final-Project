import React from 'react';

const notifications = [
  {
    id: 1,
    icon: '💰',
    title: 'Payment received',
    description: '₹2,500 has been credited to your wallet from Salary Deposit.',
    time: '2 hours ago',
    variant: 'success',
  },
  {
    id: 2,
    icon: '⏰',
    title: 'Bill reminder',
    description: 'Electricity bill of ₹1,200 is due tomorrow. Pay now to avoid late fees.',
    time: '6 hours ago',
    variant: 'warning',
  },
  {
    id: 3,
    icon: '🔒',
    title: 'Security alert',
    description: 'A new login was detected from a new device. If this wasn’t you, review your activity.',
    time: '1 day ago',
    variant: 'danger',
  },
  {
    id: 4,
    icon: '📊',
    title: 'Monthly summary',
    description: 'Your April wallet activity summary is ready to view in the dashboard.',
    time: '2 days ago',
    variant: 'info',
  },
];

const Notifications = () => (
  <div className="notifications-page">
    <section className="notifications-header help-header">
      <div className="help-header-copy">
        <span className="badge accent">Notifications</span>
        <h2>Your latest wallet alerts, reminders, and updates</h2>
        <p>Stay informed with every payment, security alert, and account activity in one place.</p>
      </div>
      <div className="help-header-actions notifications-actions">
        <button type="button" className="btn-secondary">Mark all read</button>
        <button type="button" className="btn-primary">Notification settings</button>
      </div>
    </section>

    <div className="notifications-list">
      {notifications.map((notification) => (
        <article key={notification.id} className={`notification-card ${notification.variant}`}>
          <div className="notification-card-top">
            <div className="notification-icon">{notification.icon}</div>
            <div>
              <strong>{notification.title}</strong>
              <span>{notification.time}</span>
            </div>
          </div>
          <p>{notification.description}</p>
          <button type="button" className="notification-link">View details</button>
        </article>
      ))}
    </div>
  </div>
);

export default Notifications;
