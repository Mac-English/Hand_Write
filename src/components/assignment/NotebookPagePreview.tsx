import React from 'react';
import { StyleSettings, Language } from '../../types';
import { RenderedPage, PAGE_SPECS } from '../../engine/handwritingEngine';
import { getOrSynthesizeGlyph, getGlyphWidthRatio } from '../../engine/glyphLibrary';
import { getPenStyleProperties } from '../../engine/penSimulation';

interface NotebookPagePreviewProps {
  page: RenderedPage;
  style: StyleSettings;
  language?: Language;
  scale?: number;
}

export const NotebookPagePreview: React.FC<NotebookPagePreviewProps> = ({
  page,
  style,
  language = 'en',
  scale = 1,
}) => {
  const isUrdu = language === 'ur';

  // Exact paper dimensions (A4: 794x1123, Letter: 816x1056, Legal: 816x1344, A5: 559x794)
  const spec = PAGE_SPECS[style.pageSize] || PAGE_SPECS.a4;
  const pageWidth = spec.width;
  const pageHeight = spec.height;

  // Realistic pen physics & styling
  const pen = getPenStyleProperties(style.penType, style.inkColor);

  // Background patterns based on paper style
  const getPaperBgClasses = () => {
    switch (style.paperStyle) {
      case 'cream':
        return 'bg-[#fefcf3] text-neutral-800';
      case 'legal':
        return 'bg-[#fefaec] text-neutral-900';
      case 'grid':
        return 'bg-white text-neutral-900';
      case 'plain':
        return 'bg-white text-neutral-900';
      case 'ruled':
      default:
        return 'bg-white text-neutral-900';
    }
  };

  const getFontFamily = () => {
    if (isUrdu) return "'Noto Nastaliq Urdu', serif";
    switch (style.fontFamily) {
      case 'Custom My Hand':
        return "'Caveat', cursive, sans-serif";
      case 'Caveat':
        return "'Caveat', cursive, sans-serif";
      case 'Kalam':
        return "'Kalam', cursive, sans-serif";
      case 'Indie Flower':
        return "'Indie Flower', cursive, sans-serif";
      case 'Patrick Hand':
        return "'Patrick Hand', cursive, sans-serif";
      case 'Homemade Apple':
        return "'Homemade Apple', cursive, sans-serif";
      case 'Sacramento':
        return "'Sacramento', cursive, sans-serif";
      case 'Noto Nastaliq Urdu':
        return "'Noto Nastaliq Urdu', serif";
      default:
        return "'Caveat', cursive, sans-serif";
    }
  };

  const lineHeightPx = Math.round(style.fontSize * style.lineSpacing);

  return (
    <div
      className="relative mx-auto transition-transform duration-200 select-text origin-top shadow-xl rounded-sm border border-neutral-200/80 overflow-hidden"
      style={{
        width: `${pageWidth * scale}px`,
        height: `${pageHeight * scale}px`,
      }}
    >
      <div
        className={`w-full h-full relative p-0 overflow-hidden ${getPaperBgClasses()}`}
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          width: `${pageWidth}px`,
          height: `${pageHeight}px`,
        }}
      >
        {/* Ruled lines layer */}
        {(style.paperStyle === 'ruled' || style.paperStyle === 'legal') && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `repeating-linear-gradient(to bottom, transparent 0px, transparent ${lineHeightPx - 1}px, #e2e8f0 ${lineHeightPx - 1}px, #e2e8f0 ${lineHeightPx}px)`,
              backgroundPosition: '0 65px',
            }}
          />
        )}

        {/* Legal Paper double vertical rule */}
        {style.paperStyle === 'legal' && (
          <div className="absolute top-0 bottom-0 left-[76px] w-[3px] border-r border-l border-red-300 pointer-events-none" />
        )}

        {/* Standard Ruled Paper single red margin rule */}
        {style.paperStyle === 'ruled' && (
          <div className="absolute top-0 bottom-0 left-[75px] w-[1px] bg-red-400 pointer-events-none" />
        )}

        {/* Grid pattern layer */}
        {style.paperStyle === 'grid' && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(to right, #f1f5f9 1px, transparent 1px), linear-gradient(to bottom, #f1f5f9 1px, transparent 1px)`,
              backgroundSize: '20px 20px',
            }}
          />
        )}

        {/* Student Header on First Page */}
        {page.isFirstPage && style.showStudentHeader && (
          <div className="relative pt-6 px-12 pb-3 mb-2 border-b border-neutral-300/80">
            <div className="flex justify-between items-center text-xs text-neutral-500 font-sans tracking-wide">
              <div>
                <span className="font-semibold text-neutral-700">Student: </span>
                <span className="text-neutral-900">{style.studentName || 'Alex Morgan'}</span>
              </div>
              <div>
                <span className="font-semibold text-neutral-700">Roll / ID: </span>
                <span className="text-neutral-900">{style.studentId || 'ST-2026-4891'}</span>
              </div>
              <div>
                <span className="font-semibold text-neutral-700">Date: </span>
                <span className="text-neutral-900">{style.studentDate || 'Oct 11, 2026'}</span>
              </div>
            </div>
            <div className="mt-1 text-xs text-neutral-500 font-sans">
              <span className="font-semibold text-neutral-700">Subject: </span>
              <span className="text-neutral-900">{style.studentSubject || 'General Assignment'}</span>
            </div>
          </div>
        )}

        {/* Handwritten Content Area */}
        <div
          className={`relative z-10 px-12 ${
            page.isFirstPage && style.showStudentHeader ? 'pt-4' : 'pt-12'
          }`}
          style={{
            paddingLeft:
              style.paperStyle === 'ruled' || style.paperStyle === 'legal'
                ? isUrdu
                  ? '48px'
                  : '85px'
                : '55px',
            paddingRight:
              isUrdu && (style.paperStyle === 'ruled' || style.paperStyle === 'legal')
                ? '85px'
                : '50px',
            direction: isUrdu ? 'rtl' : 'ltr',
            textAlign: isUrdu ? 'right' : 'left',
          }}
        >
          {page.lines.map((line, idx) => {
            const isHeading =
              line.startsWith('#') ||
              /^[0-9]+\.\s+[A-Z]/.test(line) ||
              line.toLowerCase().startsWith('question') ||
              line.toLowerCase().startsWith('topic:');

            const cleanLine = line.replace(/^#+\s*/, '');
            const randomJitter = style.organicJitter ? ((idx % 3) - 1) * 0.4 : 0;
            const isCustomGlyphs = style.fontFamily === 'Custom My Hand';

            // Effective letter spacing including pen bonus
            const effectiveLetterSpacing = (style.letterSpacing ?? 0.2) + pen.letterSpacingAdjustment;

            return (
              <div
                key={idx}
                className="relative leading-none transition-all flex items-baseline whitespace-nowrap overflow-visible"
                style={{
                  height: `${lineHeightPx}px`,
                  fontFamily: getFontFamily(),
                  fontSize: `${isHeading ? style.fontSize + 2 : style.fontSize}px`,
                  fontWeight: isHeading ? Math.min(900, pen.fontWeight + 200) : pen.fontWeight,
                  color: style.inkColor,
                  letterSpacing: `${effectiveLetterSpacing}px`,
                  wordSpacing: `${style.wordSpacing || 2.5}px`,
                  transform: `translateY(${randomJitter}px) rotate(${style.slantAngle * 0.18}deg)`,
                  filter: pen.filter,
                  textShadow: pen.textShadow,
                  opacity: pen.opacity,
                  mixBlendMode: pen.blendMode as any,
                }}
              >
                {isCustomGlyphs ? (
                  cleanLine ? (
                    cleanLine.split('').map((char, cIdx) => {
                      if (char === ' ') {
                        return (
                          <span
                            key={cIdx}
                            className="inline-block shrink-0"
                            style={{ width: `${(style.wordSpacing || 2.5) * 2.8}px` }}
                          />
                        );
                      }
                      const glyphUrl =
                        style.customGlyphs?.[char] ||
                        getOrSynthesizeGlyph(char, style.customGlyphs, style.inkColor, style.slantAngle);

                      if (glyphUrl) {
                        const baseGlyphHeight = (isHeading ? style.fontSize + 4 : style.fontSize) * 1.25;
                        const effectiveGlyphHeight = Math.round(baseGlyphHeight * pen.glyphScale);
                        const widthRatio = getGlyphWidthRatio(char, glyphUrl);
                        const effectiveGlyphWidth = Math.max(4, Math.round(effectiveGlyphHeight * widthRatio));

                        return (
                          <span
                            key={cIdx}
                            className="inline-block shrink-0 select-none pointer-events-none transition-all"
                            style={{
                              height: `${effectiveGlyphHeight}px`,
                              width: `${effectiveGlyphWidth}px`,
                              marginRight: `${effectiveLetterSpacing}px`,
                              verticalAlign: 'baseline',
                              maskImage: `url("${glyphUrl}")`,
                              WebkitMaskImage: `url("${glyphUrl}")`,
                              maskSize: 'contain',
                              WebkitMaskSize: 'contain',
                              maskRepeat: 'no-repeat',
                              WebkitMaskRepeat: 'no-repeat',
                              maskPosition: 'center bottom',
                              WebkitMaskPosition: 'center bottom',
                              backgroundColor: style.inkColor,
                              filter: pen.filter,
                              opacity: pen.opacity,
                              mixBlendMode: pen.blendMode as any,
                            }}
                          />
                        );
                      }
                      return <span key={cIdx}>{char}</span>;
                    })
                  ) : (
                    '\u00A0'
                  )
                ) : (
                  cleanLine || '\u00A0'
                )}
              </div>
            );
          })}
        </div>

        {/* Footer with Page Number */}
        {style.showPageNumber && (
          <div className="absolute bottom-4 left-0 right-0 text-center text-xs text-neutral-400 font-sans tracking-widest pointer-events-none">
            - {page.pageNumber} / {page.totalPages} -
          </div>
        )}
      </div>
    </div>
  );
};
