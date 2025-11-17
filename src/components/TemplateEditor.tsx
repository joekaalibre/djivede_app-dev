import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useEditor, EditorContent } from '@tiptap/react';

interface TemplateVariable {
  name: string;
  description: string;
}

interface TemplateEditorProps {
  type: 'email' | 'message' | 'notification';
  initialData?: {
    name: string;
    subject?: string;
    content: string;
    variables: TemplateVariable[];
  };
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}

const TemplateEditor: React.FC<TemplateEditorProps> = ({
  type,
  initialData,
  onClose,
  onSave
}) => {
  const [name, setName] = useState(initialData?.name || '');
  const [subject, setSubject] = useState(initialData?.subject || '');
  const [variables, setVariables] = useState<TemplateVariable[]>(
    initialData?.variables || []
  );
  const [isSaving, setIsSaving] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Commencez à écrire votre modèle...',
      }),
    ],
    content: initialData?.content || '',
  });

  const handleAddVariable = () => {
    setVariables([...variables, { name: '', description: '' }]);
  };

  const handleRemoveVariable = (index: number) => {
    setVariables(variables.filter((_, i) => i !== index));
  };

  const handleVariableChange = (index: number, field: 'name' | 'description', value: string) => {
    const newVariables = [...variables];
    newVariables[index][field] = value;
    setVariables(newVariables);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editor) return;

    setIsSaving(true);
    try {
      await onSave({
        name,
        subject: type === 'email' ? subject : undefined,
        content: editor.getHTML(),
        variables,
      });
      onClose();
    } catch (error) {
      console.error('Error saving template:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const insertVariable = (variable: string) => {
    if (editor) {
      editor.chain().focus().insertContent(`{{${variable}}}`).run();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 overflow-y-auto">
      <div className="relative my-8 mx-auto w-full max-w-4xl bg-white rounded-xl shadow-xl">
        <div className="sticky top-0 z-10 bg-white p-6 border-b flex items-center justify-between rounded-t-xl">
          <h2 className="text-xl font-bold">
            {initialData ? 'Modifier le modèle' : 'Nouveau modèle'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom du modèle
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-coaching-primary focus:border-transparent"
                required
              />
            </div>

            {type === 'email' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sujet
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-coaching-primary focus:border-transparent"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Variables disponibles
              </label>
              <div className="space-y-4">
                {variables.map((variable, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={variable.name}
                        onChange={(e) => handleVariableChange(index, 'name', e.target.value)}
                        placeholder="Nom de la variable"
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-coaching-primary focus:border-transparent"
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={variable.description}
                        onChange={(e) => handleVariableChange(index, 'description', e.target.value)}
                        placeholder="Description"
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-coaching-primary focus:border-transparent"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveVariable(index)}
                      className="px-3 py-2 text-red-600 hover:text-red-800"
                    >
                      Supprimer
                    </button>
                    <button
                      type="button"
                      onClick={() => insertVariable(variable.name)}
                      className="px-3 py-2 text-coaching-primary hover:text-coaching-secondary"
                    >
                      Insérer
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddVariable}
                  className="text-coaching-primary hover:text-coaching-secondary"
                >
                  + Ajouter une variable
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contenu
              </label>
              <div className="border rounded-lg overflow-hidden">
                <EditorContent editor={editor} className="prose max-w-none p-4" />
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center px-6 py-2 bg-coaching-primary text-white rounded-lg hover:bg-coaching-secondary transition-colors disabled:opacity-50"
            >
              <Save size={20} className="mr-2" />
              {isSaving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TemplateEditor;