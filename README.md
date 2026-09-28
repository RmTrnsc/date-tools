# Calculateur de dates

Petit utilitaire JavaScript en plusieurs onglets.

## Modules

- Jour de la semaine — saisie manuelle jour/mois/année et calcul par congruence de Zeller.
- Différence entre deux dates.
- Ajouter / retirer une durée à une date.
- Jours ouvrés / ouvrables avec jours fériés français.

## Lancer

Le projet utilise des modules ES (`import`/`export`). Il vaut mieux le servir avec un petit serveur local plutôt que d'ouvrir `index.html` directement.

Par exemple avec Python :

```bash
python3 -m http.server 8000
```

Puis ouvrir :

http://localhost:8000

## Note

Les règles de jours ouvrés/ouvrables sont des conventions générales. Pour un calcul juridique, fiscal ou contractuel précis, il faut appliquer les règles propres au dispositif concerné.
