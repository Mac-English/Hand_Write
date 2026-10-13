import React, { useState } from 'react';
import { ArrowLeft, HelpCircle, ChevronDown, ChevronUp, Search, PenTool, Sparkles, Download, Layers } from 'lucide-react';

interface HelpFaqProps {
  onBack: () => void;
  onOpenCalibration: () => void;
}

export const HelpFaq: React.FC<HelpFaqProps> = ({ onBack, onOpenCalibration }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      category: 'Handwriting Calibration',
      q: 'How do I get the best results when uploading handwriting samples?',
      a: 'Take clear, well-lit photos directly above your notebook page using bright daylight or even desk lighting. Avoid extreme angles, heavy shadows, or blurry camera focus. You can use our printable Calibration Sheet containing alphabet pangrams and numerals to sample your natural stroke rhythm.',
    },
    {
      category: 'Handwriting Calibration',
      q: 'Why does HandWrite AI use configurable handwriting typography rather than a pure generative deepfake?',
      a: 'Pure image synthesis models frequently invent illegible characters, hallucinate spelling mistakes, and suffer from unpredictable line overlapping. Our hybrid modular engine applies your measured slant, ink tone, and spacing to proven typographical models with organic baseline jitter, ensuring every word remains completely legible and beautifully formatted on notebook paper.',
    },
    {
      category: 'Document Processing & AI',
      q: 'What types of study documents can I upload for OCR text extraction?',
      a: 'HandWrite AI supports PDF files, plain text (.txt), and digital photographs or scans (.jpg, .png, .webp). Text is extracted using Google Gemini Vision, preserving questions, headings, equations, and numbered points.',
    },
    {
      category: 'Document Processing & AI',
      q: 'Can I edit the AI draft before generating the final handwritten pages?',
      a: 'Yes! Step 4 of the assignment wizard provides a complete text editor with one-click refinement actions (Simplify wording, Expand explanation, Correct grammar, Rephrase). You always have full review capability before rendering.',
    },
    {
      category: 'Multilingual & Urdu',
      q: 'How does Urdu handwriting rendering work?',
      a: 'Urdu assignments automatically switch the page layout to right-to-left (RTL) direction with right-aligned notebook margins and authentic Google Noto Nastaliq Urdu typography.',
    },
    {
      category: 'Export & Printing',
      q: 'How do I print or export my completed assignment?',
      a: 'In Step 7, click "Download Full PDF Document" to generate a multi-page PDF formatted to standard A4 or US Letter dimensions. You can also download individual high-resolution PNG page images.',
    },
  ];

  const filtered = faqs.filter(
    (f) =>
      f.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.a.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-6 border-b border-neutral-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 text-neutral-500 hover:text-neutral-800 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-indigo-600" />
              <span>Help Center & Documentation</span>
            </h1>
            <p className="text-xs text-neutral-500">Guides, tips, and troubleshooting for students</p>
          </div>
        </div>

        <button
          onClick={onOpenCalibration}
          className="px-3.5 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
        >
          Calibration Sheet Template
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search help topics, OCR questions, or paper settings..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-xs pl-10 pr-4 py-2.5 bg-white border border-neutral-300 rounded-xl focus:outline-indigo-500 shadow-xs text-neutral-800"
        />
      </div>

      {/* Quick Guide Cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs space-y-1.5">
          <PenTool className="w-4 h-4 text-indigo-600" />
          <h3 className="font-semibold text-neutral-900 text-xs">Calibration Guide</h3>
          <p className="text-[11px] text-neutral-500 leading-relaxed">
            Write naturally on ruled paper to capture your real slant angle, ink preference, and line spacing.
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs space-y-1.5">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <h3 className="font-semibold text-neutral-900 text-xs">AI Drafting Support</h3>
          <p className="text-[11px] text-neutral-500 leading-relaxed">
            Always inspect generated answers for factual correctness and teacher-specified constraints.
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs space-y-1.5">
          <Download className="w-4 h-4 text-indigo-600" />
          <h3 className="font-semibold text-neutral-900 text-xs">Print & Submission</h3>
          <p className="text-[11px] text-neutral-500 leading-relaxed">
            Exported PDFs are matched to standard 100% paper scale for direct double-sided printing.
          </p>
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden divide-y divide-neutral-100">
        {filtered.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div key={idx} className="p-4 hover:bg-neutral-50/50 transition-colors">
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full flex items-center justify-between text-left gap-4"
              >
                <div>
                  <span className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wider block mb-0.5">
                    {item.category}
                  </span>
                  <span className="font-semibold text-neutral-900 text-xs">{item.q}</span>
                </div>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-neutral-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-neutral-400 shrink-0" />
                )}
              </button>
              {isOpen && (
                <div className="mt-2 text-xs text-neutral-600 leading-relaxed pt-2 border-t border-neutral-100">
                  {item.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
