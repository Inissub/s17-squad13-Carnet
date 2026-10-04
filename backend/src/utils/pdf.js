import PDFDocument from "pdfkit";

const MARGE = 50;
const ENCRE = "#1a1a1a";
const GRIS = "#6b6b6b";
const TRAIT = "#e2e2e2";
const ACCENT = "#db0000";

// Les polices standard du PDF ne connaissent pas les espaces fines utilisées par Intl en français
const propre = (texte) => String(texte ?? "").replace(/[  ]/g, " ");

const nombre = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 });
const date = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
const dateHeure = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeStyle: "short" });

export const formatMontant = (valeur, devise) =>
  propre(`${nombre.format(Number(valeur) || 0)} ${devise === "XAF" ? "FCFA" : devise}`);
export const formatDate = (valeur) => (valeur ? propre(date.format(new Date(valeur))) : "");
export const formatDateHeure = (valeur) => (valeur ? propre(dateHeure.format(new Date(valeur))) : "");

const LIBELLES_TYPE = { MAIN_OEUVRE: "Main-d'œuvre", MATERIEL: "Matériel" };

// Ouvre un PDF envoyé directement dans la réponse HTTP
export function ouvrirPdf(res, nomFichier) {
  const doc = new PDFDocument({ size: "A4", margin: MARGE, info: { Title: nomFichier } });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="${nomFichier}.pdf"`);
  doc.pipe(res);
  return doc;
}

const largeur = (doc) => doc.page.width - 2 * MARGE;

function verifierPlace(doc, hauteur) {
  if (doc.y + hauteur > doc.page.height - MARGE) doc.addPage();
}

// En-tête : coordonnées de l'activité à gauche, type et référence du document à droite
export function entete(doc, activite, { titre, reference, dateDocument }) {
  const haut = doc.y;
  doc.font("Helvetica-Bold").fontSize(16).fillColor(ENCRE).text(propre(activite.nom), MARGE, haut, { width: 280 });
  doc.font("Helvetica").fontSize(9).fillColor(GRIS);
  [activite.adresse, activite.telephone, activite.infosFacturation].filter(Boolean).forEach((ligne) => {
    doc.text(propre(ligne), { width: 280 });
  });
  const basGauche = doc.y;

  doc.font("Helvetica-Bold").fontSize(18).fillColor(ACCENT).text(propre(titre), MARGE, haut, { width: largeur(doc), align: "right" });
  doc.font("Helvetica").fontSize(10).fillColor(ENCRE).text(propre(reference), { width: largeur(doc), align: "right" });
  if (dateDocument) doc.fillColor(GRIS).text(propre(dateDocument), { width: largeur(doc), align: "right" });

  doc.y = Math.max(basGauche, doc.y) + 20;
  doc.moveTo(MARGE, doc.y).lineTo(MARGE + largeur(doc), doc.y).strokeColor(TRAIT).stroke();
  doc.moveDown(1.2);
}

// Deux colonnes : client et intervention
export function blocClient(doc, intervention) {
  const haut = doc.y;
  const colonne = largeur(doc) / 2 - 10;
  const { client } = intervention;

  doc.font("Helvetica-Bold").fontSize(9).fillColor(GRIS).text("CLIENT", MARGE, haut, { width: colonne });
  doc.font("Helvetica-Bold").fontSize(11).fillColor(ENCRE).text(propre(client.nom), { width: colonne });
  doc.font("Helvetica").fontSize(10);
  [client.adresse, client.telephone].filter(Boolean).forEach((l) => doc.text(propre(l), { width: colonne }));
  const basGauche = doc.y;

  const x = MARGE + colonne + 20;
  doc.font("Helvetica-Bold").fontSize(9).fillColor(GRIS).text("INTERVENTION", x, haut, { width: colonne });
  doc.font("Helvetica-Bold").fontSize(11).fillColor(ENCRE).text(propre(intervention.objet), x, doc.y, { width: colonne });
  doc.font("Helvetica").fontSize(10).text(propre(intervention.reference), x, doc.y, { width: colonne });
  if (intervention.adresse) doc.text(propre(intervention.adresse), x, doc.y, { width: colonne });
  if (intervention.datePrevue) doc.text(`Prévue le ${formatDateHeure(intervention.datePrevue)}`, x, doc.y, { width: colonne });

  doc.x = MARGE;
  doc.y = Math.max(basGauche, doc.y) + 24;
}

// Tableau des lignes (devis ou facture) suivi du total
export function tableauLignes(doc, lignes, devise) {
  const l = largeur(doc);
  const colonnes = [
    { titre: "Désignation", x: 0, w: l * 0.42 },
    { titre: "Type", x: l * 0.42, w: l * 0.16 },
    { titre: "Qté", x: l * 0.58, w: l * 0.1, align: "right" },
    { titre: "Prix unitaire", x: l * 0.68, w: l * 0.16, align: "right" },
    { titre: "Total", x: l * 0.84, w: l * 0.16, align: "right" },
  ];

  const ligne = (valeurs, { gras = false, couleur = ENCRE } = {}) => {
    doc.font(gras ? "Helvetica-Bold" : "Helvetica").fontSize(9.5).fillColor(couleur);
    const hauteur = Math.max(...valeurs.map((v, i) => doc.heightOfString(propre(v), { width: colonnes[i].w - 6 })));
    verifierPlace(doc, hauteur + 12);
    const y = doc.y;
    valeurs.forEach((v, i) => {
      doc.text(propre(v), MARGE + colonnes[i].x, y, { width: colonnes[i].w - 6, align: colonnes[i].align ?? "left" });
    });
    doc.y = y + hauteur + 6;
    doc.moveTo(MARGE, doc.y).lineTo(MARGE + l, doc.y).strokeColor(TRAIT).stroke();
    doc.y += 6;
  };

  ligne(colonnes.map((c) => c.titre), { gras: true, couleur: GRIS });
  let total = 0;
  for (const item of lignes) {
    const montant = Number(item.quantite) * Number(item.prixUnitaire);
    total += montant;
    ligne([
      item.designation,
      LIBELLES_TYPE[item.type] ?? item.type,
      nombre.format(Number(item.quantite)),
      formatMontant(item.prixUnitaire, devise),
      formatMontant(montant, devise),
    ]);
  }

  verifierPlace(doc, 30);
  doc.moveDown(0.5);
  doc.font("Helvetica-Bold").fontSize(12).fillColor(ENCRE).text(`Total ${formatMontant(total, devise)}`, MARGE, doc.y, {
    width: l,
    align: "right",
  });
  doc.moveDown(1.5);
  return total;
}

// Section titrée avec un texte libre (ignorée si vide)
export function section(doc, titre, texte) {
  if (!texte) return;
  verifierPlace(doc, 50);
  doc.font("Helvetica-Bold").fontSize(10).fillColor(GRIS).text(propre(titre).toUpperCase(), MARGE, doc.y, { width: largeur(doc) });
  doc.moveDown(0.3);
  doc.font("Helvetica").fontSize(10.5).fillColor(ENCRE).text(propre(texte), { width: largeur(doc) });
  doc.moveDown(1);
}

export function titreSection(doc, titre) {
  verifierPlace(doc, 60);
  doc.moveDown(0.5);
  doc.font("Helvetica-Bold").fontSize(13).fillColor(ENCRE).text(propre(titre), MARGE, doc.y, { width: largeur(doc) });
  doc.moveDown(0.6);
}

// Grille de photos (JPEG/PNG uniquement : pdfkit ne lit pas le WebP)
export function photos(doc, images) {
  const taille = 150;
  const espace = 12;
  const parLigne = Math.floor((largeur(doc) + espace) / (taille + espace));
  images.forEach((image, i) => {
    if (i % parLigne === 0) {
      if (i > 0) doc.y += taille + espace;
      verifierPlace(doc, taille);
    }
    const x = MARGE + (i % parLigne) * (taille + espace);
    doc.image(image, x, doc.y, { fit: [taille, taille], align: "center", valign: "center" });
  });
  if (images.length) doc.y += taille + espace;
  doc.x = MARGE;
}

export function pied(doc, texte) {
  verifierPlace(doc, 40);
  doc.moveDown(1);
  doc.font("Helvetica").fontSize(9).fillColor(GRIS).text(propre(texte), MARGE, doc.y, { width: largeur(doc) });
}
