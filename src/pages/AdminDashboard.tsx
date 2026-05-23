import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import { Users, Store as StoreIcon, Activity, Key } from 'lucide-react';
import api from '../services/api';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<'resumen' | 'vendedores' | 'clientes' | 'tiendas' | 'productos'>('resumen');
  const [stats, setStats] = useState({ totalSellers: 0, totalBuyers: 0, activeSellers: 0 });
  const [sellers, setSellers] = useState<any[]>([]);
  const [buyers, setBuyers] = useState<any[]>([]);
  const [globalStores, setGlobalStores] = useState<any[]>([]);
  const [globalProducts, setGlobalProducts] = useState<any[]>([]);
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

        const [statsRes, sellersRes, buyersRes, storesRes, productsRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/sellers'),
          api.get('/admin/buyers'),
          api.get('/admin/stores'),
          api.get('/admin/products')
        ]);
        
        setStats(statsRes.data);
        setSellers(sellersRes.data);
        setBuyers(buyersRes.data);
        setGlobalStores(storesRes.data);
        setGlobalProducts(productsRes.data);
      } catch (error: any) {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          console.error("Error fetching admin data:", error);
          // Removed infinite loop setTimeout to prevent crashes
        }
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

  const handleUpdatePassword = async (userId: number, email: string) => {
    const newPassword = prompt(`Introduce la nueva contraseña para el usuario ${email}:`);
    if (!newPassword) return;
    if (newPassword.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    try {
      await api.put(`/admin/users/${userId}/password`, { password: newPassword });
      alert(`Contraseña actualizada correctamente para ${email}`);
    } catch (e) {
      alert('Error al actualizar la contraseña');
    }
  };

  if (!user) return null;

  return (
    <div className="dashboard-layout">
      <Sidebar role="admin" />
      <main className="main-content">
        <header style={{ marginBottom: '2rem' }}>
          <h2 className="text-3xl">Centro de Comando</h2>
          <p className="text-gray">Gestión global de la plataforma MiTienda.</p>
        </header>

        <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          <button 
            onClick={() => setActiveTab('resumen')}
            style={{ whiteSpace: 'nowrap', background: 'none', border: 'none', padding: '1rem', color: activeTab === 'resumen' ? 'var(--text-primary)' : 'var(--text-secondary)', borderBottom: activeTab === 'resumen' ? '2px solid var(--accent-primary)' : '2px solid transparent', cursor: 'pointer', fontWeight: 600 }}
          >
            Resumen
          </button>
          <button 
            onClick={() => setActiveTab('vendedores')}
            style={{ whiteSpace: 'nowrap', background: 'none', border: 'none', padding: '1rem', color: activeTab === 'vendedores' ? 'var(--text-primary)' : 'var(--text-secondary)', borderBottom: activeTab === 'vendedores' ? '2px solid var(--accent-primary)' : '2px solid transparent', cursor: 'pointer', fontWeight: 600 }}
          >
            Vendedores
          </button>
          <button 
            onClick={() => setActiveTab('clientes')}
            style={{ whiteSpace: 'nowrap', background: 'none', border: 'none', padding: '1rem', color: activeTab === 'clientes' ? 'var(--text-primary)' : 'var(--text-secondary)', borderBottom: activeTab === 'clientes' ? '2px solid var(--accent-primary)' : '2px solid transparent', cursor: 'pointer', fontWeight: 600 }}
          >
            Clientes
          </button>
          <button 
            onClick={() => setActiveTab('tiendas')}
            style={{ whiteSpace: 'nowrap', background: 'none', border: 'none', padding: '1rem', color: activeTab === 'tiendas' ? 'var(--text-primary)' : 'var(--text-secondary)', borderBottom: activeTab === 'tiendas' ? '2px solid var(--accent-primary)' : '2px solid transparent', cursor: 'pointer', fontWeight: 600 }}
          >
            Tiendas
          </button>
          <button 
            onClick={() => setActiveTab('productos')}
            style={{ whiteSpace: 'nowrap', background: 'none', border: 'none', padding: '1rem', color: activeTab === 'productos' ? 'var(--text-primary)' : 'var(--text-secondary)', borderBottom: activeTab === 'productos' ? '2px solid var(--accent-primary)' : '2px solid transparent', cursor: 'pointer', fontWeight: 600 }}
          >
            Productos
          </button>
        </div>

        {activeTab === 'resumen' && (
          <section className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            <div className="glass-panel" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '1rem', borderRadius: '12px', color: 'var(--accent-primary)' }}>
                <StoreIcon size={32} />
              </div>
              <div>
                <p className="text-gray" style={{ margin: 0, fontSize: '0.9rem' }}>Total Vendedores</p>
                <h3 style={{ fontSize: '2rem', margin: 0 }}>{stats.totalSellers}</h3>
              </div>
            </div>
            
            <div className="glass-panel" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ background: 'rgba(34, 197, 94, 0.1)', padding: '1rem', borderRadius: '12px', color: '#4ade80' }}>
                <Activity size={32} />
              </div>
              <div>
                <p className="text-gray" style={{ margin: 0, fontSize: '0.9rem' }}>Vendedores Activos</p>
                <h3 style={{ fontSize: '2rem', margin: 0 }}>{stats.activeSellers}</h3>
              </div>
            </div>
            
            <div className="glass-panel" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ background: 'rgba(236, 72, 153, 0.1)', padding: '1rem', borderRadius: '12px', color: '#ec4899' }}>
                <Users size={32} />
              </div>
              <div>
                <p className="text-gray" style={{ margin: 0, fontSize: '0.9rem' }}>Total Clientes</p>
                <h3 style={{ fontSize: '2rem', margin: 0 }}>{stats.totalBuyers}</h3>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'vendedores' && (
          <section className="animate-fade-in">
            <h3 className="text-2xl mb-4">Gestión de Vendedores</h3>
            <div className="glass-panel" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '1.5rem 1rem' }}>Vendedor</th>
                    <th style={{ padding: '1.5rem 1rem' }}>Estado</th>
                    <th style={{ padding: '1.5rem 1rem' }}>Suscripción</th>
                    <th style={{ padding: '1.5rem 1rem' }}>Añadir Días</th>
                    <th style={{ padding: '1.5rem 1rem' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {sellers.map(seller => {
                    const isExpired = seller.subscriptionExpiresAt ? new Date(seller.subscriptionExpiresAt) < new Date() : true;
                    return (
                      <tr key={seller.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '1.5rem 1rem' }}>
                          <div style={{ fontWeight: 600 }}>{seller.fullName}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{seller.email}</div>
                        </td>
                        <td style={{ padding: '1.5rem 1rem' }}>
                          <button 
                            onClick={() => toggleActiveStatus(seller.id, seller.isActive)}
                            style={{ padding: '0.4rem 0.8rem', borderRadius: '9999px', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, background: seller.isActive ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: seller.isActive ? '#4ade80' : '#f87171' }}
                          >
                            {seller.isActive ? 'Activo' : 'Inactivo'}
                          </button>
                        </td>
                        <td style={{ padding: '1.5rem 1rem' }}>
                          <div style={{ textTransform: 'capitalize', fontWeight: 600 }}>{seller.planType || 'Gratis'}</div>
                          {seller.subscriptionExpiresAt ? (
                            <div style={{ fontSize: '0.8rem', color: isExpired ? '#f87171' : 'var(--text-secondary)' }}>
                              Vence: {new Date(seller.subscriptionExpiresAt).toLocaleDateString()}
                            </div>
                          ) : <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Sin plan</div>}
                        </td>
                        <td style={{ padding: '1.5rem 1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <button className="btn btn-primary" style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }} onClick={() => addSubscriptionDays(seller.id, 7, 'semanal')}>+7D</button>
                          <button className="btn btn-primary" style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }} onClick={() => addSubscriptionDays(seller.id, 15, 'quincenal')}>+15D</button>
                          <button className="btn btn-primary" style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }} onClick={() => addSubscriptionDays(seller.id, 30, 'mensual')}>+30D</button>
                        </td>
                        <td style={{ padding: '1.5rem 1rem' }}>
                          <button onClick={() => handleUpdatePassword(seller.id, seller.email)} className="btn" style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }} title="Cambiar Contraseña">
                            <Key size={14} /> Clave
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === 'clientes' && (
          <section className="animate-fade-in">
            <h3 className="text-2xl mb-4">Lista de Clientes Registrados</h3>
            <div className="glass-panel" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '1.5rem 1rem' }}>Nombre</th>
                    <th style={{ padding: '1.5rem 1rem' }}>Email</th>
                    <th style={{ padding: '1.5rem 1rem' }}>Fecha de Registro</th>
                    <th style={{ padding: '1.5rem 1rem' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {buyers.map(buyer => (
                    <tr key={buyer.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '1.5rem 1rem', fontWeight: 600 }}>{buyer.fullName}</td>
                      <td style={{ padding: '1.5rem 1rem', color: 'var(--text-secondary)' }}>{buyer.email}</td>
                      <td style={{ padding: '1.5rem 1rem' }}>{new Date(buyer.createdAt).toLocaleDateString()}</td>
                      <td style={{ padding: '1.5rem 1rem' }}>
                        <button onClick={() => handleUpdatePassword(buyer.id, buyer.email)} className="btn" style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                          <Key size={14} /> Reset Clave
                        </button>
                      </td>
                    </tr>
                  ))}
                  {buyers.length === 0 && (
                    <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No hay clientes registrados aún.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === 'tiendas' && (
          <section className="animate-fade-in">
            <h3 className="text-2xl mb-4">Catálogo Global de Tiendas</h3>
            <div className="glass-panel" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '1.5rem 1rem' }}>Tienda</th>
                    <th style={{ padding: '1.5rem 1rem' }}>Vendedor</th>
                    <th style={{ padding: '1.5rem 1rem' }}>Fecha Creación</th>
                    <th style={{ padding: '1.5rem 1rem' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {globalStores.map(store => (
                    <tr key={store.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '1.5rem 1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {store.logoUrl ? (
                          <img src={store.logoUrl} alt="Logo" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><StoreIcon size={20} /></div>
                        )}
                        <div>
                          <div style={{ fontWeight: 600 }}>{store.name}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>/{store.slug}</div>
                        </div>
                      </td>
                      <td style={{ padding: '1.5rem 1rem' }}>{store.user?.fullName || 'Desconocido'}</td>
                      <td style={{ padding: '1.5rem 1rem' }}>{new Date(store.createdAt).toLocaleDateString()}</td>
                      <td style={{ padding: '1.5rem 1rem' }}>
                        <a href={`/s/${store.slug}`} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', textDecoration: 'none', display: 'inline-block' }}>
                          Visitar Tienda
                        </a>
                      </td>
                    </tr>
                  ))}
                  {globalStores.length === 0 && (
                    <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No hay tiendas en la plataforma.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === 'productos' && (
          <section className="animate-fade-in">
            <h3 className="text-2xl mb-4">Catálogo Global de Productos</h3>
            <div className="glass-panel" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '1.5rem 1rem' }}>Producto</th>
                    <th style={{ padding: '1.5rem 1rem' }}>Tienda</th>
                    <th style={{ padding: '1.5rem 1rem' }}>Precio</th>
                    <th style={{ padding: '1.5rem 1rem' }}>Stock</th>
                    <th style={{ padding: '1.5rem 1rem' }}>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {globalProducts.map(product => {
                    let mainImg = null;
                    if (product.imageUrl) {
                      try {
                        const parsed = JSON.parse(product.imageUrl);
                        mainImg = Array.isArray(parsed) ? parsed[0] : parsed;
                      } catch(e) {
                        mainImg = product.imageUrl;
                      }
                    }

                    return (
                      <tr key={product.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '1.5rem 1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          {mainImg ? (
                            <img src={mainImg} alt="Prod" style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '40px', height: '40px', borderRadius: '4px', background: 'var(--bg-secondary)' }} />
                          )}
                          <div style={{ fontWeight: 600 }}>{product.name}</div>
                        </td>
                        <td style={{ padding: '1.5rem 1rem', color: 'var(--accent-primary)' }}>{product.store?.name || 'Desconocida'}</td>
                        <td style={{ padding: '1.5rem 1rem' }}>${product.price}</td>
                        <td style={{ padding: '1.5rem 1rem' }}>{product.stock !== null ? product.stock : '∞'}</td>
                        <td style={{ padding: '1.5rem 1rem' }}>
                          <span style={{ padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.8rem', background: product.isActive ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)', color: product.isActive ? '#4ade80' : '#f87171' }}>
                            {product.isActive ? 'Activo' : 'Oculto'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {globalProducts.length === 0 && (
                    <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No hay productos subidos a la plataforma.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

      </main>
    </div>
  );
};

export default AdminDashboard;
