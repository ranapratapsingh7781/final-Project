import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('date');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const applyFilters = useCallback(() => {
    let filtered = [...transactions];

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.type.toLowerCase() === filterType.toLowerCase());
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(t =>
        t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.amount.toString().includes(searchTerm)
      );
    }

    // Date range filter
    if (startDate) {
      filtered = filtered.filter(t => new Date(t.date) >= new Date(startDate));
    }
    if (endDate) {
      filtered = filtered.filter(t => new Date(t.date) <= new Date(endDate));
    }

    // Sort
    if (sortBy === 'amount-high') {
      filtered.sort((a, b) => b.amount - a.amount);
    } else if (sortBy === 'amount-low') {
      filtered.sort((a, b) => a.amount - b.amount);
    } else {
      filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    setFilteredTransactions(filtered);
  }, [transactions, searchTerm, filterType, startDate, endDate, sortBy]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const fetchTransactions = async () => {
    try {
      const res = await api.get('/wallet/transactions');
      setTransactions(res.data);
    } catch (err) {
      console.log('Failed to fetch transactions');
    }
  };

  const downloadReceipt = (transaction) => {
    const receiptContent = `E-WALLET RECEIPT\n${'='.repeat(40)}\nTransaction ID: ${transaction._id}\nType: ${transaction.type}\nAmount: ₹${transaction.amount.toFixed(2)}\nDescription: ${transaction.description || 'N/A'}\nDate: ${new Date(transaction.date).toLocaleString()}\n${'='.repeat(40)}`;
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(receiptContent));
    element.setAttribute('download', `receipt-${transaction._id}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="page-card">
      <div className="hero">
        <h1>Transaction History</h1>
        <p>View, search, and filter all your wallet transactions with detailed receipts.</p>
      </div>

      <div className="stat-card" style={{ marginBottom: '1.5rem' }}>
        <h3>Filters & Search</h3>
        <div className="form-grid">
          <input
            type="text"
            placeholder="Search by description or amount..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="all">All Types</option>
              <option value="deposit">Deposits</option>
              <option value="withdraw">Withdrawals</option>
              <option value="transfer">Transfers</option>
            </select>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="date">Latest First</option>
              <option value="amount-high">Amount (High to Low)</option>
              <option value="amount-low">Amount (Low to High)</option>
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="Start Date"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="End Date"
            />
          </div>
        </div>
      </div>

      {filteredTransactions.length === 0 ? (
        <div className="stat-card">
          <p style={{ textAlign: 'center', color: '#475569' }}>No transactions found</p>
        </div>
      ) : (
        <div className="stat-card">
          <h3>Results ({filteredTransactions.length})</h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="transaction-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Description</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((t) => (
                  <tr key={t._id}>
                    <td>
                      <span className={`transaction-badge ${t.type.toLowerCase()}`}>
                        {t.type}
                      </span>
                    </td>
                    <td style={{ fontWeight: '600' }}>₹{t.amount.toFixed(2)}</td>
                    <td>{t.description || '—'}</td>
                    <td>{new Date(t.date).toLocaleDateString()}</td>
                    <td>
                      <button
                        onClick={() => downloadReceipt(t)}
                        style={{
                          background: '#eff6ff',
                          color: '#2563eb',
                          border: 'none',
                          borderRadius: '0.5rem',
                          padding: '0.4rem 0.8rem',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          fontWeight: '600'
                        }}
                      >
                        Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
