import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { X, Plus, Layout, Image as ImageIcon, Type, Grid, Columns, Video, FormInput as Form, Map, Code, Save, Eye, Settings, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { supabase } from '../lib/supabase';

interface Section {
  id: string;
  type: 'text' | 'image' | 'video' | 'columns' | 'grid' | 'form' | 'map' | 'code' | 'html';
  content: any;
  settings: any;
}

interface PageData {
  id?: string;
  title: string;
  slug: string;
  sections: Section[];
  settings: any;
  published: boolean;
  template_id?: string;
}

const availableSections = [
  { type: 'text', icon: <Type />, label: 'Texte' },
  { type: 'image', icon: <ImageIcon />, label: 'Image' },
  { type: 'video', icon: <Video />, label: 'Vidéo' },
  { type: 'columns', icon: <Columns />, label: 'Colonnes' },
  { type: 'grid', icon: <Grid />, label: 'Grille' },
  { type: 'form', icon: <Form />, label: 'Formulaire' },
  { type: 'map', icon: <Map />, label: 'Carte' },
  { type: 'code', icon: <Code />, label: 'Code' }
];

const defaultPages = {
  accueil: {
    title: 'Accueil',
    sections: [
      {
        id: '1',
        type: 'text',
        content: '<h1>Bienvenue sur DJIVÈDÉ</h1><p>Artiste chanteuse et coach en stratégie business</p>',
        settings: {}
      },
      {
        id: '2',
        type: 'image',
        content: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81',
        settings: {}
      }
    ]
  },
  music: {
    title: 'Ma Musique',
    sections: [
      {
        id: '1',
        type: 'text',
        content: '<h1>Mon Univers Musical</h1><p>Une fusion unique de soul, jazz et rythmes africains</p>',
        settings: {}
      },
      {
        id: '2',
        type: 'grid',
        content: null,
        settings: {
          columns: 3,
          items: [
            { title: 'Album 1', image: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc' },
            { title: 'Album 2', image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea' }
          ]
        }
      }
    ]
  },
  coaching: {
    title: 'Coaching',
    sections: [
      {
        id: '1',
        type: 'text',
        content: '<h1>Services de Coaching</h1><p>Des solutions personnalisées pour votre réussite professionnelle</p>',
        settings: {}
      },
      {
        id: '2',
        type: 'columns',
        content: null,
        settings: {
          columns: [
            { title: 'Stratégie Business', content: 'Développez une stratégie claire et efficace' },
            { title: 'Leadership', content: 'Renforcez vos compétences de leader' }
          ]
        }
      }
    ]
  },
  story: {
    title: 'Mon Histoire',
    sections: [
      {
        id: '1',
        type: 'text',
        content: '<h1>Mon Histoire</h1><p>Découvrez mon parcours unique entre musique et entrepreneuriat</p>',
        settings: {}
      }
    ]
  },
  events: {
    title: 'Événements',
    sections: [
      {
        id: '1',
        type: 'text',
        content: '<h1>Événements à Venir</h1><p>Concerts, workshops et masterclass : retrouvez tous mes événements</p>',
        settings: {}
      }
    ]
  },
  contact: {
    title: 'Contact',
    sections: [
      {
        id: '1',
        type: 'text',
        content: '<h1>Contactez-moi</h1><p>Pour toute demande de collaboration, information ou réservation</p>',
        settings: {}
      },
      {
        id: '2',
        type: 'form',
        content: null,
        settings: {
          fields: [
            { type: 'text', label: 'Nom complet', required: true },
            { type: 'email', label: 'Email', required: true },
            { type: 'textarea', label: 'Message', required: true }
          ]
        }
      }
    ]
  }
};

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

  const editor = useEditor({
    extensions: [StarterKit, Image, Link],
    content: section.content,
    editorProps: {
      attributes: {
        class: 'prose max-w-none focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      onUpdate(section.id, { content: editor.getHTML() });
    },
  });

  const renderSectionContent = () => {
    switch (section.type) {
      case 'text':
        return <EditorContent editor={editor} />;
      case 'image':
        return (
          <div className="relative group">
            {section.content ? (
              <img src={section.content} alt="" className="w-full h-auto rounded-lg" />
            ) : (
              <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                <ImageIcon className="w-12 h-12 text-gray-400" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
              <button className="px-4 py-2 bg-white text-gray-900 rounded-lg">
                Choisir une image
              </button>
            </div>
          </div>
        );
      case 'video':
        return (
          <div className="relative group">
            {section.content ? (
              <video src={section.content} controls className="w-full rounded-lg" />
            ) : (
              <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                <Video className="w-12 h-12 text-gray-400" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
              <button className="px-4 py-2 bg-white text-gray-900 rounded-lg">
                Ajouter une vidéo
              </button>
            </div>
          </div>
        );
      case 'columns':
        return (
          <div className="grid grid-cols-2 gap-4">
            {Array(2).fill(null).map((_, i) => (
              <div key={i} className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                <Layout className="w-12 h-12 text-gray-400" />
              </div>
            ))}
          </div>
        );
      case 'grid':
        return (
          <div className="grid grid-cols-3 gap-4">
            {Array(6).fill(null).map((_, i) => (
              <div key={i} className="h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                <Grid className="w-8 h-8 text-gray-400" />
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div ref={setNodeRef} style={style} className="group">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-4">
        <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button {...attributes} {...listeners} className="cursor-move p-2 hover:bg-gray-100 rounded">
              ⋮⋮
            </button>
            <span className="font-medium">{section.type.charAt(0).toUpperCase() + section.type.slice(1)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onDelete(section.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        <div className="p-4">{renderSectionContent()}</div>
      </div>
    </div>
  );
};

const PageBuilder = ({ initialData, onClose, onSave }: { 
  initialData?: PageData;
  onClose: () => void;
  onSave: (data: PageData) => Promise<void>;
}) => {
  const navigate = useNavigate();
  const [pageData, setPageData] = useState<PageData>(() => {
    if (initialData) {
      return initialData;
    }
    
    const slug = window.location.pathname.split('/').pop();
    if (slug && defaultPages[slug as keyof typeof defaultPages]) {
      const defaultPage = defaultPages[slug as keyof typeof defaultPages];
      return {
        title: defaultPage.title,
        slug: slug,
        sections: defaultPage.sections,
        settings: {},
        published: false
      };
    }
    
    return {
      title: '',
      slug: '',
      sections: [],
      settings: {},
      published: false
    };
  });

  const [showSettings, setShowSettings] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    if (initialData) {
      setPageData(initialData);
    }
  }, [initialData]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleAddSection = (type: Section['type']) => {
    const newSection: Section = {
      id: crypto.randomUUID(),
      type,
      content: '',
      settings: {}
    };
    setPageData(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }));
  };

  const handleUpdateSection = (sectionId: string, updates: Partial<Section>) => {
    setPageData(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId ? { ...section, ...updates } : section
      )
    }));
  };

  const handleDeleteSection = (sectionId: string) => {
    setPageData(prev => ({
      ...prev,
      sections: prev.sections.filter(section => section.id !== sectionId)
    }));
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setPageData(prev => {
        const oldIndex = prev.sections.findIndex(section => section.id === active.id);
        const newIndex = prev.sections.findIndex(section => section.id === over.id);

        const newSections = [...prev.sections];
        const [removed] = newSections.splice(oldIndex, 1);
        newSections.splice(newIndex, 0, removed);

        return {
          ...prev,
          sections: newSections
        };
      });
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(pageData);
      onClose();
    } catch (error) {
      console.error('Error saving page:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-100 z-50 flex">
      <div className="w-64 bg-white border-r overflow-y-auto p-4">
        <div className="mb-6">
          <h3 className="font-semibold mb-4">Sections disponibles</h3>
          <div className="grid grid-cols-2 gap-2">
            {availableSections.map((section) => (
              <button
                key={section.type}
                onClick={() => handleAddSection(section.type)}
                className="flex flex-col items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {section.icon}
                <span className="text-xs mt-2">{section.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-10 bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft size={20} />
              </button>
              <input
                type="text"
                value={pageData.title}
                onChange={(e) => setPageData({ ...pageData, title: e.target.value })}
                placeholder="Titre de la page"
                className="text-xl font-semibold bg-transparent border-none focus:ring-0"
              />
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <Settings size={20} />
              </button>
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <Eye size={20} />
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center px-4 py-2 bg-coaching-primary text-white rounded-lg hover:bg-coaching-secondary transition-colors disabled:opacity-50"
              >
                <Save size={20} className="mr-2" />
                {isSaving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 max-w-4xl mx-auto">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={pageData.sections.map(s => s.id)}
              strategy={verticalListSortingStrategy}
            >
              {pageData.sections.map((section) => (
                <SortableSection
                  key={section.id}
                  section={section}
                  onUpdate={handleUpdateSection}
                  onDelete={handleDeleteSection}
                />
              ))}
            </SortableContext>
          </DndContext>

          {pageData.sections.length === 0 && (
            <div className="text-center py-12">
              <Layout className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune section</h3>
              <p className="mt-1 text-sm text-gray-500">
                Commencez par ajouter une section depuis le menu de gauche
              </p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl w-full max-w-md"
            >
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Paramètres de la page</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      URL de la page
                    </label>
                    <div className="flex items-center">
                      <span className="text-gray-500 mr-1">/</span>
                      <input
                        type="text"
                        value={pageData.slug}
                        onChange={(e) => setPageData({ ...pageData, slug: e.target.value })}
                        className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-coaching-primary focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Publication</h3>
                      <p className="text-sm text-gray-500">Rendre la page visible publiquement</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pageData.published}
                        onChange={(e) => setPageData({ ...pageData, published: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-coaching-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-coaching-primary"></div>
                    </label>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowSettings(false)}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Fermer
                  </button>
                  <button
                    onClick={() => {
                      handleSave();
                      setShowSettings(false);
                    }}
                    className="px-4 py-2 bg-coaching-primary text-white rounded-lg hover:bg-coaching-secondary transition-colors"
                  >
                    Enregistrer
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PageBuilder;