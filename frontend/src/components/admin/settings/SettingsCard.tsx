import React from 'react';

interface SettingsCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  onSave?: () => void;
  saving?: boolean;
  showSave?: boolean;
}

export const SettingsCard: React.FC<SettingsCardProps> = ({
  title,
  description,
  children,
  onSave,
  saving = false,
  showSave = true,
}) => {
  return (
    <div className="bg-white rounded-lg border border-sand-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-sand-200 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-medium text-charcoal-950">{title}</h3>
          {description && <p className="text-xs text-stone-500 mt-1">{description}</p>}
        </div>
        {showSave && onSave && (
          <button
            onClick={onSave}
            disabled={saving}
            className="px-3 py-1.5 bg-charcoal-950 hover:bg-charcoal-900 text-white text-xs rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        )}
      </div>
      <div className="px-5 py-4 divide-y divide-sand-100">{children}</div>
    </div>
  );
};
