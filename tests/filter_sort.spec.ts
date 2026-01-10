import { test } from "@playwright/test";
import { HomePage } from "./pages/HomePage";
import { SearchResultsPage } from "./pages/filter_sort.ts";

test("Feature: Filtrer et trier les résultats - Scenario: filtre + tri prix croissant", async ({ page }) => {
  const home = new HomePage(page);
  const results = new SearchResultsPage(page);

  // Given: on arrive sur des résultats pour "Giratina"
  await home.open();
  await results.acceptCookiesIfPresent();
  await home.selectPokemonGame();
  await home.searchCard("Giratina");
  await results.waitForResultsLoaded();

  // When: filtre "Expansion" = Lost Origin (valide via Search)
  await results.applyExpansion("Lost Origin");

  // Then: l'UI reste sur expansion
  await results.expectExpansionSelected("Lost Origin");

  // When: tri "Price (cheapest first)"
  await results.sortByAny([
    "Price (cheapest first)",
    "Prix (le moins cher d'abord)",
  ]);

  // Then: l'UI montre le tri choisi ici c'est cheapest first
  await results.expectSortSelected([
    "Price (cheapest first)",
    "Prix (le moins cher d'abord)",
  ]);

  // And: on devrait avoir les 5 prix
  await results.expectPricesAscending(5);
});
