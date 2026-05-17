import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import '../App.css';

const Retirement = () => {
  const [retirementData, setRetirementData] = useState({
    currentAge: 30,
    retirementAge: 60,
    currentSavings: 0,
    monthlySavings: 5000,
    expectedReturn: 8, // Annual percentage
  });

  const [projections, setProjections] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(retirementData);
  const [userBalance, setUserBalance] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUserBalance();
    calculateProjections();
  }, []);

  useEffect(() => {
    calculateProjections();
  }, [retirementData]);

  const fetchUserBalance = async () => {
    try {
      const response = await api.get('/wallet/balance');
      setUserBalance(response.data.balance);
      setRetirementData(prev => ({
        ...prev,
        currentSavings: response.data.balance,
      }));
      setFormData(prev => ({
        ...prev,
        currentSavings: response.data.balance,
      }));
    } catch (err) {
      console.error('Failed to fetch balance', err);
    }
  };

  const calculateProjections = () => {
    const yearsToRetirement = Math.max(0, retirementData.retirementAge - retirementData.currentAge);
    const monthlyReturn = retirementData.expectedReturn / 100 / 12;
    const months = yearsToRetirement * 12;

    // Future value of current savings
    const fvCurrentSavings = retirementData.currentSavings * Math.pow(1 + monthlyReturn, months);

    // Future value of monthly contributions (Future Value of Annuity)
    const fvMonthlySavings = retirementData.monthlySavings * 
      (Math.pow(1 + monthlyReturn, months) - 1) / monthlyReturn;

    const totalRetirement = fvCurrentSavings + fvMonthlySavings;
    const totalContributions = retirementData.currentSavings + 
      (retirementData.monthlySavings * months);
    const totalInterest = totalRetirement - totalContributions;

    setProjections({
      yearsToRetirement,
      months,
      projectedAmount: totalRetirement,
      totalContributions,
      totalInterest,
      monthlyInvestmentNeeded: months > 0 ? totalRetirement / months : 0,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0,
    }));
  };

  const handleSave = () => {
    if (formData.currentAge >= formData.retirementAge) {
      alert('Retirement age must be greater than current age');
      return;
    }
    setRetirementData(formData);
    setEditMode(false);
  };

  const handleCancel = () => {
    setFormData(retirementData);
    setEditMode(false);
  };

  const progressPercentage = (
    ((retirementData.currentAge - retirementData.currentAge + retirementData.currentAge) * 100) /
    (retirementData.retirementAge - Math.max(20, retirementData.currentAge - 30))
  );

  const savingsProgressPercentage = projections ? 
    Math.min(100, (userBalance / Math.max(projections.projectedAmount, userBalance || 1)) * 100) : 0;

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '30px', color: '#333' }}>Retirement Planning</h1>

        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          {/* Current Savings Card */}
          <div style={{
            backgroundColor: '#fff',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}>
            <p style={{ color: '#777', fontSize: '14px', margin: '0 0 8px 0' }}>Current Savings</p>
            <h3 style={{ color: '#4CAF50', fontSize: '24px', margin: '0 0 15px 0' }}>
              ₹{userBalance?.toFixed(0) || '0'}
            </h3>
            <div style={{
              width: '100%',
              height: '8px',
              backgroundColor: '#eee',
              borderRadius: '4px',
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${savingsProgressPercentage}%`,
                height: '100%',
                backgroundColor: '#4CAF50',
              }}></div>
            </div>
            <p style={{ color: '#999', fontSize: '12px', margin: '8px 0 0 0' }}>
              {savingsProgressPercentage.toFixed(1)}% of target
            </p>
          </div>

          {/* Projected Amount Card */}
          {projections && (
            <div style={{
              backgroundColor: '#fff',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}>
              <p style={{ color: '#777', fontSize: '14px', margin: '0 0 8px 0' }}>Projected Amount</p>
              <h3 style={{ color: '#2196F3', fontSize: '24px', margin: '0 0 15px 0' }}>
                ₹{projections.projectedAmount?.toFixed(0) || '0'}
              </h3>
              <div style={{ fontSize: '12px', color: '#999' }}>
                <p style={{ margin: '4px 0' }}>by age {retirementData.retirementAge}</p>
              </div>
            </div>
          )}

          {/* Time to Retirement Card */}
          {projections && (
            <div style={{
              backgroundColor: '#fff',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}>
              <p style={{ color: '#777', fontSize: '14px', margin: '0 0 8px 0' }}>Time to Retirement</p>
              <h3 style={{ color: '#FF9800', fontSize: '24px', margin: '0 0 15px 0' }}>
                {projections.yearsToRetirement} years
              </h3>
              <div style={{ fontSize: '12px', color: '#999' }}>
                <p style={{ margin: '4px 0' }}>({projections.months} months)</p>
              </div>
            </div>
          )}
        </div>

        {/* Detailed Projections */}
        {projections && !editMode && (
          <div style={{
            backgroundColor: '#fff',
            padding: '25px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            marginBottom: '30px',
          }}>
            <h3 style={{ marginBottom: '20px', color: '#333' }}>Retirement Plan Details</h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '25px' }}>
              <div>
                <p style={{ color: '#777', fontSize: '14px', margin: '0 0 8px 0' }}>Your Current Age</p>
                <p style={{ color: '#333', fontSize: '18px', fontWeight: '600', margin: 0 }}>
                  {retirementData.currentAge} years
                </p>
              </div>

              <div>
                <p style={{ color: '#777', fontSize: '14px', margin: '0 0 8px 0' }}>Retirement Age</p>
                <p style={{ color: '#333', fontSize: '18px', fontWeight: '600', margin: 0 }}>
                  {retirementData.retirementAge} years
                </p>
              </div>

              <div>
                <p style={{ color: '#777', fontSize: '14px', margin: '0 0 8px 0' }}>Monthly Savings</p>
                <p style={{ color: '#333', fontSize: '18px', fontWeight: '600', margin: 0 }}>
                  ₹{retirementData.monthlySavings?.toFixed(0)}
                </p>
              </div>

              <div>
                <p style={{ color: '#777', fontSize: '14px', margin: '0 0 8px 0' }}>Expected Annual Return</p>
                <p style={{ color: '#333', fontSize: '18px', fontWeight: '600', margin: 0 }}>
                  {retirementData.expectedReturn}%
                </p>
              </div>
            </div>

            <div style={{ 
              backgroundColor: '#f9f9f9', 
              padding: '20px', 
              borderRadius: '6px',
              marginBottom: '20px',
            }}>
              <h4 style={{ marginTop: 0, color: '#333' }}>Projection Breakdown</h4>
              
              <div style={{ marginBottom: '15px' }}>
                <p style={{ color: '#777', fontSize: '14px', margin: '0 0 5px 0' }}>Total Contributions</p>
                <p style={{ color: '#4CAF50', fontSize: '18px', fontWeight: '600', margin: 0 }}>
                  ₹{projections.totalContributions?.toFixed(0)}
                </p>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <p style={{ color: '#777', fontSize: '14px', margin: '0 0 5px 0' }}>Investment Returns</p>
                <p style={{ color: '#2196F3', fontSize: '18px', fontWeight: '600', margin: 0 }}>
                  ₹{projections.totalInterest?.toFixed(0)}
                </p>
              </div>

              <div style={{ 
                borderTop: '2px solid #ddd', 
                paddingTop: '15px',
              }}>
                <p style={{ color: '#777', fontSize: '14px', margin: '0 0 5px 0' }}>Total at Retirement</p>
                <p style={{ color: '#FF9800', fontSize: '22px', fontWeight: '700', margin: 0 }}>
                  ₹{projections.projectedAmount?.toFixed(0)}
                </p>
              </div>
            </div>

            <button
              onClick={() => setEditMode(true)}
              style={{
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
              }}
            >
              Edit Plan
            </button>
          </div>
        )}

        {/* Edit Mode */}
        {editMode && (
          <div style={{
            backgroundColor: '#fff',
            padding: '25px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            marginBottom: '30px',
          }}>
            <h3 style={{ marginBottom: '20px', color: '#333' }}>Edit Retirement Plan</h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '25px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '8px', color: '#555' }}>
                  Current Age
                </label>
                <input
                  type="number"
                  name="currentAge"
                  min="18"
                  max="100"
                  value={formData.currentAge}
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

              <div>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '8px', color: '#555' }}>
                  Target Retirement Age
                </label>
                <input
                  type="number"
                  name="retirementAge"
                  min="30"
                  max="100"
                  value={formData.retirementAge}
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

              <div>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '8px', color: '#555' }}>
                  Monthly Savings (₹)
                </label>
                <input
                  type="number"
                  name="monthlySavings"
                  min="0"
                  step="100"
                  value={formData.monthlySavings}
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

              <div>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '8px', color: '#555' }}>
                  Expected Annual Return (%)
                </label>
                <input
                  type="number"
                  name="expectedReturn"
                  min="0"
                  max="20"
                  step="0.5"
                  value={formData.expectedReturn}
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
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleSave}
                disabled={loading}
                style={{
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {loading ? 'Saving...' : 'Save Plan'}
              </button>
              <button
                onClick={handleCancel}
                style={{
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Tips Section */}
        <div style={{
          backgroundColor: '#E3F2FD',
          padding: '20px',
          borderRadius: '8px',
          borderLeft: '4px solid #2196F3',
        }}>
          <h4 style={{ marginTop: 0, color: '#1976D2' }}>💡 Retirement Planning Tips</h4>
          <ul style={{ color: '#555', margin: '10px 0 0 0', paddingLeft: '20px' }}>
            <li>Start saving early to benefit from compound interest</li>
            <li>Review and adjust your plan annually</li>
            <li>Consider inflation when planning your retirement corpus</li>
            <li>Diversify investments for better returns</li>
            <li>Keep emergency funds separate from retirement savings</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Retirement;
