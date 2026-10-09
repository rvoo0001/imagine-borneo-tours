import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus, Trash2, Upload, X } from 'lucide-react'
import type { AnimalCreate, AnimalRead, BodyUploadImageToAnimalAnimalsAnimalIdImagesUploadPost } from '@/api/model'
import { useAnimals } from '@/features/animals/queries'
import { useAdminAuth } from '@/features/admin/auth'
import { adminApi, adminOptions, getApiErrorMessage } from '@/features/admin/api'
import { toAbsoluteUrl } from '@/lib/env'

export const Route = createFileRoute('/admin/animals')({ component: AdminAnimalsPage })

const inputClass = 'h-10 rounded-lg border border-stone-300 bg-white px-3 text-sm outline-none transition focus:border-[#52722e] focus:ring-2 focus:ring-[#52722e]/20'

function AdminAnimalsPage() {
  const queryClient = useQueryClient()
  const { token } = useAdminAuth()
  const { data: animals = [], isLoading, error } = useAnimals()
  const [editing, setEditing] = React.useState<AnimalRead | null>(null)
  const [name, setName] = React.useState('')
  const [formError, setFormError] = React.useState('')
  const [isSaving, setIsSaving] = React.useState(false)
  const [uploadingId, setUploadingId] = React.useState<number | null>(null)

  function startCreate() {
    setEditing(null)
    setName('')
    setFormError('')
  }

  function startEdit(animal: AnimalRead) {
    setEditing(animal)
    setName(animal.animal_name)
    setFormError('')
  }

  async function saveAnimal(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const cleanName = name.trim()
    if (!cleanName) {
      setFormError('Animal name is required.')
      return
    }
    if (!token) return
    setIsSaving(true)
    setFormError('')
    try {
      const payload: AnimalCreate = { animal_name: cleanName }
      if (editing) {
        await adminApi.updateAnimalAnimalsAnimalIdPatch(editing.animal_id, payload, adminOptions(token))
      } else {
        await adminApi.createAnimalAnimalsPost(payload, adminOptions(token))
      }
      await queryClient.invalidateQueries({ queryKey: ['animals', 'list'] })
      startCreate()
    } catch (error) {
      setFormError(getApiErrorMessage(error, 'Unable to save this animal.'))
    } finally {
      setIsSaving(false)
    }
  }

  async function deleteAnimal(animal: AnimalRead) {
    if (!token || !window.confirm(`Delete ${animal.animal_name}?`)) return
    try {
      await adminApi.deleteAnimalAnimalsAnimalIdDelete(animal.animal_id, adminOptions(token))
      await queryClient.invalidateQueries({ queryKey: ['animals', 'list'] })
      if (editing?.animal_id === animal.animal_id) startCreate()
    } catch (error) {
      setFormError(getApiErrorMessage(error, 'Unable to delete this animal.'))
    }
  }

  async function uploadImage(animalId: number, file: File) {
    if (!token) return
    setUploadingId(animalId)
    setFormError('')
    try {
      const body: BodyUploadImageToAnimalAnimalsAnimalIdImagesUploadPost = { file }
      await adminApi.uploadImageToAnimalAnimalsAnimalIdImagesUploadPost(animalId, body, adminOptions(token))
      await queryClient.invalidateQueries({ queryKey: ['animals', 'list'] })
    } catch (error) {
      setFormError(getApiErrorMessage(error, 'Unable to upload this image.'))
    } finally {
      setUploadingId(null)
    }
  }

  async function removeImage(animalId: number, imageId: number) {
    if (!token || !window.confirm('Remove this image from the animal?')) return
    try {
      await adminApi.removeImageFromAnimalAnimalsAnimalIdImagesImageIdDelete(animalId, imageId, adminOptions(token))
      await queryClient.invalidateQueries({ queryKey: ['animals', 'list'] })
    } catch (error) {
      setFormError(getApiErrorMessage(error, 'Unable to remove this image.'))
    }
  }

  return (
    <section>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#52722e]">Catalogue</p><h2 className="mt-2 text-3xl font-bold">Animals</h2></div>
        <button type="button" onClick={startCreate} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#193b19] px-4 text-sm font-semibold text-white hover:bg-[#285629]"><Plus size={17} /> Add animal</button>
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_330px]">
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
          {isLoading ? <p className="p-6 text-sm text-stone-600">Loading animals...</p> : error ? <p className="p-6 text-sm text-red-700">Unable to load animals.</p> : animals.length === 0 ? <p className="p-6 text-sm text-stone-600">No animals yet. Add the first one.</p> : <div className="divide-y divide-stone-200">
            {animals.map((animal) => <div key={animal.animal_id} className="flex flex-wrap items-center gap-4 p-4 sm:flex-nowrap">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                {animal.images?.[0]?.image?.url ? <img src={toAbsoluteUrl(animal.images[0].image.url)} alt="" className="h-12 w-12 rounded-lg object-cover" /> : <div className="h-12 w-12 rounded-lg bg-[#e7f0d9]" />}
                <div className="min-w-0"><p className="truncate font-semibold">{animal.animal_name}</p><p className="text-xs text-stone-500">{animal.images?.length ?? 0} image{animal.images?.length === 1 ? '' : 's'}</p></div>
              </div>
              <div className="flex gap-2"><button type="button" onClick={() => startEdit(animal)} className="inline-flex items-center gap-1 rounded-lg border border-stone-300 px-3 py-2 text-xs font-semibold hover:bg-stone-50"><Pencil size={14} /> Edit</button><button type="button" onClick={() => deleteAnimal(animal)} className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50"><Trash2 size={14} /> Delete</button></div>
            </div>)}
          </div>}
        </div>
        <form onSubmit={saveAnimal} className="h-fit rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
          <h3 className="text-lg font-bold">{editing ? 'Edit animal' : 'Add animal'}</h3>
          <label className="mt-5 grid gap-2 text-sm font-semibold text-stone-700">Name<input className={inputClass} value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Proboscis Monkey" /></label>
          {formError ? <p className="mt-3 text-sm text-red-700">{formError}</p> : null}
          <div className="mt-5 flex gap-2"><button type="submit" disabled={isSaving} className="h-10 flex-1 rounded-lg bg-[#193b19] px-4 text-sm font-semibold text-white hover:bg-[#285629] disabled:opacity-60">{isSaving ? 'Saving...' : editing ? 'Save changes' : 'Create animal'}</button>{editing ? <button type="button" onClick={startCreate} className="h-10 rounded-lg border border-stone-300 px-4 text-sm font-semibold hover:bg-stone-50">Cancel</button> : null}</div>
          {editing ? <div className="mt-6 border-t border-stone-200 pt-5"><p className="text-sm font-bold">Images</p><label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-stone-300 px-3 py-3 text-sm font-semibold text-stone-600 hover:bg-stone-50"><Upload size={16} />{uploadingId === editing.animal_id ? 'Uploading...' : 'Upload image'}<input type="file" accept=".jpg,.jpeg,.png,.webp" className="hidden" disabled={uploadingId !== null} onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadImage(editing.animal_id, file); event.currentTarget.value = '' }} /></label><div className="mt-3 grid grid-cols-3 gap-2">{editing.images?.map((link) => <div key={link.image_id} className="group relative"><img src={toAbsoluteUrl(link.image.url)} alt="" className="aspect-square w-full rounded-lg object-cover" /><button type="button" onClick={() => void removeImage(editing.animal_id, link.image_id)} className="absolute right-1 top-1 rounded-full bg-white/90 p-1 text-red-700 opacity-0 shadow transition group-hover:opacity-100" aria-label="Remove image"><X size={13} /></button></div>)}</div></div> : <p className="mt-5 text-xs text-stone-500">Create the animal first to add images.</p>}
        </form>
      </div>
    </section>
  )
}
