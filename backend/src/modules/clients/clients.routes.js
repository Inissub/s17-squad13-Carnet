import { Router } from "express";
import { prisma } from "../../db/prisma.js";
import { requireRole } from "../../middleware/auth.js";
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

