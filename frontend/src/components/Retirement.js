import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const Retirement = () => {
  const [retirementData, setRetirementData] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingGoal, setEditingGoal] = useState(null);
  const [editingAge, setEditingAge] = useState(false);
  const [formData, setFormData] = useState({
    targetAmount: '',
    retirementAge: 65,
    currentAge: 35,
    currentSavings: '',
    monthlyContribution: '',
    expectedReturn: 7,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadRetirementData = async () => {
      try {
        const res = await api.get('/auth/me');
        setRetirementData({
          balance: res.data.balance || 0,
          name: res.data.name || 'User',
          targetAmount: 5000000,
          retirementAge: 65,
          currentAge: 35,
          monthlyContribution: 10000,
          expectedReturn: 7,
        });
        setFormData({
          targetAmount: 5000000,
          retirementAge: 65,
          currentSavings: res.data.balance || 0,
          monthlyContribution: 10000,
          expectedReturn: 7,
        });
      } catch (err) {
        setError('Unable to load retirement data.');
      }
    };

    loadRetirementData();
  }, []);

  const formatCurrency = (value) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value || 0);

  const calculateProjection = () => {
    const principal = parseFloat(formData.currentSavings) || 0;
    const monthly = parseFloat(formData.monthlyContribution) || 0;
    const rate = parseFloat(formData.expectedReturn) / 100 / 12;
    const months = (formData.retirementAge - 35) * 12;

    let futureValue = principal * Math.pow(1 + rate, months);
    for (let i = 0; i < months; i++) {
      futureValue += monthly * Math.pow(1 + rate, months - i);
    }

    return futureValue;
  };

  const projectedAmount = calculateProjection();
  const target = parseFloat(formData.targetAmount) || 5000000;
  const progressPercentage = Math.min((projectedAmount / target) * 100, 100);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'retirementAge' ? parseInt(value) : value,
    });
  };

  const handleSaveGoal = () => {
    setLoading(true);
    setTimeout(() => {
      setSuccess('Retirement goal updated successfully!');
      setEditingGoal(null);
      setLoading(false);
      setTimeout(() => setSuccess(''), 3000);
    }, 500);
  };

  if (!retirementData) {
    return (
      <div className="placeholder-page">
        <div className="placeholder-card">
          <h2>⏳ Loading...</h2>
          <p>Please wait while we fetch your retirement data.</p>
        </div>
      </div>
    );
  }

  const yearsToRetirement = formData.retirementAge - formData.currentAge;

  return (
    <div className="retirement-page">
      {/* Header Section */}
      <div className="retirement-header">
        <div>
          <p className="eyebrow">Retirement Planning</p>
          <h1>Plan Your Future</h1>
          <p>
            Build your ideal retirement with our planning tools, savings projections, and investment strategies.
          </p>
        </div>
        <div className="retirement-hero-card">
          <div className="retirement-hero-info">
            <div className="info-item">
              <span className="label">Current Age</span>
              {editingGoal === 'age' ? (
                <input
                  type="number"
                  name="currentAge"
                  value={formData.currentAge}
                  onChange={handleInputChange}
                  min="18"
                  max="80"
                  className="age-input"
                  onBlur={() => setEditingGoal(null)}
                  autoFocus
                />
              ) : (
                <span className="value" onClick={() => setEditingGoal('age')} style={{ cursor: 'pointer' }}>
                  {formData.currentAge} ✏️
                </span>
              )}
            </div>
            <div className="divider"></div>
            <div className="info-item">
              <span className="label">Retirement Age</span>
              <span className="value">{retirementData.retirementAge}</span>
            </div>
            <div className="divider"></div>
            <div className="info-item">
              <span className="label">Years Left</span>
              <span className="value highlight">{yearsToRetirement}</span>
            </div>
          </div>
        </div>
      </div>

      {error && <div className="error-banner">⚠️ {error}</div>}
      {success && <div className="success-banner">✓ {success}</div>}

      {/* Main Grid */}
      <div className="retirement-grid">
        {/* Savings Progress */}
        <section className="page-card retirement-card">
          <h3>💰 Savings Progress</h3>
          <div className="progress-section">
            <div className="progress-item">
              <div className="progress-label">
                <span>Current Savings</span>
                <span className="amount">{formatCurrency(projectedAmount)}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progressPercentage}%` }}></div>
              </div>
              <div className="progress-footer">
                <span>Target: {formatCurrency(target)}</span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
            </div>
          </div>

          <div className="savings-stats">
            <div className="stat">
              <span className="stat-label">Monthly Contribution</span>
              <span className="stat-value">{formatCurrency(formData.monthlyContribution)}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Projected Return</span>
              <span className="stat-value">{formData.expectedReturn}%</span>
            </div>
            <div className="stat">
              <span className="stat-label">Years to Save</span>
              <span className="stat-value">{yearsToRetirement}</span>
            </div>
          </div>
        </section>

        {/* Goal Settings */}
        <section className="page-card retirement-card">
          <div className="section-header">
            <h3>🎯 Retirement Goal</h3>
            {editingGoal !== 'goal' && (
              <button className="link-btn" onClick={() => setEditingGoal('goal')}>
                ✏️ Edit
              </button>
            )}
          </div>

          {editingGoal === 'goal' ? (
            <div className="edit-form">
              <div className="form-group">
                <label>Target Amount (₹)</label>
                <input
                  type="number"
                  name="targetAmount"
                  value={formData.targetAmount}
                  onChange={handleInputChange}
                  placeholder="Enter target amount"
                />
              </div>
              <div className="form-group">
                <label>Retirement Age</label>
                <input
                  type="number"
                  name="retirementAge"
                  value={formData.retirementAge}
                  onChange={handleInputChange}
                  min="40"
                  max="80"
                />
              </div>
              <div className="form-group">
                <label>Monthly Contribution (₹)</label>
                <input
                  type="number"
                  name="monthlyContribution"
                  value={formData.monthlyContribution}
                  onChange={handleInputChange}
                  placeholder="Enter monthly contribution"
                />
              </div>
              <div className="button-group">
                <button className="primary-btn" onClick={handleSaveGoal} disabled={loading}>
                  {loading ? '⏳ Saving...' : '✓ Save Goal'}
                </button>
                <button className="secondary-btn" onClick={() => setEditingGoal(null)}>
                  ✕ Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="goal-details">
              <div className="goal-item">
                <span className="label">Retirement Goal</span>
                <span className="value">{formatCurrency(target)}</span>
              </div>
              <div className="goal-item">
                <span className="label">Planned Retirement Age</span>
                <span className="value">{retirementData.retirementAge}</span>
              </div>
              <div className="goal-item">
                <span className="label">Time Frame</span>
                <span className="value">{yearsToRetirement} years</span>
              </div>
              <div className="goal-item">
                <span className="label">Shortfall / Surplus</span>
                <span className={`value ${projectedAmount >= target ? 'positive' : 'negative'}`}>
                  {projectedAmount >= target ? '+' : ''}
                  {formatCurrency(projectedAmount - target)}
                </span>
              </div>
            </div>
          )}
        </section>

        {/* Investment Strategy */}
        <section className="page-card retirement-card">
          <h3>📊 Investment Allocation</h3>
          <div className="allocation-grid">
            <div className="allocation-item">
              <div className="allocation-header">
                <span className="allocation-name">🏦 Fixed Income</span>
                <span className="allocation-percent">40%</span>
              </div>
              <div className="allocation-bar">
                <div className="allocation-fill" style={{ width: '40%', backgroundColor: '#06b6d4' }}></div>
              </div>
            </div>
            <div className="allocation-item">
              <div className="allocation-header">
                <span className="allocation-name">📈 Equity</span>
                <span className="allocation-percent">35%</span>
              </div>
              <div className="allocation-bar">
                <div className="allocation-fill" style={{ width: '35%', backgroundColor: '#10b981' }}></div>
              </div>
            </div>
            <div className="allocation-item">
              <div className="allocation-header">
                <span className="allocation-name">🏘️ Real Estate</span>
                <span className="allocation-percent">15%</span>
              </div>
              <div className="allocation-bar">
                <div className="allocation-fill" style={{ width: '15%', backgroundColor: '#f59e0b' }}></div>
              </div>
            </div>
            <div className="allocation-item">
              <div className="allocation-header">
                <span className="allocation-name">💎 Gold</span>
                <span className="allocation-percent">10%</span>
              </div>
              <div className="allocation-bar">
                <div className="allocation-fill" style={{ width: '10%', backgroundColor: '#fbbf24' }}></div>
              </div>
            </div>
          </div>
          <button className="primary-btn" style={{ marginTop: '1.5rem', width: '100%' }}>
            📋 Adjust Allocation
          </button>
        </section>

        {/* Annual Contribution Plan */}
        <section className="page-card retirement-card">
          <h3>📅 Annual Contribution Plan</h3>
          <div className="contribution-timeline">
            {[
              { year: 'Year 1', amount: formData.monthlyContribution * 12 },
              { year: 'Year 2', amount: formData.monthlyContribution * 12 * 1.05 },
              { year: 'Year 3', amount: formData.monthlyContribution * 12 * 1.1 },
              { year: 'Year 5+', amount: formData.monthlyContribution * 12 * 1.15 },
            ].map((item, idx) => (
              <div key={idx} className="timeline-item">
                <span className="timeline-year">{item.year}</span>
                <div className="timeline-bar">
                  <div
                    className="timeline-fill"
                    style={{ width: `${(item.amount / (formData.monthlyContribution * 12 * 1.2)) * 100}%` }}
                  ></div>
                </div>
                <span className="timeline-amount">{formatCurrency(item.amount)}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Retirement Calculator */}
        <section className="page-card retirement-card">
          <h3>🧮 Monthly Budget in Retirement</h3>
          <div className="budget-breakdown">
            <div className="budget-item">
              <div className="budget-header">
                <span className="budget-label">🏠 Housing</span>
              </div>
              <div className="budget-amount">₹{(target * 0.3 / (yearsToRetirement * 12)).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
            </div>
            <div className="budget-item">
              <div className="budget-header">
                <span className="budget-label">🍽️ Food & Groceries</span>
              </div>
              <div className="budget-amount">₹{(target * 0.15 / (yearsToRetirement * 12)).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
            </div>
            <div className="budget-item">
              <div className="budget-header">
                <span className="budget-label">🏥 Healthcare</span>
              </div>
              <div className="budget-amount">₹{(target * 0.2 / (yearsToRetirement * 12)).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
            </div>
            <div className="budget-item">
              <div className="budget-header">
                <span className="budget-label">🎯 Leisure & Travel</span>
              </div>
              <div className="budget-amount">₹{(target * 0.2 / (yearsToRetirement * 12)).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
            </div>
            <div className="budget-item highlight">
              <div className="budget-header">
                <span className="budget-label">💳 Total Monthly</span>
              </div>
              <div className="budget-amount">{formatCurrency((target / (yearsToRetirement * 12)))}</div>
            </div>
          </div>
        </section>

        {/* Quick Tips */}
        <section className="page-card retirement-card tips-card">
          <h3>💡 Retirement Tips</h3>
          <ul className="tips-list">
            <li>
              <span className="tip-icon">✓</span>
              <span>Start saving early to maximize compound growth</span>
            </li>
            <li>
              <span className="tip-icon">✓</span>
              <span>Diversify your investments across asset classes</span>
            </li>
            <li>
              <span className="tip-icon">✓</span>
              <span>Review and rebalance your portfolio annually</span>
            </li>
            <li>
              <span className="tip-icon">✓</span>
              <span>Consider inflation in your retirement planning</span>
            </li>
            <li>
              <span className="tip-icon">✓</span>
              <span>Keep emergency fund separate from retirement savings</span>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default Retirement;
