# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Workflow

**Pas de serveur de dev local.** Pour chaque modification :

```bash
npm run build   # valide la compilation TypeScript/JSX
git add .
git commit -m "..."
git push        # Railway redéploie automatiquement
```

## Stack

- **Frontend** : React 18 + Vite, `"type": "module"` — utiliser `import`/`export` partout
- **Backend** : Express dans `server.js` — sert l'API REST **et** les fichiers statiques `dist/`
- **Base de données** : PostgreSQL via `pg` (pas d'ORM)
- **Déploiement** : Dockerfile multi-stage → Railway

## Architecture & data flow

L'état de garde est un objet plat indexé par date :
```js
{ "YYYY-MM-DD": { avril: "alice" | "ludo" | null, leo: "alice" | "ludo" | null } }
```

Toutes les interactions passent par `useCustody` (`src/hooks/useCustody.js`) :
- Charge l'année entière en une requête au montage
- `custodyRef` (useRef) maintient l'état courant disponible dans les callbacks sans les invalider — nécessaire pour les mises à jour optimistes
- **Toutes les mises à jour sont optimistes** : `setCustody` avant le `fetch`
- `updateDay(dateStr, child, parent)` → `PUT /api/custody/:date`
- `bulkUpdate(days[], { avril, leo })` → `POST /api/custody/bulk` (transaction atomique). La valeur `'clear'` met à `null`, `null` signifie inchangé

## API

| Méthode | Route | Corps |
|---------|-------|-------|
| GET | `/api/custody/:year` | — |
| PUT | `/api/custody/:date` | `{ avril, leo }` |
| POST | `/api/custody/bulk` | `{ updates: [{ date, avril, leo }] }` |

Quand `avril` et `leo` sont tous les deux falsy, la ligne est supprimée (pas de garde = pas de row).

## Base de données

Table unique créée automatiquement au démarrage :
```sql
CREATE TABLE IF NOT EXISTS custody (
  date  DATE PRIMARY KEY,
  avril VARCHAR(10),
  leo   VARCHAR(10)
);
```

SSL activé automatiquement si `DATABASE_URL` ne contient pas `localhost`. En local, copier `.env.example` → `.env`.

## Vacances scolaires

Codées en dur dans `src/data/holidays.js` (Île-de-France Zone C) jusqu'en 2027. **Mettre à jour manuellement chaque année** en ajoutant un bloc dans `SCHOOL_HOLIDAYS` et les jours fériés mobiles dans `VARIABLE_HOLIDAYS`.

## Sélection multiple

Le mode sélection est entièrement géré dans `App.jsx` (état `selectionMode` + `selectedDays` Set). `DayCell` change de comportement selon `selectionMode` : clic = toggle sélection au lieu d'ouvrir le modal. `BulkEditor` est un panneau fixe en bas, visible dès qu'au moins un jour est sélectionné.

## Déploiement Railway

Ajouter un plugin **PostgreSQL** dans le projet Railway → `DATABASE_URL` est injectée automatiquement. Le Dockerfile fait un build en deux étapes : build Vite puis image Node légère avec uniquement `dist/`, `server.js` et les dépendances de production.
