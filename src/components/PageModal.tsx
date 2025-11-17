import React, { useState } from 'react';
import { X, Save } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string;
}

interface PageModalProps {
  type: 'create' | 'edit';
  templates: Template[];
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: {
    title: string;
    slug: string;
    template_id?: string;
    meta_description?: string;
    meta_keywords?: string[];
  };
}

const PageModal: React.FC<PageModalProps> = ({
  type,
  templates,
  onClose,
  onSubmit,
  initialData
}) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    template_id: initialData?.template_id || '',
    meta_description: initialData?.meta_description || '',
    meta_keywords: initialData?.meta_keywords?.join(', ') || ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSubmit({
        ...formData,
        meta_keywords: formData.meta_keywords.split(',').map(k => k.trim()).filter(Boolean)
      });
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {type === 'create' ? 'Créer une nouvelle page' : 'Modifier la page'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titre de la page
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => {
                const title = e.target.value;
                setFormData({
                  ...formData,
                  title,
                  slug: generateSlug(title)
                });
              }}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-coaching-primary focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL de la page
            </label>
            <div className="flex items-center">
              <span className="text-gray-500 mr-1">/</span>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-coaching-primary focus:border-transparent"
                required
              />
            </div>
          </div>

          {type === 'create' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Modèle de page
              </label>
              <select
                value={formData.template_id}
                onChange={(e) => setFormData({ ...formData, template_id: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-coaching-primary focus:border-transparent"
              >
                <option value="">Sélectionner un modèle</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (meta)
            </label>
            <textarea
              value={formData.meta_description}
              onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-coaching-primary focus:border-transparent"
              placeholder="Description pour les moteurs de recherche"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mots-clés (meta)
            </label>
            <input
              type="text"
              value={formData.meta_keywords}
              onChange={(e) => setFormData({ ...formData, meta_keywords: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-coaching-primary focus:border-transparent"
              placeholder="mot-clé1, mot-clé2, mot-clé3"
            />
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center px-4 py-2 bg-coaching-primary text-white rounded-lg hover:bg-coaching-secondary disabled:opacity-50"
            >
              <Save size={20} className="mr-2" />
              {isLoading ? 'Enregistrement...' : type === 'create' ? 'Créer' : 'Modifier'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PageModal;