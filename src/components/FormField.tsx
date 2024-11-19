import React from 'react';
import { Trash2 } from 'lucide-react';
import type { FormField as FormFieldType } from '../store/formStore';
import { FieldPreview } from './FieldPreview';
import { Toggle } from './Toggle';

interface FormFieldProps {
  field: FormFieldType;
  onUpdate: (field: FormFieldType) => void;
  onRemove: () => void;
}

export function FormField({ field, onUpdate, onRemove }: FormFieldProps) {
  return (
    <div className="flex flex-col space-y-4 p-4 border rounded-lg bg-white shadow-sm">
      <div className="flex items-center justify-between">
        <input
          type="text"
          value={field.label}
          onChange={(e) => onUpdate({ ...field, label: e.target.value })}
          placeholder="Field Name"
          className="font-medium bg-transparent border-b border-transparent hover:border-gray-300 focus:border-indigo-500 focus:outline-none"
        />
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500 px-2 py-1 bg-gray-100 rounded">
            {field.type}
          </span>
          <button
            onClick={onRemove}
            className="text-red-500 hover:bg-red-50 p-2 rounded"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between border-b pb-3">
        <label className="text-sm font-medium text-gray-700">Enable AI Validation</label>
        <Toggle
          checked={field.validationEnabled}
          onCheckedChange={(checked) => onUpdate({ ...field, validationEnabled: checked })}
        />
      </div>
      
      {field.validationEnabled && (
        <textarea
          value={field.validation || ''}
          onChange={(e) => onUpdate({ ...field, validation: e.target.value })}
          placeholder="Describe how this field should be validated..."
          className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
          rows={2}
        />
      )}

      {field.type === 'file' && (
        <div className="flex flex-col space-y-2">
          <input
            type="text"
            value={field.accept || ''}
            onChange={(e) => onUpdate({ ...field, accept: e.target.value })}
            placeholder="Accepted file types (e.g., .pdf,.doc,.docx)"
            className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <input
            type="number"
            value={field.maxSize || ''}
            onChange={(e) => onUpdate({ ...field, maxSize: parseInt(e.target.value) || undefined })}
            placeholder="Max file size in MB"
            className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      )}

      <div className="border-t pt-4">
        <div className="text-sm text-gray-500 mb-2">Preview:</div>
        <FieldPreview field={field} />
      </div>
    </div>
  );
}