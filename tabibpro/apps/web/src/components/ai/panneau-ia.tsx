// ============================================================
// TabibPro — Panneau IA (Claude)
// Aide au diagnostic — mode passif — suggestions uniquement
// Anonymisation avant envoi (Loi 18-07)
// ============================================================

'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, Send, Loader2, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';

type TypeRequete =
  | 'DIAGNOSTIC'
  | 'INTERACTIONS'
  | 'LITTERATURE'
  | 'ANALYSE_RESULTATS'
  | 'PROTOCOLES'
  | 'REDACTION'
  | 'DARIJA_TRADUCTION';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  type?: TypeRequete;
}

const TYPES_REQUETE: { value: TypeRequete; label: string; placeholder: string }[] = [
  { value: 'DIAGNOSTIC', label: '🔍 Aide diagnostic', placeholder: 'Décrivez les symptômes (données anonymisées)...' },
  { value: 'INTERACTIONS', label: '💊 Interactions méd.', placeholder: 'Ex: Metformine + Ibuprofène + Ramipril...' },
  { value: 'LITTERATURE', label: '📚 Littérature', placeholder: 'Ex: recommandations HTA diabétique 2025...' },
  { value: 'ANALYSE_RESULTATS', label: '🧪 Analyse résultats', placeholder: 'Collez les valeurs biologiques...' },
  { value: 'PROTOCOLES', label: '📋 Protocoles', placeholder: 'Ex: protocole suivi insuffisance cardiaque...' },
  { value: 'DARIJA_TRADUCTION', label: '🗣️ Darija → FR médical', placeholder: 'Raʿsi yderwouni / راسي يدروني...' },
];

export function PanneauIA() {
  const [ouvert, setOuvert] = useState(false);
  const [type, setType] = useState<TypeRequete>('DIAGNOSTIC');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const typeConfig = TYPES_REQUETE.find((t) => t.value === type)!;

  const envoyer = async () => {
    if (!input.trim() || loading) return;
    const question = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: question, type }]);
    setLoading(true);

    try {
      // TODO: Appel réel API /ai/query avec anonymisation
      await new Promise((r) => setTimeout(r, 1200));
      const reponseDemo = type === 'DARIJA_TRADUCTION'
        ? '**Traduction médicale structurée :**\n\n"راسي يدروني" → Céphalées rotatoires (vertiges)\n\n**Termes associés :** vertige positionnel, nystagmus, trouble de l\'équilibre\n\n*Note : toujours confirmer avec l\'examen clinique.*'
        : type === 'INTERACTIONS'
        ? '**Analyse des interactions :**\n\nMetformine + Ibuprofène → Risque de toxicité rénale et diminution de l\'efficacité de la Metformine.\n\n**Recommandation :** Préférer le Paracétamol comme antalgique chez le diabétique.\n\n*Source : ANPP 2025 — données anonymisées — décision médicale appartient au praticien.*'
        : '**Suggestions diagnostiques (mode passif) :**\n\nSur la base des éléments décrits, les hypothèses à explorer incluent :\n1. ...\n2. ...\n\n*Ces suggestions ne remplacent pas le jugement clinique du médecin.*';

      setMessages((prev) => [...prev, { role: 'assistant', content: reponseDemo }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50 shadow-sm">
      {/* Header cliquable */}
      <button
        onClick={() => setOuvert(!ouvert)}
        className="flex w-full items-center justify-between px-5 py-4"
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-violet-900">Assistant IA — Claude</p>
            <p className="text-xs text-violet-600">Aide médicale — mode passif — anonymisé</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">
            <ShieldCheck className="h-3 w-3" />
            Loi 18-07
          </span>
          {ouvert ? <ChevronUp className="h-4 w-4 text-violet-600" /> : <ChevronDown className="h-4 w-4 text-violet-600" />}
        </div>
      </button>

      {ouvert && (
        <div className="border-t border-violet-200 px-5 pb-5">
          {/* Sélecteur de type */}
          <div className="mt-4 flex flex-wrap gap-2">
            {TYPES_REQUETE.map((t) => (
              <button
                key={t.value}
                onClick={() => setType(t.value)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  type === t.value
                    ? 'bg-violet-600 text-white'
                    : 'bg-white text-violet-700 border border-violet-200 hover:bg-violet-50'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Messages */}
          {messages.length > 0 && (
            <div className="mt-4 max-h-64 overflow-y-auto space-y-3 rounded-lg bg-white/60 p-3">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-violet-600 text-white'
                        : 'bg-white border border-violet-100 text-gray-800 whitespace-pre-wrap'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-xl bg-white border border-violet-100 px-3 py-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-violet-600" />
                    <span className="text-xs text-violet-600">Analyse en cours...</span>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}

          {/* Input */}
          <div className="mt-3 flex gap-2">
            <textarea
              className="flex-1 resize-none rounded-lg border border-violet-200 bg-white px-3 py-2 text-xs placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-violet-400"
              rows={2}
              placeholder={typeConfig.placeholder}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) envoyer();
              }}
            />
            <button
              onClick={envoyer}
              disabled={!input.trim() || loading}
              className="flex h-full items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white hover:bg-violet-700 disabled:opacity-50 transition-colors"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>

          <p className="mt-2 text-[10px] text-violet-500/80 text-center">
            ⚠️ Données anonymisées avant envoi · Suggestions uniquement — le médecin reste seul décideur
          </p>
        </div>
      )}
    </div>
  );
}
