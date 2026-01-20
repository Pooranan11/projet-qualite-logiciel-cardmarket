import { test, expect } from '@playwright/test';
import { HomePage } from './pages/HomePage';
import { SearchResultsPage } from './pages/SearchResultsPage';

test.describe('Search Card', () => {
  let homePage: HomePage;
  let searchResultsPage: SearchResultsPage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    searchResultsPage = new SearchResultsPage(page);
    await homePage.open();
    await homePage.selectPokemonGame();
  });

  test('should search for a card by name', async ({ page }) => {
    // GIVEN: User is on the HomePage and has selected Pokemon game
    // WHEN: User searches for a card
    await homePage.searchCard('Palkia Originel VSTAR GG67');

    // THEN: Search results should be displayed
    await searchResultsPage.resultsAreDisplayed();
    // Verify that the page has changed (simple check)
    await expect(page).not.toHaveURL('https://www.cardmarket.com/');
  });

  test('should display search results page', async ({ page }) => {
    // WHEN: User searches for a card
    await homePage.searchCard('Charizard');

    // THEN: Results page is visible
    await searchResultsPage.resultsAreDisplayed();
  });
});