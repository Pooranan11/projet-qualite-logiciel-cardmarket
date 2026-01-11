Feature: Filtrer les résultats par édition

  Scenario: filter_edition - les résultats appartiennent à l’édition sélectionnée
    Given je suis sur la page de résultats de recherche Pokémon pour "Giratina"
    When je filtre par l’édition "Lost Origin"
    Then les premiers résultats affichés appartiennent à l’édition "Lost Origin"
