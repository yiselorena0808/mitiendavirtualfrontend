import React, { useState } from 'react';
import { X, Key } from 'lucide-react';

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (password: string) => Promise<void>;
  userEmail: string;
}

const PasswordModal: React.FC<PasswordModalProps> = ({ isOpen, onClose, onSave, userEmail }) => {
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    setIsSubmitting(true);
    try {
      await onSave(password);
      setPassword('');
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="drawer-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="glass-panel animate-fade-in" style={{ background: 'var(--bg-secondary)', width: '100%', maxWidth: '400px', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 className="text-xl" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <Key size={20} /> Cambiar Contraseña
          </h2>
          <button onClick={onClose} className="btn" style={{ padding: '0.5rem' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>
            Establece una nueva contraseña para el usuario:<br/>
            <strong style={{ color: 'var(--text-primary)' }}>{userEmail}</strong>
          </p>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <input 
              type="password" 
              className="input-field" 
              value={password} 
              onChange={e => { setPassword(e.target.value); setError(null); }} 
              required 
              placeholder="Mínimo 6 caracteres"
              autoFocus
            />
            {error && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.5rem', marginBottom: 0 }}>{error}</p>}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={() => { onClose(); setError(null); setPassword(''); }} className="btn">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Cambiar Clave'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordModal;
