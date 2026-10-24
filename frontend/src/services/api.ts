import {
  User,
  Category,
  Place,
  Itinerary,
  AuditLogItem,
  AdminMetrics,
} from '../types';

// The local Laravel API runs on port 8000 by default. VITE_API_URL remains the
// deployment hook for environments where the API is hosted elsewhere.
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

class ApiService {
  private getToken(): string | null {
    return localStorage.getItem('visitflow_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const responseText = await response.text();
    let responseData: any = null;
    try {
      responseData = responseText ? JSON.parse(responseText) : null;
    } catch {
      responseData = null;
    }

    if (!response.ok) {
      const errorData = responseData || {};
      const message =
        errorData.message ||
        (errorData.errors
          ? Object.values(errorData.errors).flat().join(' ')
          : responseText.trim().startsWith('<')
            ? `The server returned an HTML error page (HTTP ${response.status}). Check the Laravel log for the underlying exception.`
            : `HTTP error ${response.status}`);
      throw new Error(message);
    }

    if (!responseData) {
      throw new Error('The server returned an empty response.');
    }

    return responseData as T;
  }

  // --- Auth ---
  async register(data: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
  }): Promise<{ message: string; token: string; user: User }> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(credentials: {
    email: string;
    password: string;
  }): Promise<{ message: string; token: string; user: User }> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async logout(): Promise<{ message: string }> {
    return this.request('/auth/logout', { method: 'POST' });
  }

  async getUser(): Promise<{ user: User }> {
    return this.request('/auth/user');
  }

  // --- Places & Discovery ---
  async getPlaces(params?: {
    search?: string;
    category?: string;
    sort?: string;
  }): Promise<{
    count: number;
    places: Place[];
    map_config: { attribution: string; tile_layer: string };
  }> {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.category) searchParams.append('category', params.category);
    if (params?.sort) searchParams.append('sort', params.sort);

    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.request(`/places${query}`);
  }

  async getPlaceDetail(
    idOrSlug: string | number
  ): Promise<{
    place: Place;
    map_config: {
      lat: number;
      lng: number;
      zoom: number;
      attribution: string;
      tile_layer: string;
    };
  }> {
    return this.request(`/places/${idOrSlug}`);
  }

  async getCategories(): Promise<{ categories: Category[] }> {
    return this.request('/categories');
  }

  // --- User Itineraries ---
  async getItineraries(): Promise<{ itineraries: Itinerary[] }> {
    return this.request('/itineraries');
  }

  async getItineraryDetail(id: number): Promise<{ itinerary: Itinerary }> {
    return this.request(`/itineraries/${id}`);
  }

  async createItinerary(data: {
    title: string;
    start_date?: string;
    notes?: string;
    items?: Array<{
      place_id: number;
      day_no?: number;
      sequence_order?: number;
      visit_time?: string;
      notes?: string;
    }>;
  }): Promise<{ message: string; itinerary: Itinerary }> {
    return this.request('/itineraries', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateItinerary(
    id: number,
    data: {
      title: string;
      start_date?: string;
      notes?: string;
      is_public?: boolean;
      items?: Array<{
        place_id: number;
        day_no?: number;
        sequence_order?: number;
        visit_time?: string;
        notes?: string;
      }>;
    }
  ): Promise<{ message: string; itinerary: Itinerary }> {
    return this.request(`/itineraries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteItinerary(id: number): Promise<{ message: string }> {
    return this.request(`/itineraries/${id}`, { method: 'DELETE' });
  }

  async syncGuestItinerary(data: {
    title?: string;
    start_date?: string;
    notes?: string;
    items: Array<{
      place_id: number;
      sequence_order: number;
      visit_time?: string;
      notes?: string;
    }>;
  }): Promise<{ message: string; itinerary: Itinerary }> {
    return this.request('/itineraries/sync-guest', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // --- Admin Console Endpoints ---
  async getAdminDashboard(): Promise<{
    metrics: AdminMetrics;
    recent_audits: AuditLogItem[];
  }> {
    return this.request('/admin/dashboard');
  }

  async getAdminAnalytics(): Promise<any> {
    return this.request('/admin/analytics');
  }

  async getAdminDataQuality(): Promise<any> {
    return this.request('/admin/data-quality');
  }

  async getAdminSystemHealth(): Promise<any> {
    return this.request('/admin/system-health');
  }

  async getAdminItineraries(): Promise<{ itineraries: any[] }> {
    return this.request('/admin/itineraries');
  }

  async getAdminSettings(): Promise<any> {
    return this.request('/admin/settings');
  }

  async updateAdminSettings(data: any): Promise<{ message: string }> {
    return this.request('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getAdminPlaces(params?: {
    status?: 'active' | 'archived' | 'inactive';
    search?: string;
    category_id?: number;
  }): Promise<{ places: Place[] }> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.search) searchParams.append('search', params.search);
    if (params?.category_id)
      searchParams.append('category_id', params.category_id.toString());

    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.request(`/admin/places${query}`);
  }

  async createAdminPlace(data: {
    name: string;
    category_id: number;
    description: string;
    travel_tips?: string;
    address?: string;
    lat: number;
    lng: number;
    opening_hours?: string;
    contact_info?: string;
    photo_url?: string;
    is_active?: boolean;
  }): Promise<{ message: string; place: Place }> {
    return this.request('/admin/places', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAdminPlace(
    id: number,
    data: {
      name: string;
      category_id: number;
      description: string;
      travel_tips?: string;
      address?: string;
      lat: number;
      lng: number;
      opening_hours?: string;
      contact_info?: string;
      is_active?: boolean;
    }
  ): Promise<{ message: string; place: Place }> {
    return this.request(`/admin/places/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async archiveAdminPlace(id: number): Promise<{ message: string }> {
    return this.request(`/admin/places/${id}`, { method: 'DELETE' });
  }

  async restoreAdminPlace(id: number): Promise<{ message: string }> {
    return this.request(`/admin/places/${id}/restore`, { method: 'POST' });
  }

  async getAdminCategories(): Promise<{ categories: Category[] }> {
    return this.request('/admin/categories');
  }

  async createAdminCategory(data: {
    name: string;
    description?: string;
    icon?: string;
    color?: string;
    is_active?: boolean;
  }): Promise<{ message: string; category: Category }> {
    return this.request('/admin/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAdminCategory(
    id: number,
    data: {
      name: string;
      description?: string;
      icon?: string;
      color?: string;
      is_active?: boolean;
    }
  ): Promise<{ message: string; category: Category }> {
    return this.request(`/admin/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAdminCategory(id: number): Promise<{ message: string }> {
    return this.request(`/admin/categories/${id}`, { method: 'DELETE' });
  }

  async getAdminUsers(): Promise<{ users: User[] }> {
    return this.request('/admin/users');
  }

  async updateUserRole(
    id: number,
    role: 'admin' | 'user'
  ): Promise<{ message: string; user: User }> {
    return this.request(`/admin/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  }

  async updateUserStatus(
    id: number,
    isActive: boolean
  ): Promise<{ message: string; user: User }> {
    return this.request(`/admin/users/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ is_active: isActive }),
    });
  }

  async uploadPlacePhoto(
    placeId: number,
    file: File,
    isPrimary: boolean = false
  ): Promise<{ message: string; media: any }> {
    const formData = new FormData();
    formData.append('photo', file);
    if (isPrimary) formData.append('is_primary', '1');

    return this.request(`/admin/places/${placeId}/media`, {
      method: 'POST',
      body: formData,
    });
  }

  async deletePlaceMedia(mediaId: number): Promise<{ message: string }> {
    return this.request(`/admin/media/${mediaId}`, { method: 'DELETE' });
  }

  async getAuditLogs(): Promise<{
    data: AuditLogItem[];
    current_page: number;
    last_page: number;
  }> {
    return this.request('/admin/audit-logs');
  }
}

export const api = new ApiService();
