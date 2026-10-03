import { Router } from "express";

import { z } from "zod";
import { prisma } from "../../db/prisma.js";
import { arrondi, soldes } from "../facturation/soldes.js";
import { perimetre } from "../interventions/acces.js";
import { prisma } from "../../db/prisma.js";


export const dashboardRouter = Router();

const STATUTS = ["A_PLANIFIER", "PLANIFIEE", "EN_COURS", "TERMINEE", "ANNULEE"];


const schema = z.object({
  // Début de la journée du navigateur : les rendez-vous « à partir d'aujourd'hui » dépendent de son fuseau
  depuis: z.coerce.date().optional(),
});

dashboardRouter.get("/", async (req, res) => {
  const { depuis = new Date() } = schema.parse(req.query);
  const base = perimetre(req.user);
  const responsable = req.user.role === "RESPONSABLE";

  const [parStatut, prochains, factures] = await Promise.all([
    prisma.intervention.groupBy({ by: ["statut"], where: base, _count: { _all: true } }),
    prisma.intervention.findMany({
      where: { ...base, statut: { in: ["PLANIFIEE", "EN_COURS"] }, datePrevue: { gte: depuis } },
      select: {
        id: true,
        reference: true,
        objet: true,
        adresse: true,
        statut: true,
        datePrevue: true,
        client: { select: { nom: true } },
        technicien: { select: { nom: true } },
      },
      orderBy: { datePrevue: "asc" },
      take: 8,
    }),
    // Les montants ne concernent que le responsable
    responsable
      ? prisma.facture.findMany({
          where: { activiteId: req.user.activiteId },
          select: { lignes: { select: { quantite: true, prixUnitaire: true } }, paiements: { select: { montant: true } } },
        })
      : null,
  ]);

  const compteurs = Object.fromEntries(STATUTS.map((s) => [s, 0]));
  parStatut.forEach((g) => (compteurs[g.statut] = g._count._all));

  let facturation = null;
  if (factures) {
    const liste = factures.map(soldes);
    const somme = (cle) => arrondi(liste.reduce((s, f) => s + f[cle], 0));
    facturation = {
      facture: somme("total"),
      encaisse: somme("encaisse"),
      resteDu: somme("resteDu"),
      aEncaisser: liste.filter((f) => f.resteDu > 0).length,

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

    compteurs,
    total: Object.values(compteurs).reduce((a, b) => a + b, 0),
    prochains,
    facturation,

    prochainsRendezVous,
    suivi: { ...suivi, total },
    facturation,
    activiteRecente,

  });
});
