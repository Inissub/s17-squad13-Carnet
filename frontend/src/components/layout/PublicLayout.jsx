import { Link, Outlet } from 'react-router-dom'
import { Logo } from './Logo.jsx'
import './PublicLayout.css'

export function PublicLayout() {
  return (
    <div className="public-layout">
      <header className="public-header">
        <div className="container public-header__inner">
          <Logo />
          <nav className="public-header__nav">
            <Link to="/techniciens" className="public-header__link">
              Trouver un technicien
            </Link>
            <Link to="/inscription?type=pro" className="public-header__link">
              Proposer mes services
            </Link>
            <Link to="/connexion" className="public-header__link">
              Se connecter
            </Link>
            <Link to="/inscription" className="btn btn--primary btn--sm">
              Créer un compte
            </Link>
          </nav>
        </div>
      </header>

      <main className="public-main">
        <Outlet />
      </main>

      <footer className="public-footer">
        <div className="container muted">Carnet numérique des interventions · Congo-Brazzaville</div>
      </footer>
    </div>
  )
}
