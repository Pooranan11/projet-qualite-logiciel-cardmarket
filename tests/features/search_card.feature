Feature: Recherche de carte sur CardMarket

  Scenario: Rechercher une carte par son nom
    Given l'utilisateur est sur la page d'accueil de CardMarket
    When il recherche la carte "Palkia Originel VSTAR GG67"
    Then des résultats de recherche sont affichés