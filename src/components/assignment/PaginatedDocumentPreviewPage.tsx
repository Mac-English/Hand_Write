import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Download,
  Share2,
  FileText,
  Image,
  CheckCircle2,
  Printer,
  ShieldCheck,
  PenTool,
  Smartphone,
  Eye,
  EyeOff,
  Sliders,
  Edit3,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sparkles,
  Save,
  RotateCcw,
  Palette,
  Type,
  BookOpen,
  Layers,
  X,
  ExternalLink,
} from 'lucide-react';
import {
  Assignment,
  StyleSettings,
  PageSize,
  PaperStyle,
  HandwritingFont,
  PenType,
  Language,
} from '../../types';
import { HandwritingEngine, RenderedPage, PAGE_SPECS } from '../../engine/handwritingEngine';
import { NotebookPagePreview } from './NotebookPagePreview';
import { DEFAULT_STYLE_SETTINGS, storageService } from '../../services/storageService';
import { PdfService } from '../../services/pdfService';
import { REALISTIC_PENS, PenPreset } from '../../engine/penSimulation';
import { CharacterGlyphStudio } from '../handwriting/CharacterGlyphStudio';
import { geminiService } from '../../services/geminiService';

interface PaginatedDocumentPreviewPageProps {
  assignment: Assignment;
  onBack: () => void;
  onReturnDashboard?: () => void;
  onEditContent?: () => void;
  onEditStyles?: () => void;
  onSaveAssignment?: (updated: Assignment) => void;
}

export const PaginatedDocumentPreviewPage: React.FC<PaginatedDocumentPreviewPageProps> = ({
  assignment,
  onBack,
  onReturnDashboard,
  onEditContent,
  onEditStyles,
  onSaveAssignment,
}) => {
  // Active Tab in the side studio panel: 'write' | 'handwriting' | 'paper' | 'export'
  const [activeStudioTab, setActiveStudioTab] = useState<'write' | 'handwriting' | 'paper' | 'export'>('write');

  // Mobile view toggle: 'preview' (show paper) vs 'studio' (show editor & tools)
  const [mobileViewMode, setMobileViewMode] = useState<'preview' | 'studio'>('preview');

  // Draft content & styles
  const [draftText, setDraftText] = useState(
    assignment.draftContent ||
      `# Physics Assignment 02\nTopic: Quantum Mechanics & Wave-Particle Duality\n\n1. Dual Nature of Matter\nIn 1924, Louis de Broglie hypothesized that physical matter exhibits wave characteristics. The wavelength associated with any moving mass m with velocity v is given by:\nlambda = h / p = h / (m * v)\nWhere h is Planck's constant (6.626 x 10^-34 J*s) and p is relativistic momentum.\n\n2. The Uncertainty Principle\nWerner Heisenberg formulated that it is fundamentally impossible to simultaneously determine both the exact position and momentum of a particle:\nDelta x * Delta p >= h / (4 * pi)\nThis uncertainty represents an intrinsic property of all quantum mechanical wave packets.\n\n3. Conclusion\nQuantum mechanics successfully accounts for discrete energy transitions, atomic spectral lines, and the stability of matter.`
  );

  const [styles, setStyles] = useState<StyleSettings>(
    assignment.styleSettings || DEFAULT_STYLE_SETTINGS
  );

  const [assignmentTitle, setAssignmentTitle] = useState(assignment.title || 'Untitled Assignment');

  // Pagination & Preview state
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [previewScale, setPreviewScale] = useState<number>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 640) {
      return Math.min(0.44, (window.innerWidth - 32) / 816);
    }
    return 0.58;
  });

  // Action states
  const [isExporting, setIsExporting] = useState(false);
  const [refineActionLoading, setRefineActionLoading] = useState<string | null>(null);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [showCharacterStudioModal, setShowCharacterStudioModal] = useState(false);
  const [isPaperStageVisible, setIsPaperStageVisible] = useState(false);

  // Resize listener for scale
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setPreviewScale(Math.min(0.44, (window.innerWidth - 32) / 816));
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Compute live pages
  const renderedPages: RenderedPage[] = HandwritingEngine.paginate(
    draftText || '...',
    styles,
    assignment.language
  );
  const totalPages = Math.max(1, renderedPages.length);
  const currentPage = renderedPages[Math.min(activePageIndex, totalPages - 1)] || renderedPages[0];

  const currentPenPreset = REALISTIC_PENS[styles.penType || 'fountain'] || REALISTIC_PENS.fountain;
  const pageSpec = PAGE_SPECS[styles.pageSize] || PAGE_SPECS.a4;

  const showToast = (msg: string) => {
    setStatusNotice(msg);
    setTimeout(() => setStatusNotice(null), 3500);
  };

  // Helper to persist updates
  const saveStateToStorage = (updatedDraft: string, updatedStyles: StyleSettings, updatedTitle?: string) => {
    const updated: Assignment = {
      ...assignment,
      title: updatedTitle !== undefined ? updatedTitle : assignmentTitle,
      draftContent: updatedDraft,
      styleSettings: updatedStyles,
      pageCount: renderedPages.length,
      updatedAt: new Date().toISOString(),
    };
    storageService.saveAssignment(updated);
    if (onSaveAssignment) {
      onSaveAssignment(updated);
    }
  };

  const handleUpdateText = (newText: string) => {
    setDraftText(newText);
    saveStateToStorage(newText, styles);
  };

  const handleUpdateStyle = <K extends keyof StyleSettings>(key: K, value: StyleSettings[K]) => {
    const nextStyles = { ...styles, [key]: value };
    setStyles(nextStyles);
    saveStateToStorage(draftText, nextStyles);
  };

  const handleSelectPen = (penId: PenType) => {
    const preset = REALISTIC_PENS[penId];
    const nextStyles: StyleSettings = {
      ...styles,
      penType: penId,
      strokeWidth: preset.defaultStrokeWidth,
      inkColor: preset.defaultInkColor,
    };
    setStyles(nextStyles);
    saveStateToStorage(draftText, nextStyles);
    showToast(`Applied ${preset.name} (${preset.nameUrdu})`);
  };

  const handleSelectPageSize = (sz: PageSize) => {
    const nextStyles = { ...styles, pageSize: sz };
    setStyles(nextStyles);
    saveStateToStorage(draftText, nextStyles);
    showToast(`Page size updated to ${PAGE_SPECS[sz].name}`);
  };

  const handleSelectPaperStyle = (pst: PaperStyle) => {
    const nextStyles = { ...styles, paperStyle: pst };
    setStyles(nextStyles);
    saveStateToStorage(draftText, nextStyles);
    showToast(`Paper style set to ${pst}`);
  };

  // AI Refine in-place
  const handleRefine = async (action: 'simplify' | 'expand' | 'grammar' | 'rephrase') => {
    setRefineActionLoading(action);
    try {
      const res = await geminiService.refineDraft({
        action,
        text: draftText,
        instructions: `Keep academic formatting suitable for handwritten student notebook submission. Language: ${assignment.language}`,
      });
      if (res.content) {
        setDraftText(res.content);
        saveStateToStorage(res.content, styles);
        showToast('Text refined and paper updated!');
      }
    } catch (err) {
      console.error(err);
      showToast('Could not refine text');
    } finally {
      setRefineActionLoading(null);
    }
  };

  // Export handlers
  const handleDownloadPdf = async () => {
    setIsExporting(true);
    try {
      await PdfService.generatePdf(
        assignmentTitle,
        draftText,
        styles,
        assignment.language
      );
      showToast(`Complete ${totalPages}-Page PDF downloaded with ZERO cropping!`);
    } catch (err: any) {
      console.error('PDF error:', err);
      showToast('Failed to export PDF');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadCurrentPagePng = () => {
    PdfService.exportPageAsImage(
      activePageIndex,
      renderedPages,
      styles,
      assignmentTitle,
      assignment.language
    );
    showToast(`Page ${activePageIndex + 1} PNG exported!`);
  };

  const handleDownloadSpecificPagePng = (idx: number) => {
    PdfService.exportPageAsImage(
      idx,
      renderedPages,
      styles,
      assignmentTitle,
      assignment.language
    );
    showToast(`Page ${idx + 1} PNG exported!`);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: assignmentTitle,
          text: `Check out my handwritten assignment: ${assignmentTitle}`,
          url: window.location.href,
        });
        showToast('Shared successfully!');
      } catch {
        // cancelled
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Assignment link copied to clipboard!');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const fontsList: { id: HandwritingFont; name: string; tag: string }[] = [
    { id: 'Custom My Hand', name: '⭐ Meri Handwriting (Custom Glyphs)', tag: 'Personal Glyphs' },
    { id: 'Caveat', name: 'Caveat', tag: 'Fluid Cursive' },
    { id: 'Patrick Hand', name: 'Patrick Hand', tag: 'Neat School Print' },
    { id: 'Kalam', name: 'Kalam', tag: 'Pen Script' },
    { id: 'Indie Flower', name: 'Indie Flower', tag: 'Relaxed Hand' },
    { id: 'Homemade Apple', name: 'Homemade Apple', tag: 'Fast Script' },
    { id: 'Sacramento', name: 'Sacramento', tag: 'Formal Cursive' },
    { id: 'Noto Nastaliq Urdu', name: 'Noto Nastaliq Urdu', tag: 'اردو خط' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-6 space-y-4">
      {/* Toast Notification */}
      {statusNotice && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 p-3 px-5 bg-neutral-900/95 text-white rounded-full text-xs font-semibold flex items-center gap-2 shadow-xl backdrop-blur-sm animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{statusNotice}</span>
        </div>
      )}

      {/* Main Top Header: "Paper Review" */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack}
            className="p-2 text-neutral-600 hover:text-neutral-900 rounded-xl hover:bg-neutral-100 transition-colors cursor-pointer shrink-0"
            title="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold text-neutral-900 truncate">
                Paper Review
              </h1>
              <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-full shrink-0">
                {totalPages} {totalPages === 1 ? 'Page' : 'Pages'}
              </span>
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full shrink-0">
                Exact {pageSpec.name}
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5 truncate">
              Review your notebook paper, edit writing directly, change pens & page size, and export in one place.
            </p>
          </div>
        </div>

        {/* Header Action Suite */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {onReturnDashboard && (
            <button
              onClick={onReturnDashboard}
              className="px-3 py-2 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors cursor-pointer"
            >
              Dashboard
            </button>
          )}

          <button
            onClick={handleDownloadCurrentPagePng}
            className="px-3 py-2 text-xs font-semibold text-neutral-700 bg-white border border-neutral-300 hover:bg-neutral-50 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
            title="Download current page PNG"
          >
            <Image className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Page {activePageIndex + 1} PNG</span>
            <span className="sm:hidden">PNG</span>
          </button>

          <button
            disabled={isExporting}
            onClick={handleDownloadPdf}
            className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Generating...' : `Export PDF (${totalPages}P)`}</span>
          </button>
        </div>
      </div>

      {/* Mobile Switcher (Paper Review vs Studio Controls) */}
      <div className="lg:hidden flex rounded-xl bg-neutral-100 p-1 text-xs font-semibold">
        <button
          type="button"
          onClick={() => {
            setMobileViewMode('preview');
            setIsPaperStageVisible(true);
          }}
          className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            mobileViewMode === 'preview'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>Exact Paper View</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileViewMode('studio')}
          className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            mobileViewMode === 'studio'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <Edit3 className="w-4 h-4" />
          <span>Edit Writing & Tools</span>
        </button>
      </div>

      {/* Main Unified 2-Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ================= LEFT / CENTER: Exact Paper Review Viewport ================= */}
        <div
          className={`lg:col-span-7 bg-white rounded-2xl border border-neutral-200 p-3 sm:p-5 shadow-xs space-y-4 ${
            mobileViewMode === 'studio' ? 'hidden lg:block' : 'block'
          }`}
        >
          {/* Paper Viewport Controls Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 pb-3 text-xs">
            {/* Page Flipper Controls */}
            <div className="flex items-center gap-2">
              <button
                disabled={activePageIndex === 0}
                onClick={() => setActivePageIndex((p) => Math.max(0, p - 1))}
                className="p-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                title="Previous page"
              >
                <ChevronLeft className="w-4 h-4 text-neutral-700" />
              </button>

              <span className="font-bold text-neutral-800 tabular-nums px-1">
                Page {activePageIndex + 1} of {totalPages}
              </span>

              <button
                disabled={activePageIndex >= totalPages - 1}
                onClick={() => setActivePageIndex((p) => Math.min(totalPages - 1, p + 1))}
                className="p-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                title="Next page"
              >
                <ChevronRight className="w-4 h-4 text-neutral-700" />
              </button>
            </div>

            {/* Exact Paper Geometry Pill */}
            <div className="flex items-center gap-2">
              <span className="font-medium text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-md text-[11px]">
                {pageSpec.name} · {styles.paperStyle.toUpperCase()}
              </span>

              {/* Zoom Controls */}
              <div className="flex items-center gap-1 bg-neutral-100 p-0.5 rounded-lg text-[11px]">
                <button
                  onClick={() => setPreviewScale((s) => Math.max(0.35, Number((s - 0.08).toFixed(2))))}
                  className="p-1 hover:bg-white rounded cursor-pointer"
                  title="Zoom out"
                >
                  <ZoomOut className="w-3.5 h-3.5 text-neutral-600" />
                </button>
                <span className="px-1.5 font-mono text-neutral-700 tabular-nums font-semibold">
                  {Math.round(previewScale * 100)}%
                </span>
                <button
                  onClick={() => setPreviewScale((s) => Math.min(1.0, Number((s + 0.08).toFixed(2))))}
                  className="p-1 hover:bg-white rounded cursor-pointer"
                  title="Zoom in"
                >
                  <ZoomIn className="w-3.5 h-3.5 text-neutral-600" />
                </button>
              </div>

              {/* Visibility Toggle Button */}
              <button
                type="button"
                onClick={() => setIsPaperStageVisible((v) => !v)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer ${
                  isPaperStageVisible
                    ? 'border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                    : 'border-indigo-300 bg-indigo-50 text-indigo-700 shadow-2xs hover:bg-indigo-100'
                }`}
                title={isPaperStageVisible ? 'Make paper preview invisible' : 'Make paper preview visible'}
              >
                {isPaperStageVisible ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Hide Paper</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Show Paper</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Central Notebook Viewing Stage with Authentic Aspect Ratio */}
          <div
            className={`relative ${
              isPaperStageVisible ? 'bg-transparent border-0' : 'invisible'
            } rounded-xl p-3 sm:p-5 flex flex-col sm:flex-row gap-3 items-stretch justify-center overflow-hidden min-h-[500px] transition-all`}
          >
            {/* When invisible: Informative overlay with 1-click reveal */}
            {!isPaperStageVisible && (
              <div className="visible absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-20 pointer-events-auto">
                <div className="p-4 bg-white/95 rounded-2xl border border-neutral-200/90 shadow-md max-w-sm w-full space-y-3">
                  <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 mx-auto">
                    <EyeOff className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-neutral-800">Paper Preview is Invisible</div>
                    <div className="text-[11px] text-neutral-500 mt-0.5">
                      The paper review stage is currently set to invisible.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPaperStageVisible(true)}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Make Visible</span>
                  </button>
                </div>
              </div>
            )}
            {/* Thumbnail Strip */}
            {totalPages > 1 && (
              <div className="w-full sm:w-16 shrink-0 flex flex-row sm:flex-col gap-2 py-1 overflow-x-auto sm:overflow-y-auto max-h-[520px] scrollbar-thin">
                {renderedPages.map((_, idx) => {
                  const isSelected = activePageIndex === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActivePageIndex(idx)}
                      className={`p-1 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer bg-white ${
                        isSelected
                          ? 'border-indigo-600 ring-2 ring-indigo-500/20 shadow-xs'
                          : 'border-neutral-200 hover:border-neutral-300 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <div className="w-11 h-14 bg-[#fdfbf7] rounded border border-neutral-200 p-1 flex flex-col justify-between overflow-hidden shadow-2xs">
                        <div className="h-0.5 bg-neutral-300 rounded w-full" />
                        <div className="space-y-0.5">
                          <div className="h-0.5 bg-blue-300 rounded w-full" />
                          <div className="h-0.5 bg-blue-300 rounded w-4/5" />
                        </div>
                        <div className="text-[6px] text-neutral-400 font-mono text-center">
                          {idx + 1}
                        </div>
                      </div>
                      <span className="text-[9px] font-bold text-neutral-600 mt-1">
                        P{idx + 1}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Central Realistic Notebook Sheet */}
            <div className="flex-1 flex flex-col items-center justify-center overflow-x-auto">
              <div className="overflow-hidden flex justify-center py-1">
                <NotebookPagePreview
                  page={currentPage}
                  style={styles}
                  language={assignment.language}
                  scale={previewScale}
                />
              </div>

              {/* Bottom Pagination Control */}
              <div className="mt-3 flex items-center justify-center gap-3 text-xs text-neutral-600 bg-white/90 px-3 py-1.5 rounded-full border border-neutral-200/80 shadow-2xs">
                <span className="text-[11px] font-medium text-neutral-500">
                  {currentPenPreset.name} on {styles.paperStyle} paper
                </span>
                <span>·</span>
                <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Exact A4 Zero-Crop</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT: Interactive Studio (Write, Handwriting, Paper Size, Export) ================= */}
        <div
          className={`lg:col-span-5 bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden flex flex-col ${
            mobileViewMode === 'preview' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* Studio Tab Navigation */}
          <div className="flex items-center border-b border-neutral-200 bg-neutral-50/70 p-1.5 gap-1 text-xs font-semibold overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveStudioTab('write')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                activeStudioTab === 'write'
                  ? 'bg-white text-indigo-700 shadow-xs border border-neutral-200/80'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>1. Edit Writing</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveStudioTab('handwriting')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                activeStudioTab === 'handwriting'
                  ? 'bg-white text-indigo-700 shadow-xs border border-neutral-200/80'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>2. Handwriting</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveStudioTab('paper')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                activeStudioTab === 'paper'
                  ? 'bg-white text-indigo-700 shadow-xs border border-neutral-200/80'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>3. Page Size</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveStudioTab('export')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                activeStudioTab === 'export'
                  ? 'bg-white text-indigo-700 shadow-xs border border-neutral-200/80'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>4. Export</span>
            </button>
          </div>

          {/* Tab 1: EDIT & WRITING OVER THERE */}
          {activeStudioTab === 'write' && (
            <div className="p-4 sm:p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1">
                  Assignment Title
                </label>
                <input
                  type="text"
                  value={assignmentTitle}
                  onChange={(e) => {
                    setAssignmentTitle(e.target.value);
                    saveStateToStorage(draftText, styles, e.target.value);
                  }}
                  className="w-full text-xs bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-2 text-neutral-800 focus:outline-indigo-500 font-medium"
                />
              </div>

              {/* AI Quick Refine Buttons */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-neutral-800 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Live Writing Editor (Updates Paper Instantly)</span>
                  </label>
                  <span className="text-[11px] text-neutral-400">
                    {draftText.split(/\s+/).filter(Boolean).length} words
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-2">
                  <button
                    disabled={!!refineActionLoading}
                    onClick={() => handleRefine('simplify')}
                    className="px-2.5 py-1 text-[11px] font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors cursor-pointer"
                  >
                    {refineActionLoading === 'simplify' ? 'Simplifying...' : 'Simplify'}
                  </button>
                  <button
                    disabled={!!refineActionLoading}
                    onClick={() => handleRefine('expand')}
                    className="px-2.5 py-1 text-[11px] font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors cursor-pointer"
                  >
                    {refineActionLoading === 'expand' ? 'Expanding...' : 'Expand'}
                  </button>
                  <button
                    disabled={!!refineActionLoading}
                    onClick={() => handleRefine('grammar')}
                    className="px-2.5 py-1 text-[11px] font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors cursor-pointer"
                  >
                    {refineActionLoading === 'grammar' ? 'Checking...' : 'Fix Grammar'}
                  </button>
                  <button
                    disabled={!!refineActionLoading}
                    onClick={() => handleRefine('rephrase')}
                    className="px-2.5 py-1 text-[11px] font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors cursor-pointer"
                  >
                    {refineActionLoading === 'rephrase' ? 'Polishing...' : 'Academic Tone'}
                  </button>
                </div>

                <textarea
                  rows={14}
                  value={draftText}
                  onChange={(e) => handleUpdateText(e.target.value)}
                  placeholder="Type or paste assignment notes, formulas, derivations..."
                  className="w-full text-xs bg-neutral-50 border border-neutral-300 rounded-xl p-3 text-neutral-800 leading-relaxed focus:outline-indigo-500 font-sans resize-y"
                  style={{
                    direction: assignment.language === 'ur' ? 'rtl' : 'ltr',
                    textAlign: assignment.language === 'ur' ? 'right' : 'left',
                  }}
                />
                <p className="text-[11px] text-neutral-400 mt-1">
                  ✏️ Any edits you make here appear instantly on the handwritten notebook page on the left.
                </p>
              </div>
            </div>
          )}

          {/* Tab 2: HANDWRITING & REAL PENS */}
          {activeStudioTab === 'handwriting' && (
            <div className="p-4 sm:p-5 space-y-4 max-h-[640px] overflow-y-auto">
              {/* Real Pen Simulation */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                    <PenTool className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Real Pen Simulation (قلم کا انتخاب)</span>
                  </label>
                  <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                    {currentPenPreset.name}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {(Object.values(REALISTIC_PENS) as PenPreset[]).map((penPreset) => {
                    const isSelected = (styles.penType || 'fountain') === penPreset.id;
                    return (
                      <button
                        key={penPreset.id}
                        type="button"
                        onClick={() => handleSelectPen(penPreset.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/90 shadow-2xs ring-1 ring-indigo-500'
                            : 'border-neutral-200 hover:border-neutral-300 bg-white hover:bg-neutral-50'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="text-base">
                            {penPreset.id === 'ballpoint' && '🖊️'}
                            {penPreset.id === 'gel' && '🖋️'}
                            {penPreset.id === 'fountain' && '✒️'}
                            {penPreset.id === 'marker' && '🖍️'}
                            {penPreset.id === 'rollerball' && '🖌️'}
                            {penPreset.id === 'fineliner' && '📏'}
                            {penPreset.id === 'pencil' && '✏️'}
                          </span>
                          <span className="text-xs font-bold text-neutral-900 leading-tight">
                            {penPreset.name}
                          </span>
                        </div>
                        <div className="text-[10px] text-neutral-500 mt-0.5 pl-6">
                          {penPreset.nameUrdu}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Ink Color Palette */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs font-semibold text-neutral-700">Ink Color:</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {currentPenPreset.suggestedColors.map((col) => (
                      <button
                        key={col.hex}
                        type="button"
                        onClick={() => handleUpdateStyle('inkColor', col.hex)}
                        title={col.name}
                        className={`w-5 h-5 rounded-full border transition-transform cursor-pointer ${
                          styles.inkColor === col.hex
                            ? 'ring-2 ring-indigo-500 scale-110 shadow-xs'
                            : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: col.hex }}
                      />
                    ))}
                    <input
                      type="color"
                      value={styles.inkColor}
                      onChange={(e) => handleUpdateStyle('inkColor', e.target.value)}
                      className="w-5 h-5 rounded border border-neutral-300 cursor-pointer p-0 ml-1"
                      title="Custom Ink Tone"
                    />
                  </div>
                </div>
              </div>

              {/* Handwriting Model Selector */}
              <div className="pt-3 border-t border-neutral-100 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-neutral-800">
                    Handwriting Model
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowCharacterStudioModal(true)}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Draw Glyphs</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-1.5">
                  {fontsList.map((f) => {
                    const isSelected = styles.fontFamily === f.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => handleUpdateStyle('fontFamily', f.id)}
                        className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/80 font-bold text-indigo-900 ring-1 ring-indigo-500'
                            : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                        }`}
                      >
                        <span>{f.name}</span>
                        <span className="text-[10px] text-neutral-400 font-normal">{f.tag}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Geometry Sliders */}
              <div className="pt-3 border-t border-neutral-100 space-y-3">
                <div className="grid grid-cols-2 gap-3">
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
                      onChange={(e) => handleUpdateStyle('fontSize', parseInt(e.target.value, 10))}
                      className="w-full accent-indigo-600 cursor-pointer"
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
                      max="2.5"
                      step="0.1"
                      value={styles.lineSpacing}
                      onChange={(e) => handleUpdateStyle('lineSpacing', parseFloat(e.target.value))}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-neutral-700 mb-1">
                      <span>Slant Tilt</span>
                      <span className="text-neutral-500">{styles.slantAngle}°</span>
                    </div>
                    <input
                      type="range"
                      min="-8"
                      max="8"
                      value={styles.slantAngle}
                      onChange={(e) => handleUpdateStyle('slantAngle', parseInt(e.target.value, 10))}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-neutral-700 mb-1">
                      <span>Word Gap</span>
                      <span className="text-neutral-500">{(styles.wordSpacing || 2.5).toFixed(1)}px</span>
                    </div>
                    <input
                      type="range"
                      min="1.5"
                      max="5.0"
                      step="0.2"
                      value={styles.wordSpacing || 2.5}
                      onChange={(e) => handleUpdateStyle('wordSpacing', parseFloat(e.target.value))}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={styles.organicJitter}
                    onChange={(e) => handleUpdateStyle('organicJitter', e.target.checked)}
                    className="rounded text-indigo-600 accent-indigo-600"
                  />
                  <span className="text-xs text-neutral-700 font-medium">
                    Organic baseline variation (mimics natural human hand)
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Tab 3: PAGE SIZE & PAPER GEOMETRY */}
          {activeStudioTab === 'paper' && (
            <div className="p-4 sm:p-5 space-y-4 max-h-[640px] overflow-y-auto">
              {/* Exact Page Size Selector */}
              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1.5">
                  Page Size Dimensions (Exact Standard Sizing)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'a4', name: 'A4 (210 x 297 mm)', desc: 'Standard International Notebook' },
                    { id: 'letter', name: 'US Letter (8.5 x 11 in)', desc: 'US College Assignment' },
                    { id: 'legal', name: 'Legal (8.5 x 14 in)', desc: 'Extended Yellow Legal Sheet' },
                    { id: 'a5', name: 'A5 (148 x 210 mm)', desc: 'Compact Pocket Notebook' },
                  ].map((sz) => {
                    const isSelected = styles.pageSize === sz.id;
                    return (
                      <button
                        key={sz.id}
                        type="button"
                        onClick={() => handleSelectPageSize(sz.id as PageSize)}
                        className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/80 font-bold text-indigo-900 ring-1 ring-indigo-500'
                            : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                        }`}
                      >
                        <div className="font-bold">{sz.name}</div>
                        <div className="text-[10px] text-neutral-400 font-normal mt-0.5">{sz.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Notebook Paper Style */}
              <div className="pt-3 border-t border-neutral-100">
                <label className="block text-xs font-bold text-neutral-800 mb-1.5">
                  Notebook Paper Pattern
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'ruled', name: 'Ruled Notebook', desc: 'Blue lines + red left margin' },
                    { id: 'legal', name: 'Yellow Legal Pad', desc: 'Canary paper + double red line' },
                    { id: 'grid', name: 'Engineering Grid', desc: 'Math & science quad paper' },
                    { id: 'cream', name: 'Warm Cream', desc: 'Ivory textured unruled' },
                    { id: 'plain', name: 'Clean White', desc: 'Plain bright white sheet' },
                  ].map((p) => {
                    const isSelected = styles.paperStyle === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelectPaperStyle(p.id as PaperStyle)}
                        className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/80 font-bold text-indigo-900 ring-1 ring-indigo-500'
                            : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                        }`}
                      >
                        <div className="font-bold">{p.name}</div>
                        <div className="text-[10px] text-neutral-400 font-normal mt-0.5">{p.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Student Header */}
              <div className="pt-3 border-t border-neutral-100 space-y-2.5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={styles.showStudentHeader}
                    onChange={(e) => handleUpdateStyle('showStudentHeader', e.target.checked)}
                    className="rounded text-indigo-600 accent-indigo-600"
                  />
                  <span className="text-xs text-neutral-800 font-bold">
                    Include Student Header on Page 1
                  </span>
                </label>

                {styles.showStudentHeader && (
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[11px] text-neutral-500">Student Name</span>
                      <input
                        type="text"
                        value={styles.studentName}
                        onChange={(e) => handleUpdateStyle('studentName', e.target.value)}
                        className="w-full bg-neutral-50 border border-neutral-300 rounded-lg px-2.5 py-1.5"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-neutral-500">Roll / ID</span>
                      <input
                        type="text"
                        value={styles.studentId}
                        onChange={(e) => handleUpdateStyle('studentId', e.target.value)}
                        className="w-full bg-neutral-50 border border-neutral-300 rounded-lg px-2.5 py-1.5"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-neutral-500">Subject</span>
                      <input
                        type="text"
                        value={styles.studentSubject}
                        onChange={(e) => handleUpdateStyle('studentSubject', e.target.value)}
                        className="w-full bg-neutral-50 border border-neutral-300 rounded-lg px-2.5 py-1.5"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-neutral-500">Date</span>
                      <input
                        type="text"
                        value={styles.studentDate}
                        onChange={(e) => handleUpdateStyle('studentDate', e.target.value)}
                        className="w-full bg-neutral-50 border border-neutral-300 rounded-lg px-2.5 py-1.5"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 4: EXPORT SUITE OVER THERE */}
          {activeStudioTab === 'export' && (
            <div className="p-4 sm:p-5 space-y-4 max-h-[640px] overflow-y-auto">
              {/* Primary PDF Export */}
              <div className="p-4 rounded-xl border-2 border-indigo-200 bg-gradient-to-b from-indigo-50/50 to-white space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-black text-xs shadow-xs shrink-0">
                    PDF
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-neutral-900 leading-tight">
                      Complete Multi-Page PDF
                    </h3>
                    <span className="text-[11px] text-neutral-500">
                      All {totalPages} pages · Guaranteed Zero Text Cropping
                    </span>
                  </div>
                </div>

                <p className="text-xs text-neutral-600 leading-relaxed">
                  Generates an authentic vector PDF document with genuine ruled lines, student header, and exact {pageSpec.name} margins.
                </p>

                <button
                  disabled={isExporting}
                  onClick={handleDownloadPdf}
                  className="w-full py-2.5 px-4 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  <span>
                    {isExporting ? 'Generating PDF...' : `Download Complete PDF (${totalPages} Pages)`}
                  </span>
                </button>
              </div>

              {/* PNG Exports */}
              <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/40 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
                    <Image className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-neutral-900 leading-tight">
                      Retina PNG Image Export
                    </h3>
                    <span className="text-[11px] text-neutral-500">
                      Export individual high-resolution notebook pages
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleDownloadCurrentPagePng}
                  className="w-full py-2 px-3 bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-blue-600" />
                  <span>Download Page {activePageIndex + 1} PNG</span>
                </button>

                {totalPages > 1 && (
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] font-semibold text-neutral-500 block">
                      Download other pages:
                    </span>
                    <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                      {renderedPages.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => handleDownloadSpecificPagePng(i)}
                          className={`px-2 py-1 text-[11px] font-medium rounded-lg border transition-colors cursor-pointer flex items-center gap-1 ${
                            activePageIndex === i
                              ? 'border-blue-400 bg-blue-50 text-blue-900 font-bold'
                              : 'border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700'
                          }`}
                        >
                          <Download className="w-3 h-3 text-neutral-400" />
                          <span>P{i + 1}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Share & Print Shortcuts */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={handleShare}
                  className="py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Link</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="py-2 px-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Sheet</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Character Glyph Studio Modal if requested from Handwriting tab */}
      {showCharacterStudioModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-neutral-50 rounded-2xl w-full max-w-6xl max-h-[92vh] overflow-y-auto border border-neutral-200 shadow-2xl relative p-2">
            <CharacterGlyphStudio
              initialProfile={{
                id: assignment.handwritingProfileId || 'hp-meri-handwriting',
                profileName: '⭐ Meri Handwriting (Custom Glyphs)',
                sampleImages: [],
                styleSettings: styles,
                customGlyphs: styles.customGlyphs,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }}
              onSaveProfile={(saved) => {
                if (saved.customGlyphs) {
                  const nextStyles = {
                    ...styles,
                    fontFamily: 'Custom My Hand' as HandwritingFont,
                    customGlyphs: saved.customGlyphs,
                  };
                  setStyles(nextStyles);
                  saveStateToStorage(draftText, nextStyles);
                }
                setShowCharacterStudioModal(false);
              }}
              onBack={() => setShowCharacterStudioModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
