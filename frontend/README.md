# Frontend

React + Vite, CSS classique.

```bash
npm run dev
npm run lint
npm run build
```

Les appels `/api` sont redirigés vers le backend (http://localhost:3001). En production, la
redirection est faite par Vercel (`vercel.json`).

## Pages

| Dossier | Routes | Contributeur |
|---|---|---|
| landing | / | Steven KILONDA, Berenis MASSAMBA |
| auth | /connexion, /inscription, /activation, /invitation | Berenis MASSAMBA |
| espace-client | /techniciens, /t/:slug, /client | Steven BOTOKO |
| dashboard | /dashboard | Précieux MAVOUNGOU BAYONNE |
| interventions | /dashboard/interventions | Berenis MASSAMBA |
| clients | /dashboard/clients | Ketsia GOMA |
| facturation | /dashboard/facturation | Berenis MASSAMBA |
| profil-public | /dashboard/profil-public | Steven BOTOKO |
| profil-activite | /dashboard/profil-activite | Berenis MASSAMBA |

L'espace du technicien (menu réduit, interventions attribuées uniquement) : Berenis MASSAMBA.

## Règles

- Couleurs et espacements : utiliser les variables de `styles/variables.css`.
- Un fichier CSS par page ou composant, classes préfixées par son nom.
- Appels API via `api/client.js` ou `useFetch`.
- Composants communs dans `components/`, à modifier en accord avec l'équipe.
- Branches : `feature/<page>-<tache>`, PR vers `develop`.
