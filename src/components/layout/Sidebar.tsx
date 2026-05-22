import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Store, ShoppingBag, LayoutDashboard, LogOut, User, MessageCircle, Settings, ShieldAlert } from 'lucide-react';
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
    <div className="sidebar" style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-glass)', borderRight: '1px solid var(--border-color)', backdropFilter: 'blur(10px)' }}>
      <div style={{ padding: '2rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ background: 'var(--accent-primary)', borderRadius: '8px', padding: '6px' }}>
          <Store size={24} color="white" />
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, letterSpacing: '0.5px' }} className="gradient-text">MiTienda</h2>
      </div>

      <div style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)', marginTop: '1rem' }}>
        Menu Principal
      </div>

      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0 1rem' }}>
        {role === 'seller' ? (
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
        ) : (
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
            <div className="sidebar-section-title" style={{ padding: '0 1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.5rem', marginTop: '1rem' }}>
              Administración
            </div>
            <NavLink to="/admin/dashboard" end className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
              <ShieldAlert size={20} /> <span style={{ marginLeft: '0.5rem' }}>Gestión de Vendedores</span>
            </NavLink>
          </>
        )}
      </nav>

      <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <button className="btn" onClick={handleLogout} style={{ width: '100%', justifyContent: 'center', gap: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <LogOut size={18} /> Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
