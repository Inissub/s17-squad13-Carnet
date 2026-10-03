import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../../components/ui/Card.jsx'
import { api } from '../../api/client.js'
import './AnnuairePage.css'

function TechnicienCard({ technicien }) {
  const { slug, nom, metier, ville, quartier, activite, noteMoyenne, nbAvis } = technicien
  const etoiles = Math.round(noteMoyenne)
  return (
    <Link to={`/t/${slug}`} className="annuaire-lien">
      <Card className="annuaire-carte">
        <div className="annuaire-carte__nom">{nom}</div>
        <div className="annuaire-carte__info">{metier}</div>
        <div className="annuaire-carte__info">{[quartier, ville].filter(Boolean).join(', ')}</div>
        {activite && <div className="annuaire-carte__info">{activite.nom}</div>}
        <div className="annuaire-carte__etoiles">
          {'★'.repeat(etoiles)}
          {'☆'.repeat(5 - etoiles)} {nbAvis} avis
        </div>
      </Card>
    </Link>
  )
}

export default function AnnuairePage() {
  const [techniciens, setTechniciens] = useState([])
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState('')
  const [recherche, setRecherche] = useState('')
  const [ville, setVille] = useState('')

  useEffect(() => {
    api
      .get('/annuaire')
      .then(setTechniciens)
      .catch((e) => setErreur(e.message))
      .finally(() => setChargement(false))
  }, [])

  const villes = [...new Set(techniciens.map((t) => t.ville).filter(Boolean))]

  const resultats = techniciens.filter((t) => {
    const texte = `${t.nom} ${t.metier ?? ''} ${t.activite?.nom ?? ''}`.toLowerCase()
    return texte.includes(recherche.toLowerCase()) && (ville === '' || t.ville === ville)
  })

  return (
    <div className="container">
      <h1 className="page-title">Trouver un technicien</h1>
      <p className="muted">Plombiers, électriciens, frigoristes… près de chez vous.</p>

      <div className="annuaire-recherche">
        <input
          className="annuaire-champ annuaire-champ--texte"
          type="text"
          aria-label="Rechercher par métier, nom ou entreprise"
          placeholder="Métier, nom ou entreprise"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
        />
        <select
          className="annuaire-champ"
          aria-label="Filtrer par ville"
          value={ville}
          onChange={(e) => setVille(e.target.value)}
        >
          <option value="">Toutes les villes</option>
          {villes.map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
      </div>

      {chargement ? (
        <p className="annuaire-vide">Chargement…</p>
      ) : erreur ? (
        <p className="annuaire-vide">{erreur}</p>
      ) : resultats.length === 0 ? (
        <p className="annuaire-vide">Aucun technicien trouvé.</p>
      ) : (
        <div className="annuaire-liste">
          {resultats.map((t) => (
            <TechnicienCard key={t.id} technicien={t} />
          ))}
        </div>
      )}
    </div>
  )
}