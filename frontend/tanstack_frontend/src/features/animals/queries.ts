import { useQuery } from '@tanstack/react-query'
import { getImagineBorneoToursAPI } from '@/api/generated'

const api = getImagineBorneoToursAPI()

export function useAnimals() {
  return useQuery({
    queryKey: ['animals', 'list'],
    queryFn: async () => {
      const res = await api.listAnimalsAnimalsGet()
      return res.data
    },
  })
}