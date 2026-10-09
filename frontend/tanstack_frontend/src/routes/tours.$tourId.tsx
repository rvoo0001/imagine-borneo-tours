import { Link, createFileRoute, useParams } from '@tanstack/react-router'
import { ArrowLeft, ArrowRight, Check, ChevronRight, PawPrint } from 'lucide-react'
import type { AnimalImageLinkRead, TourRead } from '@/api/model'
import { useTour } from '@/features/tours/queries'
import { toAbsoluteUrl } from '@/lib/env'

export const Route = createFileRoute('/tours/$tourId')({ component: TourDetailPage })

function formatRM(value: string | number | null | undefined) {
  const amount = Number(value)
  return Number.isFinite(amount) && amount > 0 ? `RM ${amount.toLocaleString('en-MY', { maximumFractionDigits: 0 })}` : 'Price on request'
}

function tourImage(tour: TourRead) {
  return toAbsoluteUrl(tour.cover_image?.url ?? tour.images?.[0]?.image?.url)
}

function AnimalImage({ images, name }: { images?: Array<AnimalImageLinkRead>; name: string }) {
  const image = images?.[0]?.image?.url
  return image ? <img src={toAbsoluteUrl(image)} alt={name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" loading="lazy" /> : <div className="flex h-full items-center justify-center bg-[#dfe8cf] px-4 text-center text-xs font-bold uppercase tracking-[0.12em] text-[#52722e]">Image coming soon</div>
}

function TourGallery({ tour }: { tour: TourRead }) {
  const coverImageId = tour.cover_image?.image_id ?? tour.images?.[0]?.image_id
  const images = (tour.images ?? []).filter((item) => item.image_id !== coverImageId)
  if (!images.length) return null
  return <section className="mx-auto max-w-7xl px-4 pb-20 md:px-6 md:pb-28"><div className="mb-8"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#52722e]">A closer look</p><h2 className="mt-2 text-3xl font-bold text-[#193b19]">Scenes from the journey</h2></div><div className="grid gap-4 md:grid-cols-12 md:grid-rows-2">{images.slice(0, 5).map((item, index) => <div key={item.image_id} className={`${index === 0 ? 'md:col-span-7 md:row-span-2' : 'md:col-span-5'} group aspect-[4/3] overflow-hidden rounded-2xl bg-[#dfe8cf] md:aspect-auto`}><img src={toAbsoluteUrl(item.image.url)} alt={`${tour.tour_name} gallery ${index + 1}`} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" loading="lazy" /></div>)}</div></section>
}

function WildlifeSection({ tour }: { tour: TourRead }) {
  const animals = tour.animals ?? []
  return <section className="bg-[#eef1e6] px-4 py-20 md:px-6 md:py-28"><div className="mx-auto max-w-7xl"><div className="flex items-end justify-between gap-5"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#52722e]">Wildlife on this tour</p><h2 className="mt-2 text-3xl font-bold text-[#193b19] md:text-4xl">Wildlife you may encounter</h2></div><PawPrint className="hidden text-[#52722e] sm:block" size={30} /></div>{animals.length ? <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{animals.map((item) => { const name = item.animal.animal_name; const probability = Math.round(item.sighting_probability * 100); return <article key={item.animal_id} className="group overflow-hidden rounded-2xl border border-stone-200 bg-white"><div className="aspect-[4/3] overflow-hidden bg-[#dfe8cf]"><AnimalImage images={item.animal.images} name={name} /></div><div className="p-5"><h3 className="text-xl font-bold text-[#193b19]">{name}</h3><div className="mt-5 flex items-center justify-between gap-3 text-xs font-bold uppercase tracking-[0.12em] text-stone-500"><span>Sighting probability</span><span className="text-[#52722e]">{probability}%</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-stone-200"><div className="h-full rounded-full bg-[#52722e]" style={{ width: `${Math.max(0, Math.min(100, probability))}%` }} /></div><p className="mt-3 text-xs leading-5 text-stone-500">A likelihood based on the tour's recorded sightings, never a guarantee.</p></div></article> })}</div> : <p className="mt-8 rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-stone-600">Wildlife details have not been added for this tour yet.</p>}</div></section>
}

function TourDetailPage() {
  const { tourId } = useParams({ from: '/tours/$tourId' })
  const numericTourId = Number(tourId)
  const { data: tour, isLoading, error } = useTour(numericTourId)

  if (isLoading) return <main className="flex min-h-screen items-center justify-center bg-[#f6f4ec] text-stone-600">Loading tour details...</main>
  if (error || !tour) return <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f6f4ec] px-6 text-center"><p className="text-lg font-semibold text-red-700">This tour could not be loaded.</p><Link to="/tours" className="rounded-lg bg-[#193b19] px-5 py-3 font-semibold text-white">Back to tours</Link></main>

  const cover = tourImage(tour)
  const animals = tour.animals ?? []
  const wildlifeNames = animals.map((item) => item.animal.animal_name).join(' · ')
  const highestProbability = animals.length ? Math.round(Math.max(...animals.map((item) => item.sighting_probability)) * 100) : null

  return <main className="min-h-screen bg-[#f6f4ec] text-stone-900">
    <header className="relative flex min-h-[680px] items-end overflow-hidden bg-[#193b19] px-4 pb-10 pt-28 md:min-h-[760px] md:px-6 md:pb-16"><div className="absolute inset-0">{cover ? <img src={cover} alt={tour.tour_name} className="h-full w-full object-cover" /> : null}<div className="absolute inset-0 bg-gradient-to-t from-[#102b18]/95 via-[#193b19]/45 to-[#193b19]/20" /></div><div className="relative z-10 mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end"><div className="max-w-3xl text-white"><Link to="/tours" className="mb-10 inline-flex items-center gap-2 text-sm font-semibold text-green-50 transition hover:text-lime-200"><ArrowLeft size={16} /> All tours</Link><p className="text-xs font-bold uppercase tracking-[0.25em] text-lime-200">Imagine Borneo Tours</p><h1 className="mt-4 text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">{tour.tour_name}</h1><p className="mt-6 max-w-2xl whitespace-pre-line text-base leading-8 text-green-50 md:text-lg">{tour.tour_desc || 'A closer look at Borneo through the places and wildlife that make it extraordinary.'}</p></div><aside className="rounded-2xl border border-white/25 bg-white/95 p-6 shadow-2xl backdrop-blur md:p-7"><p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">Starting from</p><p className="mt-2 text-3xl font-bold text-[#193b19]">{formatRM(tour.tour_price)}</p><p className="mt-2 text-sm text-stone-500">As listed for this experience</p><Link to="/contact" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#193b19] px-4 py-4 text-center text-sm font-bold uppercase tracking-[0.1em] text-white transition hover:bg-[#315c2d]">Enquire about this tour <ArrowRight size={16} /></Link></aside></div></header>

    <section className="border-b border-stone-200 bg-white px-4 py-7 md:px-6"><div className="mx-auto grid max-w-7xl gap-6 sm:grid-cols-2 lg:grid-cols-4">{[["PRICE", formatRM(tour.tour_price)], ["WILDLIFE", wildlifeNames || 'Not specified'], ["SIGHTING CHANCE", highestProbability !== null ? `Up to ${highestProbability}%` : 'Not specified'], ["ANIMALS RECORDED", animals.length ? `${animals.length} linked ${animals.length === 1 ? 'animal' : 'animals'}` : 'Not specified']].map(([label, value]) => <div key={label} className="border-stone-200 sm:border-l sm:pl-5 first:border-0 first:pl-0"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500">{label}</p><p className="mt-2 line-clamp-2 text-sm font-bold leading-6 text-[#193b19]">{value}</p></div>)}</div></section>

    <section className="mx-auto grid max-w-7xl gap-12 px-4 py-20 md:px-6 md:py-28 lg:grid-cols-12 lg:items-center"><div className="lg:col-span-5"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#52722e]">About this tour</p><h2 className="mt-3 text-3xl font-bold leading-tight text-[#193b19] md:text-4xl">A journey shaped by the details of Borneo.</h2><div className="mt-7 whitespace-pre-line text-lg leading-8 text-stone-600">{tour.tour_desc || 'Tour description coming soon.'}</div><div className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#315c2d]"><Check size={17} /> Built from the tour information in our catalogue</div></div><div className="group aspect-[4/3] overflow-hidden rounded-2xl bg-[#dfe8cf] shadow-[0_20px_50px_-24px_rgba(25,59,25,0.5)] lg:col-span-7 lg:aspect-[7/6]">{cover ? <img src={cover} alt={`${tour.tour_name} landscape`} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center text-sm font-semibold text-[#52722e]">Tour image coming soon</div>}</div></section>

    <WildlifeSection tour={tour} />
    <TourGallery tour={tour} />
    <section className="px-4 pb-20 md:px-6 md:pb-28"><div className="mx-auto flex max-w-7xl flex-col gap-7 rounded-2xl bg-[#193b19] p-8 text-white md:flex-row md:items-center md:justify-between md:p-12"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-lime-200">Your next view of Borneo</p><h2 className="mt-3 text-3xl font-bold md:text-4xl">Ready to explore this tour?</h2><p className="mt-3 max-w-xl leading-7 text-green-100">Send an enquiry and include the tour name so our team can help with your questions.</p></div><Link to="/contact" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-white px-5 py-4 font-bold text-[#193b19] transition hover:bg-green-50">Enquire now <ChevronRight size={18} /></Link></div></section>
  </main>
}

export default TourDetailPage
