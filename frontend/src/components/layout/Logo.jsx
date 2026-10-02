import { Link } from 'react-router-dom'
import './Logo.css'

export function Logo({ to = '/' }) {
  return (
    <Link to={to} className="logo">
      <span className="logo__mark" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="3" width="14" height="18" rx="2" />
          <path d="M9 8h6M9 12h6M9 16h3" />
        </svg>
      </span>
      <span className="logo__text">Carnet</span>
    </Link>
  )
}
