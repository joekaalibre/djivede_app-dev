import React from 'react';
import { X } from 'lucide-react';

interface TemplatePreviewProps {
  template: {
    name: string;
    subject?: string;
    content: string;
    variables: { name: string; description: string }[];
  };
  onClose: () => void;
}

const TemplatePreview: React.FC<TemplatePreviewProps> = ({ template, onClose }) => {
  const [previewData, setPreviewData] = React.useState<Record<string, string>>(
    Object.fromEntries(template.variables.map(v => [v.name, '']))
  );

  const getPreviewContent = () => {
    let content = template.content;
    Object.entries(previewData).forEach(([key, value]) => {
      content = content.replace(new RegExp(`{{${key}}}`, 'g'), value || `{{${key}}}`);
    });
    return content;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 overflow-y-auto">
      <div className="relative my-8 mx-auto w-full max-w-4xl bg-white rounded-xl shadow-xl">
        <div className="sticky top-0 z-10 bg-white p-6 border-b flex items-center justify-between rounded-t-xl">
          <h2 className="text-xl font-bold">Aperçu du modèle</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4">Variables du modèle</h3>
            <div className="grid grid-cols-2 gap-4">
              {template.variables.map((variable) => (
                <div key={variable.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {variable.name}
                    <span className="text-gray-500 text-xs ml-2">
                      ({variable.description})
                    </span>
                  </label>
                  <input
                    type="text"
                    value={previewData[variable.name]}
                    onChange={(e) => setPreviewData({
                      ...previewData,
                      [variable.name]: e.target.value
                    })}
                    placeholder={`Valeur pour ${variable.name}`}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-coaching-primary focus:border-transparent"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <div className="max-w-2xl mx-auto">
              {template.subject && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Sujet</h4>
                  <p className="text-lg font-medium">{template.subject}</p>
                </div>
              )}

              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Contenu</h4>
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: getPreviewContent() }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplatePreview;