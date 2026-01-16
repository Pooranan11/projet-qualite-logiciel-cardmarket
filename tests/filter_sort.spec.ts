import { test } from "@playwright/test";
import { HomePage } from "./pages/HomePage";
import { SearchResultsPage } from "./pages/filter_sort"; // Vérifie que le nom du fichier est bien filter_sort.ts

test("Scenario: Appliquer un filtre puis trier par prix croissant", async ({ page }) => {
  test.slow();
  const home = new HomePage(page);
  const results = new SearchResultsPage(page);

  // --- GIVEN ---
  await home.open();
  await results.acceptCookiesIfPresent(); //
  await home.selectPokemonGame();
  await home.searchCard("Giratina");
  await results.waitForResultsLoaded(); //

  // --- WHEN : application du Filtre ---
  // Cette méthode sélectionne "Lost Origin" et clique sur SEARCH
  await results.applyExpansion("Lost Origin");

  // --- WHEN : Tri ---
  // On utilise le texte exact du menu déroulant
  await results.sortBy("Price (cheapest first)");

  // --- THEN ---
  // On vérifie que les 5 premiers prix sont bien dans l'ordre
  await results.expectPricesAscending(5);
});