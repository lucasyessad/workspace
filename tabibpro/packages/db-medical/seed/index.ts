// ============================================================
// TabibPro — Script Seed Principal — Base médicale
// ============================================================

import { PrismaClient } from '../generated/client';
import { WILAYAS_DZ } from './wilayas';
import { MEDICAMENTS_DZ_SEED } from './pharmacopee';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Initialisation des données de référence — TabibPro Algérie\n');

  // ---- 1. Wilayas (58) ----
  console.log('📍 Chargement des 58 wilayas...');
  for (const wilaya of WILAYAS_DZ) {
    await prisma.wilaya.upsert({
      where: { code: wilaya.code },
      update: wilaya,
      create: wilaya,
    });
  }
  console.log(`   ✅ ${WILAYAS_DZ.length} wilayas chargées`);

  // ---- 2. Jours fériés 2024-2026 ----
  console.log('📅 Chargement des jours fériés algériens...');
  const joursFerier = [
    // 2025
    { date: new Date('2025-01-01'), nomFr: "Jour de l'An", nomAr: "رأس السنة", type: 'NATIONAL', estVariable: false, annee: 2025 },
    { date: new Date('2025-01-12'), nomFr: "Yennayer (Nouvel An Amazigh)", nomAr: "رأس السنة الأمازيغية", type: 'NATIONAL', estVariable: false, annee: 2025 },
    { date: new Date('2025-03-31'), nomFr: "Aïd el-Fitr (1er jour)", nomAr: "عيد الفطر", type: 'RELIGIEUX', estVariable: true, annee: 2025 },
    { date: new Date('2025-04-01'), nomFr: "Aïd el-Fitr (2e jour)", nomAr: "عيد الفطر (اليوم الثاني)", type: 'RELIGIEUX', estVariable: true, annee: 2025 },
    { date: new Date('2025-05-01'), nomFr: "Fête du Travail", nomAr: "عيد العمال", type: 'NATIONAL', estVariable: false, annee: 2025 },
    { date: new Date('2025-06-06'), nomFr: "Aïd el-Adha (1er jour)", nomAr: "عيد الأضحى", type: 'RELIGIEUX', estVariable: true, annee: 2025 },
    { date: new Date('2025-06-07'), nomFr: "Aïd el-Adha (2e jour)", nomAr: "عيد الأضحى (اليوم الثاني)", type: 'RELIGIEUX', estVariable: true, annee: 2025 },
    { date: new Date('2025-06-27'), nomFr: "1er Moharram (Nouvel An Hégirien)", nomAr: "رأس السنة الهجرية", type: 'RELIGIEUX', estVariable: true, annee: 2025 },
    { date: new Date('2025-07-05'), nomFr: "Fête de l'Indépendance", nomAr: "عيد الاستقلال", type: 'NATIONAL', estVariable: false, annee: 2025 },
    { date: new Date('2025-09-04'), nomFr: "Mawlid Ennabawi", nomAr: "المولد النبوي الشريف", type: 'RELIGIEUX', estVariable: true, annee: 2025 },
    { date: new Date('2025-11-01'), nomFr: "Fête de la Révolution", nomAr: "عيد الثورة", type: 'NATIONAL', estVariable: false, annee: 2025 },
  ];

  for (const jour of joursFerier) {
    await prisma.jourFerieDZ.upsert({
      where: { date_annee: { date: jour.date, annee: jour.annee } },
      update: jour,
      create: {
        ...jour,
        type: jour.type as 'NATIONAL' | 'RELIGIEUX',
      },
    });
  }
  console.log(`   ✅ ${joursFerier.length} jours fériés chargés`);

  // ---- 3. Pharmacopée algérienne (ANPP) ----
  console.log('💊 Chargement de la pharmacopée algérienne...');
  for (const med of MEDICAMENTS_DZ_SEED) {
    await prisma.medicamentPharmacpoe.upsert({
      where: {
        nomCommercial_forme_dosageUnitaire: {
          nomCommercial: med.nomCommercial,
          forme: med.forme,
          dosageUnitaire: med.dosageUnitaire,
        },
      },
      update: med,
      create: med,
    });
  }
  console.log(`   ✅ ${MEDICAMENTS_DZ_SEED.length} médicaments chargés`);

  // ---- 4. Base de connaissances médicales ----
  console.log('📚 Chargement de la base de connaissances médicales...');
  const knowledgeItems = [
    {
      titre: 'Hypertension artérielle — Protocole MSPRH',
      contenu: 'Protocole de prise en charge de l\'hypertension artérielle selon les recommandations du Ministère de la Santé algérien (MSPRH). Objectifs tensionnels : TA < 140/90 mmHg chez la plupart des patients, < 130/80 chez les diabétiques et insuffisants rénaux...',
      source: 'MSPRH',
      specialite: 'Cardiologie',
      tags: ['hypertension', 'HTA', 'cardiovasculaire'],
      langue: 'FR',
    },
    {
      titre: 'Diabète de type 2 — Prise en charge en Algérie',
      contenu: 'Recommandations pour la prise en charge du diabète de type 2 en Algérie. Médicaments disponibles sur le marché algérien : Metformine (Saidal), Gliclazide, Insuline Saidal...',
      source: 'MSPRH',
      specialite: 'Endocrinologie',
      tags: ['diabète', 'type 2', 'glycémie'],
      langue: 'FR',
    },
    {
      titre: 'Tuberculose — Programme National de Lutte',
      contenu: 'Programme National de Lutte contre la Tuberculose (PNLT) en Algérie. Schéma thérapeutique 2RHZE/4RH. Médicaments fournis gratuitement par l\'État...',
      source: 'MSPRH',
      specialite: 'Pneumologie',
      tags: ['tuberculose', 'TB', 'PNLT', 'antituberculeux'],
      langue: 'FR',
    },
    {
      titre: 'ارتفاع ضغط الدم — البروتوكول الوطني',
      contenu: 'بروتوكول علاج ارتفاع ضغط الدم وفق توصيات وزارة الصحة الجزائرية...',
      source: 'MSPRH',
      specialite: 'Cardiologie',
      tags: ['ضغط الدم', 'أمراض القلب'],
      langue: 'AR',
    },
  ];

  for (const item of knowledgeItems) {
    await prisma.baseConnaissancesMedicale.create({
      data: {
        ...item,
        source: item.source as 'MSPRH',
        langue: item.langue as 'FR' | 'AR',
      },
    });
  }
  console.log(`   ✅ ${knowledgeItems.length} articles de connaissance médicale chargés`);

  // ---- 5. Nomenclature des actes médicaux DZ ----
  console.log('🏥 Chargement de la nomenclature des actes médicaux...');
  const actes = [
    {
      codeActe: 'C',
      libelleFr: 'Consultation médicale',
      libelleAr: 'استشارة طبية',
      lettreCle: 'C',
      coefficient: 23,
      tarifSecteurPublicDzd: 200,
      tarifSecteurPriveDzd: 1000,
      tarifConventionneCnasDzd: 700,
      specialiteConcernee: 'Médecine Générale',
    },
    {
      codeActe: 'CS',
      libelleFr: 'Consultation médicale spécialisée',
      libelleAr: 'استشارة طبية متخصصة',
      lettreCle: 'CS',
      coefficient: 46,
      tarifSecteurPublicDzd: 300,
      tarifSecteurPriveDzd: 2000,
      tarifConventionneCnasDzd: 1400,
      specialiteConcernee: 'Médecine Spécialisée',
    },
    {
      codeActe: 'V',
      libelleFr: 'Visite à domicile',
      libelleAr: 'زيارة منزلية',
      lettreCle: 'V',
      coefficient: 30,
      tarifSecteurPublicDzd: 300,
      tarifSecteurPriveDzd: 1500,
      tarifConventionneCnasDzd: 900,
      specialiteConcernee: 'Médecine Générale',
    },
  ];

  for (const acte of actes) {
    await prisma.nomenclatureActesMedicaux.upsert({
      where: { codeActe: acte.codeActe },
      update: acte,
      create: acte,
    });
  }
  console.log(`   ✅ ${actes.length} actes médicaux chargés`);

  console.log('\n🎉 Initialisation terminée avec succès !');
  console.log('   TabibPro est prêt pour le marché algérien.\n');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
