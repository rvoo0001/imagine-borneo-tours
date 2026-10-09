import * as React from 'react'
import type { AxiosRequestConfig } from 'axios'
import { getImagineBorneoToursAPI } from '@/api/generated'

const TOKEN_KEY = 'ibt-admin-session'
const api = getImagineBorneoToursAPI()

type AdminAuthContextValue = {
  token: string | null
  isAuthenticated: boolean
  isReady: boolean
  login: (password: string) => Promise<void>
  logout: () => void
  authOptions: () => AxiosRequestConfig | undefined
}

const AdminAuthContext = React.createContext<AdminAuthContextValue | null>(null)

function readToken() {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(TOKEN_KEY)
}

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = React.useState<string | null>(null)
  const [isReady, setIsReady] = React.useState(false)

  React.useEffect(() => {
    setToken(readToken())
    setIsReady(true)
  }, [])

  const login = React.useCallback(async (password: string) => {
    const response = await api.adminLoginAdminLoginPost({ password })
    const nextToken = response.data.token
    window.localStorage.setItem(TOKEN_KEY, nextToken)
    setToken(nextToken)
  }, [])

  const logout = React.useCallback(() => {
    window.localStorage.removeItem(TOKEN_KEY)
    setToken(null)
  }, [])

  const authOptions = React.useCallback<AdminAuthContextValue['authOptions']>(
    () => (token ? { headers: { Authorization: `Bearer ${token}` } } : undefined),
    [token],
  )

  const value = React.useMemo(
    () => ({
      token,
      isAuthenticated: Boolean(token),
      isReady,
      login,
      logout,
      authOptions,
    }),
    [authOptions, isReady, login, logout, token],
  )

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}

export function useAdminAuth() {
  const context = React.useContext(AdminAuthContext)
  if (!context) throw new Error('useAdminAuth must be used inside AdminAuthProvider')
  return context
}

export function getAdminToken() {
  return readToken()
}

export function adminRequestOptions(token: string | null): AxiosRequestConfig | undefined {
  return token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
}
