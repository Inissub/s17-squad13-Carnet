import {z} from 'zod';

const optionnel = (schema) => z.preprocess((v) => (typeof v === "string" && v.trim() === "" ? undefined : v), schema.optional());

const email = z.string({error: "l'email est obligatoire"}).trim().toLowerCase().pipe(z.email("email invalide"));

const motDePasse = z.string({error: "le mot de passe est obligatoire"}).min(8, "le mot de passe doit contenir au moins 8 caracteres").max(72, "votre mot de passe est trop long");

const nom = (message)=> z.string({error: message}).trim().min(2, message).max(100, "trop long");

const numero = (message) =>z.string({ error: message }).trim().transform((v) => v.replace(/[\s.\-()]/g, "")).pipe(z.string().regex(/^\+?\d{9,12}$/, "numéro invalide"));

const telephone = optionnel(numero("numero invalide"));

const ville = optionnel(z.string().trim().max(100, "texte trop long"));

const clientSchema = z.object({
    type : z.literal("client"),
    nom: nom("le nom complet est obligatoire"),
    telephone,
    ville,
    email,
    motDePasse,
});
const proSchema = z.object({
    type: z.literal("pro"),
    activiteNom: nom("le nom de votre entreprise ou activité est obligatoire"),
    nom: nom("votre nom est obligatoire"),
    metier: nom("votre metier est obligatoire"),
    ville: nom("la ville est obligatoire"),
    telephone: numero("entrez votre numero de telephone"),
    devise : z.string().trim().toUpperCase().min(3, "devise invalide").max(5, "devise invalide").default("XAF"),
    email,
    motDePasse,
});

export const inscriptionSchema = z.discriminatedUnion("type", [clientSchema, proSchema], {error: "type de compte invalide"});