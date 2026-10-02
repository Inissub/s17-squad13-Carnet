import bcrypt from "bcryptjs";
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../db/prisma.js";
import { requireAuth } from "../../middleware/auth.js";
import { HttpError } from "../../utils/httpError.js";
import { fermerSession, ouvrirSession } from "../../utils/session.js";

export const authRouter = Router();

const texte = (min, message) => z.string().trim().min(min, message);
const optionnel = z.preprocess((v) => (v === "" ? undefined : v), z.string().trim().optional());

const commun = {
  nom: texte(2, "Nom trop court"),
  email: z.string().trim().toLowerCase().email("E-mail invalide"),
  motDePasse: z.string().min(8, "Le mot de passe doit faire au moins 8 caractères"),
  telephone: optionnel,
  ville: optionnel,
};

const inscriptionSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("client"), ...commun }),
  z.object({
    type: z.literal("pro"),
    ...commun,
    nomActivite: texte(2, "Nom de l'activité trop court"),
    metier: optionnel,
    devise: z.enum(["XAF", "EUR", "USD"]).default("XAF"),
  }),
]);

const connexionSchema = z.object({
  email: z.string().trim().toLowerCase().email("E-mail invalide"),
  motDePasse: z.string().min(1, "Mot de passe requis"),
});

// Contenu de la session, lu par requireAuth et exposé dans req.user.
// Les clients ont le rôle CLIENT et pas d'activiteId.
const sessionPro = (user) => ({ id: user.id, activiteId: user.activiteId, role: user.role });
const sessionClient = (compte) => ({ id: compte.id, role: "CLIENT" });

const selectPro = {
  id: true,
  nom: true,
  email: true,
  role: true,
  actif: true,
  activite: { select: { id: true, nom: true, devise: true } },
};
const selectClient = { id: true, nom: true, email: true, telephone: true, ville: true };

async function profil(session) {
  if (session.role === "CLIENT") {
    const compte = await prisma.compteClient.findUnique({ where: { id: session.id }, select: selectClient });
    return compte && { type: "client", ...compte };
  }
  const user = await prisma.utilisateur.findUnique({ where: { id: session.id }, select: selectPro });
  if (!user?.actif) return null;
  const { actif: _actif, ...rest } = user;
  return { type: "pro", ...rest };
}

async function emailPris(email) {
  const [user, compte] = await Promise.all([
    prisma.utilisateur.findUnique({ where: { email }, select: { id: true } }),
    prisma.compteClient.findUnique({ where: { email }, select: { id: true } }),
  ]);
  return Boolean(user || compte);
}

authRouter.post("/inscription", async (req, res) => {
  const data = inscriptionSchema.parse(req.body);
  if (await emailPris(data.email)) throw new HttpError(409, "Un compte existe déjà avec cet e-mail");

  const motDePasseHash = await bcrypt.hash(data.motDePasse, 12);
  const { nom, email, telephone, ville } = data;

  let session;
  if (data.type === "client") {
    const compte = await prisma.compteClient.create({ data: { nom, email, telephone, ville, motDePasseHash } });
    session = sessionClient(compte);
  } else {
    const activite = await prisma.activite.create({
      data: {
        nom: data.nomActivite,
        telephone,
        devise: data.devise,
        utilisateurs: {
          create: {
            nom,
            email,
            motDePasseHash,
            role: "RESPONSABLE",
            metier: data.metier,
            ville,
            telephone,
            whatsapp: telephone,
          },
        },
      },
      select: { utilisateurs: { select: { id: true, activiteId: true, role: true } } },
    });
    session = sessionPro(activite.utilisateurs[0]);
  }

  ouvrirSession(res, session);
  res.status(201).json(await profil(session));
});

// Un seul formulaire pour les deux types de comptes : on cherche d'abord un professionnel, puis un client
authRouter.post("/connexion", async (req, res) => {
  const { email, motDePasse } = connexionSchema.parse(req.body);

  const user = await prisma.utilisateur.findUnique({ where: { email } });
  const compte = user ? null : await prisma.compteClient.findUnique({ where: { email } });
  const trouve = user ?? compte;

  const valide = trouve && (await bcrypt.compare(motDePasse, trouve.motDePasseHash));
  if (!valide) throw new HttpError(401, "E-mail ou mot de passe incorrect");
  if (user && !user.actif) throw new HttpError(403, "Ce compte est désactivé");

  const session = user ? sessionPro(user) : sessionClient(compte);
  ouvrirSession(res, session);
  res.json(await profil(session));
});

authRouter.post("/deconnexion", (req, res) => {
  fermerSession(res);
  res.status(204).end();
});

authRouter.get("/me", requireAuth, async (req, res) => {
  const user = await profil(req.user);
  if (!user) {
    fermerSession(res);
    throw new HttpError(401, "Session expirée");
  }
  res.json(user);
});
