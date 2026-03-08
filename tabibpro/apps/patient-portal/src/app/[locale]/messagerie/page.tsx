'use client';

// ============================================================
// TabibPro — Portail Patient — Messagerie Sécurisée
// Interface chat style WhatsApp — Loi 18-07
// ============================================================

import { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  auteur: 'MEDECIN' | 'PATIENT';
  contenu: string;
  timestamp: string;
}

interface Conversation {
  id: string;
  medecin: string;
  specialite: string;
  nonLus: number;
  dernierMessage: string;
  derniereDate: string;
}

const conversationsData: Conversation[] = [
  {
    id: 'conv-1',
    medecin: 'Dr. Meziane Ahmed',
    specialite: 'Médecin Généraliste',
    nonLus: 0,
    dernierMessage: 'Parfait ! Continuez le traitement…',
    derniereDate: '04 mars',
  },
  {
    id: 'conv-2',
    medecin: 'Dr. Boudiaf Sara',
    specialite: 'Cardiologue',
    nonLus: 1,
    dernierMessage: "Vos résultats d'analyse sont disponibles.",
    derniereDate: '28 fév.',
  },
];

const messagesData: Record<string, Message[]> = {
  'conv-1': [
    {
      id: '1',
      auteur: 'MEDECIN',
      contenu: 'Bonjour M. Benali, comment vous sentez-vous depuis votre dernière consultation ?',
      timestamp: '2026-03-04T09:15:00',
    },
    {
      id: '2',
      auteur: 'PATIENT',
      contenu: 'Bonjour Docteur, la tension est stabilisée à 130/80 ce matin.',
      timestamp: '2026-03-04T10:32:00',
    },
    {
      id: '3',
      auteur: 'MEDECIN',
      contenu: 'Parfait ! Continuez le traitement et revenez me voir dans 3 semaines. بالشفاء',
      timestamp: '2026-03-04T11:05:00',
    },
  ],
  'conv-2': [
    {
      id: '4',
      auteur: 'MEDECIN',
      contenu: "Bonjour M. Benali, vos résultats d'analyse sont disponibles. Tout est normal.",
      timestamp: '2026-02-28T14:20:00',
    },
  ],
};

function formatHeure(ts: string): string {
  return new Date(ts).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter((w) => w.length > 1)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function IconSend() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function IconBack() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

export default function MessageriePage() {
  const [convActive, setConvActive] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>(messagesData);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, convActive]);

  function handleSend() {
    if (!input.trim() || !convActive) return;
    const newMsg: Message = {
      id: Date.now().toString(),
      auteur: 'PATIENT',
      contenu: input.trim(),
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => ({
      ...prev,
      [convActive]: [...(prev[convActive] || []), newMsg],
    }));
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }

  const convMessages = convActive ? (messages[convActive] || []) : [];
  const convInfo = conversationsData.find((c) => c.id === convActive);

  const ListeConversations = (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-gray-100">
        <h1 className="text-xl font-bold text-gray-800">Messagerie</h1>
        <p className="text-xs text-emerald-700 mt-0.5">
          🔒 Messagerie sécurisée — Vos données sont protégées (Loi 18-07)
        </p>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversationsData.map((conv) => (
          <button
            key={conv.id}
            onClick={() => setConvActive(conv.id)}
            className="w-full flex items-start gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors border-b border-gray-50 text-left"
          >
            <div className="relative shrink-0">
              <div className="w-11 h-11 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 text-sm font-bold">
                {getInitials(conv.medecin)}
              </div>
              {conv.nonLus > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-emerald-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {conv.nonLus}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className={`text-sm font-semibold ${conv.nonLus > 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                  {conv.medecin}
                </p>
                <span className="text-xs text-gray-400 shrink-0">{conv.derniereDate}</span>
              </div>
              <p className="text-xs text-gray-500">{conv.specialite}</p>
              <p className={`text-xs truncate mt-0.5 ${conv.nonLus > 0 ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
                {conv.dernierMessage}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const VueConversation = convActive && convInfo ? (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white">
        <button
          onClick={() => setConvActive(null)}
          className="md:hidden text-gray-500 hover:text-gray-700 transition-colors mr-1"
          aria-label="Retour"
        >
          <IconBack />
        </button>
        <div className="w-9 h-9 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 text-xs font-bold shrink-0">
          {getInitials(convInfo.medecin)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-800 text-sm">{convInfo.medecin}</p>
          <p className="text-xs text-gray-500">{convInfo.specialite}</p>
        </div>
        <span className="text-xs text-emerald-600 flex items-center gap-1 shrink-0">
          🔒 <span className="hidden sm:block">Sécurisé</span>
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">
        {convMessages.map((msg) => {
          const isPatient = msg.auteur === 'PATIENT';
          const hasArabic = /[\u0600-\u06FF]/.test(msg.contenu);
          return (
            <div key={msg.id} className={`flex ${isPatient ? 'justify-end' : 'justify-start'}`}>
              {!isPatient && (
                <div className="w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 text-xs font-bold shrink-0 mr-2 mt-1">
                  {getInitials(convInfo.medecin)}
                </div>
              )}
              <div className="max-w-[75%] sm:max-w-sm">
                <div
                  className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    isPatient
                      ? 'bg-emerald-100 text-emerald-900 rounded-br-none'
                      : 'bg-white text-gray-800 rounded-bl-none shadow-sm border border-gray-100'
                  }`}
                >
                  {hasArabic ? (
                    <p>
                      {msg.contenu.split(/([\u0600-\u06FF\s،؟]+)/).map((part, i) =>
                        /[\u0600-\u06FF]/.test(part) ? (
                          <span key={i} dir="rtl" className="inline">{part}</span>
                        ) : (
                          <span key={i}>{part}</span>
                        )
                      )}
                    </p>
                  ) : (
                    <p>{msg.contenu}</p>
                  )}
                </div>
                <p className={`text-[11px] text-gray-400 mt-0.5 ${isPatient ? 'text-right' : 'text-left'}`}>
                  {formatHeure(msg.timestamp)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Note sécurité */}
      <div className="px-4 py-1.5 bg-white border-t border-gray-100">
        <p className="text-[11px] text-gray-400 text-center">
          🔒 Messagerie sécurisée — Vos données sont protégées (Loi 18-07)
        </p>
      </div>

      {/* Zone saisie */}
      <div className="px-4 py-3 bg-white border-t border-gray-200">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            className="flex-1 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent min-h-[44px] max-h-28"
            placeholder="Écrire un message..."
            rows={1}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-colors ${
              input.trim()
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
            aria-label="Envoyer"
          >
            <IconSend />
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div className="-mx-4 -my-6">
      {/* Desktop: split view */}
      <div className="hidden md:flex h-[calc(100vh-3.5rem-3rem)] border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm mx-4 mt-2">
        <div className="w-72 border-r border-gray-100 flex flex-col overflow-hidden shrink-0">
          {ListeConversations}
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">
          {convActive && VueConversation ? (
            VueConversation
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-200 mb-3">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <p className="text-sm">Sélectionnez une conversation</p>
              <p className="text-xs mt-1">🔒 Messagerie sécurisée (Loi 18-07)</p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile: liste ou conversation */}
      <div className="md:hidden h-[calc(100vh-3.5rem-4rem)] overflow-hidden">
        {convActive ? VueConversation : ListeConversations}
      </div>
    </div>
  );
}
