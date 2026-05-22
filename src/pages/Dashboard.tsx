import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Dashboard = () => {
  const [stores, setStores] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('stores');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const userRes = await api.get('/auth/me');
        setUser(userRes.data);
        const storesRes = await api.get('/stores');
        setStores(storesRes.data);
        const ordersRes = await api.get('/orders');
        setOrders(ordersRes.data);
      } catch (error) {
        navigate('/login');
      }
    };
    fetchDashboard();
  }, [navigate]);

  const handleCreateStore = async () => {
    const name = prompt('Nombre de la tienda:');
    const slug = prompt('URL (slug):', name?.toLowerCase().replace(/\s+/g, '-'));
    const whatsapp = prompt('Número de WhatsApp:');
    
    if (name && slug && whatsapp) {
      try {
        const res = await api.post('/stores', { name, slug, whatsappNumber: whatsapp, layoutStyle: 'modern' });
        setStores([...stores, res.data]);
      } catch (e) {
        alert('Error al crear tienda');
      }
    }
  };

  const updateStoreTheme = async (storeId: number, field: string, value: string) => {
    try {
      const res = await api.put(`/stores/${storeId}`, { [field]: value });
      setStores(stores.map(s => s.id === storeId ? res.data : s));
    } catch (e) {
      alert('Error al actualizar tienda');
    }
  };

  const updateOrderStatus = async (orderId: number, status: string) => {
    try {
      const res = await api.put(`/orders/${orderId}`, { status });
      setOrders(orders.map(o => o.id === orderId ? res.data : o));
    } catch (e) {
      alert('Error al actualizar orden');
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {}
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <h2>Panel de Control {user && `- Hola, ${user.fullName}`}</h2>
        <button onClick={logout} className="btn" style={{ border: '1px solid var(--border-color)', color: 'white', background: 'transparent' }}>Cerrar Sesión</button>
      </header>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
        <button className="btn" onClick={() => setActiveTab('stores')} style={{ background: activeTab === 'stores' ? 'var(--bg-glass)' : 'transparent', color: 'white' }}>Mis Tiendas</button>
        <button className="btn" onClick={() => setActiveTab('orders')} style={{ background: activeTab === 'orders' ? 'var(--bg-glass)' : 'transparent', color: 'white' }}>Órdenes</button>
      </div>

      {activeTab === 'stores' && (
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h3>Tus Tiendas</h3>
            <button onClick={handleCreateStore} className="btn btn-primary">Nueva Tienda</button>
          </div>

          <div className="grid-cards">
            {stores.map(store => (
              <div key={store.id} className="glass-panel" style={{ padding: '2rem' }}>
                <h4 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{store.name}</h4>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>/{store.slug}</p>
                
                <div style={{ marginBottom: '1.5rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
                  <p style={{ marginBottom: '0.5rem', fontWeight: 600 }}>Personalización</p>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Color de Acento</label>
                  <input type="color" value={store.themeColor || '#6366f1'} onChange={(e) => updateStoreTheme(store.id, 'themeColor', e.target.value)} style={{ marginBottom: '1rem' }} />
                  
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Estilo</label>
                  <select className="input-field" value={store.layoutStyle || 'modern'} onChange={(e) => updateStoreTheme(store.id, 'layoutStyle', e.target.value)}>
                    <option value="modern">Moderno (Redondeado)</option>
                    <option value="classic">Clásico (Cuadrado)</option>
                    <option value="minimal">Minimalista (Sin bordes)</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <a href={`/s/${store.slug}`} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ flex: 1, textDecoration: 'none', textAlign: 'center', fontSize: '0.9rem' }}>Ver Tienda</a>
                </div>
              </div>
            ))}
            {stores.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>Aún no tienes tiendas. ¡Crea una para empezar!</p>}
          </div>
        </section>
      )}

      {activeTab === 'orders' && (
        <section>
          <h3>Órdenes Recientes</h3>
          <div style={{ marginTop: '1.5rem', background: 'var(--bg-glass)', borderRadius: '16px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '1rem' }}>Cliente</th>
                  <th style={{ padding: '1rem' }}>Teléfono</th>
                  <th style={{ padding: '1rem' }}>Total</th>
                  <th style={{ padding: '1rem' }}>Estado</th>
                  <th style={{ padding: '1rem' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '1rem' }}>{order.customerName}</td>
                    <td style={{ padding: '1rem' }}>{order.customerPhone}</td>
                    <td style={{ padding: '1rem' }}>${order.totalPrice}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '9999px', 
                        fontSize: '0.8rem',
                        background: order.status === 'completed' ? 'rgba(34, 197, 94, 0.2)' : order.status === 'cancelled' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(234, 179, 8, 0.2)',
                        color: order.status === 'completed' ? '#4ade80' : order.status === 'cancelled' ? '#f87171' : '#facc15'
                      }}>
                        {order.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <select 
                        value={order.status} 
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        style={{ background: 'transparent', color: 'white', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '0.25rem' }}
                      >
                        <option value="pending">Pendiente</option>
                        <option value="completed">Completado</option>
                        <option value="cancelled">Cancelado</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {orders.length === 0 && <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No hay órdenes recientes.</p>}
          </div>
        </section>
      )}
    </div>
  );
};

export default Dashboard;
