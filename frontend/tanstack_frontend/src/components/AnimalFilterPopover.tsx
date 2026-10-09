import * as React from 'react'
import { Link } from '@tanstack/react-router'
import * as Popover from '@radix-ui/react-popover'
import { X, Search } from 'lucide-react'
import type { AnimalRead } from '@/api/model'
import { toAbsoluteUrl } from '@/lib/env'

function animalThumbUrl(a: AnimalRead) {
  const first = a.images?.[0]?.image?.url
  return toAbsoluteUrl(first)
}

export default function AnimalFilterPopover({
  animals,
  selectedIds,
  onToggle,
  onClear,
}: {
  animals: AnimalRead[]
  selectedIds: number[]
  onToggle: (id: number) => void
  onClear: () => void
}) {
  const [open, setOpen] = React.useState(false)
  const [q, setQ] = React.useState('')

  const filteredAnimals = React.useMemo(() => {
    const query = q.trim().toLowerCase()
    if (!query) return animals
    return animals.filter((a) => (a.animal_name ?? '').toLowerCase().includes(query))
  }, [animals, q])

  const selectedSet = React.useMemo(() => new Set(selectedIds), [selectedIds])

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button className="h-11 rounded-full border border-black/10 bg-white px-4 text-sm font-semibold text-stone-800 shadow-sm inline-flex items-center gap-2 hover:bg-stone-50 transition-colors">
          Animals
          {selectedIds.length ? (
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-900">
              {selectedIds.length}
            </span>
          ) : null}
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={10}
          className="z-50 w-[360px] rounded-2xl border border-black/10 bg-white shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-black/10">
            <div className="font-bold text-stone-900">Filter by animals</div>
            <button
              onClick={() => setOpen(false)}
              className="p-2 rounded-lg hover:bg-stone-100 transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          {/* Search */}
          <div className="px-4 py-3 border-b border-black/10">
            <div className="flex items-center gap-2 h-10 rounded-full border border-black/10 bg-white px-4 shadow-sm">
              <Search size={16} className="text-stone-500" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search animals..."
                className="w-full bg-transparent outline-none text-sm text-stone-900 placeholder:text-stone-400"
              />
            </div>
          </div>

          {/* Selected tags */}
          {selectedIds.length ? (
            <div className="px-4 py-3 border-b border-black/10">
              <div className="flex flex-wrap gap-2">
                {animals
                  .filter((a) => a.animal_id != null && selectedSet.has(a.animal_id))
                  .map((a) => (
                    <button
                      key={a.animal_id}
                      onClick={() => onToggle(a.animal_id!)}
                      className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-900 hover:bg-green-200 transition-colors"
                      title="Remove"
                    >
                      {a.animal_name}
                      <X size={14} />
                    </button>
                  ))}
              </div>

              <button
                onClick={onClear}
                className="mt-3 text-xs font-semibold text-stone-600 hover:text-stone-900 underline"
              >
                Clear all
              </button>
            </div>
          ) : null}

          {/* Scrollable list */}
          <div className="max-h-[320px] overflow-y-auto p-3">
            {filteredAnimals.length === 0 ? (
              <div className="px-2 py-6 text-sm text-stone-600">
                No animals found.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {filteredAnimals.map((a) => {
                  const id = a.animal_id
                  if (id == null) return null

                  const img = animalThumbUrl(a)
                  const isSelected = selectedSet.has(id)

                  return (
                    <button
                      key={id}
                      onClick={() => onToggle(id)}
                      className={[
                        'group rounded-xl overflow-hidden border transition-colors text-left',
                        isSelected
                          ? 'border-green-700 ring-2 ring-green-200'
                          : 'border-black/10 hover:border-black/20',
                      ].join(' ')}
                    >
                      <div className="h-20 w-full bg-stone-200 overflow-hidden">
                        {img ? (
                          <img
                            src={img}
                            alt={a.animal_name ?? 'Animal'}
                            className="h-full w-full object-cover group-hover:scale-[1.03] transition-transform"
                            loading="lazy"
                          />
                        ) : (
                          <div className="h-full w-full bg-gradient-to-br from-green-100 to-green-200" />
                        )}
                      </div>

                      <div className="px-3 py-2">
                        <div className="text-sm font-semibold text-stone-900 line-clamp-1">
                          {a.animal_name}
                        </div>

                        <div className="text-xs text-stone-600">
                          {isSelected ? 'Selected' : 'Tap to select'}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-black/10">
            <Link
              to="/animals"
              className="text-sm font-semibold text-green-800 hover:text-green-900 underline"
              onClick={() => setOpen(false)}
            >
              Browse all animals
            </Link>

            <button
              onClick={() => setOpen(false)}
              className="rounded-lg bg-green-800 px-4 py-2 text-sm font-semibold text-white hover:bg-green-900 transition-colors"
            >
              Done
            </button>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}