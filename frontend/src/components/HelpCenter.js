import React, { useState } from 'react';
import '../App.css';

const HelpCenter = () => {
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitStatus, setSubmitStatus] = useState(null);

  const faqs = [
    {
      id: 1,
      question: 'How do I register for an account?',
      answer: 'Click on the "Register" button, fill in your name, email, and password. Once submitted, your account will be created and you can start using the e-wallet immediately.',
      category: 'Account',
    },
    {
      id: 2,
      question: 'How can I reset my password?',
      answer: 'Currently, we recommend contacting our support team for password reset assistance. Use the contact form below to request a password reset.',
      category: 'Account',
    },
    {
      id: 3,
      question: 'Is my money safe in this wallet?',
      answer: 'Yes, your wallet is secured with industry-standard encryption and secure MongoDB storage. All transactions are logged and verified.',
      category: 'Security',
    },
    {
      id: 4,
      question: 'How do I add money to my wallet?',
      answer: 'Navigate to the "Dashboard" section and use the "Add Money" option. Enter the amount and a description. The funds will be instantly credited to your wallet.',
      category: 'Transactions',
    },
    {
      id: 5,
      question: 'Can I transfer money to other users?',
      answer: 'Yes! Go to "Bill Payments" section, select "Transfer" option, enter the recipient\'s email address, amount, and submit. The transfer will be completed instantly.',
      category: 'Transactions',
    },
    {
      id: 6,
      question: 'How do I track my transactions?',
      answer: 'Visit the "Transaction History" section to view all your past transactions. You can see the date, amount, type, and status of each transaction.',
      category: 'Transactions',
    },
    {
      id: 7,
      question: 'What is the retirement planning tool?',
      answer: 'Our retirement planning tool helps you project how much money you\'ll have by your target retirement age. Set your current age, savings, monthly contribution, and expected return rate.',
      category: 'Planning',
    },
    {
      id: 8,
      question: 'How do I schedule bill payments?',
      answer: 'In the "Bill Payments" section, you can add upcoming bills with due dates. The system will remind you when payment is due.',
      category: 'Payments',
    },
    {
      id: 9,
      question: 'Can I request money from someone?',
      answer: 'Yes, you can use the "Request Money" feature to send payment requests to other users. They will be notified and can accept or decline your request.',
      category: 'Transactions',
    },
    {
      id: 10,
      question: 'How do I enable notifications?',
      answer: 'Go to the "Notifications" section in the app. You can customize which alerts you want to receive for transactions, bill reminders, and account updates.',
      category: 'Settings',
    },
  ];

  const filteredFAQs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleContactInputChange = (e) => {
    const { name, value } = e.target;
    setContactForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.subject || !contactForm.message) {
      setSubmitStatus({ type: 'error', message: 'Please fill all fields.' });
      return;
    }
    // Simulate form submission
    setSubmitStatus({ type: 'success', message: 'Thank you! We\'ll respond to your inquiry within 24 hours.' });
    setContactForm({
      name: '',
      email: '',
      subject: '',
      message: '',
    });
    setTimeout(() => setSubmitStatus(null), 5000);
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '10px', color: '#333' }}>Help Center</h1>
        <p style={{ color: '#666', marginBottom: '30px' }}>
          Find answers to common questions and get support for your e-wallet
        </p>

        {/* Search Bar */}
        <div style={{ marginBottom: '30px' }}>
          <input
            type="text"
            placeholder="Search FAQs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 15px',
              fontSize: '14px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              boxSizing: 'border-box',
              maxWidth: '100%',
            }}
          />
        </div>

        {/* FAQ Section */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          padding: '25px',
          marginBottom: '30px',
        }}>
          <h2 style={{ marginTop: 0, marginBottom: '20px', color: '#333' }}>Frequently Asked Questions</h2>

          {filteredFAQs.length > 0 ? (
            <div>
              {filteredFAQs.map((faq) => (
                <div
                  key={faq.id}
                  style={{
                    borderBottom: '1px solid #eee',
                    paddingBottom: '15px',
                    marginBottom: '15px',
                  }}
                >
                  <div
                    onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                      padding: '10px 0',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <h4 style={{ color: '#333', margin: '0 0 5px 0', fontSize: '15px', fontWeight: '600' }}>
                        {faq.question}
                      </h4>
                      <span style={{
                        display: 'inline-block',
                        backgroundColor: '#e3f2fd',
                        color: '#1976d2',
                        padding: '3px 8px',
                        borderRadius: '3px',
                        fontSize: '12px',
                        fontWeight: '500',
                      }}>
                        {faq.category}
                      </span>
                    </div>
                    <span style={{
                      fontSize: '20px',
                      color: '#4CAF50',
                      marginLeft: '15px',
                    }}>
                      {expandedFAQ === faq.id ? '−' : '+'}
                    </span>
                  </div>

                  {expandedFAQ === faq.id && (
                    <p style={{
                      color: '#666',
                      lineHeight: '1.6',
                      marginTop: '10px',
                      marginBottom: 0,
                    }}>
                      {faq.answer}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#999', textAlign: 'center' }}>
              No FAQs found matching "{searchQuery}"
            </p>
          )}
        </div>

        {/* Contact Support Section */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          padding: '25px',
          marginBottom: '30px',
        }}>
          <h2 style={{ marginTop: 0, marginBottom: '20px', color: '#333' }}>Contact Support</h2>

          {submitStatus && (
            <div style={{
              backgroundColor: submitStatus.type === 'success' ? '#e8f5e9' : '#ffebee',
              color: submitStatus.type === 'success' ? '#2e7d32' : '#c62828',
              padding: '12px 15px',
              borderRadius: '4px',
              marginBottom: '20px',
              fontSize: '14px',
            }}>
              {submitStatus.message}
            </div>
          )}

          <form onSubmit={handleContactSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: '500', marginBottom: '8px', color: '#555' }}>
                Name
              </label>
              <input
                type="text"
                name="name"
                value={contactForm.name}
                onChange={handleContactInputChange}
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

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: '500', marginBottom: '8px', color: '#555' }}>
                Email
              </label>
              <input
                type="email"
                name="email"
                value={contactForm.email}
                onChange={handleContactInputChange}
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

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: '500', marginBottom: '8px', color: '#555' }}>
                Subject
              </label>
              <input
                type="text"
                name="subject"
                value={contactForm.subject}
                onChange={handleContactInputChange}
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

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: '500', marginBottom: '8px', color: '#555' }}>
                Message
              </label>
              <textarea
                name="message"
                value={contactForm.message}
                onChange={handleContactInputChange}
                rows="5"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                  resize: 'vertical',
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                padding: '12px 30px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
              }}
            >
              Send Message
            </button>
          </form>
        </div>

        {/* Quick Links */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '30px',
        }}>
          <div style={{
            backgroundColor: '#fff',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            textAlign: 'center',
          }}>
            <h3 style={{ color: '#4CAF50', fontSize: '18px', margin: '0 0 10px 0' }}>📞 Phone Support</h3>
            <p style={{ color: '#666', margin: 0 }}>+91-1234-5678-90</p>
            <p style={{ color: '#999', fontSize: '12px', margin: '5px 0 0 0' }}>Mon-Fri, 9AM - 6PM IST</p>
          </div>

          <div style={{
            backgroundColor: '#fff',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            textAlign: 'center',
          }}>
            <h3 style={{ color: '#2196F3', fontSize: '18px', margin: '0 0 10px 0' }}>📧 Email Support</h3>
            <p style={{ color: '#666', margin: 0 }}>support@ewallet.com</p>
            <p style={{ color: '#999', fontSize: '12px', margin: '5px 0 0 0' }}>Response within 24 hours</p>
          </div>

          <div style={{
            backgroundColor: '#fff',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            textAlign: 'center',
          }}>
            <h3 style={{ color: '#FF9800', fontSize: '18px', margin: '0 0 10px 0' }}>💬 Live Chat</h3>
            <p style={{ color: '#666', margin: 0 }}>Start a chat with us</p>
            <p style={{ color: '#999', fontSize: '12px', margin: '5px 0 0 0' }}>Available Mon-Sun, 10AM - 10PM</p>
          </div>
        </div>

        {/* Tips Section */}
        <div style={{
          backgroundColor: '#FFF3E0',
          padding: '20px',
          borderRadius: '8px',
          borderLeft: '4px solid #FF9800',
          marginBottom: '30px',
        }}>
          <h4 style={{ marginTop: 0, color: '#E65100' }}>🔐 Security Tips</h4>
          <ul style={{ color: '#555', margin: '10px 0 0 0', paddingLeft: '20px' }}>
            <li>Never share your password with anyone</li>
            <li>Always use strong, unique passwords</li>
            <li>Verify recipient email before making transfers</li>
            <li>Keep your email address secure and updated</li>
            <li>Log out from shared devices after use</li>
            <li>Report suspicious activity immediately</li>
          </ul>
        </div>

        {/* Usage Guidelines */}
        <div style={{
          backgroundColor: '#E8F5E9',
          padding: '20px',
          borderRadius: '8px',
          borderLeft: '4px solid #4CAF50',
        }}>
          <h4 style={{ marginTop: 0, color: '#1B5E20' }}>📋 Usage Guidelines</h4>
          <ul style={{ color: '#555', margin: '10px 0 0 0', paddingLeft: '20px' }}>
            <li>Keep your transaction records for reference</li>
            <li>Review transaction history regularly</li>
            <li>Set realistic retirement savings goals</li>
            <li>Update your profile information if it changes</li>
            <li>Use bill payment reminders to avoid late payments</li>
            <li>Monitor your wallet balance for sufficient funds</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;
