import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface ContentBlock {
  id: string;
  identifier: string;
  title: string;
  content: any;
  type: string;
  page: string;
  section: string;
  published: boolean;
}

export function useContent(identifier: string) {
  const [content, setContent] = useState<ContentBlock | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('content_blocks')
          .select('*')
          .eq('identifier', identifier)
          .single();

        if (error) throw error;
        setContent(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An error occurred'));
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [identifier]);

  const updateContent = async (newContent: any) => {
    try {
      const { error } = await supabase
        .from('content_blocks')
        .upsert({
          identifier,
          content: newContent,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'identifier'
        });

      if (error) throw error;
      setContent(prev => prev ? { ...prev, content: newContent } : null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred'));
      throw err;
    }
  };

  return { content, loading, error, updateContent };
}