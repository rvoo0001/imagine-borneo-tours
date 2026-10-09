import { Link, createFileRoute } from '@tanstack/react-router'
import { ArrowRight, Leaf, MapPinned, PawPrint } from 'lucide-react'
import RecommendedToursCarousel from '@/components/RecommendedToursCarousel'
import AnimalsMarquee from '@/components/AnimalsMarquee'
import TourCard from '@/components/TourCard'
import { useRecommendedTours } from '@/features/tours/queries'
import { useAnimals } from '@/features/animals/queries'

export const Route = createFileRoute('/')({
  component: IndexPage,
})

function IndexPage() {
  const { data: tours = [], isLoading: toursLoading, error: toursError } = useRecommendedTours()
  const { data: animals = [], isLoading: animalsLoading, error: animalsError } = useAnimals()

  return (
    <main className="w-full bg-[#f6f4ec] text-stone-900">
      {toursLoading ? (
        <div className="flex min-h-[520px] items-center justify-center bg-[#193b19] text-green-50">Loading experiences...</div>
      ) : toursError ? (
        <div className="flex min-h-[520px] items-center justify-center bg-[#193b19] px-6 text-red-100">Failed to load experiences.</div>
      ) : (
        <RecommendedToursCarousel tours={tours} />
      )}

      <section className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-4">
          {animalsLoading ? <div className="h-20 animate-pulse rounded-xl bg-stone-100" /> : animalsError ? <p className="py-6 text-sm text-red-700">Unable to load wildlife.</p> : <AnimalsMarquee animals={animals} />}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#52722e]">The Borneo experience</p>
            <h1 className="mt-4 max-w-xl text-4xl font-bold leading-tight text-[#193b19] md:text-5xl">Wild places, unforgettable encounters.</h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-stone-600">Browse the wildlife and journeys in our catalogue, then shape a day of discovery around the places and animals that interest you.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/tours" className="inline-flex items-center gap-2 rounded-lg bg-[#193b19] px-5 py-3 font-semibold text-white transition hover:bg-[#285629]">Explore tours <ArrowRight size={17} /></Link>
              <Link to="/animals" className="inline-flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-5 py-3 font-semibold text-stone-800 transition hover:border-[#52722e] hover:text-[#315c2d]">Discover wildlife</Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-[#193b19] p-6 text-white"><PawPrint className="text-lime-200" /><h2 className="mt-12 text-xl font-bold">Wildlife</h2><p className="mt-2 text-sm leading-6 text-green-100">Meet the animals already featured in our catalogue.</p></div>
            <div className="mt-8 rounded-2xl bg-[#dfe8cf] p-6 text-[#193b19]"><Leaf /><h2 className="mt-12 text-xl font-bold">Nature</h2><p className="mt-2 text-sm leading-6 text-[#315c2d]">Find an experience that brings you closer to the landscape.</p></div>
            <div className="col-span-2 rounded-2xl bg-[#8a9b68] p-6 text-white sm:p-8"><MapPinned /><p className="mt-5 max-w-lg text-2xl font-bold leading-snug">Start with a tour, follow your curiosity, and let the details of your day take shape.</p></div>
          </div>
        </div>
      </section>

      <section className="bg-[#e9eadc] px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-bold uppercase tracking-[0.2em] text-[#52722e]">Featured journeys</p><h2 className="mt-2 text-3xl font-bold text-[#193b19]">Choose your next view of Borneo.</h2></div><Link to="/tours" className="inline-flex items-center gap-2 font-semibold text-[#315c2d] hover:text-[#193b19]">View all tours <ArrowRight size={17} /></Link></div>
          {tours.length ? <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{tours.slice(0, 3).map((tour) => <TourCard key={tour.tour_id} tour={tour} />)}</div> : <p className="mt-8 text-stone-600">Tours will appear here when they are available.</p>}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="flex flex-col gap-8 rounded-2xl bg-[#193b19] p-8 text-white md:flex-row md:items-center md:justify-between md:p-12"><div><p className="text-sm font-bold uppercase tracking-[0.2em] text-lime-200">Keep exploring</p><h2 className="mt-3 text-3xl font-bold">Ready to plan your Borneo experience?</h2><p className="mt-3 max-w-xl leading-7 text-green-100">Explore the catalogue or get in touch with the team when you are ready to take the next step.</p></div><div className="flex shrink-0 flex-wrap gap-3"><Link to="/tours" className="rounded-lg bg-white px-5 py-3 font-semibold text-[#193b19] hover:bg-green-50">Explore tours</Link><Link to="/contact" className="rounded-lg border border-green-200 px-5 py-3 font-semibold text-white hover:bg-white/10">Contact us</Link></div></div>
      </section>
    </main>
  )
}
