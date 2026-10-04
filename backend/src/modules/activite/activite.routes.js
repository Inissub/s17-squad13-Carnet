import { Router } from "express";
import { prisma } from "../../db/prisma.js";

export const activiteRouter = Router();

// Membres actifs de la structure à qui l'on peut attribuer une intervention
activiteRouter.get("/techniciens", async (req, res) => {
  const techniciens = await prisma.utilisateur.findMany({
    where: { activiteId: req.user.activiteId, actif: true },
    select: { id: true, nom: true, role: true, metier: true },
    orderBy: [{ role: "asc" }, { nom: "asc" }],
  });

  res.json(techniciens);
});
