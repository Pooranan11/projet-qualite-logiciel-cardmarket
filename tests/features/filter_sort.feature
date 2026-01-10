Feature: Filtrer et trier les 5 premiers resultats par ordre croissant

  Scenario: Appliquer un filtre puis trier par prix croissant
    Given l'utilisateur est sur la page de résultats pour "Giratina"
    When il applique le filtre "Expansion" avec la valeur "Lost Origin"
    Then la liste de résultats se met à jour
    And un filtre actif contenant "Lost Origin" est visible
    When il trie par "Price (cheapest first)"
    Then les 5 premiers prix sont en ordre croissant
