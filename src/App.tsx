import React, { useState, useEffect } from 'react';
import { StudioProvider, useStudio } from './state/useStudioStore';
import { AmbientBackdrop } from './components/Layout/AmbientBackdrop';
import { Sidebar } from './components/Sidebar/Sidebar';
import { CanvasStage } from './components/Stage/CanvasStage';
import { Footer } from './components/Layout/Footer';
import { TourModal } from './components/Modals/TourModal';
import { CookieNotice } from './components/Modals/CookieNotice';
import { LegalDialogs } from './components/Modals/LegalDialogs';
import { TerminalLoader } from './components/Loader/TerminalLoader';
import { updateDynamicFavicon } from './services/faviconService';
import { prewarmPresets } from './services/presetPrewarmer';

const StudioContent: React.FC = () => {
  const { config, updateConfig, shufflePalette, isFullscreen, setIsFullscreen } = useStudio();
  const [tourOpen, setTourOpen] = useState(false);
  const [legalModal, setLegalModal] = useState<'contact' | 'privacy' | 'terms' | null>(null);
  const [showCookies, setShowCookies] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [terminalOpen, setTerminalOpen] = useState(false);

  // Background pre-warming of preset thumbnails for silky-smooth instant tab switching
  useEffect(() => {
    prewarmPresets();
  }, []);

  // Dynamic live gradient favicon with Wasiff logo
  useEffect(() => {
    updateDynamicFavicon(config);
  }, [config]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when user is typing in input or textarea
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        updateConfig(prev => ({ ...prev, animate: !prev.animate }));
      } else if (e.code === 'KeyR' && !e.ctrlKey && !e.metaKey) {
        shufflePalette();
      } else if (e.key === 'Escape') {
        if (isFullscreen) setIsFullscreen(false);
        if (tourOpen) setTourOpen(false);
        if (legalModal) setLegalModal(null);
        if (terminalOpen) setTerminalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [updateConfig, shufflePalette, isFullscreen, setIsFullscreen, tourOpen, legalModal, terminalOpen]);

  return (
    <div className="relative min-h-screen flex flex-col bg-canvas text-ink font-sans selection:bg-accent-red selection:text-white">
      {/* Dynamic Ambient Background */}
      <AmbientBackdrop />

      {/* Main Studio Workspace Layout:
          - Full screen height for Sidebar & Canvas on desktop (sticky top-4, h-[calc(100vh-32px)])
          - Maximum breathing room for UI controls without being constrained by the footer
          - Footer is positioned naturally down below, accessible via page scroll
          - Mobile / Tablet (< lg): Canvas on top (order-1), Sidebar below (order-2)
      */}
      <div className="flex-1 flex flex-col lg:flex-row p-2 sm:p-4 lg:p-5 gap-3 lg:gap-5 max-w-[1720px] w-full mx-auto items-start">
        {/* Canvas Stage (Order 1 on Mobile, Order 2 on Desktop) */}
        <div className="order-1 lg:order-2 flex-1 min-w-0 w-full lg:sticky lg:top-4 lg:h-[calc(100vh-40px)] flex flex-col">
          <CanvasStage />
        </div>

        {/* Sidebar Controls (Order 2 on Mobile, Order 1 on Desktop) — Exact 356px width matching original Gradiopak */}
        <div className="order-2 lg:order-1 w-full lg:w-[356px] shrink-0 lg:sticky lg:top-4 lg:h-[calc(100vh-40px)] flex flex-col">
          <Sidebar onStartTour={() => setTourOpen(true)} />
        </div>
      </div>

      {/* Footer down below, smoothly fading into the ambient background on scroll */}
      <div className="mt-12 w-full">
        <Footer
          onOpenModal={setLegalModal}
          onOpenCookies={() => setShowCookies(true)}
          onStartTour={() => setTourOpen(true)}
          onOpenTerminal={() => setTerminalOpen(true)}
        />
      </div>

      {/* Interactive Guided Tour & Dialogs */}
      <TourModal isOpen={tourOpen} onClose={() => setTourOpen(false)} />
      <LegalDialogs activeModal={legalModal} onClose={() => setLegalModal(null)} />
      <CookieNotice
        forceShow={showCookies}
        onOpenPrivacy={() => setLegalModal('privacy')}
        onClose={() => setShowCookies(false)}
      />

      {/* Terminal-Style Boot Loader (Boot sequence on launch, or visual preview when clicked from footer) */}
      {(isLoading || terminalOpen) && (
        <TerminalLoader
          mode={terminalOpen ? 'preview' : 'boot'}
          onComplete={() => {
            setIsLoading(false);
            setTerminalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <StudioProvider>
      <StudioContent />
    </StudioProvider>
  );
};

export default App;
