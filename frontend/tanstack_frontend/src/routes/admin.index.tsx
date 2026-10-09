import { Link, createFileRoute } from '@tanstack/react-router'
import { ArrowRight, MapPinned, PawPrint } from 'lucide-react'
import { useAnimals } from '@/features/animals/queries'
import { useTours } from '@/features/tours/queries'

export const Route = createFileRoute('/admin/')({ component: AdminOverviewPage })

function StatCard({ label, value, icon: Icon, to }: { label: string; value: number; icon: typeof PawPrint; to: '/admin/animals' | '/admin/tours' }) {
  return (
    <Link to={to} className="group rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="rounded-xl bg-[#e7f0d9] p-3 text-[#315c2d]"><Icon size={22} /></div>
        <ArrowRight size={18} className="text-stone-400 transition group-hover:translate-x-1 group-hover:text-[#315c2d]" />
      </div>
      <p className="mt-6 text-sm font-semibold text-stone-500">{label}</p>
      <p className="mt-1 text-4xl font-bold text-stone-900">{value}</p>
    </Link>
  )
}

function AdminOverviewPage() {
  const animals = useAnimals()
  const tours = useTours()
  const error = animals.error || tours.error

  return (
    <section>
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#52722e]">Overview</p>
        <h2 className="mt-2 text-3xl font-bold text-stone-900">Keep the catalogue moving.</h2>
        <p className="mt-2 max-w-2xl text-stone-600">Manage the animals and experiences shown throughout Imagine Borneo Tours.</p>
      </div>
      {error ? <div className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">Unable to load catalogue totals.</div> : null}
      <div className="grid gap-5 sm:grid-cols-2">
        <StatCard label="Animals" value={animals.data?.length ?? 0} icon={PawPrint} to="/admin/animals" />
        <StatCard label="Tours" value={tours.data?.length ?? 0} icon={MapPinned} to="/admin/tours" />
      </div>
    </section>
  )
}
