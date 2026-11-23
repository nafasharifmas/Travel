import React, { createContext, useContext, useState, useEffect } from 'react';
import { Place, Itinerary, ItineraryStop } from '../types';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

interface ItineraryContextType {
  stops: ItineraryStop[];
  visibleStops: ItineraryStop[];
  currentTrip: Itinerary | null;
  addPlaceToPlan: (place: Place, notes?: string, visitTime?: string) => void;
  removeStop: (placeId: number) => void;
  updateStop: (placeId: number, notes?: string, visitTime?: string) => void;
  reorderStop: (index: number, direction: 'up' | 'down') => void;
  clearPlan: () => void;
  isPlaceInPlan: (placeId: number) => boolean;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  isSavePromptOpen: boolean;
  setIsSavePromptOpen: (open: boolean) => void;
  syncPlanToAccount: (title?: string, startDate?: string, notes?: string) => Promise<void>;
  isSyncing: boolean;
}

const STORAGE_KEY = 'visitflow_guest_itinerary';

const ItineraryContext = createContext<ItineraryContextType | undefined>(undefined);

export const ItineraryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [stops, setStops] = useState<ItineraryStop[]>(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSavePromptOpen, setIsSavePromptOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [currentTrip, setCurrentTrip] = useState<{ userId: number; trip: Itinerary } | null>(null);
  const activeTrip = currentTrip && user && currentTrip.userId === user.id ? currentTrip.trip : null;

  // Show the newest saved route whenever there is no in-progress draft.
  useEffect(() => {
    let cancelled = false;
    if (authLoading || !isAuthenticated || !user) return;

    (async () => {
      try {
        const { itineraries } = await api.getItineraries();
        if (cancelled || itineraries.length === 0) return;
        const { itinerary } = await api.getItineraryDetail(itineraries[0].id);
        if (!cancelled) setCurrentTrip({ userId: user.id, trip: itinerary });
      } catch {
        // A failed fetch just leaves the draft as the only visible plan.
      }
    })();

    return () => { cancelled = true; };
  }, [authLoading, isAuthenticated, user]);

  const visibleStops = stops.length > 0 ? stops : (activeTrip?.items ?? []);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stops));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stops));
    } catch (e) {
      console.warn('Storage quota error:', e);
    }
  }, [stops]);

  const addPlaceToPlan = (place: Place, notes?: string, visitTime?: string) => {
    if (stops.some((s) => s.place_id === place.id)) {
      setIsDrawerOpen(true);
      return;
    }

    const newStop: ItineraryStop = {
      place_id: place.id,
      day_no: 1,
      sequence_order: stops.length + 1,
      visit_time: visitTime || (stops.length === 0 ? '08:30' : undefined),
      notes: notes || '',
      place,
    };

    setStops((prev) => [...prev, newStop]);
    setIsDrawerOpen(true);
  };

  const removeStop = (placeId: number) => {
    setStops((prev) => {
      const filtered = prev.filter((s) => s.place_id !== placeId);
      return filtered.map((s, idx) => ({
        ...s,
        sequence_order: idx + 1,
      }));
    });
  };

  const updateStop = (placeId: number, notes?: string, visitTime?: string) => {
    setStops((prev) =>
      prev.map((s) =>
        s.place_id === placeId
          ? {
              ...s,
              notes: notes !== undefined ? notes : s.notes,
              visit_time: visitTime !== undefined ? visitTime : s.visit_time,
            }
          : s
      )
    );
  };

  const reorderStop = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= stops.length) return;

    setStops((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;

      return copy.map((s, idx) => ({
        ...s,
        sequence_order: idx + 1,
      }));
    });
  };

  const clearPlan = () => {
    setStops([]);
    sessionStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_KEY);
  };

  const isPlaceInPlan = (placeId: number) => {
    return stops.some((s) => s.place_id === placeId);
  };

  const syncPlanToAccount = async (
    title?: string,
    startDate?: string,
    notes?: string
  ) => {
    if (stops.length === 0) return;
    setIsSyncing(true);
    try {
      const { itinerary } = await api.syncGuestItinerary({
        title: title || 'Curated One-Day Route',
        start_date: startDate || new Date().toISOString().split('T')[0],
        notes: notes || 'Draft day trip saved from planner',
        items: stops.map((s, idx) => ({
          place_id: s.place_id,
          sequence_order: idx + 1,
          visit_time: s.visit_time,
          notes: s.notes,
        })),
      });
      setCurrentTrip({ userId: user?.id ?? 0, trip: itinerary });
      clearPlan();
      setIsDrawerOpen(false);
      setIsSavePromptOpen(false);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <ItineraryContext.Provider
      value={{
        stops,
        visibleStops,
        currentTrip: activeTrip,
        addPlaceToPlan,
        removeStop,
        updateStop,
        reorderStop,
        clearPlan,
        isPlaceInPlan,
        isDrawerOpen,
        setIsDrawerOpen,
        isSavePromptOpen,
        setIsSavePromptOpen,
        syncPlanToAccount,
        isSyncing,
      }}
    >
      {children}
    </ItineraryContext.Provider>
  );
};

export const useItinerary = () => {
  const context = useContext(ItineraryContext);
  if (!context) {
    throw new Error('useItinerary must be used within an ItineraryProvider');
  }
  return context;
};

