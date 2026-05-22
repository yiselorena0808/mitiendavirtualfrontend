import React, { useEffect } from 'react';
import { Bell } from 'lucide-react';

interface ToastProps {
  message: string;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div style={{
      position: 'fixed',
      top: '2rem',
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'var(--bg-glass)',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      color: 'white',
      padding: '0.75rem 1.5rem',
      borderRadius: '9999px', // Pill shape
      boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      animation: 'slideDown 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
      fontWeight: 500,
      fontSize: '0.95rem'
    }}>
      <div style={{
        background: 'var(--accent-primary)',
        borderRadius: '50%',
        width: '32px',
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 0 10px var(--accent-primary)'
      }}>
        <Bell size={16} color="white" />
      </div>
      <span>{message}</span>
    </div>
  );
};

export default Toast;
