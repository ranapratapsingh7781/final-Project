import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import '../App.css';

const Retirement = () => {
  const [retirementData, setRetirementData] = useState({
    currentAge: 30,
    retirementAge: 60,
    currentSavings: 0,
    monthlySavings: 5000,
    expectedReturn: 8,
  });

  const [projections, setProjections] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(retirementData);
  const [userBalance, setUserBalance] = useState(0);

  const calculateProjections = useCallback(() => {
    const yearsToRetirement = Math.max(0, retirementData.retirementAge - retirementData.currentAge);
    const monthlyReturn = retirementData.expectedReturn / 100 / 12;
    const months = yearsToRetirement * 12;

    const fvCurrentSavings = retirementData.currentSavings * Math.pow(1 + monthlyReturn, months || 0);
    const fvMonthlySavings = months > 0 ? retirementData.monthlySavings * (Math.pow(1 + monthlyReturn, months) - 1) / (monthlyReturn || 1) : 0;

    const totalRetirement = fvCurrentSavings + fvMonthlySavings;
    const totalContributions = retirementData.currentSavings + (retirementData.monthlySavings * months);
    const totalInterest = totalRetirement - totalContributions;

    setProjections({ yearsToRetirement, months, projectedAmount: totalRetirement, totalContributions, totalInterest });
  }, [retirementData]);

  useEffect(() => {
    const init = async () => {
      try {
        const res = await api.get('/wallet/balance');
        setUserBalance(res.data.balance);
        setRetirementData(prev => ({ ...prev, currentSavings: res.data.balance }));
        setFormData(prev => ({ ...prev, currentSavings: res.data.balance }));
      } catch (e) {
        console.error(e);
      } finally {
        calculateProjections();
      }
    };
    init();
  }, [calculateProjections]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const handleSave = () => {
    if (formData.currentAge >= formData.retirementAge) return alert('Retirement age must be greater than current age');
    setRetirementData(formData);
    setEditMode(false);
    calculateProjections();
  };

  const savingsProgressPercentage = projections ? Math.min(100, (userBalance / Math.max(projections.projectedAmount, 1)) * 100) : 0;

  return (
    <div style={{ padding: 20, minHeight: '100vh', background: '#f5f5f5' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <h1>Retirement Planning</h1>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16 }}>
          <div style={{ background: '#fff', padding: 16, borderRadius: 8 }}>
            <p>Current Savings</p>
            <h3>₹{userBalance?.toFixed(0) || '0'}</h3>
            <div style={{ height: 8, background: '#eee', borderRadius: 6, overflow: 'hidden' }}>
              <div style={{ width: `${savingsProgressPercentage}%`, height: '100%', background: '#4CAF50' }} />
            </div>
          </div>

          {projections && (
            <>
              <div style={{ background: '#fff', padding: 16, borderRadius: 8 }}>
                <p>Projected Amount</p>
                <h3>₹{projections.projectedAmount?.toFixed(0)}</h3>
                <p>by age {retirementData.retirementAge}</p>
              </div>

              <div style={{ background: '#fff', padding: 16, borderRadius: 8 }}>
                <p>Time to Retirement</p>
                <h3>{projections.yearsToRetirement} years</h3>
                <p>({projections.months} months)</p>
              </div>
            </>
          )}
        </div>

        {projections && (
          <div style={{ background: '#fff', padding: 16, borderRadius: 8, marginTop: 16 }}>
            <h3>Projection Breakdown</h3>
            <p>Total Contributions: ₹{projections.totalContributions?.toFixed(0)}</p>
            <p>Investment Returns: ₹{projections.totalInterest?.toFixed(0)}</p>
            <p><strong>Total at Retirement: ₹{projections.projectedAmount?.toFixed(0)}</strong></p>
            <button onClick={() => setEditMode(true)} style={{ background: '#4CAF50', color: '#fff', padding: '8px 12px', border: 'none', borderRadius: 6 }}>Edit Plan</button>
          </div>
        )}

        {editMode && (
          <div style={{ background: '#fff', padding: 16, borderRadius: 8, marginTop: 16 }}>
            <h3>Edit Plan</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 8 }}>
              <div>
                <label>Current Age</label>
                <input type="number" name="currentAge" value={formData.currentAge} onChange={handleInputChange} />
              </div>
              <div>
                <label>Retirement Age</label>
                <input type="number" name="retirementAge" value={formData.retirementAge} onChange={handleInputChange} />
              </div>
              <div>
                <label>Monthly Savings</label>
                <input type="number" name="monthlySavings" value={formData.monthlySavings} onChange={handleInputChange} />
              </div>
              <div>
                <label>Expected Return (%)</label>
                <input type="number" name="expectedReturn" value={formData.expectedReturn} onChange={handleInputChange} />
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <button onClick={handleSave} style={{ marginRight: 8 }}>Save</button>
              <button onClick={() => setEditMode(false)}>Cancel</button>
            </div>
          </div>
        )}

        <div style={{ marginTop: 16, background: '#E3F2FD', padding: 12, borderRadius: 8 }}>
          <h4>Tips</h4>
          <ul>
            <li>Start early to benefit from compound interest</li>
            <li>Review and adjust your plan annually</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Retirement;
