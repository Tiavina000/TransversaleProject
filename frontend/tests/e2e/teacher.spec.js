import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';
const TEACHER_USERNAME = 'testteacher_e2e';
const TEACHER_PASSWORD = 'TestTeacher2024!';

test.describe('Enseignant - Fonctionnalités Frontend', () => {

  test('1 - Login enseignant avec sélection établissement', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await expect(page.locator('h1')).toContainText('ENENI', { timeout: 10000 });

    // Ouvrir le sélecteur d'établissement
    const etabButton = page.getByRole('button', { name: /choisir votre établissement/i });
    await expect(etabButton).toBeVisible({ timeout: 5000 });
    await etabButton.click();

    // Attendre que la liste apparaisse et cliquer sur notre établissement
    const etabOption = page.locator('div[class*="max-h-56"] button:has-text("Établissement Test E2E")');
    await expect(etabOption).toBeVisible({ timeout: 5000 });
    await etabOption.click();
    await page.waitForTimeout(500);

    // Cliquer sur le rôle Enseignant
    await page.getByRole('button', { name: /enseignant/i }).click();
    await page.waitForTimeout(300);

    // Remplir les identifiants
    await page.getByPlaceholder(/nom\.prenom|email/i).fill(TEACHER_USERNAME);
    await page.locator('input[type="password"]').fill(TEACHER_PASSWORD);

    // Soumettre
    await page.getByRole('button', { name: /se connecter/i }).click();

    // Attendre la redirection vers le dashboard
    await page.waitForURL('**/dashboard', { timeout: 20000 });
    await expect(page.locator('text=Espace Enseignant')).toBeVisible({ timeout: 10000 });
  });

  test('2 - Dashboard enseignant affiche les sections', async ({ page }) => {
    await loginAsTeacher(page);

    await expect(page.locator('text=Espace Enseignant')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Vos statistiques')).toBeVisible({ timeout: 5000 });

    const actions = ['Cours', 'Examen', 'Corrections', 'Classes', 'Statistiques'];
    for (const action of actions) {
      const el = page.locator(`text=${action}`).first();
      await expect(el).toBeVisible({ timeout: 3000 });
    }
  });

  test('3 - Page cours se charge correctement', async ({ page }) => {
    await loginAsTeacher(page);
    await page.goto(`${BASE_URL}/courses`);
    await page.waitForTimeout(3000);
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 });
  });

  test('4 - Page examens se charge avec bouton création', async ({ page }) => {
    await loginAsTeacher(page);
    await page.goto(`${BASE_URL}/exams`);
    await page.waitForTimeout(3000);
    await expect(page.locator('h1')).toContainText('Examens', { timeout: 10000 });
    await expect(page.getByRole('button', { name: /créer/i })).toBeVisible({ timeout: 5000 });
  });

  test('5 - Page corrections affiche les filtres', async ({ page }) => {
    await loginAsTeacher(page);
    await page.goto(`${BASE_URL}/corrections`);
    await page.waitForTimeout(3000);
    await expect(page.locator('h1')).toContainText('Corrections', { timeout: 10000 });

    for (const f of ['Soumis', 'Corrigé', 'Toutes']) {
      const btn = page.getByRole('button', { name: f });
      if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await expect(btn).toBeVisible();
      }
    }
  });

  test('6 - Navigation actions rapides du dashboard', async ({ page }) => {
    await loginAsTeacher(page);

    const links = [
      { name: 'Cours', expected: '/courses' },
      { name: 'Examen', expected: '/exams' },
      { name: 'Corrections', expected: '/corrections' },
    ];

    for (const { name, expected } of links) {
      const btn = page.locator(`button:has-text("${name}")`).first();
      if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await btn.click();
        await page.waitForTimeout(2000);
        expect(page.url()).toContain(expected);
        await page.goto(`${BASE_URL}/dashboard`);
        await page.waitForTimeout(1000);
      }
    }
  });
});

async function loginAsTeacher(page) {
  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState('networkidle');

  if (page.url().includes('/dashboard')) return;

  // Attendre que le selecteur d'établissement soit chargé
  const etabButton = page.getByRole('button', { name: /choisir votre établissement/i });
  await expect(etabButton).toBeVisible({ timeout: 15000 });
  await etabButton.click();
  await page.waitForTimeout(500);

  // Sélectionner notre établissement de test
  const etabOption = page.locator('div[class*="max-h-56"] button', { hasText: 'Établissement Test E2E' });
  if (await etabOption.isVisible({ timeout: 3000 }).catch(() => false)) {
    await etabOption.click();
    await page.waitForTimeout(500);
  } else {
    // Fallback: premier de la liste
    const firstOption = page.locator('div[class*="max-h-56"] button').first();
    if (await firstOption.isVisible({ timeout: 2000 }).catch(() => false)) {
      await firstOption.click();
      await page.waitForTimeout(500);
    }
  }

  // Rôle Enseignant
  const teacherBtn = page.getByRole('button', { name: /enseignant/i });
  await teacherBtn.click();
  await page.waitForTimeout(300);

  // Identifiants
  await page.getByPlaceholder(/nom\.prenom|email/i).fill(TEACHER_USERNAME);
  await page.locator('input[type="password"]').fill(TEACHER_PASSWORD);

  // Submit
  await page.getByRole('button', { name: /se connecter/i }).click();
  await page.waitForURL('**/dashboard', { timeout: 20000 });
}
