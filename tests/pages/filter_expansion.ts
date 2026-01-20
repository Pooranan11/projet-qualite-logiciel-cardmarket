import { Page, Locator, expect } from "@playwright/test";

export class FilterEditionResultsPage {
  readonly page: Page;
  readonly editionSelect: Locator;
  readonly searchBtn: Locator;
  readonly resultContainer: Locator;

  constructor(page: Page) {
    this.page = page;
    this.editionSelect = page.locator('select[name="idExpansion"]');
    this.searchBtn = page.locator('input[type="submit"][value="Search"].btn-primary');
    this.resultContainer = page.locator('main');
  }

  private async handleCloudflare(): Promise<void> {
    // Vérifier si un captcha Cloudflare est visible
    const cloudflareChallenge = this.page.locator('iframe[src*="challenges.cloudflare.com"]').first();
    const isChallengeVisible = await cloudflareChallenge.isVisible().catch(() => false);

    if (isChallengeVisible) {
      console.log("[INFO] Captcha Cloudflare détecté. Attente de la page principale...");
      // Attendre que le contenu principal soit enfin visible (signe de succès)
      await this.resultContainer.waitFor({ state: 'visible', timeout: 60000 });
      console.log("[INFO] Captcha résolu ou contourné.");
    }
  }

  async waitForResultsPage(): Promise<void> {
    await this.page.waitForLoadState("domcontentloaded");

    // Attendre que Cloudflare disparaisse si présent
    await this.handleCloudflare();

    await expect(this.page).toHaveURL(/Products\/Search/);
    await this.editionSelect.waitFor({ state: "visible", timeout: 15000 });
  }

  private async getMarker(): Promise<string> {
    // Marqueur robuste : URL + premier lien visible (ou fallback à vide)
    const url = this.page.url();
    try {
      const firstLink = this.page.locator('main a[href*="/Products/Single"]').first();
      const href = await firstLink.getAttribute('href');
      return `${url}|${href}`;
    } catch {
      // Fallback : juste l'URL si aucun lien n'existe encore
      return url;
    }
  }

  private async submitAndWaitForUpdate(beforeMarker: string): Promise<void> {
    // Soumettre le filtre
    try {
      await this.searchBtn.click({ timeout: 2000 });
    } catch {
      await this.editionSelect.press('Enter');
    }

    // Attendre le changement d'URL avec idExpansion
    await this.page.waitForURL(/idExpansion=\d+/, { timeout: 15000 });

    // Gestion du captcha post-navigation
    await this.handleCloudflare();

    // Attendre que les résultats se rechargent (poll sur le marqueur)
    await expect.poll(
      async () => {
        const afterMarker = await this.getMarker();
        return afterMarker !== beforeMarker ? 'changed' : 'same';
      },
      { timeout: 15000, intervals: [500] }
    ).toBe('changed');

    // Stabilisation du DOM
    await this.page.waitForLoadState("networkidle");
  }

  async filterByEdition(label: string): Promise<void> {
    await this.editionSelect.waitFor({ state: "visible" });

    // Petit délai pour simuler la réflexion humaine (1-2 secondes)
    await this.page.waitForTimeout(1000 + Math.random() * 1000);

    // Enregistrer le marqueur avant le changement
    const beforeMarker = await this.getMarker();

    // Cliquer sur le select pour simuler un focus humain
    await this.editionSelect.click();
    
    // Petit délai avant de sélectionner
    await this.page.waitForTimeout(200);

    // Sélectionner l'option
    await this.editionSelect.selectOption({ label });

    // Petit délai avant de soumettre
    await this.page.waitForTimeout(500);

    // Soumettre et attendre la mise à jour
    await this.submitAndWaitForUpdate(beforeMarker);
  }

  async expectResultsToContainCode(code: string, n: number): Promise<void> {
    await this.resultContainer.waitFor({ state: 'visible', timeout: 10000 });

    const productLinks = this.page.locator('main a[href*="/Products/Single"]');

    // Attendre au moins un résultat
    await expect(productLinks.first()).toBeVisible({ timeout: 10000 });

    const count = await productLinks.count();
    console.log(`[DEBUG] Produits trouvés : ${count}`);

    const take = Math.min(n, count);
    for (let i = 0; i < take; i++) {
      const link = productLinks.nth(i);
      const href = await link.getAttribute('href') || '';
      const text = await link.textContent() || '';

      console.log(`[DEBUG] Lien ${i + 1}: ${href} | Texte: ${text}`);

      // Normaliser pour comparaison (minuscules, tirets supprimés)
      const normalizedHref = href.toLowerCase().replace(/-/g, '');
      const normalizedCode = code.toLowerCase().replace(/-/g, '');

      expect(
        normalizedHref,
        `Lien ${i + 1} devrait contenir le code "${code}"`
      ).toContain(normalizedCode);
    }
  }
}