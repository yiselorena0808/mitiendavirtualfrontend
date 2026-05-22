import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ShoppingCart, Search, Filter, Star } from 'lucide-react';
import api from '../services/api';
import Toast from '../components/Toast';
import CartDrawer from '../components/shop/CartDrawer';
import ChatWidget from '../components/shop/ChatWidget';

const Storefront = () => {
  const { slug } = useParams();
  const [store, setStore] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  
  const [cart, setCart] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    api.get('/auth/me').then(res => setUser(res.data)).catch(() => {});

    const fetchStoreData = async () => {
      try {
        const storeRes = await api.get(`/public/stores/${slug}`);
        setStore(storeRes.data);
        
        const [productsRes, categoriesRes] = await Promise.all([
          api.get(`/public/stores/${slug}/products`),
          api.get(`/public/stores/${slug}/categories`)
        ]);
        
        setProducts(productsRes.data);
        setCategories(categoriesRes.data);
        
        if (storeRes.data.themeColor) {
          document.documentElement.style.setProperty('--accent-primary', storeRes.data.themeColor);
        }
      } catch (e) {
        console.error('Store not found');
      }
    };
    fetchStoreData();
    
    return () => {
      document.documentElement.style.setProperty('--accent-primary', '#6366f1');
    };
  }, [slug]);

  // Real-time notifications for new products (15 seconds)
  useEffect(() => {
    if (!store) return;
    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/public/stores/${slug}/products`);
        if (products.length > 0 && res.data.length > products.length) {
          setToastMessage('✨ ¡El vendedor acaba de añadir nuevos productos!');
          new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play().catch(()=>{});
        }
        setProducts(res.data);
      } catch (e) {}
    }, 15000);
    return () => clearInterval(interval);
  }, [products, slug, store]);

  const addToCart = (product: any) => {
    if (product.stock === 0) {
      setToastMessage('Producto agotado');
      return;
    }
    
    const existing = cart.find(item => item.product.id === product.id);
    if (existing) {
      if (product.stock !== null && existing.quantity >= product.stock) {
        setToastMessage(`Solo hay ${product.stock} unidades disponibles.`);
        return;
      }
      setCart(cart.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
    setToastMessage(`${product.name} agregado al carrito 🛒`);
  };

  const total = cart.reduce((acc, item) => {
    const price = item.product.discountPrice || item.product.price;
    return acc + (price * item.quantity);
  }, 0);

  const handleCheckout = async (method: 'whatsapp' | 'chat') => {
    if (!user) {
      setToastMessage('Por favor inicia sesión para completar tu pedido.');
      return;
    }

    try {
      const items = cart.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        unitPrice: item.product.discountPrice || item.product.price
      }));

      await api.post(`/public/stores/${store.slug}/orders`, {
        customerName: user.fullName || 'Cliente',
        customerPhone: 'No provisto',
        items
      });

      // Prepare order summary text
      const text = `Hola, quiero hacer un pedido:\n\n${cart.map(c => `${c.quantity}x ${c.product.name}`).join('\n')}\n\nTotal: $${total}`;

      if (method === 'whatsapp') {
        const url = `https://wa.me/${store.whatsappNumber}?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
        setToastMessage('Pedido enviado. Redirigiendo a WhatsApp...');
      } else if (method === 'chat') {
        // Send internal chat message automatically
        let chatRes = await api.get(`/chats/store/${store.id}`);
        await api.post(`/chats/${chatRes.data.id}/messages`, { content: text });
        setToastMessage('Pedido enviado por chat interno. Abre el chat para continuar.');
      }

      setCart([]);
      setIsCartOpen(false);
    } catch (e) {
      setToastMessage('Error al procesar el pedido. Intenta de nuevo.');
    }
  };

  if (!store) return <div className="container" style={{ paddingTop: '4rem', textAlign: 'center' }}>Cargando tienda...</div>;

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? p.categoryId === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  const getCardStyle = () => {
    switch (store.layoutStyle) {
      case 'classic': return { borderRadius: '4px', border: '1px solid var(--border-color)', boxShadow: 'none' };
      case 'minimal': return { borderRadius: '0px', border: 'none', borderBottom: '1px solid var(--border-color)', background: 'transparent', boxShadow: 'none' };
      default: return {}; 
    }
  };

  return (
    <div style={{ paddingBottom: '6rem' }}>
      <nav style={{ padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-primary)', position: 'sticky', top: 0, zIndex: 30, borderBottom: '1px solid var(--border-color)' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {store.logoUrl ? <img src={store.logoUrl} alt="Logo" style={{ height: '32px', borderRadius: '4px' }} /> : null}
          {store.name}
        </h1>
        <button onClick={() => setIsCartOpen(true)} className="btn btn-primary" style={{ position: 'relative' }}>
          <ShoppingCart size={20} />
          {cart.length > 0 && (
            <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--accent-secondary)', color: 'white', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>
              {cart.reduce((acc, item) => acc + item.quantity, 0)}
            </span>
          )}
        </button>
      </nav>

      <div className="store-hero" style={{ backgroundImage: `url(${store.bannerUrl || 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2000&auto=format&fit=crop'})` }}>
        <div className="store-hero-content">
          <h2 className="text-4xl" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{store.name}</h2>
          {store.description && <p className="text-xl" style={{ marginTop: '0.5rem', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>{store.description}</p>}
        </div>
      </div>

      <div className="container" style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
        <aside style={{ flex: '0 0 250px' }}>
          <div style={{ position: 'sticky', top: '6rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}><Search size={20} /> Buscar</h3>
            <input 
              type="text" 
              placeholder="Ej. Zapatos..." 
              className="input-field" 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ marginBottom: '2rem' }}
            />

            {categories.length > 0 && (
              <>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}><Filter size={20} /> Categorías</h3>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <li>
                    <button 
                      onClick={() => setSelectedCategory(null)}
                      style={{ background: 'transparent', border: 'none', color: selectedCategory === null ? 'var(--accent-primary)' : 'var(--text-secondary)', cursor: 'pointer', textAlign: 'left', fontWeight: selectedCategory === null ? 600 : 400 }}
                    >
                      Todas
                    </button>
                  </li>
                  {categories.map((cat: any) => (
                    <li key={cat.id}>
                      <button 
                        onClick={() => setSelectedCategory(cat.id)}
                        style={{ background: 'transparent', border: 'none', color: selectedCategory === cat.id ? 'var(--accent-primary)' : 'var(--text-secondary)', cursor: 'pointer', textAlign: 'left', fontWeight: selectedCategory === cat.id ? 600 : 400 }}
                      >
                        {cat.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </aside>

        <main style={{ flex: '1 1 500px' }}>
          <div className="grid-cards">
            {filteredProducts.map(product => {
              const isOutOfStock = product.stock === 0;
              const hasDiscount = product.discountPrice && product.discountPrice < product.price;

              return (
                <div key={product.id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', opacity: isOutOfStock ? 0.6 : 1, position: 'relative', ...getCardStyle() }}>
                  {product.isFeatured && (
                    <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'var(--accent-secondary)', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem', zIndex: 2 }}>
                      <Star size={14} fill="currentColor" /> Destacado
                    </div>
                  )}
                  {product.imageUrl ? (
                    <div style={{ height: '200px', backgroundImage: `url(${product.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                  ) : (
                    <div style={{ height: '200px', background: 'var(--bg-secondary)' }} />
                  )}
                  
                  <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ flex: 1 }}>
                      {product.categoryId && <span style={{ color: 'var(--accent-primary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>{categories.find(c => c.id === product.categoryId)?.name}</span>}
                      <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', marginTop: '0.25rem' }}>{product.name}</h3>
                      <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>{product.description}</p>
                      
                      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {hasDiscount ? (
                          <>
                            <span style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>${product.discountPrice}</span>
                            <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', textDecoration: 'line-through' }}>${product.price}</span>
                          </>
                        ) : (
                          <span style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>${product.price}</span>
                        )}
                      </div>
                    </div>

                    {isOutOfStock ? (
                      <button disabled className="btn" style={{ width: '100%', borderRadius: store.layoutStyle === 'classic' ? '4px' : '9999px', background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                        Agotado
                      </button>
                    ) : (
                      <button onClick={() => addToCart(product)} className="btn btn-primary" style={{ width: '100%', borderRadius: store.layoutStyle === 'classic' ? '4px' : '9999px' }}>
                        Añadir al carrito
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            {filteredProducts.length === 0 && <div className="glass-panel" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 2rem' }}>
              <Search size={48} color="var(--text-secondary)" style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
              <h3 className="text-xl">No se encontraron productos</h3>
              <p className="text-gray">Intenta con otros filtros de búsqueda.</p>
            </div>}
          </div>
        </main>
      </div>

      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        cart={cart} 
        total={total} 
        onCheckout={handleCheckout} 
      />

      <ChatWidget 
        storeId={store.id} 
        storeName={store.name} 
        themeColor={store.themeColor} 
        isLoggedIn={!!user} 
      />

      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
    </div>
  );
};

export default Storefront;
