import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { FormPage } from '../store/formStore';
import { FieldPreview } from './FieldPreview';

interface FormViewProps {
  slug: string;
}

export function FormView({ slug }: FormViewProps) {
  const [form, setForm] = useState<{ pages: FormPage[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    async function loadForm() {
      try {
        const deploymentsRef = collection(db, 'deployments');
        const q = query(deploymentsRef, where('slug', '==', slug));
        const deploymentSnapshot = await getDocs(q);

        if (deploymentSnapshot.empty) {
          setError('Form not found');
          setLoading(false);
          return;
        }

        const deployment = deploymentSnapshot.docs[0].data();
        if (deployment.status !== 'active') {
          setError('This form is no longer active');
          setLoading(false);
          return;
        }

        const formRef = collection(db, 'forms');
        const formDoc = await getDocs(query(formRef, where('__name__', '==', deployment.formId)));
        
        if (formDoc.empty) {
          setError('Form data not found');
          setLoading(false);
          return;
        }

        setForm(formDoc.docs[0].data() as { pages: FormPage[] });
      } catch (error) {
        console.error('Error loading form:', error);
        setError('Failed to load form');
      } finally {
        setLoading(false);
      }
    }

    loadForm();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-32 bg-gray-200 rounded"></div>
          <div className="h-4 w-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-semibold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600">{error || 'Something went wrong'}</p>
        </div>
      </div>
    );
  }

  const currentPageData = form.pages[currentPage];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 py-8">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{currentPageData.title}</h1>
            <div className="mt-2 text-sm text-gray-500">
              Page {currentPage + 1} of {form.pages.length}
            </div>
          </div>

          <form className="space-y-6">
            {currentPageData.fields.map((field) => (
              <div key={field.id} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {field.label}
                </label>
                <FieldPreview field={field} />
              </div>
            ))}

            <div className="flex justify-between pt-6">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => {
                  if (currentPage === form.pages.length - 1) {
                    // Handle form submission
                  } else {
                    setCurrentPage((p) => Math.min(form.pages.length - 1, p + 1));
                  }
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                {currentPage === form.pages.length - 1 ? 'Submit' : 'Next'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}