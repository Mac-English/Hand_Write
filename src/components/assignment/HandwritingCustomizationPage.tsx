import React, { useState } from 'react';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Check,
  Smartphone,
} from 'lucide-react';
import {
  Assignment,
  HandwritingProfile,
  StyleSettings,
  PaperStyle,
  PenType,
} from '../../types';
import { DEFAULT_STYLE_SETTINGS } from '../../services/storageService';
import { REALISTIC_PENS, PenPreset } from '../../engine/penSimulation';
import { HandwritingEngine } from '../../engine/handwritingEngine';
import { NotebookPagePreview } from './NotebookPagePreview';

interface HandwritingCustomizationPageProps {
  assignment: Assignment;
  profiles: HandwritingProfile[];
  onUpdateStyles: (styles: StyleSettings) => void;
  onNext: () => void;
  onBack: () => void;
}

export const HandwritingCustomizationPage: React.FC<HandwritingCustomizationPageProps> = ({
  assignment,
  profiles,
  onUpdateStyles,
  onNext,
  onBack,
}) => {
  const [styles, setStyles] = useState<StyleSettings>(
    assignment.styleSettings || DEFAULT_STYLE_SETTINGS
  );
  const [currentPageIdx, setCurrentPageIdx] = useState(0);
  const [previewScale, setPreviewScale] = useState(0.55);

  const currentPen: PenType = styles.penType || 'ballpoint';

  const handleSelectPen = (penId: PenType) => {
    const preset = REALISTIC_PENS[penId];
    setStyles((prev) => ({
      ...prev,
      penType: penId,
      strokeWidth: preset.defaultStrokeWidth,
      inkColor: preset.defaultInkColor,
    }));
  };

  const handleSelectPaper = (paperId: PaperStyle) => {
    setStyles((prev) => ({
      ...prev,
      paperStyle: paperId,
    }));
  };

  const handleSelectColor = (hex: string) => {
    setStyles((prev) => ({
      ...prev,
      inkColor: hex,
    }));
  };

  const handleSaveAndNext = () => {
    onUpdateStyles(styles);
    onNext();
  };

  // Content for preview (uses Newton's Laws if not specified)
  const previewContent =
    assignment.draftContent ||
    `Topic: Newton's Laws of Motion\n\n1. First Law:\n   An object at rest stays at rest, and an object in motion stays in motion with constant velocity unless acted upon by a net external force.\n\n2. Second Law:\n   Force is equal to the rate of change of momentum.\n   F = ma\n\n3. Third Law:\n   For every action, there is an equal and opposite reaction.`;

  const renderedPages = HandwritingEngine.paginate(previewContent, styles, assignment.language);
  const activePage = renderedPages[currentPageIdx] || renderedPages[0];

  const paperStylesList: { id: PaperStyle; name: string }[] = [
    { id: 'ruled', name: 'Ruled Notebook' },
    { id: 'legal', name: 'Yellow Pad' },
    { id: 'grid', name: 'Graph Grid' },
    { id: 'cream', name: 'Cream' },
    { id: 'plain', name: 'White' },
  ];

  return (
    <div className="max-w-xl mx-auto px-4 py-4 sm:py-6 space-y-4">
      {/* Top Header matching Screen 4: < Pen & Paper */}
      <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 text-neutral-600 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
            title="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-neutral-900">
            Pen & Paper
          </h1>
        </div>
      </div>

      {/* 1. Pen Selector Row matching Screen 4 */}
      <div className="space-y-2">
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 sm:gap-2">
          {(Object.values(REALISTIC_PENS) as PenPreset[]).map((penPreset) => {
            const isSelected = currentPen === penPreset.id;
            return (
              <button
                key={penPreset.id}
                type="button"
                onClick={() => handleSelectPen(penPreset.id)}
                className={`py-2 px-1 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/90 shadow-2xs ring-2 ring-emerald-500/20'
                    : 'border-neutral-200 hover:border-neutral-300 bg-white'
                }`}
              >
                <span className="text-xl sm:text-2xl mb-1">
                  {penPreset.id === 'ballpoint' && '🖊️'}
                  {penPreset.id === 'gel' && '🖋️'}
                  {penPreset.id === 'fountain' && '✒️'}
                  {penPreset.id === 'marker' && '🖍️'}
                  {penPreset.id === 'rollerball' && '🖌️'}
                  {penPreset.id === 'fineliner' && '📏'}
                  {penPreset.id === 'pencil' && '✏️'}
                </span>
                <span className={`text-[10px] text-center font-bold leading-tight ${
                  isSelected ? 'text-emerald-800' : 'text-neutral-700'
                }`}>
                  {penPreset.shortLabel}
                </span>
                <span className="text-[8px] text-neutral-400">
                  {penPreset.id === 'fountain' ? 'Ink' : penPreset.id === 'pencil' ? 'HB' : penPreset.id === 'marker' ? 'Bold' : 'Pen'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Ink Color Row matching Screen 4 */}
      <div className="flex items-center justify-between px-1 py-1">
        <span className="text-xs font-bold text-neutral-700">Ink Color</span>
        <div className="flex items-center gap-2">
          {[
            { name: 'Royal Blue', hex: '#1e3a8a' },
            { name: 'Black', hex: '#0f172a' },
            { name: 'Navy', hex: '#1d4ed8' },
            { name: 'Red', hex: '#b91c1c' },
            { name: 'Green', hex: '#047857' },
            { name: 'Violet', hex: '#6b21a8' },
          ].map((col) => (
            <button
              key={col.hex}
              type="button"
              onClick={() => handleSelectColor(col.hex)}
              className={`w-6 h-6 rounded-full border transition-transform cursor-pointer ${
                styles.inkColor === col.hex ? 'ring-2 ring-emerald-500 scale-125 shadow-xs' : 'hover:scale-110'
              }`}
              style={{ backgroundColor: col.hex }}
              title={col.name}
            />
          ))}
          <input
            type="color"
            value={styles.inkColor}
            onChange={(e) => handleSelectColor(e.target.value)}
            className="w-6 h-6 rounded-full border border-neutral-300 cursor-pointer p-0 ml-1"
            title="Custom Ink Color"
          />
        </div>
      </div>

      {/* 3. Paper Style Selector matching Screen 4 */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-neutral-700 px-1">Paper Style</div>
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
          {paperStylesList.map((paper) => {
            const isSelected = styles.paperStyle === paper.id;
            return (
              <button
                key={paper.id}
                type="button"
                onClick={() => handleSelectPaper(paper.id)}
                className={`p-1.5 rounded-xl border flex flex-col items-center justify-between transition-all cursor-pointer ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20'
                    : 'border-neutral-200 hover:border-neutral-300 bg-white'
                }`}
              >
                {/* Visual Thumbnail */}
                <div
                  className="w-full h-11 rounded-lg border border-neutral-200 shadow-2xs mb-1.5 relative overflow-hidden"
                  style={{
                    backgroundColor:
                      paper.id === 'cream'
                        ? '#fefcf3'
                        : paper.id === 'legal'
                        ? '#fefaec'
                        : '#ffffff',
                    backgroundImage:
                      paper.id === 'ruled' || paper.id === 'legal'
                        ? 'repeating-linear-gradient(to bottom, transparent 0px, transparent 5px, #e2e8f0 5px, #e2e8f0 6px)'
                        : paper.id === 'grid'
                        ? 'linear-gradient(to right, #f1f5f9 1px, transparent 1px), linear-gradient(to bottom, #f1f5f9 1px, transparent 1px)'
                        : undefined,
                    backgroundSize: paper.id === 'grid' ? '6px 6px' : undefined,
                  }}
                >
                  {paper.id === 'ruled' && (
                    <div className="absolute top-0 bottom-0 left-2 w-[1px] bg-red-400" />
                  )}
                  {paper.id === 'legal' && (
                    <div className="absolute top-0 bottom-0 left-2.5 w-[2px] border-l border-r border-red-300" />
                  )}
                </div>
                <span className={`text-[10px] text-center font-bold leading-tight ${
                  isSelected ? 'text-emerald-800' : 'text-neutral-700'
                }`}>
                  {paper.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Live Ruled Notebook Sheet Preview matching Screen 4 */}
      <div className="bg-neutral-100 rounded-2xl border border-neutral-200 p-3 sm:p-4 flex flex-col items-center justify-center overflow-hidden relative">
        <div className="overflow-x-auto w-full flex justify-center py-1">
          <NotebookPagePreview
            page={activePage}
            style={styles}
            language={assignment.language}
            scale={previewScale}
          />
        </div>

        {/* Floating preview controls bar matching Screen 4: < 1/3 > | Fit */}
        <div className="mt-3 flex items-center justify-between w-full max-w-xs bg-white rounded-xl border border-neutral-200 px-3 py-1.5 text-xs text-neutral-600 shadow-xs">
          <div className="flex items-center gap-2">
            <button
              disabled={currentPageIdx === 0}
              onClick={() => setCurrentPageIdx((p) => Math.max(0, p - 1))}
              className="p-1 hover:bg-neutral-100 rounded disabled:opacity-30 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold tabular-nums text-neutral-800">
              {currentPageIdx + 1} / {renderedPages.length}
            </span>
            <button
              disabled={currentPageIdx >= renderedPages.length - 1}
              onClick={() => setCurrentPageIdx((p) => Math.min(renderedPages.length - 1, p + 1))}
              className="p-1 hover:bg-neutral-100 rounded disabled:opacity-30 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setPreviewScale((s) => (s === 0.55 ? 0.75 : 0.55))}
            className="flex items-center gap-1 font-semibold text-neutral-700 hover:text-emerald-700 px-2 py-0.5 rounded hover:bg-neutral-50 cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Fit</span>
          </button>
        </div>
      </div>

      {/* 5. Primary CTA Button matching Screen 4: Next: Preview & Download */}
      <button
        onClick={handleSaveAndNext}
        className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
      >
        <span>Next: Preview & Download</span>
        <Check className="w-4 h-4 stroke-[2.5]" />
      </button>
    </div>
  );
};
