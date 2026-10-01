import { Link } from 'react-router-dom'
import './Logo.css'

export function Logo({ to = '/' }) {
  return (
    <Link to={to} className="logo">
      <span className="logo__mark">C</span>
      <span className="logo__text">Carnet</span>
    </Link>
  )
}
