import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (!agreeTerms) {
      setError('Please agree to the terms and conditions');
      setLoading(false);
      return;
    }

    try {
      const res = await api.post('/auth/register', formData);
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.msg || 'Registration failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card--reverse">
        <aside className="auth-panel">
          <div className="auth-panel__intro">
            <span className="auth-panel__side-title">WELCOME</span>
            <p className="auth-panel__eyebrow">Create your account</p>
            <h2>Secure your financial future.</h2>
            <p className="auth-panel__desc">Set up your wallet and begin managing transactions with confidence.</p>
          </div>
          <div className="auth-panel__hero">
            <div className="credit-card-3d">
              <div className="card-body">
                <div className="card-top">
                  <div className="card-chip"></div>
                  <div className="card-logo">E</div>
                </div>
                <div className="card-numbers">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div className="card-footer">
                  <span className="card-holder"></span>
                  <span className="card-expiry"></span>
                </div>
              </div>
              <div className="floating-icons">
                <div className="float-icon float-icon-1">₿</div>
                <div className="float-icon float-icon-2">Ξ</div>
                <div className="float-icon float-icon-3">◆</div>
                <div className="float-icon float-icon-4">✓</div>
                <div className="float-icon float-icon-5">◆</div>
              </div>
            </div>
          </div>
        </aside>

        <section className="auth-form-card auth-form-card--bright">
          <div className="auth-form-header auth-form-header--compact">
            <h1>REGISTER</h1>
            <p>Create a secure account to begin using your digital wallet.</p>
          </div>

          {error && <div className="alert">{error}</div>}

          <form onSubmit={onSubmit} className="form-grid auth-form auth-form--minimal">
            <label className="input-group">
              <span>Username</span>
              <div className="input-icon">
                <input type="text" name="name" value={formData.name} onChange={onChange} placeholder="John Doe" required />
              </div>
            </label>
            <label className="input-group">
              <span>Email</span>
              <div className="input-icon">
                <input type="email" name="email" value={formData.email} onChange={onChange} placeholder="you@example.com" required />
              </div>
            </label>
            <label className="input-group">
              <span>Password</span>
              <div className="input-icon">
                <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={onChange} placeholder="Create a strong password" required />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  
                </button>
              </div>
            </label>
            <label className="input-group">
              <span>Confirm Password</span>
              <div className="input-icon">
                <input type={showPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={onChange} placeholder="Confirm your password" required />
              </div>
            </label>
            <label className="checkbox-label checkbox-label--full">
              <input
                type="checkbox"
                id="terms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
              />
              I agree to the <Link to="#" onClick={(e) => e.preventDefault()}>Terms & Conditions</Link>
            </label>
            <button type="submit" className="primary" disabled={loading || !agreeTerms}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </section>
      </div>
    </div>
  );
};

export default Register;