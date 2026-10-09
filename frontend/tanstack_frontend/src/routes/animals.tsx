import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Search, X } from 'lucide-react'
import type { AnimalRead } from '@/api/model'
import { useAnimals } from '@/features/animals/queries'
import { toAbsoluteUrl } from '@/lib/env'

export const Route = createFileRoute('/animals')({ component: AnimalsPage })

function AnimalImage({ animal, large = false }: { animal: AnimalRead; large?: boolean }) {
  const image = animal.images?.[0]?.image
  return image ? <img src={toAbsoluteUrl(image.url)} alt={animal.animal_name} className={`w-full object-cover ${large ? 'h-72' : 'h-56'}`} loading="lazy" /> : <div className={`flex w-full items-center justify-center bg-[#dfe8cf] text-[#52722e] ${large ? 'h-72' : 'h-56'}`}><span className="text-sm font-semibold">Wildlife image coming soon</span></div>
}

function AnimalsPage() {
  const { data: animals = [], isLoading, error } = useAnimals()
  const [search, setSearch] = React.useState('')
  const [selected, setSelected] = React.useState<AnimalRead | null>(null)
  const normalizedSearch = search.trim().toLowerCase()
  const filteredAnimals = animals.filter((animal) => animal.animal_name.toLowerCase().includes(normalizedSearch))

  return (
    <main className="min-h-screen bg-[#f6f4ec] text-stone-900">
      <section className="bg-[#193b19] px-6 py-20 text-white md:py-28">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-lime-200">Wildlife catalogue</p>
          <h1 className="mt-4 max-w-2xl text-4xl font-bold leading-tight md:text-6xl">Discover Borneo's wildlife.</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-green-100">Explore the animals currently featured in the Imagine Borneo Tours catalogue and find a reason to look closer.</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10 md:py-14">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div><p className="text-sm font-semibold text-[#52722e]">{filteredAnimals.length} animal{filteredAnimals.length === 1 ? '' : 's'} shown</p><h2 className="mt-1 text-2xl font-bold text-[#193b19]">Meet the catalogue</h2></div>
          <label className="flex h-11 w-full items-center gap-2 rounded-lg border border-stone-300 bg-white px-3 shadow-sm sm:max-w-sm"><Search size={18} className="text-stone-500" /><span className="sr-only">Search animals</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name" className="w-full bg-transparent text-sm outline-none placeholder:text-stone-400" /></label>
        </div>

        {isLoading ? <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3"><div className="h-80 animate-pulse rounded-2xl bg-stone-200" /><div className="h-80 animate-pulse rounded-2xl bg-stone-200" /><div className="h-80 animate-pulse rounded-2xl bg-stone-200" /></div> : error ? <div className="mt-10 rounded-xl bg-red-50 p-5 text-red-800">Unable to load the wildlife catalogue.</div> : filteredAnimals.length === 0 ? <div className="mt-10 rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center text-stone-600">No animals match your search.</div> : <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{filteredAnimals.map((animal) => <article key={animal.animal_id} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5"><AnimalImage animal={animal} /><div className="p-5"><h3 className="text-xl font-bold text-[#193b19]">{animal.animal_name}</h3><p className="mt-2 text-sm text-stone-500">{animal.images?.length ?? 0} image{animal.images?.length === 1 ? '' : 's'} in the catalogue</p><button type="button" onClick={() => setSelected(animal)} className="mt-5 rounded-lg border border-[#52722e] px-4 py-2 text-sm font-semibold text-[#315c2d] transition hover:bg-[#e9eadc]">View details</button></div></article>)}</div>}
      </section>

      {selected ? <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4 py-8" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null) }}><article role="dialog" aria-modal="true" aria-labelledby="animal-detail-title" className="max-h-full w-full max-w-lg overflow-auto rounded-2xl bg-white shadow-2xl"><div className="relative"><AnimalImage animal={selected} large /><button type="button" onClick={() => setSelected(null)} aria-label="Close animal details" className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-stone-700 shadow hover:bg-white"><X size={18} /></button></div><div className="p-6"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#52722e]">Wildlife profile</p><h2 id="animal-detail-title" className="mt-2 text-3xl font-bold text-[#193b19]">{selected.animal_name}</h2><p className="mt-4 leading-7 text-stone-600">This animal is part of the wildlife catalogue. Browse available tours to explore experiences connected with the animals you would like to see.</p></div></article></div> : null}
    </main>
  )
}
