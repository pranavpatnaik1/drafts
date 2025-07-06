'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Toolbar from './Toolbar';
import '../styles/animations.css';
import { Editor as TiptapEditor } from '@tiptap/react';

export default function Editor({ id: documentId }: { id?: string }) {
  const [editorInstance, setEditorInstance] = useState<TiptapEditor | null>(null);
  const [title, setTitle] = useState('Untitled Document');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: false,
      }),
      Placeholder.configure({
        placeholder: 'Start typing...',
      }),
      Underline,
    ],
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none p-2 prose-stone min-h-[500px] editor font-[Manrope]',
      },
    },
    content: '',
    onUpdate: ({ editor }) => {
      handleAutoSave(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor) {
      setEditorInstance(editor);
    }
  }, [editor]);

  const loadDocument = useCallback(async () => {
    try {
      const documents = JSON.parse(localStorage.getItem('documents') || '[]');
      const document = documents.find((doc: { id: string; title: string; content: string }) => doc.id === documentId);
      if (document) {
        setTitle(document.title);
        editorInstance?.commands.setContent(document.content);
      }
    } catch (error) {
      console.error('Failed to load document:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  }, [documentId, editorInstance, router]);

  const createDocument = useCallback(async () => {
    try {
      const documents = JSON.parse(localStorage.getItem('documents') || '[]');
      const newDocument = {
        id: documentId,
        title: 'Untitled Document',
        content: '',
        updatedAt: new Date().toISOString(),
      };
      documents.push(newDocument);
      localStorage.setItem('documents', JSON.stringify(documents));
    } catch (error) {
      console.error('Failed to create document:', error);
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    if (documentId) {
      loadDocument();
    } else {
      createDocument();
    }
  }, [documentId, loadDocument, createDocument]);

  const handleAutoSave = async (content: string) => {
    if (!documentId || saving) return;
    
    setSaving(true);
    try {
      const documents = JSON.parse(localStorage.getItem('documents') || '[]');
      const index = documents.findIndex((doc: { id: string }) => doc.id === documentId);
      
      if (index === -1) {
        throw new Error('Document not found');
      }

      documents[index] = {
        ...documents[index],
        title,
        content,
        updatedAt: new Date().toISOString(),
      };

      localStorage.setItem('documents', JSON.stringify(documents));
    } catch (error) {
      console.error('Failed to save document:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleTitleChange = async (newTitle: string) => {
    setTitle(newTitle);
    if (documentId) {
      try {
        const documents = JSON.parse(localStorage.getItem('documents') || '[]');
        const index = documents.findIndex((doc: { id: string }) => doc.id === documentId);
        
        if (index === -1) {
          throw new Error('Document not found');
        }

        documents[index] = {
          ...documents[index],
          title: newTitle,
          updatedAt: new Date().toISOString(),
        };

        localStorage.setItem('documents', JSON.stringify(documents));
      } catch (error) {
        console.error('Failed to update title:', error);
      }
    }
  };

  const exportToPDF = async () => {
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const element = document.querySelector('.ProseMirror');
      if (!element) return;
      
      const opt = {
        margin: 1,
        filename: `${title || 'document'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
      
      await html2pdf().set(opt).from(element as HTMLElement).save();
    } catch (error) {
      console.error('Failed to export PDF:', error);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-white font-[Manrope] flex items-center justify-center">Loading...</div>;
  }

  if (!editor) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white font-[Manrope] pb-8">
      <div className="max-w-4xl mx-auto px-4 pt-4">
        <div className="flex justify-between items-center mb-4">
          <Link href="/">
            <Image
              src="/drafts.png"
              alt="Drafts Logo"
              width={100}
              height={100}
              className="object-contain hover:opacity-80 transition-opacity"
              priority
            />
          </Link>
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="text-lg font-medium bg-transparent border-b border-transparent hover:border-gray-200 focus:border-black focus:outline-none transition-colors px-2 py-1 text-gray-900"
          />
        </div>
        <div className="editorContainer text-gray-900">
          <Toolbar editor={editor} />
          <div className="text-gray-900 relative">
            <EditorContent editor={editor} className="pb-12" />
            <div className="absolute bottom-2 left-0 right-0 border-t border-[#000000]">
              <div className="flex justify-end px-4 pt-3 exportSection">
                <button
                  onClick={exportToPDF}
                  className="w-full p-2 bg-black text-white rounded font-[Manrope] exportButton flex justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-send" viewBox="0 0 16 16">
                    <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576zm6.787-8.201L1.591 6.602l4.339 2.76z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 