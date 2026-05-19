import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import api from '../utils/api';

const Dashboard = () => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [userName, setUserName] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [actionModal, setActionModal] = useState({
    visible: false,
    type: '',
    title: '',
    actionLabel: '',
    biller: '',
    paymentId: null,
    readOnlyBiller: false,
  });
  const [formData, setFormData] = useState({
    recipient: '',
    requester: '',
    amount: '',
    description: '',
    biller: '',
    due: '',
  });
  const [chartData, setChartData] = useState([]);
  const [chartView, setChartView] = useState('weekly');
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const [upcomingPayments, setUpcomingPayments] = useState([]);

  const handleUpdateProject = () => {
    setSuccessMsg('Project update action is available.');
  };

  useEffect(() => {
    fetchProfile();
    fetchBalance();
    fetchTransactions();
    fetchUpcomingPayments();
  }, []);

  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  const prepareChartData = useCallback(() => {
    const now = new Date();

    if (chartView === 'hourly') {
      const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
        date: `${hour}:00`,
        incoming: 0,
        outgoing: 0,
      }));

      transactions.forEach((item) => {
        const txDate = new Date(item.date);
        if (txDate.toDateString() !== now.toDateString()) return;

        const hour = txDate.getHours();
        const type = item.type.toLowerCase();
        if (type === 'deposit') {
          hourlyData[hour].incoming += item.amount;
        } else {
          hourlyData[hour].outgoing += item.amount;
        }
      });

      setChartData(hourlyData);
      return;
    }

    const last7Days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(now);
      date.setDate(now.getDate() - (6 - index));
      return {
        date: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        incoming: 0,
        outgoing: 0,
      };
    });

    const dateIndexMap = last7Days.reduce((map, entry, index) => {
      map[entry.date] = index;
      return map;
    }, {});

    transactions.forEach((item) => {
      const dateLabel = new Date(item.date).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      });
      const index = dateIndexMap[dateLabel];
      if (index === undefined) return;

      const type = item.type.toLowerCase();
      if (type === 'deposit') {
        last7Days[index].incoming += item.amount;
      } else {
        last7Days[index].outgoing += item.amount;
      }
    });

    setChartData(last7Days);
  }, [transactions, chartView]);

  useEffect(() => {
    prepareChartData();
  }, [prepareChartData]);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/me');
      setUserName(res.data.name);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBalance = async () => {
    try {
      const res = await api.get('/wallet/balance');
      setBalance(res.data.balance);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await api.get('/wallet/transactions');
      setTransactions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUpcomingPayments = async () => {
    try {
      const res = await api.get('/wallet/upcoming-payments');
      setUpcomingPayments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNavigation = (section) => {
    switch (section) {
      case 'Dashboard':
        navigate('/dashboard');
        break;
      case 'My Pay':
        navigate('/bills');
        break;
      case 'Transaction History':
      case 'My Transactions':
        navigate('/transactions');
        break;
      case 'My Profile':
        navigate('/profile');
        break;
      case 'My Retirement':
        navigate('/retirement');
        break;
      case 'Help Center':
        navigate('/help');
        break;
      case 'Notifications':
        navigate('/notifications');
        break;
      default:
        setError('Section is not available yet.');
    }
  };

  const openActionModal = (type, config = {}) => {
    setError('');
    setSuccessMsg('');
    const actionConfig = {
      add: { title: 'Add Money', actionLabel: 'Add', biller: '', readOnlyBiller: false },
      withdraw: { title: 'Withdraw Money', actionLabel: 'Withdraw', biller: '', readOnlyBiller: false },
      transfer: { title: 'Send Money', actionLabel: 'Transfer', biller: '', readOnlyBiller: false },
      request: { title: 'Receive Money', actionLabel: 'Request', biller: '', readOnlyBiller: false },
      payBills: { title: 'Pay Bills', actionLabel: 'Pay', biller: '', readOnlyBiller: false },
      issueDemand: { title: 'Issue Demand', actionLabel: 'Issue', biller: '', readOnlyBiller: false },
      updatePayment: { title: 'Update Payment', actionLabel: 'Update', biller: '', readOnlyBiller: false },
      addUpcomingPayment: { title: 'Add Upcoming Payment', actionLabel: 'Add', biller: '', readOnlyBiller: false },
    };

    setFormData({
      recipient: '',
      requester: '',
      amount: '',
      description: '',
      biller: config.biller || '',
      due: config.due || '',
    });

    setActionModal({
      visible: true,
      type,
      paymentId: config.paymentId || null,
      ...(actionConfig[type] || {}),
      biller: config.biller || actionConfig[type]?.biller || '',
      readOnlyBiller: config.readOnlyBiller || false,
    });
  };

  const closeActionModal = () => {
    setActionModal({ visible: false, type: '', title: '', actionLabel: '', biller: '', paymentId: null, readOnlyBiller: false });
    setFormData({ recipient: '', requester: '', amount: '', description: '', biller: '', due: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleModalSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccessMsg('');

    const amountValue = parseFloat(formData.amount || '0');
    if (actionModal.type !== 'updatePayment' && (!amountValue || amountValue <= 0)) {
      setError('Please enter a valid amount.');
      return;
    }

    try {
      switch (actionModal.type) {
        case 'add':
          await api.post('/wallet/add', { amount: amountValue, description: formData.description });
          setSuccessMsg('Add successful.');
          break;
        case 'withdraw':
          await api.post('/wallet/withdraw', { amount: amountValue, description: formData.description });
          setSuccessMsg('Withdraw successful.');
          break;
        case 'transfer':
          if (!formData.recipient) {
            setError('Please enter recipient email.');
            return;
          }
          await api.post('/wallet/transfer', {
            recipient: formData.recipient,
            amount: amountValue,
            description: formData.description,
          });
          setSuccessMsg('Transfer completed successfully.');
          break;
        case 'request':
          if (!formData.requester) {
            setError('Please enter requester email.');
            return;
          }
          await api.post('/wallet/request-money', {
            requester: formData.requester,
            amount: amountValue,
            description: formData.description,
          });
          setSuccessMsg('Money request sent successfully.');
          break;
        case 'payBills':
          if (!formData.biller) {
            setError('Please enter biller name.');
            return;
          }
          await api.post('/wallet/pay-bill', {
            biller: formData.biller,
            amount: amountValue,
            description: formData.description,
          });
          setSuccessMsg('Bill paid successfully!');
          break;
        case 'issueDemand':
          if (!formData.recipient) {
            setError('Please enter recipient email.');
            return;
          }
          await api.post('/wallet/issue-demand', {
            recipient: formData.recipient,
            amount: amountValue,
            description: formData.description,
          });
          setSuccessMsg('Demand issued successfully!');
          break;
        case 'updatePayment': {
          const newAmount = amountValue || 0;
          if (!newAmount || newAmount <= 0) {
            setError('Please enter a valid amount to update.');
            return;
          }
          if (!formData.due) {
            setError('Please enter a valid due date to update.');
            return;
          }
          await api.put(`/wallet/update-upcoming-payment/${actionModal.paymentId}`, {
            title: formData.biller,
            amount: newAmount,
            due: formData.due,
            biller: formData.biller,
            description: formData.description,
          });
          setSuccessMsg('Upcoming payment updated successfully.');
          await fetchUpcomingPayments();
          break;
        }
        case 'addUpcomingPayment':
          if (!formData.biller) {
            setError('Please enter a title for the payment.');
            return;
          }
          if (!formData.due) {
            setError('Please enter a due date.');
            return;
          }
          await api.post('/wallet/add-upcoming-payment', {
            title: formData.biller,
            amount: amountValue,
            due: formData.due,
            biller: formData.biller,
            description: formData.description,
          });
          setSuccessMsg('Upcoming payment added successfully.');
          await fetchUpcomingPayments();
          break;
        default:
          return;
      }

      await fetchBalance();
      await fetchTransactions();
      closeActionModal();
    } catch (err) {
      setError(err.response?.data?.msg || 'Unable to complete the transaction.');
    }
  };

  const handleAction = (action) => {
    openActionModal(action);
  };


  const handleSpecificBill = (billType) => {
    openActionModal('payBills', { biller: billType, readOnlyBiller: true });
  };

  const handleUpdatePayment = (paymentId) => {
    const payment = upcomingPayments.find((item) => item._id === paymentId);
    if (!payment) return;

    setFormData({
      recipient: '',
      requester: '',
      amount: payment.amount.toString(),
      description: payment.description || '',
      biller: payment.title,
      due: new Date(payment.due).toISOString().split('T')[0], // Format to YYYY-MM-DD
    });
    setActionModal({
      visible: true,
      type: 'updatePayment',
      title: 'Update Payment',
      actionLabel: 'Update',
      biller: payment.title,
      paymentId,
      readOnlyBiller: true,
    });
  };

  const handleDeletePayment = async (paymentId) => {
    try {
      await api.delete(`/wallet/delete-upcoming-payment/${paymentId}`);
      setUpcomingPayments((prev) => prev.filter((item) => item._id !== paymentId));
      setSuccessMsg('Upcoming payment deleted successfully.');
    } catch (err) {
      setError(err.response?.data?.msg || 'Unable to delete the payment.');
    }
  };

  const walletStats = transactions.reduce(
    (acc, tx) => {
      const type = tx.type.toLowerCase();
      if (type === 'deposit') acc.income += tx.amount;
      if (type === 'withdraw') acc.expense += tx.amount;
      if (type === 'transfer') acc.transfers += tx.amount;
      if (type === 'request' && tx.status === 'pending') acc.pendingRequests += 1;
      if (type === 'demand' && tx.status === 'pending') acc.pendingDemands += 1;
      return acc;
    },
    { income: 0, expense: 0, transfers: 0, pendingRequests: 0, pendingDemands: 0 }
  );

  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  const projectCompleted = 60;
  const projectInProgress = 25;
  const projectTotal = projectCompleted + projectInProgress;
  const projectCompletion = Math.round((projectCompleted / projectTotal) * 100);
  const projectStrokeOffset = 326.7 * (1 - projectCompletion / 100);

  const taxDocuments = [
    { label: '2020 W2' },
    { label: '2019 W2' },
    { label: '2018 W2' },
  ];

  const today = new Date();
  const monthName = today.toLocaleString(undefined, { month: 'long' });
  const currentDay = today.getDate();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
  const calendarDays = Array.from({ length: firstDayOfMonth + daysInMonth }, (_, i) =>
    i < firstDayOfMonth ? null : i - firstDayOfMonth + 1
  );
  const calendarWeekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const calendarEvents = [
    { title: 'Payroll Deposit', time: '09:00 AM' },
    { title: 'Utility Bill', time: '02:00 PM' },
    { title: 'Project Payout', time: '06:00 PM' },
  ];

  const handleViewTaxDocument = (doc) => {
    const content = `Tax document: ${doc.label}\n\nThis is a preview placeholder for ${doc.label}.`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(value || 0);

  return (
    <div className="dashboard-page">
      <div className="dashboard-shell">
        <aside className="dashboard-sidebar">
          <div className="sidebar-branding">
            <div className="sidebar-logo">
              <span className="sidebar-logo-icon">SW</span>
            </div>
            <div>
              <strong>Smart Wallet</strong>
              <p>Smart Wallet Dashboard</p>
            </div>
          </div>

          <div className="sidebar-summary">
            <p>Available Balance</p>
            <strong>{formatCurrency(balance)}</strong>
          </div>

          <nav className="dashboard-nav">
            <button
              className={`dashboard-nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
              onClick={() => handleNavigation('Dashboard')}
            >
              <span className="nav-icon">📊</span>Dashboard
            </button>
            <button
              className={`dashboard-nav-item ${location.pathname === '/profile' ? 'active' : ''}`}
              onClick={() => handleNavigation('My Profile')}
            >
              <span className="nav-icon">👤</span>My Profile
            </button>
            <button
              className={`dashboard-nav-item ${location.pathname === '/bills' ? 'active' : ''}`}
              onClick={() => handleNavigation('My Pay')}
            >
              <span className="nav-icon">💰</span>My Pay
            </button>
            <button
              className={`dashboard-nav-item ${location.pathname === '/transactions' ? 'active' : ''}`}
              onClick={() => handleNavigation('My Transactions')}
            >
              <span className="nav-icon">📄</span>My Transactions
            </button>
            <button
              className={`dashboard-nav-item ${location.pathname === '/retirement' ? 'active' : ''}`}
              onClick={() => handleNavigation('My Retirement')}
            >
              <span className="nav-icon">🏦</span>My Retirement
            </button>
            <button
              className={`dashboard-nav-item ${location.pathname === '/help' ? 'active' : ''}`}
              onClick={() => handleNavigation('Help Center')}
            >
              <span className="nav-icon">❓</span>Help Center
            </button>
            <button
              className={`dashboard-nav-item ${location.pathname === '/notifications' ? 'active' : ''}`}
              onClick={() => handleNavigation('Notifications')}
            >
              <span className="nav-icon">🔔</span>Notifications
            </button>
          </nav>

          <div className="sidebar-footer">
            <p>Stay secure with one-click logout.</p>
            <button className="sidebar-cta" onClick={handleLogout}>Logout</button>
          </div>
        </aside>

        <main className="dashboard-main">
          {error && (
            <div className="error-banner">
              <span>⚠️ {error}</span>
              <button onClick={() => setError('')}>✕</button>
            </div>
          )}

          {successMsg && (
            <div className="success-popup-overlay">
              <div className="success-popup">
                <span>✅ {successMsg}</span>
                <button onClick={() => setSuccessMsg('')}>✕</button>
              </div>
            </div>
          )}

          <header className="dashboard-topbar">
            <div>
              <p className="eyebrow"></p>
              <h1>Smart Wallet Dashboard</h1>
              <p className="topbar-subtitle">A clean snapshot of your balance, activity, and payments.</p>
            </div>
            <div className="profile-chip">
              <span className="profile-avatar">
                <img
                  src={`https://i.pravatar.cc/80?u=${encodeURIComponent(userName || 'User')}`}
                  alt={`${userName || 'User'} avatar`}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </span>
              <div>
                <strong>{userName || 'User'}</strong>
                <small>Account Holder</small>
              </div>
            </div>
          </header>

          <section className="quick-actions-section">
            <h3>Quick Actions</h3>
            <div className="quick-actions-grid">
              <button className="action-btn action-add" onClick={() => handleAction('add')}>
                <span className="action-icon">💰</span>
                <div className="action-copy">
                  <span>Add Money</span>
                  <small>Top up your wallet instantly</small>
                </div>
              </button>
              <button className="action-btn action-withdraw" onClick={() => handleAction('withdraw')}>
                <span className="action-icon">⬇️</span>
                <div className="action-copy">
                  <span>Withdraw Money</span>
                  <small>Move funds to your bank</small>
                </div>
              </button>
              <button className="action-btn action-send" onClick={() => handleAction('transfer')}>
                <span className="action-icon">↗️</span>
                <div className="action-copy">
                  <span>Send Money</span>
                  <small>Fast transfer to contacts</small>
                </div>
              </button>
              <button className="action-btn action-request" onClick={() => handleAction('request')}>
                <span className="action-icon">📩</span>
                <div className="action-copy">
                  <span>Receive Money</span>
                  <small>Request payments easily</small>
                </div>
              </button>
              <button className="action-btn action-bills" onClick={() => handleAction('payBills')}>
                <span className="action-icon">📄</span>
                <div className="action-copy">
                  <span>Pay Bills</span>
                  <small>Settle bills in one tap</small>
                </div>
              </button>
              <button className="action-btn action-demand" onClick={() => handleAction('issueDemand')}>
                <span className="action-icon">📢</span>
                <div className="action-copy">
                  <span>Issue Demand</span>
                  <small>Send payment requests</small>
                </div>
              </button>
            </div>
          </section>

          <section className="summary-cards-section">
            <div className="summary-card positive">
              <div className="card-icon">₹</div>
              <div>
                <span>Total Balance</span>
                <strong>{formatCurrency(balance)}</strong>
              </div>
            </div>
            <div className="summary-card info">
              <div className="card-icon">⬆️</div>
              <div>
                <span>Monthly Savings</span>
                <strong>{formatCurrency(walletStats.income - walletStats.expense)}</strong>
              </div>
            </div>
            <div className="summary-card warning">
              <div className="card-icon">⏳</div>
              <div>
                <span>Upcoming Payments</span>
                <strong>{upcomingPayments.length}</strong>
              </div>
            </div>
            <div className="summary-card violet">
              <div className="card-icon">📩</div>
              <div>
                <span>Pending Requests</span>
                <strong>{walletStats.pendingRequests + walletStats.pendingDemands}</strong>
              </div>
            </div>
          </section>

          <section className="dashboard-overview-grid">
            <article className="overview-card project-card">
              <div className="overview-card-top project-card-header">
                <div>
                  <span>Projects</span>
                  <p className="project-subtitle">Track progress and manage your active goals.</p>
                </div>
                <strong>85</strong>
              </div>
              <div className="project-ring">
                <svg viewBox="0 0 120 120" className="project-ring-svg">
                  <circle className="ring-bg" cx="60" cy="60" r="52" />
                  <circle
                    className="ring-progress"
                    cx="60"
                    cy="60"
                    r="52"
                    strokeDasharray="326.7"
                    strokeDashoffset={projectStrokeOffset}
                  />
                  <text x="60" y="58" textAnchor="middle" className="ring-count">
                    {projectCompletion}%
                  </text>
                  <text x="60" y="76" textAnchor="middle" className="ring-label">
                    Completed
                  </text>
                </svg>
              </div>
              <div className="project-legend">
                <span className="legend-item complete">
                  <span className="legend-dot complete"></span>
                  {projectCompleted} Completed
                </span>
                <span className="legend-item in-progress">
                  <span className="legend-dot in-progress"></span>
                  {projectInProgress} In Progress
                </span>
              </div>
              <button className="primary-btn project-update-btn" onClick={handleUpdateProject}>
                Update project
              </button>
            </article>

            <article className="overview-card">
              <div className="overview-card-top">
                <span>Check Stubs</span>
                <strong>3 pending</strong>
              </div>
              <ul className="mini-list">
                <li>Nov 30</li>
                <li>Oct 30</li>
                <li>Sep 30</li>
              </ul>
              <button className="ghost-btn">View All</button>
            </article>

            <article className="overview-card highlight-card">
              <div className="overview-card-top">
                <span>Total Balance</span>
                <strong>View Details</strong>
              </div>
              <div className="balance-display">{formatCurrency(balance)}</div>
            </article>
          </section>

          <div className="dashboard-content-grid">
            <div className="dashboard-left-column">

              <section className="activity-card card activity-card-enhanced">
                <div className="card-header-row activity-header">
                  <div>
                    <h3>📊 Weekly Activity</h3>
                    <p>{chartView === 'hourly' ? 'Today’s hourly flows' : 'Last 7 days overview'}</p>
                  </div>
                  <div className="card-actions view-toggle">
                    <button
                      className={`chip ${chartView === 'hourly' ? 'active' : ''}`}
                      onClick={() => setChartView('hourly')}
                    >
                      ⏰ Per Hour
                    </button>
                    <button
                      className={`chip ${chartView === 'weekly' ? 'active' : ''}`}
                      onClick={() => setChartView('weekly')}
                    >
                      📅 Per Day
                    </button>
                  </div>
                </div>
                <div className="activity-metrics activity-metrics-enhanced">
                  <div className={`metric-card income-card ${walletStats.income ? 'has-data' : 'no-data'}`}>
                    <div className="metric-icon">💹</div>
                    <div className="metric-details">
                      <span className="metric-label">Total Income</span>
                      <strong className="metric-value">{formatCurrency(walletStats.income)}</strong>
                      <div className="metric-change positive">
                        <span className="change-icon">📈</span>
                        <span>+{walletStats.income ? ((walletStats.income / (walletStats.income + walletStats.expense)) * 100).toFixed(0) : 0}% vs last week</span>
                      </div>
                    </div>
                  </div>

                  <div className={`metric-card expense-card ${walletStats.expense ? 'has-data' : 'no-data'}`}>
                    <div className="metric-icon">💸</div>
                    <div className="metric-details">
                      <span className="metric-label">Total Expense</span>
                      <strong className="metric-value">{formatCurrency(walletStats.expense)}</strong>
                      <div className="metric-change negative">
                        <span className="change-icon">📉</span>
                        <span>-{walletStats.expense ? ((walletStats.expense / (walletStats.income + walletStats.expense)) * 100).toFixed(0) : 0}% vs last week</span>
                      </div>
                    </div>
                  </div>

                  <div className={`metric-card balance-card ${walletStats.income >= walletStats.expense ? 'positive-flow' : 'review-spending'}`}>
                    <div className="metric-icon">{walletStats.income >= walletStats.expense ? '✅' : '⚠️'}</div>
                    <div className="metric-details">
                      <span className="metric-label">Net Flow</span>
                      <strong className="metric-value">{formatCurrency(walletStats.income - walletStats.expense)}</strong>
                      <div className={`metric-status ${walletStats.income >= walletStats.expense ? 'success' : 'warning'}`}>
                        <span>{walletStats.income >= walletStats.expense ? '✨ Positive cash flow' : '⚡ Review spending'}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="chart-frame chart-frame-enhanced">
                  {chartData.length ? (
                    <>
                      <div className="chart-legend-top">
                        <div className="legend-item">
                          <span className="legend-dot" style={{ background: '#2563eb' }}></span>
                          <span>Incoming</span>
                        </div>
                        <div className="legend-item">
                          <span className="legend-dot" style={{ background: '#f97316' }}></span>
                          <span>Outgoing</span>
                        </div>
                      </div>
                      <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 10 }}>
                          <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" vertical={false} />
                          <XAxis dataKey="date" tickLine={false} axisLine={false} style={{ fontSize: '0.85rem' }} />
                          <YAxis tickLine={false} axisLine={false} style={{ fontSize: '0.85rem' }} />
                          <Tooltip 
                            formatter={(value) => formatCurrency(value)} 
                            cursor={{ stroke: '#2563eb', strokeWidth: 2, opacity: 0.3 }}
                            contentStyle={{
                              background: 'rgba(255, 255, 255, 0.95)',
                              border: '1px solid rgba(37, 99, 235, 0.2)',
                              borderRadius: '0.75rem',
                              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)'
                            }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="incoming" 
                            stroke="#2563eb" 
                            strokeWidth={3} 
                            dot={{ r: 5, fill: '#2563eb' }} 
                            activeDot={{ r: 7, fill: '#1d49d8' }}
                            isAnimationActive={true}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="outgoing" 
                            stroke="#f97316" 
                            strokeWidth={3} 
                            dot={{ r: 5, fill: '#f97316' }} 
                            activeDot={{ r: 7, fill: '#ea580c' }}
                            isAnimationActive={true}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </>
                  ) : (
                    <div className="chart-placeholder empty-chart">
                      <div className="placeholder-icon">📊</div>
                      <p>No activity data available yet</p>
                      <small>Start making transactions to see your activity chart</small>
                    </div>
                  )}
                </div>

                <section className="card-preview-card">
                  <div className="credit-card-view">
                    <div className="credit-card-top-row">
                      <div className="card-chip" />
                      <div className="card-contactless" />
                    </div>
                    <div className="credit-card-bank">Bank Name</div>
                    <div className="credit-card-number">5412 7512 3412 3456</div>
                    <div className="credit-card-details-row">
                      <div className="credit-card-detail">
                        <span>VALID THRU</span>
                        <strong>12/23</strong>
                      </div>
                      <div className="credit-card-detail">
                        <span>CARD HOLDER</span>
                        <strong>{userName || 'M. Molina'}</strong>
                      </div>
                    </div>
                    <div className="credit-card-brand-row">
                      <span>VISA</span>
                    </div>
                  </div>
                </section>
              </section>

              <section className="transaction-card card">
                <div className="card-header-row">
                  <div>
                    <h3>Recent transactions</h3>
                    <p>{transactions.length} total transactions</p>
                  </div>
                  <button className="secondary" onClick={() => handleNavigation('My Transactions')}>View All</button>
                </div>
                <div className="transaction-list">
                  {recentTransactions.length > 0 ? (
                    recentTransactions.map((tx) => (
                      <div className="transaction-row" key={tx._id || tx.id || `${tx.date}-${tx.type}`}>
                        <div>
                          <p>{tx.type}</p>
                          <span>{new Date(tx.date).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <strong>{formatCurrency(tx.amount)}</strong>
                          <span>{tx.description || 'No description'}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">No transactions available yet.</div>
                  )}
                </div>
              </section>
            </div>

            <section className="right-panel">
              <div className="insight-panel card">
                <div className="card-header-row">
                  <div>
                    <h3>💡 Smart insights</h3>
                    <p>AI-powered wallet health & recommendations</p>
                  </div>
                </div>
                <div className="insight-list">
                  <div className={`insight-item insight-status ${balance >= 1000 ? 'healthy' : 'warning'}`}>
                    <div className="insight-icon">
                      {balance >= 1000 ? '✅' : '⚠️'}
                    </div>
                    <div className="insight-content">
                      <span className="insight-label">Wallet Health</span>
                      <strong>{balance >= 1000 ? '💪 Healthy' : '📊 Needs Review'}</strong>
                      <small>{balance >= 1000 ? 'Great balance maintained' : 'Consider adding funds'}</small>
                    </div>
                  </div>

                  <div className={`insight-item insight-spending ${walletStats.income > walletStats.expense ? 'positive' : 'concern'}`}>
                    <div className="insight-icon">
                      {walletStats.income > walletStats.expense ? '📈' : '📉'}
                    </div>
                    <div className="insight-content">
                      <span className="insight-label">Spend Trend</span>
                      <strong>{walletStats.income > walletStats.expense ? '📈 Saving' : '📉 Spending'}</strong>
                      <small>{walletStats.income > walletStats.expense ? `+${((walletStats.income - walletStats.expense) / balance * 100).toFixed(1)}% monthly` : 'Expenses exceed income'}</small>
                    </div>
                  </div>

                  <div className="insight-item insight-pending">
                    <div className="insight-icon">
                      {walletStats.pendingRequests + walletStats.pendingDemands > 0 ? '🔔' : '✨'}
                    </div>
                    <div className="insight-content">
                      <span className="insight-label">Pending Actions</span>
                      <strong>{walletStats.pendingRequests + walletStats.pendingDemands > 0 ? `⏳ ${walletStats.pendingRequests + walletStats.pendingDemands} requests` : '✨ All clear'}</strong>
                      <small>{walletStats.pendingRequests + walletStats.pendingDemands > 0 ? 'Immediate attention needed' : 'No pending transactions'}</small>
                    </div>
                  </div>

                  <div className="insight-item insight-bill">
                    <div className="insight-icon">
                      🗓️
                    </div>
                    <div className="insight-content">
                      <span className="insight-label">Next Payment</span>
                      <strong>{upcomingPayments[0]?.title || 'No upcoming'}</strong>
                      <small>{upcomingPayments[0] ? `Due: ${upcomingPayments[0].due}` : 'Schedule a payment'}</small>
                    </div>
                  </div>

                  <div className="insight-recommendation">
                    <div className="recommendation-icon">💡</div>
                    <div>
                      <span className="recommendation-title">Pro tip</span>
                      <p>
                        {balance >= 1000 && walletStats.income > walletStats.expense
                          ? '🎯 Keep up the momentum! Your savings are growing consistently.'
                          : balance < 1000
                          ? '💰 Consider setting up auto-deposits to maintain healthy balance.'
                          : '🔍 Review your spending patterns to optimize your budget.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="schedule-card card">
                <div className="card-header-row">
                  <div>
                    <h3>Project meetings</h3>
                    <p>Today’s schedule</p>
                  </div>
                </div>
                <div className="meeting-badge">
                  <strong>02:00 - 03:00 PM</strong>
                  <span>Product meeting</span>
                </div>
                <div className="meeting-members">
                  <span>👤</span>
                  <span>👤</span>
                  <span>👤</span>
                  <span>+4</span>
                </div>
              </div>

              <section className="bills-payment-card card">
                <div className="card-header-row">
                  <div>
                    <h3>Pay Bills</h3>
                    <p>Quick payment access</p>
                  </div>
                </div>
                <div className="bills-grid">
                  <button className="bill-item" onClick={() => handleSpecificBill('Electricity')}>
                    <span className="bill-icon">⚡</span>
                    <span>Electricity</span>
                  </button>
                  <button className="bill-item" onClick={() => handleSpecificBill('Water')}>
                    <span className="bill-icon">💧</span>
                    <span>Water</span>
                  </button>
                  <button className="bill-item" onClick={() => handleSpecificBill('Internet')}>
                    <span className="bill-icon">📡</span>
                    <span>Internet</span>
                  </button>
                  <button className="bill-item" onClick={() => handleSpecificBill('Mobile')}>
                    <span className="bill-icon">📱</span>
                    <span>Mobile</span>
                  </button>
                  <button className="bill-item" onClick={() => handleSpecificBill('Gas')}>
                    <span className="bill-icon">🔥</span>
                    <span>Gas</span>
                  </button>
                </div>
              </section>

              <section className="upcoming-payments-card card">
                <div className="card-header-row">
                  <div>
                    <h3>Upcoming Payments</h3>
                    <p>Scheduled transactions</p>
                  </div>
                  <button className="secondary small" onClick={() => handleAction('addUpcomingPayment')}>
                    Add Payment
                  </button>
                </div>
                <div className="upcoming-list">
                  {upcomingPayments.map((payment) => (
                    <div className="upcoming-item" key={payment._id}>
                      <div>
                        <strong>{payment.title}</strong>
                        <p>Due: {new Date(payment.due).toLocaleDateString()}</p>
                      </div>
                      <div className="upcoming-item-actions">
                        <span className="amount">₹{payment.amount.toLocaleString('en-IN')}</span>
                        <button className="ghost-btn small" onClick={() => handleUpdatePayment(payment._id)}>
                          Update
                        </button>
                        <button className="danger-btn small" onClick={() => handleDeletePayment(payment._id)}>
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="tax-card card">
                <div className="card-header-row">
                  <div>
                    <h3>Tax documents</h3>
                    <p>Latest reports</p>
                  </div>
                </div>
                <div className="tax-list">
                  {taxDocuments.map((doc) => (
                    <div className="tax-item" key={doc.label}>
                      <div>
                        <strong>{doc.label}</strong>
                        <span>PDF</span>
                      </div>
                      <button className="ghost-btn small" onClick={() => handleViewTaxDocument(doc)}>
                        View
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              <section className="calendar-card card">
                <div className="calendar-header">
                  <div>
                    <strong>Calendar</strong>
                    <span>{monthName}</span>
                  </div>
                  <div className="calendar-today">
                    <span>Today</span>
                    <strong>{currentDay}</strong>
                  </div>
                </div>
                <div className="calendar-weekdays">
                  {calendarWeekdays.map((day) => (
                    <div key={day} className="calendar-weekday">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="calendar-grid">
                  {calendarDays.map((day, index) => (
                    <div
                      key={`${day ?? 'empty'}-${index}`}
                      className={`calendar-day ${day === currentDay ? 'today' : ''} ${day === null ? 'empty' : ''}`}
                    >
                      {day || ''}
                    </div>
                  ))}
                </div>
                <div className="calendar-events">
                  {calendarEvents.map((event) => (
                    <div className="calendar-event" key={event.title}>
                      <div>
                        <strong>{event.title}</strong>
                        <p>{event.time}</p>
                      </div>
                      <span className="event-dot"></span>
                    </div>
                  ))}
                </div>
              </section>
            </section>
          </div>
        </main>
      </div>

      {actionModal.visible && (
        <div className="modal-overlay" onClick={closeActionModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{actionModal.title}</h3>
              <button className="modal-close" onClick={closeActionModal}>×</button>
            </div>
            <form onSubmit={handleModalSubmit} className="modal-form">
              {actionModal.type === 'transfer' && (
                <input
                  type="email"
                  name="recipient"
                  value={formData.recipient}
                  onChange={handleInputChange}
                  placeholder="Recipient email"
                  required
                />
              )}
              {actionModal.type === 'request' && (
                <input
                  type="email"
                  name="requester"
                  value={formData.requester}
                  onChange={handleInputChange}
                  placeholder="Requester email"
                  required
                />
              )}
              {actionModal.type === 'payBills' && !actionModal.readOnlyBiller && (
                <input
                  type="text"
                  name="biller"
                  value={formData.biller}
                  onChange={handleInputChange}
                  placeholder="Biller name"
                  required
                />
              )}
              {actionModal.type === 'issueDemand' && (
                <input
                  type="email"
                  name="recipient"
                  value={formData.recipient}
                  onChange={handleInputChange}
                  placeholder="Recipient email"
                  required
                />
              )}
              {actionModal.type === 'updatePayment' && (
                <>
                  <input
                    type="text"
                    name="biller"
                    value={formData.biller}
                    readOnly
                    placeholder="Biller name"
                  />
                  <input
                    type="date"
                    name="due"
                    value={formData.due}
                    onChange={handleInputChange}
                    required
                  />
                </>
              )}
              {actionModal.type === 'addUpcomingPayment' && (
                <>
                  <input
                    type="text"
                    name="biller"
                    value={formData.biller}
                    onChange={handleInputChange}
                    placeholder="Payment Title"
                    required
                  />
                  <input
                    type="date"
                    name="due"
                    value={formData.due}
                    onChange={handleInputChange}
                    required
                  />
                </>
              )}
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="Amount"
                step="0.01"
                required
              />
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Description (optional)"
              />
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={closeActionModal}>Cancel</button>
                <button type="submit" className="submit-btn">{actionModal.actionLabel}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
