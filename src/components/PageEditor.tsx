import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Save, Image as ImageIcon, Link as LinkIcon, Layout, Plus, Trash2, Copy, Eye, Settings, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

interface Section {
  id: string;
  type: 'text' | 'image' | 'video' | 'form' | 'custom';
  content: any;
  settings?: any;
}

interface Page {
  id: string;
  title: string;
  slug: string;
  sections: Section[];
  settings: any;
  published: boolean;
  created_at: string;
  updated_at: string;
}

const PageEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState<Page | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder: 'Commencez à écrire...',
      }),
    ],
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (id) {
      fetchPage();
    }
  }, [id]);

  const fetchPage = async () => {
    try {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setPage(data);
    } catch (error) {
      console.error('Error fetching page:', error);
    }
  };

  const handleAddSection = (type: Section['type']) => {
    if (!page) return;

    const newSection: Section = {
      id: crypto.randomUUID(),
      type,
      content: type === 'text' ? '' : null,
      settings: {}
    };

    setPage({
      ...page,
      sections: [...page.sections, newSection]
    });
  };

  const handleUpdateSection = (sectionId: string, updates: Partial<Section>) => {
    if (!page) return;

    setPage({
      ...page,
      sections: page.sections.map(section =>
        section.id === sectionId ? { ...section, ...updates } : section
      )
    });
  };

  const handleDeleteSection = (sectionId: string) => {
    if (!page) return;

    setPage({
      ...page,
      sections: page.sections.filter(section => section.id !== sectionId)
    });
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setPage(page => {
        if (!page) return null;

        const oldIndex = page.sections.findIndex(section => section.id === active.id);
        const newIndex = page.sections.findIndex(section => section.id === over.id);

        const newSections = [...page.sections];
        const [removed] = newSections.splice(oldIndex, 1);
        newSections.splice(newIndex, 0, removed);

        return {
          ...page,
          sections: newSections
        };
      });
    }
  };

  const handleSave = async () => {
    if (!page) return;

    try {
      setIsSaving(true);

      const { error } = await supabase
        .from('pages')
        .upsert({
          id: page.id,
          title: page.title,
          slug: page.slug,
          sections: page.sections,
          settings: page.settings,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving page:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!page) return;

    try {
      const { error } = await supabase
        .from('pages')
        .update({ published: true })
        .eq('id', page.id);

      if (error) throw error;
      setPage({ ...page, published: true });
    } catch (error) {
      console.error('Error publishing page:', error);
    }
  };

  const renderSection = (section: Section) => {
    const isActive = activeSection === section.id;

    switch (section.type) {
      case 'text':
        return (
          <div className={`p-4 ${isActive ? 'ring-2 ring-coaching-primary' : ''}`}>
            <EditorContent editor={editor} />
          </div>
        );

      case 'image':
        return (
          <div className={`p-4 ${isActive ? 'ring-2 ring-coaching-primary' : ''}`}>
            {section.content ? (
              <img
                src={section.content}
                alt=""
                className="max-w-full h-auto rounded-lg"
              />
            ) : (
              <div className="flex items-center justify-center h-48 bg-gray-100 rounded-lg">
                <ImageIcon className="w-12 h-12 text-gray-400" />
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (!page) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-coaching-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="flex items-center">
                <Layout className="w-6 h-6 text-gray-400 mr-2" />
                <input
                  type="text"
                  value={page.title}
                  onChange={(e) => setPage({ ...page, title: e.target.value })}
                  className="text-xl font-semibold bg-transparent border-none focus:ring-0"
                  placeholder="Titre de la page"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <Settings size={20} />
              </button>
              <button
                onClick={() => window.open(`/${page.slug}`, '_blank')}
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
              <button
                onClick={handlePublish}
                disabled={page.published}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {page.published ? 'Publié' : 'Publier'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={page.sections.map(s => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-6">
              {page.sections.map((section) => (
                <div
                  key={section.id}
                  className="bg-white rounded-lg shadow-sm"
                  onClick={() => setActiveSection(section.id)}
                >
                  {renderSection(section)}
                </div>
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {/* Add Section Button */}
        <button
          onClick={() => handleAddSection('text')}
          className="mt-6 w-full py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:text-coaching-primary hover:border-coaching-primary transition-colors"
        >
          <Plus className="w-6 h-6 mx-auto" />
        </button>
      </div>

      {/* Settings Modal */}
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
                        value={page.slug}
                        onChange={(e) => setPage({ ...page, slug: e.target.value })}
                        className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-coaching-primary focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PageEditor;