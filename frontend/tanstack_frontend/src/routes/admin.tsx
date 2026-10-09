import * as React from 'react'
import { Link, Outlet, createFileRoute, useLocation, useNavigate } from '@tanstack/react-router'
import { LayoutDashboard, LogOut, MapPinned, PawPrint } from 'lucide-react'
import { useAdminAuth } from '@/features/admin/auth'

export const Route = createFileRoute('/admin')({ component: AdminLayout })

const items = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
  { to: '/admin/animals', label: 'Animals', icon: PawPrint },
  { to: '/admin/tours', label: 'Tours', icon: MapPinned },
] as const

function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, isReady, logout } = useAdminAuth()
  const isLogin = location.pathname === '/admin/login'

  React.useEffect(() => {
    if (isReady && !isAuthenticated && !isLogin) {
      navigate({ to: '/admin/login', replace: true })
    }
  }, [isAuthenticated, isLogin, isReady, navigate])

  if (isLogin) return <Outlet />
  if (!isReady || !isAuthenticated) {
    return <div className="min-h-screen bg-[#f4f1e8] pt-28 text-center text-stone-600">Checking admin access...</div>
  }

  return (
    <div className="min-h-screen bg-[#f4f1e8] pt-[68px] text-stone-900">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 md:flex-row md:px-8">
        <aside className="w-full shrink-0 rounded-2xl bg-[#193b19] p-4 text-white shadow-lg md:sticky md:top-24 md:h-fit md:w-60">
          <div className="mb-5 border-b border-white/15 px-2 pb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-lime-200">Imagine Borneo</p>
            <h1 className="mt-1 text-xl font-bold">Admin Dashboard</h1>
          </div>
          <nav className="grid gap-1">
            {items.map(({ to, label, icon: Icon, exact }) => (
              <Link
                key={to}
                to={to}
                activeOptions={{ exact }}
                activeProps={{ className: 'bg-white/15 text-white' }}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/75 transition hover:bg-white/10 hover:text-white"
              >
                <Icon size={18} />
                {label}
              </Link>
            ))}
          </nav>
          <button
            type="button"
            onClick={() => {
              logout()
              navigate({ to: '/admin/login', replace: true })
            }}
            className="mt-6 flex w-full items-center gap-3 rounded-xl border border-white/20 px-3 py-2.5 text-left text-sm font-semibold text-white/75 transition hover:bg-white/10 hover:text-white"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </aside>
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
