import React, { useState } from 'react';
import './Login.css';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import logo from '../../Asset/images/company logo.png'; // Add your logo path here
import { baseUrl } from "../APIServices/APIServices"; // Set your backend API URL here

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${baseUrl}/login.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      // Debug: Log the response to check if we are getting the expected data
      console.log(data);

      if (data.status === 'success') {
        // Save user details to localStorage
        localStorage.setItem('user', JSON.stringify({
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role
      }));
      

      console.log(data);

        toast.success('Login successful');


        // Ensure redirection happens after a short delay to allow state updates
        setTimeout(() => {
          // Redirect based on role
          if (data.role === 'admin') {
            navigate('/admin-dashboard');
          } else if (data.role === 'teamlead') {
            navigate('/teamlead-dashboard');
          } else {
             navigate('/');
          }
        }, 200); // Small delay to ensure state updates
      } else {
        setError(data.message);
        toast.error(data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      toast.error('Something went wrong!');
    }

    setLoading(false);
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
