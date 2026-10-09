import { Link } from '@tanstack/react-router'

const links = [
  { to: '/tours', label: 'Tours' },
  { to: '/animals', label: 'Wildlife' },
  { to: '/about-us', label: 'About us' },
  { to: '/contact', label: 'Contact' },
]

export default function Footer() {
  return <footer className="bg-[#193b19] px-6 py-14 text-white md:py-20"><div className="mx-auto flex max-w-7xl flex-col gap-10 md:flex-row md:items-end md:justify-between"><div className="max-w-sm"><Link to="/" className="inline-flex items-center gap-3"><img src="/imagine-borneo.png" alt="Imagine Borneo Tours" className="h-10 w-auto" /><span className="text-xl font-bold tracking-wide">Imagine Borneo Tours</span></Link><p className="mt-5 text-sm leading-7 text-green-100">Discover the wildlife, landscapes, and experiences that make Borneo unforgettable.</p></div><nav className="flex flex-wrap gap-x-7 gap-y-3 text-sm font-semibold text-green-100">{links.map((link) => <Link key={link.to} to={link.to} className="transition hover:text-lime-200">{link.label}</Link>)}</nav></div><div className="mx-auto mt-10 max-w-7xl border-t border-white/15 pt-5 text-xs text-green-200">© {new Date().getFullYear()} Imagine Borneo Tours</div></footer>
}