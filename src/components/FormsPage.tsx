import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Copy, Eye, Globe, Link } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuth } from '../components/AuthProvider';
import AnimatedSection from './AnimatedSection';
import FormPreview from './FormPreview';
import FormEditor from './FormEditor';

interface FormField {
  id: string;
  type: string;
  label: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
}

interface Form {
  id: string;
  title: string;
  description: string | null;
  fields: FormField[];
  settings: any;
  created_at: string;
  submissions_count?: number;
  published: boolean;
  public_url?: string;
}

const FormsPage = () => {
  const { user } = useAuth();
  const [forms, setForms] = useState<Form[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showEditor, setShowEditor] = useState(false);

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      setIsLoading(true);
      
      // Log pour vérifier l'utilisateur actuel
      console.log('Current user:', user);

      // Récupérer les formulaires de l'utilisateur connecté
      const { data: formsData, error: formsError } = await supabase
        .from('forms')
        .select('*')
        .eq('created_by', user?.id)
        .order('created_at', { ascending: false });

      if (formsError) {
        console.error('Error fetching forms:', formsError);
        throw formsError;
      }

      // Log pour vérifier les données reçues
      console.log('Forms data from DB:', formsData);

      const formsWithCounts = await Promise.all(
        (formsData || []).map(async (form) => {
          const { count } = await supabase
            .from('form_submissions')
            .select('*', { count: 'exact' })
            .eq('form_id', form.id);

          return {
            ...form,
            submissions_count: count || 0
          };
        })
      );

      // Log pour vérifier les données transformées
      console.log('Forms with counts:', formsWithCounts);

      setForms(formsWithCounts);
    } catch (error) {
      console.error('Error fetching forms:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNewForm = async () => {
    try {
      const newForm = {
        title: 'Nouveau formulaire',
        description: '',
        fields: [],
        settings: {},
        created_by: user?.id,
        published: false
      };

      // Log pour vérifier les données avant insertion
      console.log('Creating new form:', newForm);

      const { data, error } = await supabase
        .from('forms')
        .insert([newForm])
        .select()
        .single();

      if (error) {
        console.error('Error creating form:', error);
        throw error;
      }

      // Log pour vérifier la réponse de la base de données
      console.log('Created form response:', data);

      // Rafraîchir la liste des formulaires
      await fetchForms();

      // Ouvrir l'éditeur avec le nouveau formulaire
      if (data) {
        setSelectedForm(data);
        setShowEditor(true);
      }
    } catch (error) {
      console.error('Error in handleCreateNewForm:', error);
    }
  };

  const handleDeleteForm = async (formId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce formulaire ?')) return;

    try {
      const { error } = await supabase
        .from('forms')
        .delete()
        .eq('id', formId)
        .eq('created_by', user?.id); // Sécurité supplémentaire

      if (error) throw error;
      await fetchForms();
    } catch (error) {
      console.error('Error deleting form:', error);
    }
  };

  const handleDuplicateForm = async (form: Form) => {
    try {
      const duplicateForm = {
        title: `${form.title} (copie)`,
        description: form.description,
        fields: form.fields,
        settings: form.settings,
        created_by: user?.id,
        published: false
      };

      const { error } = await supabase
        .from('forms')
        .insert([duplicateForm]);

      if (error) throw error;
      await fetchForms();
    } catch (error) {
      console.error('Error duplicating form:', error);
    }
  };

  const handlePublishForm = async (formId: string, shouldPublish: boolean) => {
    try {
      const { error } = await supabase
        .from('forms')
        .update({ published: shouldPublish })
        .eq('id', formId)
        .eq('created_by', user?.id); // Sécurité supplémentaire

      if (error) throw error;
      await fetchForms();
    } catch (error) {
      console.error('Error publishing form:', error);
    }
  };

  const copyPublicUrl = (publicUrl: string) => {
    const fullUrl = `${window.location.origin}/forms/${publicUrl}`;
    navigator.clipboard.writeText(fullUrl);
  };

  const handleViewForm = (form: Form) => {
    setSelectedForm(form);
    setShowPreview(true);
  };

  const handleEditForm = (form: Form) => {
    setSelectedForm(form);
    setShowEditor(true);
  };

  const handleSaveForm = async (updatedForm: any) => {
    try {
      const formData = {
        title: updatedForm.title,
        description: updatedForm.description,
        fields: updatedForm.fields,
        settings: updatedForm.settings || {},
        created_by: user?.id
      };

      // Log pour vérifier les données avant la sauvegarde
      console.log('Saving form data:', formData);

      let result;
      if (selectedForm?.id) {
        // Mise à jour d'un formulaire existant
        result = await supabase
          .from('forms')
          .update(formData)
          .eq('id', selectedForm.id)
          .eq('created_by', user?.id); // Sécurité supplémentaire
      } else {
        // Création d'un nouveau formulaire
        result = await supabase
          .from('forms')
          .insert([formData])
          .select();
      }

      if (result.error) {
        console.error('Error in database operation:', result.error);
        throw result.error;
      }

      // Log pour vérifier la réponse de la base de données
      console.log('Save form response:', result);

      await fetchForms();
    } catch (error) {
      console.error('Error saving form:', error);
      throw error;
    }
  };

  const filteredForms = forms.filter(form =>
    form.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    form.description?.toLowerCase().includes(searchTerm.toLowerCase())
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
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Rechercher un formulaire..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-coaching-primary focus:border-transparent"
              />
            </div>
          </div>
          <button
            onClick={handleCreateNewForm}
            className="flex items-center px-4 py-2 bg-coaching-primary text-white rounded-lg hover:bg-coaching-secondary transition-colors"
          >
            <Plus size={20} className="mr-2" />
            Nouveau formulaire
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Formulaire
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Réponses
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Créé le
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredForms.map((form) => (
                  <tr key={form.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {form.title}
                        </div>
                        {form.description && (
                          <div className="text-sm text-gray-500">
                            {form.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs rounded-full bg-coaching-primary/10 text-coaching-primary">
                        {form.submissions_count} réponses
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          form.published 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {form.published ? 'Publié' : 'Brouillon'}
                        </span>
                        {form.published && form.public_url && (
                          <button
                            onClick={() => copyPublicUrl(form.public_url!)}
                            className="ml-2 text-gray-400 hover:text-gray-600"
                            title="Copier le lien"
                          >
                            <Link size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(form.created_at), 'PP', { locale: fr })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handlePublishForm(form.id, !form.published)}
                        className={`text-gray-600 hover:text-coaching-primary mr-3`}
                        title={form.published ? 'Dépublier' : 'Publier'}
                      >
                        <Globe size={18} />
                      </button>
                      <button
                        onClick={() => handleViewForm(form)}
                        className="text-coaching-primary hover:text-coaching-secondary mr-3"
                        title="Voir le formulaire"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleEditForm(form)}
                        className="text-coaching-primary hover:text-coaching-secondary mr-3"
                        title="Modifier le formulaire"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDuplicateForm(form)}
                        className="text-coaching-primary hover:text-coaching-secondary mr-3"
                        title="Dupliquer le formulaire"
                      >
                        <Copy size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteForm(form.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Supprimer le formulaire"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredForms.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      Aucun formulaire trouvé
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Form Preview Modal */}
        {showPreview && (
          <FormPreview
            form={selectedForm}
            onClose={() => {
              setShowPreview(false);
              setSelectedForm(null);
            }}
          />
        )}

        {/* Form Editor Modal */}
        {showEditor && selectedForm && (
          <FormEditor
            form={selectedForm}
            onClose={() => {
              setShowEditor(false);
              setSelectedForm(null);
            }}
            onSave={handleSaveForm}
          />
        )}
      </div>
    </AnimatedSection>
  );
};

export default FormsPage;