import { Router } from "express";
import { requireAuth } from "./middleware/auth.js";
import { activiteRouter } from "./modules/activite/activite.routes.js";
import { annuaireRouter } from "./modules/annuaire/annuaire.routes.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { clientsRouter } from "./modules/clients/clients.routes.js";
import { dashboardRouter } from "./modules/dashboard/dashboard.routes.js";
import { espaceClientRouter } from "./modules/espace-client/espace-client.routes.js";
import { facturationRouter } from "./modules/facturation/facturation.routes.js";
import { interventionsRouter } from "./modules/interventions/interventions.routes.js";
import { profilPublicRouter } from "./modules/profil-public/profil-public.routes.js";

export const routes = Router();

routes.get("/health", (req, res) => res.json({ ok: true }));

routes.use("/auth", authRouter);
routes.use("/annuaire", annuaireRouter);

routes.use("/espace-client", requireAuth, espaceClientRouter);
routes.use("/dashboard", requireAuth, dashboardRouter);
routes.use("/interventions", requireAuth, interventionsRouter);
routes.use("/clients", requireAuth, clientsRouter);
routes.use("/facturation", requireAuth, facturationRouter);
routes.use("/profil-public", requireAuth, profilPublicRouter);
routes.use("/activite", requireAuth, activiteRouter);
