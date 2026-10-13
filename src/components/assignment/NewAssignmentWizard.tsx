import React, { useState } from 'react';
import {
  FileText,
  Upload,
  Sparkles,
  Sliders,
  Eye,
  Download,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Trash2,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Copy,
  PenTool,
  Save,
  Printer,
  ShieldCheck,
  Edit3,
  Layers,
  Image,
} from 'lucide-react';
import {
  Assignment,
  HandwritingProfile,
  Language,
  PageSize,
  PaperStyle,
  HandwritingFont,
  StyleSettings,
  SourceDocument,
  PenType,
} from '../../types';
import { geminiService } from '../../services/geminiService';
import { PdfService } from '../../services/pdfService';
import { HandwritingEngine, RenderedPage, PAGE_SPECS } from '../../engine/handwritingEngine';
import { NotebookPagePreview } from './NotebookPagePreview';
import { PaginatedDocumentPreviewPage } from './PaginatedDocumentPreviewPage';
import { DEFAULT_STYLE_SETTINGS } from '../../services/storageService';
import { CharacterGlyphStudio } from '../handwriting/CharacterGlyphStudio';
import { getCharacterRequirementsStatus, generateDefaultGlyphSet } from '../../engine/glyphLibrary';
import { REALISTIC_PENS, PenPreset } from '../../engine/penSimulation';

interface NewAssignmentWizardProps {
  initialAssignment?: Assignment | null;
  handwritingProfiles: HandwritingProfile[];
  onSaveAssignment: (assignment: Omit<Assignment, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => void;
  onCancel: () => void;
}

export const NewAssignmentWizard: React.FC<NewAssignmentWizardProps> = ({
  initialAssignment,
  handwritingProfiles,
  onSaveAssignment,
  onCancel,
}) => {
  // Wizard Step: 1 to 7
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Details
  const [title, setTitle] = useState(initialAssignment?.title || 'Physics Assignment 02');
  const [subject, setSubject] = useState(initialAssignment?.subject || 'Physics');
  const [courseName, setCourseName] = useState(initialAssignment?.courseName || 'PHYS 202');
  const [language, setLanguage] = useState<Language>(initialAssignment?.language || 'en');
  const [instructions, setInstructions] = useState(
    initialAssignment?.instructions ||
      'Answer all questions with formal derivations, explain the physical principles, and provide step-by-step conclusions suitable for notebook submission.'
  );
  const [targetLength, setTargetLength] = useState<'brief' | 'medium' | 'long'>(
    initialAssignment?.targetLength || 'medium'
  );
  const [paperSize, setPaperSize] = useState<PageSize>(initialAssignment?.paperSize || 'a4');

  // Step 2: Source Documents
  const [sourceDocuments, setSourceDocuments] = useState<SourceDocument[]>(
    initialAssignment?.sourceDocuments || []
  );
  const [manualNotesInput, setManualNotesInput] = useState('');
  const [isExtractingOcr, setIsExtractingOcr] = useState(false);
  const [ocrError, setOcrError] = useState<string | null>(null);

  // Step 3: Extracted Text
  const [extractedText, setExtractedText] = useState(
    initialAssignment?.extractedText ||
      'Chapter 4: Principles of Quantum Mechanics & Atomic Orbitals.\n1. Dual nature of light and de Broglie wavelength.\n2. Heisenberg Uncertainty Principle: Delta x * Delta p >= h / 4pi.\n3. Schrödinger wave equation and quantum numbers: n, l, m_l, m_s.'
  );

  // Step 4: AI Draft
  const [draftContent, setDraftContent] = useState(
    initialAssignment?.draftContent ||
      `# Modern Physics Assignment 02\nTopic: Quantum Mechanics & Atomic Structure\n\n1. Wave-Particle Duality\nIn 1924, Louis de Broglie hypothesized that if electromagnetic radiation behaves both like waves and particles, then physical matter must also exhibit wavelike characteristics. The wavelength associated with any moving mass m with velocity v is given by:\nlambda = h / p = h / (m * v)\nWhere h is Planck's constant (6.626 x 10^-34 J*s) and p is relativistic momentum.\n\n2. The Uncertainty Principle\nWerner Heisenberg formulated that it is fundamentally impossible to simultaneously determine both the exact position and linear momentum of an elementary particle with unlimited precision. Mathematically:\nDelta x * Delta p >= h / (4 * pi)\nThis uncertainty is not a limitation of experimental apparatus, but an intrinsic property of all quantum mechanical wave packets.\n\n3. Quantum Numbers & Electronic Configuration\nElectrons occupy atomic orbitals characterized by four discrete quantum indices:\n- Principal Quantum Number (n): Determines radial shell distance and primary energy level.\n- Angular Momentum Quantum Number (l): Defines orbital shape (s, p, d, f).\n- Magnetic Quantum Number (m_l): Dictates spatial orientation in magnetic fields.\n- Spin Quantum Number (m_s): Represents intrinsic electron angular spin (+1/2 or -1/2).\n\n4. Conclusion\nQuantum mechanics provides a non-deterministic framework that successfully accounts for atomic spectral lines, discrete energy transitions, and the chemical stability of multi-electron elements.`
  );
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);
  const [refineActionLoading, setRefineActionLoading] = useState<string | null>(null);

  // Step 5: Handwriting & Paper Styles
  const defaultProfile = handwritingProfiles[0];
  const [selectedProfileId, setSelectedProfileId] = useState<string>(
    initialAssignment?.handwritingProfileId || defaultProfile?.id || ''
  );
  const [styles, setStyles] = useState<StyleSettings>(
    initialAssignment?.styleSettings ||
      (defaultProfile ? defaultProfile.styleSettings : DEFAULT_STYLE_SETTINGS)
  );

  // Step 5: Paper Review (Handwriting, Live Writing & Export in One Place)
  const [activeStudioTab, setActiveStudioTab] = useState<'write' | 'handwriting' | 'paper' | 'export'>('write');
  const [mobileReviewMode, setMobileReviewMode] = useState<'preview' | 'studio'>('preview');
  const [previewScale, setPreviewScale] = useState<number>(0.65);
  const [activePageIndex, setActivePageIndex] = useState<number>(0);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [exportSuccessMessage, setExportSuccessMessage] = useState<string | null>(null);
  const [showCharacterStudioModal, setShowCharacterStudioModal] = useState(false);

  // Paginated pages calculation
  const renderedPages: RenderedPage[] = HandwritingEngine.paginate(draftContent, styles, language);
  const currentPage = renderedPages[activePageIndex] || renderedPages[0];

  // When profile selection changes, load its styles
  const handleProfileChange = (profileId: string) => {
    setSelectedProfileId(profileId);
    const p = handwritingProfiles.find((item) => item.id === profileId);
    if (p) {
      setStyles((prev) => ({
        ...p.styleSettings,
        customGlyphs: p.customGlyphs || p.styleSettings.customGlyphs || prev.customGlyphs,
      }));
    }
  };

  // Upload study materials (PDF, TXT, images)
  const handleMaterialUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      const docId = `doc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      const newDoc: SourceDocument = {
        id: docId,
        name: file.name,
        size: file.size,
        type: file.type,
        extractedText: '',
        uploadedAt: new Date().toISOString(),
        status: 'processing',
      };

      setSourceDocuments((prev) => [...prev, newDoc]);

      // Read file and extract text
      if (file.type.startsWith('text/') || file.name.endsWith('.txt')) {
        const text = await file.text();
        newDoc.extractedText = text;
        newDoc.status = 'ready';
        setSourceDocuments((prev) => prev.map((d) => (d.id === docId ? newDoc : d)));
        setExtractedText((prev) => (prev ? `${prev}\n\n[From ${file.name}]:\n${text}` : text));
      } else {
        // Run OCR with Gemini Vision on images or scanned pages
        setIsExtractingOcr(true);
        try {
          const reader = new FileReader();
          reader.onload = async () => {
            const base64 = reader.result as string;
            try {
              const res = await geminiService.extractText(base64, file.type, file.name);
              newDoc.extractedText = res.extractedText;
              newDoc.status = 'ready';
              setSourceDocuments((prev) => prev.map((d) => (d.id === docId ? newDoc : d)));
              setExtractedText((prev) => (prev ? `${prev}\n\n[From ${file.name}]:\n${res.extractedText}` : res.extractedText));
            } catch (err: any) {
              newDoc.status = 'error';
              newDoc.errorMessage = err.message || 'OCR failed';
              setSourceDocuments((prev) => prev.map((d) => (d.id === docId ? newDoc : d)));
            } finally {
              setIsExtractingOcr(false);
            }
          };
          reader.readAsDataURL(file);
        } catch {
          setIsExtractingOcr(false);
        }
      }
    }
  };

  // Append manual typed notes to extracted text
  const handleAddManualNotes = () => {
    if (!manualNotesInput.trim()) return;
    setExtractedText((prev) => (prev ? `${prev}\n\n${manualNotesInput}` : manualNotesInput));
    setManualNotesInput('');
  };

  // Generate draft with Gemini AI
  const handleGenerateDraft = async () => {
    setIsGeneratingDraft(true);
    try {
      const res = await geminiService.generateDraft({
        title,
        subject,
        instructions,
        sourceMaterials: extractedText,
        targetLength,
        language,
      });

      if (res.content) {
        setDraftContent(res.content);
      }
    } catch (err: any) {
      console.error('Draft error:', err);
    } finally {
      setIsGeneratingDraft(false);
    }
  };

  // Refine draft action (simplify, expand, grammar, rephrase)
  const handleRefineDraft = async (action: 'simplify' | 'expand' | 'grammar' | 'rephrase') => {
    setRefineActionLoading(action);
    try {
      const res = await geminiService.refineDraft({
        action,
        text: draftContent,
        instructions: `Keep academic formatting suitable for student handwritten assignment submission. Language: ${language}`,
      });
      if (res.content) {
        setDraftContent(res.content);
      }
    } catch (err: any) {
      console.error('Refine error:', err);
    } finally {
      setRefineActionLoading(null);
    }
  };

  // Save Assignment
  const handleSaveProject = () => {
    onSaveAssignment({
      id: initialAssignment?.id,
      title,
      subject,
      courseName,
      language,
      instructions,
      targetLength,
      paperSize,
      sourceDocuments,
      extractedText,
      draftContent,
      handwritingProfileId: selectedProfileId,
      styleSettings: styles,
      status: 'rendered',
      pageCount: renderedPages.length,
    });
    setExportSuccessMessage('Assignment saved successfully!');
    setTimeout(() => setExportSuccessMessage(null), 3000);
  };

  // Download PDF
  const handleDownloadPdf = async () => {
    setIsExportingPdf(true);
    try {
      await PdfService.generatePdf(title, draftContent, styles, language);
      handleSaveProject();
      setExportSuccessMessage('PDF downloaded successfully!');
      setTimeout(() => setExportSuccessMessage(null), 3500);
    } catch (err: any) {
      console.error('PDF export error:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Download Image
  const handleDownloadPageImage = () => {
    PdfService.exportPageAsImage(activePageIndex, renderedPages, styles, title, language);
    setExportSuccessMessage(`Page ${activePageIndex + 1} exported as PNG!`);
    setTimeout(() => setExportSuccessMessage(null), 3500);
  };

  const stepsList = [
    { num: 1, title: 'Details' },
    { num: 2, title: 'Materials' },
    { num: 3, title: 'Review Notes' },
    { num: 4, title: 'AI Draft & Writing' },
    { num: 5, title: 'Paper Review' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Toast Alert */}
      {exportSuccessMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{exportSuccessMessage}</span>
        </div>
      )}

      {/* Top Wizard Tracker */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider">
            Assignment Wizard · Step {currentStep} of 5
          </span>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 mt-0.5">
            {currentStep === 1 && '1. Assignment Details & Requirements'}
            {currentStep === 2 && '2. Upload Study Materials & Notes'}
            {currentStep === 3 && '3. Review & Edit Extracted Materials'}
            {currentStep === 4 && '4. AI Drafting & Writing'}
            {currentStep === 5 && '5. Paper Review (Handwriting, Live Writing & Export)'}
          </h1>
        </div>

        {/* Step dots / tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {stepsList.map((s) => (
            <button
              key={s.num}
              onClick={() => setCurrentStep(s.num)}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors whitespace-nowrap ${
                currentStep === s.num
                  ? 'bg-indigo-600 text-white'
                  : currentStep > s.num
                  ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                  : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
              }`}
            >
              {s.num}. {s.title}
            </button>
          ))}
        </div>
      </div>

      {/* ==================== STEP 1: Assignment Details ==================== */}
      {currentStep === 1 && (
        <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-xs space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Assignment Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Physics Lab 04: The Photoelectric Effect"
                className="w-full text-xs bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-2 text-neutral-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Subject / Topic
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Modern Physics"
                className="w-full text-xs bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-2 text-neutral-800"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Course / Class Code
              </label>
              <input
                type="text"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                placeholder="e.g. PHYS 301"
                className="w-full text-xs bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-2 text-neutral-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="w-full text-xs bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-2 text-neutral-800"
              >
                <option value="en">English (Left to Right)</option>
                <option value="ur">Urdu - اردو (Right to Left / Nastaliq)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Target Length
              </label>
              <select
                value={targetLength}
                onChange={(e) => setTargetLength(e.target.value as 'brief' | 'medium' | 'long')}
                className="w-full text-xs bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-2 text-neutral-800"
              >
                <option value="brief">Brief (~1 Page, 200-300 words)</option>
                <option value="medium">Standard (~2-3 Pages, 400-600 words)</option>
                <option value="long">In-Depth (~4+ Pages, 800-1200 words)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Assignment Instructions & Teacher Formatting Criteria
            </label>
            <textarea
              rows={4}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="State any specific guidelines, such as question numbering, formulas required, or essay prompt questions..."
              className="w-full text-xs bg-neutral-50 border border-neutral-300 rounded-lg p-3 text-neutral-800 resize-none"
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-neutral-100">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>Next: Upload Study Materials</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ==================== STEP 2: Upload Study Materials ==================== */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-xs space-y-5">
            <div>
              <h2 className="font-semibold text-neutral-900 text-sm">
                Upload Question Sheets, Textbook Pages, or Lecture Slides
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Supports PDF, TXT, and scanned image formats (JPG, PNG, WebP) with automatic OCR.
              </p>
            </div>

            {/* Upload Area */}
            <label className="border-2 border-dashed border-neutral-300 hover:border-indigo-500 bg-neutral-50/50 hover:bg-indigo-50/20 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors text-center block">
              <Upload className="w-8 h-8 text-neutral-400 mb-2" />
              <span className="text-xs font-semibold text-neutral-800">
                Choose files to upload or drag and drop
              </span>
              <span className="text-[11px] text-neutral-500 mt-1">
                PDF, TXT, PNG, JPG up to 25MB each
              </span>
              <input
                type="file"
                multiple
                accept=".txt,.pdf,image/png,image/jpeg,image/webp"
                onChange={handleMaterialUpload}
                className="hidden"
              />
            </label>

            {/* Upload status indicator */}
            {isExtractingOcr && (
              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-xs text-indigo-700 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Extracting text from uploaded document with OCR...</span>
              </div>
            )}

            {/* Uploaded Files List */}
            {sourceDocuments.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-semibold text-neutral-700">
                  Uploaded Documents ({sourceDocuments.length})
                </div>
                <div className="divide-y divide-neutral-100 border border-neutral-200 rounded-lg overflow-hidden">
                  {sourceDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3 bg-white flex items-center justify-between text-xs"
                    >
                      <div className="truncate mr-3">
                        <div className="font-semibold text-neutral-800 truncate">{doc.name}</div>
                        <div className="text-[11px] text-neutral-400">
                          {(doc.size / 1024).toFixed(1)} KB · Status: {doc.status}
                        </div>
                      </div>
                      <button
                        onClick={() => setSourceDocuments((prev) => prev.filter((d) => d.id !== doc.id))}
                        className="text-neutral-400 hover:text-red-600 p-1 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Manual Notes Pasting Option */}
            <div className="pt-4 border-t border-neutral-100">
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Or Paste Study Notes / Question Text Manually
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualNotesInput}
                  onChange={(e) => setManualNotesInput(e.target.value)}
                  placeholder="Paste question prompt or key points..."
                  className="flex-1 text-xs bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-2 text-neutral-800"
                />
                <button
                  type="button"
                  onClick={handleAddManualNotes}
                  className="px-4 py-2 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
                >
                  Append Note
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-800 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>Next: Review Extracted Material</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ==================== STEP 3: Review Extracted Material ==================== */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-xs space-y-4">
            <div>
              <h2 className="font-semibold text-neutral-900 text-sm">
                Review & Edit Extracted Materials
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Ensure all questions, formulas, and facts are accurate before generating the assignment draft.
              </p>
            </div>

            <textarea
              rows={12}
              value={extractedText}
              onChange={(e) => setExtractedText(e.target.value)}
              className="w-full text-xs font-mono bg-neutral-50 border border-neutral-300 rounded-lg p-3 text-neutral-800 focus:outline-indigo-500 leading-relaxed"
            />

            <div className="text-[11px] text-neutral-400">
              Untrusted Input Notice: Uploaded document text is safely contained and used exclusively to inform your assignment draft.
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-800 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <button
              onClick={() => {
                setCurrentStep(4);
                if (!draftContent) handleGenerateDraft();
              }}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>Next: Generate AI Draft</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ==================== STEP 4: AI Draft Generation & Refinement ==================== */}
      {currentStep === 4 && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-3">
              <div>
                <h2 className="font-semibold text-neutral-900 text-sm">
                  Assignment Draft Editor
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Review and edit the text. Never render to handwriting without verifying contents.
                </p>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  disabled={isGeneratingDraft}
                  onClick={handleGenerateDraft}
                  className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isGeneratingDraft ? 'Generating...' : 'Regenerate Draft'}</span>
                </button>
                <button
                  disabled={!!refineActionLoading}
                  onClick={() => handleRefineDraft('simplify')}
                  className="px-2.5 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors"
                >
                  {refineActionLoading === 'simplify' ? 'Simplifying...' : 'Simplify'}
                </button>
                <button
                  disabled={!!refineActionLoading}
                  onClick={() => handleRefineDraft('expand')}
                  className="px-2.5 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors"
                >
                  {refineActionLoading === 'expand' ? 'Expanding...' : 'Expand'}
                </button>
                <button
                  disabled={!!refineActionLoading}
                  onClick={() => handleRefineDraft('grammar')}
                  className="px-2.5 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors"
                >
                  {refineActionLoading === 'grammar' ? 'Checking...' : 'Fix Grammar'}
                </button>
              </div>
            </div>

            {/* Editable Draft Area */}
            <textarea
              rows={16}
              value={draftContent}
              onChange={(e) => setDraftContent(e.target.value)}
              className="w-full text-xs bg-neutral-50 border border-neutral-300 rounded-lg p-3 text-neutral-800 leading-relaxed focus:outline-indigo-500 font-sans"
              style={{
                direction: language === 'ur' ? 'rtl' : 'ltr',
                textAlign: language === 'ur' ? 'right' : 'left',
              }}
            />

            <div className="flex items-center justify-between text-xs text-neutral-500">
              <span>Estimated Words: {draftContent.split(/\s+/).filter(Boolean).length}</span>
              <span>Language: {language === 'ur' ? 'Urdu (Nastaliq)' : 'English'}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentStep(3)}
              className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-800 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <button
              onClick={() => setCurrentStep(5)}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>Finish Writing & Open Paper Review</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ==================== STEP 5: Paper Review (Handwriting, Live Writing & Export in ONE Place) ==================== */}
      {currentStep === 5 && (
        <div className="space-y-4">
          <PaginatedDocumentPreviewPage
            assignment={{
              id: initialAssignment?.id || `as-${Date.now()}`,
              title,
              subject,
              courseName,
              language,
              instructions,
              targetLength,
              paperSize: styles.pageSize,
              sourceDocuments,
              extractedText,
              draftContent,
              handwritingProfileId: selectedProfileId,
              styleSettings: styles,
              status: initialAssignment?.status || 'reviewing',
              createdAt: initialAssignment?.createdAt || new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              pageCount: renderedPages.length,
            }}
            onBack={() => setCurrentStep(4)}
            onReturnDashboard={onCancel}
            onSaveAssignment={(updated) => {
              if (updated.draftContent !== undefined) setDraftContent(updated.draftContent);
              if (updated.styleSettings) setStyles(updated.styleSettings);
              if (updated.title) setTitle(updated.title);
              onSaveAssignment(updated);
            }}
          />
        </div>
      )}

      {/* Modal: Draw / Calibrate Meri Handwriting Characters */}
      {showCharacterStudioModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-neutral-50 rounded-2xl w-full max-w-6xl max-h-[92vh] overflow-y-auto border border-neutral-200 shadow-2xl relative p-2">
            <CharacterGlyphStudio
              initialProfile={{
                id: selectedProfileId || 'hp-meri-handwriting',
                profileName: '⭐ Meri Handwriting (My Custom Characters)',
                sampleImages: [],
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
