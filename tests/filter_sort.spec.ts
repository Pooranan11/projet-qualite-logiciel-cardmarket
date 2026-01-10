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

  // Then: l'UI montre bien l'expansion sélectionnée
  await results.expectExpansionSelected("Lost Origin");

  // When: tri "Price (cheapest first)" (valide via Search)
  await results.sortByAny([
    "Price (cheapest first)",
    "Prix (le moins cher d'abord)",
  ]);

  // Then: l'UI montre bien le tri choisi
  await results.expectSortSelected([
    "Price (cheapest first)",
    "Prix (le moins cher d'abord)",
  ]);

  // And: les premiers prix sont bien croissants
  await results.expectPricesAscending(5);
});
