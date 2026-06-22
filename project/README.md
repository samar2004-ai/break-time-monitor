# Concorde Vestiaire Live

Interface frontend React pour le suivi RFID des passages au vestiaire.

## Objectif

Le superviseur scanne un badge RFID USB. Le lecteur agit comme un clavier: il remplit le champ badge puis valide avec Entree. L'application lance le chronometre a l'entree, puis cloture la session quand le meme badge est scanne une deuxieme fois.

## Fonctionnalites frontend

- Scan RFID manuel ou via lecteur USB clavier.
- Sessions actives en temps reel.
- Limite de passage: 10 minutes.
- Etat normal, attention apres 8 minutes, critique apres 10 minutes.
- Alerte visuelle rouge et signal sonore si le navigateur l'autorise.
- Dashboard superviseur avec KPI, prochain seuil et historique recent.
- Persistance locale via `localStorage` en attendant l'API NAS.

## Lancer le projet

```bash
npm install
npm run dev
```

Vite demarre sur `http://localhost:3000`.

## Structure

```text
src/
  components/
    Header.jsx
    WorkerCard.jsx
  context/
    VestiaireContext.jsx
  hooks/
    useNow.js
    useVestiaire.js
  pages/
    Dashboard.jsx
    ScanPage.jsx
  App.jsx
  main.jsx
  index.css
```

## Prochaines etapes

- Brancher la lecture RFID reelle si le lecteur ne fonctionne pas en mode clavier.
- Connecter les scans au serveur NAS.
- Ajouter une base de donnees pour historique complet.
- Ajouter une authentification superviseur.
- Exporter les rapports de presence.
