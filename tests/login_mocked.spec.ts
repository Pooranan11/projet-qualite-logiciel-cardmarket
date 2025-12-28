import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

test('Accès post-login simulé (login hors périmètre)', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Given
  await loginPage.open();
  await page.pause();

  // When
  await loginPage.fillCredentials('fakeUser', 'fakePassword');
  await page.pause();

  // Simulation explicite du login réussi
  await page.goto('https://www.cardmarket.com/en');
  await page.pause();

  // Then
  await expect(page).not.toHaveURL(/login/i);
  await expect(page).toHaveTitle(/Cardmarket/i);
});