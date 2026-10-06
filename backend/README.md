# Backend

Express 5, Prisma 7, PostgreSQL. Node 24.

## Installation

```bash
createdb carnet
cp .env.example .env
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

L'API tourne sur http://localhost:3001/api.

Le client Prisma (`src/generated/`) n'est pas versionné : il est créé par `npm install`
(script `postinstall`). Après une modification de `prisma/schema.prisma`, relancer `npx prisma generate`.

## Scripts

- `npm run dev` : lance l'API
- `npm run db:migrate` : applique les migrations
- `npm run db:seed` : données de démo
- `npm run db:reset` : vide la base puis relance migrations et seed
- `npm run db:studio` : ouvre Prisma Studio

## Comptes de démo

Pour le développement uniquement. Le seed refuse de s'exécuter en production ou sur une base distante.

Mot de passe : `demo12345`

- Responsable : demo@carnet.test
- Techniciens : grace@carnet.test, arnaud@carnet.test
- Clients : mireille@carnet.test, christian@carnet.test

## Modules

| Module | Route | Contributeur |
|---|---|---|
| auth | /api/auth | Berenis MASSAMBA |
| annuaire | /api/annuaire | Steven BOTOKO |
| espace-client | /api/espace-client | Steven BOTOKO |
| dashboard | /api/dashboard | Précieux MAVOUNGOU BAYONNE |
| interventions | /api/interventions | Berenis MASSAMBA |
| clients | /api/clients | Ketsia GOMA |
| facturation | /api/facturation | Berenis MASSAMBA |
| profil-public | /api/profil-public | Steven BOTOKO |
| activite | /api/activite | Berenis MASSAMBA |

Seuls `auth` et `annuaire` sont accessibles sans connexion.

## Fichiers

Les fichiers sont stockés sur Cloudflare R2. Demander les variables `R2_*` et les ajouter dans `.env`.

- `carnet-numerique-prive` : photos et documents d'intervention, servis par l'API avec un lien signé
- `carnet-numerique` (public) : logo de l'activité, photos de profil, réalisations

Sans R2 configuré, les fichiers sont enregistrés en local dans `backend/uploads/` (ignoré par git).

Utiliser `uploadImage` / `uploadDocument` / `uploadLogo` (`middleware/upload.js`) puis les fonctions de `utils/stockage.js`.
En base on enregistre le chemin du fichier, pas l'URL.

## E-mails

Activation des comptes, invitation des techniciens et nouveau mot de passe passent par SMTP (variables `SMTP_*`).
Sans `SMTP_HOST`, les e-mails sont affichés dans la console du backend.

## Règles

- Valider les entrées avec zod.
- Lever les erreurs avec `HttpError`.
- Toujours filtrer les données sur l'activité de l'utilisateur connecté.
- Une migration par PR : `npm run db:migrate -- --name nom_migration`.
- Ne jamais commiter `.env`.
