import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { 
  Bold, Italic, List, Link as LinkIcon, Image as ImageIcon,
  AlignLeft, AlignCenter, AlignRight, Save, Eye, Undo, Redo,
  Upload, X
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

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

interface ContentEditorProps {
  blockId?: string;
  identifier: string;
  page: string;
  section: string;
  initialContent?: any;
  onSave?: (content: any) => void;
}

const ContentEditor: React.FC<ContentEditorProps> = ({
  blockId,
  identifier,
  page,
  section,
  initialContent,
  onSave
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<any[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);

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
    content: initialContent,
    editable: isEditing,
  });

  useEffect(() => {
    if (editor) {
      editor.setEditable(isEditing);
    }
  }, [isEditing, editor]);

  const handleSave = async () => {
    if (!editor) return;

    try {
      setIsSaving(true);
      const content = editor.getJSON();

      // Save to content_blocks
      const { data, error } = await supabase
        .from('content_blocks')
        .upsert({
          id: blockId,
          identifier,
          title: identifier,
          content,
          type: 'rich-text',
          page,
          section,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'identifier'
        });

      if (error) throw error;

      // Save revision
      await supabase
        .from('content_revisions')
        .insert({
          block_id: data?.[0]?.id || blockId,
          content,
        });

      if (onSave) {
        onSave(content);
      }

      setIsEditing(false);
    } catch (error) {
      console.error('Error saving content:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      setUploadProgress(0);
      
      // Upload to Supabase Storage
      const filename = `${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('media')
        .upload(filename, file, {
          onUploadProgress: (progress) => {
            setUploadProgress((progress.loaded / progress.total) * 100);
          },
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(data.path);

      // Save to content_media
      await supabase
        .from('content_media')
        .insert({
          filename,
          url: publicUrl,
          type: file.type,
          size: file.size,
          metadata: {
            lastModified: file.lastModified,
            name: file.name,
          },
        });

      // Insert into editor
      if (editor && file.type.startsWith('image/')) {
        editor.chain().focus().setImage({ src: publicUrl }).run();
      }

      setShowMediaLibrary(false);
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setUploadProgress(0);
    }
  };

  const loadMediaFiles = async () => {
    try {
      const { data, error } = await supabase
        .from('content_media')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMediaFiles(data || []);
    } catch (error) {
      console.error('Error loading media files:', error);
    }
  };

  useEffect(() => {
    if (showMediaLibrary) {
      loadMediaFiles();
    }
  }, [showMediaLibrary]);

  if (!editor) return null;

  return (
    <div className="relative border rounded-lg shadow-sm bg-white">
      {/* Toolbar */}
      <div className="border-b p-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {isEditing ? (
            <>
              <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`p-1 rounded hover:bg-gray-100 ${
                  editor.isActive('bold') ? 'bg-gray-100' : ''
                }`}
              >
                <Bold size={18} />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`p-1 rounded hover:bg-gray-100 ${
                  editor.isActive('italic') ? 'bg-gray-100' : ''
                }`}
              >
                <Italic size={18} />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`p-1 rounded hover:bg-gray-100 ${
                  editor.isActive('bulletList') ? 'bg-gray-100' : ''
                }`}
              >
                <List size={18} />
              </button>
              <button
                onClick={() => setShowMediaLibrary(true)}
                className="p-1 rounded hover:bg-gray-100"
              >
                <ImageIcon size={18} />
              </button>
              <button
                onClick={() => {
                  const url = window.prompt('URL:');
                  if (url) {
                    editor.chain().focus().setLink({ href: url }).run();
                  }
                }}
                className={`p-1 rounded hover:bg-gray-100 ${
                  editor.isActive('link') ? 'bg-gray-100' : ''
                }`}
              >
                <LinkIcon size={18} />
              </button>
              <button
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                className={`p-1 rounded hover:bg-gray-100 ${
                  editor.isActive({ textAlign: 'left' }) ? 'bg-gray-100' : ''
                }`}
              >
                <AlignLeft size={18} />
              </button>
              <button
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                className={`p-1 rounded hover:bg-gray-100 ${
                  editor.isActive({ textAlign: 'center' }) ? 'bg-gray-100' : ''
                }`}
              >
                <AlignCenter size={18} />
              </button>
              <button
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                className={`p-1 rounded hover:bg-gray-100 ${
                  editor.isActive({ textAlign: 'right' }) ? 'bg-gray-100' : ''
                }`}
              >
                <AlignRight size={18} />
              </button>
              <button
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
              >
                <Undo size={18} />
              </button>
              <button
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
              >
                <Redo size={18} />
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-3 py-1 text-sm bg-coaching-primary text-white rounded hover:bg-coaching-secondary transition-colors"
            >
              Modifier
            </button>
          )}
        </div>
        {isEditing && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-3 py-1 text-sm bg-coaching-primary text-white rounded hover:bg-coaching-secondary transition-colors flex items-center"
            >
              {isSaving ? (
                <span className="flex items-center">
                  <span className="animate-spin mr-2">⌛</span>
                  Enregistrement...
                </span>
              ) : (
                <>
                  <Save size={16} className="mr-1" />
                  Enregistrer
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Editor */}
      <div className="p-4">
        <EditorContent editor={editor} />
      </div>

      {/* Media Library Modal */}
      <AnimatePresence>
        {showMediaLibrary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
            >
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="text-lg font-semibold">Bibliothèque média</h3>
                <button
                  onClick={() => setShowMediaLibrary(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-4">
                {/* Upload Area */}
                <div className="border-2 border-dashed rounded-lg p-8 text-center mb-6">
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Upload size={32} className="text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">
                      Glissez-déposez un fichier ou cliquez pour sélectionner
                    </span>
                  </label>
                  {uploadProgress > 0 && (
                    <div className="mt-4">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-coaching-primary"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Media Grid */}
                <div className="grid grid-cols-4 gap-4">
                  {mediaFiles.map((file) => (
                    <div
                      key={file.id}
                      className="relative group cursor-pointer"
                      onClick={() => {
                        if (file.type.startsWith('image/')) {
                          editor.chain().focus().setImage({ src: file.url }).run();
                          setShowMediaLibrary(false);
                        }
                      }}
                    >
                      {file.type.startsWith('image/') ? (
                        <img
                          src={file.url}
                          alt={file.filename}
                          className="w-full h-24 object-cover rounded"
                        />
                      ) : (
                        <div className="w-full h-24 bg-gray-100 rounded flex items-center justify-center">
                          <span className="text-sm text-gray-500">
                            {file.filename}
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                        <Eye className="text-white" size={20} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ContentEditor;