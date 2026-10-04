import { Link, useParams } from 'react-router-dom'
import { Badge } from '../../components/ui/Badge.jsx'
import { Card } from '../../components/ui/Card.jsx'
import { useFetch } from '../../hooks/useFetch.js'
import './ClientDetailPage.css'

const formatDate = (iso) => new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

const STATUTS = {
  A_PLANIFIER: 'À planifier',
  PLANIFIEE: 'Planifiée',
  EN_COURS: 'En cours',
  TERMINEE: 'Terminée',
  ANNULEE: 'Annulée',
}

const PRIORITES = { BASSE: 'Basse', NORMALE: 'Normale', HAUTE: 'Haute', URGENTE: 'Urgente' };
const formatDateCourte = (iso) => iso ? new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Non planifiée';

function Champ({ label, children }) {
  return (
    <div className="client-detail__champ">
      <dt className="muted">{label}</dt>
      <dd>{children}</dd>
    </div>
  )
}

export default function ClientDetailPage() {
    const { id } = useParams()
    const { data: client, loading, error } = useFetch(`/clients/${id}`)
    const retour = client?.archive ? '/dashboard/clients/archives' : '/dashboard/clients'
    if (loading && !client) return <p className="muted">Chargement…</p>

    if (error) {
      return (
        <div className="stack">
          <p className="muted">{error}</p>
          <Link to="/dashboard/clients" className="client-detail__retour">Retour </Link>
        </div>
      )
    }
  return (
      <div className="stack">
        <Link to={retour} className="client-detail__retour muted">Retour à la liste</Link>

        <header className="client-detail__entete">
          <h1 className="page-title">{client.nom}</h1>
          {client.archive && <Badge>Archivé</Badge>}
        </header>

        <Card title="Informations">
          <dl className="client-detail__champs">
            <Champ label="Téléphone">{client.telephone || '—'}</Champ>
            <Champ label="Adresse">{client.adresse || 'Non renseignée'}</Champ>
            <Champ label="Interventions">{client._count.interventions}</Champ>
            <Champ label="Client depuis le">{formatDate(client.createdAt)}</Champ>
            <Champ label="Notes">{client.notes || '—'}</Champ>
          </dl>
        </Card>
        <Card title={`Interventions (${client._count.interventions})`}>
          {client.interventions.length === 0 ? (
            <p className="client-detail__vide muted">Aucune intervention pour ce client.</p>
          ) : (
            <div className="client-detail__table-wrap">
              <table className="client-detail__table">
                <thead>
                  <tr>
                    <th>Référence</th>
                    <th>Intervention</th>
                    <th>Statut</th>
                    <th>Priorité</th>
                    <th>Date prévue</th>
                    <th>Technicien</th>
                  </tr>
                </thead>
                <tbody>
                  {client.interventions.map((it) => (
                    <tr key={it.id}>
                      <td>
                        <Link to={`/dashboard/interventions/${it.id}`} className="client-detail__ref">
                          {it.reference}
                        </Link>
                      </td>
                      <td>{it.objet}</td>
                      <td>
                        <Badge>{STATUTS[it.statut] ?? it.statut}</Badge>
                      </td>
                      <td className="muted">{PRIORITES[it.priorite] ?? it.priorite}</td>
                      <td>{formatDateCourte(it.datePrevue)}</td>
                      <td className="muted">{it.technicien?.nom ?? 'Non assigné'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
        {client.compteClient && (
          <Card title="Compte espace client">
            <dl className="client-detail__champs">
              <Champ label="Nom">{client.compteClient.nom}</Champ>
              <Champ label="E-mail">{client.compteClient.email}</Champ>
              <Champ label="Téléphone">{client.compteClient.telephone || '—'}</Champ>
              <Champ label="Ville">{client.compteClient.ville || '—'}</Champ>
            </dl>
          </Card>
        )}
      </div>
  )
}
