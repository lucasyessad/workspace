// ============================================================
// TabibPro — E2E — Dashboard principal
// ============================================================

import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // TODO: authentification — pour l'instant on accède directement
    await page.goto('/fr/dashboard');
  });

  test('affiche le titre principal', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('la navigation latérale est visible', async ({ page }) => {
    await expect(page.getByText('Patients')).toBeVisible();
    await expect(page.getByText('Consultations')).toBeVisible();
    await expect(page.getByText('Ordonnances')).toBeVisible();
  });
});

test.describe('Navigation', () => {
  test('accès à la liste des patients', async ({ page }) => {
    await page.goto('/fr/patients');
    await expect(page.getByRole('heading')).toContainText('Patients');
  });

  test('accès aux ordonnances', async ({ page }) => {
    await page.goto('/fr/ordonnances');
    await expect(page.getByRole('heading')).toContainText('Ordonnances');
  });

  test('accès au stock', async ({ page }) => {
    await page.goto('/fr/stock');
    await expect(page.getByRole('heading')).toContainText('Stock');
  });

  test('accès facturation', async ({ page }) => {
    await page.goto('/fr/facturation');
    await expect(page.getByRole('heading')).toBeVisible();
  });

  test('accès vaccinations', async ({ page }) => {
    await page.goto('/fr/vaccinations');
    await expect(page.getByRole('heading')).toBeVisible();
  });
});

test.describe('Formulaires création', () => {
  test('ouverture formulaire nouveau patient', async ({ page }) => {
    await page.goto('/fr/patients/nouveau');
    await expect(page.getByRole('heading')).toContainText('patient');
  });

  test('ouverture formulaire nouvelle consultation', async ({ page }) => {
    await page.goto('/fr/consultations/nouveau');
    await expect(page.getByRole('heading')).toContainText('consultation');
  });

  test('ouverture formulaire nouveau RDV', async ({ page }) => {
    await page.goto('/fr/rdv/nouveau');
    await expect(page.getByRole('heading')).toContainText('rendez-vous');
  });

  test('ouverture formulaire nouvelle facture', async ({ page }) => {
    await page.goto('/fr/facturation/nouveau');
    await expect(page.getByRole('heading')).toContainText('facture');
  });

  test('ouverture formulaire vaccination', async ({ page }) => {
    await page.goto('/fr/vaccinations/nouveau');
    await expect(page.getByRole('heading')).toBeVisible();
  });
});
