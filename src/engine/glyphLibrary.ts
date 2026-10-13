/**
 * Character Glyph Library & Generator
 * Provides character sets for Capital Letters, Small Letters, Numbers, Punctuation,
 * and Mathematics / Sciences symbols, with horizontal trimming,
 * proportional kerning tables, and offscreen stroke generators for custom handwriting.
 */

export const ALPHABET_UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
export const ALPHABET_LOWER = 'abcdefghijklmnopqrstuvwxyz'.split('');
export const NUMBERS = '0123456789'.split('');

export const MATH_SCIENCE_SYMBOLS = [
  '+', '-', '×', '÷', '=', '≠', '±', '<', '>', '≤', '≥',
  '√', 'π', 'θ', 'α', 'β', 'λ', 'Δ', '∑', '∫', '∞', '°',
  '%', '^', '≈', '→', '²', '³', '∂', 'μ', 'Ω'
];

export const PUNCTUATION = [
  '.', ',', '!', '?', ':', ';', "'", '"', '-', '—',
  '(', ')', '[', ']', '{', '}', '/', '\\', '@', '#',
  '$', '&', '*', '_', '~'
];

export const URDU_LETTERS = [
  'ا', 'ب', 'پ', 'ت', 'ٹ', 'ث', 'ج', 'چ', 'ح', 'خ',
  'د', 'ڈ', 'ذ', 'ر', 'ڑ', 'ز', 'ژ', 'س', 'ش', 'ص',
  'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ک', 'گ', 'ل',
  'م', 'ن', 'و', 'ہ', 'ء', 'ی', 'ے'
];

export const ALL_CALIBRATION_CHARS = [
  ...ALPHABET_UPPER,
  ...ALPHABET_LOWER,
  ...NUMBERS,
  ...MATH_SCIENCE_SYMBOLS,
  ...PUNCTUATION,
];

export interface RequirementCategory {
  id: 'lower' | 'upper' | 'num' | 'math' | 'punct' | 'urdu';
  label: string;
  urduLabel: string;
  characters: string[];
  requiredCount: number;
}

export const CHARACTER_REQUIREMENT_CATEGORIES: RequirementCategory[] = [
  {
    id: 'lower',
    label: 'Small Letters (a - z)',
    urduLabel: 'چھوٹے حروف (a - z)',
    characters: ALPHABET_LOWER,
    requiredCount: 26,
  },
  {
    id: 'upper',
    label: 'Capital Letters (A - Z)',
    urduLabel: 'بڑے حروف (A - Z)',
    characters: ALPHABET_UPPER,
    requiredCount: 26,
  },
  {
    id: 'num',
    label: 'Numbers (0 - 9)',
    urduLabel: 'ہندسے (0 - 9)',
    characters: NUMBERS,
    requiredCount: 10,
  },
  {
    id: 'math',
    label: 'Math & Science (+, =, √, π, ∫, ∑)',
    urduLabel: 'ریاضی اور سائنسی علامات',
    characters: MATH_SCIENCE_SYMBOLS,
    requiredCount: MATH_SCIENCE_SYMBOLS.length,
  },
  {
    id: 'punct',
    label: 'Punctuation & Symbols (. , ! ?)',
    urduLabel: 'علامات اور رموز',
    characters: PUNCTUATION,
    requiredCount: PUNCTUATION.length,
  },
  {
    id: 'urdu',
    label: 'Urdu Letters (ا ب ت)',
    urduLabel: 'اردو حروف تہجی',
    characters: URDU_LETTERS,
    requiredCount: URDU_LETTERS.length,
  },
];

export interface RequirementStatus {
  totalRequired: number;
  totalCaptured: number;
  percentage: number;
  isFullyComplete: boolean;
  missingCount: number;
  categoryStats: {
    id: 'lower' | 'upper' | 'num' | 'math' | 'punct' | 'urdu';
    label: string;
    required: number;
    captured: number;
    isComplete: boolean;
  }[];
}

export function getCharacterRequirementsStatus(
  glyphs: Record<string, string> = {}
): RequirementStatus {
  const categoryStats = CHARACTER_REQUIREMENT_CATEGORIES.map((cat) => {
    const captured = cat.characters.filter((ch) => Boolean(glyphs[ch])).length;
    return {
      id: cat.id,
      label: cat.label,
      required: cat.requiredCount,
      captured,
      isComplete: captured >= cat.requiredCount,
    };
  });

  const totalRequired = ALL_CALIBRATION_CHARS.length;
  const totalCaptured = ALL_CALIBRATION_CHARS.filter((ch) => Boolean(glyphs[ch])).length;
  const percentage = Math.round((totalCaptured / totalRequired) * 100);

  return {
    totalRequired,
    totalCaptured,
    percentage,
    isFullyComplete: totalCaptured >= totalRequired,
    missingCount: Math.max(0, totalRequired - totalCaptured),
    categoryStats,
  };
}

/**
 * Natural proportional width-to-height ratios for characters in handwriting
 * Used for proportional spacing, kerning, and PDF/canvas rendering
 */
export const CHAR_PROPORTIONS: Record<string, number> = {
  // Narrow characters (slender ink strokes)
  i: 0.16,
  l: 0.18,
  j: 0.20,
  t: 0.22,
  f: 0.22,
  r: 0.26,
  I: 0.20,
  '!': 0.15,
  '.': 0.14,
  ',': 0.14,
  ':': 0.14,
  ';': 0.16,
  "'": 0.12,
  '"': 0.20,
  '|': 0.14,
  '1': 0.22,
  '-': 0.24,
  '—': 0.44,
  '(': 0.20,
  ')': 0.20,
  '[': 0.20,
  ']': 0.20,
  '{': 0.22,
  '}': 0.22,
  '/': 0.28,
  '\\': 0.28,

  // Standard lowercase characters
  a: 0.32,
  b: 0.34,
  c: 0.30,
  d: 0.34,
  e: 0.30,
  g: 0.32,
  h: 0.34,
  k: 0.32,
  n: 0.33,
  o: 0.32,
  p: 0.34,
  q: 0.34,
  s: 0.28,
  u: 0.33,
  v: 0.30,
  x: 0.30,
  y: 0.32,
  z: 0.28,

  // Numbers
  '0': 0.32,
  '2': 0.32,
  '3': 0.31,
  '4': 0.33,
  '5': 0.31,
  '6': 0.32,
  '7': 0.31,
  '8': 0.32,
  '9': 0.32,

  // Mathematical & Science symbols
  '+': 0.32,
  '=': 0.32,
  '≠': 0.32,
  '±': 0.32,
  '×': 0.30,
  '÷': 0.32,
  '<': 0.30,
  '>': 0.30,
  '≤': 0.32,
  '≥': 0.32,
  '√': 0.36,
  'π': 0.32,
  'θ': 0.32,
  'α': 0.32,
  'β': 0.34,
  'λ': 0.32,
  'Δ': 0.36,
  '∑': 0.38,
  '∫': 0.26,
  '∞': 0.44,
  '°': 0.18,
  '%': 0.40,
  '^': 0.24,
  '≈': 0.32,
  '→': 0.42,
  '²': 0.20,
  '³': 0.20,
  '∂': 0.30,
  'μ': 0.34,
  'Ω': 0.38,

  // Other symbols
  '@': 0.44,
  '#': 0.36,
  '$': 0.34,
  '&': 0.40,
  '*': 0.26,
  '_': 0.32,
  '~': 0.30,
  '?': 0.28,

  // Uppercase standard
  A: 0.40,
  B: 0.38,
  C: 0.38,
  D: 0.40,
  E: 0.36,
  F: 0.35,
  G: 0.42,
  H: 0.42,
  J: 0.30,
  K: 0.40,
  L: 0.34,
  N: 0.42,
  O: 0.42,
  P: 0.36,
  Q: 0.42,
  R: 0.38,
  S: 0.34,
  T: 0.36,
  U: 0.40,
  V: 0.38,
  X: 0.38,
  Y: 0.38,
  Z: 0.36,

  // Wide characters
  w: 0.48,
  m: 0.50,
  W: 0.54,
  M: 0.52,
};

// Global synchronous cache of exact pixel aspect ratios of glyphs
const GLYPH_RATIO_CACHE = new Map<string, number>();

/**
 * Gets the proportional width-to-height ratio for a character or its glyph
 */
export function getGlyphWidthRatio(char: string, glyphDataUrl?: string): number {
  if (glyphDataUrl && GLYPH_RATIO_CACHE.has(glyphDataUrl)) {
    return GLYPH_RATIO_CACHE.get(glyphDataUrl)!;
  }
  return CHAR_PROPORTIONS[char] || 0.34;
}

/**
 * Trims horizontal empty whitespace from a canvas while preserving vertical
 * alignment and baseline so characters sit tightly and naturally next to each other.
 */
export function trimCanvasHorizontally(
  sourceCanvas: HTMLCanvasElement,
  sidePadding: number = 2
): string {
  const ctx = sourceCanvas.getContext('2d');
  if (!ctx) return sourceCanvas.toDataURL('image/png');

  const width = sourceCanvas.width;
  const height = sourceCanvas.height;

  try {
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    let minX = width;
    let maxX = 0;
    let hasInk = false;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const alphaIndex = (y * width + x) * 4 + 3;
        // Consider pixels with opacity > 20 as ink
        if (data[alphaIndex] > 20) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          hasInk = true;
        }
      }
    }

    if (!hasInk) {
      // If blank/empty canvas, return standard narrow spacer
      const blankCanvas = document.createElement('canvas');
      blankCanvas.width = 16;
      blankCanvas.height = height;
      const url = blankCanvas.toDataURL('image/png');
      GLYPH_RATIO_CACHE.set(url, 16 / height);
      return url;
    }

    // Add tight optical side-bearing padding (2-3px)
    const cropLeft = Math.max(0, minX - sidePadding);
    const cropRight = Math.min(width, maxX + sidePadding + 1);
    const cropWidth = Math.max(6, cropRight - cropLeft);

    const croppedCanvas = document.createElement('canvas');
    croppedCanvas.width = cropWidth;
    croppedCanvas.height = height; // Full height preserves baseline identically
    const croppedCtx = croppedCanvas.getContext('2d');
    if (!croppedCtx) return sourceCanvas.toDataURL('image/png');

    croppedCtx.drawImage(
      sourceCanvas,
      cropLeft, 0, cropWidth, height,
      0, 0, cropWidth, height
    );

    const croppedDataUrl = croppedCanvas.toDataURL('image/png');
    GLYPH_RATIO_CACHE.set(croppedDataUrl, cropWidth / height);
    return croppedDataUrl;
  } catch {
    return sourceCanvas.toDataURL('image/png');
  }
}

/**
 * Trims horizontal whitespace of an existing dataURL image
 */
export function trimGlyphDataUrl(
  dataUrl: string,
  sidePadding: number = 2
): Promise<string> {
  return new Promise((resolve) => {
    if (typeof document === 'undefined' || !dataUrl) {
      resolve(dataUrl);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || 200;
      canvas.height = img.naturalHeight || 200;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }
      ctx.drawImage(img, 0, 0);
      const trimmed = trimCanvasHorizontally(canvas, sidePadding);
      resolve(trimmed);
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

/**
 * Trims all glyphs in a dictionary to eliminate character gaps across all assignments
 */
export async function trimAllGlyphs(
  glyphs: Record<string, string>,
  sidePadding: number = 2
): Promise<Record<string, string>> {
  const result: Record<string, string> = {};
  const entries = Object.entries(glyphs);

  for (const [char, dataUrl] of entries) {
    if (dataUrl) {
      result[char] = await trimGlyphDataUrl(dataUrl, sidePadding);
    }
  }

  return result;
}

/**
 * Creates an authentic handwritten glyph image for a character on an offscreen canvas
 * with tightly trimmed horizontal margins and precise baseline alignment.
 */
export function generateSyntheticHandwrittenGlyph(
  char: string,
  inkColor: string = '#1e3a8a',
  slant: number = 0
): string {
  if (typeof document === 'undefined') return '';

  const padWidth = 240;
  const padHeight = 240;
  const canvas = document.createElement('canvas');
  canvas.width = padWidth;
  canvas.height = padHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.clearRect(0, 0, padWidth, padHeight);

  // Apply subtle slant tilt
  ctx.save();
  ctx.translate(padWidth / 2, padHeight / 2);
  if (slant !== 0) {
    ctx.rotate((slant * Math.PI) / 180);
  }
  ctx.translate(-padWidth / 2, -padHeight / 2);

  ctx.fillStyle = inkColor;
  ctx.strokeStyle = inkColor;
  ctx.lineWidth = 2.4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';

  // Position baseline at 62% (Y = 148 out of 240) to match lined notebook baseline exactly
  ctx.font = '86px "Caveat", "Indie Flower", "Kalam", sans-serif';
  ctx.fillText(char, padWidth / 2, 148);

  ctx.restore();

  // Tight crop horizontally so character advances naturally with zero dead space
  return trimCanvasHorizontally(canvas, 2);
}

/**
 * Generates a full baseline set of authentic handwritten character glyphs
 * with natural tight horizontal kerning and zero artificial gaps.
 */
export function generateDefaultGlyphSet(
  inkColor: string = '#1e3a8a',
  slant: number = 0
): Record<string, string> {
  const glyphMap: Record<string, string> = {};

  if (typeof document === 'undefined') return glyphMap;

  for (const char of ALL_CALIBRATION_CHARS) {
    glyphMap[char] = generateSyntheticHandwrittenGlyph(char, inkColor, slant);
  }

  return glyphMap;
}

/**
 * Ensures a glyph exists for a given character, either from user's glyphs or auto-synthesized
 */
export function getOrSynthesizeGlyph(
  char: string,
  glyphs?: Record<string, string>,
  inkColor: string = '#1e3a8a',
  slant: number = 0
): string {
  if (glyphs && glyphs[char]) {
    return glyphs[char];
  }
  return generateSyntheticHandwrittenGlyph(char, inkColor, slant);
}
