import { test } from '@playwright/test';
import { HomePage } from './pages/HomePage';
import { SearchResultsPage } from './pages/SearchResultsPage';

test('Recherche de carte Pokémon sur CardMarket (scénario BDD)', async ({ page }) => {
  const homePage = new HomePage(page);
  const resultsPage = new SearchResultsPage(page);

  // Given
  await homePage.open();
  await homePage.selectPokemonGame();

  // When
  await homePage.searchCard('Black Lotus');

  // Then
  await resultsPage.resultsAreDisplayed();
});