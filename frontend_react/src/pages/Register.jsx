import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { apiClient } from '../apiClient';
import { Mail, Lock, User, UserPlus } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiClient.post('/auth/registration', { name, email, password });
      const data = await response.json();
      
      if (response.ok) {
        showToast('Registration successful! Please login.', 'success');
        navigate('/login');
      } else {
        setError(data.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row justify-content-center align-items-center" style={{ minHeight: 'calc(100vh - 150px)' }}>
      <div className="col-12 col-md-5 col-lg-4 fade-in">
        <div className="card border-0 shadow-lg p-4 rounded-5 bg-secondary-subtle">
          <div className="text-center mb-4">
            <h2 className="fw-bold">Create Account</h2>
            <p className="text-muted">Start managing your tasks more effectively</p>
          </div>

          <form onSubmit={handleSubmit}>
            {error && <div className="alert alert-danger border-0 rounded-4 py-2 small mb-4">{error}</div>}
            
            <div className="mb-3">
              <label className="form-label small fw-semibold">Full Name</label>
              <div className="input-group flex-nowrap">
                <span className="input-group-text bg-white border-end-0 rounded-start-4 glass">
                  <User size={18} className="text-muted" />
                </span>
                <input 
                  type="text" 
                  className="form-control border-start-0 py-2 rounded-end-4 glass" 
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required 
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label small fw-semibold">Email Address</label>
              <div className="input-group flex-nowrap">
                <span className="input-group-text bg-white border-end-0 rounded-start-4 glass">
                  <Mail size={18} className="text-muted" />
                </span>
                <input 
                  type="email" 
                  className="form-control border-start-0 py-2 rounded-end-4 glass" 
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label small fw-semibold">Password</label>
              <div className="input-group flex-nowrap">
                <span className="input-group-text bg-white border-end-0 rounded-start-4 glass">
                  <Lock size={18} className="text-muted" />
                </span>
                <input 
                  type="password" 
                  className="form-control border-start-0 py-2 rounded-end-4 glass" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary w-100 py-2 rounded-4 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              ) : (
                <>
                  <UserPlus size={18} />
                  Sign Up
                </>
              )}
            </button>
          </form>

          <div className="text-center mt-4">
            <p className="small text-muted mb-0">
              Already have an account? <Link to="/login" className="text-primary fw-bold">Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
