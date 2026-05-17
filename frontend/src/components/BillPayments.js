import React, { useState } from 'react';
import api from '../utils/api';

const BillPayments = () => {
  const [billType, setBillType] = useState('electricity');
  const [amount, setAmount] = useState('');
  const [billNumber, setBillNumber] = useState('');
  const [reminder, setReminder] = useState('');
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [message, setMessage] = useState('');

  const billTypes = {
    electricity: { label: 'Electricity Bill', icon: '⚡' },
    water: { label: 'Water Bill', icon: '💧' },
    internet: { label: 'Internet Bill', icon: '📡' },
    mobile: { label: 'Mobile Recharge', icon: '📱' },
    gas: { label: 'Gas Bill', icon: '🔥' }
  };

  const handlePayBill = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!amount || !billNumber) {
      setMessage('Please fill all fields');
      return;
    }

    try {
      await api.post('/wallet/pay-bill', {
        biller: billTypes[billType].label,
        amount: parseFloat(amount),
        description: `${billTypes[billType].label} - ${billNumber}`
      });

      const billData = {
        type: billType,
        amount: parseFloat(amount),
        billNumber,
        reminder,
        date: new Date().toLocaleDateString(),
        id: Date.now()
      };
      setPaymentHistory([...paymentHistory, billData]);
      setMessage('✓ Bill payment processed successfully!');
      setAmount('');
      setBillNumber('');
      setReminder('');
    } catch (err) {
      setMessage(err.response?.data?.msg || 'Payment failed. Please try again.');
    }
  };

  return (
    <div className="page-card">
      <div className="hero">
        <h1>Pay Bills & Recharges</h1>
        <p>Pay utility bills, mobile recharges, and manage recurring payments effortlessly.</p>
      </div>

      {message && <div className={`alert ${message.includes('✓') ? 'success' : ''}`}>{message}</div>}

      <div className="card-row" style={{ marginBottom: '2rem' }}>
        {Object.entries(billTypes).map(([key, { label, icon }]) => (
          <div
            key={key}
            onClick={() => setBillType(key)}
            style={{
              padding: '1.5rem',
              borderRadius: '1rem',
              border: billType === key ? '2px solid #25d1eb' : '2px solid #e2e8f0',
              background: billType === key ? '#eff6ff' : '#ffffff',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all 0.2s'
            }}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{icon}</div>
            <p style={{ margin: 0, fontWeight: '600' }}>{label}</p>
          </div>
        ))}
      </div>

      <div className="stat-card">
        <h3>Payment Details</h3>
        <form onSubmit={handlePayBill} className="form-grid">
          <input
            type="text"
            value={billNumber}
            onChange={(e) => setBillNumber(e.target.value)}
            placeholder="Bill/Reference Number"
            required
          />
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
            step="0.01"
            required
          />
          <select value={reminder} onChange={(e) => setReminder(e.target.value)}>
            <option value="">No Reminder</option>
            <option value="weekly">Weekly Reminder</option>
            <option value="monthly">Monthly Reminder</option>
          </select>
          <button type="submit" className="primary">Pay Now</button>
        </form>
      </div>

      {paymentHistory.length > 0 && (
        <div className="stat-card" style={{ marginTop: '2rem' }}>
          <h3>Recent Payments</h3>
          <table className="transaction-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Amount</th>
                <th>Reference</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {paymentHistory.map((payment) => (
                <tr key={payment.id}>
                  <td>{billTypes[payment.type].label}</td>
                  <td>₹{payment.amount.toFixed(2)}</td>
                  <td>{payment.billNumber}</td>
                  <td>{payment.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BillPayments;
