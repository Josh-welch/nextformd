import React from 'react';
import { FieldType } from '../store/formStore';
import { AlignLeft, Type, Mail, Hash, List, Calendar, Upload } from 'lucide-react';

const FIELD_TYPES: { type: FieldType; label: string; icon: React.ReactNode; description: string }[] = [
  { 
    type: 'text',
    label: 'Text Input',
    icon: <Type className="w-4 h-4" />,
    description: 'Single line text input for short answers'
  },
  { 
    type: 'textarea',
    label: 'Text Area',
    icon: <AlignLeft className="w-4 h-4" />,
    description: 'Multi-line text input for longer responses'
  },
  { 
    type: 'email',
    label: 'Email',
    icon: <Mail className="w-4 h-4" />,
    description: 'Input field for email addresses'
  },
  { 
    type: 'number',
    label: 'Number',
    icon: <Hash className="w-4 h-4" />,
    description: 'Input for numerical values'
  },
  { 
    type: 'select',
    label: 'Dropdown',
    icon: <List className="w-4 h-4" />,
    description: 'Dropdown menu for selecting from options'
  },
  { 
    type: 'date',
    label: 'Date',
    icon: <Calendar className="w-4 h-4" />,
    description: 'Date picker input'
  },
  {
    type: 'file',
    label: 'File Upload',
    icon: <Upload className="w-4 h-4" />,
    description: 'Allow users to upload files'
  }
];

interface FieldTypeSelectorProps {
  onSelect: (type: FieldType) => void;
}

export function FieldTypeSelector({ onSelect }: FieldTypeSelectorProps) {
  return (
    <div className="mt-6">
      <div className="text-sm font-medium text-gray-700 mb-2">Select Field Type</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
        {FIELD_TYPES.map(({ type, label, icon, description }) => (
          <button
            key={type}
            onClick={() => onSelect(type)}
            className="flex items-start space-x-3 p-3 bg-gray-50 text-left rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="mt-1 p-1.5 bg-white rounded-md shadow-sm">
              {icon}
            </div>
            <div>
              <div className="font-medium text-gray-900">{label}</div>
              <div className="text-sm text-gray-500">{description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}