import { ClientsListe } from './ClientsListe.jsx'

export default function ArchivesPage() {
    return (
        <div className="stack">
        <h1 className="page-title">Clients archivés</h1>
        <ClientsListe archive />
        </div>
    )
}