"use client";
import { useState } from "react";
import { Info, X } from "lucide-react";

export default function Disclaimer() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-amber-900/90 border-t border-amber-700/50 backdrop-blur-sm px-4 py-3">
      <div className="max-w-5xl mx-auto flex items-start gap-3">
        <Info size={18} className="text-amber-300 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-100/90 flex-1">
          Les analyses fournies par Patrimoine 360° ont une vocation d&apos;aide à la décision et d&apos;information.
          Elles ne remplacent pas un conseil financier, fiscal ou juridique individualisé délivré par un professionnel habilité.
          Les projections et recommandations reposent sur les données que vous fournissez et sur des hypothèses qui peuvent ne pas refléter votre situation réelle.
          Consultez un conseiller agréé avant toute décision engageante.
        </p>
        <button onClick={() => setVisible(false)} className="text-amber-300 hover:text-white transition flex-shrink-0">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
