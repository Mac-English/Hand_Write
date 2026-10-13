import React, { useState } from 'react';
import {
  ArrowLeft,
  Download,
  FileText,
  CheckCircle2,
  Smartphone,
  PenTool,
  Printer,
  ShieldCheck,
} from 'lucide-react';
import { Assignment } from '../../types';
import { PdfService } from '../../services/pdfService';
import { HandwritingEngine } from '../../engine/handwritingEngine';
import { DEFAULT_STYLE_SETTINGS } from '../../services/storageService';
import { REALISTIC_PENS } from '../../engine/penSimulation';

interface ExportDownloadPageProps {
  assignment: Assignment;
  onBack: () => void;
  onReturnDashboard: () => void;
}

export const ExportDownloadPage: React.FC<ExportDownloadPageProps> = ({
  assignment,
  onBack,
  onReturnDashboard,
}) => {
  const styles = assignment.styleSettings || DEFAULT_STYLE_SETTINGS;
  const pages = HandwritingEngine.paginate(
    assignment.draftContent || '',
    styles,
    assignment.language
  );

  const [isExporting, setIsExporting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const pen = REALISTIC_PENS[styles.penType || 'ballpoint'] || REALISTIC_PENS.ballpoint;

  const handleDownloadPdf = async () => {
    setIsExporting(true);
    try {
      await PdfService.generatePdf(
        assignment.title,
        assignment.draftContent || '',
        styles,
        assignment.language
      );
      setSuccessMsg(`Complete ${pages.length}-Page PDF downloaded successfully with ZERO cropping!`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error('PDF error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadPagePng = (index: number) => {
    PdfService.exportPageAsImage(
      index,
      pages,
      styles,
      assignment.title,
      assignment.language
    );
    setSuccessMsg(`Page ${index + 1} PNG image downloaded!`);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-6">
      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-neutral-200 gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 text-neutral-500 hover:text-neutral-800 rounded-lg hover:bg-neutral-100 transition-colors"
            title="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 flex items-center gap-2">
              <Download className="w-5 h-5 text-indigo-600" />
              <span>Export & Download Assignment</span>
            </h1>
            <p className="text-xs text-neutral-500">
              Download your complete handwritten assignment. Formatted with zero text cropping.
            </p>
          </div>
        </div>

        <button
          onClick={onReturnDashboard}
          className="px-4 py-2 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
        >
          Return to Dashboard
        </button>
      </div>

      {/* Assignment Summary Card */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-4">
          <div>
            <h2 className="font-bold text-neutral-900 text-base">{assignment.title}</h2>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-neutral-500 mt-1">
              <span>{assignment.subject || 'Coursework'}</span>
              <span>·</span>
              <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                {pages.length} Pages Complete
              </span>
              <span>·</span>
              <span className="flex items-center gap-1 text-neutral-700">
                <PenTool className="w-3 h-3 text-indigo-600" />
                <span>{pen.name} ({pen.nameUrdu})</span>
              </span>
              <span>·</span>
              <span>{styles.paperStyle} paper</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold">Zero-Crop Protection Active</span>
          </div>
        </div>

        {/* Export Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Complete PDF Option */}
          <div className="p-5 rounded-xl border border-indigo-200 bg-indigo-50/40 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <div className="font-bold text-sm text-neutral-900 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span>Complete Multi-Page PDF</span>
                </div>
                <span className="text-[10px] font-bold bg-indigo-600 text-white px-2 py-0.5 rounded-full">
                  Recommended
                </span>
              </div>
              <p className="text-xs text-neutral-600 mt-2 leading-relaxed">
                Full printable PDF containing all {pages.length} notebook pages with ruled lines, red margins, and authentic {pen.name} strokes. Fits 100% inside page margins with no words cut off.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                disabled={isExporting}
                onClick={handleDownloadPdf}
                className="w-full py-3 px-4 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>
                  {isExporting ? 'Generating PDF...' : `Download Complete PDF (${pages.length} Pages)`}
                </span>
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-500">
                <Smartphone className="w-3.5 h-3.5 text-neutral-400" />
                <span>Works smoothly on Android phones, tablets & desktop</span>
              </div>
            </div>
          </div>

          {/* Individual Page PNG Option */}
          <div className="p-5 rounded-xl border border-neutral-200 bg-neutral-50/50 flex flex-col justify-between space-y-4">
            <div>
              <div className="font-bold text-sm text-neutral-900 flex items-center gap-1.5">
                <Printer className="w-4 h-4 text-neutral-700" />
                <span>Individual Page PNG Images</span>
              </div>
              <p className="text-xs text-neutral-600 mt-2 leading-relaxed">
                High-resolution Retina images of each rendered notebook page for digital submissions or messaging apps.
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-neutral-600 block">
                Download Specific Page:
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1">
                {pages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handleDownloadPagePng(i)}
                    className="px-3 py-1.5 text-xs font-semibold bg-white border border-neutral-300 hover:bg-neutral-50 hover:border-indigo-400 rounded-md transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                  >
                    <Download className="w-3 h-3 text-neutral-500" />
                    <span>Page {i + 1} PNG</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
