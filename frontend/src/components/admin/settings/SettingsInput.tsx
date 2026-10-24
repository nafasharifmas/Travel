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
    <div className="flex flex-col sm:flex-row sm:items-start gap-4 py-3 first:pt-0 last:pb-0">
      <div className="sm:w-1/3">
        <label className="text-sm text-charcoal-950">{label}</label>
        {description && <p className="text-xs text-stone-500 mt-0.5">{description}</p>}
      </div>
      <div className="sm:w-2/3">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full px-2.5 py-1.5 text-sm border border-sand-200 rounded-md bg-white text-charcoal-950 placeholder:text-stone-400 disabled:bg-sand-50 disabled:text-stone-500 focus:outline-none focus:ring-1 focus:ring-sand-300"
        />
      </div>
    </div>
  );
};
