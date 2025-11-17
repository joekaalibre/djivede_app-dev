import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Trash2, Settings, GripVertical, Save, Eye } from 'lucide-react';
import { supabase } from '../lib/supabase';
import AnimatedSection from './AnimatedSection';

interface Section {
  id: string;
  type: string;
  content: any;
  settings: Record<string, any>;
}

interface SectionTemplate {
  id: string;
  name: string;
  type: string;
  description: string;
  defaultContent: any;
  defaultSettings: Record<string, any>;
  icon: React.ReactNode;
}

const sectionTemplates: SectionTemplate[] = [
  {
    id: 'hero',
    name: 'Section Héro',
    type: 'hero',
    description: 'Une grande bannière d\'accueil avec titre, sous-titre et appel à l\'action',
    defaultContent: {
      title: 'Titre principal',
      subtitle: 'Sous-titre descriptif',
      buttonText: 'En savoir plus',
      buttonLink: '#',
      backgroundImage: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81'
    },
    defaultSettings: {
      height: 'large',
      overlay: true,
      textAlignment: 'center'
    },
    icon: <Eye />
  },
  {
    id: 'features',
    name: 'Caractéristiques',
    type: 'features',
    description: 'Grille de fonctionnalités ou services avec icônes',
    defaultContent: {
      title: 'Nos services',
      items: [
        { title: 'Service 1', description: 'Description du service 1' },
        { title: 'Service 2', description: 'Description du service 2' },
        { title: 'Service 3', description: 'Description du service 3' }
      ]
    },
    defaultSettings: {
      columns: 3,
      showIcons: true
    },
    icon: <Settings />
  }
];

const SortableSection = ({ section, onUpdate, onDelete }: any) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [isEditing, setIsEditing] = useState(false);
  const [sectionData, setSectionData] = useState(section);

  const handleSettingsChange = (key: string, value: any) => {
    setSectionData({
      ...sectionData,
      settings: {
        ...sectionData.settings,
        [key]: value
      }
    });
  };

  const handleContentChange = (key: string, value: any) => {
    setSectionData({
      ...sectionData,
      content: {
        ...sectionData.content,
        [key]: value
      }
    });
  };

  const handleSave = () => {
    onUpdate(section.id, sectionData);
    setIsEditing(false);
  };

  return (
    <div ref={setNodeRef} style={style} className="bg-white rounded-lg shadow-lg mb-4">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button {...attributes} {...listeners} className="cursor-move p-2 hover:bg-gray-100 rounded">
            <GripVertical size={20} />
          </button>
          <span className="font-medium">{sectionTemplates.find(t => t.type === section.type)?.name || section.type}</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-2 text-gray-600 hover:text-coaching-primary rounded"
          >
            <Settings size={20} />
          </button>
          <button
            onClick={() => onDelete(section.id)}
            className="p-2 text-red-600 hover:text-red-800 rounded"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      {isEditing && (
        <div className="p-4 border-t bg-gray-50">
          <div className="space-y-4">
            {/* Content Fields */}
            {Object.entries(sectionData.content).map(([key, value]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </label>
                {typeof value === 'string' ? (
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => handleContentChange(key, e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-coaching-primary focus:border-transparent"
                  />
                ) : null}
              </div>
            ))}

            {/* Settings Fields */}
            {Object.entries(sectionData.settings).map(([key, value]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </label>
                {typeof value === 'boolean' ? (
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => handleSettingsChange(key, e.target.checked)}
                    className="rounded text-coaching-primary focus:ring-coaching-primary"
                  />
                ) : typeof value === 'string' ? (
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => handleSettingsChange(key, e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-coaching-primary focus:border-transparent"
                  />
                ) : null}
              </div>
            ))}

            <div className="flex justify-end">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-coaching-primary text-white rounded-lg hover:bg-coaching-secondary transition-colors"
              >
                <Save size={20} className="mr-2" />
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const HomepageSectionManager = () => {
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showTemplates, setShowTemplates] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const { data: page } = await supabase
        .from('pages')
        .select('sections')
        .eq('slug', 'accueil')
        .single();

      if (page?.sections) {
        setSections(page.sections);
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSection = (template: SectionTemplate) => {
    const newSection: Section = {
      id: crypto.randomUUID(),
      type: template.type,
      content: template.defaultContent,
      settings: template.defaultSettings
    };

    setSections([...sections, newSection]);
    setShowTemplates(false);
  };

  const handleUpdateSection = (sectionId: string, updatedSection: Section) => {
    setSections(sections.map(section =>
      section.id === sectionId ? updatedSection : section
    ));
  };

  const handleDeleteSection = (sectionId: string) => {
    setSections(sections.filter(section => section.id !== sectionId));
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setSections((sections) => {
        const oldIndex = sections.findIndex((s) => s.id === active.id);
        const newIndex = sections.findIndex((s) => s.id === over.id);

        const newSections = [...sections];
        const [removed] = newSections.splice(oldIndex, 1);
        newSections.splice(newIndex, 0, removed);

        return newSections;
      });
    }
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('pages')
        .update({ sections })
        .eq('slug', 'accueil');

      if (error) throw error;
      alert('Sections enregistrées avec succès !');
    } catch (error) {
      console.error('Error saving sections:', error);
      alert('Erreur lors de l\'enregistrement des sections');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-coaching-primary"></div>
      </div>
    );
  }

  return (
    <AnimatedSection>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Sections de la page d'accueil</h2>
          <div className="flex space-x-4">
            <button
              onClick={() => setShowTemplates(true)}
              className="flex items-center px-4 py-2 bg-coaching-primary text-white rounded-lg hover:bg-coaching-secondary transition-colors"
            >
              <Plus size={20} className="mr-2" />
              Ajouter une section
            </button>
            <button
              onClick={handleSave}
              className="flex items-center px-4 py-2 border border-coaching-primary text-coaching-primary rounded-lg hover:bg-coaching-primary hover:text-white transition-colors"
            >
              <Save size={20} className="mr-2" />
              Enregistrer
            </button>
          </div>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sections.map(s => s.id)}
            strategy={verticalListSortingStrategy}
          >
            {sections.map((section) => (
              <SortableSection
                key={section.id}
                section={section}
                onUpdate={handleUpdateSection}
                onDelete={handleDeleteSection}
              />
            ))}
          </SortableContext>
        </DndContext>

        {sections.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Settings className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune section</h3>
            <p className="mt-1 text-sm text-gray-500">
              Commencez par ajouter une section à votre page d'accueil
            </p>
          </div>
        )}

        {/* Section Templates Modal */}
        {showTemplates && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
              <div className="p-6 border-b">
                <h3 className="text-xl font-bold">Ajouter une section</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  {sectionTemplates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleAddSection(template)}
                      className="p-4 border rounded-lg hover:border-coaching-primary hover:bg-coaching-primary/5 text-left transition-colors"
                    >
                      <div className="flex items-center space-x-3 mb-2">
                        {template.icon}
                        <span className="font-medium">{template.name}</span>
                      </div>
                      <p className="text-sm text-gray-600">{template.description}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-6 border-t bg-gray-50">
                <button
                  onClick={() => setShowTemplates(false)}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AnimatedSection>
  );
};

export default HomepageSectionManager;