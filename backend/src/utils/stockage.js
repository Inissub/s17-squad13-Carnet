import crypto from "node:crypto";
import path from "node:path";
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "../config/env.js";
import { r2 } from "../db/r2.js";
import { HttpError } from "./httpError.js";

export const BUCKETS = {
  prive: env.R2_BUCKET_PRIVE,
  public: env.R2_BUCKET_PUBLIC,
};

export const dossiers = {
  intervention: (activiteId, interventionId) => `${activiteId}/interventions/${interventionId}`,
  logo: (activiteId) => `${activiteId}/logo`,
  profil: (utilisateurId) => `profils/${utilisateurId}`,
};

function client() {
  if (!r2) throw new HttpError(503, "Stockage non configuré");
  return r2;
}

export async function envoyerFichier({ bucket, dossier, fichier }) {
  if (!fichier) throw new HttpError(400, "Aucun fichier reçu");
  const extension = path.extname(fichier.originalname).toLowerCase();
  const chemin = `${dossier}/${crypto.randomUUID()}${extension}`;

  await client().send(
    new PutObjectCommand({ Bucket: bucket, Key: chemin, Body: fichier.buffer, ContentType: fichier.mimetype }),
  );

  return { chemin, typeMime: fichier.mimetype, taille: fichier.size, nomOriginal: fichier.originalname };
}

export function lienTemporaire(chemin, secondes = 600) {
  return getSignedUrl(client(), new GetObjectCommand({ Bucket: BUCKETS.prive, Key: chemin }), { expiresIn: secondes });
}

export function urlPublique(chemin) {
  if (!chemin) return null;
  if (!env.R2_PUBLIC_URL) throw new HttpError(503, "R2_PUBLIC_URL non configurée");
  return `${env.R2_PUBLIC_URL.replace(/\/$/, "")}/${chemin}`;
}

export async function supprimerFichier(bucket, chemin) {
  if (!chemin) return;
  await client().send(new DeleteObjectCommand({ Bucket: bucket, Key: chemin }));
}
