import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import api from '../services/api';

const AdminDashboard = () => {
  const [sellers, setSellers] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const userRes = await api.get('/auth/me');
        if (userRes.data.role !== 'admin') {
          navigate('/');
          return;
        }
        setUser(userRes.data);

        const res = await api.get('/admin/sellers');
        setSellers(res.data);
      } catch (error) {
        navigate('/login');
      }
    };
    fetchAdminData();
  }, [navigate]);

  const toggleActiveStatus = async (sellerId: number, currentStatus: boolean) => {
    try {
      await api.put(`/admin/sellers/${sellerId}`, { isActive: !currentStatus });
      setSellers(sellers.map(s => s.id === sellerId ? { ...s, isActive: !currentStatus } : s));
    } catch (e) {
      alert('Error al actualizar estado');
    }
  };

  const addSubscriptionDays = async (sellerId: number, days: number, planType: string) => {
    if (!confirm(`¿Deseas agregar ${days} días y cambiar plan a ${planType}?`)) return;
    try {
      const res = await api.put(`/admin/sellers/${sellerId}`, { addDays: days, planType, isActive: true });
      setSellers(sellers.map(s => s.id === sellerId ? res.data : s));
    } catch (e) {
      alert('Error al actualizar suscripción');
    }
  };

  if (!user) return null;

  return (
    <div className="dashboard-layout">
      <Sidebar role="admin" />
      <main className="main-content">
        <header style={{ marginBottom: '3rem' }}>
          <h2 className="text-3xl">Panel de Administración</h2>
          <p className="text-gray">Gestiona los planes y activaciones de los vendedores.</p>
        </header>

        <section className="animate-fade-in">
          <h3 className="text-2xl mb-4">Lista de Vendedores</h3>
          <div className="glass-panel" style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '1.5rem 1rem' }}>Vendedor</th>
                  <th style={{ padding: '1.5rem 1rem' }}>Estado</th>
                  <th style={{ padding: '1.5rem 1rem' }}>Plan Actual</th>
                  <th style={{ padding: '1.5rem 1rem' }}>Vence el</th>
                  <th style={{ padding: '1.5rem 1rem' }}>Acciones rápidas (Añadir días)</th>
                </tr>
              </thead>
              <tbody>
                {sellers.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No hay vendedores registrados.</td>
                  </tr>
                )}
                {sellers.map(seller => {
                  const isExpired = seller.subscriptionExpiresAt ? new Date(seller.subscriptionExpiresAt) < new Date() : true;
                  const isFree = seller.planType === 'free';
                  
                  return (
                    <tr key={seller.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '1.5rem 1rem' }}>
                        <div style={{ fontWeight: 600 }}>{seller.fullName}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{seller.email}</div>
                      </td>
                      <td style={{ padding: '1.5rem 1rem' }}>
                        <button 
                          onClick={() => toggleActiveStatus(seller.id, seller.isActive)}
                          style={{
                            padding: '0.4rem 0.8rem',
                            borderRadius: '9999px',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            background: seller.isActive ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                            color: seller.isActive ? '#4ade80' : '#f87171'
                          }}
                        >
                          {seller.isActive ? 'Activo' : 'Inactivo'}
                        </button>
                      </td>
                      <td style={{ padding: '1.5rem 1rem', textTransform: 'capitalize' }}>
                        {seller.planType || 'Gratis'}
                      </td>
                      <td style={{ padding: '1.5rem 1rem' }}>
                        {seller.subscriptionExpiresAt ? (
                          <span style={{ color: isExpired ? '#f87171' : 'white' }}>
                            {new Date(seller.subscriptionExpiresAt).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-gray">Sin plan</span>
                        )}
                      </td>
                      <td style={{ padding: '1.5rem 1rem', display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-primary" style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }} onClick={() => addSubscriptionDays(seller.id, 7, 'semanal')}>
                          7D (5k)
                        </button>
                        <button className="btn btn-primary" style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }} onClick={() => addSubscriptionDays(seller.id, 15, 'quincenal')}>
                          15D (10k)
                        </button>
                        <button className="btn btn-primary" style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }} onClick={() => addSubscriptionDays(seller.id, 30, 'mensual')}>
                          30D (20k)
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;
