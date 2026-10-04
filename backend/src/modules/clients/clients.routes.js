import { Router } from "express";
import { prisma } from "../../db/prisma.js";
import { requireRole } from "../../middleware/auth.js";
import { HttpError } from "../../utils/httpError.js";
import { z } from "zod";

export const clientsRouter = Router();

clientsRouter.use(requireRole("RESPONSABLE", "TECHNICIEN"));

const listeSchema = z.object({
    archive: z.enum(["true", "false"]).optional().transform((v) => v === "true"),
    q: z.string().trim().optional()
})


clientsRouter.get("/", async (req, res)=>{

    const { archive, q } = listeSchema.parse(req.query);
    const clients =  await prisma.client.findMany({
        where: {
            activiteId: req.user.activiteId,
            archive,
            ...(q && {
                OR:[
                    { nom: { contains: q, mode: "insensitive" }},
                    { telephone: { contains: q } },
                    { adresse: { contains: q, mode: "insensitive" } },
                ]
            })
        },
        orderBy: { nom: "asc" },
        select: {
        id: true,
        nom: true,
        telephone: true,
        adresse: true,
        archive: true,
        _count: { select: { interventions: true } },
        },
    });
    res.json(clients);
});

clientsRouter.get("/:id", async (req, res)=>{
    const client = await prisma.client.findFirst({
        where: { id: req.params.id, activiteId: req.user.activiteId},
        select: {
            id: true,
            nom: true,
            telephone: true,
            adresse: true,
            notes: true,
            archive: true,
            createdAt: true,
            updatedAt: true,
            compteClient: { select: { nom: true, email: true, telephone: true, ville: true } },
            _count: { select: { interventions: true } },
        },
    });
    if(!client){
        throw new HttpError(404, "Client introuvable")
    }
    res.json(client);
})
