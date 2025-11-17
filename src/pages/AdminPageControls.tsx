import React from 'react';
import { useAuth } from './AuthProvider';
import { Edit2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface AdminPageControlsProps {
  slug: string;
}

const AdminPageControls: React.FC<AdminPageControlsProps> = ({ slug }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pageId, setPageId] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetchPageId();
  }, [slug]);

  const fetchPageId = async () => {
    try {
      const { data, error } = await supabase
        .from('pages')
        .select('id')
        .eq('slug', slug)
        .single();

      if (error) throw error;
      if (data) setPageId(data.id);
    } catch (error) {
      console.error('Error fetching page:', error);
    }
  };

  if (!user?.is_super_admin || !pageId) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={() => navigate(`/dashboard/pages/${pageId}`)}
        className="flex items-center px-4 py-2 bg-coaching-primary text-white rounded-full shadow-lg hover:bg-coaching-secondary transition-colors"
      >
        <Edit2 size={20} className="mr-2" />
        Modifier la page
      </button>
    </div>
  );
};

export default AdminPageControls;