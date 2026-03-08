import Stripe from "stripe";

/** Client Stripe côté serveur */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
  typescript: true,
});

/** Plans tarifaires avec leurs prix Stripe */
export const PLANS = {
  starter: {
    nom: "Starter",
    prix_dzd: 2500,
    prix_eur: 15,
    stripe_price_id: process.env.STRIPE_PRICE_STARTER,
    fonctionnalites: {
      max_listings: 10,
      max_photos: 5,
      ai_generation: false,
      analytics: false,
      multilang: false,
    },
  },
  pro: {
    nom: "Pro",
    prix_dzd: 5500,
    prix_eur: 35,
    stripe_price_id: process.env.STRIPE_PRICE_PRO,
    fonctionnalites: {
      max_listings: 50,
      max_photos: 15,
      ai_generation: true,
      analytics: true,
      multilang: true,
    },
  },
  enterprise: {
    nom: "Enterprise",
    prix_dzd: null,
    prix_eur: null,
    stripe_price_id: process.env.STRIPE_PRICE_ENTERPRISE,
    fonctionnalites: {
      max_listings: 999999,
      max_photos: 50,
      ai_generation: true,
      analytics: true,
      multilang: true,
    },
  },
} as const;

export type PlanType = keyof typeof PLANS;
