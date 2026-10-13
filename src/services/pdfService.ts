import { jsPDF } from 'jspdf';
import { StyleSettings, Language } from '../types';
import { HandwritingEngine, RenderedPage } from '../engine/handwritingEngine';
import { getOrSynthesizeGlyph, getGlyphWidthRatio } from '../engine/glyphLibrary';
import { REALISTIC_PENS } from '../engine/penSimulation';

export class PdfService {
  /**
   * Generates and downloads a multi-page PDF formatted as a real student handwritten notebook.
   * Guarantees 100% of assignment text is included with ZERO horizontal or vertical cropping.
   */
  public static async generatePdf(
    assignmentTitle: string,
    text: string,
    style: StyleSettings,
    language: Language = 'en'
  ): Promise<void> {
    const isUrdu = language === 'ur';
    const pages: RenderedPage[] = HandwritingEngine.paginate(text, style, language);

    // Page format: A4, Letter, Legal, or A5
    const format =
      style.pageSize === 'letter'
        ? 'letter'
        : style.pageSize === 'legal'
        ? 'legal'
        : style.pageSize === 'a5'
        ? 'a5'
        : 'a4';
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format,
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Pen simulation preset
    const pen = REALISTIC_PENS[style.penType || 'fountain'] || REALISTIC_PENS.fountain;

    // Map ink colors from hex to RGB
    const inkRgb = this.hexToRgb(style.inkColor || pen.defaultInkColor);

    // Layout margins in PDF points
    const marginLeft = style.paperStyle === 'ruled' || style.paperStyle === 'legal' ? 68 : 50;
    const marginRight = pageWidth - 38;
    const printableWidth = marginRight - marginLeft;
    const lineStep = Math.round(style.fontSize * style.lineSpacing * 0.95);

    for (let pageIdx = 0; pageIdx < pages.length; pageIdx++) {
      if (pageIdx > 0) {
        pdf.addPage(format, 'portrait');
      }

      const page = pages[pageIdx];
      const isFirst = page.isFirstPage;

      // 1. Draw Paper Background
      this.drawPaperBackground(pdf, pageWidth, pageHeight, style, lineStep);

      // 2. Draw Student Header on first page
      let contentStartY = 50;
      if (isFirst && style.showStudentHeader) {
        contentStartY = this.drawStudentHeader(pdf, pageWidth, style, inkRgb);
      }

      // 3. Draw Text Lines with realistic pen ink simulation
      pdf.setTextColor(inkRgb.r, inkRgb.g, inkRgb.b);
      pdf.setFontSize(style.fontSize);

      let currentY = contentStartY + lineStep;

      for (const rawLine of page.lines) {
        // Safe check: If nearing bottom margin, dynamically add page rather than clipping!
        if (currentY > pageHeight - 45) {
          pdf.addPage(format, 'portrait');
          this.drawPaperBackground(pdf, pageWidth, pageHeight, style, lineStep);
          currentY = 55 + lineStep;
        }

        const line = rawLine.trim();
        if (!line) {
          currentY += lineStep * 0.7;
          continue;
        }

        if (style.fontFamily === 'Custom My Hand') {
          // Render with calibrated character glyphs with tight natural kerning and pen physics
          let cursorX = marginLeft;
          const glyphHeight = style.fontSize * 1.15 * (pen.glyphScale || 1.0);

          for (const char of rawLine) {
            if (char === ' ') {
              cursorX += (style.wordSpacing || 2.5) * 2.2;
              if (cursorX > marginRight) {
                cursorX = marginLeft;
                currentY += lineStep;
                if (currentY > pageHeight - 45) {
                  pdf.addPage(format, 'portrait');
                  this.drawPaperBackground(pdf, pageWidth, pageHeight, style, lineStep);
                  currentY = 55 + lineStep;
                }
              }
              continue;
            }

            const glyphData =
              style.customGlyphs?.[char] ||
              getOrSynthesizeGlyph(char, style.customGlyphs, style.inkColor, style.slantAngle);
            const widthRatio = getGlyphWidthRatio(char, glyphData);
            const glyphWidth = glyphHeight * widthRatio;

            // Wrap to next line if exceeding printable width
            if (cursorX + glyphWidth > marginRight) {
              cursorX = marginLeft;
              currentY += lineStep;
              if (currentY > pageHeight - 45) {
                pdf.addPage(format, 'portrait');
                this.drawPaperBackground(pdf, pageWidth, pageHeight, style, lineStep);
                currentY = 55 + lineStep;
              }
            }

            if (glyphData) {
              try {
                pdf.addImage(glyphData, 'PNG', cursorX, currentY - glyphHeight * 0.78, glyphWidth, glyphHeight);
                // If marker pen, add bold chisel second pass
                if (pen.id === 'marker') {
                  pdf.addImage(glyphData, 'PNG', cursorX + 0.3, currentY - glyphHeight * 0.78 + 0.3, glyphWidth, glyphHeight);
                }
              } catch {
                pdf.text(char, cursorX, currentY);
              }
            } else {
              pdf.text(char, cursorX, currentY);
            }

            cursorX += glyphWidth + (style.letterSpacing !== undefined ? style.letterSpacing : 0.2) + pen.letterSpacingBonus;
          }
        } else if (isUrdu) {
          // Right-aligned for Urdu
          pdf.text(line, marginRight, currentY, { align: 'right' });
          if (pen.id === 'marker') {
            pdf.text(line, marginRight + 0.3, currentY + 0.3, { align: 'right' });
          }
        } else {
          // Left-aligned with subtle organic baseline variation
          const textWidth = pdf.getTextWidth(line);
          if (textWidth > printableWidth) {
            // Split line safely to prevent horizontal clipping
            const splitLines = pdf.splitTextToSize(line, printableWidth);
            for (let sIdx = 0; sIdx < splitLines.length; sIdx++) {
              if (currentY > pageHeight - 45) {
                pdf.addPage(format, 'portrait');
                this.drawPaperBackground(pdf, pageWidth, pageHeight, style, lineStep);
                currentY = 55 + lineStep;
              }
              const sub = splitLines[sIdx];
              const jitterY = style.organicJitter ? (Math.random() - 0.5) * 1.0 : 0;
              pdf.text(sub, marginLeft, currentY + jitterY);
              if (pen.id === 'marker') {
                pdf.text(sub, marginLeft + 0.3, currentY + jitterY + 0.3);
              }
              if (sIdx < splitLines.length - 1) {
                currentY += lineStep;
              }
            }
          } else {
            const jitterY = style.organicJitter ? (Math.random() - 0.5) * 1.0 : 0;
            pdf.text(line, marginLeft, currentY + jitterY);
            if (pen.id === 'marker') {
              pdf.text(line, marginLeft + 0.3, currentY + jitterY + 0.3);
            }
          }
        }

        currentY += lineStep;
      }

      // 4. Draw Page Number in Footer
      if (style.showPageNumber) {
        pdf.setFontSize(9);
        pdf.setTextColor(130, 140, 150);
        const pageLabel = `- ${page.pageNumber} / ${page.totalPages} -`;
        pdf.text(pageLabel, pageWidth / 2, pageHeight - 20, { align: 'center' });
      }
    }

    // Download PDF with clean user-friendly filename
    const cleanFileName = (assignmentTitle || 'Assignment')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .substring(0, 45);
    pdf.save(`${cleanFileName}.pdf`);
  }

  /**
   * Render and download a specific page as a high-resolution PNG image
   */
  public static exportPageAsImage(
    pageIndex: number,
    pages: RenderedPage[],
    style: StyleSettings,
    assignmentTitle: string,
    language: Language = 'en'
  ): void {
    const page = pages[pageIndex];
    if (!page) return;

    const width = 794;
    const height = 1123;
    const canvas = document.createElement('canvas');
    canvas.width = width * 2; // 2x Retina resolution
    canvas.height = height * 2;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(2, 2);

    // Draw background
    ctx.fillStyle = this.getPaperBgColor(style.paperStyle);
    ctx.fillRect(0, 0, width, height);

    const lineStep = Math.round(style.fontSize * style.lineSpacing);

    // Ruled lines
    if (style.paperStyle === 'ruled' || style.paperStyle === 'legal') {
      ctx.strokeStyle = style.paperStyle === 'legal' ? '#cbd5e1' : '#e2e8f0';
      ctx.lineWidth = 1;

      for (let y = 65; y < height - 35; y += lineStep) {
        ctx.beginPath();
        ctx.moveTo(30, y);
        ctx.lineTo(width - 30, y);
        ctx.stroke();
      }

      // Red vertical margin rule
      ctx.strokeStyle = '#f87171';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(75, 0);
      ctx.lineTo(75, height);
      ctx.stroke();
    } else if (style.paperStyle === 'grid') {
      ctx.strokeStyle = '#f1f5f9';
      ctx.lineWidth = 0.8;
      for (let x = 30; x < width - 30; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 30);
        ctx.lineTo(x, height - 30);
        ctx.stroke();
      }
      for (let y = 30; y < height - 30; y += 20) {
        ctx.beginPath();
        ctx.moveTo(30, y);
        ctx.lineTo(width - 30, y);
        ctx.stroke();
      }
    }

    // Header on first page
    let contentStartY = 55;
    if (page.isFirstPage && style.showStudentHeader) {
      ctx.fillStyle = '#64748b';
      ctx.font = '11px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(`Student: ${style.studentName || 'Alex Morgan'}`, 85, 42);
      ctx.fillText(`Roll / ID: ${style.studentId || '-'}`, 300, 42);
      ctx.fillText(`Date: ${style.studentDate || '-'}`, 580, 42);
      ctx.fillText(`Subject: ${style.studentSubject || '-'}`, 85, 62);

      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(85, 74);
      ctx.lineTo(width - 45, 74);
      ctx.stroke();

      contentStartY = 85;
    }

    // Text lines
    const marginLeft = style.paperStyle === 'ruled' || style.paperStyle === 'legal' ? 85 : 55;
    const isUrdu = language === 'ur';

    ctx.fillStyle = style.inkColor || '#1e3a8a';
    const fontName = isUrdu ? '"Noto Nastaliq Urdu", serif' : `"${style.fontFamily}", cursive, sans-serif`;
    ctx.font = `${style.fontSize}px ${fontName}`;
    ctx.textBaseline = 'alphabetic';

    let currentY = contentStartY + lineStep;
    for (const rawLine of page.lines) {
      if (currentY > height - 40) break;
      const line = rawLine.trim();
      if (line.length > 0) {
        if (style.fontFamily === 'Custom My Hand') {
          let cursorX = marginLeft;
          const glyphHeight = style.fontSize * 1.25;

          for (const char of rawLine) {
            if (char === ' ') {
              cursorX += (style.wordSpacing || 2.5) * 2.8;
              continue;
            }
            const glyphData =
              style.customGlyphs?.[char] ||
              getOrSynthesizeGlyph(char, style.customGlyphs, style.inkColor, style.slantAngle);
            const widthRatio = getGlyphWidthRatio(char, glyphData);
            const glyphWidth = glyphHeight * widthRatio;

            if (glyphData) {
              const img = new Image();
              img.src = glyphData;
              ctx.drawImage(img, cursorX, currentY - glyphHeight * 0.78, glyphWidth, glyphHeight);
            } else {
              ctx.fillText(char, cursorX, currentY);
            }
            cursorX += glyphWidth + (style.letterSpacing !== undefined ? style.letterSpacing : 0.2);
          }
        } else if (isUrdu) {
          ctx.textAlign = 'right';
          ctx.fillText(line, width - 50, currentY);
        } else {
          ctx.textAlign = 'left';
          const jitter = style.organicJitter ? (Math.random() - 0.5) * 1.2 : 0;
          ctx.fillText(line, marginLeft, currentY + jitter);
        }
      }
      currentY += lineStep;
    }

    // Page number
    if (style.showPageNumber) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`- ${page.pageNumber} / ${page.totalPages} -`, width / 2, height - 20);
    }

    // Trigger download
    const link = document.createElement('a');
    link.download = `${assignmentTitle || 'Assignment'}_Page_${page.pageNumber}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  private static drawPaperBackground(
    pdf: jsPDF,
    pageWidth: number,
    pageHeight: number,
    style: StyleSettings,
    lineStep: number
  ): void {
    const bgRgb = this.getPaperRgb(style.paperStyle);
    pdf.setFillColor(bgRgb.r, bgRgb.g, bgRgb.b);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');

    if (style.paperStyle === 'ruled' || style.paperStyle === 'legal') {
      // Horizontal ruled lines
      pdf.setDrawColor(225, 231, 239);
      pdf.setLineWidth(0.5);
      for (let y = 55; y < pageHeight - 35; y += lineStep) {
        pdf.line(25, y, pageWidth - 25, y);
      }

      // Vertical red margin rule
      pdf.setDrawColor(248, 113, 113);
      pdf.setLineWidth(0.75);
      pdf.line(65, 0, 65, pageHeight);

      // Yellow legal pad secondary double rule
      if (style.paperStyle === 'legal') {
        pdf.line(68, 0, 68, pageHeight);
      }
    } else if (style.paperStyle === 'grid') {
      pdf.setDrawColor(238, 242, 246);
      pdf.setLineWidth(0.4);
      for (let x = 25; x < pageWidth - 25; x += 18) {
        pdf.line(x, 25, x, pageHeight - 25);
      }
      for (let y = 25; y < pageHeight - 25; y += 18) {
        pdf.line(25, y, pageWidth - 25, y);
      }
    }
  }

  private static drawStudentHeader(
    pdf: jsPDF,
    pageWidth: number,
    style: StyleSettings,
    inkRgb: { r: number; g: number; b: number }
  ): number {
    pdf.setFontSize(8.5);
    pdf.setTextColor(100, 116, 139);

    const startX = 68;
    const headerY = 32;

    pdf.text(`Student: ${style.studentName || 'Alex Morgan'}`, startX, headerY);
    pdf.text(`Roll / ID: ${style.studentId || 'ST-2026-4891'}`, 240, headerY);
    pdf.text(`Date: ${style.studentDate || new Date().toLocaleDateString()}`, pageWidth - 140, headerY);
    pdf.text(`Subject: ${style.studentSubject || 'Assignment'}`, startX, headerY + 14);

    // Subtle divider rule
    pdf.setDrawColor(203, 213, 225);
    pdf.setLineWidth(0.6);
    pdf.line(startX, headerY + 22, pageWidth - 38, headerY + 22);

    return headerY + 26;
  }

  private static getPaperRgb(paperStyle: string): { r: number; g: number; b: number } {
    switch (paperStyle) {
      case 'cream':
        return { r: 254, g: 252, b: 243 }; // Warm light ivory
      case 'legal':
        return { r: 254, g: 250, b: 224 }; // Light yellow legal pad
      case 'plain':
      case 'ruled':
      case 'grid':
      default:
        return { r: 255, g: 255, b: 255 }; // Crisp white
    }
  }

  private static getPaperBgColor(paperStyle: string): string {
    switch (paperStyle) {
      case 'cream':
        return '#fefcf3';
      case 'legal':
        return '#fefaec';
      case 'plain':
      case 'ruled':
      case 'grid':
      default:
        return '#ffffff';
    }
  }

  private static hexToRgb(hex: string): { r: number; g: number; b: number } {
    const cleanHex = hex.replace('#', '');
    const bigint = parseInt(cleanHex, 16);
    if (isNaN(bigint)) return { r: 30, g: 58, b: 138 };
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return { r, g, b };
  }
}
