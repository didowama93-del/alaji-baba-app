# Alaji Baba — prototype

Prototype front-end de la marketplace Alaji Baba (React + Vite). Toutes les
données sont simulées en mémoire (pas de vraie base de données ni de vrai
paiement) : c'est une démonstration interactive des parcours Acheteur,
Vendeur et Administrateur.

## Installer et lancer sur Termux (Android)

1. **Installer Termux** depuis F-Droid (la version Play Store n'est plus à jour).

2. **Installer Node.js et les outils de base**, dans Termux :
   ```
   pkg update && pkg upgrade
   pkg install nodejs-lts git
   ```

3. **Copier le projet sur le téléphone.**
   - Si tu as un zip : place-le dans le dossier Téléchargements, puis dans Termux :
     ```
     pkg install unzip
     termux-setup-storage
     cd ~/storage/downloads
     unzip alaji-baba-app.zip -d ~/alaji-baba-app
     cd ~/alaji-baba-app
     ```
   - Ou avec Git si le projet est sur un dépôt :
     ```
     git clone <url-du-depot>
     cd alaji-baba-app
     ```

4. **Installer les dépendances** (peut prendre quelques minutes la première fois) :
   ```
   npm install
   ```

5. **Lancer l'application** :
   ```
   npm run dev -- --host 0.0.0.0
   ```
   Vite affiche une adresse du type `http://localhost:5173` (et une adresse
   réseau locale). Ouvre-la dans le navigateur du téléphone (Chrome, Firefox…).

6. Pour arrêter le serveur : `Ctrl + C` dans Termux.

## Construire une version statique (optionnel)

Pour générer des fichiers HTML/CSS/JS statiques, exportables ou hébergeables
n'importe où (y compris un simple dossier ouvert dans un navigateur) :
```
npm run build
```
Les fichiers sont générés dans le dossier `dist/`.

## Structure du projet

```
alaji-baba-app/
├── index.html          point d'entrée HTML
├── package.json         dépendances et scripts
├── vite.config.js        configuration du serveur de développement
└── src/
    ├── main.jsx          montage de l'application React
    └── App.jsx           toute la logique et l'interface (Acheteur / Vendeur / Admin)
```

## Prochaine étape : un vrai backend

Ce prototype n'a pas de serveur ni de base de données : à la fermeture de
l'onglet, tout est réinitialisé. Pour une vraie mise en production, il faudra
un backend (API + base de données) qui gère réellement les comptes, les
paiements et le séquestre — ce projet peut alors devenir uniquement le
front-end, connecté à cette API.
