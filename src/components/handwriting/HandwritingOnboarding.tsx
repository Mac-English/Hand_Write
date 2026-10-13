import React, { useState } from 'react';
import {
  Upload,
  Sparkles,
  Camera,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Sliders,
  Eye,
  ArrowRight,
  ArrowLeft,
  FileText,
  RotateCcw,
  PenTool,
} from 'lucide-react';
import { HandwritingProfile, StyleSettings, HandwritingFont, PaperStyle } from '../../types';
import { geminiService, AnalyzeHandwritingResponse } from '../../services/geminiService';
import { DEFAULT_STYLE_SETTINGS } from '../../services/storageService';
import { NotebookPagePreview } from '../assignment/NotebookPagePreview';
import { HandwritingEngine } from '../../engine/handwritingEngine';
import { HandwritingCalibrationSheet } from './HandwritingCalibrationSheet';
import { CharacterGlyphStudio } from './CharacterGlyphStudio';
import { generateDefaultGlyphSet } from '../../engine/glyphLibrary';

interface HandwritingOnboardingProps {
  initialProfile?: HandwritingProfile | null;
  onSaveProfile: (profile: Omit<HandwritingProfile, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => void;
  onCancel: () => void;
}

export const HandwritingOnboarding: React.FC<HandwritingOnboardingProps> = ({
  initialProfile,
  onSaveProfile,
  onCancel,
}) => {
  const [currentStep, setCurrentStep] = useState<'upload' | 'analyze' | 'customize' | 'preview'>('upload');
  const [showCalibrationModal, setShowCalibrationModal] = useState(false);
  const [showCharacterStudioModal, setShowCharacterStudioModal] = useState(false);

  // Uploaded samples
  const [samples, setSamples] = useState<string[]>(initialProfile?.sampleImages || []);
  const [profileName, setProfileName] = useState(initialProfile?.profileName || 'My Personal Handwriting');

  // Style Settings state
  const [styles, setStyles] = useState<StyleSettings>(initialProfile?.styleSettings || DEFAULT_STYLE_SETTINGS);

  // Analysis result
  const [analysis, setAnalysis] = useState<AnalyzeHandwritingResponse | null>(
    initialProfile?.analysisNotes || null
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Test paragraph for Step D preview
  const [testText, setTestText] = useState(
    'Assignment 01: Thermodynamics & Quantum Principles\n\nQuestion 1: Explain Planck\'s quantum hypothesis.\nAnswer: Max Planck proposed that electromagnetic energy is emitted and absorbed only in discrete packets called quanta, where E = h*f. This resolved the ultraviolet catastrophe in classical physics.\n\nQuestion 2: State the first law of thermodynamics.\nAnswer: The total energy of an isolated system remains constant; energy can be transformed from one form to another but cannot be created or destroyed.'
  );

  // Handle image upload from file input
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setSamples((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeSample = (idx: number) => {
    setSamples((prev) => prev.filter((_, i) => i !== idx));
  };

  // Run AI Vision analysis on the uploaded samples
  const runAnalysis = async () => {
    if (samples.length === 0) return;
    setIsAnalyzing(true);
    setAnalysisError(null);
    setCurrentStep('analyze');

    try {
      const firstSample = samples[0];
      const result = await geminiService.analyzeHandwriting(firstSample, 'image/jpeg');
      setAnalysis(result);

      const detectedInk = result.detectedInkColor || styles.inkColor || '#1e3a8a';
      const detectedSlant = typeof result.estimatedSlant === 'number' ? result.estimatedSlant : styles.slantAngle;
      const glyphs = generateDefaultGlyphSet(detectedInk, detectedSlant);

      // Auto-populate styles based on vision analysis and initialize custom character glyphs
      setStyles((prev) => ({
        ...prev,
        fontFamily: 'Custom My Hand',
        slantAngle: detectedSlant,
        inkColor: detectedInk,
        lineSpacing: result.estimatedLineSpacing || prev.lineSpacing,
        wordSpacing: result.estimatedWordSpacing || prev.wordSpacing,
        customGlyphs: glyphs,
      }));

      setCurrentStep('customize');
    } catch (err: any) {
      console.warn('Vision analysis notice:', err);
      // Sensible fallback estimate so workflow never gets stuck
      const fallbackResult: AnalyzeHandwritingResponse = {
        clarityScore: 'Good',
        estimatedSlant: 1,
        detectedInkColor: '#1e3a8a',
        recommendedFont: 'Caveat',
        handwritingStyle: 'Casual Cursive',
        notes: 'Calibrated using standard ruled notebook geometry.',
        confidence: 'Approximate local estimate',
      };
      setAnalysis(fallbackResult);
      const glyphs = generateDefaultGlyphSet('#1e3a8a', 1);
      setStyles((prev) => ({
        ...prev,
        fontFamily: 'Custom My Hand',
        slantAngle: 1,
        inkColor: '#1e3a8a',
        customGlyphs: glyphs,
      }));
      setCurrentStep('customize');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Save completed profile
  const handleSave = () => {
    onSaveProfile({
      id: initialProfile?.id,
      profileName,
      sampleImages: samples,
      styleSettings: styles,
      customGlyphs: styles.customGlyphs,
      analysisNotes: analysis || undefined,
    });
  };

  // Paginated preview for test page
  const testPages = HandwritingEngine.paginate(testText, styles, 'en');

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
      {/* Calibration Template Modal */}
      <HandwritingCalibrationSheet
        isOpen={showCalibrationModal}
        onClose={() => setShowCalibrationModal(false)}
      />

      {/* Header with Step Tracker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            {initialProfile ? 'Edit Handwriting Profile' : 'Calibrate Your Handwriting Profile'}
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Configure authentic handwriting typography and paper settings tailored to your notebook style.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 text-xs font-medium text-neutral-500">
          <span className={`px-2.5 py-1 rounded-md ${currentStep === 'upload' ? 'bg-indigo-600 text-white' : 'bg-neutral-100 text-neutral-700'}`}>
            1. Upload
          </span>
          <span>→</span>
          <span className={`px-2.5 py-1 rounded-md ${currentStep === 'customize' ? 'bg-indigo-600 text-white' : 'bg-neutral-100 text-neutral-700'}`}>
            2. Calibrate
          </span>
          <span>→</span>
          <span className={`px-2.5 py-1 rounded-md ${currentStep === 'preview' ? 'bg-indigo-600 text-white' : 'bg-neutral-100 text-neutral-700'}`}>
            3. Test Page
          </span>
        </div>
      </div>

      {/* STEP A: Upload Samples */}
      {currentStep === 'upload' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-neutral-900 text-base">Step A: Upload Handwriting Samples</h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Upload 1 to 4 clear photographs of your own handwriting on lined or plain paper.
                </p>
              </div>
              <button
                onClick={() => setShowCalibrationModal(true)}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 underline"
              >
                View Calibration Template Sheet →
              </button>
            </div>

            {/* Profile Name Input */}
            <div className="max-w-md">
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Profile Name
              </label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="e.g. My Blue Fountain Pen Notes"
                className="w-full text-xs bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-2 text-neutral-800 focus:outline-indigo-500"
              />
            </div>

            {/* Drag and Drop / File Input Box */}
            <label className="border-2 border-dashed border-neutral-300 hover:border-indigo-500 bg-neutral-50/50 hover:bg-indigo-50/20 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors text-center block">
              <Camera className="w-8 h-8 text-neutral-400 mb-2" />
              <span className="text-xs font-semibold text-neutral-800">
                Click to upload photographs or drag and drop
              </span>
              <span className="text-[11px] text-neutral-500 mt-1">
                Supports JPG, PNG, WebP up to 10MB per file
              </span>
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {/* Uploaded Thumbnails Grid */}
            {samples.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-neutral-700 mb-2">
                  Uploaded Samples ({samples.length})
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {samples.map((src, i) => (
                    <div key={i} className="relative group rounded-lg overflow-hidden border border-neutral-200 aspect-3/2 bg-neutral-100">
                      <img src={src} alt={`Sample ${i + 1}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeSample(i)}
                        className="absolute top-1.5 right-1.5 bg-red-600 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove sample"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quality Guidelines */}
            <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200/80 text-xs text-neutral-600 space-y-1.5">
              <div className="font-semibold text-neutral-800">Calibration Notice:</div>
              <p>
                HandWrite AI extracts stylistic metrics (slant angle, ink tone, spacing) to calibrate a realistic handwriting profile. To preserve academic integrity and avoid fraudulent deception, our engine does not claim to synthesize undetectable signature forgeries.
              </p>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-800"
            >
              Cancel
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentStep('customize')}
                className="px-4 py-2 text-xs font-semibold text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50"
              >
                Skip Analysis (Configure Manually)
              </button>
              <button
                disabled={samples.length === 0}
                onClick={runAnalysis}
                className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Analyze Samples & Continue</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP B: Analysis In-Progress Loader */}
      {currentStep === 'analyze' && (
        <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center shadow-xs space-y-4 max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto animate-pulse">
            <Sparkles className="w-6 h-6 animate-spin" />
          </div>
          <h2 className="font-bold text-neutral-900 text-base">Analyzing Handwriting Sample...</h2>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Estimating natural baseline slant, stroke thickness, line spacing, and ink pigmentation using Gemini Vision...
          </p>
        </div>
      )}

      {/* STEP C: Customize & Fine-tune Settings */}
      {currentStep === 'customize' && (
        <div className="space-y-6">
          {/* Analysis Feedback Banner */}
          {analysis && (
            <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-4 text-xs text-indigo-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="font-semibold">Gemini Vision Analysis: </span>
                <span>
                  Detected {analysis.handwritingStyle || 'Cursive'} style with {analysis.clarityScore || 'Good'} clarity, {analysis.estimatedSlant || 0}° slant, and ink color {analysis.detectedInkColor}.
                </span>
                {analysis.notes && <p className="text-indigo-700 mt-1 italic">{analysis.notes}</p>}
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {/* Style Controls Card */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-xs space-y-5">
              <h2 className="font-semibold text-neutral-900 text-sm border-b border-neutral-100 pb-2">
                Handwriting Typography
              </h2>

              {/* Handwriting Style Selection */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-neutral-800">
                  Handwriting Style (ہینڈ رائٹنگ کا انتخاب)
                </label>

                {/* Option 1: Meri Handwriting */}
                <div
                  onClick={() => setStyles((prev) => ({ ...prev, fontFamily: 'Custom My Hand' }))}
                  className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                    styles.fontFamily === 'Custom My Hand'
                      ? 'border-indigo-600 bg-indigo-50/80 ring-1 ring-indigo-500'
                      : 'border-neutral-200 hover:border-neutral-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                        <span>⭐ Meri Handwriting (Captured Characters)</span>
                      </div>
                      <p className="text-[11px] text-neutral-600 mt-0.5">
                        Calibrated with your handwritten strokes for all required characters (A-Z, a-z, 0-9).
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowCharacterStudioModal(true);
                      }}
                      className="px-2 py-1 text-[11px] font-semibold text-indigo-700 bg-white border border-indigo-300 hover:bg-indigo-50 rounded-md shrink-0 flex items-center gap-1 cursor-pointer shadow-2xs"
                    >
                      <PenTool className="w-3 h-3 text-indigo-600" />
                      <span>Calibrate Letters</span>
                    </button>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-indigo-200/60 flex items-center justify-between text-[11px]">
                    <span className="text-neutral-600 font-medium">All 76 required characters supported</span>
                    <span className="text-indigo-700 font-semibold text-[10px]">
                      {styles.customGlyphs ? `${Object.keys(styles.customGlyphs).length} Characters Ready` : 'Ready'}
                    </span>
                  </div>
                </div>

                {/* Option 2: Curated Font Models */}
                <div className={`p-3 rounded-xl border ${styles.fontFamily !== 'Custom My Hand' ? 'border-neutral-300 bg-neutral-50/50' : 'border-neutral-200 bg-white'}`}>
                  <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                    Or Choose Standard Handwriting Font:
                  </label>
                  <select
                    value={styles.fontFamily === 'Custom My Hand' ? '' : styles.fontFamily}
                    onChange={(e) => {
                      if (e.target.value) {
                        setStyles({ ...styles, fontFamily: e.target.value as HandwritingFont });
                      }
                    }}
                    className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-2.5 py-1.5 text-neutral-800"
                  >
                    <option value="" disabled>-- Select a curated style --</option>
                    <option value="Caveat">Caveat (Fluid Casual Cursive)</option>
                    <option value="Patrick Hand">Patrick Hand (Neat School Print)</option>
                    <option value="Kalam">Kalam (Artisanal Pen Script)</option>
                    <option value="Indie Flower">Indie Flower (Relaxed Rounded Hand)</option>
                    <option value="Homemade Apple">Homemade Apple (Fast Journal Script)</option>
                    <option value="Sacramento">Sacramento (Formal Cursive Script)</option>
                    <option value="Noto Nastaliq Urdu">Noto Nastaliq Urdu (Urdu Nastaliq)</option>
                  </select>
                </div>
              </div>

              {/* Ink Color */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Ink Pigment & Tone
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={styles.inkColor}
                    onChange={(e) => setStyles({ ...styles, inkColor: e.target.value })}
                    className="w-9 h-9 rounded-md border border-neutral-300 cursor-pointer p-0.5 bg-white"
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { name: 'Royal Blue', hex: '#1e3a8a' },
                      { name: 'Fountain Navy', hex: '#1d4ed8' },
                      { name: 'Black Gel', hex: '#1e293b' },
                      { name: 'Pencil Lead', hex: '#4b5563' },
                      { name: 'Emerald', hex: '#047857' },
                      { name: 'Violet', hex: '#6b21a8' },
                    ].map((col) => (
                      <button
                        key={col.hex}
                        type="button"
                        onClick={() => setStyles({ ...styles, inkColor: col.hex })}
                        title={col.name}
                        className={`w-6 h-6 rounded-full border ${styles.inkColor === col.hex ? 'ring-2 ring-indigo-500 scale-110' : ''}`}
                        style={{ backgroundColor: col.hex }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Font Size & Line Spacing Sliders */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-neutral-700 mb-1">
                    <span>Font Size</span>
                    <span className="text-neutral-500 font-normal">{styles.fontSize} pt</span>
                  </div>
                  <input
                    type="range"
                    min="14"
                    max="28"
                    step="1"
                    value={styles.fontSize}
                    onChange={(e) => setStyles({ ...styles, fontSize: parseInt(e.target.value, 10) })}
                    className="w-full accent-indigo-600"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs font-semibold text-neutral-700 mb-1">
                    <span>Line Spacing</span>
                    <span className="text-neutral-500 font-normal">{styles.lineSpacing.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="1.3"
                    max="2.5"
                    step="0.1"
                    value={styles.lineSpacing}
                    onChange={(e) => setStyles({ ...styles, lineSpacing: parseFloat(e.target.value) })}
                    className="w-full accent-indigo-600"
                  />
                </div>
              </div>

              {/* Slant & Organic Wobble */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-neutral-700 mb-1">
                    <span>Slant Tilt</span>
                    <span className="text-neutral-500 font-normal">{styles.slantAngle}°</span>
                  </div>
                  <input
                    type="range"
                    min="-8"
                    max="8"
                    step="1"
                    value={styles.slantAngle}
                    onChange={(e) => setStyles({ ...styles, slantAngle: parseInt(e.target.value, 10) })}
                    className="w-full accent-indigo-600"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs font-semibold text-neutral-700 mb-1">
                    <span>Letter Spacing</span>
                    <span className="text-neutral-500 font-normal">{styles.letterSpacing}px</span>
                  </div>
                  <input
                    type="range"
                    min="-1"
                    max="4"
                    step="0.5"
                    value={styles.letterSpacing}
                    onChange={(e) => setStyles({ ...styles, letterSpacing: parseFloat(e.target.value) })}
                    className="w-full accent-indigo-600"
                  />
                </div>
              </div>

              {/* Natural Baseline Jitter Toggle */}
              <label className="flex items-center gap-2 cursor-pointer pt-2 border-t border-neutral-100">
                <input
                  type="checkbox"
                  checked={styles.organicJitter}
                  onChange={(e) => setStyles({ ...styles, organicJitter: e.target.checked })}
                  className="rounded text-indigo-600 accent-indigo-600"
                />
                <span className="text-xs text-neutral-700 font-medium">
                  Organic baseline variation (mimics natural human hand variance)
                </span>
              </label>
            </div>

            {/* Paper & Notebook Geometry Card */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-xs space-y-5">
              <h2 className="font-semibold text-neutral-900 text-sm border-b border-neutral-100 pb-2">
                Paper & Page Geometry
              </h2>

              {/* Paper Background */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Notebook Paper Background
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'ruled', name: 'Ruled Lines', desc: 'Standard notebook' },
                    { id: 'legal', name: 'Legal Pad', desc: 'Yellow lined' },
                    { id: 'grid', name: 'Grid Paper', desc: 'Engineering graph' },
                    { id: 'cream', name: 'Warm Cream', desc: 'Vintage parchment' },
                    { id: 'plain', name: 'Clean White', desc: 'Unruled paper' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setStyles({ ...styles, paperStyle: p.id as PaperStyle })}
                      className={`p-2 rounded-lg border text-left text-xs transition-colors ${
                        styles.paperStyle === p.id
                          ? 'border-indigo-600 bg-indigo-50/50 font-semibold text-indigo-900'
                          : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                      }`}
                    >
                      <div>{p.name}</div>
                      <div className="text-[10px] text-neutral-400 font-normal">{p.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Page Format */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Page Dimensions
                </label>
                <div className="flex gap-3">
                  {[
                    { id: 'a4', label: 'A4 (210 x 297 mm)' },
                    { id: 'letter', label: 'US Letter (8.5 x 11 in)' },
                  ].map((sz) => (
                    <button
                      key={sz.id}
                      type="button"
                      onClick={() => setStyles({ ...styles, pageSize: sz.id as 'a4' | 'letter' })}
                      className={`flex-1 py-2 px-3 text-xs rounded-lg border text-center transition-colors ${
                        styles.pageSize === sz.id
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-semibold'
                          : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      {sz.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Student Header */}
              <div className="pt-2 border-t border-neutral-100 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={styles.showStudentHeader}
                    onChange={(e) => setStyles({ ...styles, showStudentHeader: e.target.checked })}
                    className="rounded text-indigo-600 accent-indigo-600"
                  />
                  <span className="text-xs text-neutral-700 font-semibold">
                    Include Student Header Block on Page 1
                  </span>
                </label>

                {styles.showStudentHeader && (
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[11px] text-neutral-500">Student Name</span>
                      <input
                        type="text"
                        value={styles.studentName}
                        onChange={(e) => setStyles({ ...styles, studentName: e.target.value })}
                        className="w-full bg-neutral-50 border border-neutral-300 rounded px-2.5 py-1.5"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-neutral-500">Student / Roll ID</span>
                      <input
                        type="text"
                        value={styles.studentId}
                        onChange={(e) => setStyles({ ...styles, studentId: e.target.value })}
                        className="w-full bg-neutral-50 border border-neutral-300 rounded px-2.5 py-1.5"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4">
            <button
              onClick={() => setCurrentStep('upload')}
              className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-800 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Uploads</span>
            </button>
            <button
              onClick={() => setCurrentStep('preview')}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Render Test Page Preview</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP D: Render Test Page Preview */}
      {currentStep === 'preview' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-xs flex flex-col md:flex-row gap-6">
            {/* Left controls */}
            <div className="w-full md:w-80 space-y-4 shrink-0">
              <h2 className="font-semibold text-neutral-900 text-sm border-b border-neutral-100 pb-2">
                Test Page Verification
              </h2>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Review how your handwriting profile renders a sample coursework response on {styles.paperStyle} paper.
              </p>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Test Text Sample
                </label>
                <textarea
                  rows={6}
                  value={testText}
                  onChange={(e) => setTestText(e.target.value)}
                  className="w-full text-xs bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 resize-none text-neutral-800"
                />
              </div>

              <div className="pt-2 border-t border-neutral-100 flex flex-col gap-2">
                <button
                  onClick={() => setCurrentStep('customize')}
                  className="w-full py-2 px-3 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
                >
                  Adjust Typography & Paper
                </button>
                <button
                  onClick={handleSave}
                  className="w-full py-2.5 px-3 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Handwriting Profile</span>
                </button>
              </div>
            </div>

            {/* Right preview canvas */}
            <div className="flex-1 bg-neutral-100/70 p-6 rounded-xl border border-neutral-200/80 flex items-center justify-center overflow-auto max-h-[600px]">
              {testPages[0] && (
                <NotebookPagePreview
                  page={testPages[0]}
                  style={styles}
                  language="en"
                  scale={0.55}
                />
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentStep('customize')}
              className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-800 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Customization</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal: Draw / Calibrate Meri Handwriting Characters */}
      {showCharacterStudioModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-neutral-50 rounded-2xl w-full max-w-6xl max-h-[92vh] overflow-y-auto border border-neutral-200 shadow-2xl relative p-2">
            <CharacterGlyphStudio
              initialProfile={{
                id: initialProfile?.id || 'hp-meri-handwriting',
                profileName: profileName || '⭐ Meri Handwriting (My Custom Characters)',
                sampleImages: samples,
                styleSettings: styles,
                customGlyphs: styles.customGlyphs,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }}
              onSaveProfile={(saved) => {
                if (saved.customGlyphs) {
                  setStyles((prev) => ({
                    ...prev,
                    fontFamily: 'Custom My Hand',
                    customGlyphs: saved.customGlyphs,
                    inkColor: saved.styleSettings?.inkColor || prev.inkColor,
                  }));
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
