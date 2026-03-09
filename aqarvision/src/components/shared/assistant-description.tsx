"use client";

import { useState } from "react";
import { Sparkles, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AssistantDescriptionProps {
  /** Current description value */
  value: string;
  /** Callback when AI generates text */
  onChange: (text: string) => void;
  /** Context for generation — listing data or agency info */
  context: Record<string, any>;
  /** Type of description to generate */
  type: "listing" | "agence";
  /** Locale for generation */
  locale?: "fr" | "ar" | "en";
  /** Textarea placeholder */
  placeholder?: string;
  /** Max rows */
  rows?: number;
  /** Max length */
  maxLength?: number;
  /** Required field */
  required?: boolean;
  /** Text direction */
  dir?: "ltr" | "rtl";
}

export function AssistantDescription({
  value,
  onChange,
  context,
  type,
  locale = "fr",
  placeholder,
  rows = 6,
  maxLength,
  required,
  dir,
}: AssistantDescriptionProps) {
  const [loading, setLoading] = useState(false);
  const [pointsCles, setPointsCles] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [previousValue, setPreviousValue] = useState<string | null>(null);

  async function generer() {
    if (type === "listing" && !pointsCles.trim()) return;
    setLoading(true);
    setErreur(null);

    // Save current value for undo
    if (value.trim()) {
      setPreviousValue(value);
    }

    try {
      if (type === "listing") {
        // Use existing listing generation API
        const response = await fetch("/api/generer-description", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            points_cles: pointsCles,
            ...context,
            locale,
          }),
        });

        const data = await response.json();
        if (data.erreur) throw new Error(data.erreur);
        if (data.description) {
          onChange(data.description);
        }
      } else {
        // Agency description generation
        const response = await fetch("/api/generer-description-agence", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            points_cles: pointsCles || context.nom_agence,
            nom_agence: context.nom_agence,
            wilaya: context.wilaya,
            commune: context.commune,
            locale,
          }),
        });

        const data = await response.json();
        if (data.erreur) throw new Error(data.erreur);
        if (data.description) {
          onChange(data.description);
        }
      }
    } catch (err: any) {
      setErreur(err.message || "Erreur lors de la génération");
    }

    setLoading(false);
  }

  function annuler() {
    if (previousValue !== null) {
      onChange(previousValue);
      setPreviousValue(null);
    }
  }

  const labels = {
    fr: {
      pointsCles: type === "listing"
        ? "Points clés à mentionner"
        : "Décrivez votre agence en quelques mots",
      pointsClesPlaceholder: type === "listing"
        ? "Ex: Vue sur mer, proche du centre-ville, rénové récemment..."
        : "Ex: Spécialisée dans le résidentiel haut de gamme, 10 ans d'expérience...",
      generer: "Générer avec l'IA",
      generation: "Génération...",
      annuler: "Annuler la génération",
      erreur: "Erreur",
    },
    ar: {
      pointsCles: type === "listing"
        ? "النقاط الرئيسية للذكر"
        : "صِف وكالتك في بضع كلمات",
      pointsClesPlaceholder: type === "listing"
        ? "مثال: إطلالة على البحر، قريب من وسط المدينة، تم تجديده مؤخراً..."
        : "مثال: متخصصون في العقارات الفاخرة، 10 سنوات خبرة...",
      generer: "توليد بالذكاء الاصطناعي",
      generation: "جاري التوليد...",
      annuler: "إلغاء التوليد",
      erreur: "خطأ",
    },
    en: {
      pointsCles: type === "listing"
        ? "Key points to mention"
        : "Describe your agency in a few words",
      pointsClesPlaceholder: type === "listing"
        ? "E.g.: Sea view, close to city center, recently renovated..."
        : "E.g.: Specialized in premium residential, 10 years of experience...",
      generer: "Generate with AI",
      generation: "Generating...",
      annuler: "Undo generation",
      erreur: "Error",
    },
  };

  const t = labels[locale];

  return (
    <div className="space-y-3">
      {/* Points clés input + generate button */}
      <div className="rounded-xl border border-or/20 bg-or/5 p-4 space-y-3">
        <div className="flex items-center gap-2 text-body-sm font-medium text-foreground">
          <Sparkles className="h-4 w-4 text-or" />
          {t.pointsCles}
        </div>
        <textarea
          value={pointsCles}
          onChange={(e) => setPointsCles(e.target.value)}
          placeholder={t.pointsClesPlaceholder}
          rows={2}
          className="w-full px-3 py-2 rounded-lg bg-white border border-border text-body-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-or/30 resize-none"
          dir={dir}
        />
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            onClick={generer}
            disabled={loading || (type === "listing" && !pointsCles.trim())}
            className="bg-or hover:bg-or/90 text-bleu-nuit font-semibold"
          >
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 me-1.5 animate-spin" />
                {t.generation}
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5 me-1.5" />
                {t.generer}
              </>
            )}
          </Button>
          {previousValue !== null && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={annuler}
              className="text-muted-foreground"
            >
              <RotateCcw className="h-3.5 w-3.5 me-1.5" />
              {t.annuler}
            </Button>
          )}
        </div>
        {erreur && (
          <p className="text-caption text-red-500">{erreur}</p>
        )}
      </div>

      {/* Description textarea */}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        required={required}
        dir={dir}
        className="w-full px-4 py-3 rounded-xl bg-blanc-casse border border-border text-body-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-or/30 focus:border-or/50 transition-all resize-none"
      />
      {maxLength && (
        <p className="text-caption text-muted-foreground text-end">
          {value.length}/{maxLength}
        </p>
      )}
    </div>
  );
}
