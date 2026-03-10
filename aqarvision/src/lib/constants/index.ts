export { WILAYAS, WILAYA_OPTIONS, getWilayaByCode, getWilayaByName, type Wilaya } from './wilayas';

export const TRANSACTION_TYPE_LABELS: Record<string, string> = {
  sale: 'Vente',
  rent: 'Location',
  vacation_rent: 'Location vacances',
};

export const PROPERTY_TYPE_LABELS: Record<string, string> = {
  apartment: 'Appartement',
  house: 'Maison',
  villa: 'Villa',
  studio: 'Studio',
  land: 'Terrain',
  commercial: 'Local commercial',
  office: 'Bureau',
  garage: 'Garage',
  warehouse: 'Entrepôt',
  other: 'Autre',
};

export const PROPERTY_STATUS_LABELS: Record<string, string> = {
  draft: 'Brouillon',
  published: 'Publié',
  archived: 'Archivé',
  sold: 'Vendu',
  rented: 'Loué',
};

export const LEAD_STATUS_LABELS: Record<string, string> = {
  new: 'Nouveau',
  contacted: 'Contacté',
  qualified: 'Qualifié',
  visit_scheduled: 'Visite planifiée',
  negotiation: 'Négociation',
  converted: 'Converti',
  lost: 'Perdu',
};

export const SUBSCRIPTION_PLAN_LABELS: Record<string, string> = {
  starter: 'Starter',
  pro: 'Pro',
  enterprise: 'Enterprise',
};

export const AMENITY_LABELS: Record<string, string> = {
  parking: 'Parking',
  ascenseur: 'Ascenseur',
  gardien: 'Gardien',
  climatisation: 'Climatisation',
  chauffage_central: 'Chauffage central',
  cuisine_equipee: 'Cuisine équipée',
  jardin: 'Jardin',
  piscine: 'Piscine',
  garage: 'Garage',
  terrasse: 'Terrasse',
  balcon: 'Balcon',
  meuble: 'Meublé',
  internet: 'Internet',
  vitrine: 'Vitrine',
  rideau_metallique: 'Rideau métallique',
  viabilise: 'Viabilisé',
  permis_construire: 'Permis de construire',
};
