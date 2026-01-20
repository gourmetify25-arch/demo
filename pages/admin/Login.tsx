import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loginWithGoogle, user, isAdmin } = useAuth(); // Get user/isAdmin
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Redirect if already logged in as admin
  React.useEffect(() => {
    if (user && isAdmin) {
      navigate('/admin/dashboard');
    }
  }, [user, isAdmin, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      // Navigation handled by useEffect
    } catch (error: any) {
      console.error(error);
      showToast('Login failed: ' + error.message, 'error');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      // Navigation handled by useEffect
    } catch (error: any) {
      console.error(error);
      showToast('Google Login failed', 'error');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '4rem auto', padding: '2rem', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Admin Login</h2>

      {user && !isAdmin && (
        <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '1rem', borderRadius: '4px', marginBottom: '1rem', textAlign: 'center' }}>
          <strong>Access Denied</strong><br />
          Your account ({user.email}) is not authorized.
        </div>
      )}

      <button
        onClick={handleGoogleLogin}
        className="btn"
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          background: '#fff',
          color: '#333',
          border: '1px solid #ccc',
          marginBottom: '1.5rem',
          padding: '0.8rem'
        }}
      >
        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: '20px' }} />
        Sign in with Google
      </button>

      <div style={{ textAlign: 'center', margin: '1rem 0', color: '#888' }}>OR</div>

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
          Login with Email
        </button>
      </form>
    </div>
  );
};


export default Login;