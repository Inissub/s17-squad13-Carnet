import { Router } from "express";
import { prisma } from "../../db/prisma.js";

export const interventionsRouter = Router();

interventionsRouter.get("/", async (req, res) => {
  const { id, activiteId, role } = req.user;

  const interventions = await prisma.intervention.findMany({
    where: {
      activiteId,
      // Un technicien ne voit que les interventions qui lui sont attribuées
      ...(role === "TECHNICIEN" && { technicienId: id }),
    },
    select: {
      id: true,
      reference: true,
      objet: true,
      adresse: true,
      priorite: true,
      statut: true,
      datePrevue: true,
      client: { select: { id: true, nom: true } },
      technicien: { select: { id: true, nom: true } },
    },
    orderBy: [{ datePrevue: { sort: "asc", nulls: "last" } }, { createdAt: "desc" }],
  });

  res.json(interventions);
});
