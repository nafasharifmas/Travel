import React from 'react';

interface SettingsInputProps {
  label: string;
  description?: string;
  type?: string;
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const SettingsInput: React.FC<SettingsInputProps> = ({
  label,
  description,
  type = 'text',
  value,
  onChange,
  placeholder,
  disabled = false,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-4 py-4 border-b border-gray-100 last:border-0">
      <div className="sm:w-1/3">
        <label className="text-sm font-medium text-gray-900">{label}</label>
        {description && <p className="text-xs text-gray-600 mt-1">{description}</p>}
      </div>
      <div className="sm:w-2/3">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0FAF8F] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
        />
      </div>
    </div>
  );
};
