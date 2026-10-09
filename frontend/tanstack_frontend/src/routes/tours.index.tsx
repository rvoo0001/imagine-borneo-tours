import * as React from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { ArrowRight, ChevronDown, Search, SlidersHorizontal, X } from 'lucide-react'
import type { AnimalRead, TourRead } from '@/api/model'
import { useAnimals } from '@/features/animals/queries'
import { useTours } from '@/features/tours/queries'
import { toAbsoluteUrl } from '@/lib/env'

export const Route = createFileRoute('/tours/')({ component: ToursPage })

function numberValue(value: string | number | null | undefined) {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

function formatRM(value: string | number | null | undefined) {
  const amount = numberValue(value)
  return amount ? `RM ${amount.toLocaleString('en-MY', { maximumFractionDigits: 0 })}` : 'Price on request'
}

function tourImage(tour?: TourRead) {
  return toAbsoluteUrl(tour?.cover_image?.url ?? tour?.images?.[0]?.image?.url)
}

function animalImage(animal?: AnimalRead) {
  return toAbsoluteUrl(animal?.images?.[0]?.image?.url)
}

function ToursPage() {
  const { data: tours = [], isLoading: toursLoading, error: toursError } = useTours()
  const { data: animals = [], isLoading: animalsLoading } = useAnimals()
  const [query, setQuery] = React.useState('')
  const [selectedAnimals, setSelectedAnimals] = React.useState<number[]>([])
  const [priceMin, setPriceMin] = React.useState(0)
  const [priceMax, setPriceMax] = React.useState(0)
  const [sortBy, setSortBy] = React.useState('featured')
  const [filtersOpen, setFiltersOpen] = React.useState(false)

  const prices = tours.map((tour) => numberValue(tour.tour_price)).filter((price) => price > 0)
  const dataMin = prices.length ? Math.floor(Math.min(...prices)) : 0
  const dataMax = prices.length ? Math.ceil(Math.max(...prices)) : 0

  React.useEffect(() => {
    if (!prices.length) return
    setPriceMin((current) => (current === 0 ? dataMin : Math.max(dataMin, Math.min(current, dataMax))))
    setPriceMax((current) => (current === 0 ? dataMax : Math.max(dataMin, Math.min(current, dataMax))))
  }, [dataMin, dataMax, prices.length])

  const filteredTours = tours
    .filter((tour) => {
      const searchText = [
        tour.tour_name,
        tour.tour_desc,
        ...(tour.animals?.map((item) => item.animal?.animal_name) ?? []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      const price = numberValue(tour.tour_price)
      const matchesQuery = !query.trim() || searchText.includes(query.trim().toLowerCase())
      const matchesAnimals = !selectedAnimals.length || selectedAnimals.every((id) => tour.animals?.some((item) => item.animal_id === id))
      const matchesPrice = (!priceMin || price >= priceMin) && (!priceMax || price <= priceMax)
      return matchesQuery && matchesAnimals && matchesPrice
    })
    .sort((left, right) => {
      if (sortBy === 'price-low') return numberValue(left.tour_price) - numberValue(right.tour_price)
      if (sortBy === 'price-high') return numberValue(right.tour_price) - numberValue(left.tour_price)
      if (sortBy === 'name') return left.tour_name.localeCompare(right.tour_name)
      return left.tour_id - right.tour_id
    })

  const heroImage = tourImage(tours.find((tour) => tourImage(tour)) ?? tours[0]) || animalImage(animals[0])

  function toggleAnimal(animalId: number) {
    setSelectedAnimals((current) => current.includes(animalId) ? current.filter((id) => id !== animalId) : [...current, animalId])
  }

  function resetFilters() {
    setQuery('')
    setSelectedAnimals([])
    setPriceMin(dataMin)
    setPriceMax(dataMax)
    setSortBy('featured')
  }

  return (
    <main className="min-h-screen bg-[#f6f4ec] text-stone-900">
      <header className="relative flex min-h-[600px] items-center justify-center overflow-hidden bg-[#193b19] px-6 pb-20 pt-28 md:min-h-[680px]">
        {heroImage ? <img src={heroImage} alt="Borneo wildlife in its rainforest habitat" className="absolute inset-0 h-full w-full object-cover" /> : null}
        <div className="absolute inset-0 bg-gradient-to-t from-[#193b19]/95 via-[#193b19]/55 to-[#193b19]/25" />
        <div className="relative z-10 mx-auto max-w-4xl text-center text-white">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-lime-200">Imagine Borneo Tours</p>
          <h1 className="mt-5 text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">Find your wild side.</h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-green-50 md:text-lg">Explore real journeys through Borneo's forests, rivers, and wildlife habitats.</p>
        </div>
      </header>

      <section className="relative z-20 mx-auto -mt-16 mb-16 max-w-7xl px-4 md:px-6">
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-[0_18px_55px_-22px_rgba(25,59,25,0.35)] md:p-7">
          <div className="relative">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tours, destinations, or wildlife..." className="w-full rounded-xl border border-stone-300 bg-[#fbfaf6] py-4 pl-12 pr-12 text-base outline-none transition focus:border-[#52722e] focus:ring-2 focus:ring-[#52722e]/20" />
            {query ? <button type="button" onClick={() => setQuery('')} aria-label="Clear search" className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-800"><X size={18} /></button> : null}
          </div>

          <button type="button" onClick={() => setFiltersOpen((open) => !open)} className="mt-5 flex w-full items-center justify-between rounded-xl border border-stone-200 px-4 py-3 text-left font-semibold text-[#193b19] lg:hidden">
            <span className="inline-flex items-center gap-2"><SlidersHorizontal size={17} /> Filter tours</span><ChevronDown size={18} className={filtersOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />
          </button>

          <div className={`${filtersOpen ? 'block' : 'hidden'} mt-6 lg:block`}>
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="min-w-0 flex-1">
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#52722e]">Wildlife filters</p>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  <button type="button" onClick={() => setSelectedAnimals([])} className={`shrink-0 rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] transition ${!selectedAnimals.length ? 'border-[#52722e] bg-[#dfe8cf] text-[#193b19]' : 'border-stone-300 text-stone-600 hover:border-[#52722e]'}`}>All wildlife</button>
                  {animals.map((animal) => <button type="button" key={animal.animal_id} onClick={() => toggleAnimal(animal.animal_id)} className={`shrink-0 rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] transition ${selectedAnimals.includes(animal.animal_id) ? 'border-[#193b19] bg-[#193b19] text-white' : 'border-stone-300 text-stone-600 hover:border-[#52722e]'}`}>{animal.animal_name}</button>)}
                  {animalsLoading ? <span className="py-2 text-sm text-stone-500">Loading wildlife...</span> : null}
                </div>
              </div>
              {prices.length ? <div className="w-full lg:max-w-sm">
                <div className="mb-3 flex items-center justify-between text-xs font-bold uppercase tracking-[0.16em] text-stone-500"><span>Price range</span><span className="text-[#193b19]">{formatRM(priceMin)} - {formatRM(priceMax)}</span></div>
                <div className="grid grid-cols-2 gap-3">
                  <label className="text-xs text-stone-500">Minimum<input aria-label="Minimum price" type="range" min={dataMin} max={dataMax} value={priceMin || dataMin} onChange={(event) => setPriceMin(Math.min(Number(event.target.value), priceMax || dataMax))} className="mt-2 w-full accent-[#193b19]" /></label>
                  <label className="text-xs text-stone-500">Maximum<input aria-label="Maximum price" type="range" min={dataMin} max={dataMax} value={priceMax || dataMax} onChange={(event) => setPriceMax(Math.max(Number(event.target.value), priceMin || dataMin))} className="mt-2 w-full accent-[#193b19]" /></label>
                </div>
              </div> : null}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 md:px-6 md:pb-28">
        <div className="mb-8 flex flex-col gap-4 border-b border-stone-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#52722e]">The collection</p><h2 className="mt-2 text-3xl font-bold text-[#193b19]">Journeys made for discovery</h2><p className="mt-2 text-stone-600">{filteredTours.length} {filteredTours.length === 1 ? 'tour' : 'tours'} to explore</p></div>
          <label className="flex items-center gap-3 text-sm font-semibold text-stone-600">Sort by<select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-semibold text-[#193b19] outline-none focus:border-[#52722e]"><option value="featured">Featured</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="name">Name</option></select></label>
        </div>

        {toursLoading ? <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((item) => <div key={item} className="h-[460px] animate-pulse rounded-2xl bg-white" />)}</div> : toursError ? <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-800">We could not load the tours right now. Please try again shortly.</div> : filteredTours.length ? <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{filteredTours.map((tour) => <TourListingCard key={tour.tour_id} tour={tour} />)}</div> : <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center"><h3 className="text-xl font-bold text-[#193b19]">No tours match those filters</h3><p className="mt-2 text-stone-600">Try widening your search or wildlife selection.</p><button type="button" onClick={resetFilters} className="mt-6 rounded-lg bg-[#193b19] px-5 py-3 font-semibold text-white hover:bg-[#315c2d]">Clear filters</button></div>}
      </section>
    </main>
  )
}

function TourListingCard({ tour }: { tour: TourRead }) {
  const image = tourImage(tour)
  const animals = tour.animals?.map((item) => item.animal?.animal_name).filter(Boolean).slice(0, 3) ?? []
  return <Link to="/tours/$tourId" params={{ tourId: String(tour.tour_id) }} className="group flex h-full flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-[0_12px_38px_-20px_rgba(25,59,25,0.4)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_-20px_rgba(25,59,25,0.5)]"><div className="relative aspect-[4/3] overflow-hidden bg-[#dfe8cf]">{image ? <img src={image} alt={tour.tour_name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" loading="lazy" /> : <div className="flex h-full items-center justify-center text-sm font-semibold text-[#52722e]">Tour image coming soon</div>}<div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/55 to-transparent" /><span className="absolute bottom-4 left-5 text-xs font-bold uppercase tracking-[0.15em] text-white">Borneo experience</span></div><div className="flex flex-1 flex-col p-6"><h3 className="text-xl font-bold leading-snug text-[#193b19] transition group-hover:text-[#52722e]">{tour.tour_name}</h3><p className="mt-3 line-clamp-3 text-sm leading-6 text-stone-600">{tour.tour_desc || 'Discover Borneo through a closer look at its wild places.'}</p>{animals.length ? <div className="mt-5 flex flex-wrap gap-2">{animals.map((animal) => <span key={animal} className="rounded-full bg-[#eef1e6] px-3 py-1 text-xs font-semibold text-[#315c2d]">{animal}</span>)}</div> : null}<div className="mt-auto flex items-end justify-between gap-4 border-t border-stone-200 pt-5"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-stone-500">Starting from</p><p className="mt-1 text-lg font-bold text-[#193b19]">{formatRM(tour.tour_price)}</p></div><span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#193b19] text-[#193b19] transition group-hover:bg-[#193b19] group-hover:text-white"><ArrowRight size={17} /></span></div></div></Link>
}

export default ToursPage
