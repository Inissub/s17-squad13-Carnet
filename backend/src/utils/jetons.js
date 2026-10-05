import crypto from "node:crypto";

// Seule l'empreinte SHA-256 est stockée : une fuite de la base ne permet pas d'utiliser un lien.
export const empreinte = (jeton) => crypto.createHash("sha256").update(jeton).digest("hex");

export function nouveauJeton(heures) {
  const jeton = crypto.randomBytes(32).toString("base64url");
  return {
    jeton,
    data: {
      jetonActivationHash: empreinte(jeton),
      jetonActivationExpire: new Date(Date.now() + heures * 3600 * 1000),
    },
  };
}
