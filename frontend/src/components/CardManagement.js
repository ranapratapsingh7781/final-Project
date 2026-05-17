import React, { useState } from 'react';

const CardManagement = () => {
  const [cards, setCards] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    cardHolder: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardType: 'debit'
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddCard = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      // Mask card number for display
      const maskedCard = '****' + formData.cardNumber.slice(-4);
      const cardData = { ...formData, cardNumber: maskedCard };
      setCards([...cards, { ...cardData, id: Date.now() }]);
      setMessage('✓ Card added successfully!');
      setFormData({ cardHolder: '', cardNumber: '', expiryDate: '', cvv: '', cardType: 'debit' });
      setShowForm(false);
    } catch (err) {
      setMessage('Failed to add card');
    }
  };

  const handleDeleteCard = (id) => {
    setCards(cards.filter(c => c.id !== id));
    setMessage('✓ Card removed successfully');
  };

  return (
    <div className="page-card">
      <div className="hero">
        <h1>Manage Your Cards</h1>
        <p>Add, view, and manage your debit and credit cards securely.</p>
      </div>

      {message && <div className={`alert ${message.includes('✓') ? 'success' : ''}`}>{message}</div>}

      <div className="card-row" style={{ marginBottom: '2rem' }}>
        {cards.length === 0 ? (
          <div className="stat-card">
            <p>No cards added yet. Start by adding a card.</p>
          </div>
        ) : (
          cards.map((card) => (
            <div key={card.id} className="stat-card card-display">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <p style={{ fontSize: '0.85rem', margin: '0 0 0.5rem' }}>
                    {card.cardType.toUpperCase()}
                  </p>
                  <p style={{ fontSize: '1.4rem', margin: '0.5rem 0', fontWeight: '700' }}>
                    {card.cardNumber}
                  </p>
                  <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem' }}>
                    {card.cardHolder}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteCard(card.id)}
                  style={{ background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '0.5rem', padding: '0.5rem 0.75rem', cursor: 'pointer' }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <button
        className="primary"
        onClick={() => setShowForm(!showForm)}
        style={{ marginBottom: '1.5rem' }}
      >
        {showForm ? 'Cancel' : '+ Add New Card'}
      </button>

      {showForm && (
        <div className="stat-card">
          <h3>Add Card Details</h3>
          <form onSubmit={handleAddCard} className="form-grid">
            <input
              type="text"
              name="cardHolder"
              value={formData.cardHolder}
              onChange={handleChange}
              placeholder="Cardholder Name"
              required
            />
            <input
              type="text"
              name="cardNumber"
              value={formData.cardNumber}
              onChange={handleChange}
              placeholder="Card Number"
              maxLength="16"
              required
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <input
                type="text"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                placeholder="MM/YY"
                required
              />
              <input
                type="password"
                name="cvv"
                value={formData.cvv}
                onChange={handleChange}
                placeholder="CVV"
                maxLength="3"
                required
              />
            </div>
            <select name="cardType" value={formData.cardType} onChange={handleChange} required>
              <option value="debit">Debit Card</option>
              <option value="credit">Credit Card</option>
              <option value="virtual">Virtual Card</option>
            </select>
            <button type="submit" className="primary">Add Card</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default CardManagement;
