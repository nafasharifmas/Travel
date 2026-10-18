import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

/**
 * Animated light/dark switch for the top navigation.
 *
 * The two icons share one grid cell, so the outgoing glyph spins down to 0
 * scale while the incoming one spins up — a compact sun/moon morph instead of
 * a hard swap. The global `prefers-reduced-motion` rule collapses it to an
 * instant change for visitors who ask for less motion.
 */
interface ThemeToggleButtonProps {
  /** Extra classes for placement (the button itself is always 44px round). */
  className?: string;
}

export const ThemeToggleButton: React.FC<ThemeToggleButtonProps> = ({ className = '' }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`theme-toggle ${className}`}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
    >
      <Sun className="theme-toggle__icon theme-toggle__icon--sun" aria-hidden="true" />
      <Moon className="theme-toggle__icon theme-toggle__icon--moon" aria-hidden="true" />
    </button>
  );
};

export default ThemeToggleButton;
