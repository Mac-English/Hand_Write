import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  PenTool,
  Palette,
  FileText,
  Sliders,
  Type,
  Sparkles,
  Edit3,
  Download,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Undo2,
} from 'lucide-react';
import { Assignment, PenType, StyleSettings, PaperStyle, HandwritingFont, PageSize } from '../../types';
import { geminiService } from '../../services/geminiService';
import { REALISTIC_PENS, PenPreset } from '../../engine/penSimulation';
import { HandwritingEngine } from '../../engine/handwritingEngine';
import { NotebookPagePreview } from './NotebookPagePreview';
import { DEFAULT_STYLE_SETTINGS } from '../../services/storageService';
import { PdfService } from '../../services/pdfService';
import { FloatingToolDock, ToolDockItem } from '../common/FloatingToolDock';

interface AssignmentEditorPageProps {
  assignment: Assignment;
  onUpdateDraft: (draft: string, updatedStyles?: StyleSettings) => void;
  onNext: () => void;
  onBack: () => void;
}

export const AssignmentEditorPage: React.FC<AssignmentEditorPageProps> = ({
  assignment,
  onUpdateDraft,
  onNext,
  onBack,
}) => {
  const [draft, setDraft] = useState(assignment.draftContent || '');
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Active Tool Dock item: 'pen' | 'ink' | 'paper' | 'font' | 'sliders' | 'ai' | 'text' | null
  const [activeToolDrawer, setActiveToolDrawer] = useState<string | null>(null);

  // Responsive canvas zoom scale
  const [zoomScale, setZoomScale] = useState<number>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 640) {
      return Math.min(0.48, (window.innerWidth - 32) / 816);
    }
    return 0.84;
  });

  // Adjust zoom automatically on resize if in mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setZoomScale(Math.min(0.48, (window.innerWidth - 32) / 816));
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Active style and selected pen type
  const [styles, setStyles] = useState<StyleSettings>(
    assignment.styleSettings || DEFAULT_STYLE_SETTINGS
  );

  const currentPen: PenType = styles.penType || 'fountain';
  const penPreset = REALISTIC_PENS[currentPen] || REALISTIC_PENS.fountain;

  const showNotice = (msg: string) => {
    setStatusNotice(msg);
    setTimeout(() => setStatusNotice(null), 3000);
  };

  const updateStyleProp = <K extends keyof StyleSettings>(key: K, value: StyleSettings[K]) => {
    const newStyles: StyleSettings = {
      ...styles,
      [key]: value,
    };
    setStyles(newStyles);
    onUpdateDraft(draft, newStyles);
  };

  const handleSelectPen = (penId: PenType) => {
    const preset = REALISTIC_PENS[penId];
    const newStyles: StyleSettings = {
      ...styles,
      penType: penId,
      strokeWidth: preset.defaultStrokeWidth,
      inkColor: preset.defaultInkColor,
    };
    setStyles(newStyles);
    onUpdateDraft(draft, newStyles);
    showNotice(`Applied: ${preset.name} (${preset.nameUrdu})`);
  };

  const handleSelectColor = (hex: string) => {
    updateStyleProp('inkColor', hex);
    showNotice(`Ink color updated`);
  };

  const handleRefine = async (action: 'simplify' | 'expand' | 'grammar' | 'rephrase') => {
    setLoadingAction(action);
    try {
      const res = await geminiService.refineDraft({
        action,
        text: draft,
        instructions: `Keep academic formatting suitable for handwritten student notebook submission. Language: ${assignment.language}`,
      });
      if (res.content) {
        setDraft(res.content);
        onUpdateDraft(res.content, styles);
        showNotice('Text refined with AI!');
      }
    } catch (err: any) {
      console.error('Refine error:', err);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleQuickDownloadPdf = async () => {
    setIsExporting(true);
    try {
      await PdfService.generatePdf(
        assignment.title,
        draft,
        styles,
        assignment.language
      );
      showNotice('PDF downloaded with zero text cropping!');
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleSaveAndNext = () => {
    onUpdateDraft(draft, styles);
    onNext();
  };

  // Paginate pages for live view
  const previewPages = HandwritingEngine.paginate(draft || '...', styles, assignment.language);
  const totalPages = previewPages.length;
  const currentPage = previewPages[Math.min(activePageIndex, totalPages - 1)] || previewPages[0];

  const fontsList: { id: HandwritingFont; name: string; tag: string }[] = [
    { id: 'Custom My Hand', name: '⭐ Meri Handwriting (Custom Glyphs)', tag: 'Personal Glyphs' },
    { id: 'Caveat', name: 'Caveat', tag: 'Casual Cursive' },
    { id: 'Kalam', name: 'Kalam', tag: 'Smooth Ink' },
    { id: 'Indie Flower', name: 'Indie Flower', tag: 'Organic Print' },
    { id: 'Patrick Hand', name: 'Patrick Hand', tag: 'School Notes' },
    { id: 'Homemade Apple', name: 'Homemade Apple', tag: 'Fluid Script' },
    { id: 'Sacramento', name: 'Sacramento', tag: 'Calligraphy' },
    { id: 'Noto Nastaliq Urdu', name: 'خط نستعلیق (Urdu Nastaliq)', tag: 'Urdu Script' },
  ];

  const paperStyles: { id: PaperStyle; name: string; desc: string; sampleBg: string }[] = [
    { id: 'ruled', name: 'Ruled Notebook', desc: 'Blue lines with red margin', sampleBg: 'bg-white border-b border-blue-200' },
    { id: 'legal', name: 'Legal Yellow', desc: 'Canary sheet with double rule', sampleBg: 'bg-amber-100/70 border-b border-amber-300' },
    { id: 'plain', name: 'Plain Blank', desc: 'Pure white clean sheet', sampleBg: 'bg-white' },
    { id: 'grid', name: 'Grid / Graph', desc: 'Math & engineering grid', sampleBg: 'bg-white border border-stone-200' },
    { id: 'cream', name: 'Cream Textured', desc: 'Warm ivory parchment', sampleBg: 'bg-[#fefcf3]' },
  ];

  // Tool Dock items configuration
  const dockItems: ToolDockItem[] = [
    {
      id: 'pen',
      label: 'Pens & Brushes',
      shortLabel: penPreset.shortLabel,
      icon: <PenTool className="w-5 h-5 text-indigo-400" />,
      tooltip: `Current: ${penPreset.name}`,
    },
    {
      id: 'ink',
      label: 'Ink Palette',
      shortLabel: 'Ink',
      icon: (
        <span
          className="w-4 h-4 rounded-full border border-white/40 shadow-xs"
          style={{ backgroundColor: styles.inkColor }}
        />
      ),
      activeIndicatorColor: styles.inkColor,
      tooltip: 'Choose ink color or custom tone',
    },
    {
      id: 'paper',
      label: 'Paper Styles',
      shortLabel: 'Paper',
      icon: <FileText className="w-5 h-5 text-amber-400" />,
      tooltip: `Paper: ${styles.paperStyle}`,
    },
    {
      id: 'font',
      label: 'Handwriting Style',
      shortLabel: 'Font',
      icon: <Type className="w-5 h-5 text-emerald-400" />,
      tooltip: `Style: ${styles.fontFamily}`,
    },
    {
      id: 'sliders',
      label: 'Layout & Spacing',
      shortLabel: 'Spacing',
      icon: <Sliders className="w-5 h-5 text-teal-400" />,
      tooltip: 'Font size, line gap, and tilt',
    },
    {
      id: 'ai',
      label: 'AI Writing Tools',
      shortLabel: 'AI Polish',
      icon: <Sparkles className="w-5 h-5 text-amber-300" />,
      tooltip: 'Polish text, simplify, fix grammar',
    },
    {
      id: 'text',
      label: 'Edit Text Content',
      shortLabel: 'Draft',
      icon: <Edit3 className="w-5 h-5 text-stone-300" />,
      tooltip: 'Edit assignment notes and questions',
    },
  ];

  // Render content inside the floating drawer
  const renderDrawerContent = (activeId: string) => {
    switch (activeId) {
      case 'pen':
        return (
          <div className="space-y-3">
            <p className="text-[11px] text-stone-500 leading-relaxed">
              Select an authentic pen. Each instrument features custom pressure curves, stroke width, and ink absorption rules.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {(Object.values(REALISTIC_PENS) as PenPreset[]).map((p) => {
                const isSelected = currentPen === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectPen(p.id)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/90 shadow-xs ring-2 ring-indigo-400/30'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xl">
                        {p.id === 'ballpoint' && '🖊️'}
                        {p.id === 'gel' && '🖋️'}
                        {p.id === 'fountain' && '✒️'}
                        {p.id === 'marker' && '🖍️'}
                        {p.id === 'rollerball' && '🖌️'}
                        {p.id === 'fineliner' && '📏'}
                        {p.id === 'pencil' && '✏️'}
                      </span>
                      {isSelected && (
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 shadow-xs" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-stone-900 leading-tight">
                        {p.name}
                      </div>
                      <div className="text-[10px] text-stone-500 font-urdu">{p.nameUrdu}</div>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200/80">
              <div className="text-[11px] font-semibold text-stone-700">About {penPreset.name}:</div>
              <p className="text-[10px] text-stone-500 mt-0.5 leading-relaxed">
                {penPreset.description}
              </p>
            </div>
          </div>
        );

      case 'ink':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-stone-800 block mb-2">
                Curated Ink Presets
              </label>
              <div className="grid grid-cols-2 gap-2">
                {penPreset.suggestedColors.map((col) => {
                  const isSelected = styles.inkColor === col.hex;
                  return (
                    <button
                      key={col.hex}
                      type="button"
                      onClick={() => handleSelectColor(col.hex)}
                      className={`p-2.5 rounded-xl border flex items-center gap-2.5 text-xs font-semibold cursor-pointer transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-300'
                          : 'border-stone-200 bg-white hover:bg-stone-50'
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full border border-black/15 shadow-xs shrink-0"
                        style={{ backgroundColor: col.hex }}
                      />
                      <span className="truncate">{col.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-stone-800 block">Custom Ink Color</span>
                <span className="text-[10px] text-stone-500 font-mono">{styles.inkColor}</span>
              </div>
              <input
                type="color"
                value={styles.inkColor}
                onChange={(e) => handleSelectColor(e.target.value)}
                className="w-8 h-8 rounded-lg cursor-pointer border border-stone-300 p-0"
              />
            </div>
          </div>
        );

      case 'paper':
        return (
          <div className="space-y-2">
            <p className="text-[11px] text-stone-500 mb-2">
              Select student notebook paper texture and line rules:
            </p>
            <div className="space-y-2">
              {paperStyles.map((p) => {
                const isSelected = styles.paperStyle === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      updateStyleProp('paperStyle', p.id);
                      showNotice(`Paper changed to ${p.name}`);
                    }}
                    className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/80 ring-2 ring-indigo-300'
                        : 'border-stone-200 bg-white hover:bg-stone-50'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-stone-900">{p.name}</div>
                      <div className="text-[10px] text-stone-500 mt-0.5">{p.desc}</div>
                    </div>
                    <div className={`w-8 h-8 rounded-lg shadow-2xs border border-stone-300 shrink-0 ${p.sampleBg}`} />
                  </button>
                );
              })}
            </div>

            {/* Exact Page Size Options */}
            <div className="pt-3 border-t border-stone-200 space-y-1.5">
              <span className="text-xs font-bold text-stone-800 block">
                Exact Page Dimensions (صفحہ کا سائز)
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'a4', name: 'A4 (210 x 297 mm)', desc: 'International Notebook' },
                  { id: 'letter', name: 'US Letter (8.5 x 11 in)', desc: 'Standard Sheet' },
                  { id: 'legal', name: 'Legal (8.5 x 14 in)', desc: 'Extended Legal' },
                  { id: 'a5', name: 'A5 (148 x 210 mm)', desc: 'Pocket Notebook' },
                ].map((sz) => (
                  <button
                    key={sz.id}
                    type="button"
                    onClick={() => {
                      updateStyleProp('pageSize', sz.id as PageSize);
                      showNotice(`Page size: ${sz.name}`);
                    }}
                    className={`p-2 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                      styles.pageSize === sz.id
                        ? 'border-indigo-600 bg-indigo-50/80 font-bold text-indigo-900 ring-1 ring-indigo-400'
                        : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <div className="font-bold text-[11px]">{sz.name}</div>
                    <div className="text-[9px] text-stone-400">{sz.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'font':
        return (
          <div className="space-y-2">
            <p className="text-[11px] text-stone-500 mb-2">
              Select handwriting script or your custom scanned glyphs:
            </p>
            <div className="space-y-1.5">
              {fontsList.map((f) => {
                const isSelected = styles.fontFamily === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      updateStyleProp('fontFamily', f.id);
                      showNotice(`Handwriting changed to ${f.name}`);
                    }}
                    className={`w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/80 ring-2 ring-indigo-300'
                        : 'border-stone-200 bg-white hover:bg-stone-50'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-stone-900 leading-snug">{f.name}</div>
                      <div className="text-[10px] text-indigo-600 font-medium mt-0.5">{f.tag}</div>
                    </div>
                    {isSelected && <span className="w-2 h-2 rounded-full bg-indigo-600" />}
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 'sliders':
        return (
          <div className="space-y-4">
            {/* Font Size */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-stone-700">
                <span>Font Size (Stroke Height)</span>
                <span className="font-mono">{styles.fontSize}px</span>
              </div>
              <input
                type="range"
                min="14"
                max="28"
                value={styles.fontSize}
                onChange={(e) => updateStyleProp('fontSize', parseInt(e.target.value, 10))}
                className="w-full accent-indigo-600"
              />
            </div>

            {/* Line Spacing */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-stone-700">
                <span>Line Gap</span>
                <span className="font-mono">{styles.lineSpacing.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="1.3"
                max="2.5"
                step="0.1"
                value={styles.lineSpacing}
                onChange={(e) => updateStyleProp('lineSpacing', parseFloat(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>

            {/* Slant Angle */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-stone-700">
                <span>Cursive Tilt (Slant)</span>
                <span className="font-mono">{styles.slantAngle}°</span>
              </div>
              <input
                type="range"
                min="-12"
                max="12"
                value={styles.slantAngle}
                onChange={(e) => updateStyleProp('slantAngle', parseInt(e.target.value, 10))}
                className="w-full accent-indigo-600"
              />
            </div>

            {/* Organic Jitter */}
            <div className="flex items-center justify-between p-2.5 bg-stone-50 rounded-xl border border-stone-200">
              <div>
                <span className="text-xs font-bold text-stone-800 block">Organic Human Wobble</span>
                <span className="text-[10px] text-stone-500">Natural imperfect baseline drift</span>
              </div>
              <input
                type="checkbox"
                checked={styles.organicJitter}
                onChange={(e) => updateStyleProp('organicJitter', e.target.checked)}
                className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
              />
            </div>
          </div>
        );

      case 'ai':
        return (
          <div className="space-y-3">
            <p className="text-[11px] text-stone-500 leading-relaxed">
              Polish and refine your assignment content with AI to match authentic student submission standards:
            </p>
            <div className="grid grid-cols-1 gap-2">
              {(
                [
                  { action: 'simplify', label: 'Simplify Wording', desc: 'Natural, clear student phrasing' },
                  { action: 'expand', label: 'Expand Details', desc: 'Add comprehensive explanations' },
                  { action: 'grammar', label: 'Fix Grammar & Spelling', desc: 'Eliminate typos and syntax errors' },
                  { action: 'rephrase', label: 'Academic Flow', desc: 'Polite academic presentation' },
                ] as const
              ).map((btn) => (
                <button
                  key={btn.action}
                  disabled={loadingAction !== null}
                  onClick={() => handleRefine(btn.action)}
                  className="p-3 bg-amber-50/70 hover:bg-amber-100/90 text-amber-950 border border-amber-200/80 rounded-xl text-left transition-all cursor-pointer flex items-center justify-between disabled:opacity-50"
                >
                  <div>
                    <div className="text-xs font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>{loadingAction === btn.action ? 'Working...' : btn.label}</span>
                    </div>
                    <div className="text-[10px] text-amber-800/80 mt-0.5">{btn.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 'text':
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-stone-600">
              <span className="font-bold">Assignment Draft:</span>
              <span className="text-[11px] font-mono">
                {draft.split(/\s+/).filter(Boolean).length} words
              </span>
            </div>
            <textarea
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                onUpdateDraft(e.target.value, styles);
              }}
              rows={8}
              className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-stone-800 resize-y"
              placeholder="Type your notes, headings (#), math equations, and study questions here..."
            />
            <p className="text-[10px] text-stone-400">
              Tip: Use # for headings and numbers like 1. for questions.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-stone-100/90 flex flex-col relative select-none pb-20 md:pb-6">
      {/* Toast Alert */}
      {statusNotice && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 p-2.5 px-4 bg-stone-900/95 text-white rounded-full text-xs font-semibold flex items-center gap-2 shadow-xl backdrop-blur-sm animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{statusNotice}</span>
        </div>
      )}

      {/* Slim Top Navigation Bar: Clean & Minimal ("work should be front, others inside icons") */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200/80 px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2 shadow-2xs">
        {/* Back and Title */}
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={onBack}
            className="p-1.5 text-stone-500 hover:text-stone-900 rounded-xl hover:bg-stone-100 transition-colors cursor-pointer shrink-0"
            title="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="truncate">
            <h1 className="text-xs sm:text-sm font-bold text-stone-900 truncate flex items-center gap-1.5">
              <span>{assignment.title || 'Untitled Assignment'}</span>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 rounded-md shrink-0">
                {totalPages} {totalPages === 1 ? 'Page' : 'Pages'}
              </span>
            </h1>
          </div>
        </div>

        {/* Center: Canvas Zoom Controls */}
        <div className="hidden sm:flex items-center gap-1 bg-stone-100 border border-stone-200 rounded-xl p-0.5">
          <button
            onClick={() => setZoomScale((s) => Math.max(0.35, s - 0.1))}
            className="p-1 text-stone-600 hover:text-stone-900 hover:bg-white rounded-lg transition-colors cursor-pointer"
            title="Zoom out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-mono px-1.5 text-stone-600 font-semibold tabular-nums">
            {Math.round(zoomScale * 100)}%
          </span>
          <button
            onClick={() => setZoomScale((s) => Math.min(1.2, s + 0.1))}
            className="p-1 text-stone-600 hover:text-stone-900 hover:bg-white rounded-lg transition-colors cursor-pointer"
            title="Zoom in"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right Actions: Quick PDF Export & Review */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            disabled={isExporting}
            onClick={handleQuickDownloadPdf}
            className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
            title="Instant Zero-Crop PDF Download"
          >
            <Download className="w-3.5 h-3.5 text-red-600" />
            <span className="hidden sm:inline">
              {isExporting ? 'Exporting...' : 'PDF'}
            </span>
          </button>

          <button
            onClick={handleSaveAndNext}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
          >
            <span>Paper Review</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Hero Canvas Area: Notebook Sheet is FRONT AND CENTER */}
      <div className="flex-1 overflow-auto flex flex-col items-center justify-start p-2 sm:p-6 pb-28 sm:pb-8">
        <div className="w-full flex flex-col items-center">
          {/* Central Paginated Sheet */}
          <div className="w-full flex justify-center py-2 sm:py-4 overflow-x-auto scrollbar-none">
            <NotebookPagePreview
              page={currentPage}
              style={styles}
              language={assignment.language}
              scale={zoomScale}
            />
          </div>

          {/* Pagination Navigation Pill beneath central sheet */}
          {totalPages > 1 && (
            <div className="mt-3 mb-6 flex items-center gap-3 bg-white/95 backdrop-blur-md px-4 py-1.5 rounded-full border border-stone-200 shadow-md text-xs font-semibold text-stone-700">
              <button
                disabled={activePageIndex === 0}
                onClick={() => setActivePageIndex((p) => Math.max(0, p - 1))}
                className="p-1 hover:bg-stone-100 rounded-full disabled:opacity-30 cursor-pointer"
                title="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="tabular-nums font-mono">
                Page {activePageIndex + 1} of {totalPages}
              </span>

              <button
                disabled={activePageIndex >= totalPages - 1}
                onClick={() => setActivePageIndex((p) => Math.min(totalPages - 1, p + 1))}
                className="p-1 hover:bg-stone-100 rounded-full disabled:opacity-30 cursor-pointer"
                title="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* UNIFIED FLOATING TOOL DOCK */}
      <FloatingToolDock
        items={dockItems}
        activeItemId={activeToolDrawer}
        onSelectItem={(id) => setActiveToolDrawer(id)}
        renderDrawerContent={renderDrawerContent}
        title="Assignment Studio Tools"
      />
    </div>
  );
};
