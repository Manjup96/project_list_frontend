import React, { useState } from 'react';
import './Login.css';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import logo from '../../Asset/images/company logo.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const navigate = useNavigate();

  // Static user credentials
  const users = [
    { email: 'admin@gmail.com', password: 'admin@123', role: 'admin' },
    { email: 'lead@gmail.com', password: 'lead@123', role: 'teamlead' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      const matchedUser = users.find(
        (user) => user.email === email && user.password === password
      );

      if (matchedUser) {
        // Save user to localStorage
        localStorage.setItem(
          'user',
          JSON.stringify({ email: matchedUser.email, role: matchedUser.role })
        );

        toast.success('Login successful');

        if (matchedUser.role === 'admin') {
          navigate('/admin-dashboard');
        } else if (matchedUser.role === 'teamlead') {
          navigate('/teamlead-dashboard');
        }
      } else {
        setError('Invalid email or password');
        toast.error('Login failed');
      }

      setLoading(false);
    }, 1000);
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-logo">
          <img src={logo} alt="Logo" className="logo" />
        </div>

        <h2 className="login-heading">Login</h2>
        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            className="input-field"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="password-container">
            <input
              type={passwordVisible ? 'text' : 'password'}
              className="input-field"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span className="eye-icon" onClick={togglePasswordVisibility}>
              <FontAwesomeIcon icon={passwordVisible ? faEyeSlash : faEye} />
            </span>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Login;
