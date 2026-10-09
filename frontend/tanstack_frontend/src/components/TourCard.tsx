import { Link } from '@tanstack/react-router'
import type { TourRead } from '@/api/model'
import { toAbsoluteUrl } from '@/lib/env'

function coverUrl(t: TourRead) {
  const url = t.cover_image?.url ?? t.images?.[0]?.image?.url
  return toAbsoluteUrl(url)
}

function formatRM(price: any) {
  const n = typeof price === 'string' ? Number(price) : price
  if (Number.isFinite(n)) return `RM ${n.toFixed(0)}`
  return `RM ${price ?? '—'}`
}

export default function TourCard({ tour }: { tour: TourRead }) {
  const img = coverUrl(tour)
  const animals =
    tour.animals?.map((a) => a.animal?.animal_name).filter(Boolean).slice(0, 3) ?? []

  return (
    <Link
      to="/tours/$tourId"
      params={{ tourId: String(tour.tour_id) }}
      className="group block"
    >
      <div className="overflow-hidden rounded-[32px] bg-white shadow-sm ring-1 ring-black/5 transition hover:shadow-lg">
        {/* Image */}
        <div className="relative h-80 w-full bg-white">
          {img ? (
            <img
              src={img}
              alt={tour.tour_name ?? 'Tour'}
              className="h-full w-full object-cover transition-transform duration-300 transform-gpu will-change-transform group-hover:scale-[1.02]"
              loading="lazy"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-stone-100 to-stone-200" />
          )}

          {/* Fade */}
          <div className="pointer-events-none absolute inset-x-0 -bottom-px h-32 bg-gradient-to-b from-transparent to-white" />
        </div>

        {/* Content */}
        <div className="px-7 pb-7 pt-5">
          {/* Title — 2 lines */}
          <div className="text-xl font-bold text-stone-900 line-clamp-2">
            {tour.tour_name}
          </div>

          <div className="mt-4 text-base">
            <div className="font-semibold text-stone-900">
              {formatRM(tour.tour_price)}
            </div>
            <div className="mt-1 text-stone-600 line-clamp-1">
              {animals.length ? `Animals: ${animals.join(', ')}` : 'Animals: —'}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}