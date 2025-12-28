import { Page } from '@playwright/test';

export class HomePage {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async open(): Promise<void> {
    await this.page.goto('https://www.cardmarket.com');
  }

  async selectPokemonGame(): Promise<void> {
    // Bouton Pokémon sur la page d'accueil
    const pokemonButton = this.page.getByRole('link', { name: /pokémon/i });
    await pokemonButton.click();
  }

  async searchCard(cardName: string): Promise<void> {
    const searchInput = this.page.getByPlaceholder('Search');
    await searchInput.fill(cardName);
    await this.page.keyboard.press('Enter');
  }
}