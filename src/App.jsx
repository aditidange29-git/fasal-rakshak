import { useState, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import NavBar from './components/NavBar'
import Dashboard from './components/Dashboard'
import RegistrationForm from './components/RegistrationForm'
import AlertSimulation from './components/AlertSimulation'
import About from './components/About'
import CountUp from './components/CountUp'
import { pageVariants } from './lib/animations'
import './styles.css'

/* ── Page-transition wrapper ─────────────────────────────────────── */
function Page({ children }) {
  return (
    <motion.div variants={pageVariants} initial="hidden" animate="visible" exit={{ opacity: 0, y: -10, transition: { duration: 0.18 } }}>
      {children}
    </motion.div>
  )
}

/* ── Reveal on scroll ────────────────────────────────────────────── */
function Reveal({ children, delay = 0, className = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ── SVG Icons ───────────────────────────────────────────────────── */
function IconCloud()   { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9z"/></svg> }
function IconFlask()   { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3h6M9 3v8l-4 9h14l-4-9V3"/></svg> }
function IconPhone()   { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.9 1.27h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9a16 16 0 0 0 6.29 6.29l1.8-1.8a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg> }
function IconShield()  { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> }
function IconChevronDown() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg> }
function IconArrowLeft() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg> }
function IconUser()    { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> }
function IconMapPin()  { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> }
function IconLayers()  { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg> }

/* ── GDD Meter (visual element for story section) ────────────────── */
function GddMeterDemo() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })
  const pct = 73
  return (
    <div ref={ref} className="story-visual">
      <div className="gdd-meter-wrap">
        <div className="gdd-meter-header">
          <span className="gdd-meter-title">Accumulated Degree-Days</span>
          <motion.span
            className="gdd-meter-value"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.4 }}
          >
            {inView ? <CountUp target={368} duration={1400} suffix=" GDD" /> : '0 GDD'}
          </motion.span>
        </div>
        <div className="gdd-meter-track">
          <motion.div
            className="gdd-meter-fill"
            initial={{ width: 0 }}
            animate={inView ? { width: `${pct}%` } : {}}
            transition={{ duration: 1.4, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
        <div className="gdd-meter-labels">
          <span className="gdd-meter-label">Sowing date</span>
          <span className="gdd-meter-label" style={{ color: '#f97316' }}>Risk threshold: 504</span>
        </div>
        <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div className="risk-pill risk-pill-moderate">
            <span className="risk-pill-dot" />
            Moderate Risk
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--stone-400)' }}>~4 days to threshold</span>
        </div>
      </div>
    </div>
  )
}

/* ── Cost Comparison Demo ─────────────────────────────────────────── */
function CostDemo() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })
  return (
    <div ref={ref} className="story-visual">
      <p style={{ fontSize: '0.8rem', color: 'var(--stone-400)', marginBottom: '1rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Yavatmal · 3.5 acre cotton farm</p>
      <div className="cost-compare">
        <div className="cost-card cost-card-action">
          <p className="cost-card-label">Act Now</p>
          <p className="cost-card-amount">
            ₹{inView ? <CountUp target={525} duration={900} /> : '0'}
          </p>
          <p className="cost-card-desc">Spray cost for 3.5 acres</p>
        </div>
        <div className="cost-card cost-card-inaction">
          <p className="cost-card-label">Do Nothing</p>
          <p className="cost-card-amount">
            ₹{inView ? <CountUp target={25200} duration={1100} /> : '0'}+
          </p>
          <p className="cost-card-desc">Potential crop loss (20–50%)</p>
        </div>
      </div>
      <p style={{ fontSize: '0.78rem', color: 'var(--stone-500)', marginTop: '0.85rem', lineHeight: 1.5 }}>
        Based on ₹36,000/acre cultivation cost and published pink bollworm yield-loss data.
      </p>
    </div>
  )
}

/* ── Hindi Alert Demo ─────────────────────────────────────────────── */
function AlertDemo() {
  return (
    <div className="story-visual">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'radial-gradient(circle, var(--green-700), var(--green-900))', border: '1px solid rgba(168,217,90,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg viewBox="0 0 80 80" width="24" height="24"><circle cx="40" cy="40" r="40" fill="#1a4020"/><path d="M40 60 Q36 44 34 30 Q32 16 40 8" stroke="#6dd934" strokeWidth="3" fill="none" strokeLinecap="round"/><path d="M38 38 Q22 28 20 12 Q34 14 38 32Z" fill="#4aab20" opacity="0.9"/><path d="M38 32 Q54 22 52 6 Q38 10 37 28Z" fill="#5cc42a" opacity="0.9"/></svg>
        </div>
        <div>
          <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'white', margin: 0 }}>Fasal Rakshak</p>
          <p style={{ fontSize: '0.72rem', color: 'var(--stone-500)', margin: 0 }}>AI Farm Assistant · Incoming call</p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
          {[...Array(3)].map((_,i) => (
            <div key={i} style={{ width: 3, height: `${8 + i*5}px`, background: 'var(--leaf-400)', borderRadius: 2, opacity: 0.7, animation: `wave-beat 0.85s ease-in-out ${i*0.15}s infinite alternate` }} />
          ))}
        </div>
      </div>
      <div style={{ background: 'rgba(168,217,90,0.07)', border: '1px solid rgba(168,217,90,0.15)', borderRadius: 'var(--radius-md)', padding: '0.85rem 1rem' }}>
        <p style={{ fontSize: '0.88rem', color: 'var(--stone-100)', lineHeight: 1.7, margin: 0, fontStyle: 'italic' }}>
          "Ramesh ji, aapke 3.5 acre cotton mein 4 din mein bollworm ka khatra hai. Abhi ₹525 ka spray karein, warna ₹7,200 se ₹18,000 tak ka nuksan hoga."
        </p>
      </div>
      <p style={{ fontSize: '0.72rem', color: 'var(--stone-500)', marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        Simulated — real delivery requires TRAI DLT registration
      </p>
    </div>
  )
}

/* ── Home (Landing) ──────────────────────────────────────────────── */
function Home({ setView }) {
  const statsRef = useRef(null)
  const statsInView = useInView(statsRef, { once: true, margin: '-80px' })

  const features = [
    { icon: <IconCloud />,   title: 'Live Weather',       body: '30 days of real temperature data from Open-Meteo, no key needed.' },
    { icon: <IconFlask />,   title: 'GDD Science',        body: 'Published entomology: 504 degree-days predicts peak bollworm emergence.' },
    { icon: <IconPhone />,   title: 'Hindi Voice Alert',  body: 'AI-phrased spoken alert to a basic phone — no app, no literacy required.' },
    { icon: <IconShield />,  title: 'Early Warning',      body: '2–5 days earlier than manual field scouting trap networks.' },
  ]

  return (
    <div className="home">

      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-aurora" />
        <div className="hero-grid" />

        <div className="hero-content">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            <div className="hero-badge">
              <span className="hero-badge-dot" />
              Pink Bollworm Risk Intelligence · Vidarbha
            </div>
          </motion.div>

          <motion.h1
            className="hero-title"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            The Call Before<br />
            <span className="hero-title-accent">the Damage</span>
          </motion.h1>

          <motion.p
            className="hero-subtitle"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.32 }}
          >
            Fasal-Rakshak — AI-powered pest protection for India's cotton farmers
          </motion.p>

          <motion.p
            className="hero-desc"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.42 }}
          >
            Real-time weather analysis, degree-day entomology, and Gemini AI combine to
            deliver a spoken Hindi alert before pink bollworm strikes your cotton fields.
          </motion.p>

          <motion.div
            className="hero-cta"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.52 }}
          >
            <motion.button
              className="btn-primary btn-lg"
              whileHover={{ scale: 1.03, boxShadow: '0 6px 28px rgba(168,217,90,0.55)' }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setView('dashboard')}
            >
              View Dashboard
            </motion.button>
            <motion.button
              className="btn-secondary btn-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setView('register')}
            >
              Register a Farmer
            </motion.button>
          </motion.div>

          <motion.div
            ref={statsRef}
            className="hero-stats"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            {[
              { value: 504, suffix: ' GDD',   label: 'Emergence threshold' },
              { value: 30,  suffix: ' days',  label: 'Weather lookback' },
              { value: 5,   suffix: ' dist.', label: 'Vidarbha districts' },
            ].map(({ value, suffix, label }) => (
              <div key={label} className="hero-stat">
                <div className="hero-stat-value">
                  {statsInView ? <CountUp target={value} duration={900} suffix={suffix} /> : `0${suffix}`}
                </div>
                <div className="hero-stat-label">{label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        <div className="hero-scroll-hint">
          <span>Scroll to explore</span>
          <IconChevronDown />
        </div>
      </section>

      {/* ── Feature cards ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem' }}>
        <Reveal>
          <div className="feature-cards">
            {features.map(({ icon, title, body }, i) => (
              <motion.div
                key={title}
                className="feature-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                whileHover={{ y: -4, borderColor: 'rgba(168,217,90,0.25)' }}
              >
                <div className="feature-card-icon">{icon}</div>
                <h3>{title}</h3>
                <p>{body}</p>
              </motion.div>
            ))}
          </div>
        </Reveal>
      </div>

      <div className="section-divider" style={{ margin: '2rem 0' }} />

      {/* ── Story: Step 1 — Weather → GDD ── */}
      <section className="story-section">
        <Reveal>
          <div className="story-section-inner">
            <div>
              <div className="story-label">
                <div className="story-label-num">1</div>
                Weather Data
              </div>
              <h2 className="story-heading">30 days of real temperature, automatically</h2>
              <p className="story-body">
                Every time a farmer's risk is checked, Fasal-Rakshak fetches 30 days of
                real daily max/min temperatures from Open-Meteo — free, no API key, live
                data from the farmer's district coordinates in Vidarbha.
              </p>
              <p className="story-body" style={{ marginTop: '0.75rem' }}>
                Those temperatures are fed directly into the published Pink Bollworm
                degree-day model (base 13.4 °C, upper 35.5 °C) to accumulate GDD from
                sowing date.
              </p>
            </div>
            <GddMeterDemo />
          </div>
        </Reveal>
      </section>

      <div className="section-divider" />

      {/* ── Story: Step 2 — GDD → Cost ── */}
      <section className="story-section">
        <Reveal>
          <div className="story-section-inner reverse">
            <div>
              <div className="story-label">
                <div className="story-label-num">2</div>
                Risk Economics
              </div>
              <h2 className="story-heading">Spray ₹525. Or lose ₹25,000. The choice is clear.</h2>
              <p className="story-body">
                Once GDD accumulation crosses 60% of the 504-day threshold, Fasal-Rakshak
                calculates the real financial stakes using cited Vidarbha cultivation cost
                data: ₹36,000/acre investment, 20–50% documented yield loss if untreated.
              </p>
              <p className="story-body" style={{ marginTop: '0.75rem' }}>
                The numbers are personalised to each farmer's acreage — no generic averages.
              </p>
            </div>
            <CostDemo />
          </div>
        </Reveal>
      </section>

      <div className="section-divider" />

      {/* ── Story: Step 3 — Alert → Phone ── */}
      <section className="story-section">
        <Reveal>
          <div className="story-section-inner">
            <div>
              <div className="story-label">
                <div className="story-label-num">3</div>
                The Call
              </div>
              <h2 className="story-heading">A spoken Hindi warning, before the damage starts</h2>
              <p className="story-body">
                Google Gemini 2.0 Flash phrases the risk as a short, natural Hindi sentence —
                the farmer's name, their village, how many days remain, and exactly what it
                costs to act vs. ignore.
              </p>
              <p className="story-body" style={{ marginTop: '0.75rem' }}>
                It plays as a voice alert directly in the browser — simulating the outbound
                call that will reach a basic phone once TRAI DLT registration completes.
                No app. No internet. No literacy required.
              </p>
            </div>
            <AlertDemo />
          </div>
        </Reveal>
      </section>

    </div>
  )
}

/* ── Root App ────────────────────────────────────────────────────── */
export default function App() {
  const [view, setView] = useState('home')
  const [selectedFarmer, setSelectedFarmer] = useState(null)

  const handleSelectFarmer = (farmer) => setSelectedFarmer(farmer)
  const handleBack = () => { setSelectedFarmer(null); setView('dashboard') }

  return (
    <div className="app">
      <NavBar view={view} setView={(v) => { setSelectedFarmer(null); setView(v) }} />

      <main className="main-content">
        <AnimatePresence mode="wait">
          {selectedFarmer ? (
            <Page key="farmer-detail">
              <motion.button
                className="btn-back"
                onClick={handleBack}
                whileHover={{ x: -3 }}
              >
                <IconArrowLeft />
                Back to Dashboard
              </motion.button>

              {/* Farmer header card */}
              <div className="farmer-detail-card card">
                <div className="farmer-detail-avatar">
                  <IconUser />
                </div>
                <div>
                  <div className="farmer-detail-name">{selectedFarmer.farmer_name}</div>
                  <div className="farmer-detail-meta">
                    <span className="farmer-detail-meta-item">
                      <IconMapPin /> {selectedFarmer.village}, {selectedFarmer.district}
                    </span>
                    <span className="farmer-detail-meta-item">
                      <IconLayers /> {selectedFarmer.acreage} acres
                    </span>
                  </div>
                </div>
              </div>

              <AlertSimulation farmer={selectedFarmer} />
            </Page>
          ) : (
            <Page key={view}>
              {view === 'home'      && <Home setView={setView} />}
              {view === 'dashboard' && <Dashboard onSelectFarmer={handleSelectFarmer} />}
              {view === 'register'  && <RegistrationForm onRegistered={() => setView('dashboard')} />}
              {view === 'about'     && <About />}
            </Page>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
