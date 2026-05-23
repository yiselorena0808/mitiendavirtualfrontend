import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface StoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (storeData: any) => Promise<void>;
  initialData?: any;
}

const StoreModal: React.FC<StoreModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name || '');
        setSlug(initialData.slug || '');
        setWhatsappNumber(initialData.whatsappNumber || '');
        setDescription(initialData.description || '');
      } else {
        setName('');
        setSlug('');
        setWhatsappNumber('');
        setDescription('');
      }
    }
  }, [isOpen, initialData]);

  // Auto-generate slug from name
  useEffect(() => {
    if (!initialData && name) {
      setSlug(name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
    }
  }, [name, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave({ name, slug, whatsappNumber, description });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-fade-in" style={{ maxWidth: '500px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 className="text-2xl">{initialData ? 'Editar Tienda' : 'Nueva Tienda'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="form-label">Nombre de la Tienda</label>
            <input 
              type="text" 
              className="form-input" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              required 
              placeholder="Ej: Mi Super Tienda"
            />
          </div>

          <div>
            <label className="form-label">URL de la Tienda (Slug)</label>
            <input 
              type="text" 
              className="form-input" 
              value={slug} 
              onChange={e => setSlug(e.target.value)} 
              required 
              placeholder="mi-super-tienda"
            />
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Tu tienda estará disponible en: /s/{slug || '...'}
            </p>
          </div>

          <div>
            <label className="form-label">Número de WhatsApp (Opcional)</label>
            <input 
              type="text" 
              className="form-input" 
              value={whatsappNumber} 
              onChange={e => setWhatsappNumber(e.target.value)} 
              placeholder="Ej: 573001234567"
            />
          </div>
          
          <div>
            <label className="form-label">Descripción Breve (Opcional)</label>
            <textarea 
              className="form-input" 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              placeholder="¿Qué vendes en tu tienda?"
              rows={3}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" onClick={onClose} className="btn" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Guardar Tienda'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StoreModal;
