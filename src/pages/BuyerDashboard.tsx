import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import BuyerChatPanel from '../components/dashboard/BuyerChatPanel';
import api from '../services/api';

const BuyerDashboard = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [chats, setChats] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active tab based on URL path
  const pathEnd = location.pathname.split('/').pop() || 'explore';
  const activeTab = pathEnd === 'dashboard' ? 'explore' : pathEnd;

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const userRes = await api.get('/auth/me');
        if (userRes.data.role !== 'buyer') navigate('/seller/dashboard');
        setUser(userRes.data);

        const [ordersRes, storesRes, chatsRes] = await Promise.all([
          api.get('/buyer/orders'),
          api.get('/stores/public'),
          api.get('/buyer/chats')
        ]);
        
        setOrders(ordersRes.data);
        setStores(storesRes.data);
        setChats(chatsRes.data);
      } catch (error) {
        navigate('/login');
      }
    };
    fetchDashboard();
  }, [navigate]);

  // Real-time notifications for buyer messages (10 seconds)
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(async () => {
      try {
        const chatsRes = await api.get('/buyer/chats');
        const newChats = chatsRes.data;

        if (chats.length > 0) {
          const latestCurrent = Math.max(...chats.map((c: any) => new Date(c.updatedAt).getTime()), 0);
          const latestNew = Math.max(...newChats.map((c: any) => new Date(c.updatedAt).getTime()), 0);
          if (latestNew > latestCurrent) {
            new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play().catch(()=>{});
          }
        }

        setChats(newChats);
      } catch (e) {}
    }, 10000);
    return () => clearInterval(interval);
  }, [chats, user]);

  return (
    <div className="dashboard-layout">
      <Sidebar role="buyer" />
      <main className="main-content">
        <header style={{ marginBottom: '3rem' }}>
          <h2 className="text-3xl">Portal del Cliente</h2>
          <p className="text-gray">Explora tiendas, chatea y gestiona tus compras.</p>
        </header>

        {/* EXPLORE TAB */}
        {activeTab === 'explore' && (
          <section className="animate-fade-in">
            <h3 className="text-2xl mb-4">Marketplace</h3>
            <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
              {stores.length === 0 ? <p className="text-gray">No hay tiendas disponibles.</p> : null}
              {stores.map(store => (
                <div key={store.id} className="glass-panel" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ height: '140px', background: store.bannerUrl ? `url(${store.bannerUrl}) center/cover` : store.themeColor || 'var(--accent-primary)' }} />
                  <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '-3rem' }}>
                      <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--bg-primary)', padding: '4px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
                        <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: store.logoUrl ? `url(${store.logoUrl}) center/cover` : 'var(--bg-secondary)', overflow: 'hidden' }}></div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold">{store.name}</h4>
                      <p className="text-gray text-sm mt-1">{store.description || 'Visita nuestra tienda para ver los mejores productos.'}</p>
                    </div>
                    <Link to={`/s/${store.slug}`} className="btn btn-primary" style={{ marginTop: 'auto', textAlign: 'center', background: store.themeColor || 'var(--accent-primary)' }}>Ir a la Tienda</Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <section className="animate-fade-in">
            <h3 className="text-2xl mb-4">Mis Compras</h3>
            {orders.length === 0 ? (
              <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
                <p className="text-gray text-lg">Aún no has realizado ninguna compra.</p>
              </div>
            ) : (
              <div className="glass-panel" style={{ overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid var(--border-color)' }}>
                      <th style={{ padding: '1.5rem 1rem' }}>Tienda</th>
                      <th style={{ padding: '1.5rem 1rem' }}>Fecha</th>
                      <th style={{ padding: '1.5rem 1rem' }}>Total</th>
                      <th style={{ padding: '1.5rem 1rem' }}>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '1.5rem 1rem' }}>
                          <div style={{ fontWeight: 600 }}>{order.store?.name}</div>
                          <Link to={`/s/${order.store?.slug}`} className="text-sm text-gray" style={{ textDecoration: 'underline' }}>Ir a la tienda</Link>
                        </td>
                        <td style={{ padding: '1.5rem 1rem' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td style={{ padding: '1.5rem 1rem' }}>${order.totalPrice}</td>
                        <td style={{ padding: '1.5rem 1rem' }}>
                          <span style={{ 
                            padding: '0.25rem 0.75rem', 
                            borderRadius: '9999px', 
                            fontSize: '0.8rem',
                            background: order.status === 'completed' ? 'rgba(34, 197, 94, 0.2)' : order.status === 'cancelled' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(234, 179, 8, 0.2)',
                            color: order.status === 'completed' ? '#4ade80' : order.status === 'cancelled' ? '#f87171' : '#facc15'
                          }}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* CHATS TAB */}
        {activeTab === 'chats' && (
          <section className="animate-fade-in">
            <BuyerChatPanel chats={chats} />
          </section>
        )}

      </main>
    </div>
  );
};

export default BuyerDashboard;
