export type Language = 'en' | 'ur';

export type PaperStyle = 'ruled' | 'grid' | 'legal' | 'cream' | 'plain';
export type PageSize = 'a4' | 'letter' | 'legal' | 'a5';

export type HandwritingFont =
  | 'Custom My Hand'
  | 'Caveat'
  | 'Indie Flower'
  | 'Kalam'
  | 'Patrick Hand'
  | 'Homemade Apple'
  | 'Sacramento'
  | 'Noto Nastaliq Urdu';

export type PenType =
  | 'ballpoint' // Ballpoint Pen - oil ink, subtle textured grain, everyday study pen
  | 'gel' // Gel Pen - smooth, rich opaque flow, deep dark lines
  | 'fountain' // Fountain / Ink Pen - expressive nib shading, classic liquid ink
  | 'rollerball' // Rollerball / Painter Pen - fluid bleed into paper, soft expressive line
  | 'marker' // Chisel Marker / Highlighter - bold chisel strokes, organic paper bleed
  | 'fineliner' // Fine Liner Pen - uniform clean 0.4mm needle tip
  | 'pencil'; // Graphite Pencil - textured soft graphite

export interface StyleSettings {
  fontFamily: HandwritingFont;
  fontSize: number; // in pt/px (e.g., 18)
  lineSpacing: number; // multiplier (e.g., 1.8)
  wordSpacing: number; // in px (e.g., 2.5)
  letterSpacing: number; // in px (e.g., 0.2)
  slantAngle: number; // degrees (-8 to 8)
  inkColor: string; // hex code
  penType?: PenType; // Real pen type simulation
  paperStyle: PaperStyle;
  pageSize: PageSize;
  strokeWidth: number; // ink stroke thickness
  organicJitter: boolean; // slight natural hand baseline variation
  showStudentHeader: boolean;
  studentName: string;
  studentId: string;
  studentSubject: string;
  studentDate: string;
  showPageNumber: boolean;
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
  customGlyphs?: Record<string, string>; // Maps character ('A', 'b', '3') to drawn glyph image data URL
}

export interface HandwritingProfile {
  id: string;
  profileName: string;
  sampleImages: string[];
  styleSettings: StyleSettings;
  customGlyphs?: Record<string, string>; // Maps character ('A', 'b', '1') to user drawn stroke data
  analysisNotes?: {
    clarityScore: string;
    estimatedSlant: number;
    estimatedLineSpacing?: number;
    detectedInkColor: string;
    recommendedFont?: string;
    handwritingStyle?: string;
    notes?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface SourceDocument {
  id: string;
  name: string;
  size: number;
  type: string;
  extractedText: string;
  uploadedAt: string;
  status: 'processing' | 'ready' | 'error';
  errorMessage?: string;
}

export interface Assignment {
  id: string;
  title: string;
  subject: string;
  courseName?: string;
  language: Language;
  instructions: string;
  targetLength: 'brief' | 'medium' | 'long';
  paperSize: PageSize;
  sourceDocuments: SourceDocument[];
  extractedText: string;
  draftContent: string;
  handwritingProfileId?: string;
  styleSettings?: StyleSettings;
  status: 'drafting' | 'extracted' | 'reviewing' | 'rendered' | 'exported';
  pageCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface GeneratedDocument {
  id: string;
  assignmentId: string;
  title: string;
  handwritingProfileId?: string;
  pageCount: number;
  pdfDataUrl?: string;
  pagePreviews: string[];
  createdAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  preferredLanguage: Language;
  createdAt: string;
  isDemoUser?: boolean;
}

export interface UsageRecord {
  id: string;
  operationType: string;
  details: string;
  timestamp: string;
}
