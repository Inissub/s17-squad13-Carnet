import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '../../components/ui/Badge.jsx'
import { Card } from '../../components/ui/Card.jsx'
import { useFetch } from '../../hooks/useFetch.js'
import './ClientsListe.css'

export function ClientsListe({ archive = false }){
    const [saisie, setSaisie] = useState('')
    const [recherche, setRecherche] = useState('')
    useEffect(() => {
        const timer = setTimeout(() => setRecherche(saisie.trim()), 300)
        return () => clearTimeout(timer)
    }, [saisie]);
    const params = new URLSearchParams({ archive: String(archive) })
    if (recherche) params.set('q', recherche)
    const { data: clients, loading, error } = useFetch(`/clients?${params}`);
    return(
        <div className="stack">
        <input
            type="search"
            className="clients_search"
            placeholder="Rechercher par nom, téléphone ou adresse"
            value={saisie}
            onChange={(e) => setSaisie(e.target.value)}
        />

        <Card>
            {loading && !clients && <p className="muted">Chargement…</p>}
            {error && <p className="muted">{error}</p>}
            {clients?.length === 0 && (
            <p className="muted">
                {recherche ? 'Aucun client ne correspond à la recherche.' : 'Aucun client pour le moment.'}
            </p>
            )}

            {clients?.length > 0 && (
            <ul className="clients_list">
                {clients.map((client) => (
                <li key={client.id}>
                    <Link to={`/dashboard/clients/${client.id}`} className="clients_list_item">
                    <div>
                        <strong>{client.nom}</strong>
                        <p className="muted">{client.adresse || 'Adresse non renseignée'}</p>
                    </div>
                    <div className="clients_list_meta">
                        <span className="muted">{client.telephone || '—'}</span>
                        <Badge>
                        {client._count.interventions} intervention{client._count.interventions > 1 ? 's' : ''}
                        </Badge>
                    </div>
                    </Link>
                </li>
                ))}
            </ul>
            )}
        </Card>
        </div>
    )
}