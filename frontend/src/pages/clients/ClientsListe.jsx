import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Badge } from '../../components/ui/Badge.jsx'
import { Card } from '../../components/ui/Card.jsx'
import { useFetch } from '../../hooks/useFetch.js'
import './ClientsListe.css'

export function ClientsListe({ titre, archive = false }) {
    const navigate = useNavigate()
    const [saisie, setSaisie] = useState('')
    const [recherche, setRecherche] = useState('')


    useEffect(() => {
        const timer = setTimeout(() => setRecherche(saisie.trim()), 300)
        return () => clearTimeout(timer)
    }, [saisie])

    const params = new URLSearchParams({ archive: String(archive) })
    if (recherche) params.set('q', recherche)

    const { data: clients, loading, error } = useFetch(`/clients?${params}`)

    const sousTitre = clients
        ? `${clients.length} client${clients.length > 1 ? 's' : ''}${recherche ? ' trouvé' + (clients.length > 1 ? 's' : '') : ' au total'}`
        : 'Chargement…'

    const recherchePar = (
        <label className="clients-search">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
        </svg>
        <input
            type="search"
            placeholder="Nom, téléphone ou adresse…"
            value={saisie}
            onChange={(e) => setSaisie(e.target.value)}
        />
        </label>
    )

    return (
        <div className="stack">
        <header className="clients-header">
            <div>
                <h1 className="page-title">{titre}</h1>
                <p className="muted">{sousTitre}</p>
            </div>
            <Link to={archive ? '/dashboard/clients' : '/dashboard/clients/archives'}className="clients-switch">
                {archive ? ' Tous les clients' : 'Voir les archivés'}
            </Link>
        </header>

        <Card title={titre} action={recherchePar}>
            {error && <p className="clients-empty muted">{error}</p>}
            {loading && !clients && <p className="clients-empty muted">Chargement…</p>}
            {clients?.length === 0 && (
            <p className="clients-empty muted">
                {recherche ? 'Aucun client ne correspond à la recherche.' : 'Aucun client pour le moment.'}
            </p>
            )}

            {clients?.length > 0 && (
            <div className="clients-table-wrap">
                <table className="clients-table">
                <thead>
                    <tr>
                    <th>Client</th>
                    <th>Téléphone</th>
                    <th>Adresse</th>
                    <th>Interventions</th>
                    </tr>
                </thead>
                <tbody>
                    {clients.map((client) => (
                    <tr key={client.id} onClick={() => navigate(`/dashboard/clients/${client.id}`)}>
                        <td>
                        <Link to={`/dashboard/clients/${client.id}`} className="clients-table__nom">
                            {client.nom}
                        </Link>
                        </td>
                        <td>{client.telephone || '—'}</td>
                        <td className="muted">{client.adresse || 'Non renseignée'}</td>
                        <td>
                        <Badge>{client._count.interventions}</Badge>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
            )}
        </Card>
        </div>
    )
}