import { Router } from "express";
import { prisma } from "../../db/prisma.js";

export const dashboardRouter = Router();

const STATUTS = ["A_PLANIFIER", "PLANIFIEE", "EN_COURS", "TERMINEE", "ANNULEE"];

// GET /api/dashboard
// Vue "Aujourd'hui" : prochains rendez-vous, suivi par statut, facturation.
// Un TECHNICIEN ne voit que ses propres interventions et n'a pas accès
// au résumé de facturation (réservé au RESPONSABLE).
dashboardRouter.get("/", async (req, res) => {
  const { activiteId, id: userId, role } = req.user;
  const estTechnicien = role === "TECHNICIEN";

  const filtreBase = {
    activiteId,
    ...(estTechnicien ? { technicienId: userId } : {}),
  };

  const [prochains, comptes, historique] = await Promise.all([
    prisma.intervention.findMany({
      where: {
        ...filtreBase,
        statut: { in: ["A_PLANIFIER", "PLANIFIEE"] },
        datePrevue: { not: null },
      },
      orderBy: { datePrevue: "asc" },
      take: 5,
      include: { client: true, technicien: true },
    }),
    prisma.intervention.groupBy({
      by: ["statut"],
      where: filtreBase,
      _count: { _all: true },
    }),
    prisma.historiqueStatut.findMany({
      where: {
        intervention: filtreBase,
      },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        intervention: { select: { id: true, reference: true, objet: true } },
        utilisateur: { select: { nom: true } },
      },
    }),
  ]);

  const suivi = Object.fromEntries(STATUTS.map((s) => [s, 0]));
  let total = 0;
  for (const c of comptes) {
    suivi[c.statut] = c._count._all;
    total += c._count._all;
  }

  const prochainsRendezVous = prochains.map((i) => ({
    id: i.id,
    reference: i.reference,
    objet: i.objet,
    statut: i.statut,
    datePrevue: i.datePrevue,
    client: i.client?.nom ?? null,
    technicien: i.technicien?.nom ?? null,
  }));

  const activiteRecente = historique.map((h) => ({
    id: h.id,
    interventionId: h.intervention.id,
    reference: h.intervention.reference,
    objet: h.intervention.objet,
    ancienStatut: h.ancienStatut,
    nouveauStatut: h.nouveauStatut,
    auteur: h.utilisateur?.nom ?? null,
    date: h.createdAt,
  }));

  let facturation = null;
  if (!estTechnicien) {
    const [lignes, paiements] = await Promise.all([
      prisma.ligneFacture.findMany({
        where: { facture: { activiteId } },
        select: { quantite: true, prixUnitaire: true },
      }),
      prisma.paiement.aggregate({
        where: { activiteId },
        _sum: { montant: true },
      }),
    ]);

    const totalFacture = lignes.reduce(
      (somme, ligne) => somme + Number(ligne.quantite) * Number(ligne.prixUnitaire),
      0,
    );
    const totalEncaisse = Number(paiements._sum.montant ?? 0);

    facturation = {
      facture: totalFacture,
      encaisse: totalEncaisse,
      restant: totalFacture - totalEncaisse,
    };
  }

  res.json({
    prochainsRendezVous,
    suivi: { ...suivi, total },
    facturation,
    activiteRecente,
  });
});
