# Déploiement GitHub + Railway

## 1. Publier sur GitHub

```bash
# Dans le dossier custody-calendar
git init
git add .
git commit -m "Initial commit — Calendrier de garde Avril & Léo"

# Crée un repo sur github.com (ex: custody-calendar) puis :
git remote add origin https://github.com/TON_USERNAME/custody-calendar.git
git branch -M main
git push -u origin main
```

## 2. Déployer sur Railway

1. Va sur **railway.app** et connecte-toi avec ton compte GitHub
2. Clique **New Project → Deploy from GitHub repo**
3. Sélectionne `custody-calendar`
4. Railway détecte le `Dockerfile` automatiquement et lance le build
5. Une fois déployé, clique **Generate Domain** pour obtenir une URL publique

## Variables d'environnement

Aucune variable nécessaire — l'app est 100% client-side (localStorage).

## Mises à jour

```bash
git add .
git commit -m "Mise à jour"
git push
```
Railway redéploie automatiquement à chaque push sur `main`.
