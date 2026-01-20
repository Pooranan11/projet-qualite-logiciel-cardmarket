# Projet de tests automatisés end-to-end avec Playwright – CardMarket

**Auteurs :**
- Heddy Mortada
- Christophe Pays
- Pooranan Vytheswaran

## Sommaire
1. [Introduction](#1-introduction)
2. [Site testé](#2-site-testé)
3. [Objectifs du projet](#3-objectifs-du-projet)
4. [Technologies utilisées](#4-technologies-utilisées)
5. [Scénarios de tests automatisés](#5-scénarios-de-tests-automatisés)
6. [Structure du projet](#6-structure-du-projet)
7. [Installation et exécution](#7-installation-et-exécution)
8. [Détails techniques et choix d’implémentation](#8-détails-techniques-et-choix-dimplémentation)
9. [Gestion des contraintes du site](#9-gestion-des-contraintes-du-site)
10. [Authentification : périmètre et mock](#10-authentification--périmètre-et-mock)
11. [Difficultés rencontrées](#11-difficultés-rencontrées)
12. [Conclusion](#12-conclusion)


## 1. Introduction

Ce projet vise à mettre en place des tests automatisés end-to-end à l’aide de Playwright, appliqués à un site e-commerce réel.

Il a été réalisé dans un contexte pédagogique et a pour objectif de démontrer la capacité à analyser un site existant, automatiser des parcours utilisateurs pertinents, et documenter des choix techniques réalistes, tout en tenant compte des contraintes d’un site tiers.


## 2. Site testé

Le site testé est **CardMarket** (https://www.cardmarket.com), une plateforme de vente en ligne spécialisée dans les cartes à collectionner.

Les tests automatisés portent exclusivement sur :
- le jeu **Pokémon**,
- des fonctionnalités accessibles **sans compte utilisateur réel**.

Le projet ne vise pas à tester l’intégralité du site, mais uniquement des parcours utilisateurs représentatifs, réalisables par un visiteur standard.

## 3. Objectifs du projet

Les objectifs principaux de ce projet sont :

- Mettre en place des tests automatisés end-to-end avec Playwright
- Utiliser une architecture claire basée sur le **Page Object Model**
- Rendre les tests robustes face aux changements de structure du site
- Gérer les contraintes réelles d’un site externe (anti-bot, backend non maîtrisé)
- Documenter les choix techniques et les éléments volontairement hors périmètre

## 4. Technologies utilisées

Les technologies et outils utilisés dans ce projet sont :

- **Playwright** : framework de tests end-to-end
- **TypeScript** : typage et maintenabilité du code
- **Node.js / npm** : gestion des dépendances
- **Page Object Model (POM)** : séparation des pages et des scénarios de test
- **Gherkin (BDD)** : description des scénarios métier sous forme Given / When / Then

## 5. Scénarios de tests automatisés

Cette section présente les différents scénarios de tests automatisés mis en place dans le cadre du projet.

Chaque scénario correspond à un parcours utilisateur réel et est implémenté sous forme de tests end-to-end avec Playwright. Les scénarios ont été définis afin de couvrir les fonctionnalités principales du site, tout en respectant les contraintes techniques d’un site tiers.

### 5.1 Recherche de carte (`search_card`)

**Objectif**  
Vérifier qu’un utilisateur peut rechercher une carte par son nom depuis la page d’accueil.

**Scénario**
- Accès à la page d’accueil
- Sélection du jeu Pokémon
- Recherche par nom de carte
- Affichage des résultats

**Vérifications**
- La page de résultats est chargée
- Les résultats sont visibles

**Fichiers concernés**
- `tests/search_card.spec.ts`
- `tests/pages/HomePage.ts`
- `tests/pages/SearchResultsPage.ts`



### 5.2 Filtrage par édition et tri par prix (`filter_sort`)

**Objectif**  
Vérifier le filtrage par édition et le tri par prix croissant.

**Scénario**
- Recherche d’une carte
- Filtrage par édition
- Tri par prix croissant
- Validation via le bouton **Search**

**Vérifications**
- Le filtre sélectionné est appliqué
- Les résultats sont triés par prix croissant

**Fichiers concernés**
- `tests/filter_sort.spec.ts`
- `tests/pages/filter_sort.ts`


### 5.3 Filtrage par édition (`filter_expansion`)

**Objectif**  
Vérifier que les résultats affichés correspondent bien à l’édition sélectionnée.

**Scénario**
- L’utilisateur recherche une carte
- Il sélectionne une édition spécifique (ex. : *Lost Origin*)
- Il valide le filtre via le bouton **Search**

**Vérifications**
- Les résultats affichés correspondent à de vrais produits
- Les URLs des produits contiennent l’édition attendue

**Fichiers concernés**
- `tests/filter_expansion.spec.ts`
- `tests/pages/filter_expansion.ts`

### 5.4 Authentification utilisateur

Les tests d’authentification prennent en compte les contraintes liées à un backend externe non maîtrisé.

Deux scénarios complémentaires sont couverts :
- une connexion réussie simulée afin de tester le parcours utilisateur après authentification,
- une connexion échouée réelle permettant de valider le comportement de l’interface.

#### Connexion réussie (simulée)

Ce scénario permet de vérifier la redirection et l’état utilisateur après une connexion considérée comme réussie, sans utiliser de compte réel.

**Fichier concerné**
- `tests/login_success_mock.spec.ts`

#### Connexion échouée (réelle)

Ce scénario vérifie l’affichage d’un message d’erreur et le maintien sur la page de connexion lorsque des identifiants invalides sont fournis.

**Fichiers concernés**
- `tests/login_failure.spec.ts`
- `tests/pages/LoginPage.ts`

## 6. Structure du projet

Le projet est organisé selon le principe du **Page Object Model (POM)**, permettant de séparer les scénarios de tests de la logique d’interaction avec les pages.

L’arborescence présentée ci-dessous illustre l’organisation générale du projet et pourra évoluer lors de l’intégration finale des différentes branches.

### Rôle des fichiers `.feature` et `.spec.ts`

Les fichiers `.feature` présents dans le dossier `tests/features` décrivent les scénarios
métier de manière lisible et indépendante de l’implémentation technique.

Les fichiers `.spec.ts` implémentent ces scénarios sous forme de tests Playwright
exécutables. Ils orchestrent les étapes Given / When / Then en s’appuyant sur les Page
Objects, sans dupliquer la logique métier décrite dans les fichiers `.feature`.

Cette séparation permet de distinguer clairement l’intention fonctionnelle
(ce qui est testé) de son implémentation technique (comment c’est testé).

### 6.1 Arborescence principale

```plaintext
.
├── .github
│   └── workflows
│       └── playwright.yml
├── .gitignore
├── package.json
├── package-lock.json
├── playwright.config.ts
├── README.md
└── tests
    ├── features
    │   ├── filter_edition.feature
    │   ├── filter_sort.feature
    │   ├── login.feature
    │   └── search_card.feature
    ├── filter_expansion.spec.ts
    ├── filter_sort.spec.ts
    ├── login_failed.spec.ts
    ├── login_mocked.spec.ts
    ├── pages
    │   ├── filter_expansion.ts
    │   ├── filter_sort.ts
    │   ├── HomePage.ts
    │   ├── LoginPage.ts
    │   └── SearchResultsPage.ts
    └── search_card.spec.ts

---
```

### 6.2 Scénarios de tests (`tests/*.spec.ts`)


Les fichiers situés dans le dossier `tests/` contiennent les scénarios de tests automatisés.

Chaque fichier :
- décrit un parcours utilisateur précis,
- orchestre les actions (Given / When / Then),
- s’appuie sur des Page Objects pour interagir avec le site.

Cette approche permet de garder les scénarios lisibles et proches du langage métier, sans exposer les détails techniques des sélecteurs.

### 6.3 Page Object Model (`tests/pages/`)

Le dossier `tests/pages/` contient les Page Objects, qui encapsulent :
- les sélecteurs Playwright,
- les actions utilisateur (clics, saisie, navigation),
- les stratégies de synchronisation.

Chaque Page Object représente une page ou une fonctionnalité du site CardMarket (page d’accueil, résultats de recherche, filtres, authentification, etc.).

Cette séparation permet :
- de limiter la duplication de code,
- de faciliter la maintenance en cas de changement du site,
- d’améliorer la robustesse des tests.

### 6.4 Configuration Playwright

La configuration globale des tests est définie dans le fichier `playwright.config.ts`.

Ce fichier permet notamment de :
- configurer le runner Playwright,
- activer l’exécution parallèle des tests,
- définir les reporters (rapport HTML),
- gérer les options de traçage en cas d’échec.

Le projet cible directement le site en ligne de CardMarket.
Aucun serveur local n’est lancé, le bloc `webServer` étant volontairement désactivé.

### 6.5 Pourquoi cette structure a été choisie

Cette structure a été choisie afin de :
- respecter les bonnes pratiques du test automatisé,
- faciliter la compréhension du projet par un tiers,
- permettre l’ajout de nouveaux scénarios sans modifier l’existant,
- limiter les effets de bord liés aux changements de l’interface du site.

Elle permet également de distinguer clairement ce qui relève :
- du **quoi tester** (scénarios),
- du **comment tester** (Page Objects),
- du **comment exécuter** les tests (configuration).

## 7. Installation et exécution

Cette section décrit les étapes nécessaires pour installer les dépendances du projet et exécuter les tests automatisés avec Playwright.

Le projet ne nécessite pas de serveur local, les tests étant exécutés directement contre le site en ligne de CardMarket.

### 7.1 Prérequis

Les éléments suivants sont requis pour exécuter le projet :

- Node.js (version récente recommandée)
- npm
- Un accès Internet (les tests ciblent un site externe)

### 7.2 Installation des dépendances

Après avoir cloné le dépôt du projet, restez à la racine du projet, installer les dépendances avec la commande suivante :

```bash
npm install

npx playwright install

---

```
### 7.3 Exécution des tests

Remarque importante :
Les tests étant exécutés contre un site tiers en production, il est recommandé d’éviter le lancement simultané de l’ensemble des scénarios. Une exécution trop intensive peut être interprétée comme un comportement automatisé anormal et déclencher des mécanismes de protection du site (anti-bot), entraînant le blocage temporaire des tests.

```bash
npx playwright test
```
Lancer un test spécifique
```bash

npx playwright test tests/filter_sort  --project=chromium
```
Liter les tests détéctés par Playwright

```bash
npx playwright test --list


---
```
### 7.4 Rapport de tests

Le projet utilise le reporter HTML de Playwright.

Après l’exécution des tests, un rapport peut être consulté avec la commande :

```bash
npx playwright show-report

```
Ce rapport permet d'analyser 
- les tests réussis et échoués,
- les traces d'exécution,
- les captures associées

---
### 7.5 Exécution en mode CI (optionnel)

Le comportement du runner Playwright peut être simulé en mode intégration continue à l’aide de la variable d’environnement `CI` :

```bash
CI=true npx playwright test
```
## 8. Détails techniques et choix d’implémentation

Cette section décrit les principaux choix techniques réalisés afin de garantir des tests fiables et maintenables.

- Utilisation du Page Object Model
- Sélecteurs basés sur l’accessibilité et les éléments métier
- Synchronisation explicite pour éviter les tests instables
- Validation des actions via les comportements réels du site
- Authentification simulée pour des raisons de sécurité

Les détails d’implémentation avancés (synchronisation, parsing des prix, contraintes DOM) sont documentés dans le code et peuvent être approfondis si nécessaire.

## 9. Gestion des contraintes du site

Les tests sont exécutés sur un site tiers en production (`https://www.cardmarket.com`). Cette contrainte implique que certains facteurs externes peuvent impacter la stabilité des tests (réseau, charge du site, changements d’UI).

Les principales contraintes prises en compte sont :

- **Site externe (pas de contrôle applicatif)** : aucune API interne, aucune base de données ni environnement de test dédié ne sont accessibles.
- **Mises à jour possibles de l’interface** : les tests privilégient des sélecteurs orientés accessibilité et des éléments métier plutôt que des sélecteurs basés sur le layout.
- **Application des filtres** : sur CardMarket, les filtres/tri ne sont appliqués qu’après validation via le bouton **Search** ; les tests reproduisent ce comportement.
- **Anti-bot / Cloudflare** : le site peut déclencher un challenge humain. Lorsque cela arrive, les tests ne peuvent pas le contourner ; ce comportement est considéré comme hors périmètre.

### Hors périmètre du projet

Le projet se concentre exclusivement sur des tests automatisés end-to-end côté utilisateur.
Les aspects suivants sont volontairement hors périmètre :

- Tests de performance et de charge
- Tests de sécurité backend (injection, authentification réelle, API internes)
- Tests unitaires et d’intégration côté serveur

Ces éléments ne sont pas accessibles ni contrôlables dans le cadre d’un site tiers en production
et sortent du périmètre pédagogique fixé pour ce projet.

## 10. Authentification : périmètre et mock

L’authentification réelle dépend d’un backend externe hors périmètre du projet.
Afin de respecter les bonnes pratiques de sécurité, aucun compte réel ni identifiant sensible n’est utilisé dans les tests automatisés.

Dans le cadre de tests end-to-end, le mockage complet des mécanismes d’authentification est généralement déconseillé lorsque l’objectif est de valider des parcours utilisateurs réalistes, car il peut masquer des problèmes d’intégration réels et réduire la valeur du test de bout en bout. En effet, l’usage de mocks dans des tests E2E va à l’encontre du principe consistant à tester l’application dans des conditions aussi proches que possible de la production, comme le soulignent les bonnes pratiques en test logiciel et en intégration continue.

Dans ce projet, la connexion réussie est donc simulée uniquement afin de permettre la validation du parcours utilisateur post-authentification, tandis que l’échec de connexion est testé de manière réelle afin de vérifier le comportement de l’interface. Ce compromis permet de concilier réalisme fonctionnel, sécurité et contraintes liées à un site tiers.


## 11. Difficultés rencontrées

Les principales difficultés rencontrées concernent la nature du site testé (site tiers, en production) :

- **Déclenchement possible d’un challenge anti-bot (Cloudflare)** : certains runs peuvent être bloqués par une vérification humaine.
- **Stabilité des sélecteurs** : certains éléments varient selon le contexte (langue, session, rendu). Les tests ont été construits avec des sélecteurs robustes (rôles, placeholders, URLs métier).
- **Synchronisation des résultats** : l’application rafraîchit parfois les résultats sans événement explicite. Une stratégie de synchronisation contrôlée a été utilisée afin d’éviter les tests “flaky”.
- **Login en automatisation** : le bouton "Log in" peut rester désactivé (`aria-disabled`) en automatisation. La soumission via la touche Entrée permet de tester le comportement fonctionnel attendu sans forcer l’état interne de l’UI.

## 12. Conclusion

Ce projet met en œuvre une suite de tests automatisés end-to-end avec Playwright sur le site CardMarket, en ciblant des parcours utilisateurs représentatifs accessibles sans compte réel.

L’architecture en Page Object Model, le choix de sélecteurs robustes et les stratégies de synchronisation permettent d’obtenir des tests maintenables et réalistes, malgré les contraintes inhérentes à un site tiers en production.

Les scénarios couvrent la recherche, le filtrage, le tri et l’authentification (partiellement mockée), en se concentrant prioritairement sur les parcours à plus forte valeur fonctionnelle pour l’utilisateur. Cette approche, basée sur la maîtrise du périmètre, la prise en compte des risques et des contraintes réelles, s’inscrit dans une démarche de qualité logicielle pragmatique et conforme aux objectifs pédagogiques du projet.
