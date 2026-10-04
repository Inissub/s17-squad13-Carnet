import { Router } from "express";
import { prisma } from "../../db/prisma.js";

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


const optionnel = z.preprocess((v) => (v === "" ? undefined : v), z.string().trim().optional());

const creationSchema = z.object({
    nom: z.string().trim().min(2, "Nom trop court").optional(),
    telephone: optionnel,
    adresse: optionnel,
    notes: optionnel,
    compteClientId: z.string().optional(),
});

clientsRouter.post("/", requireRole("RESPONSABLE"), async (req, res) => {

    const data = creationSchema.parse(req.body);
    const { activiteId } = req.user;
    let { nom, telephone } = data;
    if (data.compteClientId) {
        const compte = await prisma.compteClient.findUnique({
            where: { id: data.compteClientId },
            select: { id: true, nom: true, telephone: true, emailVerifieLe: true },
        });
        if (!compte || !compte.emailVerifieLe) throw new HttpError(404, "Compte Carnet introuvable");
        const doublon = await prisma.client.findFirst({
            where: { activiteId, compteClientId: compte.id },
            select: { id: true },
        });
        if (doublon) throw new HttpError(409, "Ce client est déjà dans votre carnet");
        nom = compte.nom;
        telephone = data.telephone ?? compte.telephone ?? undefined;
    } else if (!nom) {
        throw new HttpError(400, "Le nom est obligatoire");
    }
    const client = await prisma.client.create({
        data: {
        activiteId,
        nom,
        telephone,
        adresse: data.adresse,
        notes: data.notes,
        compteClientId: data.compteClientId,
        },
        select: { id: true, nom: true },
    });
    res.status(201).json(client);
});



const rechercheCompteSchema = z.object({
    email: z.email("E-mail invalide").trim().toLowerCase()
});

clientsRouter.get("/compte", requireRole("RESPONSABLE"), async (req, res) => {

    const { email } = rechercheCompteSchema.parse(req.query);
    const compte = await prisma.compteClient.findUnique({
        where: { email },
        select: { id: true, nom: true, ville: true, emailVerifieLe: true },
    });
    if (!compte || !compte.emailVerifieLe) {
        throw new HttpError(404, "Aucun compte Carnet trouvé avec cet e-mail");
    }
    const dejaAjoute = await prisma.client.findFirst({
        where: { activiteId: req.user.activiteId, compteClientId: compte.id },
        select: { id: true },
    });
    res.json({
        id: compte.id,
        nom: compte.nom,
        ville: compte.ville,
        dejaAjoute: Boolean(dejaAjoute),
    });
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
            interventions: {
                orderBy: { createdAt: "desc" },
                select: {
                id: true,
                reference: true,
                objet: true,
                statut: true,
                priorite: true,
                datePrevue: true,
                technicien: { select: { nom: true } },
                },
            },
        },
    });
    if(!client){
        throw new HttpError(404, "Client introuvable")
    }
    res.json(client);
})
