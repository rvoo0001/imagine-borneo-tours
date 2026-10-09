import { Link, createFileRoute } from '@tanstack/react-router'
import { ArrowRight, Leaf, MapPinned, PawPrint } from 'lucide-react'
import { useAnimals } from '@/features/animals/queries'
import { useRecommendedTours } from '@/features/tours/queries'
import { toAbsoluteUrl } from '@/lib/env'

export const Route = createFileRoute('/about-us')({ component: AboutUsPage })

function AboutUsPage() {
  const { data: tours = [] } = useRecommendedTours()
  const { data: animals = [] } = useAnimals()
  const featureImage = tours[0]?.cover_image?.url ?? tours[0]?.images?.[0]?.image?.url

  return (
    <main className="min-h-screen bg-[#f6f4ec] text-stone-900">
      <section className="relative overflow-hidden bg-[#193b19] px-6 py-20 text-white md:py-28">
        {featureImage ? <img src={toAbsoluteUrl(featureImage)} alt="Borneo tour landscape" className="absolute inset-0 h-full w-full object-cover opacity-35" /> : null}
        <div className="absolute inset-0 bg-[#193b19]/75" />
        <div className="relative mx-auto max-w-7xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-lime-200">Imagine Borneo Tours</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight md:text-6xl">Closer to the wild, one experience at a time.</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-green-100">A place to explore the tours and wildlife that make a Borneo nature experience worth planning.</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#52722e]">Our story</p>
            <h2 className="mt-3 text-3xl font-bold text-[#193b19]">A catalogue built around curiosity.</h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-600">Imagine Borneo Tours brings tours and wildlife into one place so visitors can discover what is available, compare experiences, and choose a journey that fits the way they want to explore.</p>
            <p className="mt-4 max-w-2xl leading-7 text-stone-600">The details of each experience come from the current tour catalogue. As the catalogue grows, this space can grow with it.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/tours" className="inline-flex items-center gap-2 rounded-lg bg-[#193b19] px-5 py-3 font-semibold text-white hover:bg-[#285629]">Explore tours <ArrowRight size={17} /></Link>
              <Link to="/contact" className="rounded-lg border border-stone-300 bg-white px-5 py-3 font-semibold text-stone-800 hover:border-[#52722e]">Get in touch</Link>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-[#dfe8cf] p-6 text-[#193b19]"><PawPrint /><p className="mt-8 text-2xl font-bold">{animals.length}</p><p className="mt-1 text-sm text-[#315c2d]">animals in the current catalogue</p></div>
            <div className="rounded-2xl bg-[#8a9b68] p-6 text-white"><MapPinned /><p className="mt-8 text-2xl font-bold">{tours.length}</p><p className="mt-1 text-sm text-green-50">recommended journeys to explore</p></div>
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#52722e]">What guides the experience</p>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-stone-200 p-6"><Leaf className="text-[#52722e]" /><h2 className="mt-6 text-xl font-bold text-[#193b19]">Curiosity</h2><p className="mt-3 leading-7 text-stone-600">Make room for the details, species, and places that make each outing distinct.</p></div>
            <div className="rounded-2xl border border-stone-200 p-6"><MapPinned className="text-[#52722e]" /><h2 className="mt-6 text-xl font-bold text-[#193b19]">Exploration</h2><p className="mt-3 leading-7 text-stone-600">Use the catalogue as a starting point for choosing how you want to experience nature.</p></div>
            <div className="rounded-2xl border border-stone-200 p-6"><PawPrint className="text-[#52722e]" /><h2 className="mt-6 text-xl font-bold text-[#193b19]">Respect</h2><p className="mt-3 leading-7 text-stone-600">Approach wildlife and natural places with attention, patience, and care.</p></div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="rounded-2xl bg-[#193b19] p-8 text-white md:flex md:items-center md:justify-between md:p-12"><div><h2 className="text-3xl font-bold">Find your next experience.</h2><p className="mt-3 text-green-100">Explore the current catalogue or send a message with your questions.</p></div><div className="mt-6 flex flex-wrap gap-3 md:mt-0"><Link to="/tours" className="rounded-lg bg-white px-5 py-3 font-semibold text-[#193b19] hover:bg-green-50">Explore tours</Link><Link to="/contact" className="rounded-lg border border-green-200 px-5 py-3 font-semibold text-white hover:bg-white/10">Get in touch</Link></div></div>
      </section>
    </main>
  )
}
