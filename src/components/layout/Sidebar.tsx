import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Store, ShoppingBag, LayoutDashboard, LogOut, MessageCircle, ShieldAlert } from 'lucide-react';
import api from '../../services/api';

interface SidebarProps {
  role: 'seller' | 'buyer' | 'admin';
}

const Sidebar: React.FC<SidebarProps> = ({ role }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch(e) {}
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div style={{ background: 'var(--accent-primary)', borderRadius: '8px', padding: '6px' }}>
          <Store size={24} color="white" />
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, letterSpacing: '0.5px' }} className="gradient-text">MiTienda</h2>
        <button 
          onClick={handleLogout} 
          className="mobile-only" 
          style={{ background: 'transparent', border: 'none', color: '#ef4444', padding: '0.5rem', marginLeft: 'auto', cursor: 'pointer' }}
          title="Cerrar Sesión"
        >
          <LogOut size={20} />
        </button>
      </div>

      <div className="sidebar-section-title">
        Menu Principal
      </div>

      <nav className="sidebar-nav">
        {role === 'seller' && (
          <>
            <NavLink to="/seller/dashboard" end className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={20} /> <span style={{ marginLeft: '0.5rem' }}>Resumen</span>
            </NavLink>
            <NavLink to="/seller/stores" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
              <Store size={20} /> <span style={{ marginLeft: '0.5rem' }}>Mis Tiendas</span>
            </NavLink>
            <NavLink to="/seller/categories" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
              <Store size={20} /> <span style={{ marginLeft: '0.5rem' }}>Categorías</span>
            </NavLink>
            <NavLink to="/seller/products" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
              <Store size={20} /> <span style={{ marginLeft: '0.5rem' }}>Productos</span>
            </NavLink>
            <NavLink to="/seller/orders" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
              <ShoppingBag size={20} /> <span style={{ marginLeft: '0.5rem' }}>Órdenes</span>
            </NavLink>
            <NavLink to="/seller/chats" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
              <MessageCircle size={20} /> <span style={{ marginLeft: '0.5rem' }}>Mensajes</span>
            </NavLink>
          </>
        )}

        {role === 'buyer' && (
          <>
            <NavLink to="/buyer/explore" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
              <Store size={20} /> <span style={{ marginLeft: '0.5rem' }}>Explorar Tiendas</span>
            </NavLink>
            <NavLink to="/buyer/orders" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
              <ShoppingBag size={20} /> <span style={{ marginLeft: '0.5rem' }}>Mis Compras</span>
            </NavLink>
            <NavLink to="/buyer/chats" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
              <MessageCircle size={20} /> <span style={{ marginLeft: '0.5rem' }}>Mensajes</span>
            </NavLink>
          </>
        )}

        {role === 'admin' && (
          <>
            <div className="sidebar-section-title">
              Administración
            </div>
            <NavLink to="/admin/dashboard" end className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
              <ShieldAlert size={20} /> <span style={{ marginLeft: '0.5rem' }}>Centro de Comando</span>
            </NavLink>
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <button className="btn sidebar-logout-btn" onClick={handleLogout}>
          <LogOut size={18} /> Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
