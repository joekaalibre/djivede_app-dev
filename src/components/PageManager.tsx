import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Eye, Edit2, Trash2, Copy, Globe, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import AnimatedSection from './AnimatedSection';
import PageBuilder from './PageBuilder';

interface Page {
  id: string;
  title: string;
  slug: string;
  sections: any[];
  settings: any;
  published: boolean;
  created_at: string;
  updated_at: string;
}

const PageManager = () => {
  const navigate = useNavigate();
  const [pages, setPages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showBuilder, setShowBuilder] = useState(false);
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching pages:', error);
        throw error;
      }

      console.log('Pages loaded from DB:', data);
      setPages(data || []);
    } catch (error) {
      console.error('Error fetching pages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePage = () => {
    setSelectedPage(null);
    setShowBuilder(true);
  };

  const handleEditPage = (page: Page) => {
    console.log('Editing page:', page);
    setSelectedPage(page);
    setShowBuilder(true);
  };

  const handleSavePage = async (pageData: any) => {
    try {
      console.log('Saving page data:', pageData);
      
      if (selectedPage) {
        // Update existing page
        const { error } = await supabase
          .from('pages')
          .update({
            title: pageData.title,
            slug: pageData.slug,
            sections: pageData.sections,
            settings: pageData.settings,
            published: pageData.published,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedPage.id);

        if (error) throw error;
      } else {
        // Create new page
        const { data, error } = await supabase
          .from('pages')
          .insert([{
            title: pageData.title,
            slug: pageData.slug,
            sections: pageData.sections,
            settings: pageData.settings,
            published: pageData.published
          }])
          .select()
          .single();

        if (error) throw error;
        if (data) {
          navigate(`/dashboard/pages/${data.id}`);
          return;
        }
      }

      await fetchPages();
    } catch (error) {
      console.error('Error saving page:', error);
      throw error;
    }
  };

  const handleDuplicatePage = async (page: Page) => {
    try {
      const { data, error } = await supabase
        .from('pages')
        .insert([{
          title: `${page.title} (copie)`,
          slug: `${page.slug}-copie`,
          sections: page.sections,
          settings: page.settings,
          published: false
        }])
        .select();

      if (error) throw error;
      await fetchPages();
    } catch (error) {
      console.error('Error duplicating page:', error);
    }
  };

  const handleDeletePage = async (pageId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette page ?')) return;

    try {
      const { error } = await supabase
        .from('pages')
        .delete()
        .eq('id', pageId);

      if (error) throw error;
      await fetchPages();
    } catch (error) {
      console.error('Error deleting page:', error);
    }
  };

  const handleTogglePublish = async (pageId: string, published: boolean) => {
    try {
      const { error } = await supabase
        .from('pages')
        .update({ published: !published })
        .eq('id', pageId);

      if (error) throw error;
      await fetchPages();
    } catch (error) {
      console.error('Error toggling page publish status:', error);
    }
  };

  const filteredPages = pages.filter(page =>
    page.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1 w-full">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher une page..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-coaching-primary focus:border-transparent"
              />
            </div>
          </div>
          <button
            onClick={handleCreatePage}
            className="flex items-center px-4 py-2 bg-coaching-primary text-white rounded-lg hover:bg-coaching-secondary transition-colors"
          >
            <Plus size={20} className="mr-2" />
            Nouvelle page
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Page
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    URL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dernière modification
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPages.map((page) => (
                  <tr key={page.id}>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {page.title}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">
                        /{page.slug}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleTogglePublish(page.id, page.published)}
                        className={`px-2 py-1 text-xs rounded-full ${
                          page.published
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {page.published ? 'Publié' : 'Brouillon'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(page.updated_at), 'Pp', { locale: fr })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditPage(page)}
                        className="text-coaching-primary hover:text-coaching-secondary mr-3"
                        title="Modifier"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDuplicatePage(page)}
                        className="text-coaching-primary hover:text-coaching-secondary mr-3"
                        title="Dupliquer"
                      >
                        <Copy size={18} />
                      </button>
                      <button
                        onClick={() => window.open(`/${page.slug}`, '_blank')}
                        className="text-coaching-primary hover:text-coaching-secondary mr-3"
                        title="Voir la page"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleDeletePage(page.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Supprimer"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredPages.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      Aucune page trouvée
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Page Builder Modal */}
      {showBuilder && (
        <PageBuilder
          initialData={selectedPage || undefined}
          onClose={() => {
            setShowBuilder(false);
            setSelectedPage(null);
          }}
          onSave={handleSavePage}
        />
      )}
    </AnimatedSection>
  );
};

export default PageManager;