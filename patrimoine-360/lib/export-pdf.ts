import { jsPDF } from "jspdf";
import { FormData, CalculationResult } from "@/types";

interface ExportPdfParams {
  moduleTitle: string;
  moduleStyle: string;
  formData: FormData;
  calculations: CalculationResult[] | null;
  aiResult: string;
}

export function exportPdf({ moduleTitle, moduleStyle, formData, calculations, aiResult }: ExportPdfParams) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  const addPageIfNeeded = (needed: number) => {
    if (y + needed > 270) {
      doc.addPage();
      y = 20;
    }
  };

  // Header
  doc.setFontSize(20);
  doc.setTextColor(99, 102, 241);
  doc.text("Patrimoine 360°", pageWidth / 2, y, { align: "center" });
  y += 10;

  doc.setFontSize(14);
  doc.setTextColor(60, 60, 60);
  doc.text(`${moduleTitle} — Style ${moduleStyle}`, pageWidth / 2, y, { align: "center" });
  y += 8;

  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text(`Généré le ${new Date().toLocaleDateString("fr-FR")}`, pageWidth / 2, y, { align: "center" });
  y += 12;

  // Line
  doc.setDrawColor(200, 200, 200);
  doc.line(20, y, pageWidth - 20, y);
  y += 10;

  // Form data
  doc.setFontSize(12);
  doc.setTextColor(40, 40, 40);
  doc.text("Données saisies", 20, y);
  y += 8;

  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  Object.entries(formData).forEach(([key, value]) => {
    if (value !== "" && value !== undefined) {
      addPageIfNeeded(6);
      const text = `${key}: ${value}`;
      const lines = doc.splitTextToSize(text, pageWidth - 40);
      doc.text(lines, 20, y);
      y += lines.length * 5;
    }
  });
  y += 5;

  // Calculations
  if (calculations && calculations.length > 0) {
    addPageIfNeeded(15);
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.text("Résultats des calculs", 20, y);
    y += 8;

    doc.setFontSize(9);
    calculations.forEach((calc) => {
      addPageIfNeeded(6);
      doc.setTextColor(80, 80, 80);
      const text = `${calc.label}: ${typeof calc.value === "number" ? calc.value.toLocaleString("fr-FR") : calc.value}${calc.suffix ? ` ${calc.suffix}` : ""}`;
      doc.text(text, 20, y);
      y += 6;
    });
    y += 5;
  }

  // AI Result
  if (aiResult) {
    addPageIfNeeded(15);
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.text("Analyse IA", 20, y);
    y += 8;

    doc.setFontSize(8);
    doc.setTextColor(60, 60, 60);
    // Clean markdown for PDF
    const cleanText = aiResult
      .replace(/#{1,6}\s/g, "")
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/`/g, "");

    const lines = doc.splitTextToSize(cleanText, pageWidth - 40);
    for (const line of lines) {
      addPageIfNeeded(5);
      doc.text(line, 20, y);
      y += 4.5;
    }
  }

  // Disclaimer
  doc.addPage();
  y = doc.internal.pageSize.getHeight() - 20;
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text(
    "Ce document est fourni à titre éducatif uniquement et ne constitue pas un conseil financier professionnel.",
    pageWidth / 2, y,
    { align: "center" }
  );

  doc.save(`patrimoine-360-${moduleTitle.replace(/\s/g, "-").toLowerCase()}.pdf`);
}
