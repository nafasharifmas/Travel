import React, { useEffect, useRef, useState } from 'react';

interface RevealOnScrollProps {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
}

export const RevealOnScroll: React.FC<RevealOnScrollProps> = ({
  children,
  className = '',
  delayMs = 0,
  direction = 'up',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsVisible(true);
      return;
    }

    // Browsers can jump to an anchored section before the page finishes
    // mounting. In that case, don't leave the section hidden behind the
    // entrance animation while the user is already looking directly at it.
    if (window.location.hash) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    if (elementRef.current) {
      const element = elementRef.current;
      observer.observe(element);

      // Hash navigation can position the page before the observer receives
      // its first callback. Reveal elements already in the viewport so direct
      // links such as /#experiences never leave the section visually empty.
      const revealIfInViewport = () => {
        const rect = element.getBoundingClientRect();
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
        const inViewport = rect.top < viewportHeight * 0.92 && rect.bottom > 0;

        if (inViewport) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      };

      requestAnimationFrame(revealIfInViewport);
    }

    return () => observer.disconnect();
  }, []);

  const getTransformStyle = () => {
    if (isVisible) return 'translate3d(0, 0, 0)';
    switch (direction) {
      case 'up':
        return 'translate3d(0, 32px, 0)';
      case 'down':
        return 'translate3d(0, -32px, 0)';
      case 'left':
        return 'translate3d(16px, 0, 0)';
      case 'right':
        return 'translate3d(-16px, 0, 0)';
      case 'none':
      default:
        return 'none';
    }
  };

  return (
    <div
      ref={elementRef}
      style={{
        transform: getTransformStyle(),
        opacity: isVisible ? 1 : 0,
        transition: `opacity 750ms cubic-bezier(0.16, 1, 0.3, 1) ${delayMs}ms, transform 750ms cubic-bezier(0.16, 1, 0.3, 1) ${delayMs}ms`,
        willChange: 'transform, opacity',
      }}
      className={className}
    >
      {children}
    </div>
  );
};

