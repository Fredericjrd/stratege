# Stratège

Application d'entraînement au français professionnel de haut niveau. Cinq modules : tableau de bord, entraînement par répétition espacée, entraînement par règle individuelle, lecteur d'articles annotés, et certification chronométrée.

## Installation locale

```bash
npm install
npm run dev
```

L'application démarre sur `http://localhost:5173/stratege/`.

## Configuration de la clé API

Au premier lancement, l'application demande une clé API Anthropic. Obtenir une clé sur [console.anthropic.com](https://console.anthropic.com). La clé est stockée dans IndexedDB (navigateur local), jamais dans le code ni dans Git.

Pour réinitialiser la clé : ouvrir la console du navigateur et supprimer la base `stratege` dans l'onglet Application > Storage. Puis recharger la page.

## Déploiement sur GitHub Pages

1. Créer un dépôt GitHub.
2. Si le nom du dépôt diffère de `stratege`, mettre à jour le champ `base` dans `vite.config.ts` et le `basename` dans `src/App.tsx`.
3. Dans les paramètres du dépôt, activer Pages avec la source "GitHub Actions".
4. Pousser sur `main`. Le workflow `.github/workflows/deploy.yml` construit et déploie automatiquement.

## Tests

```bash
npm test          # mode watch
npm test -- --run # exécution unique (CI)
```

Les tests couvrent le moteur de répétition espacée et la logique de notation de la certification.

## Structure

```
src/
  data/rules.ts              Banque de 60 règles (niveaux 1–10)
  lib/
    api.ts                   Appels à l'API Claude (côté client)
    storage.ts               Persistance IndexedDB via localForage
    spaced-repetition.ts     Sélection par pondération et calcul de progression
  features/
    board/                   Tableau de bord et KPIs
    practice/                Entraînement (clic + rédaction)
    rules/                   Fiches de règles et exercices ciblés
    articles/                Lecteur d'articles annotés
    certification/           Examen chronométré 80 questions / 50 min
  components/                Nav, ApiKeySetup, Skeleton
```
