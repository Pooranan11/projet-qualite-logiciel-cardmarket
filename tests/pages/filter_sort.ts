import { Page, Locator, expect, test } from "@playwright/test";

export class SearchResultsPage {
  private page: Page;
  private main: Locator;
  private expansionSelect: Locator;
  private sortSelect: Locator;
  private searchBtn: Locator;
  private allPrices: Locator;
  private firstResultLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.main = page.locator("main");

    // Sélecteurs par rôle pour l'accessibilité
    this.expansionSelect = this.main.getByRole("combobox", { name: /^expansion$/i });
    this.sortSelect = this.main.getByRole("combobox", { name: /^sort by$/i });
    
    // Correction cruciale : utilisation de l'INPUT submit (vu dans l'inspecteur)
    this.searchBtn = this.main.locator('input[type="submit"][value="Search"].btn-primary');

    // Localisation des données pour la validation
    this.allPrices = this.main.locator('text=/\\d+(?:[.,]\\d+)?\\s*€/');
    this.firstResultLink = this.main.locator('a[href*="/Products/"]').first();
  }

  /**
   * GIVEN : Attente que la page de résultats soit chargée et stable.
   */
  async waitForResultsLoaded(): Promise<void> {
    // Vérifie le titre et la présence d'au moins un prix
    await expect(this.page.getByRole("heading", { name: /search results/i })).toBeVisible({ timeout: 20000 });
    await expect(this.allPrices.first()).toBeVisible({ timeout: 20000 });
  }

  /**
   * Récupère un marqueur (URL + Prix) pour détecter un rafraîchissement réel.
   */
  private async getMarker(): Promise<{ href: string; price: string }> {
    const href = (await this.firstResultLink.getAttribute("href").catch(() => "")) ?? "";
    const price = (await this.allPrices.first().innerText().catch(() => "")).trim();
    return { href, price };
  }

  /**
   * WHEN : Applique le filtre d'édition (Expansion).
   */
  async applyExpansion(value: string): Promise<void> {
    await this.waitForResultsLoaded();
    
    // Évite de refaire l'action si déjà sélectionnée
    const currentLabel = (await this.expansionSelect.locator("option:checked").innerText().catch(() => "")).trim();
    if (currentLabel.toLowerCase() === value.toLowerCase()) return;

    const before = await this.getMarker();
    await this.expansionSelect.selectOption({ label: value });
    
    // Validation par le bouton SEARCH
    await this.searchBtn.click();
    await this.submitAndWaitForUpdate(before);
  }

  /**
   * WHEN : Applique le tri.
   */
  async sortBy(label: string): Promise<void> {
    await this.waitForResultsLoaded();

    const before = await this.getMarker();
    // Sélection directe par le texte visible
    await this.sortSelect.selectOption({ label: label });
    
    console.log(`Tri appliqué : ${label}, attente du rafraîchissement...`);
    await this.searchBtn.click();
    await this.submitAndWaitForUpdate(before);
  }

  /**
   * Méthode de synchronisation intelligente : attend que la donnée change.
   */
  private async submitAndWaitForUpdate(before: { href: string; price: string }): Promise<void> {
    await this.page.waitForLoadState("domcontentloaded");
    
    // On utilise poll pour vérifier que le premier résultat a changé (URL ou Prix)
    await expect.poll(async () => {
      const now = await this.getMarker();
      return now.href !== before.href || now.price !== before.price;
    }, { timeout: 20000 }).toBeTruthy();
    
    await this.waitForResultsLoaded();
  }

  /**
   * THEN : Vérifie que les prix sont bien croissants.
   */
  async expectPricesAscending(n: number): Promise<void> {
    const count = await this.allPrices.count();
    const take = Math.min(n, count);
    const prices: number[] = [];

    for (let i = 0; i < take; i++) {
      const raw = await this.allPrices.nth(i).innerText();
      // Nettoyage du format "1,50 €"
      const val = Number(raw.replace(/[^\d,.]/g, "").replace(",", "."));
      if (!isNaN(val)) prices.push(val);
    }

    for (let i = 1; i < prices.length; i++) {
      if (prices[i] < prices[i - 1]) {
        throw new Error(`Erreur de tri : ${prices[i-1]}€ est suivi de ${prices[i]}€`);
      }
    }
  }

  // Utilitaire pour les cookies si besoin
  async acceptCookiesIfPresent(): Promise<void> {
    const btn = this.page.getByRole("button", { name: /accept all cookies/i });
    if (await btn.isVisible()) await btn.click();
  }
}