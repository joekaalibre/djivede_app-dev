import React from 'react';
import { X } from 'lucide-react';

interface FormField {
  id: string;
  type: string;
  label: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
}

interface FormPreviewProps {
  form: {
    title: string;
    description: string | null;
    fields: FormField[];
  } | null;
  onClose: () => void;
}

const FormPreview: React.FC<FormPreviewProps> = ({ form, onClose }) => {
  if (!form) return null;

  const renderField = (field: FormField) => {
    switch (field.type) {
      case 'text':
      case 'tel':
      case 'number':
        return (
          <input
            type={field.type}
            placeholder={field.placeholder}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-coaching-primary focus:border-transparent"
            required={field.required}
          />
        );
      case 'email':
        return (
          <input
            type="email"
            placeholder={field.placeholder}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-coaching-primary focus:border-transparent"
            required={field.required}
          />
        );
      case 'textarea':
        return (
          <textarea
            placeholder={field.placeholder}
            rows={4}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-coaching-primary focus:border-transparent"
            required={field.required}
          />
        );
      case 'select':
        return (
          <select
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-coaching-primary focus:border-transparent"
            required={field.required}
          >
            <option value="">Sélectionnez une option</option>
            {field.options?.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <label key={index} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={field.id}
                  value={option}
                  required={field.required}
                  className="text-coaching-primary focus:ring-coaching-primary"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );
      case 'checkbox':
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <label key={index} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  value={option}
                  className="text-coaching-primary focus:ring-coaching-primary rounded"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );
      case 'phone':
        return (
          <input
            type="tel"
            placeholder={field.placeholder || 'Entrez votre numéro de téléphone'}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-coaching-primary focus:border-transparent"
            required={field.required}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 overflow-y-auto">
      <div className="relative my-8 mx-auto w-full max-w-2xl bg-white rounded-xl shadow-xl">
        <div className="sticky top-0 z-10 bg-white p-6 border-b flex items-center justify-between rounded-t-xl">
          <h2 className="text-xl font-bold">Aperçu du formulaire</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6">
          <div className="max-w-xl mx-auto">
            <h1 className="text-2xl font-bold mb-2">{form.title}</h1>
            {form.description && (
              <p className="text-gray-600 mb-8">{form.description}</p>
            )}

            <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
              {form.fields.map((field) => (
                <div key={field.id}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {renderField(field)}
                </div>
              ))}

              <button
                type="submit"
                className="w-full px-6 py-3 bg-coaching-primary text-white rounded-lg hover:bg-coaching-secondary transition-colors"
              >
                Envoyer
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormPreview;