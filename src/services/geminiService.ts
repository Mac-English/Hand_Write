export interface GenerateDraftParams {
  title: string;
  subject?: string;
  instructions?: string;
  sourceMaterials?: string;
  targetLength?: 'brief' | 'medium' | 'long';
  language?: 'en' | 'ur';
}

export interface RefineDraftParams {
  action: 'simplify' | 'expand' | 'grammar' | 'rephrase';
  text: string;
  instructions?: string;
}

export interface AnalyzeHandwritingResponse {
  clarityScore: string;
  estimatedSlant: number;
  estimatedLineSpacing?: number;
  estimatedWordSpacing?: number;
  recommendedFont?: string;
  detectedInkColor: string;
  handwritingStyle?: string;
  notes?: string;
  confidence?: string;
}

export const geminiService = {
  async generateDraft(params: GenerateDraftParams): Promise<{ content: string; warning?: string }> {
    const res = await fetch('/api/gemini/draft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Draft generation failed' }));
      throw new Error(err.error || 'Server error generating draft');
    }

    return res.json();
  },

  async refineDraft(params: RefineDraftParams): Promise<{ content: string; warning?: string }> {
    const res = await fetch('/api/gemini/refine', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Refinement failed' }));
      throw new Error(err.error || 'Server error refining draft');
    }

    return res.json();
  },

  async extractText(base64Data: string, mimeType: string, fileName: string): Promise<{ extractedText: string; warning?: string }> {
    const res = await fetch('/api/gemini/ocr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ base64Data, mimeType, fileName }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'OCR extraction failed' }));
      throw new Error(err.error || 'Server error extracting text');
    }

    return res.json();
  },

  async analyzeHandwriting(base64Data: string, mimeType: string): Promise<AnalyzeHandwritingResponse> {
    const res = await fetch('/api/gemini/analyze-handwriting', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ base64Data, mimeType }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Analysis failed' }));
      throw new Error(err.error || 'Server error analyzing handwriting');
    }

    return res.json();
  },
};
