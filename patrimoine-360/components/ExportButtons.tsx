"use client";
import { FileText, Table } from "lucide-react";
import { FormData, CalculationResult } from "@/types";
import { exportPdf } from "@/lib/export-pdf";
import { exportExcel } from "@/lib/export-excel";

interface ExportButtonsProps {
  moduleTitle: string;
  moduleStyle: string;
  formData: FormData;
  calculations: CalculationResult[] | null;
  aiResult: string;
}

export default function ExportButtons({ moduleTitle, moduleStyle, formData, calculations, aiResult }: ExportButtonsProps) {
  if (!aiResult && (!calculations || calculations.length === 0)) return null;

  return (
    <div className="flex gap-3">
      <button
        onClick={() => exportPdf({ moduleTitle, moduleStyle, formData, calculations, aiResult })}
        className="btn-secondary text-sm"
      >
        <FileText size={16} />
        Exporter PDF
      </button>
      <button
        onClick={() => exportExcel({ moduleTitle, moduleStyle, formData, calculations, aiResult })}
        className="btn-secondary text-sm"
      >
        <Table size={16} />
        Exporter Excel
      </button>
    </div>
  );
}
