const montant = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'XAF',
  maximumFractionDigits: 0,
})

const date = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
const dateHeure = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })

export const formatMontant = (valeur) => montant.format(Number(valeur) || 0)
export const formatDate = (valeur) => (valeur ? date.format(new Date(valeur)) : '')
export const formatDateHeure = (valeur) => (valeur ? dateHeure.format(new Date(valeur)) : '')
