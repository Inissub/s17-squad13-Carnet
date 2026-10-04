import { Router } from "express";
import { prisma } from "../../db/prisma.js";

export const clientsRouter = Router();

clientsRouter.get("/", async (req, res) => {
  const { activiteId } = req.user;

  const [fiches, comptes] = await Promise.all([
    prisma.client.findMany({
      where: { activiteId, archive: false },
      select: { id: true, nom: true, telephone: true, adresse: true },
      orderBy: { nom: "asc" },
    }),
    prisma.compteClient.findMany({
      where: {
        emailVerifieLe: { not: null },
        clients: { none: { activiteId } },
      },
      select: { id: true, nom: true, telephone: true, ville: true },
      orderBy: { nom: "asc" },
    }),
  ]);

  res.json([
    ...fiches.map((c) => ({ ...c, source: "client" })),
    ...comptes.map(({ ville, ...c }) => ({
      ...c,
      adresse: ville ?? null,
      source: "compte",
    })),
  ]);
});
