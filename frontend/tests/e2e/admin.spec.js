import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';
const ADMIN_USERNAME = 'testadmin_e2e';
const ADMIN_PASSWORD = 'Admin2024!';

test.describe('Administrateur - Fonctionnalités Frontend', () => {

  test('1 - Login administrateur', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await expect(page.locator('h1')).toContainText('ENENI', { timeout: 10000 });

    const etabButton = page.getByRole('button', { name: /choisir votre établissement/i });
    await expect(etabButton).toBeVisible({ timeout: 5000 });
    await etabButton.click();

    const etabOption = page.locator('div[class*="max-h-56"] button:has-text("Établissement Test E2E")');
    await expect(etabOption).toBeVisible({ timeout: 5000 });
    await etabOption.click();
    await page.waitForTimeout(500);

    await page.getByRole('button', { name: /Administrateur/i }).click();
    await page.waitForTimeout(300);

    await page.getByPlaceholder(/nom\.prenom|email/i).fill(ADMIN_USERNAME);
    await page.locator('input[type="password"]').fill(ADMIN_PASSWORD);

    await page.getByRole('button', { name: /se connecter/i }).click();

    await page.waitForURL('**/dashboard', { timeout: 20000 });
    await expect(page.locator('text=Communication Portal')).toBeVisible({ timeout: 10000 });
  });

  test('2 - Dashboard admin affiche les sections', async ({ page }) => {
    await loginAsAdmin(page);

    await expect(page.locator('text=Communication Portal')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Gestion Actualités')).toBeVisible({ timeout: 5000 });
  });

  test('3 - Admin peut voir le bouton nouvelle publication', async ({ page }) => {
    await loginAsAdmin(page);
    await expect(page.getByRole('button', { name: /nouvelle publication/i })).toBeVisible({ timeout: 5000 });
  });
});

async function loginAsAdmin(page) {
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

  await page.getByRole('button', { name: /Administrateur/i }).click();
  await page.waitForTimeout(300);

  await page.getByPlaceholder(/nom\.prenom|email/i).fill(ADMIN_USERNAME);
  await page.locator('input[type="password"]').fill(ADMIN_PASSWORD);

  await page.getByRole('button', { name: /se connecter/i }).click();
  await page.waitForURL('**/dashboard', { timeout: 20000 });
}
