import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { SettingsCard } from '../components/admin/settings/SettingsCard';
import { SettingsInput } from '../components/admin/settings/SettingsInput';
import { SettingsToggle } from '../components/admin/settings/SettingsToggle';
import { SettingsSelect } from '../components/admin/settings/SettingsSelect';
import { 
  FiSettings, FiMapPin, FiShield, FiFolder, FiImage, FiMail, 
  FiMonitor, FiInfo, FiArrowLeft
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { sileo } from 'sileo';

const AdminSettingsPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState<any>({});
  const [systemInfo, setSystemInfo] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  // Using sileo toasts

  const tabs = [
    { id: 'general', label: 'General', icon: FiSettings },
    { id: 'map', label: 'Map & Location', icon: FiMapPin },
    { id: 'security', label: 'Security', icon: FiShield },
    { id: 'catalogue', label: 'Catalogue', icon: FiFolder },
    { id: 'media', label: 'Media & Storage', icon: FiImage },
    { id: 'email', label: 'Email', icon: FiMail },
    { id: 'appearance', label: 'Appearance', icon: FiMonitor },
    { id: 'system', label: 'System Info', icon: FiInfo },
  ];

  useEffect(() => {
    if (isAdmin) {
      loadSettings();
    }
  }, [isAdmin]);

  const loadSettings = async () => {
    try {
      const res = await api.getAdminSettings();
      const settingsMap: any = {};
      Object.values(res.settings).forEach((group: any) => {
        group.forEach((setting: any) => {
          settingsMap[setting.key] = setting.value;
        });
      });
      setSettings(settingsMap);
      setSystemInfo(res.system_info || {});
    } catch (err) {
      console.error(err);
      sileo.error({ title: 'Error', description: 'Failed to load settings' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (groupKeys: string[]) => {
    setSaving(true);
    try {
      const settingsToUpdate: any = {};
      groupKeys.forEach((key) => {
        if (settings[key] !== undefined) {
          settingsToUpdate[key] = settings[key];
        }
      });
      await api.updateAdminSettings({ settings: settingsToUpdate });
      sileo.success({ title: 'Success', description: 'Settings updated successfully' });
    } catch (err) {
      console.error(err);
      sileo.error({ title: 'Error', description: 'Failed to update settings' });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: string, value: any) => {
    setSettings((prev: any) => ({ ...prev, [key]: value }));
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <FiShield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Administrator privileges required</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory-100">
      <header className="bg-white border-b border-sand-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/admin" className="p-1.5 rounded-md text-stone-500 hover:text-charcoal-950 hover:bg-sand-50">
                <FiArrowLeft className="text-lg" />
              </Link>
              <div>
                <h1 className="text-lg font-medium text-charcoal-950 flex items-center gap-2">
                  <FiSettings /> Settings
                </h1>
                <p className="text-xs text-stone-500">Platform configuration</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-56 flex-shrink-0">
            <div className="bg-white rounded-lg border border-sand-200 overflow-hidden">
              <nav className="p-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-left transition-colors text-sm ${
                      activeTab === tab.id
                        ? 'bg-sand-100 text-charcoal-950 font-medium'
                        : 'text-stone-600 hover:bg-sand-50 hover:text-charcoal-950'
                    }`}
                  >
                    <tab.icon className="text-base" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            {loading ? (
              <div className="bg-white rounded-lg border border-sand-200 p-6 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-charcoal-950 mx-auto"></div>
                <p className="mt-2 text-sm text-stone-500">Loading…</p>
              </div>
            ) : (
              <>
                {/* General */}
                {activeTab === 'general' && (
                  <SettingsCard
                    title="General Settings"
                    description="Basic application information"
                    onSave={() => handleSave(['app_name', 'app_tagline', 'contact_email', 'support_number', 'footer_text'])}
                    saving={saving}
                  >
                    <SettingsInput label="Application Name" value={settings.app_name || ''} onChange={(v) => updateSetting('app_name', v)} />
                    <SettingsInput label="Tagline" value={settings.app_tagline || ''} onChange={(v) => updateSetting('app_tagline', v)} />
                    <SettingsInput label="Contact Email" type="email" value={settings.contact_email || ''} onChange={(v) => updateSetting('contact_email', v)} />
                    <SettingsInput label="Support Number" value={settings.support_number || ''} onChange={(v) => updateSetting('support_number', v)} />
                    <SettingsInput label="Footer Text" value={settings.footer_text || ''} onChange={(v) => updateSetting('footer_text', v)} />
                  </SettingsCard>
                )}

                {/* Map */}
                {activeTab === 'map' && (
                  <SettingsCard
                    title="Map & Location Settings"
                    description="Configure location boundaries and map display"
                    onSave={() => handleSave(['map_ref_lat', 'map_ref_lng', 'map_radius_km', 'map_default_zoom', 'enable_map_bounds'])}
                    saving={saving}
                  >
                    <SettingsInput label="Reference Latitude" type="number" value={settings.map_ref_lat || ''} onChange={(v) => updateSetting('map_ref_lat', v)} description="Center point for distance calculation" />
                    <SettingsInput label="Reference Longitude" type="number" value={settings.map_ref_lng || ''} onChange={(v) => updateSetting('map_ref_lng', v)} description="Center point for distance calculation" />
                    <SettingsInput label="Radius (KM)" type="number" value={settings.map_radius_km || ''} onChange={(v) => updateSetting('map_radius_km', v)} description="Maximum distance from reference point" />
                    <SettingsInput label="Default Map Zoom" type="number" value={settings.map_default_zoom || ''} onChange={(v) => updateSetting('map_default_zoom', v)} description="Default zoom level for maps" />
                    <SettingsToggle label="Enable Map Bounds Restriction" description="Restrict places to within radius" checked={!!settings.enable_map_bounds} onChange={(v) => updateSetting('enable_map_bounds', v)} />
                  </SettingsCard>
                )}

                {/* Security */}
                {activeTab === 'security' && (
                  <SettingsCard
                    title="Security Settings"
                    description="Configure security and authentication preferences"
                    onSave={() => handleSave(['force_logout_on_role_change', 'allow_user_deactivation', 'audit_logs_admin_only', 'session_timeout_minutes'])}
                    saving={saving}
                  >
                    <SettingsToggle label="Force Logout on Role Change" description="Force logout when user role is changed" checked={!!settings.force_logout_on_role_change} onChange={(v) => updateSetting('force_logout_on_role_change', v)} />
                    <SettingsToggle label="Allow User Deactivation" description="Allow admins to deactivate users" checked={!!settings.allow_user_deactivation} onChange={(v) => updateSetting('allow_user_deactivation', v)} />
                    <SettingsToggle label="Audit Logs Admin Only" description="Restrict audit logs to admins" checked={!!settings.audit_logs_admin_only} onChange={(v) => updateSetting('audit_logs_admin_only', v)} />
                    <SettingsInput label="Session Timeout (Minutes)" type="number" value={settings.session_timeout_minutes || ''} onChange={(v) => updateSetting('session_timeout_minutes', v)} description="Session timeout duration" />
                  </SettingsCard>
                )}

                {/* Catalogue */}
                {activeTab === 'catalogue' && (
                  <SettingsCard
                    title="Catalogue Settings"
                    description="Configure place and category management"
                    onSave={() => handleSave(['auto_approve_places', 'require_images_publish', 'show_archived_admin_default'])}
                    saving={saving}
                  >
                    <SettingsToggle label="Auto-approve New Places" description="Automatically approve newly created places" checked={!!settings.auto_approve_places} onChange={(v) => updateSetting('auto_approve_places', v)} />
                    <SettingsToggle label="Require Images on Publish" description="Require at least one image to publish" checked={!!settings.require_images_publish} onChange={(v) => updateSetting('require_images_publish', v)} />
                    <SettingsToggle label="Show Archived in Admin by Default" description="Show archived places by default in admin" checked={!!settings.show_archived_admin_default} onChange={(v) => updateSetting('show_archived_admin_default', v)} />
                  </SettingsCard>
                )}

                {/* Media */}
                {activeTab === 'media' && (
                  <SettingsCard
                    title="Media & Storage Settings"
                    description="Configure file uploads and storage"
                    onSave={() => handleSave(['storage_driver', 'max_upload_size_mb', 'auto_generate_thumbnails'])}
                    saving={saving}
                  >
                    <SettingsSelect
                      label="Storage Driver"
                      value={settings.storage_driver || 'local'}
                      onChange={(v) => updateSetting('storage_driver', v)}
                      options={[
                        { value: 'local', label: 'Local Storage' },
                        { value: 'cloudinary', label: 'Cloudinary' },
                      ]}
                      description="Storage driver for uploaded files"
                    />
                    <SettingsInput label="Max Upload Size (MB)" type="number" value={settings.max_upload_size_mb || ''} onChange={(v) => updateSetting('max_upload_size_mb', v)} description="Maximum upload file size" />
                    <SettingsToggle label="Auto-generate Thumbnails" description="Generate thumbnails automatically" checked={!!settings.auto_generate_thumbnails} onChange={(v) => updateSetting('auto_generate_thumbnails', v)} />
                  </SettingsCard>
                )}

                {/* Email */}
                {activeTab === 'email' && (
                  <SettingsCard
                    title="Email Settings"
                    description="Configure SMTP settings for email notifications"
                    onSave={() => handleSave(['mail_enabled', 'mail_host', 'mail_port', 'mail_username', 'mail_password', 'mail_from_address', 'mail_from_name'])}
                    saving={saving}
                  >
                    <SettingsToggle label="Enable SMTP" description="Enable email sending" checked={!!settings.mail_enabled} onChange={(v) => updateSetting('mail_enabled', v)} />
                    <SettingsInput label="Mail Host" value={settings.mail_host || ''} onChange={(v) => updateSetting('mail_host', v)} />
                    <SettingsInput label="Mail Port" type="number" value={settings.mail_port || ''} onChange={(v) => updateSetting('mail_port', v)} />
                    <SettingsInput label="Mail Username" value={settings.mail_username || ''} onChange={(v) => updateSetting('mail_username', v)} />
                    <SettingsInput label="Mail Password" type="password" value={settings.mail_password || ''} onChange={(v) => updateSetting('mail_password', v)} />
                    <SettingsInput label="From Address" type="email" value={settings.mail_from_address || ''} onChange={(v) => updateSetting('mail_from_address', v)} />
                    <SettingsInput label="From Name" value={settings.mail_from_name || ''} onChange={(v) => updateSetting('mail_from_name', v)} />
                  </SettingsCard>
                )}

                {/* Appearance */}
                {activeTab === 'appearance' && (
                  <SettingsCard
                    title="Appearance Settings"
                    description="Customize the look and feel"
                    onSave={() => handleSave(['logo_url', 'favicon_url', 'primary_color', 'accent_color'])}
                    saving={saving}
                  >
                    <SettingsInput label="Logo URL" value={settings.logo_url || ''} onChange={(v) => updateSetting('logo_url', v)} />
                    <SettingsInput label="Favicon URL" value={settings.favicon_url || ''} onChange={(v) => updateSetting('favicon_url', v)} />
                    <SettingsInput label="Primary Color" value={settings.primary_color || ''} onChange={(v) => updateSetting('primary_color', v)} placeholder="#0FAF8F" />
                    <SettingsInput label="Accent Color" value={settings.accent_color || ''} onChange={(v) => updateSetting('accent_color', v)} placeholder="#E7B94C" />
                  </SettingsCard>
                )}

                {/* System Info */}
                {activeTab === 'system' && (
                  <SettingsCard title="System information" description="Read-only diagnostics" showSave={false}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-3 border border-sand-200 rounded-md">
                        <p className="text-xs text-stone-500">Laravel version</p>
                        <p className="text-sm font-mono text-charcoal-950 mt-0.5">{systemInfo.laravel_version}</p>
                      </div>
                      <div className="p-3 border border-sand-200 rounded-md">
                        <p className="text-xs text-stone-500">PHP version</p>
                        <p className="text-sm font-mono text-charcoal-950 mt-0.5">{systemInfo.php_version}</p>
                      </div>
                      <div className="p-3 border border-sand-200 rounded-md">
                        <p className="text-xs text-stone-500">Environment</p>
                        <p className="text-sm font-mono text-charcoal-950 mt-0.5">{systemInfo.environment}</p>
                      </div>
                      <div className="p-3 border border-sand-200 rounded-md">
                        <p className="text-xs text-stone-500">Database</p>
                        <p className="text-sm font-mono text-charcoal-950 mt-0.5">{systemInfo.db_connection}</p>
                      </div>
                      <div className="p-3 border border-sand-200 rounded-md md:col-span-2">
                        <p className="text-xs text-stone-500">App URL</p>
                        <p className="text-sm font-mono text-charcoal-950 mt-0.5">{systemInfo.app_url}</p>
                      </div>
                    </div>
                  </SettingsCard>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
