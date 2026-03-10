-- ============================================================================
-- AqarVision V1 — Seed Data
-- Demo agency + properties for development
-- ============================================================================

-- Demo agency
INSERT INTO public.agencies (
  id, name, slug, slogan, description, phone, email, address,
  wilaya, license_number, is_verified, active_plan, subscription_status,
  primary_color
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Immobilière El Djazair',
  'immobiliere-el-djazair',
  'Votre partenaire immobilier de confiance à Alger',
  'Agence immobilière spécialisée dans la vente et la location de biens résidentiels et commerciaux dans la wilaya d''Alger. Plus de 10 ans d''expérience au service de nos clients.',
  '+213 555 12 34 56',
  'contact@eldjazair-immo.dz',
  '12 Rue Didouche Mourad, Alger Centre',
  'Alger',
  'RC-16/00-1234567B90',
  true,
  'pro',
  'active',
  '#0c1b2a'
);

-- Demo subscription
INSERT INTO public.subscriptions (
  id, agency_id, plan_code, status, billing_mode, start_date, renewal_date
) VALUES (
  '00000000-0000-0000-0000-000000000010',
  '00000000-0000-0000-0000-000000000001',
  'pro',
  'active',
  'manual',
  now(),
  now() + interval '30 days'
);

-- Demo properties
INSERT INTO public.properties (
  id, agency_id, title, slug, transaction_type, property_type,
  price, currency, negotiable, surface, rooms, bedrooms, bathrooms,
  wilaya, commune, quartier, description, amenities, status,
  is_featured, is_verified, published_at
) VALUES
(
  '00000000-0000-0000-0000-000000000101',
  '00000000-0000-0000-0000-000000000001',
  'Appartement F4 standing — Hydra',
  'appartement-f4-standing-hydra',
  'sale',
  'apartment',
  35000000, 'DZD', true,
  140, 4, 3, 2,
  'Alger', 'Hydra', 'Paradou',
  'Magnifique appartement F4 dans une résidence sécurisée à Hydra. Vue dégagée, finitions haut standing, cuisine équipée, parking sous-sol. Proche de toutes commodités.',
  ARRAY['parking', 'ascenseur', 'gardien', 'climatisation', 'cuisine_equipee'],
  'published', true, true, now()
),
(
  '00000000-0000-0000-0000-000000000102',
  '00000000-0000-0000-0000-000000000001',
  'Villa R+1 avec jardin — Chéraga',
  'villa-r1-jardin-cheraga',
  'sale',
  'villa',
  85000000, 'DZD', false,
  350, 7, 5, 3,
  'Alger', 'Chéraga', 'Résidence Les Oliviers',
  'Villa indépendante R+1 avec jardin arboré de 200m². Construction récente, double vitrage, chauffage central, garage double. Quartier calme et résidentiel.',
  ARRAY['jardin', 'garage', 'piscine', 'chauffage_central', 'gardien'],
  'published', true, true, now()
),
(
  '00000000-0000-0000-0000-000000000103',
  '00000000-0000-0000-0000-000000000001',
  'Local commercial — Bab El Oued',
  'local-commercial-bab-el-oued',
  'rent',
  'commercial',
  150000, 'DZD', true,
  80, 2, 0, 1,
  'Alger', 'Bab El Oued', 'Centre ville',
  'Local commercial idéalement situé sur un axe passant. Convient pour tout type de commerce. Vitrine sur rue, rideau métallique, compteur individuel.',
  ARRAY['vitrine', 'rideau_metallique'],
  'published', false, true, now()
),
(
  '00000000-0000-0000-0000-000000000104',
  '00000000-0000-0000-0000-000000000001',
  'Studio meublé — Bir Mourad Raïs',
  'studio-meuble-bir-mourad-rais',
  'rent',
  'studio',
  45000, 'DZD', false,
  35, 1, 1, 1,
  'Alger', 'Bir Mourad Raïs', 'Cité',
  'Studio entièrement meublé et équipé. Idéal pour étudiant ou jeune professionnel. Internet fibre inclus. Proche tramway et université.',
  ARRAY['meuble', 'climatisation', 'internet'],
  'published', false, false, now()
),
(
  '00000000-0000-0000-0000-000000000105',
  '00000000-0000-0000-0000-000000000001',
  'Terrain constructible — Draria',
  'terrain-constructible-draria',
  'sale',
  'land',
  25000000, 'DZD', true,
  400, 0, 0, 0,
  'Alger', 'Draria', 'Zone urbaine',
  'Terrain à bâtir de 400m² avec permis de construire R+2. Viabilisé (eau, électricité, gaz). Accès route principale.',
  ARRAY['viabilise', 'permis_construire'],
  'draft', false, false, null
);

-- Demo leads
INSERT INTO public.leads (
  agency_id, property_id, full_name, phone, email, message, status, source
) VALUES
(
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000101',
  'Karim Bensalah',
  '+213 661 23 45 67',
  'karim.b@gmail.com',
  'Bonjour, je suis intéressé par l''appartement F4 à Hydra. Est-il possible de planifier une visite ce weekend ?',
  'new',
  'website'
),
(
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000102',
  'Amina Djelloul',
  '+213 770 98 76 54',
  null,
  'Je cherche une villa pour ma famille. Celle de Chéraga m''intéresse. Merci de me rappeler.',
  'contacted',
  'phone'
),
(
  '00000000-0000-0000-0000-000000000001',
  null,
  'Youcef Merabti',
  '+213 550 11 22 33',
  'youcef.m@outlook.com',
  'Je recherche un F3 ou F4 à acheter dans les environs d''Alger. Budget entre 20 et 30 millions DA.',
  'qualified',
  'website'
);

-- Demo contact requests
INSERT INTO public.contact_requests (
  agency_id, property_id, full_name, phone, email, message, request_type
) VALUES
(
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000101',
  'Nadia Ferhat',
  '+213 666 55 44 33',
  'nadia.f@gmail.com',
  'Bonjour, je souhaiterais visiter cet appartement. Merci.',
  'visit_request'
);
