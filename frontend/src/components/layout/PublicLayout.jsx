import { Link, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { Logo } from './Logo.jsx'
import { MenuCompte } from './MenuCompte.jsx'
import './PublicLayout.css'

export function PublicLayout() {
  const { user } = useAuth()

  return (
    <div className="public-layout">
      <header className="public-header">
        <div className="container public-header__inner">
          <Logo />
          <nav className="public-header__nav">
            <Link to="/techniciens" className="public-header__link public-header__link--essentiel">
              Trouver un technicien
            </Link>
            {user ? (
              <MenuCompte />
            ) : (
              <>
                <Link to="/inscription?type=pro" className="public-header__link">
                  Proposer mes services
                </Link>
                <Link to="/connexion" className="public-header__link">
                  Se connecter
                </Link>
                <Link to="/inscription" className="btn btn--primary btn--sm public-header__bureau">
                  Créer un compte
                </Link>
                <Link to="/connexion" className="btn btn--primary btn--sm public-header__mobile">
                  Connexion
                </Link>
              </>
            )}
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
