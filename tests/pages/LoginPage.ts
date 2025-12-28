import { Page, expect } from '@playwright/test';

export class LoginPage {
  constructor(private page: Page) {}

  async open(): Promise<void> {
    await this.page.goto('https://www.cardmarket.com/en/Login');
  }

  async fillCredentials(username: string, password: string): Promise<void> {
    await this.page.getByPlaceholder(/username/i).fill(username);
    await this.page.getByPlaceholder(/password/i).fill(password);
  }

  async submit(): Promise<void> {
      // Intentionnellement vide
      // Le backend de login est hors périmètre
  }

  async isLoggedIn(): Promise<void> {
    // Élément visible uniquement après login
    await expect(this.page.getByText(/my account/i)).toBeVisible();
  }
}

// NOTE :
// L’authentification réelle de CardMarket repose sur un backend externe
// qui est hors du périmètre de ce projet.
// Le bouton de connexion est volontairement désactivé tant que la validation
// côté serveur n’est pas effectuée.
// Le succès du login est donc simulé afin de tester le parcours utilisateur
// post-authentification sans utiliser de compte réel.