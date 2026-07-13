import { useState } from 'react'

export default function NavBar({ view, setView }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const nav = (target) => {
    setView(target)
    setMenuOpen(false)
  }

  return (
    <header className="navbar">
      {/* Brand */}
      <button className="navbar-brand" onClick={() => nav('home')}>
        <span className="navbar-logo">🌾</span>
        <span className="navbar-name">Fasal-Rakshak</span>
        <span className="navbar-tagline">"The Call Before the Damage"</span>
      </button>

      {/* Desktop links */}
      <nav className="navbar-links" aria-label="Main navigation">
        {[
          { key: 'home',      label: 'Home' },
          { key: 'dashboard', label: 'Dashboard' },
          { key: 'register',  label: 'Register Farmer' },
          { key: 'about',     label: 'About' },
        ].map(({ key, label }) => (
          <button
            key={key}
            className={`navbar-link${view === key ? ' active' : ''}`}
            onClick={() => nav(key)}
          >
            {label}
          </button>
        ))}
      </nav>

      {/* Hamburger button — visible only on mobile */}
      <button
        className={`hamburger${menuOpen ? ' open' : ''}`}
        aria-label="Toggle menu"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((o) => !o)}
      >
        <span /><span /><span />
      </button>

      {/* Mobile drawer */}
      {menuOpen && (
        <nav className="navbar-drawer" aria-label="Mobile navigation">
          {[
            { key: 'home',      label: 'Home' },
            { key: 'dashboard', label: 'Dashboard' },
            { key: 'register',  label: 'Register Farmer' },
            { key: 'about',     label: 'About' },
          ].map(({ key, label }) => (
            <button
              key={key}
              className={`drawer-link${view === key ? ' active' : ''}`}
              onClick={() => nav(key)}
            >
              {label}
            </button>
          ))}
        </nav>
      )}
    </header>
  )
}
