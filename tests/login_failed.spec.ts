import { test, expect } from '@playwright/test';

test('Échec de connexion avec identifiants invalides', async ({ page }) => {
  // Given
  await page.goto('https://www.cardmarket.com/en/Login');
  await page.pause();

  // When
  await page.getByPlaceholder(/username/i).fill('invalidUser');
  await page.getByPlaceholder(/password/i).fill('invalidPassword');
  await page.pause();

  // Soumission du formulaire via Entrée
  await page.getByPlaceholder(/password/i).press('Enter');
  await page.pause();

  // Then
  const errorMessage = page.getByText(/password you entered was not correct/i);
  await expect(errorMessage).toBeVisible();
  await page.pause();
  await expect(page).toHaveURL(/login/i);
  await page.pause();
});

// Le bouton "Log in" reste aria-disabled en automatisation à cause
// des validations JavaScript dépendantes d'événements utilisateur.
// La soumission via la touche Entrée permet de tester le comportement
// fonctionnel réel sans forcer l'état interne du bouton.