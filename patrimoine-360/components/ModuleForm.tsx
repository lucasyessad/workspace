"use client";
import { FormField, FormData } from "@/types";

interface ModuleFormProps {
  fields: FormField[];
  formData: FormData;
  onChange: (id: string, value: string | number) => void;
}

export default function ModuleForm({ fields, formData, onChange }: ModuleFormProps) {
  const baseInput = "w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition font-sans text-sm";

  return (
    <div className="space-y-5">
      {fields.map((field) => (
        <div key={field.id}>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            {field.label}
            {field.suffix && <span className="text-gray-500 ml-1 text-xs">({field.suffix})</span>}
          </label>
          {field.type === "textarea" ? (
            <textarea
              className={`${baseInput} min-h-[100px] resize-y`}
              placeholder={field.placeholder}
              value={formData[field.id] || ""}
              onChange={(e) => onChange(field.id, e.target.value)}
              rows={4}
            />
          ) : field.type === "select" ? (
            <select
              className={baseInput}
              value={formData[field.id] || ""}
              onChange={(e) => onChange(field.id, e.target.value)}
            >
              <option value="">Sélectionnez...</option>
              {field.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          ) : (
            <input
              type={field.type}
              className={`${baseInput} font-mono`}
              placeholder={field.placeholder}
              value={formData[field.id] ?? ""}
              onChange={(e) => {
                const val = field.type === "number" ? (e.target.value === "" ? "" : Number(e.target.value)) : e.target.value;
                onChange(field.id, val);
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
