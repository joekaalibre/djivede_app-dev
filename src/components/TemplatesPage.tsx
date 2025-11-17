import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Copy, FileText, Mail, MessageSquare, Bell } from 'lucide-react';
import AnimatedSection from './AnimatedSection';
import TemplateEditor from './TemplateEditor';

interface Template {
  id: string;
  name: string;
  content: string;
  category: string;
  variables: string[];
  created_at: string;
  updated_at: string;
}

const TemplatesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [templates, setTemplates] = useState<Template[]>([
    {
      id: '1',
      name: 'Email de bienvenue',
      content: 'Bienvenue {{name}} dans notre communauté !',
      category: 'email',
      variables: ['name'],
      created_at: '2025-03-21T10:00:00Z',
      updated_at: '2025-03-21T10:00:00Z'
    },
    {
      id: '2',
      name: 'Message de confirmation',
      content: 'Votre rendez-vous du {{date}} a été confirmé.',
      category: 'message',
      variables: ['date'],
      created_at: '2025-03-21T11:00:00Z',
      updated_at: '2025-03-21T11:00:00Z'
    },
    {
      id: '3',
      name: 'Notification événement',
      content: 'Nouvel événement : {{event_name}} le {{event_date}}',
      category: 'notification',
      variables: ['event_name', 'event_date'],
      created_at: '2025-03-21T12:00:00Z',
      updated_at: '2025-03-21T12:00:00Z'
    }
  ]);

  const categories = [
    { id: 'all', label: 'Tous les modèles', icon: <FileText size={20} /> },
    { id: 'email', label: 'Emails', icon: <Mail size={20} /> },
    { id: 'message', label: 'Messages', icon: <MessageSquare size={20} /> },
    { id: 'notification', label: 'Notifications', icon: <Bell size={20} /> }
  ];

  const handleDeleteTemplate = (templateId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce modèle ?')) return;
    setTemplates(templates.filter(template => template.id !== templateId));
  };

  const handleDuplicateTemplate = (template: Template) => {
    const newTemplate = {
      ...template,
      id: crypto.randomUUID(),
      name: `${template.name} (copie)`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setTemplates([...templates, newTemplate]);
  };

  const handleEditTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setShowTemplateEditor(true);
  };

  const handleCreateTemplate = () => {
    setSelectedTemplate(null);
    setShowTemplateEditor(true);
  };

  const handleSaveTemplate = async (templateData: any) => {
    if (selectedTemplate) {
      // Update existing template
      setTemplates(templates.map(template =>
        template.id === selectedTemplate.id
          ? { ...template, ...templateData, updated_at: new Date().toISOString() }
          : template
      ));
    } else {
      // Create new template
      const newTemplate = {
        id: crypto.randomUUID(),
        ...templateData,
        category: selectedCategory === 'all' ? 'email' : selectedCategory,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setTemplates([...templates, newTemplate]);
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <AnimatedSection>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1 w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Rechercher un modèle..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-coaching-primary focus:border-transparent"
              />
            </div>
          </div>
          <button
            onClick={handleCreateTemplate}
            className="flex items-center px-4 py-2 bg-coaching-primary text-white rounded-lg hover:bg-coaching-secondary transition-colors"
          >
            <Plus size={20} className="mr-2" />
            Nouveau modèle
          </button>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                selectedCategory === category.id
                  ? 'bg-coaching-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.icon}
              <span className="ml-2">{category.label}</span>
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <div key={template.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    {template.category === 'email' && <Mail className="text-coaching-primary" size={20} />}
                    {template.category === 'message' && <MessageSquare className="text-coaching-primary" size={20} />}
                    {template.category === 'notification' && <Bell className="text-coaching-primary" size={20} />}
                    <h3 className="font-semibold text-gray-900">{template.name}</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditTemplate(template)}
                      className="p-1 text-gray-500 hover:text-coaching-primary transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDuplicateTemplate(template)}
                      className="p-1 text-gray-500 hover:text-coaching-primary transition-colors"
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 line-clamp-3">{template.content}</p>
                </div>

                {template.variables.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">Variables :</p>
                    <div className="flex flex-wrap gap-2">
                      {template.variables.map((variable, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                        >
                          {variable}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Créé le {new Date(template.created_at).toLocaleDateString()}</span>
                  <span>Modifié le {new Date(template.updated_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun modèle trouvé</h3>
            <p className="mt-1 text-sm text-gray-500">
              Commencez par créer un nouveau modèle ou modifiez vos critères de recherche.
            </p>
          </div>
        )}

        {/* Template Editor Modal */}
        {showTemplateEditor && (
          <TemplateEditor
            type={selectedCategory === 'all' ? 'email' : selectedCategory as 'email' | 'message' | 'notification'}
            initialData={selectedTemplate ? {
              name: selectedTemplate.name,
              content: selectedTemplate.content,
              variables: selectedTemplate.variables.map(name => ({ name, description: '' }))
            } : undefined}
            onClose={() => {
              setShowTemplateEditor(false);
              setSelectedTemplate(null);
            }}
            onSave={handleSaveTemplate}
          />
        )}
      </div>
    </AnimatedSection>
  );
};

export default TemplatesPage;