import PillNav from './PillNav'

const NAV_ITEMS = [
  { key: 'home',      label: 'Home' },
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'register',  label: 'Register Farmer' },
  { key: 'about',     label: 'About' },
]

export default function NavBar({ view, setView }) {
  return (
    <header className="navbar">
      {/* Brand — unchanged */}
      <button className="navbar-brand" onClick={() => setView('home')}>
        <span className="navbar-logo">🌾</span>
        <span className="navbar-name">Fasal-Rakshak</span>
        <span className="navbar-tagline">"The Call Before the Damage"</span>
      </button>

      {/* PillNav replaces the old button list */}
      <PillNav
        items={NAV_ITEMS}
        activeKey={view}
        onSelect={setView}
        baseColor="#000000"
        pillColor="#ffffff"
        pillTextColor="#000000"
        hoveredPillTextColor="#ffffff"
        ease="power3.out"
      />
    </header>
  )
}
