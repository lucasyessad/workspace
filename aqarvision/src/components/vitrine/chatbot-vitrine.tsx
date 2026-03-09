"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Search,
  Home,
  DollarSign,
  MapPin,
  Phone,
  Sparkles,
} from "lucide-react";
import { formatPrix, formatSurface } from "@/lib/utils";
import type { Listing } from "@/types";

/* ── Types ── */
type Locale = "fr" | "ar" | "en";

interface Message {
  id: string;
  role: "bot" | "user";
  text: string;
  listings?: Listing[];
  timestamp: Date;
}

interface ChatbotVitrineProps {
  annonces: Listing[];
  nomAgence: string;
  telephone: string;
  slugAgence: string;
  locale: Locale;
  wilayaMap: Record<number, { nom_fr: string; nom_ar: string }>;
}

/* ── Translations ── */
const labels = {
  fr: {
    titre: "Assistant",
    sousTitre: "en ligne",
    placeholder: "Écrivez votre message...",
    bienvenue: (nom: string) =>
      `Bonjour ! Je suis l'assistant virtuel de **${nom}**. Comment puis-je vous aider ?`,
    suggestions: [
      { icon: "search", text: "Que proposez-vous à la vente ?" },
      { icon: "home", text: "Quels types de biens avez-vous ?" },
      { icon: "dollar", text: "Quel est votre bien le moins cher ?" },
      { icon: "map", text: "Dans quelles wilayas êtes-vous ?" },
    ],
    contactez: "Pour plus d'informations, contactez-nous :",
    whatsapp: "WhatsApp",
    appeler: "Appeler",
    resultats: (n: number) => `J'ai trouvé **${n} bien(s)** correspondant(s) :`,
    aucun: "Je n'ai trouvé aucun bien correspondant à votre recherche. Essayez avec d'autres critères ou contactez-nous directement.",
    voirBien: "Voir le bien",
    vente: "vente",
    location: "location",
    biens_vente: (n: number) =>
      `Nous avons **${n} bien(s) à la vente**. Voici les plus récents :`,
    biens_location: (n: number) =>
      `Nous avons **${n} bien(s) en location**. Voici les plus récents :`,
    types_dispo: (types: string[]) =>
      `Nous proposons les types de biens suivants : **${types.join(", ")}**.`,
    moins_cher: (bien: Listing) =>
      `Notre bien le moins cher est à **${formatPrix(bien.prix)}** :`,
    plus_cher: (bien: Listing) =>
      `Notre bien le plus cher est à **${formatPrix(bien.prix)}** :`,
    wilayas: (noms: string[]) =>
      `Nous sommes présents dans les wilayas suivantes : **${noms.join(", ")}**.`,
    da: "DA",
    mois: "/mois",
  },
  ar: {
    titre: "المساعد",
    sousTitre: "متصل",
    placeholder: "اكتب رسالتك...",
    bienvenue: (nom: string) =>
      `مرحباً! أنا المساعد الافتراضي لـ **${nom}**. كيف يمكنني مساعدتك؟`,
    suggestions: [
      { icon: "search", text: "ماذا تعرضون للبيع؟" },
      { icon: "home", text: "ما أنواع العقارات المتاحة؟" },
      { icon: "dollar", text: "ما هو أرخص عقار لديكم؟" },
      { icon: "map", text: "في أي ولايات تتواجدون؟" },
    ],
    contactez: "للمزيد من المعلومات، تواصلوا معنا:",
    whatsapp: "واتساب",
    appeler: "اتصال",
    resultats: (n: number) => `وجدت **${n} عقار(ات)** مطابقة:`,
    aucun: "لم أجد أي عقار يطابق بحثك. حاول بمعايير أخرى أو تواصل معنا مباشرة.",
    voirBien: "عرض العقار",
    vente: "بيع",
    location: "إيجار",
    biens_vente: (n: number) => `لدينا **${n} عقار(ات) للبيع**. إليك الأحدث:`,
    biens_location: (n: number) =>
      `لدينا **${n} عقار(ات) للإيجار**. إليك الأحدث:`,
    types_dispo: (types: string[]) =>
      `نوفر أنواع العقارات التالية: **${types.join("، ")}**.`,
    moins_cher: (bien: Listing) =>
      `أرخص عقار لدينا بسعر **${formatPrix(bien.prix)}**:`,
    plus_cher: (bien: Listing) =>
      `أغلى عقار لدينا بسعر **${formatPrix(bien.prix)}**:`,
    wilayas: (noms: string[]) =>
      `نتواجد في الولايات التالية: **${noms.join("، ")}**.`,
    da: "د.ج",
    mois: "/شهر",
  },
  en: {
    titre: "Assistant",
    sousTitre: "online",
    placeholder: "Type your message...",
    bienvenue: (nom: string) =>
      `Hello! I'm the virtual assistant for **${nom}**. How can I help you?`,
    suggestions: [
      { icon: "search", text: "What do you have for sale?" },
      { icon: "home", text: "What types of properties do you offer?" },
      { icon: "dollar", text: "What's your cheapest property?" },
      { icon: "map", text: "In which wilayas are you located?" },
    ],
    contactez: "For more information, contact us:",
    whatsapp: "WhatsApp",
    appeler: "Call",
    resultats: (n: number) => `I found **${n} matching propert${n > 1 ? "ies" : "y"}**:`,
    aucun: "I couldn't find any matching properties. Try different criteria or contact us directly.",
    voirBien: "View property",
    vente: "sale",
    location: "rental",
    biens_vente: (n: number) =>
      `We have **${n} propert${n > 1 ? "ies" : "y"} for sale**. Here are the latest:`,
    biens_location: (n: number) =>
      `We have **${n} rental propert${n > 1 ? "ies" : "y"}**. Here are the latest:`,
    types_dispo: (types: string[]) =>
      `We offer the following property types: **${types.join(", ")}**.`,
    moins_cher: (bien: Listing) =>
      `Our cheapest property is at **${formatPrix(bien.prix)}**:`,
    plus_cher: (bien: Listing) =>
      `Our most expensive property is at **${formatPrix(bien.prix)}**:`,
    wilayas: (noms: string[]) =>
      `We are present in the following wilayas: **${noms.join(", ")}**.`,
    da: "DZD",
    mois: "/mo",
  },
};

/* ── Icon helper ── */
function SuggestionIcon({ icon }: { icon: string }) {
  const cls = "h-3.5 w-3.5 text-or";
  switch (icon) {
    case "search":
      return <Search className={cls} />;
    case "home":
      return <Home className={cls} />;
    case "dollar":
      return <DollarSign className={cls} />;
    case "map":
      return <MapPin className={cls} />;
    default:
      return <Sparkles className={cls} />;
  }
}

/* ── Simple markdown bold ── */
function renderText(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-semibold">
        {part}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

/* ═══════════════════════════════════════════
   CHATBOT COMPONENT
   ═══════════════════════════════════════════ */
export function ChatbotVitrine({
  annonces,
  nomAgence,
  telephone,
  slugAgence,
  locale,
  wilayaMap,
}: ChatbotVitrineProps) {
  const t = labels[locale];
  const [ouvert, setOuvert] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "bot",
          text: t.bienvenue(nomAgence),
          timestamp: new Date(),
        },
      ]);
    }
  }, []);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Focus input when opening
  useEffect(() => {
    if (ouvert) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [ouvert]);

  /* ── Precomputed data ── */
  const biensVente = useMemo(
    () => annonces.filter((a) => a.type_transaction === "Vente"),
    [annonces]
  );
  const biensLocation = useMemo(
    () => annonces.filter((a) => a.type_transaction === "Location"),
    [annonces]
  );
  const typesDisponibles = useMemo(
    () => Array.from(new Set(annonces.map((a) => a.type_bien))).sort(),
    [annonces]
  );
  const wilayasDisponibles = useMemo(() => {
    const ids = Array.from(new Set(annonces.map((a) => a.wilaya_id)));
    return ids
      .map((id) => {
        const w = wilayaMap[id];
        return w ? (locale === "ar" ? w.nom_ar : w.nom_fr) : null;
      })
      .filter(Boolean) as string[];
  }, [annonces, wilayaMap, locale]);

  /* ── Bot response logic ── */
  const generateResponse = useCallback(
    (userMsg: string): { text: string; listings?: Listing[] } => {
      const msg = userMsg.toLowerCase().trim();

      // Sale queries
      if (
        msg.includes("vente") ||
        msg.includes("acheter") ||
        msg.includes("achat") ||
        msg.includes("بيع") ||
        msg.includes("شراء") ||
        msg.includes("sale") ||
        msg.includes("buy")
      ) {
        const biens = biensVente.slice(0, 3);
        return {
          text: t.biens_vente(biensVente.length),
          listings: biens.length > 0 ? biens : undefined,
        };
      }

      // Rental queries
      if (
        msg.includes("location") ||
        msg.includes("louer") ||
        msg.includes("loyer") ||
        msg.includes("إيجار") ||
        msg.includes("كراء") ||
        msg.includes("rent") ||
        msg.includes("rental")
      ) {
        const biens = biensLocation.slice(0, 3);
        return {
          text: t.biens_location(biensLocation.length),
          listings: biens.length > 0 ? biens : undefined,
        };
      }

      // Property types
      if (
        msg.includes("type") ||
        msg.includes("genre") ||
        msg.includes("نوع") ||
        msg.includes("أنواع") ||
        msg.includes("kind") ||
        msg.includes("categ")
      ) {
        return { text: t.types_dispo(typesDisponibles) };
      }

      // Cheapest
      if (
        msg.includes("moins cher") ||
        msg.includes("pas cher") ||
        msg.includes("prix bas") ||
        msg.includes("أرخص") ||
        msg.includes("أقل سعر") ||
        msg.includes("cheap") ||
        msg.includes("lowest") ||
        msg.includes("affordable")
      ) {
        if (annonces.length === 0) return { text: t.aucun };
        const sorted = [...annonces].sort((a, b) => a.prix - b.prix);
        return { text: t.moins_cher(sorted[0]), listings: [sorted[0]] };
      }

      // Most expensive
      if (
        msg.includes("plus cher") ||
        msg.includes("cher") ||
        msg.includes("أغلى") ||
        msg.includes("أعلى سعر") ||
        msg.includes("expensive") ||
        msg.includes("highest")
      ) {
        if (annonces.length === 0) return { text: t.aucun };
        const sorted = [...annonces].sort((a, b) => b.prix - a.prix);
        return { text: t.plus_cher(sorted[0]), listings: [sorted[0]] };
      }

      // Wilayas / location
      if (
        msg.includes("wilaya") ||
        msg.includes("ولاي") ||
        msg.includes("où") ||
        msg.includes("emplacement") ||
        msg.includes("localisation") ||
        msg.includes("أين") ||
        msg.includes("where") ||
        msg.includes("location") ||
        msg.includes("area")
      ) {
        return { text: t.wilayas(wilayasDisponibles) };
      }

      // Visit / appointment
      if (
        msg.includes("visite") ||
        msg.includes("visiter") ||
        msg.includes("rendez-vous") ||
        msg.includes("rdv") ||
        msg.includes("planifier") ||
        msg.includes("programmer") ||
        msg.includes("voir le bien") ||
        msg.includes("زيارة") ||
        msg.includes("موعد") ||
        msg.includes("visit") ||
        msg.includes("appointment") ||
        msg.includes("schedule") ||
        msg.includes("viewing")
      ) {
        const visitTexts: Record<Locale, string> = {
          fr: `Bien sûr ! Pour planifier une visite, contactez-nous directement et nous organiserons un rendez-vous à votre convenance.\n\n${t.contactez}\n📱 ${telephone}`,
          ar: `بالتأكيد! لتحديد موعد زيارة، تواصلوا معنا مباشرة وسننظم لكم موعداً مناسباً.\n\n${t.contactez}\n📱 ${telephone}`,
          en: `Of course! To schedule a visit, contact us directly and we'll arrange a viewing at your convenience.\n\n${t.contactez}\n📱 ${telephone}`,
        };
        return { text: visitTexts[locale] };
      }

      // Greetings
      if (
        msg.match(/^(bonjour|bonsoir|salut|coucou|hello|hi|hey|مرحبا|السلام|سلام)/)
      ) {
        const greetTexts: Record<Locale, string> = {
          fr: `Bonjour ! Comment puis-je vous aider aujourd'hui ? N'hésitez pas à me poser vos questions sur nos biens disponibles.`,
          ar: `مرحباً! كيف يمكنني مساعدتك اليوم؟ لا تتردد في طرح أي سؤال حول عقاراتنا المتاحة.`,
          en: `Hello! How can I help you today? Feel free to ask me anything about our available properties.`,
        };
        return { text: greetTexts[locale] };
      }

      // Thanks
      if (
        msg.match(/(merci|شكر|thank|thanks)/)
      ) {
        const thanksTexts: Record<Locale, string> = {
          fr: `Avec plaisir ! N'hésitez pas si vous avez d'autres questions. 😊`,
          ar: `على الرحب والسعة! لا تتردد إذا كان لديك أسئلة أخرى. 😊`,
          en: `You're welcome! Don't hesitate if you have more questions. 😊`,
        };
        return { text: thanksTexts[locale] };
      }

      // Hours / availability
      if (
        msg.includes("horaire") ||
        msg.includes("ouvert") ||
        msg.includes("heure") ||
        msg.includes("disponib") ||
        msg.includes("ساعات") ||
        msg.includes("مفتوح") ||
        msg.includes("hours") ||
        msg.includes("open") ||
        msg.includes("available")
      ) {
        const hoursTexts: Record<Locale, string> = {
          fr: `Pour connaître nos horaires d'ouverture ou notre disponibilité, contactez-nous directement.\n\n${t.contactez}\n📱 ${telephone}`,
          ar: `لمعرفة ساعات العمل أو التواجد، تواصلوا معنا مباشرة.\n\n${t.contactez}\n📱 ${telephone}`,
          en: `For our opening hours or availability, please contact us directly.\n\n${t.contactez}\n📱 ${telephone}`,
        };
        return { text: hoursTexts[locale] };
      }

      // Contact
      if (
        msg.includes("contact") ||
        msg.includes("telephone") ||
        msg.includes("téléphone") ||
        msg.includes("whatsapp") ||
        msg.includes("اتصال") ||
        msg.includes("تواصل") ||
        msg.includes("phone") ||
        msg.includes("call") ||
        msg.includes("numéro") ||
        msg.includes("رقم")
      ) {
        return {
          text: `${t.contactez}\n📱 ${telephone}`,
        };
      }

      // Price-based search (detect numbers)
      const priceMatch = msg.match(/(\d[\d\s]*\d)/);
      if (priceMatch) {
        const targetPrice = parseInt(priceMatch[1].replace(/\s/g, ""), 10);
        if (targetPrice > 0) {
          const matching = annonces
            .filter(
              (a) =>
                a.prix >= targetPrice * 0.7 && a.prix <= targetPrice * 1.3
            )
            .slice(0, 3);
          if (matching.length > 0) {
            return { text: t.resultats(matching.length), listings: matching };
          }
        }
      }

      // Property type search
      const typeMatch = typesDisponibles.find(
        (type) =>
          msg.includes(type.toLowerCase()) ||
          msg.includes(type.toLowerCase().replace("appartement ", "f"))
      );
      if (typeMatch) {
        const matching = annonces
          .filter((a) => a.type_bien === typeMatch)
          .slice(0, 3);
        if (matching.length > 0) {
          return { text: t.resultats(matching.length), listings: matching };
        }
      }

      // Default: helpful fallback
      const defaultTexts: Record<Locale, string> = {
        fr: `Je ne suis pas sûr de comprendre votre demande. Voici ce que je peux faire :\n• Rechercher des biens (vente, location)\n• Vous informer sur les types de biens disponibles\n• Vous donner les prix\n• Vous indiquer nos coordonnées\n\nOu contactez-nous directement :\n📱 ${telephone}`,
        ar: `لم أفهم طلبك تماماً. إليك ما يمكنني مساعدتك فيه:\n• البحث عن عقارات (بيع، إيجار)\n• معرفة أنواع العقارات المتاحة\n• الأسعار\n• معلومات الاتصال\n\nأو تواصلوا معنا مباشرة:\n📱 ${telephone}`,
        en: `I'm not sure I understand your request. Here's what I can help with:\n• Search properties (sale, rental)\n• Available property types\n• Pricing information\n• Contact details\n\nOr contact us directly:\n📱 ${telephone}`,
      };
      return { text: defaultTexts[locale] };
    },
    [
      annonces,
      biensVente,
      biensLocation,
      typesDisponibles,
      wilayasDisponibles,
      telephone,
      t,
    ]
  );

  /* ── Send message ── */
  const envoyer = useCallback(
    (text?: string) => {
      const msg = text || input.trim();
      if (!msg) return;

      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        text: msg,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setIsTyping(true);

      // Simulate typing delay
      setTimeout(() => {
        const response = generateResponse(msg);
        const botMessage: Message = {
          id: `bot-${Date.now()}`,
          role: "bot",
          text: response.text,
          listings: response.listings,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);
        setIsTyping(false);
      }, 600 + Math.random() * 400);
    },
    [input, generateResponse]
  );

  return (
    <>
      {/* ═══ Floating button ═══ */}
      <button
        onClick={() => setOuvert(!ouvert)}
        className={`fixed bottom-6 ${
          locale === "ar" ? "left-6" : "right-6"
        } z-50 w-14 h-14 rounded-full shadow-float flex items-center justify-center transition-all duration-300 hover:scale-105 ${
          ouvert
            ? "bg-bleu-nuit text-white rotate-0"
            : "bg-or text-bleu-nuit"
        }`}
        aria-label="Chat"
      >
        {ouvert ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </button>

      {/* Notification dot */}
      {!ouvert && messages.length <= 1 && (
        <span
          className={`fixed bottom-[4.2rem] ${
            locale === "ar" ? "left-6" : "right-6"
          } z-50 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white animate-pulse pointer-events-none`}
        />
      )}

      {/* ═══ Chat panel ═══ */}
      <div
        className={`fixed ${
          locale === "ar" ? "left-6" : "right-6"
        } bottom-24 z-50 w-[360px] max-w-[calc(100vw-3rem)] transition-all duration-300 origin-bottom-right ${
          ouvert
            ? "scale-100 opacity-100 translate-y-0"
            : "scale-95 opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        <div className="bg-white rounded-2xl shadow-float border border-border overflow-hidden flex flex-col h-[520px] max-h-[70vh]">
          {/* Header */}
          <div className="bg-bleu-nuit px-5 py-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-or/20 flex items-center justify-center flex-shrink-0">
              <Bot className="h-5 w-5 text-or" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-body-sm font-semibold text-white truncate">
                {nomAgence} · {t.titre}
              </p>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-caption text-white/50">{t.sousTitre}</span>
              </div>
            </div>
            <button
              onClick={() => setOuvert(false)}
              className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <X className="h-4 w-4 text-white/60" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${
                  msg.role === "user" ? "flex-row-reverse" : ""
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === "bot"
                      ? "bg-or/10 text-or"
                      : "bg-bleu-nuit text-white"
                  }`}
                >
                  {msg.role === "bot" ? (
                    <Bot className="h-3.5 w-3.5" />
                  ) : (
                    <User className="h-3.5 w-3.5" />
                  )}
                </div>

                <div
                  className={`max-w-[80%] ${
                    msg.role === "user" ? "text-end" : ""
                  }`}
                >
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-body-sm leading-relaxed ${
                      msg.role === "bot"
                        ? "bg-muted text-foreground rounded-tl-md"
                        : "bg-bleu-nuit text-white rounded-tr-md"
                    }`}
                  >
                    {renderText(msg.text)}
                  </div>

                  {/* Listing cards */}
                  {msg.listings && msg.listings.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {msg.listings.map((bien) => {
                        const w = wilayaMap[bien.wilaya_id];
                        const wNom = w
                          ? locale === "ar"
                            ? w.nom_ar
                            : w.nom_fr
                          : "";
                        return (
                          <a
                            key={bien.id}
                            href={`/${locale}/${slugAgence}/${bien.id}`}
                            className="block rounded-xl border border-border overflow-hidden bg-white hover:shadow-card transition-shadow group"
                          >
                            {bien.photos?.[0] && (
                              <div className="h-24 overflow-hidden">
                                <img
                                  src={bien.photos[0]}
                                  alt={bien.titre}
                                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                                />
                              </div>
                            )}
                            <div className="p-3">
                              <p className="text-caption font-semibold text-foreground line-clamp-1">
                                {bien.titre}
                              </p>
                              <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                <MapPin className="h-2.5 w-2.5" />
                                {bien.commune && `${bien.commune}, `}
                                {wNom}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-caption font-bold text-or">
                                  {formatPrix(bien.prix)}
                                  {bien.type_transaction === "Location" && (
                                    <span className="text-[10px] text-muted-foreground font-normal">
                                      {t.mois}
                                    </span>
                                  )}
                                </span>
                                <span className="text-[10px] text-muted-foreground">
                                  {formatSurface(bien.surface)}
                                </span>
                              </div>
                            </div>
                          </a>
                        );
                      })}
                    </div>
                  )}

                  <p className="text-[10px] text-muted-foreground mt-1 px-1">
                    {msg.timestamp.toLocaleTimeString(
                      locale === "ar" ? "ar-DZ" : locale === "en" ? "en-US" : "fr-FR",
                      { hour: "2-digit", minute: "2-digit" }
                    )}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex gap-2.5">
                <div className="w-7 h-7 rounded-full bg-or/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-3.5 w-3.5 text-or" />
                </div>
                <div className="bg-muted rounded-2xl rounded-tl-md px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0ms]" />
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:150ms]" />
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions (only shown after welcome) */}
          {messages.length <= 1 && (
            <div className="px-4 pb-3">
              <div className="grid grid-cols-2 gap-2">
                {t.suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => envoyer(s.text)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-border bg-white text-start text-[11px] font-medium text-foreground hover:bg-muted hover:border-foreground/20 transition-all"
                  >
                    <SuggestionIcon icon={s.icon} />
                    <span className="line-clamp-2">{s.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="border-t border-border px-4 py-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                envoyer();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t.placeholder}
                className="flex-1 h-10 px-4 rounded-xl bg-muted border-0 text-body-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-or/30"
                dir={locale === "ar" ? "rtl" : "ltr"}
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="w-10 h-10 rounded-xl bg-or text-bleu-nuit flex items-center justify-center hover:bg-or/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
