"use client";
import { useState, useCallback } from "react";
import { FormField, FormData } from "@/types";
import { AlertCircle } from "lucide-react";

interface ModuleFormProps {
  fields: FormField[];
  formData: FormData;
  onChange: (id: string, value: string | number) => void;
}

function validateField(field: FormField, value: string | number | undefined): string | null {
  if (value === undefined || value === "") return null; // Empty is allowed
  if (field.type === "number" && typeof value === "number") {
    if (isNaN(value)) return "Veuillez entrer un nombre valide";
    if (value < 0 && !field.id.includes("dette") && !field.id.includes("passif")) {
      return "La valeur ne peut pas être négative";
    }
  }
  return null;
}

export default function ModuleForm({ fields, formData, onChange }: ModuleFormProps) {
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleBlur = useCallback((id: string) => {
    setTouched((prev) => ({ ...prev, [id]: true }));
  }, []);

  return (
    <div className="space-y-5" role="form" aria-label="Formulaire du module">
      {fields.map((field) => {
        const value = formData[field.id];
        const error = touched[field.id] ? validateField(field, value) : null;
        const inputId = `field-${field.id}`;
        const errorId = `error-${field.id}`;

        return (
          <div key={field.id}>
            <label htmlFor={inputId} className="block text-body-sm font-medium text-[var(--color-text-primary)] mb-1.5">
              {field.label}
              {field.suffix && <span className="text-[var(--color-text-tertiary)] ml-1 text-caption">({field.suffix})</span>}
            </label>
            {field.type === "textarea" ? (
              <textarea
                id={inputId}
                className={`input-premium min-h-[100px] resize-y ${error ? "!border-danger-500 !ring-danger-500/20" : ""}`}
                placeholder={field.placeholder}
                value={formData[field.id] || ""}
                onChange={(e) => onChange(field.id, e.target.value)}
                onBlur={() => handleBlur(field.id)}
                aria-invalid={!!error}
                aria-describedby={error ? errorId : undefined}
              />
            ) : field.type === "select" ? (
              <select
                id={inputId}
                className={`input-premium ${error ? "!border-danger-500 !ring-danger-500/20" : ""}`}
                value={formData[field.id] || ""}
                onChange={(e) => onChange(field.id, e.target.value)}
                onBlur={() => handleBlur(field.id)}
                aria-invalid={!!error}
                aria-describedby={error ? errorId : undefined}
              >
                <option value="">Sélectionnez...</option>
                {field.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            ) : (
              <input
                id={inputId}
                type={field.type}
                className={`input-premium ${field.type === "number" ? "font-mono" : ""} ${error ? "!border-danger-500 !ring-danger-500/20" : ""}`}
                placeholder={field.placeholder}
                value={formData[field.id] ?? ""}
                onChange={(e) => {
                  const val = field.type === "number" ? (e.target.value === "" ? "" : Number(e.target.value)) : e.target.value;
                  onChange(field.id, val);
                }}
                onBlur={() => handleBlur(field.id)}
                aria-invalid={!!error}
                aria-describedby={error ? errorId : undefined}
              />
            )}
            {error && (
              <p id={errorId} className="flex items-center gap-1 mt-1.5 text-caption text-danger-500" role="alert">
                <AlertCircle size={12} /> {error}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
