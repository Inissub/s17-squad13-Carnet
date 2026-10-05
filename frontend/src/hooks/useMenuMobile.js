import { useEffect, useState } from 'react'

// État d'un menu mobile (burger) : se ferme avec Échap et quand on repasse en affichage large
export function useMenuMobile(largeurMax) {
  const [ouvert, setOuvert] = useState(false)

  useEffect(() => {
    if (!ouvert) return
    const clavier = (e) => e.key === 'Escape' && setOuvert(false)
    const ecran = window.matchMedia(`(max-width: ${largeurMax}px)`)
    const changement = (e) => !e.matches && setOuvert(false)
    document.addEventListener('keydown', clavier)
    ecran.addEventListener('change', changement)
    return () => {
      document.removeEventListener('keydown', clavier)
      ecran.removeEventListener('change', changement)
    }
  }, [ouvert, largeurMax])

  return {
    ouvert,
    basculer: () => setOuvert((o) => !o),
    fermer: () => setOuvert(false),
    // Un clic sur un lien du menu le referme (la page change)
    fermerSurLien: (e) => e.target.closest('a, button[data-ferme-menu]') && setOuvert(false),
  }
}
