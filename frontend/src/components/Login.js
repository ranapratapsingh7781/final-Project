import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (!formData.email || !formData.password) {
        setError('Email and password are required');
        setLoading(false);
        return;
      }
      const res = await api.post('/auth/login', formData);
      localStorage.setItem('token', res.data.token);
      if (rememberMe) {
        localStorage.setItem('rememberEmail', formData.email);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.msg || 'Unable to login. Please check your credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <aside className="auth-panel">
          <div className="auth-panel__intro">
            <span className="auth-panel__side-title">WELCOME</span>
            <p className="auth-panel__eyebrow">Secure wallet access</p>
            <h2>Spend smarter, pay faster.</h2>
            <p className="auth-panel__desc">Access your wallet instantly with a secure login experience built for digital finance.</p>
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
            <h1>LOGIN</h1>
            <p>Username and password are required to continue.</p>
          </div>

          {error && <div className="alert">{error}</div>}

          <form onSubmit={onSubmit} className="form-grid auth-form auth-form--minimal">
            <label className="input-group">
              <span>Email</span>
              <div className="input-icon">
                <input type="email" name="email" value={formData.email} onChange={onChange} placeholder="you@example.com" required />
              </div>
            </label>
            <label className="input-group">
              <span>Password</span>
              <div className="input-icon">
                <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={onChange} placeholder="Enter your password" required />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                > 
                  
                </button>
              </div>
            </label>
            <div className="form-row form-row--space">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember me
              </label>
              <button type="button" className="auth-link" onClick={() => setError('Password reset is not available yet.')}>Forgot?</button>
            </div>
            <button type="submit" className="primary" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="auth-footer">
            New here? <Link to="/register">Create an account</Link>
          </p>
        </section>
      </div>
    </div>
  );
};

export default Login;