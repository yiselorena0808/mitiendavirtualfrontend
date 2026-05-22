import React from 'react';
import { X } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: any[];
  total: number;
  onCheckout: (method: 'whatsapp' | 'chat') => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, cart, total, onCheckout }) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer">
        <div className="drawer-header">
          <h2 className="text-xl">Tu Carrito</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>
        
        <div className="drawer-content">
          {cart.length === 0 ? (
            <p className="text-gray" style={{ textAlign: 'center', marginTop: '2rem' }}>Tu carrito está vacío.</p>
          ) : (
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {cart.map((item, idx) => (
                <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
                  <div>
                    <h4 className="text-lg">{item.product.name}</h4>
                    <p className="text-sm text-gray">Cantidad: {item.quantity}</p>
                  </div>
                  <div style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
                    ${(item.product.discountPrice || item.product.price) * item.quantity}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {cart.length > 0 && (
          <div className="drawer-footer">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <span className="text-xl">Total</span>
              <span className="text-2xl" style={{ color: 'var(--accent-primary)' }}>${total}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button onClick={() => onCheckout('chat')} className="btn btn-primary" style={{ width: '100%', padding: '1rem', background: 'var(--accent-primary)' }}>
                Pedir por Chat Interno
              </button>
              <button onClick={() => onCheckout('whatsapp')} className="btn" style={{ width: '100%', padding: '1rem', background: '#25D366', color: 'white', border: 'none' }}>
                Pedir por WhatsApp
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
