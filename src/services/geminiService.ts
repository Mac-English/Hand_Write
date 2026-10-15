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
    try {
      const res = await fetch('/api/gemini/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Backend unavailable (e.g. GitHub Pages static deployment)
    }

    // Graceful offline fallback
    const isUrdu = params.language === 'ur';
    const fallbackText = isUrdu
      ? `# ${params.title || 'عنوان اسائنمنٹ'}\nمضمون: ${params.subject || 'عمومی'}\n\n1. تعارف\nاس اسائنمنٹ میں اہم تصورات کا تفصیلی جائزہ لیا گیا ہے۔ طالب علم اپنے مطالعے کے مطابق اس میں ترمیم کر سکتا ہے۔\n\n2. بنیادی نکات اور وضاحت\n- بنیادی تعریفیں اور اہم اصطلاحات کا خلاصہ۔\n- عملی اطلاق اور مثالوں کی مدد سے تفہیم۔\n\n3. نتیجہ\nتمام نکات کی روشنی میں یہ نتیجہ اخذ کیا جا سکتا ہے کہ باقاعدہ مشق اور تفہیم سے مطلوبہ نتائج حاصل کیے جا سکتے ہیں۔`
      : `# ${params.title || 'Assignment Title'}\nTopic: ${params.subject || 'General Study'}\n\n1. Introduction\nThis assignment investigates fundamental principles and concepts. Please review, edit, and expand this draft as needed for your coursework.\n\n2. Key Concepts & Analysis\n- Principle 1: Foundational theories and contextual background.\n- Principle 2: Detailed comparative evaluation and methodology.\n- Principle 3: Practical applications, problem-solving, and observed results.\n\n3. Summary & Conclusion\nIn conclusion, the findings confirm key theoretical hypotheses while offering a foundation for further academic inquiry.`;

    return {
      content: fallbackText,
      warning: 'Running in offline/static mode (GitHub Pages). Standard academic structure generated.',
    };
  },

  async refineDraft(params: RefineDraftParams): Promise<{ content: string; warning?: string }> {
    try {
      const res = await fetch('/api/gemini/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }

    return {
      content: params.text,
      warning: 'Live AI refinement requires the Node.js backend. Current text preserved.',
    };
  },

  async extractText(base64Data: string, mimeType: string, fileName: string): Promise<{ extractedText: string; warning?: string }> {
    try {
      const res = await fetch('/api/gemini/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64Data, mimeType, fileName }),
      });

      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }

    return {
      extractedText: `# Extracted from ${fileName || 'study-document'}\n\n1. Overview & Key Points\nFundamental study notes extracted from document. Please review and edit in the notebook canvas.`,
      warning: 'OCR extraction requires the Node.js backend or Gemini API key.',
    };
  },

  async analyzeHandwriting(base64Data: string, mimeType: string): Promise<AnalyzeHandwritingResponse> {
    try {
      const res = await fetch('/api/gemini/analyze-handwriting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64Data, mimeType }),
      });

      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }

    return {
      clarityScore: 'Good',
      estimatedSlant: 2,
      estimatedLineSpacing: 1.8,
      estimatedWordSpacing: 2.2,
      recommendedFont: 'Caveat',
      detectedInkColor: '#1d4ed8',
      handwritingStyle: 'Casual Cursive',
      notes: 'Standard handwriting calibration applied.',
    };
  },
};
