import React from 'react';

const HelpCenter = () => (
  <div className="help-page">
    <section className="help-header">
      <div className="help-header-copy">
        <span className="badge accent">Help Center</span>
        <h2>Everything you need to manage your wallet with confidence</h2>
        <p>Find answers fast, reach support instantly, and keep your account secure with helpful guides.</p>
      </div>

      <div className="help-header-actions">
        <button type="button" className="btn-primary">Start live chat</button>
        <button type="button" className="btn-secondary">Browse FAQs</button>
      </div>
    </section>

    <div className="help-grid">
      <article className="help-card help-faq-card">
        <div className="help-card-header">
          <span className="badge soft">Most popular</span>
          <h3>Frequently Asked Questions</h3>
          <p>Quick answers for the most common wallet and account questions.</p>
        </div>

        <ul className="help-list">
          <li>
            <div className="help-list-icon">💸</div>
            <div>
              <strong>How do I add money to my wallet?</strong>
              <p>Use the Add Money option in your dashboard and follow the simple payment steps.</p>
            </div>
          </li>
          <li>
            <div className="help-list-icon">📄</div>
            <div>
              <strong>Where can I see my transaction history?</strong>
              <p>Navigate to the Transaction History page to view all past transfers, bills, and deposits.</p>
            </div>
          </li>
          <li>
            <div className="help-list-icon">👤</div>
            <div>
              <strong>How do I update my profile information?</strong>
              <p>Go to the Profile page to adjust your personal details and contact information.</p>
            </div>
          </li>
          <li>
            <div className="help-list-icon">📅</div>
            <div>
              <strong>Can I schedule bill payments?</strong>
              <p>Yes, the Bill Payments section lets you schedule and manage recurring payments.</p>
            </div>
          </li>
        </ul>
      </article>

      <aside className="help-card help-sidebar">
        <div className="help-sidebar-top">
          <h3>Contact Support</h3>
          <p>If you need direct assistance, our support team is ready to help you 24/7.</p>
        </div>

        <div className="help-contact">
          <div>
            <strong>Email</strong>
            <p>support@smartwallet.com</p>
          </div>
          <div>
            <strong>Phone</strong>
            <p>+1 (800) 555-0199</p>
          </div>
          <div>
            <strong>Live chat</strong>
            <p>Available in the app for faster support.</p>
          </div>
        </div>

        <button type="button" className="help-cta">Start a support request</button>

        <div className="help-links">
          <h4>Quick links</h4>
          <ul>
            <li>Account security tips</li>
            <li>Refund policy</li>
            <li>Payment limits</li>
            <li>Privacy policy</li>
          </ul>
        </div>
      </aside>
    </div>
  </div>
);

export default HelpCenter;
