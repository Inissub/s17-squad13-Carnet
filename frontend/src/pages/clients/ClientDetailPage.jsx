import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Badge } from '../../components/ui/Badge.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Card } from '../../components/ui/Card.jsx'
import { useFetch } from '../../hooks/useFetch.js'
import { formatDate, formatJourHeure } from '../../utils/format.js'
import { getStatut } from '../../utils/interventions.js'
import { BadgeClient } from './BadgeClient.jsx'
import { FormulaireClient } from './FormulaireClient.jsx'
import './ClientsListe.css'

export default function ClientDetailPage() {
  const { id } = useParams()
  const { data: client, error, reload } = useFetch(`/clients/${id}`)
  const [edition, setEdition] = useState(false)

  if (!client) {
    return (
      <div className="clients">
        <Link to="/dashboard/clients" className="clients__retour">
          ‹ Clients
        </Link>
        <p className="muted">{error ?? 'Chargement du client…'}</p>
      </div>
    )
  }

  return (
    <div className="clients">
      <header className="clients__entete">
        <div>
          <Link to={client.archive ? '/dashboard/clients/archives' : '/dashboard/clients'} className="clients__retour">
            ‹ {client.archive ? 'Clients archivés' : 'Clients'}
          </Link>
          <h1 className="clients__titre">{client.nom}</h1>
          <div className="clients__badges">
            <BadgeClient client={client} />
            {client.archive && <Badge tone="warn">Archivé</Badge>}
          </div>
        </div>
      </header>

      {edition ? (
        <FormulaireClient
          client={client}
          onAnnuler={() => setEdition(false)}
          onEnregistre={() => {
            setEdition(false)
            reload()
          }}
        />
      ) : (
        <Card
          className="clients__card"
          title="Coordonnées"
          action={
            client.compteClientId ? (
              <span className="muted clients__note">Client enregistré sur Carnet : consultation seule</span>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => setEdition(true)}>
                Modifier
              </Button>
            )
          }
        >
          <dl className="clients__infos">
            <div>
              <dt className="muted">Téléphone</dt>
              <dd>{client.telephone ? <a href={`tel:${client.telephone.replace(/\s/g, '')}`}>{client.telephone}</a> : '—'}</dd>
            </div>
            <div>
              <dt className="muted">Adresse</dt>
              <dd>{client.adresse || '—'}</dd>
            </div>
            {client.compteClient && (
              <div>
                <dt className="muted">Compte Carnet</dt>
                <dd>{client.compteClient.email}</dd>
              </div>
            )}
            <div>
              <dt className="muted">Client depuis</dt>
              <dd>{formatDate(client.createdAt)}</dd>
            </div>
            {client.notes && (
              <div className="clients__infos-plein">
                <dt className="muted">Notes</dt>
                <dd>{client.notes}</dd>
              </div>
            )}
          </dl>
        </Card>
      )}

      <Card className="clients__card" title={`Interventions (${client.interventions.length})`}>
        {client.interventions.length === 0 ? (
          <p className="clients__etat muted">Aucune intervention pour ce client.</p>
        ) : (
          <div className="clients__scroll">
            <table className="clients__table">
              <thead>
                <tr>
                  <th>Date prévue</th>
                  <th>Intervention</th>
                  <th>Statut</th>
                  <th>Technicien</th>
                  <th>Réf.</th>
                </tr>
              </thead>
              <tbody>
                {client.interventions.map((i) => {
                  const statut = getStatut(i.statut)
                  return (
                    <tr key={i.id}>
                      <td className="clients__date">{i.datePrevue ? formatJourHeure(i.datePrevue) : <span className="muted">Non planifiée</span>}</td>
                      <td>
                        <Link to={`/dashboard/interventions/${i.id}`} className="clients__nom">
                          {i.objet}
                        </Link>
                      </td>
                      <td>
                        <Badge tone={statut.tone}>{statut.label}</Badge>
                      </td>
                      <td className={i.technicien ? '' : 'muted'}>{i.technicien?.nom ?? 'Non attribuée'}</td>
                      <td>
                        <Link to={`/dashboard/interventions/${i.id}`} className="clients__ref">
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
