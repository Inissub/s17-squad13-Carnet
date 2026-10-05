import './MenuBurger.css'

// Bouton « burger » des menus mobiles : trois traits qui deviennent une croix quand le menu est ouvert
export function BoutonBurger({ ouvert, onClick, controle, className = '' }) {
  return (
    <button
      type="button"
      className={`burger ${ouvert ? 'burger--ouvert' : ''} ${className}`}
      onClick={onClick}
      aria-expanded={ouvert}
      aria-controls={controle}
      aria-label={ouvert ? 'Fermer le menu' : 'Ouvrir le menu'}
    >
      <span className="burger__trait" />
      <span className="burger__trait" />
      <span className="burger__trait" />
    </button>
  )
}
