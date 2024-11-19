import React, { useEffect } from 'react';
import { Plus, Trash2, ChevronLeft, ChevronRight, Save, Loader2, Globe, EyeOff, ExternalLink } from 'lucide-react';
import { useFormStore, type FormField as FormFieldType, type FieldType } from '../store/formStore';
import { FormField } from './FormField';
import { FieldTypeSelector } from './FieldTypeSelector';
import { useAuth } from '../hooks/useAuth';

export function FormBuilder() {
  const { user } = useAuth();
  const {
    pages,
    currentPage,
    loading,
    error,
    deployment,
    addPage,
    addField,
    updateField,
    removePage,
    removeField,
    setCurrentPage,
    updatePageTitle,
    saveForm,
    loadForm,
    publishForm,
    unpublishForm,
  } = useFormStore();

  useEffect(() => {
    if (user) {
      loadForm();
    }
  }, [user, loadForm]);

  const handleAddPage = () => {
    addPage({
      id: crypto.randomUUID(),
      title: `Page ${pages.length + 1}`,
      fields: [],
    });
  };

  const handleAddField = (pageId: string, type: FieldType) => {
    const field: FormFieldType = {
      id: crypto.randomUUID(),
      type,
      label: '',
      placeholder: '',
      required: false,
      validationEnabled: true,
    };
    addField(pageId, field);
  };

  const formUrl = deployment?.slug ? `https://nextformd.netlify.app/forms/${deployment.slug}` : null;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="px-4 py-2">
              Page {currentPage + 1} of {Math.max(1, pages.length)}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(pages.length - 1, currentPage + 1))}
              disabled={currentPage === pages.length - 1}
              className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center space-x-2">
            {deployment?.isPublished ? (
              <button
                onClick={unpublishForm}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50"
              >
                <EyeOff className="w-4 h-4 mr-2" />
                Unpublish
              </button>
            ) : (
              <button
                onClick={publishForm}
                disabled={loading || pages.length === 0}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <Globe className="w-4 h-4 mr-2" />
                Publish
              </button>
            )}
            <button
              onClick={saveForm}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save
            </button>
            <button
              onClick={handleAddPage}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Page
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        {formUrl && deployment?.isPublished && (
          <div className="mb-6 p-4 bg-green-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-green-800">Form Published</h3>
                <p className="text-sm text-green-600">
                  Your form is live at:{' '}
                  <a
                    href={formUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-green-700"
                  >
                    {formUrl}
                  </a>
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-green-600">
                  Version: {deployment.version}
                </div>
                <a
                  href={formUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Preview Form
                </a>
              </div>
            </div>
          </div>
        )}

        {pages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No pages yet. Start by adding a new page.</p>
            <button
              onClick={handleAddPage}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Create First Page
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {pages.map((page, index) => (
              <div
                key={page.id}
                className={`${
                  index === currentPage ? 'block' : 'hidden'
                } border rounded-lg p-6`}
              >
                <div className="flex justify-between items-center mb-4">
                  <input
                    type="text"
                    value={page.title}
                    onChange={(e) => updatePageTitle(page.id, e.target.value)}
                    className="text-xl font-semibold bg-transparent border-b border-transparent hover:border-gray-300 focus:border-indigo-500 focus:outline-none"
                  />
                  <button
                    onClick={() => removePage(page.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  {page.fields.map((field) => (
                    <FormField
                      key={field.id}
                      field={field}
                      onUpdate={(updatedField) => updateField(page.id, field.id, updatedField)}
                      onRemove={() => removeField(page.id, field.id)}
                    />
                  ))}
                </div>

                <FieldTypeSelector onSelect={(type) => handleAddField(page.id, type)} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}