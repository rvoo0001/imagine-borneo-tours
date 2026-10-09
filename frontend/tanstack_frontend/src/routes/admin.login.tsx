import * as React from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { LockKeyhole } from 'lucide-react'
import { useAdminAuth } from '@/features/admin/auth'
import { getApiErrorMessage } from '@/features/admin/api'

export const Route = createFileRoute('/admin/login')({ component: AdminLoginPage })

function AdminLoginPage() {
  const navigate = useNavigate()
  const { isAuthenticated, login } = useAdminAuth()
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState('')
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (isAuthenticated) navigate({ to: '/admin', replace: true })
  }, [isAuthenticated, navigate])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!password.trim()) {
      setError('Enter the admin password.')
      return
    }
    setError('')
    setIsSubmitting(true)
    try {
      await login(password)
      navigate({ to: '/admin', replace: true })
    } catch (error) {
      setError(getApiErrorMessage(error, 'The password was not accepted.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f4f1e8] px-4 py-12">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl ring-1 ring-black/5">
        <div className="mb-8 flex items-center gap-3">
          <div className="rounded-xl bg-[#193b19] p-3 text-lime-200"><LockKeyhole size={22} /></div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#52722e]">Imagine Borneo</p>
            <h1 className="text-2xl font-bold text-stone-900">Admin sign in</h1>
          </div>
        </div>
        <label className="grid gap-2 text-sm font-semibold text-stone-700">
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            className="h-11 rounded-lg border border-stone-300 px-3 outline-none transition focus:border-[#52722e] focus:ring-2 focus:ring-[#52722e]/20"
          />
        </label>
        {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-6 h-11 w-full rounded-lg bg-[#193b19] font-semibold text-white transition hover:bg-[#285629] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}
