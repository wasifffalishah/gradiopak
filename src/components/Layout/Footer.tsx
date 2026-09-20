import React from 'react';

interface FooterProps {
  onOpenModal: (id: 'contact' | 'privacy' | 'terms') => void;
  onOpenCookies: () => void;
  onStartTour: () => void;
  onOpenTerminal: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenModal,
  onOpenCookies,
  onStartTour,
  onOpenTerminal
}) => {
  return (
    <footer className="w-full bg-gradient-to-b from-transparent via-[#08090c]/60 to-[#08090c] relative z-10">
      <div className="max-w-[1680px] mx-auto px-5 sm:px-8 lg:px-12 py-8 lg:py-10 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Left Column: Creator Identity with Signature Headline Typography */}
        <div className="flex flex-col gap-1 items-start text-left">
          <span className="text-xs font-medium text-mute tracking-wide">
            Made for Designers by
          </span>
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-ink font-sans">
            <span className="name-shimmer-flow font-semibold">Wasiff Ali Shah</span>
          </h3>
        </div>

        {/* Right Column: Brand Name, Links & Inspo */}
        <div className="flex flex-col gap-2.5 md:items-end text-left md:text-right">
          {/* Brand Mark */}
          <div
            className="flex items-center gap-2 md:justify-end group cursor-pointer select-none"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            title="Gradiopak"
          >
            <div className="w-5 h-5 rounded overflow-hidden border border-line-strong shadow-sm shrink-0 transition-transform duration-500 ease-out group-hover:scale-110 group-hover:rotate-180">
              <img src="/og-share.png" alt="Gradiopak" className="w-full h-full object-cover" />
            </div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-ink pl-0.5">
              Gradiopak
            </span>
          </div>

          {/* Legal and Feature Navigation */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-mute font-mono">
            <button
              type="button"
              onClick={() => onOpenModal('contact')}
              className="hover:text-ink transition-colors"
            >
              Contact
            </button>
            <span className="text-stone select-none">•</span>
            <button
              type="button"
              onClick={() => onOpenModal('privacy')}
              className="hover:text-ink transition-colors"
            >
              Privacy
            </button>
            <span className="text-stone select-none">•</span>
            <button
              type="button"
              onClick={() => onOpenModal('terms')}
              className="hover:text-ink transition-colors"
            >
              Terms
            </button>
            <span className="text-stone select-none">•</span>
            <button
              type="button"
              onClick={onOpenCookies}
              className="hover:text-ink transition-colors"
            >
              Cookies
            </button>
            <span className="text-stone select-none hidden sm:inline">•</span>
            <button
              type="button"
              onClick={onStartTour}
              className="hover:text-ink transition-colors hidden sm:inline"
            >
              Tour
            </button>
            <span className="text-stone select-none">•</span>
            <button
              type="button"
              onClick={onOpenTerminal}
              className="hover:text-ink transition-colors"
            >
              Terminal
            </button>
          </div>

          {/* Creative Inspiration */}
          <p className="text-[11px] text-stone tracking-wide">
            Inspiration —{' '}
            <a
              href="https://gurade.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ash hover:text-body underline underline-offset-2 transition-colors"
            >
              Gurade
            </a>{' '}
            ·{' '}
            <a
              href="https://colir.space/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ash hover:text-body underline underline-offset-2 transition-colors"
            >
              Colir
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};
