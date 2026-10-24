import React from 'react';

interface Option {
  value: string;
  label: string;
}

interface SettingsSelectProps {
  label: string;
  description?: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
}

export const SettingsSelect: React.FC<SettingsSelectProps> = ({
  label,
  description,
  value,
  onChange,
  options,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-4 py-3 first:pt-0 last:pb-0">
      <div className="sm:w-1/3">
        <label className="text-sm text-charcoal-950">{label}</label>
        {description && <p className="text-xs text-stone-500 mt-0.5">{description}</p>}
      </div>
      <div className="sm:w-2/3">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-2.5 py-1.5 text-sm border border-sand-200 rounded-md bg-white text-charcoal-950 focus:outline-none focus:ring-1 focus:ring-sand-300"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
