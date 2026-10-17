import React from 'react';
import { HeroSection } from '../components/landing/HeroSection';
import { TravelSearch } from '../components/landing/TravelSearch';
import { DestinationSection } from '../components/landing/DestinationSection';
import { ExperienceSection } from '../components/landing/ExperienceSection';
import { EditorialFeature } from '../components/landing/EditorialFeature';
import { HowItWorks } from '../components/landing/HowItWorks';
import { JournalSection } from '../components/landing/JournalSection';
import { FinalCallToAction } from '../components/landing/FinalCallToAction';

export const LandingPage: React.FC = () => {
  const handleExploreClick = () => {
    const destEl = document.getElementById('destinations');
    if (destEl) {
      destEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleDiscoverClick = () => {
    const searchEl = document.getElementById('travel-search');
    if (searchEl) {
      searchEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-ivory-100 text-charcoal-950 font-sans selection:bg-gold-500/25 selection:text-charcoal-950">
      {/* SECTION 2: Cinematic Hero */}
      <HeroSection
        onExploreClick={handleExploreClick}
        onDiscoverClick={handleDiscoverClick}
      />

      {/* SECTION 3: Interactive Travel Search (Floating Panel) */}
      <TravelSearch />

      {/* SECTION 4: Curated Destinations */}
      <DestinationSection />

      {/* SECTION 5: Signature Experiences */}
      <ExperienceSection />

      {/* SECTION 6: Immersive Editorial Feature */}
      <EditorialFeature />

      {/* SECTION 7: How It Works */}
      <HowItWorks />

      {/* SECTION 8: Featured Journal */}
      <JournalSection />

      {/* SECTION 9: Final Call to Action */}
      <FinalCallToAction />
    </div>
  );
};

export default LandingPage;

