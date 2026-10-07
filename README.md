# Carnet numérique des interventions

Application de suivi des interventions pour les techniciens et artisans du Congo-Brazzaville : clients, interventions, devis, factures et annuaire public des techniciens avec avis clients.

Lien du projet : https://maboko-carnet.vercel.app/

## Fonctionnalités

- Landing page et annuaire public des techniciens (profil, réalisations, avis)
- Inscription, activation par e-mail, invitation des techniciens par le responsable
- Tableau de bord : rendez-vous du jour, suivi de l'activité, classement de l'équipe
- Interventions : liste filtrée, fiche détaillée, diagnostic, rapport, photos, validation des travaux
- Devis, factures, paiements partiels et reçus, avec PDF au logo de l'activité
- Clients externes et clients inscrits sur Carnet
- Profil public du technicien et profil de l'activité (logo, équipe, compte)
- Interface responsive (menu burger, tableaux en cartes sur mobile)

## Stack

- Frontend : React, Vite, CSS
- Backend : Express, Prisma, PostgreSQL
- Fichiers : Cloudflare R2
- E-mails : SMTP

## Structure

```
frontend/   application React
backend/    API Express et base de données
```

## Prérequis

- Node.js 24
- PostgreSQL

## Installation

```bash
npm run install:all
```

Puis configurer le backend (voir `backend/README.md`) :

```bash
cd backend
cp .env.example .env
npm run db:migrate
npm run db:seed
```

## Lancer le projet

```bash
npm run dev
```

- Frontend : http://localhost:5173
- API : http://localhost:3001/api

## Déploiement

| Partie | Hébergement |
|---|---|
| Frontend | Vercel (dossier `frontend`, réglages dans `frontend/vercel.json`) |
| Backend | Render (dossier `backend`, Node 24) |
| Base de données | Neon (PostgreSQL) |

Les migrations sont appliquées au déploiement du backend (`npx prisma migrate deploy`).
Ne jamais lancer le seed sur la base de production : il crée des comptes de démo au mot de passe connu.

## Équipe

| Partie | Contributeur |
|---|---|
| Landing page | Steven KILONDA, Berenis MASSAMBA |
| Connexion et inscription | Berenis MASSAMBA |
| Espace client | Steven BOTOKO |
| Espace du technicien | Berenis MASSAMBA |
| Dashboard — Aujourd'hui | Précieux MAVOUNGOU BAYONNE |
| Dashboard — Interventions | Berenis MASSAMBA |
| Dashboard — Clients | Ketsia GOMA |
| Dashboard — Facturation | Berenis MASSAMBA |
| Dashboard — Mon profil public | Steven BOTOKO |
| Dashboard — Profil de l'activité | Berenis MASSAMBA |

Organisation du projet :

- Maquette Figma : Berenis MASSAMBA
- Initialisation du projet : Berenis MASSAMBA
- Découpage des tâches : Berenis MASSAMBA
- Création du repository : Ketsia GOMA

## Contribuer

- Une branche par tâche à créer en partant de la branche `develop` : `feature/<page>-<tache>`
- PR vers la branche `develop` avec au moins une relecture
- `npm run lint` dans `frontend/` avant chaque PR
