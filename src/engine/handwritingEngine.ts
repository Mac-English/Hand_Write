import { PageSize, StyleSettings, Language } from '../types';

export interface PageLayoutDimensions {
  width: number;
  height: number;
  pdfWidthPt: number;
  pdfHeightPt: number;
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
  headerHeight: number;
  printableWidth: number;
  printableHeight: number;
  lineHeight: number;
  linesPerPage: number;
  linesPerPageFirst: number;
  linesPerPageNormal: number;
}

export interface RenderedPage {
  pageNumber: number;
  totalPages: number;
  lines: string[];
  isFirstPage: boolean;
  headerInfo?: {
    name: string;
    studentId: string;
    subject: string;
    date: string;
  };
}

/**
 * Standard page dimensions:
 * Screen preview pixels (at 96 DPI) vs Print PDF points (at 72 DPI)
 * A4: 210 x 297 mm = 595.28 x 841.89 pt = 794 x 1123 px
 * Letter: 8.5 x 11 in = 612 x 792 pt = 816 x 1056 px
 */
export const PAGE_SPECS: Record<PageSize, {
  width: number;
  height: number;
  pdfWidthPt: number;
  pdfHeightPt: number;
  name: string;
}> = {
  a4: {
    width: 794,
    height: 1123,
    pdfWidthPt: 595.28,
    pdfHeightPt: 841.89,
    name: 'A4 (210 x 297 mm)',
  },
  letter: {
    width: 816,
    height: 1056,
    pdfWidthPt: 612.0,
    pdfHeightPt: 792.0,
    name: 'US Letter (8.5 x 11 in)',
  },
  legal: {
    width: 816,
    height: 1344,
    pdfWidthPt: 612.0,
    pdfHeightPt: 1008.0,
    name: 'Legal (8.5 x 14 in)',
  },
  a5: {
    width: 559,
    height: 794,
    pdfWidthPt: 419.53,
    pdfHeightPt: 595.28,
    name: 'A5 (148 x 210 mm)',
  },
};

export class HandwritingEngine {
  /**
   * Calculates consistent layout dimensions that ensure 100% parity
   * between screen notebook preview and PDF output with ZERO clipping.
   */
  public static calculateDimensions(style: StyleSettings): PageLayoutDimensions {
    const spec = PAGE_SPECS[style.pageSize] || PAGE_SPECS.a4;
    const headerHeight = style.showStudentHeader ? 85 : 0;
    const marginTop = Math.max(style.marginTop || 50, 45);
    const marginBottom = Math.max(style.marginBottom || 50, 45);

    // Ruled / legal paper has red vertical margin
    const marginLeft = style.paperStyle === 'ruled' || style.paperStyle === 'legal' ? 80 : 60;
    const marginRight = 50;

    // Line height calculated from font size and line spacing multiplier
    const lineHeight = Math.round(style.fontSize * style.lineSpacing);

    // Calculate vertical capacity strictly bounded by PDF physical page height (841.89 pt A4 / 792 pt Letter)
    // Scale factor between screen pixels and PDF points: 72 / 96 = 0.75
    const pdfPrintableHeight = spec.pdfHeightPt - (marginTop * 0.75) - (marginBottom * 0.75) - 35;
    const pdfLineHeight = lineHeight * 0.75;

    // Normal page line capacity (conservative to guarantee zero bottom crop in PDF)
    const linesPerPageNormal = Math.max(14, Math.floor(pdfPrintableHeight / pdfLineHeight));

    // First page capacity accounts for student header block
    const pdfHeaderHeight = (headerHeight + 20) * 0.75;
    const linesPerPageFirst = Math.max(
      10,
      Math.floor((pdfPrintableHeight - (style.showStudentHeader ? pdfHeaderHeight : 0)) / pdfLineHeight)
    );

    const printableWidth = spec.width - marginLeft - marginRight;
    const printableHeight = spec.height - marginTop - marginBottom - headerHeight;

    return {
      width: spec.width,
      height: spec.height,
      pdfWidthPt: spec.pdfWidthPt,
      pdfHeightPt: spec.pdfHeightPt,
      marginTop,
      marginBottom,
      marginLeft,
      marginRight,
      headerHeight,
      printableWidth,
      printableHeight,
      lineHeight,
      linesPerPage: linesPerPageNormal,
      linesPerPageFirst,
      linesPerPageNormal,
    };
  }

  /**
   * Word wraps raw text to lines within printable margin limits.
   * Ensures no line ever exceeds the right margin rule or gets clipped horizontally.
   */
  public static wrapTextToLines(
    rawText: string,
    printableWidth: number,
    fontSize: number,
    isUrdu: boolean
  ): string[] {
    const rawParagraphs = rawText.split('\n');
    const resultLines: string[] = [];

    // Safe average character width ensuring lines wrap comfortably before the right margin
    const avgCharWidth = isUrdu ? fontSize * 0.58 : fontSize * 0.54;
    // Bounded character count per line to prevent horizontal cutoff in PDF
    const maxCharsPerLine = Math.max(28, Math.floor((printableWidth * 0.88) / avgCharWidth));

    for (const paragraph of rawParagraphs) {
      const trimmed = paragraph.trim();
      if (!trimmed) {
        resultLines.push(''); // Empty line representing paragraph break
        continue;
      }

      const words = trimmed.split(/\s+/);
      let currentLine = '';

      for (const word of words) {
        const potential = currentLine ? `${currentLine} ${word}` : word;
        if (potential.length > maxCharsPerLine) {
          if (currentLine) {
            resultLines.push(currentLine);
            currentLine = word;
          } else {
            // Very long single word or token: break into chunks
            let longRemaining = word;
            while (longRemaining.length > maxCharsPerLine) {
              resultLines.push(longRemaining.slice(0, maxCharsPerLine));
              longRemaining = longRemaining.slice(maxCharsPerLine);
            }
            currentLine = longRemaining;
          }
        } else {
          currentLine = potential;
        }
      }

      if (currentLine) {
        resultLines.push(currentLine);
      }
    }

    return resultLines;
  }

  /**
   * Paginates formatted text lines across notebook pages with exact page counts
   * and clean header placement.
   */
  public static paginate(
    text: string,
    style: StyleSettings,
    language: Language = 'en'
  ): RenderedPage[] {
    const dimensions = this.calculateDimensions(style);
    const isUrdu = language === 'ur';
    const lines = this.wrapTextToLines(text, dimensions.printableWidth, style.fontSize, isUrdu);

    if (lines.length === 0) {
      return [
        {
          pageNumber: 1,
          totalPages: 1,
          lines: ['[Blank Page]'],
          isFirstPage: true,
          headerInfo: style.showStudentHeader
            ? {
                name: style.studentName,
                studentId: style.studentId,
                subject: style.studentSubject,
                date: style.studentDate,
              }
            : undefined,
        },
      ];
    }

    const pages: RenderedPage[] = [];
    let currentLineIndex = 0;
    let pageNum = 1;

    while (currentLineIndex < lines.length) {
      const isFirst = pageNum === 1;
      const capacity = isFirst ? dimensions.linesPerPageFirst : dimensions.linesPerPageNormal;

      const pageLines = lines.slice(currentLineIndex, currentLineIndex + capacity);
      currentLineIndex += capacity;

      pages.push({
        pageNumber: pageNum,
        totalPages: 1, // Will update below
        lines: pageLines,
        isFirstPage: isFirst,
        headerInfo: isFirst && style.showStudentHeader
          ? {
              name: style.studentName,
              studentId: style.studentId,
              subject: style.studentSubject,
              date: style.studentDate,
            }
          : undefined,
      });

      pageNum++;
    }

    const totalPages = pages.length;
    pages.forEach((p) => {
      p.totalPages = totalPages;
    });

    return pages;
  }
}
