import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { api } from '../api/client.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(
    () =>
      api
        .get('/auth/me')
        .then(setUser)
        .catch(() => setUser(null))
        .finally(() => setLoading(false)),
    [],
  )

  useEffect(() => {
    refresh()
  }, [refresh])

  async function login(email, motDePasse) {
    await api.post('/auth/connexion', { email, motDePasse })
    await refresh()
  }

  async function register(data) {
    await api.post('/auth/inscription', data)
    await refresh()
  }

  async function logout() {
    await api.post('/auth/deconnexion').catch(() => {})
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext)
}
