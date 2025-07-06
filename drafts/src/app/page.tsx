'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Document {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
}

export default function Home() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = () => {
    try {
      const docs = JSON.parse(localStorage.getItem('documents') || '[]') as Document[];
      setDocuments(docs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const createDocument = async () => {
    try {
      const documents = JSON.parse(localStorage.getItem('documents') || '[]') as Document[];
      const newDocument: Document = {
        id: crypto.randomUUID(),
        title: 'Untitled Document',
        content: '',
        updatedAt: new Date().toISOString(),
      };
      
      documents.push(newDocument);
      localStorage.setItem('documents', JSON.stringify(documents));
      router.push(`/editor/${newDocument.id}`);
    } catch (error) {
      console.error('Failed to create document:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white font-[Manrope] flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white font-[Manrope] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Image
            src="/drafts.png"
            alt="Drafts Logo"
            width={100}
            height={100}
            className="object-contain"
            priority
          />
          <button
            onClick={createDocument}
            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-plus-lg" viewBox="0 0 16 16">
              <path d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2"/>
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <Link
              key={doc.id}
              href={`/editor/${doc.id}`}
              className="p-4 border border-gray-200 rounded hover:border-black transition-colors"
            >
              <h2 className="font-medium mb-2 truncate text-black">{doc.title}</h2>
              <p className="text-sm text-gray-500 mb-2">
                {new Date(doc.updatedAt).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600 line-clamp-3">
                {doc.content ? doc.content.replace(/<[^>]*>/g, '') : 'No content'}
              </p>
            </Link>
          ))}
          
          {documents.length === 0 && (
            <div className="col-span-full text-center text-gray-500 py-8">
              No documents yet. Click the + button to create one!
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
