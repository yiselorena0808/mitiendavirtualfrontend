import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '../../services/api';

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  editingCategory?: any;
  stores: any[];
}

const CategoryFormModal: React.FC<CategoryFormModalProps> = ({ isOpen, onClose, onSaved, editingCategory, stores }) => {
  const [storeId, setStoreId] = useState<string>('');
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingCategory) {
      setStoreId(editingCategory.storeId.toString());
      setName(editingCategory.name);
      setSlug(editingCategory.slug);
    } else {
      setStoreId(stores.length > 0 ? stores[0].id.toString() : '');
      setName('');
      setSlug('');
    }
    setError(null);
  }, [editingCategory, isOpen, stores]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const payload = { storeId: parseInt(storeId), name, slug: slug || name.toLowerCase().replace(/\s+/g, '-') };
      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, payload);
      } else {
        await api.post('/categories', payload);
      }
      onSaved();
      onClose();
    } catch (e) {
      setError('Error al guardar categoría');
    }
  };

  return (
    <div className="drawer-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-panel animate-fade-in" style={{ background: 'var(--bg-secondary)', width: '100%', maxWidth: '500px', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h2 className="text-xl">{editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
          <button onClick={onClose} className="btn" style={{ padding: '0.5rem' }}><X size={20} /></button>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Tienda</label>
            <select className="input-field" value={storeId} onChange={e => setStoreId(e.target.value)} required>
              <option value="">Selecciona una tienda...</option>
              {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Nombre de Categoría</label>
            <input type="text" className="input-field" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Slug (URL opcional)</label>
            <input type="text" className="input-field" value={slug} onChange={e => setSlug(e.target.value)} placeholder="Ej: postres-dulces" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" onClick={onClose} className="btn">Cancelar</button>
            <button type="submit" className="btn btn-primary">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryFormModal;
