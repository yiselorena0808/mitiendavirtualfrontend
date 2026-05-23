import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import api from '../services/api';

const Register = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = location.state?.returnTo;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await api.post('/auth/register', { fullName, email, password, role });
      localStorage.setItem('token', response.data.token);
      navigate(returnTo || (role === 'seller' ? '/seller/dashboard' : '/buyer/explore'));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrarse. Intenta con otro correo.');
    }
  };

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div className="glass-panel animate-fade-in" style={{ padding: '3rem', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '2rem', textAlign: 'center' }}>Crear Cuenta</h2>
        
        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <button 
            type="button"
            className="btn" 
            onClick={() => setRole('buyer')}
            style={{ flex: 1, border: role === 'buyer' ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)' }}
          >
            Soy Cliente
          </button>
          <button 
            type="button"
            className="btn" 
            onClick={() => setRole('seller')}
            style={{ flex: 1, border: role === 'seller' ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)' }}
          >
            Soy Vendedor
          </button>
        </div>

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="input-group">
            <label className="input-label">Nombre Completo</label>
            <input type="text" className="input-field" value={fullName} onChange={e => setFullName(e.target.value)} required />
          </div>
          <div className="input-group">
            <label className="input-label">Email</label>
            <input type="email" className="input-field" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="input-group">
            <label className="input-label">Contraseña</label>
            <input type="password" className="input-field" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Registrarse</button>
        </form>
        <p style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          ¿Ya tienes cuenta? <Link to="/login" state={location.state} style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
