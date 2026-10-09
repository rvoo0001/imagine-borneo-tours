import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { Check, Pencil, Plus, Trash2, Upload, X } from 'lucide-react'
import type { BodyUploadImageToTourToursTourIdImagesUploadPost, TourAnimalLinkBase, TourCreate, TourRead, TourUpdate } from '@/api/model'
import { useAnimals } from '@/features/animals/queries'
import { useTours } from '@/features/tours/queries'
import { useAdminAuth } from '@/features/admin/auth'
import { adminApi, adminOptions, getApiErrorMessage } from '@/features/admin/api'
import { toAbsoluteUrl } from '@/lib/env'

export const Route = createFileRoute('/admin/tours')({ component: AdminToursPage })

const inputClass = 'h-10 rounded-lg border border-stone-300 bg-white px-3 text-sm outline-none transition focus:border-[#52722e] focus:ring-2 focus:ring-[#52722e]/20'

function AdminToursPage() {
  const queryClient = useQueryClient()
  const { token } = useAdminAuth()
  const { data: tours = [], isLoading, error } = useTours()
  const { data: animals = [] } = useAnimals()
  const [editing, setEditing] = React.useState<TourRead | null>(null)
  const [name, setName] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [price, setPrice] = React.useState('')
  const [selectedAnimals, setSelectedAnimals] = React.useState<Record<number, string>>({})
  const [formError, setFormError] = React.useState('')
  const [isSaving, setIsSaving] = React.useState(false)
  const [uploadingId, setUploadingId] = React.useState<number | null>(null)

  function startCreate() {
    setEditing(null)
    setName('')
    setDescription('')
    setPrice('')
    setSelectedAnimals({})
    setFormError('')
  }

  function startEdit(tour: TourRead) {
    const links = Object.fromEntries((tour.animals ?? []).map((link) => [link.animal_id, String(link.sighting_probability)]))
    setEditing(tour)
    setName(tour.tour_name)
    setDescription(tour.tour_desc ?? '')
    setPrice(String(tour.tour_price))
    setSelectedAnimals(links)
    setFormError('')
  }

  function toggleAnimal(id: number) {
    setSelectedAnimals((current) => {
      if (Object.hasOwn(current, id)) {
        const next = { ...current }
        delete next[id]
        return next
      }
      return { ...current, [id]: '0.5' }
    })
  }

  function buildAnimalLinks(): Array<TourAnimalLinkBase> | null {
    const links: Array<TourAnimalLinkBase> = []
    for (const [animalId, rawProbability] of Object.entries(selectedAnimals)) {
      const probability = Number(rawProbability)
      if (!Number.isFinite(probability) || probability < 0 || probability > 1) {
        setFormError('Sighting probability must be between 0 and 1.')
        return null
      }
      links.push({ animal_id: Number(animalId), sighting_probability: probability })
    }
    return links
  }

  async function saveTour(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const cleanName = name.trim()
    const numericPrice = Number(price)
    if (!cleanName) return setFormError('Tour name is required.')
    if (!price.trim() || !Number.isFinite(numericPrice) || numericPrice < 0) return setFormError('Enter a valid non-negative price.')
    const links = buildAnimalLinks()
    if (!token) return
    setIsSaving(true)
    setFormError('')
    try {
      const payload: TourCreate = { tour_name: cleanName, tour_desc: description.trim() || null, tour_price: price, animals: links }
      if (!editing) {
        await adminApi.createTourToursPost(payload, adminOptions(token))
      } else {
        const update: TourUpdate = { tour_name: cleanName, tour_desc: description.trim() || null, tour_price: price }
        await adminApi.updateTourToursTourIdPatch(editing.tour_id, update, adminOptions(token))
        const currentIds = new Set((editing.animals ?? []).map((link) => link.animal_id))
        await Promise.all(Object.keys(selectedAnimals).filter((id) => !currentIds.has(Number(id))).map((id) => adminApi.addAnimalsToTourToursTourIdAnimalsPost(editing.tour_id, [{ animal_id: Number(id), sighting_probability: Number(selectedAnimals[Number(id)]) }], adminOptions(token))))
        await Promise.all([...currentIds].filter((id) => !Object.hasOwn(selectedAnimals, id)).map((id) => adminApi.removeAnimalFromTourToursTourIdAnimalsAnimalIdDelete(editing.tour_id, id, adminOptions(token))))
        if (links.length) await adminApi.addAnimalsToTourToursTourIdAnimalsPost(editing.tour_id, links, adminOptions(token))
      }
      await queryClient.invalidateQueries({ queryKey: ['tours'] })
      startCreate()
    } catch (error) {
      setFormError(getApiErrorMessage(error, 'Unable to save this tour.'))
    } finally {
      setIsSaving(false)
    }
  }

  async function deleteTour(tour: TourRead) {
    if (!token || !window.confirm(`Delete ${tour.tour_name}?`)) return
    try {
      await adminApi.deleteTourToursTourIdDelete(tour.tour_id, adminOptions(token))
      await queryClient.invalidateQueries({ queryKey: ['tours'] })
      if (editing?.tour_id === tour.tour_id) startCreate()
    } catch (error) {
      setFormError(getApiErrorMessage(error, 'Unable to delete this tour.'))
    }
  }

  async function uploadImage(tourId: number, file: File) {
    if (!token) return
    setUploadingId(tourId)
    setFormError('')
    try {
      const body: BodyUploadImageToTourToursTourIdImagesUploadPost = { file }
      const response = await adminApi.uploadImageToTourToursTourIdImagesUploadPost(tourId, body, adminOptions(token))
      setEditing(response.data)
      await queryClient.invalidateQueries({ queryKey: ['tours'] })
    } catch (error) {
      setFormError(getApiErrorMessage(error, 'Unable to upload this image.'))
    } finally {
      setUploadingId(null)
    }
  }

  async function removeImage(tourId: number, imageId: number) {
    if (!token || !window.confirm('Remove this image from the tour?')) return
    try {
      const response = await adminApi.removeImageFromTourToursTourIdImagesImageIdDelete(tourId, imageId, adminOptions(token))
      setEditing(response.data)
      await queryClient.invalidateQueries({ queryKey: ['tours'] })
    } catch (error) {
      setFormError(getApiErrorMessage(error, 'Unable to remove this image.'))
    }
  }

  async function setCoverImage(tourId: number, imageId: number) {
    if (!token) return
    try {
      const response = await adminApi.setCoverImageToursTourIdCoverImageImageIdPatch(tourId, imageId, adminOptions(token))
      setEditing(response.data)
      await queryClient.invalidateQueries({ queryKey: ['tours'] })
    } catch (error) {
      setFormError(getApiErrorMessage(error, 'Unable to set the cover image.'))
    }
  }

  return (
    <section>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#52722e]">Catalogue</p><h2 className="mt-2 text-3xl font-bold">Tours</h2></div><button type="button" onClick={startCreate} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#193b19] px-4 text-sm font-semibold text-white hover:bg-[#285629]"><Plus size={17} /> Add tour</button></div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">{isLoading ? <p className="p-6 text-sm text-stone-600">Loading tours...</p> : error ? <p className="p-6 text-sm text-red-700">Unable to load tours.</p> : tours.length === 0 ? <p className="p-6 text-sm text-stone-600">No tours yet. Add the first one.</p> : <div className="divide-y divide-stone-200">{tours.map((tour) => <div key={tour.tour_id} className="flex flex-wrap items-center gap-4 p-4 sm:flex-nowrap"><div className="flex min-w-0 flex-1 items-center gap-3">{tour.cover_image?.url ? <img src={toAbsoluteUrl(tour.cover_image.url)} alt="" className="h-14 w-20 rounded-lg object-cover" /> : <div className="h-14 w-20 rounded-lg bg-[#e7f0d9]" />}<div className="min-w-0"><p className="truncate font-semibold">{tour.tour_name}</p><p className="text-xs text-stone-500">RM {tour.tour_price} · {tour.animals?.length ?? 0} animals</p></div></div><div className="flex gap-2"><button type="button" onClick={() => startEdit(tour)} className="inline-flex items-center gap-1 rounded-lg border border-stone-300 px-3 py-2 text-xs font-semibold hover:bg-stone-50"><Pencil size={14} /> Edit</button><button type="button" onClick={() => deleteTour(tour)} className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50"><Trash2 size={14} /> Delete</button></div></div>)}</div>}</div>
        <form onSubmit={saveTour} className="h-fit rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5"><h3 className="text-lg font-bold">{editing ? 'Edit tour' : 'Add tour'}</h3><div className="mt-5 grid gap-4"><label className="grid gap-2 text-sm font-semibold text-stone-700">Tour name<input className={inputClass} value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Kinabatangan Wildlife" /></label><label className="grid gap-2 text-sm font-semibold text-stone-700">Price (RM)<input className={inputClass} type="number" min="0" step="0.01" value={price} onChange={(event) => setPrice(event.target.value)} /></label><label className="grid gap-2 text-sm font-semibold text-stone-700">Description<textarea className="min-h-24 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#52722e] focus:ring-2 focus:ring-[#52722e]/20" value={description} onChange={(event) => setDescription(event.target.value)} /></label></div><fieldset className="mt-5"><legend className="text-sm font-bold">Animals and sighting probability</legend><div className="mt-2 max-h-48 space-y-2 overflow-y-auto rounded-lg border border-stone-200 p-3">{animals.length ? animals.map((animal) => { const checked = Object.hasOwn(selectedAnimals, animal.animal_id); return <div key={animal.animal_id} className="flex items-center gap-2 text-sm"><button type="button" onClick={() => toggleAnimal(animal.animal_id)} className={`flex h-5 w-5 items-center justify-center rounded border ${checked ? 'border-[#315c2d] bg-[#315c2d] text-white' : 'border-stone-300'}`} aria-label={`${checked ? 'Remove' : 'Add'} ${animal.animal_name}`} >{checked ? <Check size={14} /> : null}</button><span className="min-w-0 flex-1 truncate">{animal.animal_name}</span>{checked ? <input aria-label={`Sighting probability for ${animal.animal_name}`} className="h-8 w-20 rounded border border-stone-300 px-2 text-xs" type="number" min="0" max="1" step="0.01" value={selectedAnimals[animal.animal_id]} onChange={(event) => setSelectedAnimals((current) => ({ ...current, [animal.animal_id]: event.target.value }))} /> : null}</div> }) : <p className="text-xs text-stone-500">Add animals before linking them to a tour.</p>}</div></fieldset>{formError ? <p className="mt-3 text-sm text-red-700">{formError}</p> : null}<div className="mt-5 flex gap-2"><button type="submit" disabled={isSaving} className="h-10 flex-1 rounded-lg bg-[#193b19] px-4 text-sm font-semibold text-white hover:bg-[#285629] disabled:opacity-60">{isSaving ? 'Saving...' : editing ? 'Save changes' : 'Create tour'}</button>{editing ? <button type="button" onClick={startCreate} className="h-10 rounded-lg border border-stone-300 px-4 text-sm font-semibold hover:bg-stone-50">Cancel</button> : null}</div>{editing ? <div className="mt-6 border-t border-stone-200 pt-5"><p className="text-sm font-bold">Images</p><label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-stone-300 px-3 py-3 text-sm font-semibold text-stone-600 hover:bg-stone-50"><Upload size={16} />{uploadingId === editing.tour_id ? 'Uploading...' : 'Upload image'}<input type="file" accept=".jpg,.jpeg,.png,.webp" className="hidden" disabled={uploadingId !== null} onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadImage(editing.tour_id, file); event.currentTarget.value = '' }} /></label><div className="mt-3 grid grid-cols-3 gap-2">{editing.images?.map((link) => <div key={link.image_id} className="group relative"><img src={toAbsoluteUrl(link.image.url)} alt="" className="aspect-square w-full rounded-lg object-cover" />{editing.cover_image && editing.cover_image.image_id === link.image_id ? <span className="absolute bottom-1 left-1 rounded bg-[#193b19] px-1.5 py-0.5 text-[10px] font-bold text-white">Cover</span> : <button type="button" onClick={() => void setCoverImage(editing.tour_id, link.image_id)} className="absolute bottom-1 left-1 rounded bg-white/90 px-1.5 py-0.5 text-[10px] font-bold text-stone-700 opacity-0 shadow transition group-hover:opacity-100">Set cover</button>}<button type="button" onClick={() => void removeImage(editing.tour_id, link.image_id)} className="absolute right-1 top-1 rounded-full bg-white/90 p-1 text-red-700 opacity-0 shadow transition group-hover:opacity-100" aria-label="Remove image"><X size={13} /></button></div>)}</div></div> : <p className="mt-5 text-xs text-stone-500">Create the tour first to add images.</p>}</form>
      </div>
    </section>
  )
}
