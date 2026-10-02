import { Link, useParams } from 'react-router-dom'
import { Card } from '../../components/ui/Card.jsx'
import './ProfilTechnicienPage.css'

const TECHNICIENS = [
  {
    slug: 'arnaud-moukala',
    nom: 'Arnaud Moukala',
    metier: 'Plombier',
    ville: 'Brazzaville',
    quartier: 'Bacongo',
    bio: 'Plombier à Brazzaville sud. Fuites, chauffe-eau et sanitaires.',
    telephone: '+242 05 530 77 81',
    whatsapp: '+242 05 530 77 81',
    activite: { nom: 'Plomberie Matsala' },
    avis: [{ id: 'a1', note: 5, commentaire: 'Travail propre et rapide.' }],
  },
  {
    slug: 'grace-nkounkou',
    nom: 'Grâce Nkounkou',
    metier: 'Électricienne',
    ville: 'Brazzaville',
    quartier: 'Moungali',
    bio: 'Électricienne à Brazzaville. Installations et dépannages électriques.',
    telephone: '+242 06 845 12 30',
    whatsapp: '+242 06 845 12 30',
    activite: { nom: 'Plomberie Matsala' },
    avis: [],
  },
]

function chiffres(numero) {
  return numero.replace(/\D/g, '')
}

export default function ProfilTechnicienPage() {
  const { slug } = useParams()
  const technicien = TECHNICIENS.find((t) => t.slug === slug)

  if (!technicien) {
    return (
      <div className="container">
        <Link to="/techniciens" className="profil-technicien__retour">← Retour à l'annuaire</Link>
        <h1 className="page-title">Technicien introuvable</h1>
        <p className="profil-technicien__vide">Ce profil n'existe pas ou n'est pas public.</p>
      </div>
    )
  }

  const { nom, metier, ville, quartier, bio, telephone, whatsapp, activite, avis } = technicien
  const moyenne = avis.length
    ? Math.round(avis.reduce((somme, a) => somme + a.note, 0) / avis.length)
    : 0

  return (
    <div className="container">
      <Link to="/techniciens" className="profil-technicien__retour">← Retour à l'annuaire</Link>

      <div className="profil-technicien__grille">
        <Card>
          <h1 className="page-title">{nom}</h1>
          <div className="profil-technicien__metier">{metier}</div>
          <div className="profil-technicien__info">{quartier}, {ville}</div>
          <div className="profil-technicien__info">{activite.nom}</div>
          <div className="profil-technicien__note">
            {'★'.repeat(moyenne)}
            {'☆'.repeat(5 - moyenne)} {avis.length} avis
          </div>
          {bio && <p className="profil-technicien__bio">{bio}</p>}
        </Card>

        <Card title="Contacter">
          <div className="profil-technicien__actions">
            {whatsapp && (
              <a
                className="profil-technicien__bouton"
                href={`https://wa.me/${chiffres(whatsapp)}`}
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp
              </a>
            )}
            {telephone && (
              <a
                className="profil-technicien__bouton profil-technicien__bouton--secondaire"
                href={`tel:${chiffres(telephone)}`}
              >
                Appeler
              </a>
            )}
          </div>
        </Card>
      </div>

      <div className="profil-technicien__avis">
        <Card title="Avis clients">
          {avis.length === 0 ? (
            <p className="profil-technicien__vide">Aucun avis pour le moment.</p>
          ) : (
            avis.map((a) => (
              <div key={a.id} className="profil-technicien__avis-item">
                <div className="profil-technicien__avis-note">
                  {'★'.repeat(a.note)}
                  {'☆'.repeat(5 - a.note)}
                </div>
                {a.commentaire && <p>{a.commentaire}</p>}
              </div>
            ))
          )}
        </Card>
      </div>
    </div>
  )
}