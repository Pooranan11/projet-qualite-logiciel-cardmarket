import { test } from '@playwright/test';
import { HomePage } from './pages/HomePage';
import { SearchResultsPage } from './pages/SearchResultsPage';

test('Recherche de carte Pokémon sur CardMarket (scénario BDD)', async ({ page }) => {
  const homePage = new HomePage(page);
  const resultsPage = new SearchResultsPage(page);

  // Given
  await homePage.open();
  await page.pause();
  await homePage.selectPokemonGame();
  await page.pause();
  
  // When
  await homePage.searchCard('Palkia Originel VSTAR GG67'); // Je cherche réelement cette carte :(
  await page.pause();
  
  // Then
  await resultsPage.resultsAreDisplayed();
  await page.pause();
});