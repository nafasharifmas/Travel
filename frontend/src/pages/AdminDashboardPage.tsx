import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';

type Tone = 'gold' | 'emerald' | 'amber' | 'stone';

const TONE_CLASSES: Record<Tone, string> = {
  gold: 'bg-gold-500/15 text-gold-700 ring-gold-500/25',
  emerald: 'bg-emerald-50 text-emerald-600 ring-emerald-200',
  amber: 'bg-amber-50 text-amber-600 ring-amber-200',
  stone: 'bg-sand-100 text-stone-600 ring-sand-200',
};

interface KpiCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  note: string;
  tone: Tone;
}

const KpiCard: React.FC<KpiCardProps> = ({ icon: Icon, label, value, note, tone }) => (
  <div className="bg-white p-4 rounded-2xl border border-sand-200 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between gap-2">
      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
        {label}
      </span>
      <span
        className={`w-8 h-8 rounded-xl flex items-center justify-center ring-1 shrink-0 ${TONE_CLASSES[tone]}`}
      >
        <Icon className="w-4 h-4" />
      </span>
    </div>
    <p className="mt-3 text-3xl font-black text-charcoal-950 tabular-nums leading-none">
      {value}
    </p>
    <p className="mt-1.5 text-[11px] text-stone-500">{note}</p>
  </div>
);

const KpiSkeleton: React.FC = () => (
  <div className="bg-white p-4 rounded-2xl border border-sand-200 animate-pulse">
    <div className="flex items-start justify-between">
      <div className="h-3 w-16 bg-sand-200 rounded" />
      <div className="w-8 h-8 rounded-xl bg-sand-100" />
    </div>
    <div className="h-8 w-14 bg-sand-100 rounded mt-4" />
    <div className="h-2.5 w-24 bg-sand-100 rounded mt-3" />
  </div>
);

const EmptyState: React.FC<{
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  hint: string;
}> = ({ icon: Icon, title, hint }) => (
  <div className="py-14 flex flex-col items-center text-center">
    <div className="w-12 h-12 rounded-2xl bg-sand-100 ring-1 ring-sand-200 flex items-center justify-center">
      <Icon className="w-5 h-5 text-stone-500" />
    </div>
    <p className="mt-3 text-sm font-bold text-charcoal-950">{title}</p>
    <p className="mt-1 text-xs text-stone-500 max-w-xs">{hint}</p>
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

export const AdminDashboardPage: React.FC = () => {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

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
    ]).finally(() => setLoading(false));
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin && activeTab === 'places') {
      loadPlaces();
    }
  }, [placeStatusFilter, placeSearch, activeTab]);

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="max-w-md mx-auto my-24 p-8 bg-white rounded-3xl border border-red-200 shadow-md text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-red-600 mx-auto" />
        <h2 className="text-xl font-bold text-charcoal-950">
          Admin Privileges Required
        </h2>
        <p className="text-xs text-stone-600">
          FR-12 Authorization guard: privileged console actions require verified administrator credentials.
        </p>
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
    <div className="min-h-screen bg-ivory-100 text-charcoal-950">
      {/* CRM Sidebar Navigation */}
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
      />

      {/* Main console surface */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <AdminTopbar
          activeTab={activeTab}
          user={user}
          onOpenMobileMenu={() => setIsMobileNavOpen(true)}
          onAddPlace={handleOpenPlaceCreate}
        />

      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Feedback banners */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2 text-xs font-bold">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                {error}
              </div>
              <button
                type="button"
                onClick={() => setError(null)}
                className="text-red-500 hover:text-red-800 p-1"
                aria-label="Dismiss error"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {message && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {message}
              </div>
              <button
                type="button"
                onClick={() => setMessage(null)}
                className="text-emerald-700 hover:text-emerald-950 p-1"
                aria-label="Dismiss message"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* KPI Counters */}
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                {loading || !metrics ? (
                  Array.from({ length: 6 }).map((_, i) => <KpiSkeleton key={i} />)
                ) : (
                  <>
                    <KpiCard
                      icon={MapPin}
                      label="Total Places"
                      value={metrics.total_places}
                      note="Catalogue records"
                      tone="stone"
                    />
                    <KpiCard
                      icon={CheckCircle2}
                      label="Active (Live)"
                      value={metrics.active_places}
                      note="Visible in discovery"
                      tone="emerald"
                    />
                    <KpiCard
                      icon={Archive}
                      label="Archived"
                      value={metrics.archived_places}
                      note="Soft-deleted records"
                      tone="amber"
                    />
                    <KpiCard
                      icon={FolderTree}
                      label="Categories"
                      value={metrics.categories}
                      note="Taxonomy terms"
                      tone="gold"
                    />
                    <KpiCard
                      icon={Users}
                      label="Registered Users"
                      value={metrics.users}
                      note="All accounts"
                      tone="stone"
                    />
                    <KpiCard
                      icon={CalendarDays}
                      label="Itineraries"
                      value={metrics.itineraries}
                      note="Trips planned"
                      tone="gold"
                    />
                  </>
                )}
              </div>

              {/* Health + Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Catalogue health & distribution */}
                <section className="lg:col-span-7 bg-white p-6 rounded-3xl border border-sand-200 shadow-sm space-y-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-stone-700">
                      Catalogue Health
                    </h3>
                    <span className="text-[11px] font-semibold text-stone-500">
                      {activeShare}% live
                    </span>
                  </div>

                  {metrics ? (
                    <>
                      <div className="space-y-2">
                        <div className="h-3 rounded-full bg-sand-100 overflow-hidden flex">
                          <div
                            className="h-full bg-emerald-500 transition-all duration-500"
                            style={{ width: `${activeShare}%` }}
                          />
                          <div
                            className="h-full bg-amber-400 transition-all duration-500"
                            style={{ width: `${100 - activeShare}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="flex items-center gap-1.5 font-semibold text-emerald-700">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            Active: {metrics.active_places}
                          </span>
                          <span className="flex items-center gap-1.5 font-semibold text-amber-700">
                            <span className="w-2 h-2 rounded-full bg-amber-400" />
                            Archived: {metrics.archived_places}
                          </span>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-sand-200 space-y-3">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                          Places per category
                        </p>
                        {topCategories.length === 0 ? (
                          <p className="text-xs text-stone-500">No categories created yet.</p>
                        ) : (
                          topCategories.map((cat) => (
                            <div key={cat.id} className="space-y-1">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="font-semibold text-stone-700 truncate">
                                  {cat.name}
                                </span>
                                <span className="font-bold text-stone-500 tabular-nums">
                                  {cat.places_count || 0}
                                </span>
                              </div>
                              <div className="h-2 rounded-full bg-sand-100 overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all duration-500"
                                  style={{
                                    width: `${((cat.places_count || 0) / maxCategoryCount) * 100}%`,
                                    backgroundColor: cat.color || '#d4af37',
                                  }}
                                />
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="py-8 flex justify-center text-stone-400">
                      <Loader2 className="w-5 h-5 animate-spin" />
                    </div>
                  )}
                </section>

                {/* Quick actions + compliance */}
                <section className="lg:col-span-5 bg-white p-6 rounded-3xl border border-sand-200 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-stone-700">
                    Quick Actions
                  </h3>
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={handleOpenPlaceCreate}
                      className="w-full py-2.5 px-4 bg-charcoal-950 hover:bg-charcoal-800 text-ivory-50 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                    >
                      <Plus className="w-4 h-4 text-gold-400" />
                      Add Verified Place (FR-08)
                    </button>
                    <button
                      type="button"
                      onClick={handleOpenCategoryCreate}
                      className="w-full py-2.5 px-4 bg-sand-100 hover:bg-sand-200 text-stone-800 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
                    >
                      <Plus className="w-4 h-4 text-stone-600" />
                      Create Taxonomy Category (FR-09)
                    </button>
                  </div>

                  <div className="p-4 bg-gold-500/[0.07] rounded-2xl border border-gold-500/25 space-y-2.5">
                    <p className="font-bold flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-gold-700">
                      <ShieldCheck className="w-4 h-4 text-gold-600" />
                      SRS Launch Baseline
                    </p>
                    {metrics ? (
                      <>
                        <p className="text-[11px] text-stone-600 leading-relaxed">
                          <strong className="text-charcoal-950">{metrics.active_places}</strong> of{' '}
                          {SRS_BASELINE} required verified places are live.
                        </p>
                        <div className="h-2 rounded-full bg-sand-200 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gold-500 transition-all duration-500"
                            style={{ width: `${compliancePct}%` }}
                          />
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-wide text-stone-500">
                          {compliancePct >= 100
                            ? 'Baseline satisfied'
                            : `${SRS_BASELINE - metrics.active_places} more needed`}
                        </p>
                      </>
                    ) : (
                      <p className="text-[11px] text-stone-500">Loading compliance data…</p>
                    )}
                  </div>
                </section>
              </div>

              {/* Recent activity timeline */}
              <section className="bg-white p-6 rounded-3xl border border-sand-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-stone-700">
                      Recent Administrative Activity
                    </h3>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      Every mutation is recorded in the append-only audit trail.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('audit')}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-charcoal-950 hover:text-gold-700 transition-colors"
                  >
                    Full audit trail
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {recentAudits.length === 0 ? (
                  <EmptyState
                    icon={History}
                    title="No activity recorded yet"
                    hint="Actions such as creating places or changing roles will appear here."
                  />
                ) : (
                  <ul className="space-y-1">
                    {recentAudits.slice(0, 8).map((a) => {
                      const Icon = actionIcon(a.action);
                      return (
                        <li
                          key={a.id}
                          className="flex items-start gap-3 p-3 rounded-xl hover:bg-sand-50 transition-colors"
                        >
                          <span className="mt-0.5 w-7 h-7 rounded-lg bg-sand-100 ring-1 ring-sand-200 flex items-center justify-center shrink-0">
                            <Icon className="w-3.5 h-3.5 text-stone-600" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <span className="font-mono text-[11px] font-bold text-charcoal-950 bg-sand-100 px-1.5 py-0.5 rounded">
                              {a.action}
                            </span>
                            <p className="text-[11px] text-stone-500 mt-1 truncate">
                              By {a.actor ? a.actor.name : 'System'} · {a.ip_address || '127.0.0.1'}
                            </p>
                          </div>
                          <span className="text-[10px] text-stone-400 whitespace-nowrap">
                            {formatTime(a.created_at)}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            </div>
          )}

          {/* TAB 2: PLACES CRUD & ARCHIVE (FR-08) */}
          {activeTab === 'places' && (
            <div className="bg-white rounded-3xl border border-sand-200 shadow-sm p-6 space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-black text-charcoal-950">
                    Places Catalogue Management
                  </h3>
                  <p className="text-xs text-stone-500">
                    Create, edit, archive (soft delete), and upload validated media for destinations.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  {/* Search */}
                  <label className="relative block">
                    <span className="sr-only">Search places</span>
                    <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="search"
                      value={placeSearch}
                      onChange={(e) => setPlaceSearch(e.target.value)}
                      placeholder="Search places…"
                      className="w-full sm:w-52 pl-8 pr-3 py-2 text-xs bg-white border border-sand-300 rounded-xl font-medium text-stone-800 placeholder:text-stone-400"
                    />
                  </label>

                  {/* Status Filter */}
                  <select
                    value={placeStatusFilter || ''}
                    onChange={(e) =>
                      setPlaceStatusFilter(
                        (e.target.value as 'active' | 'archived') || undefined
                      )
                    }
                    aria-label="Filter Places by status"
                    className="px-3 py-2 text-xs bg-white border border-sand-300 rounded-xl font-semibold text-stone-700"
                  >
                    <option value="">All Statuses</option>
                    <option value="active">Active Only</option>
                    <option value="archived">Archived (Soft-Deleted)</option>
                  </select>

                  <button
                    type="button"
                    onClick={handleOpenPlaceCreate}
                    className="px-4 py-2 bg-charcoal-950 hover:bg-charcoal-800 text-ivory-50 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    <Plus className="w-4 h-4 text-gold-400" />
                    Add Place
                  </button>
                </div>
              </div>

              {/* Places Table */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-sand-200 text-stone-500 font-bold uppercase text-[10px] tracking-wider bg-ivory-100">
                      <th className="p-3 rounded-l-xl">Destination</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Coordinates</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Media</th>
                      <th className="p-3 text-right rounded-r-xl">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sand-100">
                    {places.length === 0 && (
                      <tr>
                        <td colSpan={6}>
                          <EmptyState
                            icon={MapPin}
                            title="No places found"
                            hint="Adjust your filters, or add a verified destination to the catalogue."
                          />
                        </td>
                      </tr>
                    )}
                    {places.map((place) => (
                      <tr key={place.id} className="hover:bg-sand-50/70 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            {place.primary_photo ? (
                              <img
                                src={place.primary_photo}
                                alt={place.name}
                                className="w-10 h-10 object-cover rounded-lg border border-sand-200"
                              />
                            ) : (
                              <span className="w-10 h-10 rounded-lg bg-sand-100 border border-sand-200 flex items-center justify-center">
                                <MapPin className="w-4 h-4 text-stone-400" />
                              </span>
                            )}
                            <div>
                              <p className="font-bold text-charcoal-950">{place.name}</p>
                              <p className="text-[11px] text-stone-500 truncate max-w-xs">
                                {place.address || 'No address recorded'}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="p-3">
                          <span className="font-semibold text-stone-700">
                            {place.category ? place.category.name : '—'}
                          </span>
                        </td>

                        <td className="p-3 font-mono text-[11px] text-stone-500">
                          {place.lat.toFixed(4)}, {place.lng.toFixed(4)}
                        </td>

                        <td className="p-3">
                          {place.is_archived ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                              <Archive className="w-3 h-3" />
                              Archived
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3 h-3" />
                              Active
                            </span>
                          )}
                        </td>

                        <td className="p-3">
                          <button
                            type="button"
                            onClick={() => {
                              setUploadPlaceId(place.id);
                              setIsUploadModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg transition-colors"
                          >
                            <Upload className="w-3 h-3" />
                            Photo ({place.media_count || place.photos_count || 1})
                          </button>
                        </td>

                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenPlaceEdit(place)}
                              className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-sand-100"
                              title="Edit place"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {place.is_archived ? (
                              <button
                                type="button"
                                onClick={() => handleRestorePlace(place)}
                                className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50"
                                title="Restore archived place"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleArchivePlace(place)}
                                className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-bold text-red-600 hover:bg-red-50"
                                title="Delete place (archive)"
                                aria-label={`Delete ${place.name}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span className="hidden xl:inline">Delete</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: CATEGORIES CRUD (FR-09) */}
          {activeTab === 'categories' && (
            <div className="bg-white rounded-3xl border border-sand-200 shadow-sm p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-black text-charcoal-950">
                    Category Taxonomy Management
                  </h3>
                  <p className="text-xs text-stone-500">
                    Discovery taxonomy for places. Deletion is blocked if places reference the category.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleOpenCategoryCreate}
                  className="px-4 py-2 bg-charcoal-950 hover:bg-charcoal-800 text-ivory-50 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                >
                  <Plus className="w-4 h-4 text-gold-400" />
                  Add Category
                </button>
              </div>

              {categories.length === 0 ? (
                <EmptyState
                  icon={FolderTree}
                  title="No categories yet"
                  hint="Create taxonomy terms so travellers can filter destinations by interest."
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map((cat) => (
                    <div
                      key={cat.id}
                      className="p-4 rounded-2xl border border-sand-200 bg-sand-50/50 hover:border-sand-300 hover:shadow-sm transition-all space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="w-3.5 h-3.5 rounded-full shrink-0 ring-2 ring-white"
                            style={{ backgroundColor: cat.color || '#f59e0b' }}
                          />
                          <h4 className="font-bold text-sm text-charcoal-950 truncate">
                            {cat.name}
                          </h4>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCategory(cat);
                              setCategoryForm({
                                name: cat.name,
                                description: cat.description || '',
                                icon: cat.icon || 'MapPin',
                                color: cat.color || '#f59e0b',
                              });
                              setIsCategoryModalOpen(true);
                            }}
                            className="p-1 text-stone-500 hover:text-stone-800"
                            title="Edit category"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat)}
                            className="p-1 text-red-500 hover:text-red-700"
                            title="Delete category"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-stone-600 line-clamp-2">
                        {cat.description || 'No description provided.'}
                      </p>

                      <div className="flex items-center justify-between text-[11px] text-stone-500 pt-2 border-t border-sand-200">
                        <span className="font-mono truncate">slug: {cat.slug}</span>
                        <span className="font-bold text-stone-700 whitespace-nowrap ml-2">
                          {cat.places_count || 0} Places
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: USERS MANAGEMENT (FR-10) */}
          {activeTab === 'users' && (
            <div className="bg-white rounded-3xl border border-sand-200 shadow-sm p-6 space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
                <div>
                  <h3 className="text-lg font-black text-charcoal-950">
                    User Accounts & Role Permissions
                  </h3>
                  <p className="text-xs text-stone-500">
                    Inspect profiles, change roles, and deactivate accounts. All actions write to the audit trail.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 text-[11px] font-bold">
                  <span className="px-3 py-1.5 rounded-full bg-sand-100 text-stone-700">
                    {usersList.length} Total
                  </span>
                  <span className="px-3 py-1.5 rounded-full bg-gold-500/15 text-gold-700">
                    {adminCount} Admins
                  </span>
                  <span className="px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800">
                    {activeUserCount} Active
                  </span>
                  <span className="px-3 py-1.5 rounded-full bg-red-100 text-red-700">
                    {usersList.length - activeUserCount} Deactivated
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-sand-200 text-stone-500 font-bold uppercase text-[10px] tracking-wider bg-ivory-100">
                      <th className="p-3 rounded-l-xl">User Profile</th>
                      <th className="p-3">Email Address</th>
                      <th className="p-3">Assigned Role</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Itineraries</th>
                      <th className="p-3 text-right rounded-r-xl">Administrative Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sand-100">
                    {usersList.length === 0 && (
                      <tr>
                        <td colSpan={6}>
                          <EmptyState
                            icon={Users}
                            title="No user accounts found"
                            hint="Registered users will appear here once they create an account."
                          />
                        </td>
                      </tr>
                    )}
                    {usersList.map((u) => (
                      <tr key={u.id} className="hover:bg-sand-50/70 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sand-200 to-sand-300 flex items-center justify-center font-bold text-stone-700 shrink-0">
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-bold text-charcoal-950">{u.name}</span>
                          </div>
                        </td>

                        <td className="p-3 font-mono text-[11px] text-stone-600">
                          {u.email}
                        </td>

                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                              u.role === 'admin'
                                ? 'bg-gold-500/15 text-gold-700'
                                : 'bg-stone-100 text-stone-700'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>

                        <td className="p-3">
                          {u.is_active ? (
                            <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                              <CheckCircle2 className="w-3 h-3" />
                              Active
                            </span>
                          ) : (
                            <span className="text-red-600 font-bold flex items-center gap-1 text-[11px]">
                              <AlertTriangle className="w-3 h-3" />
                              Deactivated
                            </span>
                          )}
                        </td>

                        <td className="p-3 font-semibold text-stone-700">
                          {u.itineraries_count || 0} trips
                        </td>

                        <td className="p-3 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => handleToggleUserRole(u)}
                            className="px-2 py-1 bg-sand-100 hover:bg-sand-200 text-stone-800 rounded-lg font-bold text-[11px] transition-colors"
                          >
                            Switch to {u.role === 'admin' ? 'User' : 'Admin'}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleUserStatus(u)}
                            className={`px-2 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                              u.is_active
                                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            }`}
                          >
                            {u.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: ITINERARIES ADMINISTRATION */}
          {activeTab === 'itineraries' && (
            <div className="bg-white rounded-3xl border border-sand-200 shadow-sm p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-black text-charcoal-950">Itinerary Administration</h3>
                  <p className="text-xs text-stone-500">Monitor saved itineraries across registered users.</p>
                </div>
                <span className="self-start sm:self-auto px-3 py-1.5 rounded-full bg-sand-100 text-stone-700 text-[11px] font-bold">
                  {adminItineraries.length} Entries
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-sand-200 text-stone-500 font-bold uppercase text-[10px] tracking-wider bg-ivory-100">
                      <th className="p-3 rounded-l-xl">Itinerary</th>
                      <th className="p-3">Owner</th>
                      <th className="p-3">Items</th>
                      <th className="p-3">Start Date</th>
                      <th className="p-3 rounded-r-xl">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sand-100">
                    {adminItineraries.length === 0 && (
                      <tr>
                        <td colSpan={5}>
                          <EmptyState icon={CalendarDays} title="No itineraries found" hint="Registered users' saved itineraries will appear here." />
                        </td>
                      </tr>
                    )}
                    {adminItineraries.map((it: any) => (
                      <tr key={it.id} className="hover:bg-sand-50/70">
                        <td className="p-3">
                          <p className="font-bold text-charcoal-950">{it.title}</p>
                          {it.notes && <p className="text-[11px] text-stone-500 truncate max-w-xs">{it.notes}</p>}
                        </td>
                        <td className="p-3">
                          {it.user ? (
                            <div>
                              <p className="font-semibold text-stone-700">{it.user.name}</p>
                              <p className="text-[11px] text-stone-500 font-mono">{it.user.email}</p>
                            </div>
                          ) : (
                            <span className="text-stone-400">—</span>
                          )}
                        </td>
                        <td className="p-3 font-semibold text-stone-700">{it.items_count}</td>
                        <td className="p-3 text-stone-600">{it.start_date || '—'}</td>
                        <td className="p-3 text-stone-500">{it.created_at ? new Date(it.created_at).toLocaleString() : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: DATA QUALITY */}
          {activeTab === 'data-quality' && (
            <div className="bg-white rounded-3xl border border-sand-200 shadow-sm p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-black text-charcoal-950">Data Quality Center</h3>
                  <p className="text-xs text-stone-500">Real validation checks on catalogue data.</p>
                </div>
                <button type="button" onClick={loadDataQuality} className="px-3 py-1.5 rounded-lg bg-sand-100 hover:bg-sand-200 text-stone-700 text-xs font-bold">Recheck</button>
              </div>
              {dataQuality?.issues?.length === 0 ? (
                <EmptyState icon={CheckCircle2} title="No issues detected" hint="Catalogue data passes current validation checks." />
              ) : (
                <ul className="space-y-2">
                  {(dataQuality?.issues || []).map((issue: any, idx: number) => (
                    <li key={idx} className="flex items-center justify-between p-3 rounded-xl border border-sand-200">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className={`w-4 h-4 ${issue.severity === 'high' ? 'text-red-600' : issue.severity === 'medium' ? 'text-amber-600' : 'text-stone-500'}`} />
                        <div>
                          <p className="text-sm font-bold text-charcoal-950">{issue.message}</p>
                          <p className="text-[11px] text-stone-500">Severity: {issue.severity}</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-sand-100 text-stone-700 text-[11px] font-bold">{issue.count}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* TAB 7: SYSTEM HEALTH */}
          {activeTab === 'system-health' && (
            <div className="bg-white rounded-3xl border border-sand-200 shadow-sm p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-black text-charcoal-950">System Health</h3>
                  <p className="text-xs text-stone-500">Lightweight operational checks.</p>
                </div>
                <button type="button" onClick={loadSystemHealth} className="px-3 py-1.5 rounded-lg bg-sand-100 hover:bg-sand-200 text-stone-700 text-xs font-bold">Refresh</button>
              </div>
              {systemHealth && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(systemHealth.checks || {}).map(([key, val]: [string, any]) => (
                    <div key={key} className="p-4 rounded-2xl border border-sand-200 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-charcoal-950 capitalize">{key}</p>
                        <p className="text-[11px] text-stone-500">Status</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${val.status === 'ok' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{val.status}</span>
                    </div>
                  ))}
                </div>
              )}
              {systemHealth?.timestamp && <p className="text-[11px] text-stone-500">Last checked: {new Date(systemHealth.timestamp).toLocaleString()}</p>}
            </div>
          )}

          {/* TAB 8: AUDIT LOG (Page 6 & 7) */}
          {activeTab === 'audit' && (
            <div className="bg-white rounded-3xl border border-sand-200 shadow-sm p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-black text-charcoal-950">
                    Audit Trail (Traceable History)
                  </h3>
                  <p className="text-xs text-stone-500">
                    Append-only log of every administrative mutation on places, categories, roles, and media.
                  </p>
                </div>
                <span className="self-start sm:self-auto px-3 py-1.5 rounded-full bg-sand-100 text-stone-700 text-[11px] font-bold">
                  {allAuditLogs.length} Entries
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[860px] text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-sand-200 text-stone-500 font-bold uppercase text-[10px] tracking-wider bg-ivory-100">
                      <th className="p-3 rounded-l-xl">Timestamp</th>
                      <th className="p-3">Acting Account</th>
                      <th className="p-3">Action</th>
                      <th className="p-3">Target Entity</th>
                      <th className="p-3">IP Address</th>
                      <th className="p-3 rounded-r-xl">Payload Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sand-100 font-mono text-[11px]">
                    {allAuditLogs.length === 0 && (
                      <tr>
                        <td colSpan={6} className="font-sans">
                          <EmptyState
                            icon={History}
                            title="No audit entries yet"
                            hint="Administrative changes will be recorded here automatically."
                          />
                        </td>
                      </tr>
                    )}
                    {allAuditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-sand-50/70">
                        <td className="p-3 text-stone-600 whitespace-nowrap">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td className="p-3 font-semibold text-stone-900 font-sans">
                          {log.actor ? log.actor.name : 'System Baseline'}
                        </td>
                        <td className="p-3">
                          <span className="font-bold text-gold-700 bg-gold-500/10 px-1.5 py-0.5 rounded">
                            {log.action}
                          </span>
                        </td>
                        <td className="p-3 text-stone-500">
                          {log.subject_type ? `${log.subject_type.split('\\').pop()} #${log.subject_id}` : '—'}
                        </td>
                        <td className="p-3 text-stone-500">
                          {log.ip_address || '127.0.0.1'}
                        </td>
                        <td className="p-3 text-stone-600 font-sans max-w-xs truncate">
                          {log.payload ? JSON.stringify(log.payload) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Place Create/Edit Modal */}
      {isPlaceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-xl p-6 border border-sand-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-sand-200 pb-3">
              <div>
                <h3 className="font-bold text-base text-charcoal-950">
                  {editingPlace ? `Edit Place: ${editingPlace.name}` : 'Add Verified Place'}
                </h3>
                <p className="text-[11px] text-stone-500">FR-08 catalogue management</p>
              </div>
              <button
                type="button"
                onClick={() => setIsPlaceModalOpen(false)}
                className="text-stone-400 hover:text-stone-800 p-1"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlace} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Place Name</label>
                <input
                  type="text"
                  required
                  value={placeForm.name}
                  onChange={(e) => setPlaceForm({ ...placeForm, name: e.target.value })}
                  placeholder="e.g. Polonnaruwa Royal Quadrangle"
                  className="w-full px-3 py-2 bg-sand-50 border border-sand-300 rounded-xl text-stone-900"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Category</label>
                <select
                  value={placeForm.category_id}
                  onChange={(e) => setPlaceForm({ ...placeForm, category_id: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-sand-50 border border-sand-300 rounded-xl text-stone-900 font-semibold"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={placeForm.lat}
                    onChange={(e) => setPlaceForm({ ...placeForm, lat: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 bg-sand-50 border border-sand-300 rounded-xl text-stone-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={placeForm.lng}
                    onChange={(e) => setPlaceForm({ ...placeForm, lng: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 bg-sand-50 border border-sand-300 rounded-xl text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Address / Access Route</label>
                <input
                  type="text"
                  value={placeForm.address}
                  onChange={(e) => setPlaceForm({ ...placeForm, address: e.target.value })}
                  className="w-full px-3 py-2 bg-sand-50 border border-sand-300 rounded-xl text-stone-900"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Opening Hours</label>
                <input
                  type="text"
                  value={placeForm.opening_hours}
                  onChange={(e) => setPlaceForm({ ...placeForm, opening_hours: e.target.value })}
                  className="w-full px-3 py-2 bg-sand-50 border border-sand-300 rounded-xl text-stone-900"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={placeForm.description}
                  onChange={(e) => setPlaceForm({ ...placeForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-sand-50 border border-sand-300 rounded-xl text-stone-900"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Travel Tips</label>
                <textarea
                  rows={3}
                  value={placeForm.travel_tips}
                  onChange={(e) => setPlaceForm({ ...placeForm, travel_tips: e.target.value })}
                  placeholder="Practical advice for visitors, access, clothing, or timing"
                  className="w-full px-3 py-2 bg-sand-50 border border-sand-300 rounded-xl text-stone-900"
                />
              </div>

              {!editingPlace && (
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Initial Photograph URL</label>
                  <input
                    type="url"
                    value={placeForm.photo_url}
                    onChange={(e) => setPlaceForm({ ...placeForm, photo_url: e.target.value })}
                    className="w-full px-3 py-2 bg-sand-50 border border-sand-300 rounded-xl text-stone-900"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-sand-200">
                <button
                  type="button"
                  onClick={() => setIsPlaceModalOpen(false)}
                  className="px-4 py-2 bg-sand-100 hover:bg-sand-200 text-stone-700 rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gold-500 hover:bg-gold-400 text-charcoal-950 rounded-xl font-bold shadow-sm transition-colors"
                >
                  Save Place
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 border border-sand-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-sand-200 pb-3">
              <div>
                <h3 className="font-bold text-base text-charcoal-950">
                  {editingCategory ? 'Edit Category' : 'Create Category'}
                </h3>
                <p className="text-[11px] text-stone-500">FR-09 taxonomy management</p>
              </div>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="text-stone-400 hover:text-stone-800 p-1"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  placeholder="e.g. Wildlife & Safaris"
                  className="w-full px-3 py-2 bg-sand-50 border border-sand-300 rounded-xl text-stone-900"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Color Token (Hex)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={categoryForm.color}
                    onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                    className="w-10 h-8 rounded-lg border border-sand-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={categoryForm.color}
                    onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                    className="flex-1 px-3 py-2 bg-sand-50 border border-sand-300 rounded-xl font-mono text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-sand-50 border border-sand-300 rounded-xl text-stone-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-sand-200">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 bg-sand-100 hover:bg-sand-200 text-stone-700 rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gold-500 hover:bg-gold-400 text-charcoal-950 rounded-xl font-bold shadow-sm transition-colors"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Media Upload Modal (FR-11) */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 border border-sand-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-sand-200 pb-3">
              <div>
                <h3 className="font-bold text-base text-charcoal-950">
                  Upload Place Photograph
                </h3>
                <p className="text-[11px] text-stone-500">FR-11 validated media upload</p>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="text-stone-400 hover:text-stone-800 p-1"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadPhoto} className="space-y-4 text-xs">
              {uploadPlace?.media && uploadPlace.media.length > 0 && (
                <div className="space-y-2">
                  <p className="font-bold text-stone-700">Existing photographs</p>
                  <div className="max-h-44 space-y-2 overflow-y-auto pr-1">
                    {uploadPlace.media.map((media) => (
                      <div key={media.id} className="flex items-center gap-3 rounded-xl border border-sand-200 p-2">
                        <img src={media.url} alt={media.original_name || 'Place photograph'} className="h-12 w-16 rounded-lg object-cover" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[11px] font-semibold text-charcoal-950">{media.original_name || 'Photograph'}</p>
                          {media.is_primary && <span className="text-[10px] font-bold text-amber-700">Primary photo</span>}
                        </div>
                        <button
                          type="button"
                          onClick={() => { setEditingMedia(media); setUploadFile(null); }}
                          className="rounded-lg p-1.5 text-stone-500 hover:bg-sand-100 hover:text-charcoal-950"
                          title="Replace photo"
                          aria-label={`Replace ${media.original_name || 'photograph'}`}
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePhoto(media)}
                          className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700"
                          title="Delete photo"
                          aria-label={`Delete ${media.original_name || 'photograph'}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {editingMedia && (
                <div className="flex items-center justify-between rounded-xl bg-ocean-50 px-3 py-2 text-[11px] text-ocean-700">
                  <span>Replacing {editingMedia.original_name || 'selected photograph'}</span>
                  <button type="button" onClick={() => setEditingMedia(null)} className="font-bold hover:underline">Clear</button>
                </div>
              )}

              <div className="p-3 bg-gold-500/[0.07] rounded-xl border border-gold-500/25 text-stone-700 text-[11px] leading-relaxed">
                Server-side validated: Accepted types: JPEG, PNG, WEBP. Max size: 5 MB. Stored outside the public code tree.
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Select Image File</label>
                <input
                  type="file"
                  required
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => setUploadFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full text-xs text-stone-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-gold-500 file:text-charcoal-950 hover:file:bg-gold-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-sand-200">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 bg-sand-100 hover:bg-sand-200 text-stone-700 rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!uploadFile}
                  className="px-5 py-2 bg-gold-500 hover:bg-gold-400 text-charcoal-950 rounded-xl font-bold shadow-sm disabled:opacity-50 transition-colors"
                >
                  {editingMedia ? 'Replace & Validate' : 'Upload & Validate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
