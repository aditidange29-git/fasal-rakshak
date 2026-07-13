import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import NavBar from './components/NavBar'
import Dashboard from './components/Dashboard'
import RegistrationForm from './components/RegistrationForm'
import AlertSimulation from './components/AlertSimulation'
import About from './components/About'
import { pageVariants, hoverScale } from './lib/animations'
import './styles.css'

function Home({ setView }) {
  return (
    <motion.div className="home" variants={pageVariants} initial="hidden" animate="visible">
      <div className="home-hero">
        <h1 className="home-title">🌾 Fasal-Rakshak</h1>
        <p className="home-tagline">"The Call Before the Damage"</p>
        <p className="home-desc">
          Real-time pink bollworm risk prediction for cotton farmers in Vidarbha —
          delivered as a spoken Hindi alert, directly to a basic phone, before the
          damage starts.
        </p>
        <div className="home-cta">
          <motion.button
            className="btn-primary btn-lg"
            whileHover={hoverScale}
            whileTap={{ scale: 0.97 }}
            onClick={() => setView('dashboard')}
          >
            View Dashboard
          </motion.button>
          <motion.button
            className="btn-secondary btn-lg"
            whileHover={hoverScale}
            whileTap={{ scale: 0.97 }}
            onClick={() => setView('register')}
          >
            Register a Farmer
          </motion.button>
        </div>
      </div>

      <div className="home-cards">
        {[
          { icon: '📡', title: 'Live Weather Data',    body: '30 days of real temperature data from Open-Meteo, no API key required.' },
          { icon: '🧮', title: 'GDD Science',          body: 'Published entomological thresholds — 504 degree-days predicts peak bollworm emergence.' },
          { icon: '📞', title: 'Voice Alert in Hindi', body: 'AI-phrased spoken alert auto-played to the farmer — no app, no literacy required.' },
        ].map(({ icon, title, body }) => (
          <motion.div key={title} className="home-card" whileHover={{ scale: 1.02, boxShadow: '0 6px 20px rgba(30,77,15,0.14)' }}>
            <span className="home-card-icon">{icon}</span>
            <h3>{title}</h3>
            <p>{body}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

export default function App() {
  const [view, setView] = useState('home')
  const [selectedFarmer, setSelectedFarmer] = useState(null)

  const handleSelectFarmer = (farmer) => setSelectedFarmer(farmer)

  const handleBack = () => {
    setSelectedFarmer(null)
    setView('dashboard')
  }

  return (
    <div className="app">
      <NavBar view={view} setView={(v) => { setSelectedFarmer(null); setView(v) }} />

      <main className="main-content">
        <AnimatePresence mode="wait">
          {selectedFarmer ? (
            <motion.div
              key="farmer-detail"
              className="farmer-detail"
              variants={pageVariants} initial="hidden" animate="visible"
            >
              <motion.button
                className="btn-back"
                onClick={handleBack}
                whileHover={{ x: -3 }}
              >
                ← Back to Dashboard
              </motion.button>
              <div className="farmer-detail-header">
                <h2>{selectedFarmer.farmer_name}</h2>
                <span className="farmer-detail-meta">
                  {selectedFarmer.village}, {selectedFarmer.district} · {selectedFarmer.acreage} acres
                </span>
              </div>
              <AlertSimulation farmer={selectedFarmer} />
            </motion.div>
          ) : (
            <motion.div key={view} variants={pageVariants} initial="hidden" animate="visible">
              {view === 'home'      && <Home setView={setView} />}
              {view === 'dashboard' && <Dashboard onSelectFarmer={handleSelectFarmer} />}
              {view === 'register'  && <RegistrationForm onRegistered={() => setView('dashboard')} />}
              {view === 'about'     && <About />}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
