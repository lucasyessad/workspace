// ============================================================
// TabibPro — Messagerie sécurisée (côté médecin)
// Communication avec les patients et les confrères
// ============================================================

'use client';

import { useState, useRef, useEffect } from 'react';

type TypeContact = 'patient' | 'confrere' | 'secretariat';

interface Contact {
  id: string;
  nom: string;
  type: TypeContact;
  specialite?: string;
  dernierMessage: string;
  heure: string;
  nonLus: number;
  enligne: boolean;
}

interface Message {
  id: string;
  contenu: string;
  heure: string;
  date: string;
  expediteur: 'moi' | 'eux';
  type: 'texte' | 'document' | 'ordonnance';
  nomDocument?: string;
}

const CONTACTS: Contact[] = [
  {
    id: 'c-001',
    nom: 'Amina Boulahia',
    type: 'patient',
    dernierMessage: "Docteur, j'ai bien pris les médicaments mais je ressens encore des maux de tête",
    heure: '10:23',
    nonLus: 2,
    enligne: true,
  },
  {
    id: 'c-002',
    nom: 'Dr. Rachid Oukil',
    type: 'confrere',
    specialite: 'Cardiologue — CHU Mustapha',
    dernierMessage: 'Le patient Sahraoui a été pris en charge, rapport disponible',
    heure: '09:15',
    nonLus: 0,
    enligne: false,
  },
  {
    id: 'c-003',
    nom: 'Mohamed Khelifi',
    type: 'patient',
    dernierMessage: 'Merci docteur pour le renouvellement de l\'ordonnance',
    heure: 'Hier',
    nonLus: 0,
    enligne: false,
  },
  {
    id: 'c-004',
    nom: 'Dr. Samia Benali',
    type: 'confrere',
    specialite: 'Endocrinologue — Clinique El-Azhar',
    dernierMessage: 'Pouvez-vous m\'adresser le bilan lipidique du patient ?',
    heure: 'Hier',
    nonLus: 1,
    enligne: true,
  },
  {
    id: 'c-005',
    nom: 'Secrétariat Cabinet',
    type: 'secretariat',
    dernierMessage: '3 nouveaux rendez-vous confirmés pour demain',
    heure: 'Lun',
    nonLus: 0,
    enligne: true,
  },
];

const MESSAGES_PAR_CONTACT: Record<string, Message[]> = {
  'c-001': [
    { id: 'm1', contenu: 'Bonjour Madame Boulahia, comment vous sentez-vous aujourd\'hui ?', heure: '09:00', date: 'Aujourd\'hui', expediteur: 'moi', type: 'texte' },
    { id: 'm2', contenu: 'Bonjour Docteur, un peu mieux mais j\'ai toujours des maux de tête depuis ce matin', heure: '10:05', date: 'Aujourd\'hui', expediteur: 'eux', type: 'texte' },
    { id: 'm3', contenu: 'Je vous ai envoyé l\'ordonnance modifiée avec un antalgique supplémentaire', heure: '10:15', date: 'Aujourd\'hui', expediteur: 'moi', type: 'ordonnance', nomDocument: 'ORD-2026-00045-v2.pdf' },
    { id: 'm4', contenu: "Docteur, j'ai bien pris les médicaments mais je ressens encore des maux de tête", heure: '10:23', date: 'Aujourd\'hui', expediteur: 'eux', type: 'texte' },
  ],
  'c-002': [
    { id: 'm1', contenu: 'Bonjour Rachid, je vous adresse M. Sahraoui, 45 ans, douleur thoracique atypique. ECG normal. Besoin d\'un avis cardio.', heure: '08:30', date: 'Aujourd\'hui', expediteur: 'moi', type: 'texte' },
    { id: 'm2', contenu: 'Bien reçu. Je le prends en consultation cet après-midi.', heure: '08:45', date: 'Aujourd\'hui', expediteur: 'eux', type: 'texte' },
    { id: 'm3', contenu: 'Le patient Sahraoui a été pris en charge, rapport disponible', heure: '09:15', date: 'Aujourd\'hui', expediteur: 'eux', type: 'document', nomDocument: 'Rapport-cardio-Sahraoui.pdf' },
  ],
  'c-003': [
    { id: 'm1', contenu: 'Bonjour Monsieur Khelifi, votre ordonnance de renouvellement est prête.', heure: '14:00', date: 'Hier', expediteur: 'moi', type: 'ordonnance', nomDocument: 'ORD-2026-00046-renouvellement.pdf' },
    { id: 'm2', contenu: 'Merci docteur pour le renouvellement de l\'ordonnance', heure: '15:30', date: 'Hier', expediteur: 'eux', type: 'texte' },
  ],
  'c-004': [
    { id: 'm1', contenu: 'Pouvez-vous m\'adresser le bilan lipidique du patient Mansouri ? Son HbA1c nécessite un suivi endocrinologique.', heure: '16:00', date: 'Hier', expediteur: 'eux', type: 'texte' },
  ],
  'c-005': [
    { id: 'm1', contenu: '3 nouveaux rendez-vous confirmés pour demain matin (9h, 10h, 11h)', heure: '17:00', date: 'Lun', expediteur: 'eux', type: 'texte' },
  ],
};

const TYPE_CONTACT_BADGE: Record<TypeContact, string> = {
  patient: 'bg-blue-100 text-blue-700',
  confrere: 'bg-purple-100 text-purple-700',
  secretariat: 'bg-gray-100 text-gray-700',
};

const TYPE_CONTACT_LABEL: Record<TypeContact, string> = {
  patient: 'Patient',
  confrere: 'Confrère',
  secretariat: 'Secrétariat',
};

export default function MessageriePage() {
  const [contactSelectionne, setContactSelectionne] = useState<Contact | null>(CONTACTS[0]);
  const [message, setMessage] = useState('');
  const [conversations, setConversations] = useState(MESSAGES_PAR_CONTACT);
  const [recherche, setRecherche] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages = contactSelectionne ? (conversations[contactSelectionne.id] ?? []) : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function envoyerMessage() {
    if (!message.trim() || !contactSelectionne) return;
    const nouveau: Message = {
      id: `m-${Date.now()}`,
      contenu: message.trim(),
      heure: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      date: "Aujourd'hui",
      expediteur: 'moi',
      type: 'texte',
    };
    setConversations((prev) => ({
      ...prev,
      [contactSelectionne.id]: [...(prev[contactSelectionne.id] ?? []), nouveau],
    }));
    setMessage('');
  }

  const contactsFiltres = CONTACTS.filter((c) =>
    c.nom.toLowerCase().includes(recherche.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-8rem)] flex bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Colonne gauche — liste des contacts */}
      <div className="w-80 border-r border-gray-200 flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-lg font-semibold text-gray-900 mb-3">Messagerie</h1>
          <input
            type="search"
            placeholder="Rechercher…"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {contactsFiltres.map((c) => (
            <button
              key={c.id}
              onClick={() => setContactSelectionne(c)}
              className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                contactSelectionne?.id === c.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                    {c.nom.charAt(0)}
                  </div>
                  {c.enligne && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm text-gray-900 truncate">{c.nom}</p>
                    <span className="text-xs text-gray-400 flex-shrink-0 ml-1">{c.heure}</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{c.dernierMessage}</p>
                </div>
                {c.nonLus > 0 && (
                  <span className="flex-shrink-0 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {c.nonLus}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Zone de conversation */}
      {contactSelectionne ? (
        <div className="flex-1 flex flex-col min-w-0">
          {/* En-tête conversation */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                  {contactSelectionne.nom.charAt(0)}
                </div>
                {contactSelectionne.enligne && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
                )}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{contactSelectionne.nom}</p>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_CONTACT_BADGE[contactSelectionne.type]}`}>
                    {TYPE_CONTACT_LABEL[contactSelectionne.type]}
                  </span>
                  {contactSelectionne.specialite && (
                    <span className="text-xs text-gray-500">{contactSelectionne.specialite}</span>
                  )}
                  <span className={`text-xs ${contactSelectionne.enligne ? 'text-green-600' : 'text-gray-400'}`}>
                    {contactSelectionne.enligne ? '● En ligne' : '○ Hors ligne'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100" title="Joindre un document">
                📎
              </button>
              <button className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100" title="Envoyer une ordonnance">
                📄
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.expediteur === 'moi' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-sm lg:max-w-md rounded-2xl px-4 py-3 ${
                    msg.expediteur === 'moi'
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                  }`}
                >
                  {msg.type === 'ordonnance' && (
                    <div className={`flex items-center gap-2 mb-2 p-2 rounded-lg ${msg.expediteur === 'moi' ? 'bg-blue-500' : 'bg-gray-200'}`}>
                      <span>📄</span>
                      <span className="text-xs font-medium truncate">{msg.nomDocument}</span>
                    </div>
                  )}
                  {msg.type === 'document' && (
                    <div className={`flex items-center gap-2 mb-2 p-2 rounded-lg ${msg.expediteur === 'moi' ? 'bg-blue-500' : 'bg-gray-200'}`}>
                      <span>📎</span>
                      <span className="text-xs font-medium truncate">{msg.nomDocument}</span>
                    </div>
                  )}
                  <p className="text-sm">{msg.contenu}</p>
                  <p className={`text-xs mt-1 ${msg.expediteur === 'moi' ? 'text-blue-200' : 'text-gray-400'}`}>
                    {msg.heure}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Zone de saisie */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-end gap-3">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    envoyerMessage();
                  }
                }}
                placeholder="Écrire un message sécurisé… (Entrée pour envoyer)"
                rows={2}
                className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <button
                onClick={envoyerMessage}
                disabled={!message.trim()}
                className="bg-blue-600 text-white px-4 py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Envoyer
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              🔒 Messages chiffrés de bout en bout — Conformes au secret médical algérien
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <p className="text-5xl mb-4">💬</p>
            <p>Sélectionnez une conversation</p>
          </div>
        </div>
      )}
    </div>
  );
}
