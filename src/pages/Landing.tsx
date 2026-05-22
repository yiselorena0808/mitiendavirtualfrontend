import { Link } from 'react-router-dom';
import { Store, ShoppingBag, Smartphone } from 'lucide-react';

const Landing = () => {
  return (
    <div className="container" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Store size={32} color="var(--accent-primary)" />
          <h1 className="gradient-text" style={{ fontSize: '1.5rem', fontWeight: 700 }}>MiTiendaVirtual</h1>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/login" className="btn" style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>Iniciar Sesión</Link>
          <Link to="/register" className="btn btn-primary" style={{ textDecoration: 'none' }}>Empezar Gratis</Link>
        </div>
      </nav>

      <main className="animate-fade-in" style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto', marginTop: '6rem' }}>
        <div style={{ display: 'inline-block', padding: '0.5rem 1rem', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid var(--accent-primary)', borderRadius: '9999px', color: 'var(--accent-primary)', marginBottom: '2rem', fontWeight: 600 }}>
          La plataforma definitiva para e-commerce
        </div>
        <h2 style={{ fontSize: '4rem', fontWeight: 700, lineHeight: 1.1, marginBottom: '1.5rem' }}>
          Vende por WhatsApp de forma <span className="gradient-text">Profesional</span>
        </h2>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem auto' }}>
          Crea tu tienda virtual con un diseño premium en minutos, organiza tus productos por categorías y permite que tus clientes compren fácil y rápido.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/register" className="btn btn-primary" style={{ fontSize: '1.25rem', padding: '1rem 2.5rem', textDecoration: 'none' }}>
            Abrir mi tienda ahora
          </Link>
          <Link to="/login" className="btn" style={{ fontSize: '1.25rem', padding: '1rem 2.5rem', textDecoration: 'none', border: '1px solid var(--border-color)', background: 'var(--bg-glass)' }}>
            Soy Cliente
          </Link>
        </div>
      </main>

      <section className="grid-cards" style={{ marginTop: '8rem' }}>
        <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center', transition: 'transform 0.3s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-10px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
          <Store size={48} color="var(--accent-primary)" style={{ marginBottom: '1.5rem', margin: '0 auto' }} />
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Tienda Premium Personalizada</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Añade tu logo, elige el color de tu marca, agrega banners espectaculares y dale a tus clientes una experiencia de clase mundial.</p>
        </div>
        <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center', transition: 'transform 0.3s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-10px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
          <ShoppingBag size={48} color="var(--accent-secondary)" style={{ marginBottom: '1.5rem', margin: '0 auto' }} />
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Gestión Integral de Órdenes</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Panel de administración completo. Los clientes registrados podrán ver su historial, y tú podrás administrar estados de pedidos.</p>
        </div>
        <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center', transition: 'transform 0.3s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-10px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
          <Smartphone size={48} color="var(--accent-success)" style={{ marginBottom: '1.5rem', margin: '0 auto' }} />
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Cierre de Ventas Efectivo</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Los clientes utilizan un carrito moderno para ordenar. El pedido finalizado te llega detallado a tu WhatsApp para concretar el pago.</p>
        </div>
      </section>
    </div>
  );
};

export default Landing;
