import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Home, Leaf, Mail, MapPinned, Menu, PawPrint, X } from 'lucide-react'

const navItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/tours', label: 'Tours', icon: MapPinned },
  { to: '/animals', label: 'Animals', icon: PawPrint },
  { to: '/about-us', label: 'About Us', icon: Leaf },
  { to: '/contact', label: 'Contacts', icon: Mail },
]

export default function Header() {
  const [show, setShow] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY

      // Always show at top
      if (current <= 0) {
        setShow(true)
        setLastScrollY(0)
        return
      }

      // If scrolling up -> show
      if (current < lastScrollY) {
        setShow(true)
      }

      // If scrolling down -> hide (after a small threshold)
      if (current > lastScrollY && current > 80) {
        setShow(false)
      }

      setLastScrollY(current)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  return (
    <header
      className={[
        // Fixed + top bar
        'fixed top-0 left-0 right-0 z-50',
        // Layout
        'px-4 py-2 flex items-center',
        // Style
        'bg-[#193b19] text-white shadow-lg',
        // Animate show/hide
        'transition-transform duration-300 ease-out',
        show ? 'translate-y-0' : '-translate-y-full',
      ].join(' ')}
    >
      {/* Left: Logo + Title */}
      <h1 className="ml-4 text-xl font-semibold">
        <Link to="/" className="flex items-center gap-2">
          <img
            src="/imagine-borneo.png"
            alt="Imagine Borneo Tours"
            className="h-12"
          />
          <span className="text-xl md:text-2xl font-bold tracking-wide">
            Imagine Borneo Tours
          </span>
        </Link>
      </h1>

      <button
        type="button"
        onClick={() => setMenuOpen((open) => !open)}
        className="ml-auto rounded-lg p-2 hover:bg-white/10 md:hidden"
        aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={menuOpen}
      >
        {menuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Right: Header nav sections */}
      <nav className="absolute left-0 right-0 top-full hidden flex-col bg-[#193b19] shadow-lg md:static md:ml-auto md:flex md:h-12 md:flex-row md:items-stretch md:bg-transparent md:shadow-none">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.to}
              to={item.to}
              className={[
                'h-full',
                'flex items-center justify-center',
                'px-8 md:px-10',
                'border-l-2 border-white/25',
                'hover:bg-white/10',
                'transition-colors',
                'select-none',
              ].join(' ')}
              activeProps={{
                className: [
                  'h-full',
                  'flex items-center justify-center',
                  'px-8 md:px-10',
                  'min-w-[160px]',
                  'border-l-2 border-white/35',
                  'bg-white/15',
                ].join(' '),
              }}
              onClick={() => setMenuOpen(false)}
            >
              <span className="flex items-center gap-2 font-semibold">
                <Icon size={18} />
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>

      {menuOpen ? (
        <nav className="absolute left-0 right-0 top-full flex flex-col bg-[#193b19] shadow-lg md:hidden">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 border-t border-white/10 px-6 py-4 font-semibold text-white hover:bg-white/10"
              >
                <Icon size={18} />
                {item.label}
              </Link>
            )
          })}
        </nav>
      ) : null}
    </header>
  )
}
