import { Link } from 'react-router-dom';
import { Badge } from '../../components/ui/Badge.jsx'
import { Card } from '../../components/ui/Card.jsx'
import { useFetch } from '../../hooks/useFetch.js'
import { formatDateHeure, formatMontant } from '../../utils/format.js'
import { STATUT_LABELS, STATUT_TONES, STATUT_ORDRE } from '../../utils/intervention.js'
import '../../styles/DashboardPage.css'

export default function DashboardPage() {
  const { user } = useAuth()
  const { data, loading, error, reload } = useFetch('/dashboard')

  const aujourdhui = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date())

  return (
    <div className="stack dashboard-page">
      <div className="row dashboard-page__header">
        <div>
          <h1 className="page-title">Aujourd'hui</h1>
          <p className="muted dashboard-page__date">{aujourdhui}</p>
        </div>
        <Link to="/dashboard/interventions" className="btn btn--primary">
          + Nouvelle intervention
        </Link>
      </div>

      {loading && <p className="muted">Chargement…</p>}

      {error && (
        <Card>
          <p className="muted">Impossible de charger le tableau de bord ({error}).</p>
          <button type="button" className="btn btn--ghost btn--sm" onClick={reload}>
            Réessayer
          </button>
        </Card>
      )}

      {data && (
        <>
          <Card
            title="Prochains rendez-vous"
            action={<span className="muted dashboard-page__hint">À partir d'aujourd'hui</span>}
          >
            {data.prochainsRendezVous.length === 0 ? (
              <p className="muted">Aucun rendez-vous planifié.</p>
            ) : (
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Heure</th>
                    <th>Intervention</th>
                    <th>Statut</th>
                    <th>Client</th>
                    <th>Technicien</th>
                    <th>Réf.</th>
                  </tr>
                </thead>
                <tbody>
                  {data.prochainsRendezVous.map((rdv) => (
                    <tr key={rdv.id}>
                      <td>{formatDateHeure(rdv.datePrevue)}</td>
                      <td>
                        <Link to={`/dashboard/interventions/${rdv.id}`}>{rdv.objet}</Link>
                      </td>
                      <td>
                        <Badge tone={STATUT_TONES[rdv.statut]}>{STATUT_LABELS[rdv.statut]}</Badge>
                      </td>
                      <td>{rdv.client ?? '—'}</td>
                      <td>{rdv.technicien ?? 'Non attribuée'}</td>
                      <td className="muted">{rdv.reference}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>

          <div className="dashboard-grid">
            <Card title="Suivi de l'activité" className="dashboard-grid__suivi">
              <div className="dashboard-stats">
                {STATUT_ORDRE.map((statut) => (
                  <div key={statut} className="dashboard-stats__item">
                    <span className="dashboard-stats__value">{data.suivi[statut]}</span>
                    <span className="muted dashboard-stats__label">{STATUT_LABELS[statut]}</span>
                  </div>
                ))}
              </div>
            </Card>

            {data.facturation && (
              <Card title="Facturation">
                <div className="dashboard-stats">
                  <div className="dashboard-stats__item">
                    <span className="dashboard-stats__value">
                      {formatMontant(data.facturation.facture)}
                    </span>
                    <span className="muted dashboard-stats__label">Facturé</span>
                  </div>
                  <div className="dashboard-stats__item">
                    <span className="dashboard-stats__value">
                      {formatMontant(data.facturation.encaisse)}
                    </span>
                    <span className="muted dashboard-stats__label">Encaissé</span>
                  </div>
                  <div className="dashboard-stats__item">
                    <span className="dashboard-stats__value">
                      {formatMontant(data.facturation.restant)}
                    </span>
                    <span className="muted dashboard-stats__label">Reste dû</span>
                  </div>
                </div>
              </Card>
            )}
          </div>

          <Card title="Activité récente">
            {data.activiteRecente.length === 0 ? (
              <p className="muted">Aucun changement de statut pour le moment.</p>
            ) : (
              <ul className="dashboard-timeline">
                {data.activiteRecente.map((item) => (
                  <li key={item.id} className="dashboard-timeline__item">
                    <div className="dashboard-timeline__badges">
                      {item.ancienStatut && (
                        <>
                          <Badge tone={STATUT_TONES[item.ancienStatut]}>
                            {STATUT_LABELS[item.ancienStatut]}
                          </Badge>
                          <span className="muted">→</span>
                        </>
                      )}
                      <Badge tone={STATUT_TONES[item.nouveauStatut]}>
                        {STATUT_LABELS[item.nouveauStatut]}
                      </Badge>
                    </div>
                    <div className="dashboard-timeline__body">
                      <Link to={`/dashboard/interventions/${item.interventionId}`}>{item.objet}</Link>
                      <span className="muted dashboard-timeline__meta">
                        {item.reference} · {item.auteur ?? 'Système'} · {formatDateHeure(item.date)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {user?.role === 'TECHNICIEN' && (
            <p className="muted dashboard-page__scope">
              Vue limitée à vos propres interventions.
            </p>
          )}
        </>
      )}
    </div>
  )
}
