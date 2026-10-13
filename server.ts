import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Shared server-side Google GenAI initialization
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Health & Status endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    supabaseConfigured: !!process.env.VITE_SUPABASE_URL || !!process.env.SUPABASE_URL,
    timestamp: new Date().toISOString(),
  });
});

// AI Assignment Draft Generation Endpoint
app.post('/api/gemini/draft', async (req: Request, res: Response) => {
  try {
    const { title, subject, instructions, sourceMaterials, targetLength, language } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      // Graceful fallback if API key is not yet set in local environment
      return res.json({
        content: `# ${title || 'Assignment Title'}\n\n## Introduction\nThis assignment explores key concepts related to ${subject || 'the course topic'}. Please verify and edit all sections prior to rendering.\n\n## Main Analysis & Discussion\nBased on the uploaded study materials, the core principles can be summarized systematically into sequential points:\n1. Foundation concepts and underlying definitions.\n2. Detailed analytical comparison.\n3. Practical applications and problem-solving examples.\n\n## Conclusion & Summary\nIn summary, the findings validate theoretical expectations while leaving room for further investigative research.`,
        source: 'local_fallback',
        warning: 'GEMINI_API_KEY is not configured. Generated a standard structured draft template.',
      });
    }

    const isUrdu = language === 'ur';

    const systemPrompt = isUrdu
      ? `آپ ایک تعلیمی اسائنمنٹ اسسٹنٹ ہیں۔ طالب علم کے دیے گئے عنوان، ہدایات اور مطالعاتی مواد کی بنیاد پر ایک منظم اور واضح اسائنمنٹ ڈرافٹ تیار کریں۔ اردو زبان میں معیاری املا اور درست گرامر کا خیال رکھیں۔ حقیقت پر مبنی حقائق کو برقرار رکھیں اور بناوٹی معلومات سے گریز کریں۔`
      : `You are an academic assignment writing and study assistant for students.
Create an authentic, well-structured assignment draft based on the student's study materials and instructions.
Guidelines:
- Maintain clear academic headings and structured paragraphs.
- If the instructions request Q&A, format clearly with "Question 1:", "Answer:", etc.
- Do NOT hallucinate false citations or fake references.
- Flag any uncertain facts with [Note: verify].
- Target length: ${targetLength || 'medium'} (brief: ~200-300 words, medium: ~400-600 words, long: ~800-1200 words).
- Use clear, articulate student-friendly language suitable for handwritten submission.`;

    const userPrompt = `
Assignment Details:
- Title: ${title || 'Untitled Assignment'}
- Subject: ${subject || 'General'}
- Language: ${isUrdu ? 'Urdu' : 'English'}
- Specific Instructions: ${instructions || 'Provide a thorough, structured response.'}

Provided Study Materials & Extracted Notes:
${sourceMaterials ? sourceMaterials.slice(0, 10000) : 'No external source notes provided; generate based strictly on standard curriculum fundamentals.'}

Please output the completed, ready-to-write assignment draft:`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
    });

    res.json({
      content: response.text || '',
      source: 'gemini',
    });
  } catch (error: any) {
    console.error('Error generating assignment draft:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate draft',
    });
  }
});

// AI Draft Refinement Endpoint (Simplify, Expand, Fix Grammar, Rephrase)
app.post('/api/gemini/refine', async (req: Request, res: Response) => {
  try {
    const { action, text, instructions } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text content is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        content: text,
        warning: 'GEMINI_API_KEY not configured.',
      });
    }

    let actionPrompt = '';
    switch (action) {
      case 'simplify':
        actionPrompt = 'Simplify the following text to make it more concise, natural, and easier to understand, avoiding overly complex jargon.';
        break;
      case 'expand':
        actionPrompt = 'Expand the following text with richer explanations, supporting examples, and structured details while maintaining clarity.';
        break;
      case 'grammar':
        actionPrompt = 'Correct all grammatical errors, spelling mistakes, and punctuation while preserving the student\'s natural tone and formatting.';
        break;
      case 'rephrase':
      default:
        actionPrompt = 'Rephrase the following text to improve academic clarity and flow while keeping the factual content intact.';
        break;
    }

    if (instructions) {
      actionPrompt += ` Additional guidance: ${instructions}`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `${actionPrompt}\n\nText:\n${text}`,
    });

    res.json({
      content: response.text || text,
    });
  } catch (error: any) {
    console.error('Error refining text:', error);
    res.status(500).json({ error: error.message || 'Failed to refine draft' });
  }
});

// Document OCR and Text Extraction Endpoint
app.post('/api/gemini/ocr', async (req: Request, res: Response) => {
  try {
    const { base64Data, mimeType, fileName } = req.body;

    if (!base64Data) {
      return res.status(400).json({ error: 'File data is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        extractedText: `[OCR simulation for ${fileName || 'uploaded document'}]:\nQuestion 1: Explain the fundamental laws of thermodynamics.\nAnswer: The First Law of Thermodynamics states that energy cannot be created or destroyed, only transformed from one form to another. The Second Law states that the total entropy of an isolated system always increases over time.`,
        source: 'local_fallback',
        warning: 'GEMINI_API_KEY not configured. Running offline extraction.',
      });
    }

    const cleanBase64 = base64Data.replace(/^data:[^;]+;base64,/, '');

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType || 'image/jpeg',
              data: cleanBase64,
            },
          },
          {
            text: 'Extract all readable text from this study document or notebook image. Preserve structural elements such as headings, numbered questions, bullet lists, formulas, and diagrams labels. Correct obvious scanning noise while maintaining exact factual wording.',
          },
        ],
      },
    });

    res.json({
      extractedText: response.text || '',
      source: 'gemini',
    });
  } catch (error: any) {
    console.error('Error in OCR extraction:', error);
    res.status(500).json({ error: error.message || 'Failed to extract text from file' });
  }
});

// Handwriting Sample Analysis Endpoint
app.post('/api/gemini/analyze-handwriting', async (req: Request, res: Response) => {
  try {
    const { base64Data, mimeType } = req.body;

    if (!base64Data) {
      return res.status(400).json({ error: 'Image sample data is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      // Default sensible analysis parameters when API key is offline
      return res.json({
        clarityScore: 'Good',
        estimatedSlant: 2,
        estimatedLineSpacing: 1.8,
        estimatedWordSpacing: 2.2,
        recommendedFont: 'Caveat',
        detectedInkColor: '#1e3a8a',
        handwritingStyle: 'Casual Cursive',
        confidence: 'Approximate (local estimate)',
        notes: 'Even baseline detected with slight rightward tilt and legible character loops.',
      });
    }

    const cleanBase64 = base64Data.replace(/^data:[^;]+;base64,/, '');

    const prompt = `Analyze this handwritten notebook page image to estimate the writer's handwriting characteristics for digital styling calibration.
Provide a strictly JSON formatted response with the following schema:
{
  "clarityScore": "Excellent" | "Good" | "Fair" | "Poor",
  "estimatedSlant": number (degrees, between -15 and +15, where positive is rightward slant),
  "estimatedLineSpacing": number (ratio between 1.3 and 2.4),
  "estimatedWordSpacing": number (ratio between 1.5 and 3.5),
  "recommendedFont": "Caveat" | "Indie Flower" | "Kalam" | "Patrick Hand" | "Homemade Apple" | "Sacramento" | "Noto Nastaliq Urdu",
  "detectedInkColor": string (hex color code, e.g. #1e3a8a for blue ink, #1e293b for black ink, #4b5563 for pencil),
  "handwritingStyle": "Neat Print" | "Casual Cursive" | "Fast Script" | "Classic Lettering",
  "notes": string (brief explanation of stroke weight, rhythm, and characteristics)
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType || 'image/jpeg',
              data: cleanBase64,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Error analyzing handwriting sample:', error);
    res.status(500).json({
      clarityScore: 'Moderate',
      estimatedSlant: 0,
      estimatedLineSpacing: 1.7,
      estimatedWordSpacing: 2.0,
      recommendedFont: 'Caveat',
      detectedInkColor: '#1e3a8a',
      handwritingStyle: 'Casual Cursive',
      notes: 'Standard handwriting calibration applied.',
    });
  }
});

// Mount Vite or serve static assets
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`HandWrite AI server is running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
