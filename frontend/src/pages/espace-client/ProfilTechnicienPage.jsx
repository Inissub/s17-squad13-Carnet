import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Card } from '../../components/ui/Card.jsx'
import { api } from '../../api/client.js'
import './ProfilTechnicienPage.css'

function chiffres(numero) {
  return numero.replace(/\D/g, '')
}

export default function ProfilTechnicienPage() {
  const { slug } = useParams()
  const [resultat, setResultat] = useState({ slug: null, technicien: null, erreur: '' })

  useEffect(() => {
    let actif = true
    api
      .get(`/annuaire/${encodeURIComponent(slug)}`)
      .then((data) => {
        if (actif) setResultat({ slug, technicien: data, erreur: '' })
      })
      .catch((e) => {
        if (actif) {
          setResultat({ slug, technicien: null, erreur: e.status === 404 ? 'introuvable' : e.message })
        }
      })
    return () => {
      actif = false
    }
  }, [slug])

  const chargement = resultat.slug !== slug
  const { technicien, erreur } = resultat

  if (chargement) {
    return (
      <div className="container">
        <p className="profil-technicien__vide">Chargement…</p>
      </div>
    )
  }

  if (!technicien) {
    return (
      <div className="container">
        <Link to="/techniciens" className="profil-technicien__retour">← Retour à l'annuaire</Link>
        <h1 className="page-title">
          {erreur === 'introuvable' ? 'Technicien introuvable' : 'Erreur de chargement'}
        </h1>
        <p className="profil-technicien__vide">
          {erreur === 'introuvable' ? "Ce profil n'existe pas ou n'est pas public." : erreur}
        </p>
      </div>
    )
  }

  const { nom, metier, ville, quartier, bio, telephone, whatsapp, activite, avis, noteMoyenne } = technicien
  const moyenne = Math.round(noteMoyenne)

  return (
    <div className="container">
      <Link to="/techniciens" className="profil-technicien__retour">← Retour à l'annuaire</Link>

      <div className="profil-technicien__grille">
        <Card>
          <h1 className="page-title">{nom}</h1>
          <div className="profil-technicien__metier">{metier}</div>
          <div className="profil-technicien__info">{[quartier, ville].filter(Boolean).join(', ')}</div>
          {activite && <div className="profil-technicien__info">{activite.nom}</div>}
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