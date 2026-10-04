import { ClientsListe } from './ClientsListe.jsx'

export default function ClientsPage() {
  return (
    <div className="stack">
      <h1 className="page-title">Tous les clients</h1>
      <ClientsListe archive={false} />
    </div>
  )
}
