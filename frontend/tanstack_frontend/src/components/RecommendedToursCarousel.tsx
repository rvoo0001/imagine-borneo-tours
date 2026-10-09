import * as React from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { toAbsoluteUrl } from '@/lib/env'
import type { TourRead } from '@/api/model'

function formatPrice(price: string | number | undefined) {
  if (price == null) return ''
  const n = typeof price === 'string' ? Number(price) : price
  if (Number.isNaN(n)) return String(price)
  return new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency: 'MYR',
    maximumFractionDigits: 0,
  }).format(n)
}

export function RecommendedToursCarousel({ tours }: { tours: TourRead[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })
  const [selectedIndex, setSelectedIndex] = React.useState(0)

  const scrollPrev = React.useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = React.useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  React.useEffect(() => {
    if (!emblaApi) return
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap())
    onSelect()
    emblaApi.on('select', onSelect)
    return () => {
      emblaApi.off('select', onSelect)
    }
  }, [emblaApi])

  if (!tours.length) return null

  return (
    <section className="w-full">
      {/* Full-width hero area */}
      <div className="relative w-full">
        {/* height: adjust to taste */}
        <div className="h-[520px] w-full overflow-hidden" ref={emblaRef}>
          <div className="flex h-full">
            {tours.map((tour) => {
              const img = toAbsoluteUrl(tour.cover_image?.url)
              return (
                <div
                  key={tour.tour_id}
                  className="relative min-w-0 flex-[0_0_100%] h-full"
                >
                  {/* Background image */}
                  <div className="absolute inset-0">
                    {img ? (
                      <img
                        src={img}
                        alt={tour.tour_name ?? 'Tour cover'}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-green-950" />
                    )}
                    {/* subtle dark gradient to improve text contrast */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/10 to-black/50" />
                  </div>

                  {/* Content overlay */}
                  <div className="relative z-10 h-full w-full flex">
                    {/* Left side (mostly image, can be empty) */}
                    <div className="flex-1" />

                    {/* Right info panel */}
                    <div className="w-[420px] max-w-[45%] h-full bg-green-900/65 backdrop-blur-md p-6 flex flex-col justify-center text-green-50 shadow-xl">
                      <div className="text-sm font-semibold tracking-wide text-green-300">
                        Recommended Tour
                      </div>

                      <h2 className="mt-2 text-2xl font-bold text-green-50">
                        {tour.tour_name}
                      </h2>

                      <p className="mt-3 text-green-100 line-clamp-4">
                        {tour.tour_desc}
                      </p>

                      <div className="mt-4 space-y-2 text-green-100">
                        <div>
                          <span className="font-semibold text-green-200">Animals: </span>
                          {tour.animals?.length
                            ? tour.animals
                                .map((a) => a.animal?.animal_name)
                                .filter(Boolean)
                                .join(', ')
                            : '—'}
                        </div>

                        <div>
                          <span className="font-semibold text-green-200">Price: </span>
                          {formatPrice(tour.tour_price)}
                        </div>
                      </div>

                      <div className="mt-6 flex gap-3">
                        <Link
                          to="/tours/$tourId"
                          params={{ tourId: String(tour.tour_id) }}
                          className="inline-flex items-center justify-center rounded-lg bg-green-600 px-4 py-2 text-white font-semibold hover:bg-green-700 transition-colors"
                        >
                          View Tour
                        </Link>

                        <Link
                          to="/tours"
                          className="inline-flex items-center justify-center rounded-lg border border-green-400 px-4 py-2 text-green-200 font-semibold hover:bg-green-900/40 transition-colors"
                        >
                          View All
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Arrows */}
        <button
          onClick={scrollPrev}
          className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 hover:bg-white shadow flex items-center justify-center"
          aria-label="Previous"
        >
          <ChevronLeft />
        </button>

        <button
          onClick={scrollNext}
          className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 hover:bg-white shadow flex items-center justify-center"
          aria-label="Next"
        >
          <ChevronRight />
        </button>

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {tours.map((_, i) => (
            <button
              key={i}
              onClick={() => emblaApi?.scrollTo(i)}
              className={`h-2.5 w-2.5 rounded-full transition-all ${
                i === selectedIndex ? 'bg-white' : 'bg-white/50'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default RecommendedToursCarousel;