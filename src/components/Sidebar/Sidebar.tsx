import React from 'react';
import { useStudio, TabType } from '../../state/useStudioStore';
import { DesignTab } from './Tabs/DesignTab';
import { PresetsTab } from './Tabs/PresetsTab';
import { LayersTab } from './Tabs/LayersTab';
import { ExportTab } from './Tabs/ExportTab';
import { Sparkles } from 'lucide-react';

interface SidebarProps {
  onStartTour: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onStartTour }) => {
  const { activeTab, setActiveTab, resetStudio } = useStudio();

  const tabs: { id: TabType; label: string }[] = [
    { id: 'design', label: 'Design' },
    { id: 'presets', label: 'Presets' },
    { id: 'text', label: 'Layers' },
    { id: 'export', label: 'Export' }
  ];

  return (
    <aside className="w-full flex flex-col bg-panel/95 backdrop-blur-2xl border border-line rounded-2xl shrink-0 z-10 shadow-2xl lg:h-full lg:overflow-hidden">
      {/* Top Header - Sticky on mobile so tabs remain accessible when scrolling */}
      <div className="flex flex-col p-3.5 pb-2.5 gap-3 shrink-0 sticky top-0 z-20 bg-panel/95 backdrop-blur-xl border-b border-line/40 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 group cursor-pointer select-none" onClick={resetStudio} title="Reset Gradiopak">
            {/* Gradiopak Logo Badge using og-share.png */}
            <div className="relative w-7 h-7 rounded-lg overflow-hidden border border-line-strong shadow-md transition-transform duration-500 ease-out group-hover:scale-110 group-hover:rotate-180 shrink-0">
              <img
                src="/og-share.png"
                alt="Gradiopak Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-ink pl-0.5">
              Gradiopak
            </span>
          </div>

          <button
            id="tourStartBtn"
            type="button"
            onClick={onStartTour}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-surface-2 hover:bg-surface-3 text-ink border border-line hover:border-line-strong transition-all shadow-sm"
            title="Take an interactive tour of Gradiopak"
          >
            <Sparkles size={13} className="text-accent-yellow animate-pulse" />
            <span>Tour</span>
          </button>
        </div>

        {/* Segmented Pill Tab Navigation (Original Gradiopak Signature Style) */}
        <div className="grid grid-cols-4 bg-[#0a0b0e] border border-line rounded-full p-1 gap-1" role="tablist" aria-label="Studio views">
          {tabs.map(tab => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setActiveTab(tab.id)}
                className={`py-1.5 px-2 text-xs rounded-full transition-all duration-150 text-center font-medium truncate ${
                  isSelected
                    ? 'bg-[#f4f5f7] text-[#0a0b0e] font-semibold shadow-sm'
                    : 'text-mute hover:text-ink hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Panes (Scrollable on desktop within sticky sidebar; natural smooth flow on mobile) */}
      <div className="palette-pane flex-1 min-h-0 lg:overflow-y-auto lg:overscroll-contain no-scrollbar">
        {activeTab === 'design' && <DesignTab />}
        {activeTab === 'presets' && <PresetsTab />}
        {activeTab === 'text' && <LayersTab />}
        {activeTab === 'export' && <ExportTab />}
      </div>
    </aside>
  );
};
