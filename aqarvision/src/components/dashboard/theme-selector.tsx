"use client";

import { useState } from "react";
import { Check, Paintbrush } from "lucide-react";
import { THEMES, type ThemeDefinition } from "@/lib/themes";

interface ThemeSelectorProps {
  selectedThemeId: string;
  customPrimary: string;
  customAccent: string;
  onSelect: (themeId: string, customPrimary?: string, customAccent?: string) => void;
}

/** Mini-preview of a vitrine theme */
function ThemePreview({
  theme,
  isSelected,
  onClick,
}: {
  theme: ThemeDefinition;
  isSelected: boolean;
  onClick: () => void;
}) {
  const { primary, accent, accentForeground } = theme.colors;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative rounded-xl overflow-hidden border-2 transition-all hover:shadow-card ${
        isSelected
          ? "border-or ring-2 ring-or/20"
          : "border-border hover:border-or/40"
      }`}
    >
      {/* Mini vitrine preview */}
      <div className="w-full aspect-[4/3]">
        {/* Header */}
        <div
          className="h-[45%] relative flex flex-col justify-end p-3"
          style={{ backgroundColor: primary }}
        >
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="w-5 h-5 rounded bg-white/20" />
            <div className="h-2 w-14 rounded bg-white/60" />
          </div>
          <div className="h-1.5 w-20 rounded bg-white/30 mb-2" />
          <div
            className="h-5 w-16 rounded-md flex items-center justify-center"
            style={{ backgroundColor: accent }}
          >
            <span
              className="text-[7px] font-bold"
              style={{ color: accentForeground }}
            >
              WhatsApp
            </span>
          </div>
        </div>

        {/* Content area */}
        <div className="h-[35%] bg-[#fafbfc] p-2 flex gap-1.5">
          <div className="flex-1 rounded bg-white border border-gray-100 p-1.5">
            <div className="w-full h-[60%] rounded bg-gray-100 mb-1" />
            <div className="h-1 w-10 rounded bg-gray-200" />
          </div>
          <div className="flex-1 rounded bg-white border border-gray-100 p-1.5">
            <div className="w-full h-[60%] rounded bg-gray-100 mb-1" />
            <div className="h-1 w-8 rounded bg-gray-200" />
          </div>
        </div>

        {/* Footer */}
        <div
          className="h-[20%]"
          style={{ backgroundColor: primary }}
        />
      </div>

      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute top-2 end-2 w-5 h-5 rounded-full bg-or flex items-center justify-center">
          <Check className="h-3 w-3 text-bleu-nuit" />
        </div>
      )}

      {/* Theme name */}
      <div className="px-3 py-2 bg-white text-center">
        <p className="text-caption font-medium text-foreground">
          {theme.name.fr}
        </p>
      </div>
    </button>
  );
}

/** Custom theme editor */
function CustomThemeEditor({
  primary,
  accent,
  onChange,
}: {
  primary: string;
  accent: string;
  onChange: (primary: string, accent: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 p-4 rounded-xl border border-dashed border-or/30 bg-or/5">
      <div className="space-y-2">
        <label className="text-caption font-medium text-foreground">
          Couleur principale
        </label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={primary}
            onChange={(e) => onChange(e.target.value, accent)}
            className="w-8 h-8 rounded cursor-pointer border border-border"
          />
          <input
            type="text"
            value={primary}
            onChange={(e) => {
              if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) {
                onChange(e.target.value, accent);
              }
            }}
            className="flex-1 px-2 py-1 text-caption font-mono rounded border border-border bg-white"
            placeholder="#000000"
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-caption font-medium text-foreground">
          Couleur accent
        </label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={accent}
            onChange={(e) => onChange(primary, e.target.value)}
            className="w-8 h-8 rounded cursor-pointer border border-border"
          />
          <input
            type="text"
            value={accent}
            onChange={(e) => {
              if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) {
                onChange(primary, e.target.value);
              }
            }}
            className="flex-1 px-2 py-1 text-caption font-mono rounded border border-border bg-white"
            placeholder="#000000"
          />
        </div>
      </div>

      {/* Live preview */}
      <div className="col-span-2 rounded-lg overflow-hidden border border-border">
        <div
          className="h-12 flex items-center px-3 gap-2"
          style={{ backgroundColor: primary }}
        >
          <div className="w-6 h-6 rounded bg-white/20" />
          <div className="h-2 w-16 rounded bg-white/50" />
          <div
            className="ms-auto h-6 px-2 rounded flex items-center"
            style={{ backgroundColor: accent }}
          >
            <span className="text-[8px] font-bold" style={{ color: isLight(accent) ? "#1a1a1a" : "#ffffff" }}>
              Bouton
            </span>
          </div>
        </div>
        <div className="h-8 bg-[#fafbfc]" />
        <div className="h-6" style={{ backgroundColor: primary }} />
      </div>
    </div>
  );
}

function isLight(hex: string): boolean {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5;
}

export function ThemeSelector({
  selectedThemeId,
  customPrimary,
  customAccent,
  onSelect,
}: ThemeSelectorProps) {
  const isCustom = selectedThemeId === "custom";
  const [localPrimary, setLocalPrimary] = useState(customPrimary || "#0c1b2a");
  const [localAccent, setLocalAccent] = useState(customAccent || "#b8963e");

  return (
    <div className="space-y-4">
      {/* Predefined themes grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {THEMES.map((theme) => (
          <ThemePreview
            key={theme.id}
            theme={theme}
            isSelected={selectedThemeId === theme.id}
            onClick={() => onSelect(theme.id)}
          />
        ))}

        {/* Custom theme card */}
        <button
          type="button"
          onClick={() => onSelect("custom", localPrimary, localAccent)}
          className={`relative rounded-xl overflow-hidden border-2 transition-all hover:shadow-card ${
            isCustom
              ? "border-or ring-2 ring-or/20"
              : "border-border hover:border-or/40"
          }`}
        >
          <div className="w-full aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-50 flex flex-col items-center justify-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-white border border-border flex items-center justify-center shadow-sm">
              <Paintbrush className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-caption text-muted-foreground">
              Vos couleurs
            </p>
          </div>
          {isCustom && (
            <div className="absolute top-2 end-2 w-5 h-5 rounded-full bg-or flex items-center justify-center">
              <Check className="h-3 w-3 text-bleu-nuit" />
            </div>
          )}
          <div className="px-3 py-2 bg-white text-center">
            <p className="text-caption font-medium text-foreground">
              Personnalisé
            </p>
          </div>
        </button>
      </div>

      {/* Custom color editor (visible only when custom selected) */}
      {isCustom && (
        <CustomThemeEditor
          primary={localPrimary}
          accent={localAccent}
          onChange={(p, a) => {
            setLocalPrimary(p);
            setLocalAccent(a);
            onSelect("custom", p, a);
          }}
        />
      )}
    </div>
  );
}
