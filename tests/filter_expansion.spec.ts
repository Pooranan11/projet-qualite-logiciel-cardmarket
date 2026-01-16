import { test, expect } from "@playwright/test";
import { HomePage } from "./pages/HomePage";
import { FilterEditionResultsPage } from "./pages/filter_expansion";

test("Scenario: filter_edition - Les résultats appartiennent à l'édition sélectionnée", async ({ page }) => {
  // Augmente le temps alloué pour gérer la lenteur du site au cas où
  test.slow();

  const home = new HomePage(page);
  const results = new FilterEditionResultsPage(page);

  // --- GIVEN ---
  // "je suis sur la page de résultats de recherche Pokémon pour 'Giratina'"
  await home.open();
  await home.selectPokemonGame();
  await home.searchCard("Giratina");
  await results.waitForResultsPage();

  // --- WHEN ---
  // "je filtre par l’édition 'Lost Origin'"
  // Cette méthode gère la sélection, le clic sur l'input et l'attente du refresh.
  await results.filterByEdition("Lost Origin");

  // --- THEN ---
  // "les premiers résultats affichés appartiennent à l’édition 'Lost Origin'"
  // On vérifie les 5 premiers éléments pour confirmer la persistence du filtre.
  await results.expectResultsToContainCode("LOR", 5);
});