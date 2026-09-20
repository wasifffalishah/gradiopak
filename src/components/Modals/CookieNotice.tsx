import React, { useState, useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';

interface CookieNoticeProps {
  forceShow?: boolean;
  onOpenPrivacy: () => void;
  onClose?: () => void;
}

const COOKIE_KEY = 'gradiopak.cookieConsent';

export const CookieNotice: React.FC<CookieNoticeProps> = ({
  forceShow = false,
  onOpenPrivacy,
  onClose
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (forceShow) {
      setVisible(true);
      return;
    }
    try {
      const choice = localStorage.getItem(COOKIE_KEY);
      if (!choice) {
        const timer = setTimeout(() => setVisible(true), 1800);
        return () => clearTimeout(timer);
      }
    } catch (e) {}
  }, [forceShow]);

  const handleChoice = (c: 'accepted' | 'declined') => {
    try {
      localStorage.setItem(COOKIE_KEY, JSON.stringify({ choice: c, time: new Date().toISOString() }));
    } catch (e) {}
    setVisible(false);
    if (onClose) onClose();
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:max-w-md z-40 p-4 rounded-2xl bg-panel/95 backdrop-blur-xl border border-line shadow-2xl animate-fade-in flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-accent-green/15 text-accent-green shrink-0 mt-0.5">
          <ShieldCheck size={18} />
        </div>
        <div className="flex flex-col gap-1">
          <h4 className="text-xs font-bold text-ink">Your privacy, kept simple</h4>
          <p className="text-[11px] leading-relaxed text-mute">
            Gradiopak runs 100% in your browser. We only use local device storage for design autosave and palette caching. No tracking cookies, no analytics, no external servers.{' '}
            <button
              type="button"
              onClick={onOpenPrivacy}
              className="text-ink underline hover:text-accent-blue"
            >
              Read privacy policy
            </button>
          </p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-1 border-t border-line/60">
        <button
          type="button"
          onClick={() => handleChoice('declined')}
          className="px-3 py-1 text-xs text-mute hover:text-ink transition-colors"
        >
          Decline
        </button>
        <button
          type="button"
          onClick={() => handleChoice('accepted')}
          className="px-4 py-1 text-xs font-semibold bg-ink text-canvas rounded-lg hover:opacity-90 transition-opacity"
        >
          Accept
        </button>
      </div>
    </div>
  );
};
