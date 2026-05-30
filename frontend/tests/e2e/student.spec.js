import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';
const STUDENT_NUMERO = 'E2E2024001';
const STUDENT_PASSWORD = 'Student2024!';

test.describe('Étudiant - Fonctionnalités Frontend', () => {

  test('1 - Login étudiant avec sélection établissement', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await expect(page.locator('h1')).toContainText('ENENI', { timeout: 10000 });

    const etabButton = page.getByRole('button', { name: /choisir votre établissement/i });
    await expect(etabButton).toBeVisible({ timeout: 5000 });
    await etabButton.click();

    const etabOption = page.locator('div[class*="max-h-56"] button:has-text("Établissement Test E2E")');
    await expect(etabOption).toBeVisible({ timeout: 5000 });
    await etabOption.click();
    await page.waitForTimeout(500);

    await page.getByRole('button', { name: /Élève|Student/i }).click();
    await page.waitForTimeout(300);

    await page.getByPlaceholder(/Ex: 2026001/i).fill(STUDENT_NUMERO);
    await page.locator('input[type="password"]').fill(STUDENT_PASSWORD);

    await page.getByRole('button', { name: /se connecter/i }).click();

    await page.waitForURL('**/dashboard', { timeout: 20000 });
    await expect(page.locator('text=Espace ENENI')).toBeVisible({ timeout: 10000 });
  });

  test('2 - Dashboard étudiant affiche sections principales', async ({ page }) => {
    await loginAsStudent(page);

    await expect(page.locator('text=Espace ENENI')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Temps d\'étude')).toBeVisible({ timeout: 5000 });

    const sections = ['Cours Validés', 'Temps par Matière', 'Flux Social'];
    for (const s of sections) {
      const el = page.locator(`text=${s}`).first();
      await expect(el).toBeVisible({ timeout: 3000 });
    }
  });

  test('3 - Page bulletin se charge correctement', async ({ page }) => {
    await loginAsStudent(page);
    await page.goto(`${BASE_URL}/bulletin`);
    await page.waitForTimeout(3000);
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 });
  });

  test('4 - Page boutique se charge correctement', async ({ page }) => {
    await loginAsStudent(page);
    await page.goto(`${BASE_URL}/shop`);
    await page.waitForTimeout(3000);
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 });
  });

  test('5 - Page cours se charge correctement', async ({ page }) => {
    await loginAsStudent(page);
    await page.goto(`${BASE_URL}/courses`);
    await page.waitForTimeout(3000);
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 });
  });

  test('6 - Page examens se charge correctement', async ({ page }) => {
    await loginAsStudent(page);
    await page.goto(`${BASE_URL}/exams`);
    await page.waitForTimeout(3000);
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 });
  });
});

async function loginAsStudent(page) {
  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState('networkidle');

  if (page.url().includes('/dashboard')) return;

  const etabButton = page.getByRole('button', { name: /choisir votre établissement/i });
  await expect(etabButton).toBeVisible({ timeout: 15000 });
  await etabButton.click();
  await page.waitForTimeout(500);

  const etabOption = page.locator('div[class*="max-h-56"] button', { hasText: 'Établissement Test E2E' });
  if (await etabOption.isVisible({ timeout: 3000 }).catch(() => false)) {
    await etabOption.click();
    await page.waitForTimeout(500);
  } else {
    const firstOption = page.locator('div[class*="max-h-56"] button').first();
    if (await firstOption.isVisible({ timeout: 2000 }).catch(() => false)) {
      await firstOption.click();
      await page.waitForTimeout(500);
    }
  }

  await page.getByRole('button', { name: /Élève|Student/i }).click();
  await page.waitForTimeout(300);

  await page.getByPlaceholder(/Ex: 2026001/i).fill(STUDENT_NUMERO);
  await page.locator('input[type="password"]').fill(STUDENT_PASSWORD);

  await page.getByRole('button', { name: /se connecter/i }).click();
  await page.waitForURL('**/dashboard', { timeout: 20000 });
}
