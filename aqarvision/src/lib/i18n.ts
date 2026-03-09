/** Dictionnaire de traductions FR/AR/EN pour AqarVision */

export type Locale = "fr" | "ar" | "en";

const dictionnaires = {
  fr: {
    // Navigation
    accueil: "Accueil",
    dashboard: "Tableau de bord",
    annonces: "Annonces",
    profil: "Profil",
    connexion: "Connexion",
    inscription: "Inscription",
    deconnexion: "Déconnexion",

    // Formulaire d'annonce
    titre: "Titre",
    description: "Description",
    prix: "Prix (DA)",
    surface: "Surface (m²)",
    type_bien: "Type de bien",
    type_transaction: "Type de transaction",
    statut_document: "Type de papier",
    wilaya: "Wilaya",
    commune: "Commune",
    quartier: "Quartier",
    etage: "Étage",
    nb_pieces: "Nombre de pièces",
    ascenseur: "Ascenseur",
    citerne: "Citerne/Réservoir",
    garage: "Garage",
    jardin: "Jardin",
    photos: "Photos",

    // Actions
    ajouter: "Ajouter",
    modifier: "Modifier",
    supprimer: "Supprimer",
    enregistrer: "Enregistrer",
    annuler: "Annuler",
    generer_ia: "Générer avec IA",
    contacter_whatsapp: "Contacter via WhatsApp",
    appeler: "Appeler",
    voir_details: "Voir les détails",
    rechercher: "Rechercher",

    // Messages
    chargement: "Chargement...",
    aucun_resultat: "Aucun résultat trouvé",
    succes_creation: "Annonce créée avec succès !",
    succes_modification: "Annonce modifiée avec succès !",
    erreur: "Une erreur est survenue",

    // Landing
    bienvenue: "Bienvenue chez",
    nos_biens: "Nos biens disponibles",
    filtrer_par: "Filtrer par",
    tous: "Tous",
    vente: "Vente",
    location: "Location",

    // Marketing immobilier
    securite_juridique: "Sécurité juridique garantie",
    bien_documente: "Bien documenté avec",
    confort_moderne: "Confort moderne",
    emplacement_strategique: "Emplacement stratégique",
    investissement_sur: "Investissement sûr",

    // Recherche globale
    explorer: "Explorer",
    explorer_biens: "Explorer les biens",
    recherche_titre: "Trouvez votre bien idéal",
    recherche_sous_titre: "Recherchez parmi toutes les agences en Algérie",
  },
  ar: {
    accueil: "الرئيسية",
    dashboard: "لوحة التحكم",
    annonces: "الإعلانات",
    profil: "الملف الشخصي",
    connexion: "تسجيل الدخول",
    inscription: "التسجيل",
    deconnexion: "تسجيل الخروج",

    titre: "العنوان",
    description: "الوصف",
    prix: "السعر (د.ج)",
    surface: "المساحة (م²)",
    type_bien: "نوع العقار",
    type_transaction: "نوع المعاملة",
    statut_document: "نوع الوثيقة",
    wilaya: "الولاية",
    commune: "البلدية",
    quartier: "الحي",
    etage: "الطابق",
    nb_pieces: "عدد الغرف",
    ascenseur: "مصعد",
    citerne: "خزان مياه",
    garage: "مرآب",
    jardin: "حديقة",
    photos: "الصور",

    ajouter: "إضافة",
    modifier: "تعديل",
    supprimer: "حذف",
    enregistrer: "حفظ",
    annuler: "إلغاء",
    generer_ia: "توليد بالذكاء الاصطناعي",
    contacter_whatsapp: "تواصل عبر واتساب",
    appeler: "اتصال",
    voir_details: "عرض التفاصيل",
    rechercher: "بحث",

    chargement: "جاري التحميل...",
    aucun_resultat: "لم يتم العثور على نتائج",
    succes_creation: "تم إنشاء الإعلان بنجاح!",
    succes_modification: "تم تعديل الإعلان بنجاح!",
    erreur: "حدث خطأ",

    bienvenue: "مرحبا بكم في",
    nos_biens: "عقاراتنا المتاحة",
    filtrer_par: "تصفية حسب",
    tous: "الكل",
    vente: "بيع",
    location: "إيجار",

    securite_juridique: "ضمان الأمان القانوني",
    bien_documente: "عقار موثق بـ",
    confort_moderne: "راحة عصرية",
    emplacement_strategique: "موقع استراتيجي",
    investissement_sur: "استثمار آمن",

    explorer: "استكشاف",
    explorer_biens: "استكشف العقارات",
    recherche_titre: "ابحث عن عقارك المثالي",
    recherche_sous_titre: "ابحث بين جميع الوكالات في الجزائر",
  },
  en: {
    accueil: "Home",
    dashboard: "Dashboard",
    annonces: "Listings",
    profil: "Profile",
    connexion: "Log in",
    inscription: "Sign up",
    deconnexion: "Log out",

    titre: "Title",
    description: "Description",
    prix: "Price (DZD)",
    surface: "Area (m²)",
    type_bien: "Property type",
    type_transaction: "Transaction type",
    statut_document: "Document status",
    wilaya: "Province",
    commune: "Municipality",
    quartier: "Neighborhood",
    etage: "Floor",
    nb_pieces: "Number of rooms",
    ascenseur: "Elevator",
    citerne: "Water tank",
    garage: "Garage",
    jardin: "Garden",
    photos: "Photos",

    ajouter: "Add",
    modifier: "Edit",
    supprimer: "Delete",
    enregistrer: "Save",
    annuler: "Cancel",
    generer_ia: "Generate with AI",
    contacter_whatsapp: "Contact via WhatsApp",
    appeler: "Call",
    voir_details: "View details",
    rechercher: "Search",

    chargement: "Loading...",
    aucun_resultat: "No results found",
    succes_creation: "Listing created successfully!",
    succes_modification: "Listing updated successfully!",
    erreur: "An error occurred",

    bienvenue: "Welcome to",
    nos_biens: "Available properties",
    filtrer_par: "Filter by",
    tous: "All",
    vente: "Sale",
    location: "Rental",

    securite_juridique: "Legal security guaranteed",
    bien_documente: "Property documented with",
    confort_moderne: "Modern comfort",
    emplacement_strategique: "Strategic location",
    investissement_sur: "Safe investment",

    explorer: "Explore",
    explorer_biens: "Explore properties",
    recherche_titre: "Find your ideal property",
    recherche_sous_titre: "Search across all agencies in Algeria",
  },
} as const;

export type DictionnaireKey = keyof (typeof dictionnaires)["fr"];

/** Récupérer une traduction */
export function t(locale: Locale, key: DictionnaireKey): string {
  return dictionnaires[locale][key];
}

/** Récupérer tout le dictionnaire d'une locale */
export function getDictionnaire(locale: Locale) {
  return dictionnaires[locale];
}

/** Déterminer la direction du texte selon la locale */
export function getDirection(locale: Locale): "ltr" | "rtl" {
  return locale === "ar" ? "rtl" : "ltr";
}
