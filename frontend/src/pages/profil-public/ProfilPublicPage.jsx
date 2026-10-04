import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../../components/ui/Card.jsx'
import { api } from '../../api/client.js'
import './ProfilPublicPage.css'

const FORMULAIRE_VIDE = {
  nom: '',
  metier: '',
  ville: '',
  quartier: '',
  telephone: '',
  whatsapp: '',
  bio: '',
  slug: '',
  profilPublic: false,
}

function versFormulaire(profil) {
  return {
    nom: profil.nom ?? '',
    metier: profil.metier ?? '',
    ville: profil.ville ?? '',
    quartier: profil.quartier ?? '',
    telephone: profil.telephone ?? '',
    whatsapp: profil.whatsapp ?? '',
    bio: profil.bio ?? '',
    slug: profil.slug ?? '',
    profilPublic: Boolean(profil.profilPublic),
  }
}

function ouNull(valeur) {
  const texte = valeur.trim()
  return texte === '' ? null : texte
}

function versEnvoi(form) {
  return {
    nom: form.nom.trim(),
    metier: ouNull(form.metier),
    ville: ouNull(form.ville),
    quartier: ouNull(form.quartier),
    telephone: ouNull(form.telephone),
    whatsapp: ouNull(form.whatsapp),
    bio: ouNull(form.bio),
    slug: ouNull(form.slug),
    profilPublic: form.profilPublic,
  }
}

export default function ProfilPublicPage() {
  const [form, setForm] = useState(FORMULAIRE_VIDE)
  const [publie, setPublie] = useState({ slug: null, visible: false })
  const [chargement, setChargement] = useState(true)
  const [enCours, setEnCours] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    let actif = true
    api
      .get('/profil-public')
      .then((profil) => {
        if (!actif) return
        setForm(versFormulaire(profil))
        setPublie({ slug: profil.slug, visible: Boolean(profil.profilPublic) })
      })
      .catch((e) => {
        if (actif) setMessage({ type: 'erreur', texte: e.message })
      })
      .finally(() => {
        if (actif) setChargement(false)
      })
    return () => {
      actif = false
    }
  }, [])

  function changer(champ) {
    return (e) => setForm((courant) => ({ ...courant, [champ]: e.target.value }))
  }

  async function enregistrer(e) {
    e.preventDefault()
    setEnCours(true)
    setMessage(null)
    try {
      const profil = await api.patch('/profil-public', versEnvoi(form))
      setForm(versFormulaire(profil))
      setPublie({ slug: profil.slug, visible: Boolean(profil.profilPublic) })
      setMessage({ type: 'ok', texte: 'Profil enregistré.' })
    } catch (erreur) {
      setMessage({ type: 'erreur', texte: erreur.message })
    } finally {
      setEnCours(false)
    }
  }

  return (
    <div>
      <h1 className="page-title">Mon profil public</h1>
      <p className="muted">Ces informations sont visibles par les clients dans l'annuaire.</p>

      {chargement ? (
        <p className="muted">Chargement…</p>
      ) : (
        <Card>
          <form className="profil-public__formulaire" onSubmit={enregistrer}>
            <div className="profil-public__grille">
              <label className="profil-public__champ">
                <span className="profil-public__label">Nom</span>
                <input className="profil-public__saisie" value={form.nom} onChange={changer('nom')} maxLength={120} required />
              </label>
              <label className="profil-public__champ">
                <span className="profil-public__label">Métier</span>
                <input className="profil-public__saisie" value={form.metier} onChange={changer('metier')} maxLength={120} />
              </label>
              <label className="profil-public__champ">
                <span className="profil-public__label">Ville</span>
                <input className="profil-public__saisie" value={form.ville} onChange={changer('ville')} maxLength={100} />
              </label>
              <label className="profil-public__champ">
                <span className="profil-public__label">Quartier</span>
                <input className="profil-public__saisie" value={form.quartier} onChange={changer('quartier')} maxLength={100} />
              </label>
              <label className="profil-public__champ">
                <span className="profil-public__label">Téléphone</span>
                <input className="profil-public__saisie" value={form.telephone} onChange={changer('telephone')} maxLength={40} />
              </label>
              <label className="profil-public__champ">
                <span className="profil-public__label">WhatsApp</span>
                <input className="profil-public__saisie" value={form.whatsapp} onChange={changer('whatsapp')} maxLength={40} />
              </label>
            </div>

            <label className="profil-public__champ">
              <span className="profil-public__label">Présentation</span>
              <textarea
                className="profil-public__saisie profil-public__saisie--long"
                value={form.bio}
                onChange={changer('bio')}
                maxLength={2000}
              />
            </label>

            <label className="profil-public__champ">
              <span className="profil-public__label">Lien public</span>
              <input className="profil-public__saisie" value={form.slug} onChange={changer('slug')} maxLength={80} />
              <span className="profil-public__aide">
                Laissé vide, il est créé à partir de ton nom quand tu actives le profil.
              </span>
            </label>

            <label className="profil-public__visibilite">
              <input
                type="checkbox"
                checked={form.profilPublic}
                onChange={(e) => setForm((courant) => ({ ...courant, profilPublic: e.target.checked }))}
              />
              Rendre mon profil visible dans l'annuaire
            </label>

            {message && (
              <div className={`profil-public__message profil-public__message--${message.type}`}>
                {message.texte}
              </div>
            )}

            <button className="profil-public__bouton" type="submit" disabled={enCours}>
              {enCours ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </form>

          {publie.visible && publie.slug && (
            <div className="profil-public__lien">
              <Link to={`/t/${publie.slug}`}>Voir mon profil public</Link>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}