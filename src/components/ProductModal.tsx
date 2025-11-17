import React, { useState } from 'react';
import { X, Save, Upload, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ProductModalProps {
  type: 'create' | 'edit';
  product?: {
    id: string;
    title: string;
    description: string;
    price: number;
    type: 'digital' | 'physical';
    stock?: number;
    digital_content?: any;
    is_active: boolean;
  };
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

const ProductModal: React.FC<ProductModalProps> = ({
  type,
  product,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState({
    title: product?.title || '',
    description: product?.description || '',
    price: product?.price || 0,
    type: product?.type || 'digital',
    stock: product?.type === 'physical' ? (product?.stock || 0) : undefined,
    digital_content: product?.digital_content || {},
    is_active: product?.is_active ?? true,
    images: [] as File[],
    thumbnails: [] as string[]
  });
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleImageUpload = async (files: FileList) => {
    const newImages = Array.from(files);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...newImages],
      thumbnails: [...prev.thumbnails, ...newImages.map(file => URL.createObjectURL(file))]
    }));
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      thumbnails: prev.thumbnails.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Upload images if any
      const imageUrls = [];
      for (const image of formData.images) {
        const filename = `${Date.now()}-${image.name}`;
        const { data, error } = await supabase.storage
          .from('product-images')
          .upload(filename, image, {
            onUploadProgress: (progress) => {
              setUploadProgress((progress.loaded / progress.total) * 100);
            },
          });

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(data.path);

        imageUrls.push(publicUrl);
      }

      // Submit product data
      await onSubmit({
        ...formData,
        images: imageUrls
      });

      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="my-8 mx-auto w-full max-w-2xl bg-white rounded-xl shadow-xl">
        <div className="sticky top-0 z-10 bg-white p-6 border-b flex items-center justify-between rounded-t-xl">
          <h2 className="text-xl font-bold">
            {type === 'create' ? 'Nouveau produit' : 'Modifier le produit'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titre
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-coaching-primary focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-coaching-primary focus:border-transparent"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prix
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-coaching-primary focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'digital' | 'physical' })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-coaching-primary focus:border-transparent"
              >
                <option value="digital">Digital</option>
                <option value="physical">Physique</option>
              </select>
            </div>
          </div>

          {formData.type === 'physical' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock
              </label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                min="0"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-coaching-primary focus:border-transparent"
                required
              />
            </div>
          )}

          {formData.type === 'digital' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contenu digital
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="digital-content"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-coaching-primary hover:text-coaching-secondary focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-coaching-primary"
                    >
                      <span>Télécharger un fichier</span>
                      <input
                        id="digital-content"
                        name="digital-content"
                        type="file"
                        className="sr-only"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            setFormData({
                              ...formData,
                              digital_content: {
                                filename: e.target.files[0].name,
                                size: e.target.files[0].size
                              }
                            });
                          }
                        }}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">
                    PDF, ZIP jusqu'à 100MB
                  </p>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Images du produit
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="product-images"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-coaching-primary hover:text-coaching-secondary focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-coaching-primary"
                  >
                    <span>Télécharger des images</span>
                    <input
                      id="product-images"
                      name="product-images"
                      type="file"
                      multiple
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG jusqu'à 5MB
                </p>
              </div>
            </div>

            {formData.thumbnails.length > 0 && (
              <div className="mt-4 grid grid-cols-4 gap-4">
                {formData.thumbnails.map((thumbnail, index) => (
                  <div key={index} className="relative">
                    <img
                      src={thumbnail}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="h-4 w-4 text-coaching-primary focus:ring-coaching-primary border-gray-300 rounded"
            />
            <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
              Produit actif
            </label>
          </div>

          {uploadProgress > 0 && (
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-coaching-primary h-2.5 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}

          <div className="sticky bottom-0 bg-white pt-4 border-t mt-6">
            <div className="flex justify-end space-x-4">
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
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;