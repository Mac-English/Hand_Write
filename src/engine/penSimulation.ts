import { PenType } from '../types';

export interface PenPreset {
  id: PenType;
  name: string;
  nameUrdu: string;
  shortLabel: string;
  description: string;
  defaultStrokeWidth: number;
  defaultInkColor: string;
  suggestedColors: { name: string; hex: string }[];
  cssFilter: string;
  textShadow: string;
  opacity: number;
  fontWeight: number;
  glyphScale: number;
  blendMode: 'multiply' | 'normal';
  letterSpacingBonus: number;
  brushSize: number; // for drawing canvas
  brushAlpha: number;
}

export const REALISTIC_PENS: Record<PenType, PenPreset> = {
  ballpoint: {
    id: 'ballpoint',
    name: 'Ballpoint Pen',
    nameUrdu: 'بال پوائنٹ پین',
    shortLabel: 'Ballpoint',
    description: 'Everyday oil-based ink with authentic ball-bearing micro-texture and subtle pressure variation.',
    defaultStrokeWidth: 1.0,
    defaultInkColor: '#1d4ed8', // classic ballpoint blue
    suggestedColors: [
      { name: 'Ballpoint Blue', hex: '#1d4ed8' },
      { name: 'Ballpoint Black', hex: '#1e293b' },
      { name: 'Ballpoint Red', hex: '#b91c1c' },
      { name: 'Ballpoint Green', hex: '#047857' },
    ],
    cssFilter: 'contrast(1.15) brightness(0.96)',
    textShadow: '0.2px 0.2px 0.3px rgba(0,0,0,0.18)',
    opacity: 0.95,
    fontWeight: 400,
    glyphScale: 1.0,
    blendMode: 'multiply',
    letterSpacingBonus: 0,
    brushSize: 2.2,
    brushAlpha: 0.95,
  },
  gel: {
    id: 'gel',
    name: 'Gel Pen',
    nameUrdu: 'جیل پین',
    shortLabel: 'Gel Pen',
    description: 'Smooth, vibrant, high-pigment gel ink with rich solid lines and rounded stroke edges.',
    defaultStrokeWidth: 1.3,
    defaultInkColor: '#0f172a', // deep midnight black
    suggestedColors: [
      { name: 'Deep Gel Black', hex: '#0f172a' },
      { name: 'Vivid Gel Blue', hex: '#1e40af' },
      { name: 'Gel Purple', hex: '#6b21a8' },
      { name: 'Gel Crimson', hex: '#991b1b' },
    ],
    cssFilter: 'contrast(1.3) drop-shadow(0 0 0.3px rgba(15,23,42,0.3))',
    textShadow: '0 0 0.4px rgba(0,0,0,0.25)',
    opacity: 0.99,
    fontWeight: 600,
    glyphScale: 1.08,
    blendMode: 'normal',
    letterSpacingBonus: -0.1,
    brushSize: 3.2,
    brushAlpha: 1.0,
  },
  fountain: {
    id: 'fountain',
    name: 'Ink Pen (Fountain)',
    nameUrdu: 'انک پین / فاؤنٹین',
    shortLabel: 'Ink Pen',
    description: 'Authentic liquid ink with expressive nib width and realistic two-tone ink pooling & shading.',
    defaultStrokeWidth: 1.5,
    defaultInkColor: '#1e3a8a', // classic royal blue
    suggestedColors: [
      { name: 'Royal Blue Ink', hex: '#1e3a8a' },
      { name: 'Quink Blue-Black', hex: '#1e3a5f' },
      { name: 'Vintage Sepia', hex: '#451a03' },
      { name: 'Emerald Ink', hex: '#064e3b' },
    ],
    cssFilter: 'contrast(1.22) drop-shadow(0 0.5px 0.5px rgba(30,58,138,0.28))',
    textShadow: '0 0.6px 0.8px rgba(30,58,138,0.3)',
    opacity: 0.94,
    fontWeight: 500,
    glyphScale: 1.06,
    blendMode: 'multiply',
    letterSpacingBonus: -0.2,
    brushSize: 3.6,
    brushAlpha: 0.94,
  },
  rollerball: {
    id: 'rollerball',
    name: 'Painter / Rollerball Pen',
    nameUrdu: 'پینٹر / رولر بال',
    shortLabel: 'Painter Pen',
    description: 'Fluid liquid ink that gently bleeds into notebook paper fibers for an organic hand-written finish.',
    defaultStrokeWidth: 1.6,
    defaultInkColor: '#1e293b',
    suggestedColors: [
      { name: 'Liquid Black', hex: '#1e293b' },
      { name: 'Cerulean Blue', hex: '#0284c7' },
      { name: 'Dark Indigo', hex: '#3730a3' },
      { name: 'Warm Mahogany', hex: '#7c2d12' },
    ],
    cssFilter: 'contrast(1.15) blur(0.18px) drop-shadow(0 0 0.4px rgba(0,0,0,0.18))',
    textShadow: '0 0 1px rgba(0,0,0,0.22)',
    opacity: 0.97,
    fontWeight: 600,
    glyphScale: 1.1,
    blendMode: 'multiply',
    letterSpacingBonus: -0.15,
    brushSize: 4.2,
    brushAlpha: 0.96,
  },
  marker: {
    id: 'marker',
    name: 'Marker / Highlighter',
    nameUrdu: 'مارکر پین / ہائی لائٹر',
    shortLabel: 'Marker',
    description: 'Bold chisel-edge strokes with rich saturated ink, soft fiber bleed, and heavy emphasis weight.',
    defaultStrokeWidth: 2.8,
    defaultInkColor: '#1e3a8a',
    suggestedColors: [
      { name: 'Bold Blue Marker', hex: '#1e3a8a' },
      { name: 'Bold Black Marker', hex: '#09090b' },
      { name: 'Bold Red Marker', hex: '#b91c1c' },
      { name: 'Highlighter Yellow', hex: '#ca8a04' },
      { name: 'Highlighter Green', hex: '#16a34a' },
    ],
    cssFilter: 'contrast(1.35) drop-shadow(0 0 0.6px rgba(0,0,0,0.35)) drop-shadow(0.4px 0.4px 0 rgba(0,0,0,0.2))',
    textShadow: '0.4px 0.4px 0.6px rgba(0,0,0,0.32)',
    opacity: 0.92,
    fontWeight: 800,
    glyphScale: 1.25,
    blendMode: 'multiply',
    letterSpacingBonus: 0.1,
    brushSize: 8.0,
    brushAlpha: 0.88,
  },
  fineliner: {
    id: 'fineliner',
    name: 'Fine Liner Pen',
    nameUrdu: 'فائن لائنر',
    shortLabel: 'Fine Liner',
    description: 'Precision 0.4mm needle tip with crisp, uniform lines for ultra-neat diagrams and student notes.',
    defaultStrokeWidth: 0.8,
    defaultInkColor: '#111827',
    suggestedColors: [
      { name: 'Technical Black', hex: '#111827' },
      { name: 'Cobalt Blue', hex: '#1d4ed8' },
      { name: 'Forest Green', hex: '#15803d' },
    ],
    cssFilter: 'contrast(1.35) brightness(0.92)',
    textShadow: 'none',
    opacity: 1.0,
    fontWeight: 300,
    glyphScale: 0.88,
    blendMode: 'normal',
    letterSpacingBonus: 0.1,
    brushSize: 1.6,
    brushAlpha: 1.0,
  },
  pencil: {
    id: 'pencil',
    name: 'Graphite Pencil (HB)',
    nameUrdu: 'پنسل (ایچ بی)',
    shortLabel: 'Pencil',
    description: 'Real pencil lead with soft paper tooth grain texture, subtle pressure fade, and graphite sheen.',
    defaultStrokeWidth: 1.1,
    defaultInkColor: '#4b5563', // medium graphite
    suggestedColors: [
      { name: 'HB Medium Pencil', hex: '#4b5563' },
      { name: '2B Dark Graphite', hex: '#374151' },
      { name: '4H Light Pencil', hex: '#6b7280' },
    ],
    cssFilter: 'contrast(0.95) grayscale(0.3) blur(0.12px)',
    textShadow: '0.3px 0.3px 0.6px rgba(0,0,0,0.14)',
    opacity: 0.86,
    fontWeight: 400,
    glyphScale: 0.96,
    blendMode: 'multiply',
    letterSpacingBonus: 0,
    brushSize: 2.0,
    brushAlpha: 0.84,
  },
};

/**
 * Returns rendering styles for a given pen type and ink color
 */
export function getPenStyleProperties(penType: PenType = 'fountain', inkColor: string = '#1e3a8a') {
  const preset = REALISTIC_PENS[penType] || REALISTIC_PENS.fountain;

  return {
    filter: preset.cssFilter,
    textShadow: preset.textShadow,
    opacity: preset.opacity,
    fontWeight: preset.fontWeight,
    glyphScale: preset.glyphScale,
    blendMode: preset.blendMode,
    strokeWidth: preset.defaultStrokeWidth,
    letterSpacingAdjustment: preset.letterSpacingBonus,
    brushSize: preset.brushSize,
    brushAlpha: preset.brushAlpha,
  };
}
