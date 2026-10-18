import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ItineraryProvider } from './context/ItineraryContext';
import { ThemeProvider } from './context/ThemeContext';
import { SiteHeader } from './components/navigation/SiteHeader';
import { SiteFooter } from './components/landing/SiteFooter';
import { ItineraryDrawer } from './components/itinerary/ItineraryDrawer';
import { LandingPage } from './pages/LandingPage';
import { PublicDiscoveryPage } from './pages/PublicDiscoveryPage';
import { PlaceDetailPage } from './pages/PlaceDetailPage';
import { UserItinerariesPage } from './pages/UserItinerariesPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

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
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/explore" element={<PublicDiscoveryPage />} />
          <Route path="/places/:idOrSlug" element={<PlaceDetailPage />} />
          <Route path="/itineraries" element={<UserItinerariesPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
        </Routes>
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
