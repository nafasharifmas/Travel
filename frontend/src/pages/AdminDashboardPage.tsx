import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Place,
  Category,
  User,
  AuditLogItem,
  AdminMetrics,
  MediaItem,
} from '../types';
import {
  AdminSidebar,
  AdminTab,
} from '../components/admin/AdminSidebar';
import { AdminTopbar } from '../components/admin/AdminTopbar';
import {
  MapPin,
  FolderTree,
  Users,
  History,
  Plus,
  Trash2,
  Edit2,
  Archive,
  RotateCcw,
  Upload,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  X,
  AlertTriangle,
  Loader2,
  Search,
  ArrowRight,
  CalendarDays,
  Settings,
  Globe,
  HardDrive,
  Mail,
  Palette,
  Info,
  TrendingUp,
  TrendingDown,
  Activity,
  Eye,
  MoreHorizontal,
  Sparkles,
} from 'lucide-react';
import { SettingsCard } from '../components/admin/settings/SettingsCard';
import { SettingsInput } from '../components/admin/settings/SettingsInput';
import { SettingsToggle } from '../components/admin/settings/SettingsToggle';
import { SettingsSelect } from '../components/admin/settings/SettingsSelect';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface KpiCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  note: string;
  trend?: { value: number; isPositive: boolean };
  gradient: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ icon: Icon, label, value, note, trend, gradient }) => (
  <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5 group-hover:opacity-10 transition-opacity`} />
    <CardContent className="p-6 relative">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-600">{label}</p>
          <p className="text-3xl font-bold text-slate-900 tabular-nums tracking-tight">{value.toLocaleString()}</p>
          <div className="flex items-center gap-2">
            {trend && (
              <div className={`flex items-center gap-1 text-xs font-medium ${trend.isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                {trend.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                <span>{Math.abs(trend.value)}%</span>
              </div>
            )}
            <p className="text-xs text-slate-500">{note}</p>
          </div>
        </div>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const KpiSkeleton: React.FC = () => (
  <Card className="border-0 shadow-lg animate-pulse">
    <CardContent className="p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-3 flex-1">
          <div className="h-4 w-24 bg-slate-200 rounded" />
          <div className="h-8 w-16 bg-slate-200 rounded" />
          <div className="h-3 w-32 bg-slate-200 rounded" />
        </div>
        <div className="w-12 h-12 rounded-xl bg-slate-200" />
      </div>
    </CardContent>
  </Card>
);

const EmptyState: React.FC<{
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  hint: string;
}> = ({ icon: Icon, title, hint }) => (
  <div className="py-12 flex flex-col items-center text-center">
    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
      <Icon className="w-6 h-6 text-slate-400" />
    </div>
    <p className="text-sm font-semibold text-slate-900">{title}</p>
    <p className="mt-1 text-sm text-slate-500 max-w-sm">{hint}</p>
  </div>
);

const actionIcon = (action: string) => {
  const a = action.toLowerCase();
  if (a.includes('categor')) return FolderTree;
  if (a.includes('upload') || a.includes('photo') || a.includes('media')) return Upload;
  if (a.includes('user') || a.includes('role') || a.includes('status')) return Users;
  if (a.includes('place')) return MapPin;
  return History;
};

const formatTime = (iso: string) =>
  new Date(iso).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const SRS_BASELINE = 10;

interface AdminDashboardPageProps {
  defaultTab?: AdminTab;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ defaultTab }) => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const tabParam = searchParams.get('tab') as AdminTab | null;
  const initialTab: AdminTab =
    defaultTab ||
    (location.pathname.includes('/settings')
      ? 'settings'
      : tabParam || 'overview');

  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('visitflow_admin_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('visitflow_admin_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  // Settings Data
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [systemInfo, setSystemInfo] = useState<Record<string, any>>({});
  const [settingsSection, setSettingsSection] = useState('general');
  const [savingSettings, setSavingSettings] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [settingsFeedback, setSettingsFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Overview Data
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [recentAudits, setRecentAudits] = useState<AuditLogItem[]>([]);

  // Places Data
  const [places, setPlaces] = useState<Place[]>([]);
  const [placeStatusFilter, setPlaceStatusFilter] = useState<
    'active' | 'archived' | undefined
  >(undefined);
  const [placeSearch, setPlaceSearch] = useState('');

  // Categories Data
  const [categories, setCategories] = useState<Category[]>([]);

  // Users Data
  const [usersList, setUsersList] = useState<User[]>([]);

  // Itineraries Data
  const [adminItineraries, setAdminItineraries] = useState<any[]>([]);

  // Data Quality & Health
  const [dataQuality, setDataQuality] = useState<any>(null);
  const [systemHealth, setSystemHealth] = useState<any>(null);

  // Audit Logs Data
  const [allAuditLogs, setAllAuditLogs] = useState<AuditLogItem[]>([]);

  // Modals & Forms
  const [isPlaceModalOpen, setIsPlaceModalOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);
  const [placeForm, setPlaceForm] = useState({
    name: '',
    category_id: 1,
    description: '',
    travel_tips: '',
    address: '',
    lat: 7.957,
    lng: 80.76,
    opening_hours: '',
    contact_info: '',
    photo_url: '',
  });

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    icon: 'MapPin',
    color: '#d97706',
  });

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadPlaceId, setUploadPlaceId] = useState<number | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [editingMedia, setEditingMedia] = useState<MediaItem | null>(null);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load Dashboard Data
  const loadDashboard = async () => {
    try {
      const res = await api.getAdminDashboard();
      setMetrics(res.metrics);
      setRecentAudits(res.recent_audits);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard metrics.');
    }
  };

  const loadPlaces = async () => {
    try {
      const res = await api.getAdminPlaces({
        status: placeStatusFilter,
        search: placeSearch || undefined,
      });
      setPlaces(res.places);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await api.getAdminCategories();
      setCategories(res.categories);
      if (res.categories.length > 0 && placeForm.category_id === 1) {
        setPlaceForm((prev) => ({ ...prev, category_id: res.categories[0].id }));
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await api.getAdminUsers();
      setUsersList(res.users);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const loadAuditLogs = async () => {
    try {
      const res = await api.getAuditLogs();
      setAllAuditLogs(res.data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const loadAdminItineraries = async () => {
    try {
      const res = await api.getAdminItineraries();
      setAdminItineraries(res.itineraries || []);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const loadDataQuality = async () => {
    try {
      const res = await api.getAdminDataQuality();
      setDataQuality(res);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const loadSystemHealth = async () => {
    try {
      const res = await api.getAdminSystemHealth();
      setSystemHealth(res);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const loadSettings = async () => {
    try {
      setLoadingSettings(true);
      const res = await api.getAdminSettings();
      const settingsMap: Record<string, any> = {};
      Object.values(res.settings || {}).forEach((group: any) => {
        if (Array.isArray(group)) {
          group.forEach((item: any) => {
            settingsMap[item.key] = item.value;
          });
        }
      });
      setSettings(settingsMap);
      setSystemInfo(res.system_info || {});
    } catch (err: any) {
      setError(err.message || 'Failed to load platform settings.');
    } finally {
      setLoadingSettings(false);
    }
  };

  const handleSaveSettings = async (keys: string[]) => {
    setSavingSettings(true);
    try {
      const payload: Record<string, any> = {};
      keys.forEach((key) => {
        if (settings[key] !== undefined) {
          payload[key] = settings[key];
        }
      });
      await api.updateAdminSettings({ settings: payload });
      setSettingsFeedback({ type: 'success', text: 'Settings updated successfully.' });
      setTimeout(() => setSettingsFeedback(null), 3500);
    } catch (err: any) {
      setSettingsFeedback({ type: 'error', text: err.message || 'Failed to update settings.' });
      setTimeout(() => setSettingsFeedback(null), 3500);
    } finally {
      setSavingSettings(false);
    }
  };

  const updateSetting = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    } else if (location.pathname.includes('/settings')) {
      setActiveTab('settings');
    }
  }, [defaultTab, location.pathname]);

  useEffect(() => {
    if (!isAdmin) return;
    setLoading(true);
    Promise.all([
      loadDashboard(),
      loadPlaces(),
      loadCategories(),
      loadUsers(),
      loadAuditLogs(),
      loadAdminItineraries(),
      loadDataQuality(),
      loadSystemHealth(),
      loadSettings(),
    ]).finally(() => setLoading(false));
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin && activeTab === 'places') {
      loadPlaces();
    }
  }, [placeStatusFilter, placeSearch, activeTab]);

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-0 shadow-2xl">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Admin Privileges Required
            </h2>
            <p className="text-sm text-slate-600">
              Privileged console actions require verified administrator credentials.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- Place Actions ---
  const handleOpenPlaceCreate = () => {
    setEditingPlace(null);
    setPlaceForm({
      name: '',
      category_id: categories.length > 0 ? categories[0].id : 1,
      description: '',
      travel_tips: '',
      address: '',
      lat: 7.957,
      lng: 80.76,
      opening_hours: '08:00 AM - 05:00 PM',
      contact_info: '',
      photo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Maruthamunai_beach.jpg/1280px-Maruthamunai_beach.jpg',
    });
    setIsPlaceModalOpen(true);
  };

  const handleOpenPlaceEdit = (place: Place) => {
    setEditingPlace(place);
    setPlaceForm({
      name: place.name,
      category_id: place.category ? place.category.id : 1,
      description: place.description,
      travel_tips: place.travel_tips || '',
      address: place.address || '',
      lat: place.lat,
      lng: place.lng,
      opening_hours: place.opening_hours || '',
      contact_info: place.contact_info || '',
      photo_url: '',
    });
    setIsPlaceModalOpen(true);
  };

  const handleSavePlace = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPlace) {
        await api.updateAdminPlace(editingPlace.id, {
          name: placeForm.name,
          category_id: placeForm.category_id,
          description: placeForm.description,
          travel_tips: placeForm.travel_tips,
          address: placeForm.address,
          lat: Number(placeForm.lat),
          lng: Number(placeForm.lng),
          opening_hours: placeForm.opening_hours,
          contact_info: placeForm.contact_info,
        });
        setMessage(`Place "${placeForm.name}" updated successfully.`);
      } else {
        await api.createAdminPlace({
          name: placeForm.name,
          category_id: placeForm.category_id,
          description: placeForm.description,
          travel_tips: placeForm.travel_tips,
          address: placeForm.address,
          lat: Number(placeForm.lat),
          lng: Number(placeForm.lng),
          opening_hours: placeForm.opening_hours,
          contact_info: placeForm.contact_info,
          photo_url: placeForm.photo_url,
        });
        setMessage(`Place "${placeForm.name}" added to catalogue.`);
      }
      setIsPlaceModalOpen(false);
      loadPlaces();
      loadDashboard();
      loadAuditLogs();
    } catch (err: any) {
      alert(err.message || 'Error saving place.');
    }
  };

  const handleArchivePlace = async (place: Place) => {
    if (
      !window.confirm(
        `Are you sure you want to archive "${place.name}"? It will be hidden from public discovery while preserved for existing itineraries.`
      )
    ) {
      return;
    }
    try {
      await api.archiveAdminPlace(place.id);
      setMessage(`"${place.name}" archived successfully.`);
      loadPlaces();
      loadDashboard();
      loadAuditLogs();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRestorePlace = async (place: Place) => {
    try {
      await api.restoreAdminPlace(place.id);
      setMessage(`"${place.name}" restored to active catalogue.`);
      loadPlaces();
      loadDashboard();
      loadAuditLogs();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // --- Category Actions ---
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await api.updateAdminCategory(editingCategory.id, categoryForm);
        setMessage(`Category "${categoryForm.name}" updated.`);
      } else {
        await api.createAdminCategory(categoryForm);
        setMessage(`Category "${categoryForm.name}" created.`);
      }
      setIsCategoryModalOpen(false);
      loadCategories();
      loadDashboard();
      loadAuditLogs();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteCategory = async (cat: Category) => {
    if (!window.confirm(`Delete category "${cat.name}"?`)) return;
    try {
      await api.deleteAdminCategory(cat.id);
      setMessage(`Category "${cat.name}" deleted.`);
      loadCategories();
      loadDashboard();
      loadAuditLogs();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // --- User Actions ---
  const handleToggleUserRole = async (u: User) => {
    const newRole = u.role === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Change role of ${u.name} to ${newRole}?`)) return;
    try {
      await api.updateUserRole(u.id, newRole);
      setMessage(`Updated ${u.name}'s role to ${newRole}.`);
      loadUsers();
      loadAuditLogs();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleUserStatus = async (u: User) => {
    const nextStatus = !u.is_active;
    const actionLabel = nextStatus ? 'activate' : 'deactivate';
    if (!window.confirm(`Are you sure you want to ${actionLabel} account for ${u.name}?`)) return;
    try {
      await api.updateUserStatus(u.id, nextStatus);
      setMessage(`Account ${u.name} is now ${nextStatus ? 'active' : 'deactivated'}.`);
      loadUsers();
      loadAuditLogs();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // --- Media Upload (FR-11) ---
  const handleUploadPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadPlaceId || !uploadFile) return;

    try {
      await api.uploadPlacePhoto(uploadPlaceId, uploadFile, editingMedia?.is_primary ?? false);
      if (editingMedia) {
        await api.deletePlaceMedia(editingMedia.id);
      }
      setMessage(editingMedia ? 'Photograph replaced successfully.' : 'Photograph uploaded, validated, and stored securely.');
      setIsUploadModalOpen(false);
      setUploadFile(null);
      setEditingMedia(null);
      loadPlaces();
      loadAuditLogs();
    } catch (err: any) {
      alert(err.message || 'Failed to upload photo.');
    }
  };

  const handleDeletePhoto = async (media: MediaItem) => {
    if (!window.confirm(`Delete ${media.original_name || 'this photograph'}? This cannot be undone.`)) return;

    try {
      await api.deletePlaceMedia(media.id);
      setMessage('Photograph deleted successfully.');
      loadPlaces();
      loadAuditLogs();
    } catch (err: any) {
      alert(err.message || 'Failed to delete photo.');
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleOpenCategoryCreate = () => {
    setEditingCategory(null);
    setCategoryForm({ name: '', description: '', icon: 'Landmark', color: '#f59e0b' });
    setIsCategoryModalOpen(true);
  };

  // Derived overview figures
  const totalPlaces = metrics ? metrics.total_places : 0;
  const activeShare =
    totalPlaces > 0 && metrics ? Math.round((metrics.active_places / totalPlaces) * 100) : 0;
  const compliancePct = metrics
    ? Math.min(100, Math.round((metrics.active_places / SRS_BASELINE) * 100))
    : 0;
  const topCategories = [...categories]
    .sort((a, b) => (b.places_count || 0) - (a.places_count || 0))
    .slice(0, 6);
  const maxCategoryCount = Math.max(
    1,
    ...topCategories.map((c) => c.places_count || 0)
  );
  const adminCount = usersList.filter((u) => u.role === 'admin').length;
  const activeUserCount = usersList.filter((u) => u.is_active).length;

  const uploadPlace = uploadPlaceId ? places.find((place) => place.id === uploadPlaceId) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <AdminSidebar
        activeTab={activeTab}
        onSelect={setActiveTab}
        counts={{
          places: places.length,
          categories: categories.length,
          users: usersList.length,
        }}
        user={user}
        mobileOpen={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
        onLogout={handleLogout}
        collapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
      />

      <div
        className={`${
          isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        } flex flex-col min-h-screen transition-all duration-300 ease-in-out`}
      >
        <AdminTopbar
          activeTab={activeTab}
          user={user}
          onOpenMobileMenu={() => setIsMobileNavOpen(true)}
          onAddPlace={handleOpenPlaceCreate}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleCollapse={toggleSidebarCollapse}
        />

        <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-[1600px] w-full mx-auto">
          {/* Feedback banners */}
          {error && (
            <div className="p-4 bg-red-50/80 backdrop-blur border border-red-200 text-red-800 rounded-xl flex items-center justify-between shadow-lg animate-in slide-in-from-top-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                {error}
              </div>
              <button
                type="button"
                onClick={() => setError(null)}
                className="text-red-500 hover:text-red-700 p-1 transition-colors"
                aria-label="Dismiss error"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {message && (
            <div className="p-4 bg-emerald-50/80 backdrop-blur border border-emerald-200 text-emerald-800 rounded-xl flex items-center justify-between shadow-lg animate-in slide-in-from-top-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {message}
              </div>
              <button
                type="button"
                onClick={() => setMessage(null)}
                className="text-emerald-600 hover:text-emerald-700 p-1 transition-colors"
                aria-label="Dismiss message"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {loading || !metrics ? (
                  Array.from({ length: 6 }).map((_, i) => <KpiSkeleton key={i} />)
                ) : (
                  <>
                    <KpiCard
                      icon={MapPin}
                      label="Total Places"
                      value={metrics.total_places}
                      note="Catalogue records"
                      gradient="from-blue-500 to-cyan-500"
                      trend={{ value: 12, isPositive: true }}
                    />
                    <KpiCard
                      icon={CheckCircle2}
                      label="Active (Live)"
                      value={metrics.active_places}
                      note="Visible in discovery"
                      gradient="from-emerald-500 to-teal-500"
                      trend={{ value: 8, isPositive: true }}
                    />
                    <KpiCard
                      icon={Archive}
                      label="Archived"
                      value={metrics.archived_places}
                      note="Soft-deleted records"
                      gradient="from-amber-500 to-orange-500"
                    />
                    <KpiCard
                      icon={FolderTree}
                      label="Categories"
                      value={metrics.categories}
                      note="Taxonomy terms"
                      gradient="from-purple-500 to-pink-500"
                    />
                    <KpiCard
                      icon={Users}
                      label="Registered Users"
                      value={metrics.users}
                      note="All accounts"
                      gradient="from-indigo-500 to-blue-500"
                      trend={{ value: 15, isPositive: true }}
                    />
                    <KpiCard
                      icon={CalendarDays}
                      label="Itineraries"
                      value={metrics.itineraries}
                      note="Trips planned"
                      gradient="from-rose-500 to-pink-500"
                      trend={{ value: 23, isPositive: true }}
                    />
                  </>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <Card className="lg:col-span-7 border-0 shadow-lg">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg font-semibold">Catalogue Health</CardTitle>
                        <CardDescription>Overview of place distribution and status</CardDescription>
                      </div>
                      <Badge variant="info">{activeShare}% Live</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">

                  {metrics ? (
                    <>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-slate-700">Status Distribution</span>
                        </div>
                        <div className="h-3 rounded-full bg-slate-100 overflow-hidden flex shadow-inner">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-700 ease-out"
                            style={{ width: `${activeShare}%` }}
                          />
                          <div
                            className="h-full bg-gradient-to-r from-amber-400 to-orange-400 transition-all duration-700 ease-out"
                            style={{ width: `${100 - activeShare}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" />
                            <span className="text-sm text-slate-600">
                              Active: <span className="font-semibold text-slate-900">{metrics.active_places}</span>
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-amber-400 to-orange-400" />
                            <span className="text-sm text-slate-600">
                              Archived: <span className="font-semibold text-slate-900">{metrics.archived_places}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-slate-100 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-slate-900">Top Categories</h4>
                          <Button variant="ghost" size="sm" onClick={() => setActiveTab('categories')} className="text-xs">
                            View all
                            <ArrowRight className="w-3 h-3 ml-1" />
                          </Button>
                        </div>
                        {topCategories.length === 0 ? (
                          <p className="text-sm text-slate-500 text-center py-4">No categories created yet.</p>
                        ) : (
                          <div className="space-y-3">
                            {topCategories.map((cat) => (
                              <div key={cat.id} className="space-y-2 group">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <div
                                      className="w-2 h-2 rounded-full"
                                      style={{ backgroundColor: cat.color || '#06b6d4' }}
                                    />
                                    <span className="text-sm font-medium text-slate-700 truncate group-hover:text-slate-900 transition-colors">
                                      {cat.name}
                                    </span>
                                  </div>
                                  <Badge variant="secondary" className="tabular-nums">
                                    {cat.places_count || 0}
                                  </Badge>
                                </div>
                                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                                  <div
                                    className="h-full rounded-full transition-all duration-700 ease-out"
                                    style={{
                                      width: `${((cat.places_count || 0) / maxCategoryCount) * 100}%`,
                                      background: `linear-gradient(90deg, ${cat.color || '#06b6d4'} 0%, ${cat.color || '#14b8a6'} 100%)`,
                                    }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="py-12 flex justify-center text-slate-400">
                      <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                  )}
                  </CardContent>
                </Card>

                <Card className="lg:col-span-5 border-0 shadow-lg">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-cyan-500" />
                      Quick Actions
                    </CardTitle>
                    <CardDescription>Common administrative tasks</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Button
                        onClick={handleOpenPlaceCreate}
                        className="w-full justify-start bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white shadow-lg shadow-cyan-500/25"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add New Place
                      </Button>
                      <Button
                        onClick={handleOpenCategoryCreate}
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add New Category
                      </Button>
                      <Button
                        onClick={() => setActiveTab('users')}
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <Users className="w-4 h-4 mr-2" />
                        Manage Users
                      </Button>
                    </div>

                    <div className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center">
                          <ShieldCheck className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">Launch Baseline</p>
                          <p className="text-xs text-slate-500">Target completion</p>
                        </div>
                      </div>
                      {metrics ? (
                        <>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600">Progress</span>
                            <span className="font-semibold text-slate-900">{metrics.active_places} / {SRS_BASELINE}</span>
                          </div>
                          <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-cyan-500 to-teal-500 transition-all duration-700"
                              style={{ width: `${compliancePct}%` }}
                            />
                          </div>
                          <p className="text-xs text-slate-600">
                            {compliancePct >= 100 ? (
                              <span className="text-emerald-600 font-medium flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                Baseline satisfied
                              </span>
                            ) : (
                              `${SRS_BASELINE - metrics.active_places} places remaining to reach baseline`
                            )}
                          </p>
                        </>
                      ) : (
                        <div className="h-2 bg-slate-200 rounded-full animate-pulse" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <Activity className="w-5 h-5 text-cyan-500" />
                        Recent Activity
                      </CardTitle>
                      <CardDescription>Latest administrative actions across the platform</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab('audit')}>
                      View all
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {recentAudits.length === 0 ? (
                    <EmptyState
                      icon={History}
                      title="No activity yet"
                      hint="Administrative actions will appear here as they occur."
                    />
                  ) : (
                    <div className="space-y-1">
                      {recentAudits.slice(0, 8).map((a, idx) => {
                        const Icon = actionIcon(a.action);
                        return (
                          <div
                            key={a.id}
                            className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors group"
                            style={{ animationDelay: `${idx * 50}ms` }}
                          >
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                              <Icon className="w-4 h-4 text-slate-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-slate-900 truncate">{a.action}</p>
                              <p className="text-xs text-slate-500 truncate">
                                by {a.actor ? a.actor.name : 'System'} • {a.ip_address || '127.0.0.1'}
                              </p>
                            </div>
                            <span className="text-xs text-slate-400 whitespace-nowrap">{formatTime(a.created_at)}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* TAB 2: PLACES CRUD & ARCHIVE (FR-08) */}
          {activeTab === 'places' && (
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg font-semibold">Places Management</CardTitle>
                    <CardDescription>Manage your destination catalogue</CardDescription>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="search"
                        value={placeSearch}
                        onChange={(e) => setPlaceSearch(e.target.value)}
                        placeholder="Search places..."
                        className="pl-9 pr-4 py-2 w-full sm:w-64 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
                      />
                    </div>

                    <select
                      value={placeStatusFilter || ''}
                      onChange={(e) =>
                        setPlaceStatusFilter((e.target.value as 'active' | 'archived') || undefined)
                      }
                      aria-label="Filter Places by status"
                      className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
                    >
                      <option value="">All Status</option>
                      <option value="active">Active</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-slate-200 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50/50">
                        <TableHead className="font-semibold">Place</TableHead>
                        <TableHead className="font-semibold">Category</TableHead>
                        <TableHead className="font-semibold">Coordinates</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="font-semibold">Media</TableHead>
                        <TableHead className="text-right font-semibold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {places.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6}>
                            <EmptyState
                              icon={MapPin}
                              title="No places found"
                              hint="Adjust your filters, or add a new destination to get started."
                            />
                          </TableCell>
                        </TableRow>
                      )}
                      {places.map((place) => (
                        <TableRow key={place.id} className="hover:bg-slate-50/50 transition-colors">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {place.primary_photo ? (
                                <img
                                  src={place.primary_photo}
                                  alt={place.name}
                                  className="w-10 h-10 object-cover rounded-lg border border-slate-200"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-200 flex items-center justify-center">
                                  <MapPin className="w-4 h-4 text-slate-400" />
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-slate-900 truncate">{place.name}</p>
                                <p className="text-xs text-slate-500 truncate max-w-xs">
                                  {place.address || 'No address'}
                                </p>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <Badge variant="secondary">{place.category ? place.category.name : 'Uncategorized'}</Badge>
                          </TableCell>

                          <TableCell>
                            <span className="text-xs font-mono text-slate-600">
                              {place.lat.toFixed(4)}, {place.lng.toFixed(4)}
                            </span>
                          </TableCell>

                          <TableCell>
                            {place.is_archived ? (
                              <Badge variant="warning">Archived</Badge>
                            ) : (
                              <Badge variant="success">Active</Badge>
                            )}
                          </TableCell>

                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setUploadPlaceId(place.id);
                                setIsUploadModalOpen(true);
                              }}
                              className="text-xs"
                            >
                              <Upload className="w-3 h-3 mr-1" />
                              {place.media_count || place.photos_count || 0} photos
                            </Button>
                          </TableCell>

                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenPlaceEdit(place)}
                                className="h-8 w-8"
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>

                              {place.is_archived ? (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRestorePlace(place)}
                                  className="h-8 w-8"
                                >
                                  <RotateCcw className="w-4 h-4" />
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleArchivePlace(place)}
                                  className="h-8 w-8"
                                >
                                  <Archive className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* TAB 3: CATEGORIES CRUD (FR-09) */}
          {activeTab === 'categories' && (
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg font-semibold">Categories</CardTitle>
                    <CardDescription>Organize destinations by themes and interests</CardDescription>
                  </div>

                  <Button
                    onClick={handleOpenCategoryCreate}
                    className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Category
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {categories.length === 0 ? (
                  <EmptyState
                    icon={FolderTree}
                    title="No categories yet"
                    hint="Create taxonomy terms so travellers can filter destinations by interest."
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map((cat) => (
                      <Card
                        key={cat.id}
                        className="border border-slate-200 hover:border-cyan-300 hover:shadow-lg transition-all duration-300 group"
                      >
                        <CardContent className="p-5 space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center shadow-md"
                                style={{ background: `linear-gradient(135deg, ${cat.color || '#06b6d4'} 0%, ${cat.color}dd 100%)` }}
                              >
                                <FolderTree className="w-5 h-5 text-white" />
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-sm font-semibold text-slate-900 truncate group-hover:text-cyan-700 transition-colors">{cat.name}</h4>
                                <p className="text-xs text-slate-500 truncate">{cat.slug}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setEditingCategory(cat);
                                  setCategoryForm({
                                    name: cat.name,
                                    description: cat.description || '',
                                    icon: cat.icon || 'MapPin',
                                    color: cat.color || '#06b6d4',
                                  });
                                  setIsCategoryModalOpen(true);
                                }}
                                className="h-8 w-8"
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteCategory(cat)}
                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          <p className="text-sm text-slate-600 line-clamp-2 min-h-[40px]">
                            {cat.description || 'No description provided'}
                          </p>

                          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-xs text-slate-500">Destinations</span>
                            <Badge variant="info">{cat.places_count || 0}</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* TAB 4: USERS MANAGEMENT (FR-10) */}
          {activeTab === 'users' && (
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg font-semibold">User Management</CardTitle>
                    <CardDescription>Manage accounts, roles and permissions</CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{usersList.length} Total</Badge>
                    <Badge variant="info">{adminCount} Admins</Badge>
                    <Badge variant="success">{activeUserCount} Active</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-slate-200 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50/50">
                        <TableHead className="font-semibold">User</TableHead>
                        <TableHead className="font-semibold">Email</TableHead>
                        <TableHead className="font-semibold">Role</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="font-semibold">Itineraries</TableHead>
                        <TableHead className="text-right font-semibold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usersList.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6}>
                            <EmptyState
                              icon={Users}
                              title="No user accounts found"
                              hint="Registered users will appear here once they create an account."
                            />
                          </TableCell>
                        </TableRow>
                      )}
                      {usersList.map((u) => (
                        <TableRow key={u.id} className="hover:bg-slate-50/50 transition-colors">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-teal-500 text-white text-sm font-semibold flex items-center justify-center shadow-md">
                                {u.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-sm font-medium text-slate-900">{u.name}</span>
                            </div>
                          </TableCell>

                          <TableCell className="text-sm text-slate-600">{u.email}</TableCell>

                          <TableCell>
                            {u.role === 'admin' ? (
                              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">Admin</Badge>
                            ) : (
                              <Badge variant="secondary">User</Badge>
                            )}
                          </TableCell>

                          <TableCell>
                            {u.is_active ? (
                              <Badge variant="success">Active</Badge>
                            ) : (
                              <Badge variant="secondary">Deactivated</Badge>
                            )}
                          </TableCell>

                          <TableCell className="text-sm text-slate-600 tabular-nums">{u.itineraries_count || 0}</TableCell>

                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleToggleUserRole(u)}
                              >
                                {u.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                              </Button>
                              <Button
                                variant={u.is_active ? 'outline' : 'default'}
                                size="sm"
                                onClick={() => handleToggleUserStatus(u)}
                                className={u.is_active ? '' : 'bg-gradient-to-r from-cyan-500 to-teal-500'}
                              >
                                {u.is_active ? 'Deactivate' : 'Activate'}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* TAB 5: ITINERARIES ADMINISTRATION */}
          {activeTab === 'itineraries' && (
            <div className="bg-white rounded-lg border border-sand-200 p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-medium text-charcoal-950">Itineraries</h3>
                  <p className="text-xs text-stone-500">Saved trips</p>
                </div>
                <span className="text-xs text-stone-500">{adminItineraries.length} total</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-sand-200">
                      <th className="py-2 pr-3 text-xs font-medium text-stone-500">Itinerary</th>
                      <th className="py-2 pr-3 text-xs font-medium text-stone-500">Owner</th>
                      <th className="py-2 pr-3 text-xs font-medium text-stone-500">Items</th>
                      <th className="py-2 pr-3 text-xs font-medium text-stone-500">Start date</th>
                      <th className="py-2 text-right text-xs font-medium text-stone-500">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminItineraries.length === 0 && (
                      <tr>
                        <td colSpan={5}>
                          <EmptyState icon={CalendarDays} title="No itineraries" hint="None yet." />
                        </td>
                      </tr>
                    )}
                    {adminItineraries.map((it: any) => (
                      <tr key={it.id} className="border-b border-sand-100 last:border-0">
                        <td className="py-2.5 pr-3">
                          <p className="text-sm text-charcoal-950">{it.title}</p>
                          {it.notes && <p className="text-xs text-stone-500 truncate max-w-xs">{it.notes}</p>}
                        </td>
                        <td className="py-2.5 pr-3">
                          {it.user ? (
                            <div>
                              <p className="text-sm text-charcoal-950">{it.user.name}</p>
                              <p className="text-xs text-stone-500">{it.user.email}</p>
                            </div>
                          ) : (
                            <span className="text-xs text-stone-400">—</span>
                          )}
                        </td>
                        <td className="py-2.5 pr-3 text-sm text-stone-600">{it.items_count}</td>
                        <td className="py-2.5 pr-3 text-sm text-stone-600">{it.start_date || '—'}</td>
                        <td className="py-2.5 text-right text-sm text-stone-500">{it.created_at ? new Date(it.created_at).toLocaleDateString() : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: DATA QUALITY */}
          {activeTab === 'data-quality' && (
            <div className="bg-white rounded-lg border border-sand-200 p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-medium text-charcoal-950">Data quality</h3>
                  <p className="text-xs text-stone-500">Validation checks</p>
                </div>
                <button type="button" onClick={loadDataQuality} className="px-2.5 py-1 text-xs text-stone-600 hover:text-charcoal-950 hover:bg-sand-50 rounded-md">Recheck</button>
              </div>
              {dataQuality?.issues?.length === 0 ? (
                <EmptyState icon={CheckCircle2} title="No issues" hint="All checks passed." />
              ) : (
                <ul className="divide-y divide-sand-100">
                  {(dataQuality?.issues || []).map((issue: any, idx: number) => (
                    <li key={idx} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-2.5">
                        <AlertTriangle className="w-4 h-4 text-stone-400" />
                        <div>
                          <p className="text-sm text-charcoal-950">{issue.message}</p>
                          <p className="text-xs text-stone-500">Severity: {issue.severity}</p>
                        </div>
                      </div>
                      <span className="text-xs text-stone-500">{issue.count}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* TAB 7: SYSTEM HEALTH */}
          {activeTab === 'system-health' && (
            <div className="bg-white rounded-lg border border-sand-200 p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-medium text-charcoal-950">System health</h3>
                  <p className="text-xs text-stone-500">Operational checks</p>
                </div>
                <button type="button" onClick={loadSystemHealth} className="px-2.5 py-1 text-xs text-stone-600 hover:text-charcoal-950 hover:bg-sand-50 rounded-md">Refresh</button>
              </div>
              {systemHealth && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {Object.entries(systemHealth.checks || {}).map(([key, val]: [string, any]) => (
                    <div key={key} className="p-3 rounded-md border border-sand-200 flex items-center justify-between">
                      <p className="text-sm text-charcoal-950 capitalize">{key}</p>
                      <span className="text-xs text-stone-600">{val.status}</span>
                    </div>
                  ))}
                </div>
              )}
              {systemHealth?.timestamp && <p className="text-xs text-stone-500">Last checked: {new Date(systemHealth.timestamp).toLocaleString()}</p>}
            </div>
          )}

          {/* TAB 8: AUDIT LOG (Page 6 & 7) */}
          {activeTab === 'audit' && (
            <div className="bg-white rounded-lg border border-sand-200 p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-medium text-charcoal-950">Audit trail</h3>
                  <p className="text-xs text-stone-500">Activity log</p>
                </div>
                <span className="text-xs text-stone-500">{allAuditLogs.length} entries</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-sand-200">
                      <th className="py-2 pr-3 text-xs font-medium text-stone-500">Time</th>
                      <th className="py-2 pr-3 text-xs font-medium text-stone-500">Actor</th>
                      <th className="py-2 pr-3 text-xs font-medium text-stone-500">Action</th>
                      <th className="py-2 pr-3 text-xs font-medium text-stone-500">Target</th>
                      <th className="py-2 pr-3 text-xs font-medium text-stone-500">IP</th>
                      <th className="py-2 text-right text-xs font-medium text-stone-500">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allAuditLogs.length === 0 && (
                      <tr>
                        <td colSpan={6}>
                          <EmptyState icon={History} title="No entries" hint="No activity recorded." />
                        </td>
                      </tr>
                    )}
                    {allAuditLogs.map((log) => (
                      <tr key={log.id} className="border-b border-sand-100 last:border-0">
                        <td className="py-2.5 pr-3 text-xs text-stone-500 whitespace-nowrap">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td className="py-2.5 pr-3 text-sm text-charcoal-950">
                          {log.actor ? log.actor.name : 'System'}
                        </td>
                        <td className="py-2.5 pr-3 text-sm text-stone-600">{log.action}</td>
                        <td className="py-2.5 pr-3 text-sm text-stone-600">
                          {log.subject_type ? `${log.subject_type.split('\\').pop()} #${log.subject_id}` : '—'}
                        </td>
                        <td className="py-2.5 pr-3 text-xs text-stone-500">{log.ip_address || '—'}</td>
                        <td className="py-2.5 text-right text-xs text-stone-500 max-w-xs truncate">
                          {log.payload ? JSON.stringify(log.payload) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 9: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              {settingsFeedback && (
                <div
                  className={`p-4 rounded-2xl flex items-center justify-between text-xs font-bold border shadow-sm ${
                    settingsFeedback.type === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {settingsFeedback.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                    )}
                    <span>{settingsFeedback.text}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSettingsFeedback(null)}
                    className="text-stone-400 hover:text-stone-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="flex flex-col lg:flex-row gap-6">
                {/* Subcategory Navigation */}
                <div className="lg:w-64 shrink-0">
                  <div className="bg-white rounded-3xl border border-sand-200 shadow-sm p-3 space-y-1">
                    <p className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                      Settings Group
                    </p>
                    {[
                      { id: 'general', label: 'General', icon: Settings },
                      { id: 'map', label: 'Map & Location', icon: Globe },
                      { id: 'security', label: 'Security', icon: ShieldCheck },
                      { id: 'catalogue', label: 'Catalogue', icon: FolderTree },
                      { id: 'media', label: 'Media & Storage', icon: HardDrive },
                      { id: 'email', label: 'Email (SMTP)', icon: Mail },
                      { id: 'appearance', label: 'Appearance', icon: Palette },
                      { id: 'system', label: 'System Info', icon: Info },
                    ].map((item) => {
                      const SubIcon = item.icon;
                      const isSubActive = settingsSection === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setSettingsSection(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all text-left ${
                            isSubActive
                              ? 'bg-turquoise-500 text-navy-950 shadow-sm ring-1 ring-turquoise-400/40'
                              : 'text-stone-600 hover:bg-sand-100/70 hover:text-charcoal-950'
                          }`}
                        >
                          <SubIcon className={`w-4 h-4 ${isSubActive ? 'text-navy-950' : 'text-stone-400'}`} />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Settings Forms */}
                <div className="flex-1">
                  {loadingSettings ? (
                    <div className="bg-white rounded-3xl border border-sand-200 p-12 text-center shadow-sm">
                      <Loader2 className="w-8 h-8 text-turquoise-500 animate-spin mx-auto" />
                      <p className="mt-3 text-xs font-bold text-charcoal-950">Loading platform settings...</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* General */}
                      {settingsSection === 'general' && (
                        <SettingsCard
                          title="General Settings"
                          description="Core platform identity, contact channels, and customer support information."
                          onSave={() =>
                            handleSaveSettings([
                              'app_name',
                              'app_tagline',
                              'contact_email',
                              'support_number',
                              'footer_text',
                            ])
                          }
                          saving={savingSettings}
                        >
                          <SettingsInput
                            label="Application Name"
                            value={settings.app_name || ''}
                            onChange={(v) => updateSetting('app_name', v)}
                            placeholder="VisitFlow"
                          />
                          <SettingsInput
                            label="Tagline"
                            value={settings.app_tagline || ''}
                            onChange={(v) => updateSetting('app_tagline', v)}
                            placeholder="Curated Sri Lanka Travel Intelligence"
                          />
                          <SettingsInput
                            label="Contact Email"
                            type="email"
                            value={settings.contact_email || ''}
                            onChange={(v) => updateSetting('contact_email', v)}
                            placeholder="support@visitflow.lk"
                          />
                          <SettingsInput
                            label="Support Phone"
                            value={settings.support_number || ''}
                            onChange={(v) => updateSetting('support_number', v)}
                            placeholder="+94 11 234 5678"
                          />
                          <SettingsInput
                            label="Footer Disclaimer / Text"
                            value={settings.footer_text || ''}
                            onChange={(v) => updateSetting('footer_text', v)}
                            placeholder="© 2026 VisitFlow Sri Lanka"
                          />
                        </SettingsCard>
                      )}

                      {/* Map & Location */}
                      {settingsSection === 'map' && (
                        <SettingsCard
                          title="Map & Spatial Boundaries"
                          description="Configure geographic reference center, discovery radius, and boundary clamps."
                          onSave={() =>
                            handleSaveSettings([
                              'map_ref_lat',
                              'map_ref_lng',
                              'map_radius_km',
                              'map_default_zoom',
                              'enable_map_bounds',
                            ])
                          }
                          saving={savingSettings}
                        >
                          <SettingsInput
                            label="Reference Latitude"
                            type="number"
                            value={settings.map_ref_lat ?? ''}
                            onChange={(v) => updateSetting('map_ref_lat', v)}
                            description="Default origin for Haversine distance calculations (e.g. 7.8731 for Sri Lanka center)"
                          />
                          <SettingsInput
                            label="Reference Longitude"
                            type="number"
                            value={settings.map_ref_lng ?? ''}
                            onChange={(v) => updateSetting('map_ref_lng', v)}
                            description="Default longitude center point (e.g. 80.7718)"
                          />
                          <SettingsInput
                            label="Discovery Radius (km)"
                            type="number"
                            value={settings.map_radius_km ?? ''}
                            onChange={(v) => updateSetting('map_radius_km', v)}
                            description="Maximum operational travel discovery radial envelope"
                          />
                          <SettingsInput
                            label="Default Map Zoom"
                            type="number"
                            value={settings.map_default_zoom ?? ''}
                            onChange={(v) => updateSetting('map_default_zoom', v)}
                            description="Interactive map initial zoom scale"
                          />
                          <SettingsToggle
                            label="Strict Territorial Bounds"
                            description="Restrict place coordinates strictly within Sri Lankan sovereign territorial envelope"
                            checked={!!settings.enable_map_bounds}
                            onChange={(v) => updateSetting('enable_map_bounds', v)}
                          />
                        </SettingsCard>
                      )}

                      {/* Security */}
                      {settingsSection === 'security' && (
                        <SettingsCard
                          title="Security & Access Governance"
                          description="Manage session revocation rules, role modification policies, and audit visibility."
                          onSave={() =>
                            handleSaveSettings([
                              'force_logout_on_role_change',
                              'allow_user_deactivation',
                              'audit_logs_admin_only',
                              'session_timeout_minutes',
                            ])
                          }
                          saving={savingSettings}
                        >
                          <SettingsToggle
                            label="Immediate Session Revocation on Role Mutation"
                            description="Force token invalidation immediately when an administrator changes a user's role"
                            checked={!!settings.force_logout_on_role_change}
                            onChange={(v) => updateSetting('force_logout_on_role_change', v)}
                          />
                          <SettingsToggle
                            label="Allow Administrative User Deactivation"
                            description="Permit administrators to temporarily suspend access without deleting user accounts"
                            checked={!!settings.allow_user_deactivation}
                            onChange={(v) => updateSetting('allow_user_deactivation', v)}
                          />
                          <SettingsToggle
                            label="Audit Logs Administrator-Only"
                            description="Lock audit trails exclusively to administrator accounts (blocks non-privileged read)"
                            checked={!!settings.audit_logs_admin_only}
                            onChange={(v) => updateSetting('audit_logs_admin_only', v)}
                          />
                          <SettingsInput
                            label="Session Idle Timeout (Minutes)"
                            type="number"
                            value={settings.session_timeout_minutes ?? ''}
                            onChange={(v) => updateSetting('session_timeout_minutes', v)}
                            description="Inactivity timeout before requiring re-authentication"
                          />
                        </SettingsCard>
                      )}

                      {/* Catalogue */}
                      {settingsSection === 'catalogue' && (
                        <SettingsCard
                          title="Catalogue & Taxonomy Policies"
                          description="Configure curation workflow rules, publishing requirements, and archive defaults."
                          onSave={() =>
                            handleSaveSettings([
                              'auto_approve_places',
                              'require_images_publish',
                              'show_archived_admin_default',
                            ])
                          }
                          saving={savingSettings}
                        >
                          <SettingsToggle
                            label="Auto-approve Contributed Destinations"
                            description="Instantly mark newly registered places as verified without editorial review"
                            checked={!!settings.auto_approve_places}
                            onChange={(v) => updateSetting('auto_approve_places', v)}
                          />
                          <SettingsToggle
                            label="Mandatory Validated Media on Publish"
                            description="Require at least one verified high-resolution photograph before a destination goes live"
                            checked={!!settings.require_images_publish}
                            onChange={(v) => updateSetting('require_images_publish', v)}
                          />
                          <SettingsToggle
                            label="Default Show Archived Places in Admin"
                            description="Display soft-deleted records in the catalogue table by default"
                            checked={!!settings.show_archived_admin_default}
                            onChange={(v) => updateSetting('show_archived_admin_default', v)}
                          />
                        </SettingsCard>
                      )}

                      {/* Media & Storage */}
                      {settingsSection === 'media' && (
                        <SettingsCard
                          title="Media & Storage Infrastructure"
                          description="Configure cloud/local storage drivers, file payload thresholds, and optimization."
                          onSave={() =>
                            handleSaveSettings([
                              'storage_driver',
                              'max_upload_size_mb',
                              'auto_generate_thumbnails',
                            ])
                          }
                          saving={savingSettings}
                        >
                          <SettingsSelect
                            label="Active Storage Driver"
                            value={settings.storage_driver || 'local'}
                            onChange={(v) => updateSetting('storage_driver', v)}
                            options={[
                              { value: 'local', label: 'Local Disk Storage (public/storage)' },
                              { value: 'cloudinary', label: 'Cloudinary CDN & Media Cloud' },
                            ]}
                            description="Target file system for destination photography and asset uploads"
                          />
                          <SettingsInput
                            label="Maximum Upload Payload (MB)"
                            type="number"
                            value={settings.max_upload_size_mb ?? ''}
                            onChange={(v) => updateSetting('max_upload_size_mb', v)}
                            description="Upper ceiling per media asset upload"
                          />
                          <SettingsToggle
                            label="Automatic WebP & Thumbnail Generation"
                            description="Pre-render responsive web thumbnails upon successful media upload"
                            checked={!!settings.auto_generate_thumbnails}
                            onChange={(v) => updateSetting('auto_generate_thumbnails', v)}
                          />
                        </SettingsCard>
                      )}

                      {/* Email */}
                      {settingsSection === 'email' && (
                        <SettingsCard
                          title="Email & Notification Engine (SMTP)"
                          description="Configure transactional email transport, server credentials, and dispatch headers."
                          onSave={() =>
                            handleSaveSettings([
                              'mail_enabled',
                              'mail_host',
                              'mail_port',
                              'mail_username',
                              'mail_password',
                              'mail_from_address',
                              'mail_from_name',
                            ])
                          }
                          saving={savingSettings}
                        >
                          <SettingsToggle
                            label="Enable Outbound SMTP Dispatch"
                            description="Enable transactional emails for verification, password resets, and notifications"
                            checked={!!settings.mail_enabled}
                            onChange={(v) => updateSetting('mail_enabled', v)}
                          />
                          <SettingsInput
                            label="SMTP Server Host"
                            value={settings.mail_host || ''}
                            onChange={(v) => updateSetting('mail_host', v)}
                            placeholder="smtp.mailtrap.io"
                          />
                          <SettingsInput
                            label="SMTP Port"
                            type="number"
                            value={settings.mail_port ?? ''}
                            onChange={(v) => updateSetting('mail_port', v)}
                            placeholder="587"
                          />
                          <SettingsInput
                            label="SMTP Username"
                            value={settings.mail_username || ''}
                            onChange={(v) => updateSetting('mail_username', v)}
                          />
                          <SettingsInput
                            label="SMTP Password"
                            type="password"
                            value={settings.mail_password || ''}
                            onChange={(v) => updateSetting('mail_password', v)}
                            placeholder="••••••••"
                          />
                          <SettingsInput
                            label="From Sender Address"
                            type="email"
                            value={settings.mail_from_address || ''}
                            onChange={(v) => updateSetting('mail_from_address', v)}
                            placeholder="noreply@visitflow.lk"
                          />
                          <SettingsInput
                            label="From Sender Display Name"
                            value={settings.mail_from_name || ''}
                            onChange={(v) => updateSetting('mail_from_name', v)}
                            placeholder="VisitFlow Sri Lanka"
                          />
                        </SettingsCard>
                      )}

                      {/* Appearance */}
                      {settingsSection === 'appearance' && (
                        <SettingsCard
                          title="Visual Identity & Theming"
                          description="Customize platform branding, logos, and accent highlights."
                          onSave={() =>
                            handleSaveSettings([
                              'logo_url',
                              'favicon_url',
                              'primary_color',
                              'accent_color',
                            ])
                          }
                          saving={savingSettings}
                        >
                          <SettingsInput
                            label="Branded Logo URL"
                            value={settings.logo_url || ''}
                            onChange={(v) => updateSetting('logo_url', v)}
                            placeholder="/logo.svg"
                          />
                          <SettingsInput
                            label="Browser Favicon URL"
                            value={settings.favicon_url || ''}
                            onChange={(v) => updateSetting('favicon_url', v)}
                            placeholder="/favicon.ico"
                          />
                          <SettingsInput
                            label="Primary Brand Color (Hex)"
                            value={settings.primary_color || ''}
                            onChange={(v) => updateSetting('primary_color', v)}
                            placeholder="#0FAF8F"
                          />
                          <SettingsInput
                            label="Accent Color (Hex)"
                            value={settings.accent_color || ''}
                            onChange={(v) => updateSetting('accent_color', v)}
                            placeholder="#E7B94C"
                          />
                        </SettingsCard>
                      )}

                      {/* System Info */}
                      {settingsSection === 'system' && (
                        <SettingsCard
                          title="System Diagnostic Telemetry"
                          description="Read-only environmental runtime parameters and database status."
                          showSave={false}
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-4 bg-sand-50 rounded-2xl border border-sand-200">
                              <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                                Laravel Framework
                              </p>
                              <p className="text-sm font-black font-mono text-charcoal-950 mt-1">
                                {systemInfo.laravel_version || 'v11.x'}
                              </p>
                            </div>
                            <div className="p-4 bg-sand-50 rounded-2xl border border-sand-200">
                              <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                                PHP Engine
                              </p>
                              <p className="text-sm font-black font-mono text-charcoal-950 mt-1">
                                {systemInfo.php_version || '8.2+'}
                              </p>
                            </div>
                            <div className="p-4 bg-sand-50 rounded-2xl border border-sand-200">
                              <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                                Runtime Environment
                              </p>
                              <p className="text-sm font-black font-mono text-charcoal-950 mt-1 capitalize">
                                {systemInfo.environment || 'local'}
                              </p>
                            </div>
                            <div className="p-4 bg-sand-50 rounded-2xl border border-sand-200">
                              <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                                Database Connection
                              </p>
                              <p className="text-sm font-black font-mono text-charcoal-950 mt-1 uppercase">
                                {systemInfo.db_connection || 'mysql / sqlite'}
                              </p>
                            </div>
                            <div className="p-4 bg-sand-50 rounded-2xl border border-sand-200 sm:col-span-2">
                              <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                                Application URL
                              </p>
                              <p className="text-sm font-black font-mono text-charcoal-950 mt-1">
                                {systemInfo.app_url || 'http://localhost'}
                              </p>
                            </div>
                          </div>
                        </SettingsCard>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {isPlaceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/40">
          <div className="bg-white rounded-lg w-full max-w-xl border border-sand-200 shadow-lg space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-3 border-b border-sand-200">
              <div>
                <h3 className="text-sm font-medium text-charcoal-950">
                  {editingPlace ? 'Edit place' : 'New place'}
                </h3>
                <p className="text-xs text-stone-500">Place details</p>
              </div>
              <button
                type="button"
                onClick={() => setIsPlaceModalOpen(false)}
                className="p-1 rounded-md text-stone-500 hover:text-charcoal-950 hover:bg-sand-50"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePlace} className="px-5 py-4 space-y-3 text-sm">
              <div>
                <label className="block text-xs text-stone-600 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={placeForm.name}
                  onChange={(e) => setPlaceForm({ ...placeForm, name: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-sand-200 rounded-md text-charcoal-950"
                />
              </div>

              <div>
                <label className="block text-xs text-stone-600 mb-1">Category</label>
                <select
                  value={placeForm.category_id}
                  onChange={(e) => setPlaceForm({ ...placeForm, category_id: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 border border-sand-200 rounded-md text-charcoal-950"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-stone-600 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={placeForm.lat}
                    onChange={(e) => setPlaceForm({ ...placeForm, lat: parseFloat(e.target.value) })}
                    className="w-full px-2.5 py-1.5 border border-sand-200 rounded-md text-charcoal-950"
                  />
                </div>
                <div>
                  <label className="block text-xs text-stone-600 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={placeForm.lng}
                    onChange={(e) => setPlaceForm({ ...placeForm, lng: parseFloat(e.target.value) })}
                    className="w-full px-2.5 py-1.5 border border-sand-200 rounded-md text-charcoal-950"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-stone-600 mb-1">Address</label>
                <input
                  type="text"
                  value={placeForm.address}
                  onChange={(e) => setPlaceForm({ ...placeForm, address: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-sand-200 rounded-md text-charcoal-950"
                />
              </div>

              <div>
                <label className="block text-xs text-stone-600 mb-1">Opening hours</label>
                <input
                  type="text"
                  value={placeForm.opening_hours}
                  onChange={(e) => setPlaceForm({ ...placeForm, opening_hours: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-sand-200 rounded-md text-charcoal-950"
                />
              </div>

              <div>
                <label className="block text-xs text-stone-600 mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={placeForm.description}
                  onChange={(e) => setPlaceForm({ ...placeForm, description: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-sand-200 rounded-md text-charcoal-950"
                />
              </div>

              <div>
                <label className="block text-xs text-stone-600 mb-1">Travel tips</label>
                <textarea
                  rows={2}
                  value={placeForm.travel_tips}
                  onChange={(e) => setPlaceForm({ ...placeForm, travel_tips: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-sand-200 rounded-md text-charcoal-950"
                />
              </div>

              {!editingPlace && (
                <div>
                  <label className="block text-xs text-stone-600 mb-1">Photo URL</label>
                  <input
                    type="url"
                    value={placeForm.photo_url}
                    onChange={(e) => setPlaceForm({ ...placeForm, photo_url: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-sand-200 rounded-md text-charcoal-950"
                  />
                </div>
              )}

              <div className="flex justify-end gap-1.5 pt-3 border-t border-sand-200">
                <button
                  type="button"
                  onClick={() => setIsPlaceModalOpen(false)}
                  className="px-2.5 py-1 text-xs text-stone-600 hover:text-charcoal-950 hover:bg-sand-50 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-2.5 py-1 text-xs bg-charcoal-950 hover:bg-charcoal-900 text-white rounded-md"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/40">
          <div className="bg-white rounded-lg w-full max-w-md border border-sand-200 shadow-lg">
            <div className="flex items-center justify-between px-5 py-3 border-b border-sand-200">
              <h3 className="text-sm font-medium text-charcoal-950">
                {editingCategory ? 'Edit category' : 'New category'}
              </h3>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-1 rounded-md text-stone-500 hover:text-charcoal-950 hover:bg-sand-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="px-5 py-4 space-y-3 text-sm">
              <div>
                <label className="block text-xs text-stone-600 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-sand-200 rounded-md text-charcoal-950"
                />
              </div>

              <div>
                <label className="block text-xs text-stone-600 mb-1">Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={categoryForm.color}
                    onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                    className="w-9 h-7 rounded-md border border-sand-200 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={categoryForm.color}
                    onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                    className="flex-1 px-2.5 py-1.5 border border-sand-200 rounded-md font-mono text-charcoal-950"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-stone-600 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-sand-200 rounded-md text-charcoal-950"
                />
              </div>

              <div className="flex justify-end gap-1.5 pt-3 border-t border-sand-200">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-2.5 py-1 text-xs text-stone-600 hover:text-charcoal-950 hover:bg-sand-50 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-2.5 py-1 text-xs bg-charcoal-950 hover:bg-charcoal-900 text-white rounded-md"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/40">
          <div className="bg-white rounded-lg w-full max-w-md border border-sand-200 shadow-lg">
            <div className="flex items-center justify-between px-5 py-3 border-b border-sand-200">
              <h3 className="text-sm font-medium text-charcoal-950">Upload photo</h3>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 rounded-md text-stone-500 hover:text-charcoal-950 hover:bg-sand-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadPhoto} className="px-5 py-4 space-y-3 text-sm">
              {uploadPlace?.media && uploadPlace.media.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-stone-600">Existing</p>
                  <div className="max-h-36 space-y-1 overflow-y-auto">
                    {uploadPlace.media.map((media) => (
                      <div key={media.id} className="flex items-center gap-2 rounded-md border border-sand-200 p-1.5">
                        <img src={media.url} alt={media.original_name || 'Photo'} className="h-9 w-12 rounded object-cover" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs text-charcoal-950">{media.original_name || 'Photo'}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => { setEditingMedia(media); setUploadFile(null); }}
                          className="p-1 rounded-md text-stone-500 hover:text-charcoal-950 hover:bg-sand-50"
                          title="Replace"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePhoto(media)}
                          className="p-1 rounded-md text-stone-500 hover:text-charcoal-950 hover:bg-sand-50"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {editingMedia && (
                <div className="flex items-center justify-between text-xs text-stone-600">
                  <span>Replacing {editingMedia.original_name || 'photo'}</span>
                  <button type="button" onClick={() => setEditingMedia(null)} className="hover:text-charcoal-950">Clear</button>
                </div>
              )}

              <div>
                <label className="block text-xs text-stone-600 mb-1">File</label>
                <input
                  type="file"
                  required
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => setUploadFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full text-xs text-stone-600 file:mr-3 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:bg-sand-100 file:text-charcoal-950"
                />
              </div>

              <div className="flex justify-end gap-1.5 pt-3 border-t border-sand-200">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-2.5 py-1 text-xs text-stone-600 hover:text-charcoal-950 hover:bg-sand-50 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!uploadFile}
                  className="px-2.5 py-1 text-xs bg-charcoal-950 hover:bg-charcoal-900 text-white rounded-md disabled:opacity-50"
                >
                  {editingMedia ? 'Replace' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
