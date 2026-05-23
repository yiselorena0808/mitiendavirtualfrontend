import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Plus, Edit2, Trash2, Eye, EyeOff, Star } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import ProductModal from '../components/dashboard/ProductModal';
import CategoryModal from '../components/dashboard/CategoryModal';
import SellerChatPanel from '../components/dashboard/SellerChatPanel';
import api from '../services/api';
import Toast from '../components/Toast';

const SellerDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const activeTabFromUrl = location.pathname.split('/').pop();
  
  const getTabName = (path: string | undefined) => {
    switch (path) {
      case 'dashboard': return 'summary';
      case 'stores': return 'stores';
      case 'orders': return 'orders';
      case 'products': return 'products';
      case 'categories': return 'categories';
      case 'chats': return 'chats';
      default: return 'summary';
    }
  };
  
  const activeTab = getTabName(activeTabFromUrl);
  const [user, setUser] = useState<any>(null);
  const [stores, setStores] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [chats, setChats] = useState<any[]>([]);
  
  // Modals
  const [isProductModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [storeFilter, setStoreFilter] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [storesRes, ordersRes, productsRes, catsRes, chatsRes] = await Promise.all([
        api.get('/stores'),
        api.get('/orders'),
        api.get('/products'),
        api.get('/categories'),
        api.get('/seller/chats')
      ]);
      setStores(storesRes.data);
      setOrders(ordersRes.data);
      setProducts(productsRes.data);
      setCategories(catsRes.data);
      setChats(chatsRes.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const userRes = await api.get('/auth/me');
        if (userRes.data.role !== 'seller') navigate('/buyer/orders');
        setUser(userRes.data);
        await fetchData();
      } catch (error: any) {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          setToast('Conectando al servidor (puede tardar si estaba en reposo)...');
          setTimeout(init, 5000);
        }
      }
    };
    init();
  }, [navigate]);

  // Real-time notifications polling (10 seconds)
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(async () => {
      try {
        const [chatsRes, ordersRes] = await Promise.all([
          api.get('/seller/chats'),
          api.get('/orders')
        ]);
        
        const newChats = chatsRes.data;
        const newOrders = ordersRes.data;

        // Check new messages
        if (chats.length > 0) {
          const latestCurrent = Math.max(...chats.map((c: any) => new Date(c.updatedAt).getTime()), 0);
          const latestNew = Math.max(...newChats.map((c: any) => new Date(c.updatedAt).getTime()), 0);
          if (latestNew > latestCurrent) {
            setToast('💬 ¡Tienes un nuevo mensaje!');
            new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play().catch(()=>{});
          }
        }

        // Check new orders
        if (orders.length > 0 && newOrders.length > orders.length) {
          setToast('🛍️ ¡Tienes una nueva orden!');
          new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play().catch(()=>{});
        }

        setChats(newChats);
        setOrders(newOrders);
      } catch (e) {}
    }, 10000);
    
    return () => clearInterval(interval);
  }, [chats, orders, user]);

  // Handle Actions
  const handleCreateStore = async () => {
    const name = prompt('Nombre de la tienda:');
    if (!name) return;
    try {
      const slug = name.toLowerCase().replace(/\s+/g, '-');
      const whatsapp = prompt('Número de WhatsApp:') || '123456789';
      await api.post('/stores', { name, slug, whatsappNumber: whatsapp, layoutStyle: 'modern' });
      fetchData();
      setToast('Tienda creada exitosamente. Haz clic en "Subir Banner" para añadir una imagen.');
    } catch (e) {
      alert('Error al crear tienda');
    }
  };

  const handleStoreImageUpload = async (storeId: number, field: 'bannerUrl' | 'logoUrl', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await api.post('/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const baseUrl = import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '');
      const imageUrl = res.data.url.startsWith('data:') ? res.data.url : baseUrl + res.data.url;
      await api.put(`/stores/${storeId}`, { [field]: imageUrl });
      fetchData();
      setToast('Imagen de tienda actualizada');
    } catch (err) {
      alert('Error subiendo imagen de tienda');
    }
  };

  const deleteProduct = async (id: number) => {
    if (!confirm('¿Seguro que deseas eliminar este producto?')) return;
    try {
      await api.delete(`/products/${id}`);
      fetchData();
      setToast('Producto eliminado');
    } catch(e) { alert('Error eliminando producto'); }
  };

  const toggleProductStatus = async (id: number) => {
    try {
      await api.patch(`/products/${id}/toggle-status`);
      fetchData();
      setToast('Estado actualizado');
    } catch(e) { alert('Error actualizando estado'); }
  };

  const deleteCategory = async (id: number) => {
    if (!confirm('¿Eliminar esta categoría?')) return;
    try {
      await api.delete(`/categories/${id}`);
      fetchData();
      setToast('Categoría eliminada');
    } catch(e) { alert('Error'); }
  };

  const updateOrderStatus = async (orderId: number, status: string) => {
    try {
      await api.put(`/orders/${orderId}`, { status });
      setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o));
      setToast('Estado de la orden actualizado');
    } catch (e) {
      alert('Error al actualizar el estado');
    }
  };

  // Derived state
  const filteredProducts = products.filter(p => {
    const matchStore = storeFilter ? p.storeId.toString() === storeFilter : true;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStore && matchSearch;
  });

  return (
    <div className="dashboard-layout">
      <Sidebar role="seller" />
      <main className="main-content" style={{ position: 'relative' }}>
        {user && (!user.isActive || (user.subscriptionExpiresAt && new Date(user.subscriptionExpiresAt) < new Date())) && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', maxWidth: '500px' }}>
              <h2 className="text-2xl mb-4" style={{ color: '#ef4444' }}>Cuenta Inactiva o Vencida</h2>
              <p className="text-gray mb-6">Tu suscripción o periodo de prueba ha finalizado, o tu cuenta ha sido desactivada. Por favor, contacta al administrador para renovar tu plan y volver a vender.</p>
              <button className="btn btn-primary" onClick={async () => { await api.post('/auth/logout').catch(()=>{}); localStorage.removeItem('token'); navigate('/'); }}>Cerrar Sesión</button>
            </div>
          </div>
        )}
        <header style={{ marginBottom: '2rem' }}>
          <h2 className="text-3xl">Panel de Control {user && <span className="text-gray" style={{fontSize:'1.2rem'}}>- {user.fullName}</span>}</h2>
        </header>

        {/* SUMMARY TAB */}
        {activeTab === 'summary' && (() => {
          const now = new Date();
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
          const startOfWeek = new Date(today);
          startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday as start of week
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

          let dailySales = 0;
          let weeklySales = 0;
          let monthlySales = 0;
          let totalSales = 0;

          orders.filter(o => o.status === 'completed').forEach(o => {
            const orderDate = new Date(o.createdAt).getTime();
            const price = Number(o.totalPrice) || 0;
            totalSales += price;
            if (orderDate >= today) dailySales += price;
            if (orderDate >= startOfWeek.getTime()) weeklySales += price;
            if (orderDate >= startOfMonth) monthlySales += price;
          });

          return (
            <section className="animate-fade-in">
              <h3 className="text-xl mb-4">Control de Ventas</h3>
              <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '2rem' }}>
                <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid var(--accent-primary)' }}>
                  <h4 className="text-gray text-lg">Hoy</h4>
                  <p className="text-4xl text-primary" style={{ color: 'var(--text-primary)', marginTop: '0.5rem' }}>${dailySales.toFixed(2)}</p>
                </div>
                <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', background: 'rgba(234, 179, 8, 0.1)', border: '1px solid var(--accent-secondary)' }}>
                  <h4 className="text-gray text-lg">Esta Semana</h4>
                  <p className="text-4xl text-primary" style={{ color: 'var(--text-primary)', marginTop: '0.5rem' }}>${weeklySales.toFixed(2)}</p>
                </div>
                <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid var(--accent-success)' }}>
                  <h4 className="text-gray text-lg">Este Mes</h4>
                  <p className="text-4xl text-primary" style={{ color: 'var(--text-primary)', marginTop: '0.5rem' }}>${monthlySales.toFixed(2)}</p>
                </div>
              </div>

              <h3 className="text-xl mb-4">Resumen General</h3>
              <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
                  <h4 className="text-gray text-lg">Ventas Totales (Histórico)</h4>
                  <p className="text-4xl text-primary" style={{ color: 'var(--accent-success)', marginTop: '0.5rem' }}>${totalSales.toFixed(2)}</p>
                </div>
                <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
                  <h4 className="text-gray text-lg">Pedidos Pendientes</h4>
                  <p className="text-4xl text-primary" style={{ color: 'var(--accent-secondary)', marginTop: '0.5rem' }}>{orders.filter(o => o.status === 'pending').length}</p>
                </div>
                <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
                  <h4 className="text-gray text-lg">Productos Activos</h4>
                  <p className="text-4xl text-primary" style={{ color: 'var(--text-primary)', marginTop: '0.5rem' }}>{products.filter(p => p.isActive).length}</p>
                </div>
              </div>
            </section>
          );
        })()}

        {/* STORES TAB */}
        {activeTab === 'stores' && (
          <section className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h3 className="text-xl">Gestión de Tiendas</h3>
              <button onClick={handleCreateStore} className="btn btn-primary"><Plus size={18}/> Crear Tienda</button>
            </div>
            <div className="grid-cards">
              {stores.map(store => (
                <div key={store.id} className="glass-panel" style={{ overflow: 'hidden' }}>
                  <div style={{ height: '120px', background: store.bannerUrl ? `url(${store.bannerUrl}) center/cover` : 'var(--bg-primary)' }} />
                  <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <h4 className="text-xl" style={{ color: store.themeColor }}>{store.name}</h4>
                    <p className="text-gray mb-2">/s/{store.slug}</p>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <label className="btn" style={{ flex: 1, textAlign: 'center', cursor: 'pointer', fontSize: '0.8rem', padding: '0.5rem' }}>
                        Subir Banner
                        <input type="file" accept="image/*" onChange={(e) => handleStoreImageUpload(store.id, 'bannerUrl', e)} style={{ display: 'none' }} />
                      </label>
                      <label className="btn" style={{ flex: 1, textAlign: 'center', cursor: 'pointer', fontSize: '0.8rem', padding: '0.5rem' }}>
                        Subir Logo
                        <input type="file" accept="image/*" onChange={(e) => handleStoreImageUpload(store.id, 'logoUrl', e)} style={{ display: 'none' }} />
                      </label>
                    </div>
                    <a href={`/s/${store.slug}`} target="_blank" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>Ver Tienda Pública</a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CATEGORIES TAB */}
        {activeTab === 'categories' && (
          <section className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h3 className="text-xl">Categorías</h3>
              <button onClick={() => { setEditingCategory(null); setCategoryModalOpen(true); }} className="btn btn-primary"><Plus size={18}/> Nueva Categoría</button>
            </div>
            <div className="glass-panel" style={{ padding: '1rem' }}>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '1rem' }}>Nombre</th>
                    <th style={{ padding: '1rem' }}>Tienda</th>
                    <th style={{ padding: '1rem' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map(c => (
                    <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '1rem' }}>{c.name}</td>
                      <td style={{ padding: '1rem' }} className="text-gray">{stores.find(s => s.id === c.storeId)?.name}</td>
                      <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                        <button className="btn" onClick={() => { setEditingCategory(c); setCategoryModalOpen(true); }}><Edit2 size={16}/></button>
                        <button className="btn" onClick={() => deleteCategory(c.id)}><Trash2 size={16} color="var(--accent-danger)"/></button>
                      </td>
                    </tr>
                  ))}
                  {categories.length === 0 && <tr><td colSpan={3} style={{ padding: '2rem', textAlign: 'center' }}>No hay categorías.</td></tr>}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* PRODUCTS TAB */}
        {activeTab === 'products' && (
          <section className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h3 className="text-xl">Catálogo de Productos</h3>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <select className="input-field" style={{ width: 'auto' }} value={storeFilter} onChange={e => setStoreFilter(e.target.value)}>
                  <option value="">Todas las tiendas</option>
                  {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <div style={{ position: 'relative' }}>
                  <Search size={18} style={{ position: 'absolute', top: '10px', left: '10px', color: 'var(--text-secondary)' }} />
                  <input type="text" className="input-field" placeholder="Buscar..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ paddingLeft: '2.5rem' }} />
                </div>
                <button onClick={() => { setEditingProduct(null); setProductModalOpen(true); }} className="btn btn-primary"><Plus size={18}/> Nuevo Producto</button>
              </div>
            </div>

            <div className="glass-panel" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', minWidth: '800px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
                    <th style={{ padding: '1rem' }}>Producto</th>
                    <th style={{ padding: '1rem' }}>Tienda / Categoría</th>
                    <th style={{ padding: '1rem' }}>Precio</th>
                    <th style={{ padding: '1rem' }}>Stock</th>
                    <th style={{ padding: '1rem' }}>Estado</th>
                    <th style={{ padding: '1rem', textAlign: 'right' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', opacity: p.isActive ? 1 : 0.5 }}>
                      <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '4px', background: p.imageUrl ? `url(${p.imageUrl}) center/cover` : 'var(--bg-primary)' }} />
                        <div>
                          <span style={{ fontWeight: 600 }}>{p.name} {p.isFeatured && <Star size={14} color="var(--accent-secondary)" style={{ display: 'inline' }} />}</span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontSize: '0.9rem' }}>{stores.find(s => s.id === p.storeId)?.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--accent-primary)' }}>{categories.find(c => c.id === p.categoryId)?.name || 'Sin categoría'}</div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        ${p.price} {p.discountPrice && <span style={{ textDecoration: 'line-through', color: 'var(--text-secondary)', fontSize: '0.8rem', marginLeft: '0.5rem' }}>${p.discountPrice}</span>}
                      </td>
                      <td style={{ padding: '1rem' }}>{p.stock !== null ? p.stock : '∞'}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', background: p.isActive ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)', color: p.isActive ? '#4ade80' : '#f87171' }}>
                          {p.isActive ? 'Activo' : 'Oculto'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <button className="btn" onClick={() => toggleProductStatus(p.id)} title="Alternar Visibilidad">{p.isActive ? <EyeOff size={16}/> : <Eye size={16}/>}</button>
                        <button className="btn" onClick={() => { setEditingProduct(p); setProductModalOpen(true); }}><Edit2 size={16}/></button>
                        <button className="btn" onClick={() => deleteProduct(p.id)}><Trash2 size={16} color="var(--accent-danger)"/></button>
                      </td>
                    </tr>
                  ))}
                  {filteredProducts.length === 0 && <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center' }}>No hay productos que coincidan.</td></tr>}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <section className="animate-fade-in">
            <h3 className="text-xl mb-4">Órdenes y Pedidos</h3>
            <div className="glass-panel" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '1rem' }}>ID / Fecha</th>
                    <th style={{ padding: '1rem' }}>Cliente</th>
                    <th style={{ padding: '1rem' }}>Tienda</th>
                    <th style={{ padding: '1rem' }}>Total</th>
                    <th style={{ padding: '1rem' }}>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: 600 }}>#{order.id}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{new Date(order.createdAt).toLocaleString()}</div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div>{order.customerName || 'Invitado'}</div>
                        {order.customerPhone && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{order.customerPhone}</div>}
                      </td>
                      <td style={{ padding: '1rem' }}>{stores.find(s => s.id === order.storeId)?.name}</td>
                      <td style={{ padding: '1rem', fontWeight: 600 }}>${order.totalPrice}</td>
                      <td style={{ padding: '1rem' }}>
                        <select 
                          className="input-field"
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          style={{
                            padding: '0.25rem 0.5rem',
                            fontSize: '0.9rem',
                            borderRadius: '4px',
                            background: order.status === 'completed' ? 'rgba(34, 197, 94, 0.1)' : order.status === 'cancelled' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                            color: order.status === 'completed' ? '#4ade80' : order.status === 'cancelled' ? '#f87171' : '#facc15',
                            border: '1px solid currentColor'
                          }}
                        >
                          <option value="pending">Pendiente</option>
                          <option value="completed">Completado</option>
                          <option value="cancelled">Cancelado</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && <tr><td colSpan={5} style={{ padding: '3rem', textAlign: 'center' }}>No tienes órdenes aún.</td></tr>}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* CHATS TAB */}
        {activeTab === 'chats' && (
          <section className="animate-fade-in">
            <SellerChatPanel chats={chats} />
          </section>
        )}

      </main>

      <ProductModal isOpen={isProductModalOpen} onClose={() => setProductModalOpen(false)} onSaved={fetchData} editingProduct={editingProduct} stores={stores} categories={categories} />
      <CategoryModal isOpen={isCategoryModalOpen} onClose={() => setCategoryModalOpen(false)} onSaved={fetchData} editingCategory={editingCategory} stores={stores} />
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
};

export default SellerDashboard;
