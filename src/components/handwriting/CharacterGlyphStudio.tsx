import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  HelpCircle,
  PenTool,
  RotateCcw,
  Trash2,
  CheckCircle2,
  Camera,
  Upload,
  Sparkles,
  Sliders,
  Check,
  Edit2,
  X,
  Sigma,
  Hash,
  Type,
  Palette,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Eraser,
  Save,
} from 'lucide-react';
import {
  ALL_CALIBRATION_CHARS,
  ALPHABET_UPPER,
  ALPHABET_LOWER,
  NUMBERS,
  MATH_SCIENCE_SYMBOLS,
  PUNCTUATION,
  URDU_LETTERS,
  CHARACTER_REQUIREMENT_CATEGORIES,
  generateDefaultGlyphSet,
  trimCanvasHorizontally,
  trimAllGlyphs,
  getOrSynthesizeGlyph,
  getGlyphWidthRatio,
} from '../../engine/glyphLibrary';
import { HandwritingProfile, StyleSettings, PenType } from '../../types';
import { DEFAULT_STYLE_SETTINGS } from '../../services/storageService';
import { geminiService } from '../../services/geminiService';
import { REALISTIC_PENS, PenPreset, getPenStyleProperties } from '../../engine/penSimulation';
import { FloatingToolDock, ToolDockItem } from '../common/FloatingToolDock';

interface CharacterGlyphStudioProps {
  initialProfile?: HandwritingProfile | null;
  onSaveProfile: (profile: Omit<HandwritingProfile, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => void;
  onBack: () => void;
}

export const CharacterGlyphStudio: React.FC<CharacterGlyphStudioProps> = ({
  initialProfile,
  onSaveProfile,
  onBack,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'lower' | 'upper' | 'num' | 'math' | 'punct' | 'urdu'>('lower');
  const [selectedChar, setSelectedChar] = useState<string>('a');
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Active Tool Dock Item: 'pen' | 'ink' | 'brush' | 'sliders' | 'ai' | null
  const [activeToolDrawer, setActiveToolDrawer] = useState<string | null>(null);

  // Pen type simulation in studio
  const [selectedPenType, setSelectedPenType] = useState<PenType>(
    initialProfile?.styleSettings?.penType || 'fountain'
  );

  // Slant and organic wobble
  const [slantAngle, setSlantAngle] = useState<number>(
    initialProfile?.styleSettings?.slantAngle ?? -4
  );
  const [wobble, setWobble] = useState<number>(20);
  const [selectedTool, setSelectedTool] = useState<'pen' | 'eraser'>('pen');

  // Stored glyphs (map of char -> dataURL)
  const [glyphs, setGlyphs] = useState<Record<string, string>>(() => {
    if (initialProfile?.customGlyphs && Object.keys(initialProfile.customGlyphs).length > 0) {
      return initialProfile.customGlyphs;
    }
    return generateDefaultGlyphSet(initialProfile?.styleSettings?.inkColor || '#1e3a8a');
  });

  // Test preview text
  const [testText, setTestText] = useState('Newton: F = ma, E = mc², a² + b² = c², π ≈ 3.1415');

  // Canvas drawing state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penThickness, setPenThickness] = useState<number>(
    REALISTIC_PENS[initialProfile?.styleSettings?.penType || 'fountain'].brushSize
  );
  const [penColor, setPenColor] = useState<string>(
    initialProfile?.styleSettings?.inkColor || '#1e3a8a'
  );
  const [strokesHistory, setStrokesHistory] = useState<string[]>([]);
  const [savedSuccessMsg, setSavedSuccessMsg] = useState<string | null>(null);

  // Photo upload & AI vision state
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState(false);
  const [photoAnalysisNotice, setPhotoAnalysisNotice] = useState<string | null>(null);

  // Current pen preset
  const penPreset = REALISTIC_PENS[selectedPenType] || REALISTIC_PENS.fountain;

  // Auto-trim initial glyphs
  useEffect(() => {
    let active = true;
    trimAllGlyphs(glyphs, 2).then((trimmed) => {
      if (active) {
        setGlyphs(trimmed);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  // Update brush when pen type changes
  const handleSelectPenType = (pType: PenType) => {
    setSelectedPenType(pType);
    const p = REALISTIC_PENS[pType];
    setPenThickness(p.brushSize);
    setPenColor(p.defaultInkColor);
  };

  // When selectedChar changes, load it onto the canvas
  useEffect(() => {
    loadCharToCanvas(selectedChar);
  }, [selectedChar]);

  const loadCharToCanvas = (char: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setStrokesHistory([]);

    const padSource = glyphs[char];
    if (padSource) {
      const img = new Image();
      img.onload = () => {
        const drawX = Math.round((canvas.width - img.naturalWidth) / 2);
        const drawY = Math.round((canvas.height - img.naturalHeight) / 2);
        ctx.drawImage(img, drawX > 0 ? drawX : 0, drawY > 0 ? drawY : 0);
        setStrokesHistory([canvas.toDataURL()]);
      };
      img.src = padSource;
    }
  };

  // Canvas Drawing Handlers
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * (canvas.width / rect.width),
        y: (touch.clientY - rect.top) * (canvas.height / rect.height),
      };
    }

    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasCoords(e);
    ctx.beginPath();
    ctx.moveTo(x, y);

    if (selectedTool === 'eraser') {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = penThickness * 4;
      ctx.globalAlpha = 1.0;
    } else {
      ctx.strokeStyle = penColor;
      ctx.lineWidth = penThickness;
      ctx.globalAlpha = penPreset.brushAlpha;
    }

    ctx.lineCap = selectedPenType === 'marker' ? 'square' : 'round';
    ctx.lineJoin = 'round';
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasCoords(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    setStrokesHistory((prev) => [...prev, dataUrl]);

    // Trim horizontally for tight kerning
    const trimmedDataUrl = trimCanvasHorizontally(canvas, 2);

    setGlyphs((prev) => ({
      ...prev,
      [selectedChar]: trimmedDataUrl,
    }));
  };

  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setStrokesHistory([]);

    setGlyphs((prev) => {
      const copy = { ...prev };
      delete copy[selectedChar];
      return copy;
    });
  };

  const handleUndo = () => {
    if (strokesHistory.length <= 1) {
      handleClearCanvas();
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const newHistory = strokesHistory.slice(0, -1);
    setStrokesHistory(newHistory);
    const previousState = newHistory[newHistory.length - 1];

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const trimmed = trimCanvasHorizontally(canvas, 2);
      setGlyphs((prev) => ({
        ...prev,
        [selectedChar]: trimmed,
      }));
    };
    img.src = previousState;
  };

  // Stepper to next/prev character in current category
  const activeCategoryConfig = CHARACTER_REQUIREMENT_CATEGORIES.find((c) => c.id === selectedCategory);
  const activeChars = activeCategoryConfig ? activeCategoryConfig.characters : ALPHABET_LOWER;
  const currentCharIndex = activeChars.indexOf(selectedChar);

  const handleNextChar = () => {
    if (currentCharIndex < activeChars.length - 1) {
      setSelectedChar(activeChars[currentCharIndex + 1]);
    } else {
      // Jump to next category if available
      const catOrder: (typeof selectedCategory)[] = ['lower', 'upper', 'num', 'math', 'punct', 'urdu'];
      const currentCatIdx = catOrder.indexOf(selectedCategory);
      if (currentCatIdx < catOrder.length - 1) {
        const nextCat = catOrder[currentCatIdx + 1];
        setSelectedCategory(nextCat);
        const nextChars = CHARACTER_REQUIREMENT_CATEGORIES.find((c) => c.id === nextCat)?.characters || [];
        if (nextChars.length > 0) setSelectedChar(nextChars[0]);
      }
    }
  };

  const handlePrevChar = () => {
    if (currentCharIndex > 0) {
      setSelectedChar(activeChars[currentCharIndex - 1]);
    }
  };

  // Upload Photo Sample & Extract Characteristics via Gemini
  const handleUploadNotebookPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzingPhoto(true);
    setPhotoAnalysisNotice('Analyzing handwriting sample image with AI...');

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = (event.target?.result as string)?.split(',')[1];
        if (!base64) {
          setIsAnalyzingPhoto(false);
          return;
        }

        const res = await geminiService.analyzeHandwriting(base64, file.type || 'image/jpeg');

        if (res.detectedInkColor) {
          setPenColor(res.detectedInkColor);
        }
        setPhotoAnalysisNotice(
          `Handwriting analyzed! Detected ink: ${res.detectedInkColor || 'Classic Blue'}, style: ${res.handwritingStyle || 'Natural'} (Clarity: ${res.clarityScore || 'Good'}). Click any character below to draw.`
        );
        setIsAnalyzingPhoto(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setIsAnalyzingPhoto(false);
      setPhotoAnalysisNotice('Upload completed.');
    }
  };

  // Save Handwriting Profile
  const handleSaveHandwriting = () => {
    const newStyle: StyleSettings = {
      ...(initialProfile?.styleSettings || DEFAULT_STYLE_SETTINGS),
      fontFamily: 'Custom My Hand',
      inkColor: penColor,
      penType: selectedPenType,
      slantAngle,
      organicJitter: wobble > 0,
      customGlyphs: glyphs,
    };

    onSaveProfile({
      id: initialProfile?.id || 'hp-meri-handwriting',
      profileName: '⭐ Meri Handwriting (My Custom Characters)',
      sampleImages: initialProfile?.sampleImages || [],
      styleSettings: newStyle,
      customGlyphs: glyphs,
      analysisNotes: {
        clarityScore: 'Personal Glyphs',
        estimatedSlant: slantAngle,
        detectedInkColor: penColor,
        handwritingStyle: 'Meri Handwriting (Personal Custom Characters)',
        notes: `Calibrated with ${Object.keys(glyphs).length} personal characters including Math, Science, and Alphabets.`,
      },
    });

    setSavedSuccessMsg('Handwriting saved successfully!');
    setTimeout(() => {
      setSavedSuccessMsg(null);
      onBack();
    }, 1500);
  };

  const penProps = getPenStyleProperties(selectedPenType, penColor);

  // Tool Dock items configuration for Character Studio
  const dockItems: ToolDockItem[] = [
    {
      id: 'pen',
      label: 'Pens & Brushes',
      shortLabel: penPreset.shortLabel,
      icon: <PenTool className="w-5 h-5 text-indigo-400" />,
      tooltip: `Instrument: ${penPreset.name}`,
    },
    {
      id: 'ink',
      label: 'Ink Palette',
      shortLabel: 'Ink',
      icon: (
        <span
          className="w-4 h-4 rounded-full border border-white/40 shadow-xs"
          style={{ backgroundColor: penColor }}
        />
      ),
      activeIndicatorColor: penColor,
      tooltip: 'Select ink color',
    },
    {
      id: 'brush',
      label: 'Brush & Eraser',
      shortLabel: 'Brush',
      icon: selectedTool === 'eraser' ? <Eraser className="w-5 h-5 text-rose-400" /> : <Sliders className="w-5 h-5 text-teal-400" />,
      tooltip: 'Brush size and tool mode',
    },
    {
      id: 'sliders',
      label: 'Slant & Jitter',
      shortLabel: 'Physics',
      icon: <Sliders className="w-5 h-5 text-amber-400" />,
      tooltip: 'Slant tilt and wobble',
    },
    {
      id: 'ai',
      label: 'AI Photo Scanner',
      shortLabel: 'AI Scan',
      icon: <Camera className="w-5 h-5 text-sky-400" />,
      tooltip: 'Extract handwriting from notebook image',
    },
  ];

  // Drawer Content renderer
  const renderDrawerContent = (activeId: string) => {
    switch (activeId) {
      case 'pen':
        return (
          <div className="space-y-3">
            <p className="text-[11px] text-stone-500 leading-relaxed">
              Choose your pen instrument. The stroke width, ink bleed, and texture will apply to your custom handwriting:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {(Object.values(REALISTIC_PENS) as PenPreset[]).map((p) => {
                const isSelected = selectedPenType === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectPenType(p.id)}
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
              <div className="text-[11px] font-semibold text-stone-700">Active: {penPreset.name}</div>
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
                Recommended Inks for {penPreset.name}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {penPreset.suggestedColors.map((col) => {
                  const isSelected = penColor === col.hex;
                  return (
                    <button
                      key={col.hex}
                      type="button"
                      onClick={() => setPenColor(col.hex)}
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
                <span className="text-[10px] text-stone-500 font-mono">{penColor}</span>
              </div>
              <input
                type="color"
                value={penColor}
                onChange={(e) => setPenColor(e.target.value)}
                className="w-8 h-8 rounded-lg cursor-pointer border border-stone-300 p-0"
              />
            </div>
          </div>
        );

      case 'brush':
        return (
          <div className="space-y-4">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSelectedTool('pen')}
                className={`flex-1 p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  selectedTool === 'pen'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                }`}
              >
                <PenTool className="w-4 h-4" />
                <span>Pen Draw</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedTool('eraser')}
                className={`flex-1 p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  selectedTool === 'eraser'
                    ? 'border-rose-600 bg-rose-50 text-rose-700'
                    : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                }`}
              >
                <Eraser className="w-4 h-4" />
                <span>Eraser</span>
              </button>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-stone-700">
                <span>Stroke Thickness</span>
                <span className="font-mono">{penThickness}px</span>
              </div>
              <input
                type="range"
                min="1"
                max="12"
                step="0.5"
                value={penThickness}
                onChange={(e) => setPenThickness(parseFloat(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>

            <div className="pt-2 border-t border-stone-100 flex gap-2">
              <button
                type="button"
                onClick={handleUndo}
                className="flex-1 py-2 px-3 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-700 flex items-center justify-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Undo Stroke</span>
              </button>
              <button
                type="button"
                onClick={handleClearCanvas}
                className="flex-1 py-2 px-3 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-xs font-semibold text-rose-700 flex items-center justify-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Glyph</span>
              </button>
            </div>
          </div>
        );

      case 'sliders':
        return (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-stone-700">
                <span>Handwriting Slant Tilt</span>
                <span className="font-mono">{slantAngle}°</span>
              </div>
              <input
                type="range"
                min="-15"
                max="15"
                value={slantAngle}
                onChange={(e) => setSlantAngle(parseInt(e.target.value, 10))}
                className="w-full accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-stone-400">
                <span>-15° Backward</span>
                <span>0° Upright</span>
                <span>+15° Forward</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-stone-700">
                <span>Organic Baseline Wobble</span>
                <span className="font-mono">{wobble}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={wobble}
                onChange={(e) => setWobble(parseInt(e.target.value, 10))}
                className="w-full accent-indigo-600"
              />
              <p className="text-[10px] text-stone-500">
                Adds authentic human variation so letters don't look like a computer font.
              </p>
            </div>
          </div>
        );

      case 'ai':
        return (
          <div className="space-y-3">
            <p className="text-[11px] text-stone-500 leading-relaxed">
              Take a photo of your handwritten paper or calibration sheet. AI will analyze your ink color, handwriting slant, and style characteristics.
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUploadNotebookPhoto}
            />

            <button
              disabled={isAnalyzingPhoto}
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-3.5 bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
            >
              <Upload className="w-4 h-4 text-sky-600" />
              <span>{isAnalyzingPhoto ? 'Analyzing with AI...' : 'Upload Handwriting Photo'}</span>
            </button>

            {photoAnalysisNotice && (
              <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-700">
                {photoAnalysisNotice}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-stone-100/90 flex flex-col relative select-none pb-24 md:pb-6">
      {/* Toast Notice */}
      {savedSuccessMsg && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 p-2.5 px-4 bg-emerald-600 text-white rounded-full text-xs font-semibold flex items-center gap-2 shadow-xl backdrop-blur-sm animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
          <span>{savedSuccessMsg}</span>
        </div>
      )}

      {/* Slim Top Navigation Bar: Clean & Minimal ("work should be front, others inside icons") */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200/80 px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2 shadow-2xs">
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
              <span>Meri Handwriting Studio</span>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 rounded-md shrink-0">
                {Object.keys(glyphs).length} Glyphs
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowHelpModal(true)}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-100 transition-colors cursor-pointer"
            title="Handwriting calibration help"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button
            onClick={handleSaveHandwriting}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Handwriting</span>
          </button>
        </div>
      </div>

      {/* Hero Canvas Stage: Drawing Stage & Glyph Matrix FRONT AND CENTER */}
      <div className="flex-1 overflow-auto flex flex-col items-center justify-start p-3 sm:p-6 max-w-4xl mx-auto w-full space-y-4 pb-28 sm:pb-8">
        {/* Active Character Drawing Stage */}
        <div className="w-full bg-white rounded-2xl border border-stone-200/90 shadow-sm p-4 sm:p-6 flex flex-col md:flex-row items-center gap-6">
          {/* Canvas Area */}
          <div className="flex flex-col items-center shrink-0">
            <div className="relative border-2 border-dashed border-stone-300 rounded-2xl bg-stone-50/60 p-2 overflow-hidden shadow-inner">
              {/* Baseline & x-height guidelines */}
              <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 opacity-40">
                <div className="w-full border-b border-indigo-300 border-dashed" style={{ marginTop: '25%' }} />
                <div className="w-full border-b-2 border-red-400" style={{ marginBottom: '22%' }} />
              </div>

              {/* Ghost Guide Character */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-15 text-stone-500 font-serif text-8xl">
                {selectedChar}
              </div>

              {/* Drawing Canvas */}
              <canvas
                ref={canvasRef}
                width={200}
                height={200}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-[200px] h-[200px] touch-none cursor-crosshair relative z-10"
                style={{
                  filter: penProps.filter,
                }}
              />
            </div>

            {/* Stepper & Canvas Actions under drawing box */}
            <div className="flex items-center gap-2 mt-3 w-full justify-between">
              <button
                disabled={currentCharIndex <= 0}
                onClick={handlePrevChar}
                className="p-1.5 text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-40"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Prev</span>
              </button>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleUndo}
                  className="p-1.5 text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg text-xs font-semibold cursor-pointer"
                  title="Undo stroke"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleClearCanvas}
                  className="p-1.5 text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 rounded-lg text-xs font-semibold cursor-pointer"
                  title="Clear character"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={handleNextChar}
                className="p-1.5 px-2.5 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer shadow-xs"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Character Guide & Live Stroke Feedback */}
          <div className="flex-1 space-y-3 w-full">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <div>
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                  Active Character
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-stone-900">{selectedChar}</span>
                  <span className="text-xs text-stone-500">
                    Category: <strong className="capitalize text-stone-700">{selectedCategory}</strong>
                  </span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="text-right">
                {glyphs[selectedChar] ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <Check className="w-3 h-3" />
                    <span>Captured</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-stone-100 text-stone-600 border border-stone-200">
                    <span>Draw Above</span>
                  </span>
                )}
              </div>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              Draw letter <strong>{selectedChar}</strong> in your natural handwriting inside the box. Draw between the top dashed guideline and red baseline.
            </p>

            {/* Live Real Pen Simulator Info */}
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">
                  {selectedPenType === 'ballpoint' && '🖊️'}
                  {selectedPenType === 'gel' && '🖋️'}
                  {selectedPenType === 'fountain' && '✒️'}
                  {selectedPenType === 'marker' && '🖍️'}
                  {selectedPenType === 'rollerball' && '🖌️'}
                  {selectedPenType === 'fineliner' && '📏'}
                  {selectedPenType === 'pencil' && '✏️'}
                </span>
                <div>
                  <div className="text-xs font-bold text-stone-800">
                    {penPreset.name} applied to your handwriting
                  </div>
                  <div className="text-[10px] text-stone-500">
                    {penPreset.shortLabel} • {penThickness}px thickness • {penColor}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveToolDrawer('pen')}
                className="px-2.5 py-1 text-[11px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 cursor-pointer"
              >
                Change Pen
              </button>
            </div>
          </div>
        </div>

        {/* Live Sentence Preview Card (Shows instant impact of Pen + Custom Glyphs) */}
        <div className="w-full bg-white rounded-2xl border border-stone-200/90 shadow-sm p-4 sm:p-5 space-y-2">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
              <span>Live Handwriting & Pen Simulation Preview</span>
              <span className="text-[10px] font-normal text-stone-400 hidden sm:inline">
                (Type below to test your letters)
              </span>
            </span>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {penPreset.shortLabel} Physics Active
            </span>
          </div>

          {/* Test sentence input */}
          <input
            type="text"
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-700 focus:outline-none focus:border-indigo-500"
            placeholder="Type sample text to test your letters..."
          />

          {/* Rendered Live Handwritten Line */}
          <div className="p-4 bg-[#fefaec] rounded-xl border border-amber-200/80 shadow-inner overflow-x-auto min-h-[60px] flex items-baseline select-none">
            {testText.split('').map((char, cIdx) => {
              if (char === ' ') {
                return <span key={cIdx} className="inline-block w-3 shrink-0" />;
              }
              const glyphUrl =
                glyphs[char] ||
                getOrSynthesizeGlyph(char, glyphs, penColor, slantAngle);

              if (glyphUrl) {
                const baseHeight = 24;
                const effectiveHeight = Math.round(baseHeight * penPreset.glyphScale);
                const widthRatio = getGlyphWidthRatio(char, glyphUrl);
                const effectiveWidth = Math.max(5, Math.round(effectiveHeight * widthRatio));

                return (
                  <span
                    key={cIdx}
                    className="inline-block shrink-0"
                    style={{
                      height: `${effectiveHeight}px`,
                      width: `${effectiveWidth}px`,
                      marginRight: '2px',
                      maskImage: `url("${glyphUrl}")`,
                      WebkitMaskImage: `url("${glyphUrl}")`,
                      maskSize: 'contain',
                      WebkitMaskSize: 'contain',
                      maskRepeat: 'no-repeat',
                      WebkitMaskRepeat: 'no-repeat',
                      maskPosition: 'center bottom',
                      WebkitMaskPosition: 'center bottom',
                      backgroundColor: penColor,
                      filter: penProps.filter,
                      opacity: penProps.opacity,
                      mixBlendMode: penProps.blendMode as any,
                      transform: `rotate(${slantAngle * 0.18}deg)`,
                    }}
                  />
                );
              }
              return (
                <span
                  key={cIdx}
                  className="font-serif text-lg leading-none"
                  style={{
                    color: penColor,
                    filter: penProps.filter,
                    transform: `rotate(${slantAngle * 0.18}deg)`,
                  }}
                >
                  {char}
                </span>
              );
            })}
          </div>
        </div>

        {/* Character Categories & Glyph Selection Grid */}
        <div className="w-full bg-white rounded-2xl border border-stone-200/90 shadow-sm p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              Glyph Calibration Library
            </h2>
            <span className="text-xs text-stone-500">
              Tap any letter to calibrate
            </span>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
            {CHARACTER_REQUIREMENT_CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id;
              const capturedInCat = cat.characters.filter((c) => !!glyphs[c]).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id as any);
                    if (cat.characters.length > 0) setSelectedChar(cat.characters[0]);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-stone-700 text-stone-200' : 'bg-stone-200 text-stone-600'
                    }`}
                  >
                    {capturedInCat}/{cat.characters.length}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Glyph Grid */}
          <div className="grid grid-cols-6 sm:grid-cols-9 md:grid-cols-12 gap-2">
            {activeChars.map((char) => {
              const isSelected = selectedChar === char;
              const hasGlyph = !!glyphs[char];
              return (
                <button
                  key={char}
                  onClick={() => setSelectedChar(char)}
                  className={`aspect-square rounded-xl border flex flex-col items-center justify-center p-1 relative transition-all cursor-pointer ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/90 ring-2 ring-indigo-400 shadow-xs'
                      : hasGlyph
                      ? 'border-emerald-200 bg-emerald-50/50 hover:border-emerald-300'
                      : 'border-stone-200 bg-stone-50 hover:bg-stone-100'
                  }`}
                >
                  <span className="text-base font-semibold text-stone-800">{char}</span>
                  {hasGlyph && (
                    <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* UNIFIED FLOATING TOOL DOCK */}
      <FloatingToolDock
        items={dockItems}
        activeItemId={activeToolDrawer}
        onSelectItem={(id) => setActiveToolDrawer(id)}
        renderDrawerContent={renderDrawerContent}
        title="Character Studio Tools"
      />

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h3 className="text-base font-bold text-stone-900">How to Calibrate Your Handwriting</h3>
              <button
                onClick={() => setShowHelpModal(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs text-stone-600 leading-relaxed">
              <p>
                <strong>1. Draw Your Characters:</strong> Click any letter from the categories (small, capital, numbers, math symbols). Draw it naturally in the drawing box.
              </p>
              <p>
                <strong>2. Real Pen Simulation:</strong> Open the floating tools dock to pick Marker, Gel, Fountain, or Pencil. Each pen affects your stroke thickness and text appearance.
              </p>
              <p>
                <strong>3. Full Character Set:</strong> Calibrate math & science symbols (π, ∑, ∫, √, α, β, etc.) and punctuation so all assignments render authentically.
              </p>
            </div>
            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
