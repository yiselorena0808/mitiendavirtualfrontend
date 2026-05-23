import React, { useState, useEffect } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';
import api from '../../services/api';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  editingProduct?: any;
  stores: any[];
  categories: any[];
}

const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, onSaved, editingProduct, stores, categories }) => {
  const [storeId, setStoreId] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<string>('');
  const [discountPrice, setDiscountPrice] = useState<string>('');
  const [stock, setStock] = useState<string>('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);

  useEffect(() => {
    if (editingProduct) {
      setStoreId(editingProduct.storeId?.toString() || '');
      setCategoryId(editingProduct.categoryId?.toString() || '');
      setName(editingProduct.name || '');
      setSlug(editingProduct.slug || '');
      setDescription(editingProduct.description || '');
      setPrice(editingProduct.price?.toString() || '');
      setDiscountPrice(editingProduct.discountPrice?.toString() || '');
      setStock(editingProduct.stock?.toString() || '');
      
      let parsedUrls: string[] = [];
      if (editingProduct.imageUrl) {
        try {
          parsedUrls = JSON.parse(editingProduct.imageUrl);
          if (!Array.isArray(parsedUrls)) parsedUrls = [editingProduct.imageUrl];
        } catch (e) {
          parsedUrls = [editingProduct.imageUrl];
        }
      }
      setImageUrls(parsedUrls);
      setIsActive(editingProduct.isActive ?? true);
      setIsFeatured(editingProduct.isFeatured ?? false);
    } else {
      setStoreId(stores.length > 0 ? stores[0].id.toString() : '');
      setCategoryId('');
      setName('');
      setSlug('');
      setDescription('');
      setPrice('');
      setDiscountPrice('');
      setStock('');
      setImageUrls([]);
      setIsActive(true);
      setIsFeatured(false);
    }
  }, [editingProduct, isOpen, stores]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        storeId: parseInt(storeId),
        categoryId: categoryId ? parseInt(categoryId) : null,
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
        description,
        price: parseFloat(price),
        discountPrice: discountPrice ? parseFloat(discountPrice) : null,
        stock: stock ? parseInt(stock) : null,
        imageUrl: imageUrls.length > 0 ? JSON.stringify(imageUrls) : '',
        isActive,
        isFeatured
      };

      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, payload);
      } else {
        await api.post('/products', payload);
      }
      onSaved();
      onClose();
    } catch (e) {
      alert('Error al guardar producto');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    for (const file of files) {
      const formData = new FormData();
      formData.append('image', file);

      try {
        const res = await api.post('/uploads', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        const baseUrl = import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '');
        const newUrl = res.data.url.startsWith('data:') ? res.data.url : baseUrl + res.data.url;
        setImageUrls(prev => [...prev, newUrl]);
      } catch (err) {
        alert('Error subiendo imagen ' + file.name);
      }
    }
  };

  const storeCategories = categories.filter(c => c.storeId.toString() === storeId);

  return (
    <div className="drawer-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div className="glass-panel animate-fade-in" style={{ background: 'var(--bg-secondary)', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', position: 'sticky', top: '-2rem', background: 'var(--bg-secondary)', paddingTop: '1rem', zIndex: 10 }}>
          <h2 className="text-2xl">{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</h2>
          <button onClick={onClose} className="btn" style={{ padding: '0.5rem' }}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Tienda *</label>
              <select className="input-field" value={storeId} onChange={e => { setStoreId(e.target.value); setCategoryId(''); }} required>
                <option value="">Selecciona una tienda...</option>
                {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Categoría</label>
              <select className="input-field" value={categoryId} onChange={e => setCategoryId(e.target.value)}>
                <option value="">Sin Categoría</option>
                {storeCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Nombre del Producto *</label>
              <input type="text" className="input-field" value={name} onChange={e => setName(e.target.value)} required />
            </div>

            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Descripción</label>
              <textarea className="input-field" rows={3} value={description} onChange={e => setDescription(e.target.value)} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Precio ($) *</label>
                <input type="number" step="0.01" className="input-field" value={price} onChange={e => setPrice(e.target.value)} required />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Precio Descuento</label>
                <input type="number" step="0.01" className="input-field" value={discountPrice} onChange={e => setDiscountPrice(e.target.value)} />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Imágenes del Producto</label>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <label className="btn btn-primary" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'center' }}>
                  Añadir Imágenes (Selecciona varias)
                  <input type="file" accept="image/*" multiple onChange={handleImageUpload} style={{ display: 'none' }} />
                </label>
              </div>
            </div>
            
            {/* Image Preview Grid */}
            {imageUrls.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '1rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', border: '1px dashed var(--border-color)' }}>
                {imageUrls.map((url, idx) => (
                  <div key={idx} style={{ position: 'relative', height: '100px', borderRadius: '4px', overflow: 'hidden' }}>
                    <img src={url} alt={`Preview ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button 
                      type="button"
                      onClick={() => setImageUrls(prev => prev.filter((_, i) => i !== idx))}
                      style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.7)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ height: '200px', background: 'rgba(0,0,0,0.2)', border: '1px dashed var(--border-color)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                  <ImageIcon size={48} style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
                  <p>Aún no hay imágenes</p>
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Stock (Inventario)</label>
                <input type="number" className="input-field" value={stock} onChange={e => setStock(e.target.value)} placeholder="Ej: 10" />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} style={{ width: '18px', height: '18px' }} />
                <span>Activo (Visible)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} style={{ width: '18px', height: '18px' }} />
                <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>🌟 Destacado</span>
              </label>
            </div>
          </div>

          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <button type="button" onClick={onClose} className="btn">Cancelar</button>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 2.5rem' }}>Guardar Producto</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
