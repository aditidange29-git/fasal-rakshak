import PillNav from './PillNav'

const NAV_ITEMS = [
  { key: 'home',      label: 'Home' },
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'register',  label: 'Register' },
  { key: 'about',     label: 'About' },
]

function LeafLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a8d95a" strokeWidth="2"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
    </svg>
  )
}

export default function NavBar({ view, setView }) {
  return (
    <header className="navbar">
      <button className="navbar-brand" onClick={() => setView('home')} aria-label="Go to home">
        <span className="navbar-logo-icon">
          <LeafLogo />
        </span>
        <span className="navbar-name">Fasal-Rakshak</span>
        <span className="navbar-tagline">The Call Before the Damage</span>
      </button>

      <PillNav
        items={NAV_ITEMS}
        activeKey={view}
        onSelect={setView}
        baseColor="rgba(255,255,255,0.08)"
        pillColor="#a8d95a"
        pillTextColor="#0a1a0d"
        hoveredPillTextColor="#0a1a0d"
        ease="power3.out"
      />
    </header>
  )
}
