import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { Logo } from './Logo.jsx'
import './DashboardLayout.css'

const MENU = [
  { to: '/dashboard', label: 'Dashboard', end: true },
  { to: '/dashboard/interventions', label: 'Interventions' },
  { to: '/dashboard/clients', label: 'Clients' },
  { to: '/dashboard/facturation', label: 'Facturation' },
  { to: '/dashboard/profil-public', label: 'Mon profil public' },
  { to: '/dashboard/profil-activite', label: "Profil de l'activité" },
]

const linkClass = ({ isActive }) => `dashboard-nav__link ${isActive ? 'dashboard-nav__link--active' : ''}`

export function DashboardLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <div className="dashboard-sidebar__logo">
          <Logo to="/dashboard" />
        </div>
        <nav className="dashboard-nav">
          {MENU.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="dashboard-body">
        <header className="dashboard-topbar">
          <span className="muted">{user?.nom ?? 'Non connecté'}</span>
          {user && (
            <button type="button" className="btn btn--ghost btn--sm" onClick={logout}>
              Déconnexion
            </button>
          )}
        </header>
        <main className="dashboard-main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
