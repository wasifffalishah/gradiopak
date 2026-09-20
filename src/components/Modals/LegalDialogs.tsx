import React from 'react';
import { X, Mail, ExternalLink } from 'lucide-react';

interface LegalDialogsProps {
  activeModal: 'contact' | 'privacy' | 'terms' | null;
  onClose: () => void;
}

export const LegalDialogs: React.FC<LegalDialogsProps> = ({ activeModal, onClose }) => {
  if (!activeModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl max-h-[88vh] flex flex-col bg-[#0e1016] border border-line rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 shrink-0">
          <div>
            <h3 className="text-base font-bold text-ink">
              {activeModal === 'contact'
                ? 'Get in Touch'
                : activeModal === 'privacy'
                ? 'Privacy Policy'
                : 'Terms of Use'}
            </h3>
            <span className="text-[11px] text-mute font-mono">
              {activeModal === 'contact'
                ? 'Replies fast — usually within a day'
                : 'Last updated · September 2026'}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-mute hover:text-ink hover:bg-surface-3 rounded-lg transition-colors"
            title="Close dialog (Esc)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content Container with Smooth Native Scroll */}
        <div className="flex-1 overflow-y-auto p-6 text-xs text-body leading-relaxed space-y-5 scroll-smooth overscroll-contain">
          {/* ============ CONTACT MODAL ============ */}
          {activeModal === 'contact' && (
            <div className="flex flex-col gap-3">
              <p className="text-mute pb-1">
                Have questions, feature suggestions, or creative feedback? I reply fast — usually within a day.
              </p>

              <a
                href="mailto:wasiffalishah@gmail.com"
                className="flex items-center justify-between p-3.5 rounded-xl bg-surface-2 hover:bg-surface-3 border border-line hover:border-line-strong transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent-blue/15 text-accent-blue">
                    <Mail size={16} />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-ink">Email</span>
                    <span className="text-[11px] text-mute">wasiffalishah@gmail.com</span>
                  </div>
                </div>
                <ExternalLink size={14} className="text-mute group-hover:text-ink transition-colors" />
              </a>

              <a
                href="https://twitter.com/wasiffalishah"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3.5 rounded-xl bg-surface-2 hover:bg-surface-3 border border-line hover:border-line-strong transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent-blue/15 text-accent-blue">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-ink">Twitter / X</span>
                    <span className="text-[11px] text-mute">@wasiffalishah</span>
                  </div>
                </div>
                <ExternalLink size={14} className="text-mute group-hover:text-ink transition-colors" />
              </a>

              <a
                href="https://www.instagram.com/wasiff_125"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3.5 rounded-xl bg-surface-2 hover:bg-surface-3 border border-line hover:border-line-strong transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent-yellow/15 text-accent-yellow">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <circle cx="12" cy="12" r="4.2" />
                      <circle cx="17.6" cy="6.4" r="1.1" fill="currentColor" stroke="none" />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-ink">Instagram</span>
                    <span className="text-[11px] text-mute">@wasiff_125</span>
                  </div>
                </div>
                <ExternalLink size={14} className="text-mute group-hover:text-ink transition-colors" />
              </a>
            </div>
          )}

          {/* ============ PRIVACY POLICY MODAL ============ */}
          {activeModal === 'privacy' && (
            <div className="space-y-4">
              <section className="space-y-1.5">
                <h4 className="font-bold text-ink text-sm">1. The Short Version</h4>
                <p>
                  Gradiopak is a client-side design application. It requires no user account, sets no tracking pixels, runs no analytics SDKs, and employs no advertising cookies. Your creative designs, uploaded photos, and vector layers are never uploaded to any remote server. Everything runs and remains strictly on your device.
                </p>
              </section>

              <section className="space-y-1.5">
                <h4 className="font-bold text-ink text-sm">2. What We Store on Your Device</h4>
                <p>To provide its functionality, the application utilizes your browser’s standard local storage for three specific operational items:</p>
                <ul className="list-disc pl-5 space-y-1 text-mute">
                  <li><strong className="text-ink">Design Autosave</strong> (<code className="text-accent-blue font-mono">gradiopak.v2</code>) — preserves your active composition, colors, ratios, and layers so you can safely refresh or return later.</li>
                  <li><strong className="text-ink">Preset & Palette Cache</strong> — caches rendered shader thumbnails and loaded palette configurations for maximum rendering performance.</li>
                  <li><strong className="text-ink">Cookie Preference</strong> (<code className="text-accent-blue font-mono">gradiopak.cookieConsent</code>) — records whether you clicked Accept or Decline so the transparent banner does not reappear.</li>
                </ul>
                <p>All stored data resides locally in your browser cache. Nothing is transmitted to external endpoints.</p>
              </section>

              <section className="space-y-1.5">
                <h4 className="font-bold text-ink text-sm">3. What We Never Collect</h4>
                <ul className="list-disc pl-5 space-y-1 text-mute">
                  <li>No personal identifiers, email addresses, phone numbers, or IP logs.</li>
                  <li>No device fingerprinting, canvas data harvesting, or behavioral telemetry.</li>
                  <li>No marketing, affiliate, or third-party behavioral advertising cookies.</li>
                  <li>No cloud uploads or inspection of your exported artwork, images, or typography.</li>
                </ul>
              </section>

              <section className="space-y-1.5">
                <h4 className="font-bold text-ink text-sm">4. External Network Requests</h4>
                <ul className="list-disc pl-5 space-y-1 text-mute">
                  <li><strong className="text-ink">Google Fonts</strong> — When you select a web font from the font library, the typeface files are fetched dynamically from Google Fonts. Google’s standard privacy policy governs that request. Gradiopak transmits no custom metadata or layer text.</li>
                  <li><strong className="text-ink">Offline Palette Libraries</strong> — The entire uiGradients library (381 presets) is bundled directly into Gradiopak and functions 100% offline without external network calls.</li>
                  <li><strong className="text-ink">Favicon & Brand Assets</strong> — Favicon and logo assets are hosted statically. No personal telemetry is collected.</li>
                </ul>
                <p>All rendering, high-res canvas exports, MP4/WebM video encoding, and CSS generation occur entirely on your local GPU and CPU.</p>
              </section>

              <section className="space-y-1.5">
                <h4 className="font-bold text-ink text-sm">5. Share Links</h4>
                <p>
                  When you generate a share link, your composition parameters (colors, ratios, curves) are compressed directly into the URL hash fragment (<code className="text-accent-blue font-mono">#d=...</code>). No database record is created. Please be aware that URL fragments in links you send publicly can be decoded by anyone who receives the link.
                </p>
              </section>

              <section className="space-y-1.5">
                <h4 className="font-bold text-ink text-sm">6. Cookies & Transparency</h4>
                <p>
                  Gradiopak sets no tracking or advertising cookies. The cookie notice on initial launch exists solely for transparency regarding local storage usage. Choosing Accept or Decline stores your preference and gates no studio feature whatsoever.
                </p>
              </section>

              <section className="space-y-1.5">
                <h4 className="font-bold text-ink text-sm">7. Data Retention & Erasure</h4>
                <p>
                  Autosaved data persists on your machine until you click <strong className="text-ink">Reset</strong>, clear site data via browser settings, or use private/incognito browsing. Because we store zero data on our servers, there is no remote data to request deletion of. For inquiries, email <a href="mailto:wasiffalishah@gmail.com" className="text-accent-blue hover:underline">wasiffalishah@gmail.com</a>.
                </p>
              </section>

              <section className="space-y-1.5">
                <h4 className="font-bold text-ink text-sm">8. Children's Privacy (COPPA)</h4>
                <p>
                  Gradiopak is a general creative design tool and does not knowingly collect personal data from anyone, including children under 13.
                </p>
              </section>

              <section className="space-y-1.5">
                <h4 className="font-bold text-ink text-sm">9. Policy Updates</h4>
                <p>
                  Any updates to this policy will be reflected with a revised "Last updated" date at the top of this dialog.
                </p>
              </section>
            </div>
          )}

          {/* ============ TERMS OF USE MODAL ============ */}
          {activeModal === 'terms' && (
            <div className="space-y-4">
              <section className="space-y-1.5">
                <h4 className="font-bold text-ink text-sm">1. Agreement to Terms</h4>
                <p>
                  By accessing or using Gradiopak, you agree to be bound by these Terms of Use. If you are using Gradiopak on behalf of an organization, company, or client, you confirm that you have full legal authority to bind that entity to these Terms.
                </p>
              </section>

              <section className="space-y-1.5">
                <h4 className="font-bold text-ink text-sm">2. Permitted Use & Commercial Rights</h4>
                <p>
                  Gradiopak is provided completely free of charge, with no registration required, for <strong className="text-ink">both personal and commercial purposes</strong>. You are fully authorized to use Gradiopak to design graphics, UI backgrounds, social media visuals, marketing assets, software themes, video animations, and print materials. You may not resell the tool itself or redistribute it as a competing gradient studio service.
                </p>
              </section>

              <section className="space-y-1.5">
                <h4 className="font-bold text-ink text-sm">3. Full Ownership of Your Output Artwork</h4>
                <p>
                  You own 100% of the creative artwork, PNG, JPEG, WebP, MP4/WebM videos, and CSS code that you produce and export with Gradiopak. Gradiopak and its creator claim zero copyright, ownership, or royalty rights over your compositions. Attribution is entirely optional and never legally required.
                </p>
              </section>

              <section className="space-y-1.5">
                <h4 className="font-bold text-ink text-sm">4. Intellectual Property of the Application</h4>
                <p>
                  Gradiopak, its proprietary shader engine, UI design, vector library arrangements, and brand trademarks belong to the developer. You may freely use the studio and inspect client-side techniques; however, republication of the application source in its entirety as a competing commercial product is strictly prohibited without explicit written permission.
                </p>
              </section>

              <section className="space-y-1.5">
                <h4 className="font-bold text-ink text-sm">5. Third-Party Fonts & Palettes</h4>
                <p>
                  Typography from Google Fonts and palette libraries from uiGradients are licensed under their respective open-source licenses (such as the SIL Open Font License and MIT License). You remain responsible for ensuring compliance with third-party licenses when integrating specific fonts into commercial brand marks.
                </p>
              </section>

              <section className="space-y-1.5">
                <h4 className="font-bold text-ink text-sm">6. Acceptable Use Restrictions</h4>
                <p>When utilizing Gradiopak, you agree not to:</p>
                <ul className="list-disc pl-5 space-y-1 text-mute">
                  <li>Use the tool to generate defamatory, unlawful, harassing, or infringing media.</li>
                  <li>Attempt to disrupt, exploit, or inject malicious payloads into share link URL fragments.</li>
                  <li>Falsely claim sole copyright over standard built-in mathematical color presets for the purpose of restricting others from using them.</li>
                </ul>
              </section>

              <section className="space-y-1.5">
                <h4 className="font-bold text-ink text-sm">7. Disclaimer of Warranties ("AS IS")</h4>
                <p>
                  Gradiopak is provided strictly on an <strong className="text-ink">"AS IS"</strong> and <strong className="text-ink">"AS AVAILABLE"</strong> basis, without warranties of any kind, whether express, implied, statutory, or otherwise. We make no warranty that the tool will meet every requirement, operate without interruption, or render identically across all hardware GPUs and browser implementations.
                </p>
              </section>

              <section className="space-y-1.5">
                <h4 className="font-bold text-ink text-sm">8. Limitation of Liability</h4>
                <p>
                  To the fullest extent permitted under applicable law, Gradiopak, its developer (Wasiff Ali Shah), and affiliates shall not be liable for any direct, indirect, incidental, consequential, or punitive damages, including loss of creative work, loss of revenue, or hardware incompatibility resulting from the use or inability to use the application.
                </p>
              </section>

              <section className="space-y-1.5">
                <h4 className="font-bold text-ink text-sm">9. Indemnification</h4>
                <p>
                  You agree to defend, indemnify, and hold harmless Gradiopak and its creator against any third-party claims, liabilities, damages, or legal expenses arising out of your misuse of the tool or the content of your exported compositions.
                </p>
              </section>

              <section className="space-y-1.5">
                <h4 className="font-bold text-ink text-sm">10. Contact & Inquiries</h4>
                <p>
                  For questions regarding these Terms, contact <a href="mailto:wasiffalishah@gmail.com" className="text-accent-blue hover:underline">wasiffalishah@gmail.com</a>.
                </p>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
