export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
  is_admin: boolean;
  is_active: boolean;
  created_at?: string;
  itineraries_count?: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  is_active: boolean;
  places_count?: number;
}

export interface MediaItem {
  id: number;
  url: string;
  original_name?: string;
  is_primary: boolean;
}

export interface Place {
  id: number;
  name: string;
  slug: string;
  description: string;
  travel_tips?: string | null;
  address?: string;
  lat: number;
  lng: number;
  opening_hours?: string;
  contact_info?: string;
  is_active?: boolean;
  is_archived?: boolean;
  category: Category | null;
  primary_photo?: string;
  photos_count?: number;
  media_count?: number;
  media?: MediaItem[];
  nearby_suggestions?: Array<{
    id: number;
    name: string;
    slug: string;
    primary_photo?: string;
    category?: string;
  }>;
}

export interface ItineraryStop {
  id?: number;
  place_id: number;
  day_no: number;
  sequence_order: number;
  visit_time?: string;
  notes?: string;
  place?: Place;
}

export interface Itinerary {
  id: number;
  title: string;
  start_date?: string;
  notes?: string;
  is_public: boolean;
  user_id: number;
  created_at: string;
  items_count?: number;
  items?: ItineraryStop[];
  places_summary?: Array<{
    place_id: number;
    name: string;
    is_archived: boolean;
  }>;
}

export interface AuditLogItem {
  id: number;
  actor_id?: number;
  actor?: {
    id: number;
    name: string;
    email: string;
  };
  action: string;
  subject_type?: string;
  subject_id?: number;
  payload?: any;
  ip_address?: string;
  created_at: string;
}

export interface AdminMetrics {
  total_places: number;
  active_places: number;
  archived_places: number;
  categories: number;
  users: number;
  itineraries: number;
}
