import React, { useState } from 'react';
import type { FormField } from '../store/formStore';
import { cn } from '../lib/utils';
import { validateField } from '../lib/validation';

const baseInputStyles = "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white";

interface FieldPreviewProps {
  field: FormField;
}

export function FieldPreview({ field }: FieldPreviewProps) {
  const [value, setValue] = useState('');
  const [validationResult, setValidationResult] = useState<{ isValid: boolean; message?: string } | null>(null);
  const placeholder = field.label || 'Enter your answer';

  const handleValidation = async (newValue: string) => {
    if (!field.validationEnabled || !field.validation) {
      setValidationResult(null);
      return;
    }

    const result = await validateField(newValue, field.type, field.validation);
    setValidationResult(result);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    handleValidation(newValue);
  };

  const inputProps = {
    value,
    onChange: handleChange,
    className: cn(
      baseInputStyles,
      validationResult && !validationResult.isValid && 'border-red-500',
      validationResult?.isValid && 'border-green-500'
    ),
  };

  const renderField = () => {
    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            {...inputProps}
            placeholder={placeholder}
            className={cn(inputProps.className, "min-h-[100px] resize-y")}
          />
        );
      
      case 'select':
        return (
          <select {...inputProps}>
            <option value="">{placeholder}</option>
            <option value="option1">Option 1</option>
            <option value="option2">Option 2</option>
            <option value="option3">Option 3</option>
          </select>
        );
      
      case 'date':
        return (
          <input
            type="date"
            {...inputProps}
          />
        );

      case 'file':
        return (
          <div className="flex flex-col space-y-2">
            <input
              type="file"
              className="hidden"
              id={`file-${field.id}`}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleValidation(file.name);
                }
              }}
            />
            <label
              htmlFor={`file-${field.id}`}
              className={cn(
                baseInputStyles,
                "cursor-pointer flex items-center justify-center space-x-2"
              )}
            >
              <span>Choose file</span>
            </label>
            <p className="text-xs text-gray-500">
              {field.accept ? `Accepted formats: ${field.accept}` : 'All files accepted'}
              {field.maxSize ? ` • Max size: ${field.maxSize}MB` : ''}
            </p>
          </div>
        );
      
      default:
        return (
          <input
            type={field.type}
            placeholder={placeholder}
            {...inputProps}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      {renderField()}
      {validationResult && (
        <p className={cn(
          "text-sm",
          validationResult.isValid ? "text-green-600" : "text-red-600"
        )}>
          {validationResult.message}
        </p>
      )}
    </div>
  );
}