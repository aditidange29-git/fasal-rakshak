import { useState } from 'react'
import RegistrationForm from './components/RegistrationForm'
import Dashboard from './components/Dashboard'
import AlertSimulation from './components/AlertSimulation'
import './styles.css'

export default function App() {
  const [selectedFarmer, setSelectedFarmer] = useState(null)
  const [view, setView] = useState('dashboard') // dashboard | register

  return (
    <div className="app">
      <header>
        <h1>🌾 Fasal-Rakshak</h1>
        <p className="tagline">"The Call Before the Damage"</p>
        <nav>
          <button onClick={() => setView('dashboard')}>Dashboard</button>
          <button onClick={() => setView('register')}>Register Farmer</button>
        </nav>
      </header>

      <main>
        {view === 'register' && (
          <RegistrationForm onRegistered={() => setView('dashboard')} />
        )}

        {view === 'dashboard' && !selectedFarmer && (
          <Dashboard onSelectFarmer={setSelectedFarmer} />
        )}

        {selectedFarmer && (
          <div>
            <button onClick={() => setSelectedFarmer(null)}>← Back to dashboard</button>
            <h2>{selectedFarmer.farmerName} — {selectedFarmer.village}</h2>
            <AlertSimulation farmer={selectedFarmer} />
          </div>
        )}
      </main>
    </div>
  )
}
