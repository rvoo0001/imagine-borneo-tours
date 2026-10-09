import * as React from 'react'
import { Link } from '@tanstack/react-router'
import type { AnimalRead } from '@/api/model'
import { toAbsoluteUrl } from '@/lib/env'

function repeatUntilMinimum<T>(items: T[], min: number): T[] {
  if (!items.length) return []
  const out = [...items]
  while (out.length < min) out.push(...items)
  return out
}

function animalCoverUrl(a: AnimalRead) {
  const first = a.images?.[0]?.image?.url
  return toAbsoluteUrl(first)
}

export default function AnimalsMarquee({ animals }: { animals: AnimalRead[] }) {
  const viewportRef = React.useRef<HTMLDivElement | null>(null)
  const [isPaused, setIsPaused] = React.useState(false)

  const items = React.useMemo(() => repeatUntilMinimum(animals, 18), [animals])
  const doubled = React.useMemo(() => [...items, ...items], [items])

  React.useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return
    if (!items.length) return

    let raf = 0
    const pxPerFrame = 0.55 // tweak

    const tick = () => {
      if (!viewport) return

      if (!isPaused) {
        viewport.scrollLeft += pxPerFrame

        const half = viewport.scrollWidth / 2
        if (viewport.scrollLeft >= half) {
          viewport.scrollLeft -= half
        }
      }

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [items.length, isPaused])

  if (!animals.length) return null

  return (
    <div className="w-full">
      {/* Full-bleed marquee: no side padding */}
      <div
        ref={viewportRef}
        className="w-screen overflow-hidden"
        style={{ marginLeft: 'calc(50% - 50vw)', marginRight: 'calc(50% - 50vw)' }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="flex">
          {doubled.map((a, idx) => {
            const img = animalCoverUrl(a)
            return (
              <Link
                key={`${a.animal_id}-${idx}`}
                to="/animals"
                aria-label={a.animal_name ?? 'Animal'}
                className="flex-[0_0_auto]"
              >
                {/* Squares with ZERO gaps */}
                <div className="h-44 w-44 sm:h-52 sm:w-52 md:h-56 md:w-56 bg-gray-200 overflow-hidden">
                  {img ? (
                    <img
                      src={img}
                      alt={a.animal_name ?? 'Animal'}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      draggable={false}
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-green-100 to-green-200" />
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}