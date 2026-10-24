import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ItineraryProvider } from './context/ItineraryContext';
import { ThemeProvider } from './context/ThemeContext';
import { SiteHeader } from './components/navigation/SiteHeader';
import { SiteFooter } from './components/landing/SiteFooter';
import { ItineraryDrawer } from './components/itinerary/ItineraryDrawer';

const LandingPage = lazy(() => import('./pages/LandingPage').then(({ LandingPage }) => ({ default: LandingPage })));
const PublicDiscoveryPage = lazy(() => import('./pages/PublicDiscoveryPage').then(({ PublicDiscoveryPage }) => ({ default: PublicDiscoveryPage })));
const PlaceDetailPage = lazy(() => import('./pages/PlaceDetailPage').then(({ PlaceDetailPage }) => ({ default: PlaceDetailPage })));
const UserItinerariesPage = lazy(() => import('./pages/UserItinerariesPage').then(({ UserItinerariesPage }) => ({ default: UserItinerariesPage })));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage').then(({ AdminDashboardPage }) => ({ default: AdminDashboardPage })));

/**
 * The admin console renders as a full-screen CRM shell (own sidebar + topbar),
 * so the marketing header/footer are hidden on those routes.
 */
const AppShell: React.FC = () => {
  const location = useLocation();
  const isConsoleRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col bg-ivory-100 selection:bg-ocean-500/20 selection:text-navy-900 font-sans">
      {!isConsoleRoute && <SiteHeader />}
      <main className="flex-1">
        <Suspense fallback={<div className="flex min-h-[50vh] items-center justify-center text-sm text-navy-700">Loading VisitFlow…</div>}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/explore" element={<PublicDiscoveryPage />} />
            <Route path="/places/:idOrSlug" element={<PlaceDetailPage />} />
            <Route path="/itineraries" element={<UserItinerariesPage />} />
            <Route path="/admin/settings" element={<AdminDashboardPage defaultTab="settings" />} />
            <Route path="/admin/*" element={<AdminDashboardPage />} />
            <Route path="/admin" element={<AdminDashboardPage />} />
          </Routes>
        </Suspense>
      </main>
      {!isConsoleRoute && <ItineraryDrawer />}
      {!isConsoleRoute && <SiteFooter />}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ItineraryProvider>
            <AppShell />
          </ItineraryProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
