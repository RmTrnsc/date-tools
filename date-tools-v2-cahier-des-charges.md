# Cahier des charges — date-tools V2

## 1. Objectif

Faire évoluer `date-tools` en une véritable boîte à outils de calcul autour des dates, tout en conservant le projet comme une application web statique légère :

- HTML
- CSS
- JavaScript vanilla
- ES modules
- aucun backend
- aucune base de données
- déploiement Vercel

URL actuelle : https://date-tools-ruddy.vercel.app/

Le projet doit rester simple, rapide, propre et agréable à utiliser.

---

## 2. Contraintes UX

### Une seule page

Conserver une single-page application légère. Pas de multiplication de pages HTML.

### Interface compacte

Point important : **ne pas transformer les panneaux en énormes rectangles qui occupent toute la hauteur de l'écran**.

Le panneau actif doit entourer son contenu et rester compact, comme dans la version actuelle en production.

Ne pas utiliser :

```css
.panel {
    height: 100%;
}
```

uniquement pour remplir l'écran.

Ne pas créer artificiellement de grandes zones blanches.

Le footer doit rester compact et centré.

### Responsive

Le site doit fonctionner sur desktop, laptop, tablette et mobile.

---

# 3. Navigation

Créer quatre catégories principales :

- **Dates**
- **Travail**
- **Calendrier**
- **Divers**

Une seule catégorie et un seul outil sont visibles à la fois.

Exemple :

```text
Calculateur de dates

[ Dates ] [ Travail ] [ Calendrier ] [ Divers ]

[ Jour ] [ Différence ] [ Ajouter / retirer ] [ Âge ] ...

------------------------------------------------

                    outil actif
```

Conserver le principe actuel d'un **indicateur unique animé** qui se déplace entre les onglets.

---

# 4. Outils à développer

## CATÉGORIE DATES

### 4.1 Jour de la semaine

Conserver le module actuel avec trois champs séparés :

- jour
- mois
- année

Exemple :

```text
23 / Janvier / 1989
→ Lundi
```

Le calcul peut utiliser la congruence de Zeller ou une méthode équivalente fiable.

### 4.2 Différence entre deux dates

Entrées :

- date de début
- date de fin

Résultats :

- jours calendaires
- semaines
- mois + jours
- années + mois + jours lorsque pertinent

Prévoir une gestion explicite de l'inclusion du premier/dernier jour si cela est utile.

### 4.3 Ajouter / retirer une durée

Entrées :

- date
- ajouter / retirer
- valeur
- unité

Unités :

- jours
- semaines
- mois
- années

Exemple :

```text
07/10/2026 + 45 jours
→ 21/11/2026
```

Gérer correctement les cas comme `31 janvier + 1 mois`.

### 4.4 Dans combien de temps ?

Entrée : date cible.

Afficher :

```text
Dans 69 jours
9 semaines et 6 jours
```

Si la date est passée :

```text
Il y a 12 jours
```

### 4.5 Âge / anniversaire

Entrée : date de naissance.

Afficher :

- âge
- années + mois + jours
- prochain anniversaire
- nombre de jours avant celui-ci
- jour de la semaine de naissance

Exemple :

```text
23/01/1989

37 ans
37 ans, 8 mois et 14 jours

Prochain anniversaire :
23/01/2027
```

### 4.6 Numéro de semaine

Entrée : date.

Afficher :

- numéro de semaine ISO
- année ISO
- lundi et dimanche de la semaine

Respecter ISO 8601.

### 4.7 Trouver une date

Première version avec des sélecteurs explicites :

- X jours après une date
- X jours avant une date
- X jours ouvrés après
- X jours ouvrés avant
- N-ième lundi/mardi/etc. d'un mois
- dernier jour correspondant à un jour de semaine

Ne pas construire de moteur de langage naturel complexe pour cette V2.

---

# 5. CATÉGORIE TRAVAIL

## 5.1 Jours ouvrés

Entrées :

- début
- fin
- calendrier

Première version : France.

Afficher :

- jours calendaires
- jours ouvrés
- week-ends
- jours fériés exclus

Options possibles :

- samedi travaillé
- inclure/exclure les jours fériés

## 5.2 Ajouter / retirer des jours ouvrés

Exemple :

```text
07/10/2026
+ 10 jours ouvrés
→ 21/10/2026
```

Réutiliser la fonction générique dans les autres outils.

## 5.3 Congés

Entrées :

- premier jour
- dernier jour

Afficher :

- jours calendaires
- jours ouvrés
- week-ends
- jours fériés
- date de reprise

Exemple :

```text
12/10/2026 → 23/10/2026

14 jours calendaires
10 jours ouvrés
```

## 5.4 Échéance / délai

Entrées :

- date de départ
- durée
- unité
- jours calendaires ou ouvrés

Exemple :

```text
07/10/2026
15 jours ouvrés
→ 28/10/2026
```

Ajouter une mention indiquant que certaines démarches peuvent avoir des règles spécifiques.

## 5.5 Préavis

Outil simple :

- date de départ
- durée
- unité

Afficher la date théorique de fin.

Ajouter un avertissement : le calcul réel peut dépendre du contrat, de la convention collective ou du contexte juridique.

## 5.6 Jours fériés

Afficher les jours fériés français d'une année.

Gérer :

- Jour de l'An
- Lundi de Pâques
- Fête du Travail
- Victoire 1945
- Ascension
- Lundi de Pentecôte
- Fête nationale
- Assomption
- Toussaint
- Armistice
- Noël

Prévoir une architecture permettant d'ajouter d'autres pays plus tard.

---

# 6. CATÉGORIE CALENDRIER

## 6.1 Calendrier mensuel

Fonctions :

- mois précédent
- mois suivant
- aujourd'hui
- week-ends
- jour actuel
- jours fériés
- numéro de semaine ISO

## 6.2 Calendrier annuel

Afficher les 12 mois dans une grille compacte avec :

- jours
- week-ends
- jours fériés
- numéros de semaines

## 6.3 Calendrier des jours fériés

Vue rapide des jours fériés d'une année.

Réutiliser le module de calcul des jours fériés.

---

# 7. CATÉGORIE DIVERS

## 7.1 Compte à rebours

Entrée :

- date cible
- éventuellement heure cible

Afficher :

```text
69 jours
4 heures
32 minutes
```

Une mise à jour périodique simple suffit.

## 7.2 Conversion de durée

Conversions :

- jours ↔ semaines
- jours ↔ heures
- heures ↔ minutes
- etc.

Attention : un mois ou une année n'est pas une durée fixe en nombre de jours.

## 7.3 Durée exacte

Entrées :

- date + heure de début
- date + heure de fin

Afficher :

- jours
- heures
- minutes
- secondes

## 7.4 Trouver une date

Si cette fonctionnalité est plus pertinente dans `Dates`, elle peut y rester. Éviter les doublons entre catégories.

---

# 8. Architecture JavaScript

Ne pas mettre toute la logique dans `app.js`.

Proposition :

```text
js/
├── app.js
├── date-utils.js
├── holidays-fr.js
├── calendar.js
└── tools/
    ├── weekday.js
    ├── difference.js
    ├── add-remove.js
    ├── countdown.js
    ├── age.js
    ├── week-number.js
    ├── business-days.js
    ├── holidays.js
    ├── calendar-month.js
    └── ...
```

Créer un module central `date-utils.js`.

Prévoir notamment :

```js
getDayOfWeek(date)
differenceBetweenDates(start, end)
addDays(date, amount)
addMonths(date, amount)
addYears(date, amount)
addBusinessDays(date, amount)
countBusinessDays(start, end)
getISOWeek(date)
getAge(birthDate, referenceDate)
isWeekend(date)
isHoliday(date)
getFrenchHolidays(year)
```

Les fonctions de calcul doivent être autant que possible indépendantes de l'interface HTML.

---

# 9. Gestion des dates

Faire particulièrement attention aux fuseaux horaires.

Éviter de manipuler naïvement :

```js
new Date("2026-10-07")
```

pour des dates qui n'ont pas d'heure.

Utiliser une représentation cohérente basée sur année/mois/jour ou une stratégie locale clairement définie.

Documenter les choix dans le code.

---

# 10. Jours fériés français

Créer :

```js
getFrenchHolidays(year)
```

Retourner une structure simple, par exemple :

```js
[
  {
    date: "2026-01-01",
    name: "Jour de l'An"
  }
]
```

L'architecture doit permettre d'ajouter plus tard Belgique, Suisse, Luxembourg, etc.

---

# 11. Interface

Chaque outil doit suivre la même structure visuelle :

```text
petite catégorie
titre
description courte
formulaire
bouton
résultat
```

Exemple :

```text
CALCUL DIRECT

Jour de la semaine

Entrez une date manuellement.

Jour
[ 23 ]

Mois
[ Janvier ]

Année
[ 1989 ]

[ Calculer ]

┌────────────────────────┐
│ Lundi                  │
└────────────────────────┘
```

Ne pas afficher plusieurs gros formulaires en même temps.

---

# 12. Onglets

Conserver l'indicateur unique animé :

```html
<nav class="tabs">
    <div class="tab-indicator"></div>
    ...
</nav>
```

Il doit :

- se déplacer horizontalement
- adapter sa largeur à l'onglet
- utiliser une transition fluide
- être recalculé au redimensionnement

---

# 13. Footer

Footer discret et centré horizontalement.

Exemple :

```text
Calculateur de dates — outil gratuit
```

CSS attendu :

```css
footer {
    text-align: center;
}
```

Ne pas utiliser le footer pour forcer une hauteur de page.

---

# 14. Design

Conserver l'identité actuelle :

- blanc
- gris
- noir/charbon
- peu de couleurs
- arrondis discrets
- ombres très légères
- typographie moderne
- pas de gradients criards
- pas de dashboard SaaS
- pas d'animations inutiles

Le résultat doit rester visuellement proche de la version actuelle plutôt que de repartir sur une nouvelle direction graphique.

---

# 15. Validation

Tous les outils doivent valider les entrées.

Gérer :

- dates invalides
- jours inexistants
- mois manquant
- année invalide
- valeurs incorrectes
- date de fin antérieure au début si non autorisé

Afficher une erreur compréhensible près du formulaire.

Aucune erreur JavaScript ne doit apparaître dans la console pour une simple mauvaise saisie utilisateur.

---

# 16. Accessibilité

Prévoir :

- labels associés aux champs
- navigation clavier
- `:focus-visible`
- contraste suffisant
- messages d'erreur explicites
- ne pas utiliser uniquement la couleur pour une information

---

# 17. SEO

Ajouter au minimum :

```html
<title>Calculateur de dates</title>

<meta
  name="description"
  content="Calculateur gratuit de dates, jours ouvrés, différences entre dates, échéances et calendrier."
>
```

Ajouter du contenu utile, mais ne pas remplir la page artificiellement avec du texte SEO.

---

# 18. Monétisation

La publicité n'est pas prioritaire pendant le développement.

Ne pas dégrader l'interface pour une régie publicitaire.

Si une publicité est ajoutée plus tard :

- emplacement discret
- jamais de popup
- jamais de pop-under
- jamais de publicité qui recouvre un formulaire
- idéalement un seul emplacement sous le panneau de l'outil

Le site doit rester agréable sans publicité.

---

# 19. Performance

Le projet doit rester très léger.

Éviter :

- frameworks lourds
- bibliothèques inutiles
- dépendances npm superflues
- grosses images
- animations coûteuses

Pas besoin de backend.

---

# 20. Ce qu'il ne faut PAS faire

Ne pas :

- migrer vers React/Vue/Next.js sans raison
- ajouter une base de données
- ajouter un backend
- ajouter une authentification
- ajouter des comptes utilisateurs
- transformer l'interface en gros dashboard
- afficher tous les outils simultanément
- créer de gros panneaux vides
- mettre une hauteur artificielle de `100%` aux panneaux
- ajouter beaucoup de couleurs
- ajouter du scroll vertical permanent sur desktop
- utiliser une grosse librairie de dates si JavaScript natif suffit

---

# 21. Ordre de développement

Tous les outils sont prévus dès maintenant, mais les implémenter dans cet ordre.

## Phase 1 — Architecture

1. Inspecter le projet existant.
2. Ne pas supprimer les fonctionnalités qui marchent.
3. Refactoriser les utilitaires de dates.
4. Mettre en place les catégories.
5. Mettre en place les sous-onglets.
6. Conserver l'indicateur animé.
7. Vérifier responsive et panneau compact.

## Phase 2 — Dates

1. Jour de la semaine
2. Différence entre deux dates
3. Ajouter / retirer
4. Dans combien de temps ?
5. Âge
6. Numéro de semaine
7. Trouver une date

## Phase 3 — Travail

1. Jours ouvrés
2. Ajouter / retirer des jours ouvrés
3. Jours fériés
4. Congés
5. Échéance
6. Préavis

## Phase 4 — Calendrier

1. Calendrier mensuel
2. Calendrier annuel
3. Jours fériés
4. Numéros de semaine

## Phase 5 — Divers

1. Compte à rebours
2. Conversion de durée
3. Durée exacte

## Phase 6 — Finitions

1. Validation
2. Accessibilité
3. Responsive
4. SEO
5. Performance
6. Favicon
7. Nettoyage
8. Tests

---

# 22. Tests indispensables

Tester au minimum :

```text
23/01/1989 → lundi
01/01/2000 → samedi
29/02/2024 → jeudi
31/12/2026 → jeudi
01/01/2027 → vendredi
```

Années bissextiles :

```text
29/02/2024
28/02/2025
29/02/2028
```

Changements de mois :

```text
31 janvier + 1 mois
28 février + 1 mois
29 février + 1 an
```

Jours ouvrés :

- samedi
- dimanche
- jours fériés
- vendredi → lundi
- périodes traversant un mois
- périodes traversant une année

Numéros de semaine :

- fin décembre
- début janvier
- changement d'année ISO

---

# 23. Critères de réussite

La V2 doit :

- proposer tous les outils prévus ;
- partager des fonctions de calcul communes ;
- rester en HTML/CSS/JS vanilla ;
- ne nécessiter aucun backend ;
- ne produire aucune erreur console lors d'une utilisation normale ;
- gérer correctement les cas limites ;
- conserver le design minimaliste ;
- n'afficher qu'un outil à la fois ;
- garder des panneaux compacts ;
- garder le footer centré ;
- fonctionner sur desktop et mobile ;
- être directement déployable sur Vercel.

---

# 24. Consigne finale pour l'agent

**Avant toute modification importante, inspecter le projet actuel.**

Il faut comprendre :

- la structure HTML existante ;
- les classes CSS ;
- les IDs utilisés par JavaScript ;
- le système actuel d'onglets ;
- les fonctions de calcul existantes.

Ne pas réécrire arbitrairement tout le projet.

Faire une évolution du projet existant.

Procéder par étapes et vérifier que l'application fonctionne après chaque grosse modification.

Priorités :

**1. Fonctionnalité**
**2. Exactitude des calculs**
**3. Simplicité du code**
**4. Cohérence visuelle**
**5. Performance**

Le résultat doit rester un **petit couteau suisse des dates**, pas devenir une application lourde.
