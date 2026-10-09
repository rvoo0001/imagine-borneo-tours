import { useQuery } from '@tanstack/react-query'
import { getImagineBorneoToursAPI } from '@/api/generated'
import type { TourRead, ListToursToursGetParams } from '@/api/model'

const api = getImagineBorneoToursAPI()

function normalizeParams(params?: ListToursToursGetParams) {
  if (!params) return undefined

  const anyParams = params as any

  const animalIds =
    Array.isArray(anyParams.animal_id)
      ? [...anyParams.animal_id].sort((a: number, b: number) => a - b)
      : anyParams.animal_id

  const out: any = { ...params, animal_id: animalIds }

  // Drop empty values so query keys don't churn
  Object.keys(out).forEach((k) => {
    const v = out[k]
    if (v === undefined || v === null || v === '') delete out[k]
    if (Array.isArray(v) && v.length === 0) delete out[k]
  })

  return out
}

export const tourKeys = {
  all: ['tours'] as const,
  list: (params?: ListToursToursGetParams) => {
    const norm = normalizeParams(params)
    return ['tours', 'list', JSON.stringify(norm ?? {})] as const
  },
  recommended: ['tours', 'recommended-v1'] as const,
}

export function useTours(params?: ListToursToursGetParams) {
  return useQuery<TourRead[], Error>({
    queryKey: tourKeys.list(params),
    queryFn: async () => {
      const res = await api.listToursToursGet(params)
      return res.data
    },

    // ✅ TanStack Query-safe "keep previous data" behavior:
    // keeps old list while fetching new one (prevents blinking)
    placeholderData: (prev) => prev,

    staleTime: 10_000,
  })
}

export function useRecommendedTours() {
  return useQuery<TourRead[], Error, TourRead[]>({
    queryKey: tourKeys.recommended,
    queryFn: async () => {
      const res = await api.listToursToursGet()
      return res.data
    },
    select: (tours) =>
      [...tours].sort((a, b) => (a.tour_id ?? 0) - (b.tour_id ?? 0)).slice(0, 5),
    staleTime: 30_000,
  })
}

export function useTour(tourId: number) {
  return useQuery<TourRead, Error>({
    queryKey: ['tours', 'detail', tourId],
    queryFn: async () => {
      const res = await api.getTourToursTourIdGet(tourId)
      return res.data
    },
    enabled: !!tourId,
    staleTime: 10_000,
  })
}