import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { Assignment } from '../../types';

interface SourceDocumentReviewPageProps {
  assignment: Assignment;
  onUpdateExtractedText: (text: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export const SourceDocumentReviewPage: React.FC<SourceDocumentReviewPageProps> = ({
  assignment,
  onUpdateExtractedText,
  onNext,
  onBack,
}) => {
  const [text, setText] = useState(assignment.extractedText || '');

  const handleSaveAndContinue = () => {
    onUpdateExtractedText(text);
    onNext();
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
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
              <FileText className="w-5 h-5 text-indigo-600" />
              <span>Source Document & Notes Review</span>
            </h1>
            <p className="text-xs text-neutral-500">
              Review and correct extracted OCR text before passing to the AI drafting assistant.
            </p>
          </div>
        </div>

        <button
          onClick={handleSaveAndContinue}
          className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
        >
          <span>Continue to Draft Editor</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between text-xs text-neutral-500 pb-2 border-b border-neutral-100">
          <span>Assignment: <strong className="text-neutral-800">{assignment.title}</strong></span>
          <span>Source Files: {assignment.sourceDocuments?.length || 0} attached</span>
        </div>

        <textarea
          rows={16}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste or review OCR-extracted questions, formulas, or lecture notes..."
          className="w-full text-xs font-mono bg-neutral-50 border border-neutral-300 rounded-lg p-4 text-neutral-800 focus:outline-indigo-500 leading-relaxed"
        />

        <div className="flex items-center justify-between text-xs text-neutral-500">
          <span>Total characters: {text.length}</span>
          <span className="text-[11px] text-neutral-400">Untrusted Input Safe Mode: active</span>
        </div>
      </div>
    </div>
  );
};
