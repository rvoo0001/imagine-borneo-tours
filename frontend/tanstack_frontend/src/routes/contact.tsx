import * as React from 'react'
import axios from 'axios'
import { createFileRoute } from '@tanstack/react-router'
import { CheckCircle2, Mail, Send } from 'lucide-react'

export const Route = createFileRoute('/contact')({ component: ContactPage })

type ContactForm = {
  name: string
  email: string
  phone: string
  subject: string
  message: string
}

const initialForm: ContactForm = { name: '', email: '', phone: '', subject: '', message: '' }
const inputClass = 'h-11 rounded-lg border border-stone-300 bg-white px-3 text-sm outline-none transition focus:border-[#52722e] focus:ring-2 focus:ring-[#52722e]/20'

function ContactPage() {
  const [form, setForm] = React.useState(initialForm)
  const [error, setError] = React.useState('')
  const [submitted, setSubmitted] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  function updateField(field: keyof ContactForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSubmitted(false)
    if (!form.name.trim() || !form.subject.trim() || !form.message.trim()) return setError('Please complete your name, subject, and message.')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return setError('Enter a valid email address.')
    if (form.message.trim().length < 10) return setError('Your message should be at least 10 characters.')
    setIsSubmitting(true)
    try {
      await axios.post('/contact/messages', { ...form, phone: form.phone.trim() || null })
      setForm(initialForm)
      setSubmitted(true)
    } catch (requestError) {
      const detail = (requestError as { response?: { data?: { detail?: string } } }).response?.data?.detail
      setError(detail ?? 'We could not send your message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f4ec] text-stone-900">
      <section className="bg-[#193b19] px-6 py-20 text-white md:py-28">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-lime-200">Contact</p>
          <h1 className="mt-4 text-4xl font-bold md:text-6xl">Get in touch.</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-green-100">Have a question about an experience in the catalogue? Send a message and we will have a clear place to start.</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[0.8fr_1.2fr] lg:py-20">
        <div>
          <div className="rounded-2xl bg-[#dfe8cf] p-7 text-[#193b19]">
            <Mail size={24} />
            <h2 className="mt-6 text-2xl font-bold">Let us start a conversation.</h2>
            <p className="mt-3 leading-7 text-[#315c2d]">Use the form to share your question or tell us what kind of nature experience you are looking for.</p>
            <div className="mt-6 flex items-center gap-3 text-sm font-semibold"><Send size={16} /> Messages are saved for follow-up.</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5 md:p-8">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold text-stone-700">Name<input className={inputClass} value={form.name} onChange={(event) => updateField('name', event.target.value)} autoComplete="name" required /></label>
            <label className="grid gap-2 text-sm font-semibold text-stone-700">Email<input className={inputClass} type="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} autoComplete="email" required /></label>
            <label className="grid gap-2 text-sm font-semibold text-stone-700">Phone <span className="font-normal text-stone-400">(optional)</span><input className={inputClass} type="tel" value={form.phone} onChange={(event) => updateField('phone', event.target.value)} autoComplete="tel" /></label>
            <label className="grid gap-2 text-sm font-semibold text-stone-700">Subject<input className={inputClass} value={form.subject} onChange={(event) => updateField('subject', event.target.value)} required /></label>
          </div>
          <label className="mt-5 grid gap-2 text-sm font-semibold text-stone-700">Message<textarea className="min-h-40 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#52722e] focus:ring-2 focus:ring-[#52722e]/20" value={form.message} onChange={(event) => updateField('message', event.target.value)} minLength={10} maxLength={5000} required /></label>
          {error ? <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">{error}</p> : null}
          {submitted ? <p className="mt-4 flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800" role="status"><CheckCircle2 size={17} /> Your message has been received.</p> : null}
          <button type="submit" disabled={isSubmitting} className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#193b19] px-5 font-semibold text-white transition hover:bg-[#285629] disabled:cursor-not-allowed disabled:opacity-60"><Send size={17} />{isSubmitting ? 'Sending...' : 'Send message'}</button>
        </form>
      </section>
    </main>
  )
}
