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
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
        </div>
        {showSave && onSave && (
          <button
            onClick={onSave}
            disabled={saving}
            className="bg-[#0FAF8F] text-white px-4 py-2 rounded-lg hover:bg-[#0d8f75] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        )}
      </div>
      <div className="p-6 space-y-4">{children}</div>
    </div>
  );
};
