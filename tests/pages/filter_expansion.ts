import { Page, Locator, expect } from "@playwright/test";

export class FilterEditionResultsPage {
  readonly page: Page;
  readonly editionSelect: Locator;
  readonly searchBtn: Locator;
  readonly productLinks: Locator;

  constructor(page: Page) {
    this.page = page;
    // Ciblage par attribut 'name' pour le menu déroulant
    this.editionSelect = page.locator('select[name="idExpansion"]');
    
    // Ciblage spécifique de l'INPUT de type submit identifié via l'inspecteur
    // Note : Cardmarket utilise un input et non un bouton classique ici.
    this.searchBtn = page.locator('input[type="submit"][value="Search"].btn-primary');

    // Ciblage des liens produits pour extraire le texte (ex: "Giratina V (LOR 130)")
    this.productLinks = page.locator('.table-body .row a[href*="/Products/Singles/"]');
  }

  /**
   * Synchronisation : Attend que la table des résultats soit injectée dans le DOM.
   */
  async waitForResultsPage(): Promise<void> {
    await expect(this.page.locator('.table-body')).toBeVisible({ timeout: 15000 });
  }

  /**
   * Gère l'interaction de filtrage et la validation du rafraîchissement.
   */
  async filterByEdition(label: string): Promise<void> {
    // Sélection de l'option souhaitée
    await this.editionSelect.selectOption({ label: label });
    
    // Pause nécessaire pour laisser les scripts de Cardmarket valider le choix
    await this.page.waitForTimeout(1000);

    // Clic forcé pour contourner d'éventuels overlays (ex: menus collants)
    await this.searchBtn.click({ force: true });

    // Validation technique : l'URL doit porter le flag de l'expansion sélectionnée
    await expect(this.page).toHaveURL(/idExpansion=/, { timeout: 15000 });
    
    // On attend que le réseau soit calme pour garantir la mise à jour des données
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Vérifie la conformité des résultats affichés.
   */
  async expectResultsToContainCode(code: string, n: number): Promise<void> {
    // Attente du premier lien pour s'assurer que la liste n'est plus vide
    await this.productLinks.first().waitFor({ state: 'visible' });

    const take = Math.min(n, await this.productLinks.count());

    for (let i = 0; i < take; i++) {
      const text = await this.productLinks.nth(i).innerText();
      // On valide que le code d'édition (ex: LOR) est présent entre parenthèses
      expect(text).toContain(`(${code}`);
    }
  }
}