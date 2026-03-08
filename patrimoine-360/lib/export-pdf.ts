import { jsPDF } from "jspdf";
import { FormData, CalculationResult } from "@/types";

interface ExportPdfParams {
  moduleTitle: string;
  moduleStyle: string;
  formData: FormData;
  calculations: CalculationResult[] | null;
  aiResult: string;
}

function addFooter(doc: jsPDF, pageNum: number, totalPages: number) {
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  doc.setFontSize(7);
  doc.setTextColor(180, 180, 180);
  doc.text(`Patrimoine 360° — Rapport confidentiel`, 20, ph - 10);
  doc.text(`Page ${pageNum} / ${totalPages}`, pw - 20, ph - 10, { align: "right" });
}

function addDisclaimer(doc: jsPDF) {
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text(
    "Les analyses fournies ont une vocation d'aide à la décision et d'information. Elles ne remplacent pas un conseil",
    pw / 2, ph - 25, { align: "center" }
  );
  doc.text(
    "financier, fiscal ou juridique individualisé délivré par un professionnel habilité.",
    pw / 2, ph - 21, { align: "center" }
  );
}

export function exportPdf({ moduleTitle, moduleStyle, formData, calculations, aiResult }: ExportPdfParams) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = 20;

  const addPageIfNeeded = (needed: number) => {
    if (y + needed > 260) {
      doc.addPage();
      y = 20;
    }
  };

  // ===== PAGE DE GARDE =====
  // Background accent bar
  doc.setFillColor(99, 102, 241);
  doc.rect(0, 0, pageWidth, 4, "F");

  // Logo / Title
  y = pageHeight * 0.3;
  doc.setFontSize(32);
  doc.setTextColor(99, 102, 241);
  doc.text("Patrimoine 360°", pageWidth / 2, y, { align: "center" });
  y += 16;

  doc.setFontSize(16);
  doc.setTextColor(80, 80, 80);
  doc.text("Rapport d'analyse patrimoniale", pageWidth / 2, y, { align: "center" });
  y += 20;

  doc.setDrawColor(99, 102, 241);
  doc.setLineWidth(0.5);
  doc.line(pageWidth / 2 - 30, y, pageWidth / 2 + 30, y);
  y += 16;

  doc.setFontSize(14);
  doc.setTextColor(60, 60, 60);
  doc.text(moduleTitle, pageWidth / 2, y, { align: "center" });
  y += 8;

  doc.setFontSize(10);
  doc.setTextColor(130, 130, 130);
  doc.text(`Style ${moduleStyle}`, pageWidth / 2, y, { align: "center" });
  y += 16;

  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text(`Généré le ${new Date().toLocaleDateString("fr-FR")} à ${new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`, pageWidth / 2, y, { align: "center" });

  // Bottom accent
  doc.setFillColor(99, 102, 241);
  doc.rect(0, pageHeight - 4, pageWidth, 4, "F");

  // ===== RÉSUMÉ EXÉCUTIF =====
  doc.addPage();
  y = 20;

  doc.setFillColor(99, 102, 241);
  doc.rect(0, 0, pageWidth, 4, "F");

  doc.setFontSize(16);
  doc.setTextColor(99, 102, 241);
  doc.text("Résumé exécutif", 20, y);
  y += 4;
  doc.setDrawColor(99, 102, 241);
  doc.setLineWidth(0.3);
  doc.line(20, y, 80, y);
  y += 10;

  // Key metrics
  if (calculations && calculations.length > 0) {
    doc.setFontSize(10);
    calculations.forEach((calc) => {
      addPageIfNeeded(12);

      // Metric box
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(20, y - 3, pageWidth - 40, 10, 2, 2, "F");

      doc.setTextColor(80, 80, 80);
      doc.setFontSize(9);
      doc.text(calc.label, 24, y + 3);

      const valueText = `${typeof calc.value === "number" ? calc.value.toLocaleString("fr-FR") : calc.value}${calc.suffix ? ` ${calc.suffix}` : ""}`;
      doc.setTextColor(
        calc.color === "success" ? 34 : calc.color === "danger" ? 220 : calc.color === "warning" ? 234 : 99,
        calc.color === "success" ? 197 : calc.color === "danger" ? 38 : calc.color === "warning" ? 179 : 102,
        calc.color === "success" ? 94 : calc.color === "danger" ? 38 : calc.color === "warning" ? 8 : 241
      );
      doc.setFontSize(10);
      doc.text(valueText, pageWidth - 24, y + 3, { align: "right" });

      y += 12;
    });
    y += 5;
  }

  // ===== DONNÉES SAISIES =====
  addPageIfNeeded(20);
  doc.setFontSize(14);
  doc.setTextColor(99, 102, 241);
  doc.text("Données saisies", 20, y);
  y += 4;
  doc.setDrawColor(99, 102, 241);
  doc.line(20, y, 70, y);
  y += 8;

  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  Object.entries(formData).forEach(([key, value]) => {
    if (value !== "" && value !== undefined) {
      addPageIfNeeded(6);
      const label = key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
      doc.setTextColor(130, 130, 130);
      doc.text(label, 24, y);
      doc.setTextColor(60, 60, 60);
      const valStr = String(value);
      doc.text(valStr.length > 60 ? valStr.substring(0, 57) + "..." : valStr, pageWidth - 24, y, { align: "right" });
      y += 6;
    }
  });
  y += 5;

  // ===== ANALYSE IA =====
  if (aiResult) {
    addPageIfNeeded(20);
    doc.setFontSize(14);
    doc.setTextColor(99, 102, 241);
    doc.text("Analyse IA détaillée", 20, y);
    y += 4;
    doc.setDrawColor(99, 102, 241);
    doc.line(20, y, 80, y);
    y += 8;

    doc.setFontSize(8);
    doc.setTextColor(60, 60, 60);
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

  // ===== DISCLAIMER PAGE =====
  doc.addPage();
  addDisclaimer(doc);

  // Add page numbers
  const totalPages = doc.getNumberOfPages();
  for (let i = 2; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(doc, i - 1, totalPages - 1); // -1 because cover page doesn't count
  }

  doc.save(`patrimoine-360-${moduleTitle.replace(/\s/g, "-").toLowerCase()}.pdf`);
}
