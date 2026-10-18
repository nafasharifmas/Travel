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
    <div className="min-h-screen bg-ivory-100 text-navy-600 font-sans">
      {/* Cinematic hero with floating destination search */}
      <HeroSection
        onExploreClick={handleExploreClick}
        onDiscoverClick={handleDiscoverClick}
      />

      <TravelSearch />

      <DestinationSection />

      <ExperienceSection />

      <EditorialFeature />

      <HowItWorks />

      <JournalSection />

      <FinalCallToAction />
    </div>
  );
};

export default LandingPage;

