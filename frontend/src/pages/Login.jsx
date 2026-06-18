import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ShieldAlert, LogIn, Lock, Mail } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login, error, setError, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Clear errors when entering the page
  useEffect(() => {
    setError(null);
    setFormError('');
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'doctor') navigate('/doctor-dashboard');
      else navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setError(null);

    if (!email || !password) {
      setFormError('Please enter all fields');
      return;
    }

    setSubmitting(true);
    const userRole = await login(email, password);
    setSubmitting(false);

    if (userRole) {
      if (userRole === 'admin') navigate('/admin');
      else if (userRole === 'doctor') navigate('/doctor-dashboard');
      else navigate('/dashboard');
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="glass-card auth-container">
        <h2 className="form-title">Welcome Back</h2>
        <p className="form-subtitle">Login to schedule and manage your medical appointments</p>

        {formError && (
          <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={16} />
            <span>{formError}</span>
          </div>
        )}

        {error && (
          <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                id="email"
                type="email"
                className="input-field"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', paddingLeft: '44px' }}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '28px' }}>
            <label htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                id="password"
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', paddingLeft: '44px' }}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }} disabled={submitting}>
            {submitting ? 'Authenticating...' : 'Sign In'} <LogIn size={16} style={{ marginLeft: '6px' }} />
          </button>
        </form>

        <p className="auth-footer-link">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
        
        {/* Quick Credentials Info Box for testing convenience */}
        <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
          <h4 style={{ color: 'var(--text-bright)', marginBottom: '8px', fontSize: '12px' }}>Testing Credentials (Seeded):</h4>
          <p><strong>Admin:</strong> admin@example.com / admin123</p>
          <p><strong>Patient:</strong> patient@example.com / patient123</p>
          <p><strong>Doctor:</strong> doctor1@example.com / doctor123</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
