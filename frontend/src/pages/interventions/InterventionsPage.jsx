import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Badge } from '../../components/ui/Badge.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Card } from '../../components/ui/Card.jsx'
import { useFetch } from '../../hooks/useFetch.js'
import { PRIORITES, STATUTS, getStatut } from '../../utils/interventions.js'
import './InterventionsPage.css'

const jour = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' })
const heure = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' })

function normaliser(texte) {
  return (texte ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
}

export default function InterventionsPage() {
  const { data, loading, error, reload } = useFetch('/interventions')
  const [searchParams, setSearchParams] = useSearchParams()
  const [recherche, setRecherche] = useState('')

  const statutActif = searchParams.get('statut') ?? ''
  const interventions = useMemo(() => data ?? [], [data])

  const compteurs = useMemo(() => {
    const total = Object.fromEntries(STATUTS.map((s) => [s.value, 0]))
    interventions.forEach((i) => {
      if (i.statut in total) total[i.statut] += 1
    })
    return total
  }, [interventions])

  const visibles = useMemo(() => {
    const terme = normaliser(recherche.trim())
    return interventions.filter((i) => {
      if (statutActif && i.statut !== statutActif) return false
      if (!terme) return true
      return [i.objet, i.reference, i.client?.nom].some((champ) => normaliser(champ).includes(terme))
    })
  }, [interventions, statutActif, recherche])

  function choisirStatut(value) {
    setSearchParams(value ? { statut: value } : {})
  }

  return (
    <div className="interventions">
      <header className="interventions__header">
        <div>
          <h1 className="interventions__title">Interventions</h1>
          <p className="muted">
            {loading ? 'Chargement…' : `${interventions.length} intervention${interventions.length > 1 ? 's' : ''} au total`}
          </p>
        </div>
        <Button>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Nouvelle intervention
        </Button>
      </header>

      <div className="interventions__filtres" role="tablist" aria-label="Filtrer par statut">
        <button
          type="button"
          role="tab"
          aria-selected={!statutActif}
          className={`filtre ${!statutActif ? 'filtre--actif' : ''}`}
          onClick={() => choisirStatut('')}
        >
          Toutes <span className="filtre__compte">{interventions.length}</span>
        </button>
        {STATUTS.map((s) => (
          <button
            key={s.value}
            type="button"
            role="tab"
            aria-selected={statutActif === s.value}
            className={`filtre ${statutActif === s.value ? 'filtre--actif' : ''}`}
            onClick={() => choisirStatut(s.value)}
          >
            {s.label} <span className="filtre__compte">{compteurs[s.value]}</span>
          </button>
        ))}
      </div>

      <Card
        className="interventions__card"
        title={statutActif ? getStatut(statutActif).label : 'Toutes les interventions'}
        action={
          <label className="recherche">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              type="search"
              placeholder="Objet, référence ou client…"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              aria-label="Rechercher une intervention"
            />
          </label>
        }
      >
        {loading ? (
          <p className="interventions__etat muted">Chargement des interventions…</p>
        ) : error ? (
          <div className="interventions__etat">
            <p>Impossible de charger les interventions.</p>
            <p className="muted">{error}</p>
            <Button variant="secondary" size="sm" onClick={reload}>
              Réessayer
            </Button>
          </div>
        ) : visibles.length === 0 ? (
          <p className="interventions__etat muted">
            {recherche || statutActif ? 'Aucune intervention ne correspond à ces critères.' : 'Aucune intervention pour le moment.'}
          </p>
        ) : (
          <div className="interventions__scroll">
            <table className="interventions__table">
              <thead>
                <tr>
                  <th>Date prévue</th>
                  <th>Intervention</th>
                  <th>Statut</th>
                  <th>Priorité</th>
                  <th>Client</th>
                  <th>Technicien</th>
                  <th>Réf.</th>
                </tr>
              </thead>
              <tbody>
                {visibles.map((i) => {
                  const statut = getStatut(i.statut)
                  const priorite = PRIORITES[i.priorite] ?? PRIORITES.NORMALE
                  const date = i.datePrevue ? new Date(i.datePrevue) : null
                  return (
                    <tr key={i.id}>
                      <td className="interventions__date">
                        {date ? (
                          <>
                            <strong>{heure.format(date)}</strong>
                            <span className="muted">{jour.format(date)}</span>
                          </>
                        ) : (
                          <span className="muted">Non planifiée</span>
                        )}
                      </td>
                      <td>
                        <Link to={`/dashboard/interventions/${i.id}`} className="interventions__objet">
                          {i.objet}
                        </Link>
                        {i.adresse && <span className="interventions__sous muted">{i.adresse}</span>}
                      </td>
                      <td>
                        <span className="interventions__statut">
                          <Badge tone={statut.tone}>{statut.label}</Badge>
                        </span>
                      </td>
                      <td>
                        {priorite.tone === 'neutral' ? (
                          <span className="muted">{priorite.label}</span>
                        ) : (
                          <Badge tone={priorite.tone}>{priorite.label}</Badge>
                        )}
                      </td>
                      <td>{i.client?.nom ?? '—'}</td>
                      <td className={i.technicien ? '' : 'muted'}>{i.technicien?.nom ?? 'Non attribuée'}</td>
                      <td>
                        <Link to={`/dashboard/interventions/${i.id}`} className="interventions__ref">
                          {i.reference}
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
