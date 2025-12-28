Feature: Authentification utilisateur sur CardMarket

  Scenario 1: Connexion réussie (authentification simulée)
    Given l'utilisateur est sur la page de connexion CardMarket
    When il saisit ses identifiants
    And il valide le formulaire de connexion
    Then il est redirigé vers la page d'accueil en tant qu'utilisateur connecté

  Scenario 2: Connexion échouée avec identifiants invalides
    Given l'utilisateur est sur la page de connexion CardMarket
    When il saisit des identifiants invalides
    Then la connexion échoue et il reste sur la page de connexion

  # NOTE :
  # L’authentification réelle dépend d’un backend externe hors périmètre.
  # Le succès de la connexion est donc simulé afin de tester le parcours utilisateur
  # sans utiliser de compte réel.