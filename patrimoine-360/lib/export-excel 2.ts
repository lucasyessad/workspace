import ExcelJS from "exceljs";
import { FormData, CalculationResult } from "@/types";

interface ExportExcelParams {
  moduleTitle: string;
  moduleStyle: string;
  formData: FormData;
  calculations: CalculationResult[] | null;
  aiResult: string;
}

export async function exportExcel({ moduleTitle, moduleStyle, formData, calculations, aiResult }: ExportExcelParams) {
  const workbook = new ExcelJS.Workbook();

  const headerFill: ExcelJS.FillPattern = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF6366F1" },
  };
  const headerFont: Partial<ExcelJS.Font> = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };

  // Sheet 1: Données saisies
  const ws1 = workbook.addWorksheet("Données saisies");
  ws1.columns = [
    { header: "Champ", key: "field", width: 30 },
    { header: "Valeur", key: "value", width: 40 },
  ];
  ws1.getRow(1).eachCell((cell) => {
    cell.fill = headerFill;
    cell.font = headerFont;
  });

  Object.entries(formData).forEach(([key, value]) => {
    if (value !== "" && value !== undefined) {
      ws1.addRow({ field: key, value: String(value) });
    }
  });

  // Sheet 2: Calculs et résultats
  if (calculations && calculations.length > 0) {
    const ws2 = workbook.addWorksheet("Calculs et résultats");
    ws2.columns = [
      { header: "Indicateur", key: "label", width: 35 },
      { header: "Valeur", key: "value", width: 25 },
      { header: "Unité", key: "suffix", width: 15 },
    ];
    ws2.getRow(1).eachCell((cell) => {
      cell.fill = headerFill;
      cell.font = headerFont;
    });

    calculations.forEach((calc) => {
      ws2.addRow({
        label: calc.label,
        value: typeof calc.value === "number" ? calc.value : String(calc.value),
        suffix: calc.suffix || "",
      });
    });
  }

  // Sheet 3: Analyse IA
  if (aiResult) {
    const ws3 = workbook.addWorksheet("Analyse IA");
    ws3.columns = [{ header: "Analyse", key: "text", width: 120 }];
    ws3.getRow(1).eachCell((cell) => {
      cell.fill = headerFill;
      cell.font = headerFont;
    });

    const lines = aiResult.split("\n");
    lines.forEach((line) => {
      ws3.addRow({ text: line });
    });
  }

  // Generate and download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `patrimoine-360-${moduleTitle.replace(/\s/g, "-").toLowerCase()}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}
