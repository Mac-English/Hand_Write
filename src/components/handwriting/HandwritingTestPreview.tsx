import React, { useState } from 'react';
import {
  PenTool,
  Sliders,
  Download,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Layers,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import { HandwritingProfile, StyleSettings, PaperStyle, HandwritingFont } from '../../types';
import { NotebookPagePreview } from '../assignment/NotebookPagePreview';
import { HandwritingEngine } from '../../engine/handwritingEngine';
import { PdfService } from '../../services/pdfService';
import { DEFAULT_STYLE_SETTINGS } from '../../services/storageService';

interface HandwritingTestPreviewProps {
  profiles: HandwritingProfile[];
  onBack: () => void;
  onOpenCalibration: () => void;
}

export const HandwritingTestPreview: React.FC<HandwritingTestPreviewProps> = ({
  profiles,
  onBack,
  onOpenCalibration,
}) => {
  const activeProfile = profiles[0];
  const [selectedProfileId, setSelectedProfileId] = useState(activeProfile?.id || '');
  const [styles, setStyles] = useState<StyleSettings>(activeProfile?.styleSettings || DEFAULT_STYLE_SETTINGS);
  const [scale, setScale] = useState(0.65);
  const [sampleText, setSampleText] = useState(
    'Assignment Test Page: Fluid Mechanics & Hydrostatic Pressure\n\nQuestion 1: Derive Pascal\'s Principle for a static fluid.\nAnswer: In an incompressible static fluid contained in an enclosed vessel, any pressure change applied at any point is transmitted undiminished throughout all portions of the fluid and normal to the containing vessel walls. P_1 = P_2, hence F_1 / A_1 = F_2 / A_2.\n\nQuestion 2: State the continuity equation for steady streamline flow.\nAnswer: By conservation of mass, the mass flow rate through any cross-section of a tube of flow is invariant: rho_1 * A_1 * v_1 = rho_2 * A_2 * v_2.'
  );

  const handleProfileSelect = (id: string) => {
    setSelectedProfileId(id);
    const found = profiles.find((p) => p.id === id);
    if (found) {
      setStyles(found.styleSettings);
    }
  };

  const pages = HandwritingEngine.paginate(sampleText, styles, 'en');

  const handleDownloadTestPdf = () => {
    PdfService.generatePdf('Handwriting_Test_Calibration', sampleText, styles, 'en');
  };

  const handleDownloadTestPng = () => {
    PdfService.exportPageAsImage(0, pages, styles, 'Handwriting_Test_Sample', 'en');
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 text-neutral-500 hover:text-neutral-800 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 flex items-center gap-2">
              <PenTool className="w-5 h-5 text-indigo-600" />
              <span>Handwriting Test-Preview Studio</span>
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5">
              Interactive test bench to inspect stroke rendering, ruled margins, ink tones, and line heights.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCalibration}
            className="px-3.5 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
          >
            Print Calibration Sheet
          </button>
          <button
            onClick={handleDownloadTestPdf}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Test PDF</span>
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Interactive Controls */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-neutral-200 p-6 shadow-xs space-y-5">
          <h2 className="font-semibold text-neutral-900 text-sm border-b border-neutral-100 pb-2">
            Real-Time Style Calibration
          </h2>

          {/* Profile Switcher */}
          {profiles.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Active Profile Reference
              </label>
              <select
                value={selectedProfileId}
                onChange={(e) => handleProfileSelect(e.target.value)}
                className="w-full text-xs bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-2 text-neutral-800"
              >
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.profileName}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Font Family */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Handwriting Font Model
            </label>
            <select
              value={styles.fontFamily}
              onChange={(e) => setStyles({ ...styles, fontFamily: e.target.value as HandwritingFont })}
              className="w-full text-xs bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-2 text-neutral-800"
            >
              <option value="Caveat">Caveat (Casual Fluid Cursive)</option>
              <option value="Patrick Hand">Patrick Hand (Neat Print)</option>
              <option value="Kalam">Kalam (Pen Script)</option>
              <option value="Indie Flower">Indie Flower (Relaxed Hand)</option>
              <option value="Homemade Apple">Homemade Apple (Fast Journal Script)</option>
              <option value="Sacramento">Sacramento (Formal Cursive)</option>
              <option value="Noto Nastaliq Urdu">Noto Nastaliq Urdu (اردو)</option>
            </select>
          </div>

          {/* Paper Background */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Notebook Paper Background
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'ruled', name: 'Ruled Lines' },
                { id: 'legal', name: 'Legal Pad' },
                { id: 'grid', name: 'Grid Paper' },
                { id: 'cream', name: 'Warm Cream' },
                { id: 'plain', name: 'Clean White' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setStyles({ ...styles, paperStyle: p.id as PaperStyle })}
                  className={`py-1.5 px-2 text-xs rounded-lg border text-center transition-colors ${
                    styles.paperStyle === p.id
                      ? 'border-indigo-600 bg-indigo-50 font-semibold text-indigo-900'
                      : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Ink Color */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Ink Color Pigment
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={styles.inkColor}
                onChange={(e) => setStyles({ ...styles, inkColor: e.target.value })}
                className="w-8 h-8 rounded border border-neutral-300 cursor-pointer"
              />
              <div className="flex gap-2">
                {['#1e3a8a', '#1d4ed8', '#1e293b', '#047857', '#6b21a8', '#4b5563'].map((c) => (
                  <button
                    key={c}
                    onClick={() => setStyles({ ...styles, inkColor: c })}
                    className={`w-6 h-6 rounded-full border ${styles.inkColor === c ? 'ring-2 ring-indigo-500 scale-110' : ''}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Sliders */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between text-xs font-semibold text-neutral-700 mb-1">
                <span>Font Size</span>
                <span className="text-neutral-500">{styles.fontSize} pt</span>
              </div>
              <input
                type="range"
                min="14"
                max="28"
                value={styles.fontSize}
                onChange={(e) => setStyles({ ...styles, fontSize: parseInt(e.target.value, 10) })}
                className="w-full accent-indigo-600"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs font-semibold text-neutral-700 mb-1">
                <span>Line Spacing</span>
                <span className="text-neutral-500">{styles.lineSpacing.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="1.3"
                max="2.4"
                step="0.1"
                value={styles.lineSpacing}
                onChange={(e) => setStyles({ ...styles, lineSpacing: parseFloat(e.target.value) })}
                className="w-full accent-indigo-600"
              />
            </div>
          </div>

          {/* Sample Text Editor */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Sample Text to Render
            </label>
            <textarea
              rows={5}
              value={sampleText}
              onChange={(e) => setSampleText(e.target.value)}
              className="w-full text-xs bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-neutral-800 leading-relaxed resize-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-neutral-100">
            <button
              onClick={handleDownloadTestPng}
              className="flex-1 py-2 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors flex items-center justify-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export PNG</span>
            </button>
            <button
              onClick={handleDownloadTestPdf}
              className="flex-1 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center justify-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export PDF</span>
            </button>
          </div>
        </div>

        {/* Right Side: Page Canvas Viewport */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between text-xs text-neutral-500 px-2">
            <span>Live Rendered Notebook Page (Page 1 of {pages.length})</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setScale((prev) => Math.max(0.4, prev - 0.1))}
                className="p-1 hover:bg-neutral-200 rounded"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="w-12 text-center tabular-nums">{Math.round(scale * 100)}%</span>
              <button
                onClick={() => setScale((prev) => Math.min(1.0, prev + 0.1))}
                className="p-1 hover:bg-neutral-200 rounded"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="bg-neutral-200/60 p-6 rounded-2xl border border-neutral-300/80 flex items-center justify-center overflow-auto min-h-[580px]">
            {pages[0] && (
              <NotebookPagePreview
                page={pages[0]}
                style={styles}
                language="en"
                scale={scale}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
