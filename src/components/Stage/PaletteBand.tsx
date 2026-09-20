import React from 'react';
import { useStudio } from '../../state/useStudioStore';
import { LUMINOUS } from '../../constants/catalog';

export const PaletteBand: React.FC = () => {
  const { config, setStatus } = useStudio();

  const isCurve = !!config.curve.on;
  const isLuminous = !!LUMINOUS[config.type];
  const isOrganic = !isLuminous && ['Flow', 'Mesh', 'Freeform'].includes(config.type);

  const getNoteText = () => {
    if (isCurve) {
      return 'Curve mode — the X/Y curves warp the design in place; flat curves leave it unchanged.';
    }
    if (isLuminous) {
      return 'Luminous: 1st=core, 2nd=inner, 3rd=outer edge, 4th=bg.';
    }
    if (isOrganic) {
      return 'Band shows spot colors left-to-right.';
    }
    return 'Band shows CSS color stops.';
  };

  const handleCopyHex = (hex: string) => {
    navigator.clipboard.writeText(hex).then(() => {
      setStatus(`Copied ${hex} to clipboard.`);
    });
  };

  const gradientBg = `linear-gradient(90deg, ${config.colors.join(', ')})`;

  return (
    <div className="flex flex-col gap-1.5 w-full px-1">
      {/* Smooth Continuous Gradient Band with segment click-to-copy */}
      <div
        className="relative h-2.5 w-full rounded-full shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)] overflow-hidden cursor-pointer"
        style={{ background: gradientBg }}
        title="Click any color to copy hex"
      >
        <div className="absolute inset-0 flex">
          {config.colors.map((hex, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleCopyHex(hex)}
              className="flex-1 h-full cursor-pointer hover:bg-white/15 transition-colors"
              title={`Click to copy ${hex}`}
            />
          ))}
        </div>
      </div>

      {/* Band contextual note */}
      <p className="text-[11px] text-[#61646d] font-normal leading-relaxed m-0">
        {getNoteText()}
      </p>
    </div>
  );
};
