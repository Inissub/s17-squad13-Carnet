import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../db/prisma.js";
import { HttpError, notFound } from "../../utils/httpError.js";
import { urlPublique } from "../../utils/stockage.js";

export const profilPublicRouter = Router();

const profilSchema = z.object({
  nom: z.string().trim().min(1).max(120).optional(),
  profilPublic: z.boolean().optional(),
  slug: z.string().trim().max(80).nullable().optional(),
  metier: z.string().trim().max(120).nullable().optional(),
  bio: z.string().trim().max(2000).nullable().optional(),
  telephone: z.string().trim().max(40).nullable().optional(),
  whatsapp: z.string().trim().max(40).nullable().optional(),
  ville: z.string().trim().max(100).nullable().optional(),
  quartier: z.string().trim().max(100).nullable().optional(),
}).refine((data) => Object.keys(data).length > 0, { message: "Aucune modification reçue" });

const selectProfil = {
  id: true,
  nom: true,
  email: true,
  role: true,
  profilPublic: true,
  slug: true,
  metier: true,
  bio: true,
  telephone: true,
  whatsapp: true,
  ville: true,
  quartier: true,
  photoChemin: true,
  activite: { select: { nom: true } },
};

function utilisateurId(req) {
  const id = req.user?.id ?? req.user?.sub ?? req.user?.utilisateurId;
  if (!id) throw new HttpError(401, "Session invalide");
  return id;
}

function slugifier(texte) {
  return texte
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function presenter(profil) {
  const { photoChemin, ...donnees } = profil;
  let photoUrl = null;
  if (photoChemin) {
    try {
      photoUrl = urlPublique(photoChemin);
    } catch {
      // L'édition du profil reste possible sans configuration R2 publique.
    }
  }
  return { ...donnees, photoUrl };
}

profilPublicRouter.get("/", async (req, res) => {
  const profil = await prisma.utilisateur.findUnique({
    where: { id: utilisateurId(req) },
    select: selectProfil,
  });
  if (!profil) throw notFound("Utilisateur");
  res.json(presenter(profil));
});

profilPublicRouter.patch("/", async (req, res) => {
  const id = utilisateurId(req);
  const modifications = profilSchema.parse(req.body);
  const utilisateur = await prisma.utilisateur.findUnique({
    where: { id },
    select: { id: true, nom: true, slug: true },
  });
  if (!utilisateur) throw notFound("Utilisateur");

  const data = { ...modifications };
  if (data.slug !== undefined) {
    const valeur = data.slug?.trim() || null;
    data.slug = valeur ? slugifier(valeur) : null;
    if (valeur && !data.slug) throw new HttpError(400, "Le lien public doit contenir des lettres ou des chiffres");
  }

  const profilPublic = data.profilPublic ?? undefined;
  if (profilPublic && !data.slug) {
    const nom = data.nom ?? utilisateur.nom;
    data.slug = utilisateur.slug || slugifier(nom);
    if (!data.slug) throw new HttpError(400, "Ajoutez un nom avant d'activer le profil public");
  }

  try {
    const profil = await prisma.utilisateur.update({
      where: { id },
      data,
      select: selectProfil,
    });
    res.json(presenter(profil));
  } catch (error) {
    if (error?.code === "P2002" && error?.meta?.target?.includes("slug")) {
      throw new HttpError(409, "Ce lien public est déjà utilisé");
    }
    throw error;
  }
});
