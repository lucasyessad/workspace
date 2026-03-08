"use client";
import { FormField, FormData } from "@/types";

interface ModuleFormProps {
  fields: FormField[];
  formData: FormData;
  onChange: (id: string, value: string | number) => void;
}

export default function ModuleForm({ fields, formData, onChange }: ModuleFormProps) {
  return (
    <div className="space-y-5">
      {fields.map((field) => (
        <div key={field.id}>
          <label className="block text-body-sm font-medium text-[var(--color-text-primary)] mb-1.5">
            {field.label}
            {field.suffix && <span className="text-[var(--color-text-tertiary)] ml-1 text-caption">({field.suffix})</span>}
          </label>
          {field.type === "textarea" ? (
            <textarea
              className="input-premium min-h-[100px] resize-y"
              placeholder={field.placeholder}
              value={formData[field.id] || ""}
              onChange={(e) => onChange(field.id, e.target.value)}
              rows={4}
            />
          ) : field.type === "select" ? (
            <select
              className="input-premium"
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
              className={`input-premium ${field.type === "number" ? "font-mono" : ""}`}
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
