# Calendrier de Garde — Avril & Léo

Application de gestion de garde alternée entre Alice et Ludo pour leurs enfants Avril et Léo.

## Stack

- **Frontend** : React 18 + Vite
- **Backend** : Express (Node.js, ESM)
- **Base de données** : PostgreSQL (`pg`)
- **Déploiement** : GitHub → Railway (Dockerfile)

## Architecture

```
custody-calendar/
├── server.js              # Express API + serving du build React
├── src/
│   ├── App.jsx            # Composant racine, state global (année, sélection)
│   ├── index.css          # Styles globaux (pas de framework CSS)
│   ├── hooks/
│   │   └── useCustody.js  # Fetch API, mises à jour optimistes, bulkUpdate
│   ├── components/
│   │   ├── MonthGrid.jsx  # Grille d'un mois
│   │   ├── DayCell.jsx    # Cellule d'un jour (couleur, indicateurs A/L)
│   │   ├── DayEditor.jsx  # Modal d'édition d'un jour
│   │   ├── BulkEditor.jsx # Panneau fixe de sélection multiple
│   │   └── KPIPanel.jsx   # Tableau de stats par mois et par an
│   └── data/
│       └── holidays.js    # Vacances scolaires Île-de-France Zone C + jours fériés
```

## API

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/custody/:year` | Toutes les gardes d'une année |
| PUT | `/api/custody/:date` | Mise à jour d'un jour |
| POST | `/api/custody/bulk` | Mise à jour de plusieurs jours (transaction) |

## Schéma PostgreSQL

```sql
CREATE TABLE custody (
  date  DATE        PRIMARY KEY,
  avril VARCHAR(10),  -- 'alice' | 'ludo' | NULL
  leo   VARCHAR(10)   -- 'alice' | 'ludo' | NULL
);
```

La table est créée automatiquement au démarrage du serveur si elle n'existe pas.

## Variables d'environnement

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | URL de connexion PostgreSQL (injectée automatiquement par Railway) |
| `PORT` | Port du serveur (injecté par Railway, défaut : 3000) |

Pour le dev local, copier `.env.example` en `.env`.

## Workflow

- **Pas de serveur de dev local** — modifications → `npm run build` pour valider → `git push`
- Railway redéploie automatiquement à chaque push sur `main`
- Sur Railway : ajouter un plugin **PostgreSQL**, `DATABASE_URL` est injectée automatiquement

## Conventions

- Alice = rose (`#d81b8c`)
- Ludo = bleu (`#1565c0`)
- `A` = Avril, `L` = Léo dans les cellules du calendrier
- Les mises à jour sont **optimistes** : l'UI se met à jour immédiatement, la sync PostgreSQL se fait en arrière-plan
