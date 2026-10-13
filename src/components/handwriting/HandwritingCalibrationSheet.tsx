import React from 'react';
import { Download, Printer, X, CheckCircle2 } from 'lucide-react';

interface HandwritingCalibrationSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HandwritingCalibrationSheet: React.FC<HandwritingCalibrationSheetProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-neutral-200 shadow-2xl overflow-hidden my-8">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50/50">
          <div>
            <h2 className="font-bold text-neutral-900 text-base">Handwriting Calibration Sheet</h2>
            <p className="text-xs text-neutral-500">Print or copy this template to calibrate your digital handwriting style profile</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Sheet</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Calibration Content */}
        <div className="p-8 space-y-6 max-h-[75vh] overflow-y-auto bg-[#fafaf9]">
          <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-xs space-y-5">
            <div className="border-b border-neutral-200 pb-3 flex justify-between items-center text-xs text-neutral-400">
              <span className="font-semibold text-neutral-800 tracking-wider uppercase text-[10px]">
                HandWrite AI Calibration Template
              </span>
              <span>Document Ref: HW-CALIB-2026</span>
            </div>

            <div className="space-y-4 text-xs text-neutral-700">
              <div>
                <span className="font-semibold text-neutral-900 block mb-1">1. Uppercase & Lowercase Alphabet</span>
                <div className="font-mono bg-neutral-50 p-2.5 rounded border border-neutral-200 text-neutral-600 tracking-widest text-[11px]">
                  A B C D E F G H I J K L M N O P Q R S T U V W X Y Z<br />
                  a b c d e f g h i j k l m n o p q r s t u v w x y z
                </div>
              </div>

              <div>
                <span className="font-semibold text-neutral-900 block mb-1">2. Numerals & Mathematical Symbols</span>
                <div className="font-mono bg-neutral-50 p-2.5 rounded border border-neutral-200 text-neutral-600 tracking-widest text-[11px]">
                  0 1 2 3 4 5 6 7 8 9 · + - = / % &lt; &gt; ( ) [ ]
                </div>
              </div>

              <div>
                <span className="font-semibold text-neutral-900 block mb-1">3. Standard Alignment Pangram</span>
                <div className="bg-neutral-50 p-3 rounded border border-neutral-200 text-neutral-800 italic leading-relaxed">
                  "The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump!"
                </div>
              </div>

              <div>
                <span className="font-semibold text-neutral-900 block mb-1">4. Sample Coursework Paragraph (Natural Pace)</span>
                <div className="bg-neutral-50 p-3 rounded border border-neutral-200 text-neutral-800 leading-relaxed">
                  "In classical mechanics, kinetic energy is expressed as one half the product of mass and velocity squared. When examining electromagnetic radiation, wave-particle duality explains how light exhibits both continuous interference patterns and localized discrete photon exchanges."
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-200 text-[11px] text-neutral-500 space-y-1">
              <div className="font-medium text-neutral-700">Photography Tips for Best Calibration:</div>
              <ul className="list-disc list-inside space-y-0.5 text-neutral-500">
                <li>Write on ruled notebook paper or clean plain paper with your standard ballpoint, gel, or fountain pen.</li>
                <li>Ensure bright, even daylight without harsh hand shadows or flash reflections.</li>
                <li>Hold your phone camera flat directly above the page rather than at an acute perspective angle.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-neutral-50 border-t border-neutral-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer"
          >
            Done & Return to Onboarding
          </button>
        </div>
      </div>
    </div>
  );
};
