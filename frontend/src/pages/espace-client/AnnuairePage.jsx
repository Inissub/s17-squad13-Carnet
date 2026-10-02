import { useState } from 'react'
import { Card } from '../../components/ui/Card.jsx'
import './AnnuairePage.css'

const TECHNICIENS = [
  { id: 1, nom: 'Arnaud Moukala', metier: 'Plombier', ville: 'Brazzaville', entreprise: 'Plomberie Matsala', note: 5, avis: 1 },
  { id: 2, nom: 'Grâce Nkounkou', metier: 'Électricienne', ville: 'Brazzaville', entreprise: 'Plomberie Matsala', note: 0, avis: 0 },
  { id: 3, nom: 'Jean Mabiala', metier: 'Mécanicien', ville: 'Pointe-Noire', entreprise: 'Garage Mabiala', note: 4, avis: 3 },
]

function TechnicienCard({ technicien }) {
  const { nom, metier, ville, entreprise, note, avis } = technicien
  return (
    <Card className="annuaire-carte">
      <div className="annuaire-carte__nom">{nom}</div>
      <div className="annuaire-carte__info">{metier}</div>
      <div className="annuaire-carte__info">{ville}</div>
      <div className="annuaire-carte__info">{entreprise}</div>
      <div className="annuaire-carte__etoiles">
        {'★'.repeat(note)}
        {'☆'.repeat(5 - note)} {avis} avis
      </div>
    </Card>
  )
}

export default function AnnuairePage() {
  const [recherche, setRecherche] = useState('')
  const [ville, setVille] = useState('')

  const villes = [...new Set(TECHNICIENS.map((t) => t.ville))]

  const resultats = TECHNICIENS.filter((t) => {
    const texte = `${t.nom} ${t.metier} ${t.entreprise}`.toLowerCase()
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

      {resultats.length === 0 ? (
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