import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      showToast('Logged in successfully', 'success');
      navigate('/admin/dashboard');
    } catch (error: any) {
      console.error(error);
      showToast('Login failed: ' + error.message, 'error');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '4rem auto', padding: '2rem', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Admin Login</h2>
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem', width: '100%' }}>
          Login
        </button>
        <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#888' }}>
          Enter your admin credentials
        </p>
      </form>
    </div>
  );
};


export default Login;