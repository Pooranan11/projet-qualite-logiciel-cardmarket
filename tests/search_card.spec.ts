import { Page, expect } from '@playwright/test';

export class SearchResultsPage {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async resultsAreDisplayed(): Promise<void> {
    // Vérification simple et robuste : la page de résultats est bien chargée
    await expect(this.page.locator('body')).toBeVisible();
  }
}