import { useState } from 'react'

const TECHNICIENS = [
  { id: 1, nom: 'Arnaud Moukala', metier: 'Plombier', ville: 'Brazzaville', entreprise: 'Plomberie Matsala', note: 5, avis: 1 },
  { id: 2, nom: 'Grâce Nkounkou', metier: 'Électricienne', ville: 'Brazzaville', entreprise: 'Plomberie Matsala', note: 0, avis: 0 },
  { id: 3, nom: 'Jean Mabiala', metier: 'Mécanicien', ville: 'Pointe-Noire', entreprise: 'Garage Mabiala', note: 4, avis: 3 },
]

function TechnicienCard({ technicien }) {
  const { nom, metier, ville, entreprise, note, avis } = technicien
  return (
    <div className="card">
      <h3>{nom}</h3>
      <p>{metier}</p>
      <p> {ville}</p>
      <p> {entreprise}</p>
      <p>
        {'★'.repeat(note)}
        {'☆'.repeat(5 - note)} {avis} avis
      </p>
    </div>
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

      <input
        type="text"
        placeholder="Métier, nom ou entreprise"
        value={recherche}
        onChange={(e) => setRecherche(e.target.value)}
      />
      <select value={ville} onChange={(e) => setVille(e.target.value)}>
        <option value="">Toutes les villes</option>
        {villes.map((v) => (
          <option key={v} value={v}>{v}</option>
        ))}
      </select>

      {resultats.length === 0 ? (
        <p>Aucun technicien trouvé.</p>
      ) : (
        <div>
          {resultats.map((t) => (
            <TechnicienCard key={t.id} technicien={t} />
          ))}
        </div>
      )}
    </div>
  )
}