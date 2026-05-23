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
    <div className="modal-overlay">
      <div className="modal-content animate-fade-in" style={{ maxWidth: '400px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 className="text-xl" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Key size={20} /> Cambiar Contraseña
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Establece una nueva contraseña para el usuario:<br/>
            <strong style={{ color: 'var(--text-primary)' }}>{userEmail}</strong>
          </p>
          <div>
            <input 
              type="password" 
              className="form-input" 
              value={password} 
              onChange={e => { setPassword(e.target.value); setError(null); }} 
              required 
              placeholder="Mínimo 6 caracteres"
              autoFocus
            />
            {error && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.5rem', marginBottom: 0 }}>{error}</p>}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={() => { onClose(); setError(null); setPassword(''); }} className="btn" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
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
