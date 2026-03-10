'use client';

import { WILAYA_OPTIONS } from '@/lib/constants';

interface WilayaSelectorProps {
  value?: string;
  onChange?: (value: string) => void;
  name?: string;
  required?: boolean;
  className?: string;
}

export function WilayaSelector({ value, onChange, name, required, className }: WilayaSelectorProps) {
  return (
    <select
      name={name}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      required={required}
      className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer ${className ?? ''}`}
    >
      <option value="">Sélectionner une wilaya</option>
      {WILAYA_OPTIONS.map((w) => (
        <option key={w.value} value={w.value}>
          {w.label}
        </option>
      ))}
    </select>
  );
}
