import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../db/prisma.js";
import { arrondi, soldes } from "../facturation/soldes.js";
import { perimetre } from "../interventions/acces.js";

export const dashboardRouter = Router();

const STATUTS = ["A_PLANIFIER", "PLANIFIEE", "EN_COURS", "TERMINEE", "ANNULEE"];

const schema = z.object({
  // Début de journée dans le fuseau du navigateur
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
    };
  }

    // --- Mini-classement + spécialité la plus demandée : RESPONSABLE uniquement ---
  let classement = null;
  let specialites = null;

  if (responsable) {
    const [techniciens, terminees, enCours, avis] = await Promise.all([
      // Tous les techniciens actifs de l'activité
      prisma.utilisateur.findMany({
        where: { activiteId: req.user.activiteId, role: "TECHNICIEN", actif: true },
        select: { id: true, nom: true, metier: true },
      }),
      // Interventions terminées sur les 7 derniers jours, par technicien
      prisma.intervention.groupBy({
        by: ["technicienId"],
        where: {
          activiteId: req.user.activiteId,
          statut: "TERMINEE",
          technicienId: { not: null },
          updatedAt: { gte: debutSemaine() },
        },
        _count: { _all: true },
      }),
      // Charge actuelle : interventions encore en cours ou planifiées, par technicien
      prisma.intervention.groupBy({
        by: ["technicienId"],
        where: {
          activiteId: req.user.activiteId,
          statut: { in: ["PLANIFIEE", "EN_COURS"] },
          technicienId: { not: null },
        },
        _count: { _all: true },
      }),
      // Note moyenne par technicien
      prisma.avis.groupBy({
        by: ["technicienId"],
        where: { technicien: { activiteId: req.user.activiteId } },
        _avg: { note: true },
      }),
    ]);

    const parId = (liste) => Object.fromEntries(liste.map((l) => [l.technicienId, l]));
    const termineesParId = parId(terminees);
    const enCoursParId = parId(enCours);
    const avisParId = parId(avis);

    classement = techniciens
      .map((t) => ({
        id: t.id,
        nom: t.nom,
        metier: t.metier,
        termineesSemaine: termineesParId[t.id]?._count._all ?? 0,
        chargeActuelle: enCoursParId[t.id]?._count._all ?? 0,
        noteMoyenne: avisParId[t.id]?._avg.note ? arrondi(avisParId[t.id]._avg.note) : null,
      }))
      .sort((a, b) => b.termineesSemaine - a.termineesSemaine);

    // Spécialité la plus demandée : interventions des 30 derniers jours, groupées par métier du technicien attribué
    const trenteJours = new Date();
    trenteJours.setDate(trenteJours.getDate() - 30);

    const interventionsRecentes = await prisma.intervention.findMany({
      where: {
        activiteId: req.user.activiteId,
        createdAt: { gte: trenteJours },
        technicienId: { not: null },
      },
      select: { technicien: { select: { metier: true } } },
    });

    const compteParMetier = {};
    interventionsRecentes.forEach((i) => {
      const metier = i.technicien?.metier ?? "Non renseigné";
      compteParMetier[metier] = (compteParMetier[metier] ?? 0) + 1;
    });

    const totalInterventions = interventionsRecentes.length;
    specialites = Object.entries(compteParMetier)
      .map(([metier, nombre]) => ({
        metier,
        nombre,
        part: totalInterventions ? Math.round((nombre / totalInterventions) * 100) : 0,
      }))
      .sort((a, b) => b.nombre - a.nombre);
  }


  res.json({
    compteurs,
    total: Object.values(compteurs).reduce((a, b) => a + b, 0),
    prochains,
    facturation,
  });
});
