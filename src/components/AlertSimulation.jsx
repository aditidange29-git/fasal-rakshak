import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../supabase'
import { calculateAccumulatedRisk, PBW_RISK_THRESHOLD_GDD } from '../lib/gdd'
import { calculateCosts } from '../lib/costCalculator'
import { generateAlertMessage } from '../lib/geminiClient'
import { fetchDailyWeather } from '../lib/weatherClient'
import GddChart from './GddChart'
import TiltedCard from './TiltedCard'

/* ── Call-screen icons ────────────────────────────────────────────── */
function Mic()       { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22"><rect x="9" y="2" width="6" height="11" rx="3"/><path d="M5 10a7 7 0 0 0 14 0"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg> }
function Keypad()    { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22"><circle cx="5" cy="5" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="5" r="1.5" fill="currentColor" stroke="none"/><circle cx="19" cy="5" r="1.5" fill="currentColor" stroke="none"/><circle cx="5" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="5" cy="19" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="19" r="1.5" fill="currentColor" stroke="none"/><circle cx="19" cy="19" r="1.5" fill="currentColor" stroke="none"/></svg> }
function Speaker()   { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg> }
function Add()       { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> }
function Bluetooth() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22"><polyline points="6.5 6.5 17.5 17.5 12 23 12 1 17.5 6.5 6.5 17.5"/></svg> }
function EndCall()   { return <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C9.6 21 3 14.4 3 6c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" transform="rotate(135 12 12)"/></svg> }
function MapPin()    { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> }
function Message()   { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> }
function Refresh()   { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.5"/></svg> }
function PhoneIcon() { return <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C9.6 21 3 14.4 3 6c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/></svg> }
function CheckCircle() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> }

/* ── Status bar ───────────────────────────────────────────────────── */
function Signal()  { return <svg viewBox="0 0 24 24" fill="white" width="14" height="14"><rect x="2" y="14" width="4" height="7" rx="1"/><rect x="8" y="10" width="4" height="11" rx="1"/><rect x="14" y="6" width="4" height="15" rx="1"/><rect x="20" y="2" width="4" height="19" rx="1"/></svg> }
function Wifi()    { return <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" width="14" height="14"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="20" r="1" fill="white"/></svg> }
function Battery() { return <svg viewBox="0 0 28 14" fill="none" width="22" height="12"><rect x="0.5" y="0.5" width="23" height="13" rx="2.5" stroke="white" strokeWidth="1.2"/><rect x="2" y="2" width="18" height="10" rx="1.5" fill="white"/><path d="M25 4.5v5a2 2 0 0 0 0-5z" fill="white"/></svg> }

/* ── Waveform ─────────────────────────────────────────────────────── */
const L_HEIGHTS = [4,6,10,14,20,26,20,14,10,7,12,18,10,6]
const R_HEIGHTS = [6,10,7,12,18,24,18,12,8,14,20,14,8,5]
function Waveform({ side, active }) {
  const heights = side === 'left' ? L_HEIGHTS : R_HEIGHTS
  return (
    <div className={`call-waveform call-waveform-${side}`}>
      {heights.map((h, i) => (
        <span key={i} className={`wave-bar ${active ? 'wave-active' : ''}`}
              style={{ height: `${h}px`, animationDelay: `${i * 0.07}s` }} />
      ))}
    </div>
  )
}

/* ── Caller avatar ────────────────────────────────────────────────── */
function CallerAvatar() {
  return (
    <svg viewBox="0 0 80 80" width="60" height="60">
      <circle cx="40" cy="40" r="40" fill="#1a4020"/>
      <path d="M40 60 Q36 44 34 30 Q32 16 40 8" stroke="#6dd934" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <path d="M38 38 Q22 28 20 12 Q34 14 38 32Z" fill="#4aab20" opacity="0.9"/>
      <path d="M38 32 Q54 22 52 6 Q38 10 37 28Z" fill="#5cc42a" opacity="0.9"/>
    </svg>
  )
}

/* ── Shops ────────────────────────────────────────────────────────── */
const SHOPS = [
  { name: 'Kisaan Agro Store',      dist: '0.8 km' },
  { name: 'Shivaji Fertilizers',    dist: '1.2 km' },
  { name: 'Green Field Agro',       dist: '1.9 km' },
  { name: 'Vidarbha Krishi Kendra', dist: '2.3 km' },
]

/* ── Main component ───────────────────────────────────────────────── */
export default function AlertSimulation({ farmer }) {
  const [stage, setStage]         = useState('idle')
  const [message, setMessage]     = useState('')
  const [riskInfo, setRiskInfo]   = useState(null)
  const [speaking, setSpeaking]   = useState(false)
  const [loadingCall, setLoadingCall] = useState(false)
  const autoStarted = useRef(false)

  // ── Logic identical to original ──────────────────────────────────
  useEffect(() => {
    if (autoStarted.current) return
    autoStarted.current = true
    checkAndAutoStart()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => { if (window.speechSynthesis) window.speechSynthesis.cancel() }
  }, [])

  async function checkAndAutoStart() {
    try {
      const weather = await fetchDailyWeather(farmer.lat, farmer.lng, 30)
      const risk    = calculateAccumulatedRisk(weather)
      const costs   = calculateCosts(farmer.acreage)
      const pct     = (risk.accumulatedGDD / PBW_RISK_THRESHOLD_GDD) * 100
      setRiskInfo({ ...risk, ...costs, weather })
      if (pct >= 60) await launchCall(risk, costs, weather)
    } catch (err) { console.error('Auto-check failed:', err) }
  }

  function speakMessage(text) {
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = 'hi-IN'; utter.rate = 0.9; utter.volume = 1.0
    const voices = window.speechSynthesis.getVoices()
    const hi = voices.find(v => v.lang === 'hi-IN' || v.lang.startsWith('hi'))
    if (hi) utter.voice = hi
    utter.onend = () => setSpeaking(false)
    window.speechSynthesis.speak(utter)
  }

  async function launchCall(risk, costs) {
    setStage('calling'); setLoadingCall(false)
    const alertText = await generateAlertMessage({
      farmerName: farmer.farmer_name, village: farmer.village,
      acreage: farmer.acreage, daysUntilRisk: risk.daysUntilRisk ?? 'a few',
      gddValue: risk.accumulatedGDD, language: 'Hindi',
      actionCost: costs.actionCost,
      inactionCostLow: costs.inactionCostLow, inactionCostHigh: costs.inactionCostHigh,
    })
    setMessage(alertText); setStage('call-active')
    setSpeaking(true); speakMessage(alertText)
    supabase.from('alerts').insert({
      farmer_id: farmer.id, farmer_name: farmer.farmer_name,
      accumulated_gdd: risk.accumulatedGDD, risk_level: risk.riskLevel,
      action_cost: costs.actionCost,
      inaction_cost_low: costs.inactionCostLow, inaction_cost_high: costs.inactionCostHigh,
      alert_message: alertText,
    })
  }

  async function startCallManually() {
    setLoadingCall(true)
    try {
      const weather = await fetchDailyWeather(farmer.lat, farmer.lng, 30)
      const risk    = calculateAccumulatedRisk(weather)
      const costs   = calculateCosts(farmer.acreage)
      setRiskInfo({ ...risk, ...costs, weather })
      await launchCall(risk, costs, weather)
    } catch (err) {
      console.error('Call failed:', err); setLoadingCall(false); setStage('idle')
    }
  }

  function handleEndCall() {
    setSpeaking(false)
    if (window.speechSynthesis) window.speechSynthesis.cancel()
    setStage('sms')
  }

  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="alert-simulation">

      {/* ── Idle ── */}
      {stage === 'idle' && (
        <div className="sim-idle">
          <p className="sim-idle-hint">
            Click below to fetch live weather, calculate GDD risk, and simulate the alert call.
          </p>
          <motion.button
            className="btn-primary btn-lg"
            whileHover={{ scale: 1.03, boxShadow: '0 6px 28px rgba(168,217,90,0.5)' }}
            whileTap={{ scale: 0.97 }}
            onClick={startCallManually}
            disabled={loadingCall}
          >
            {loadingCall
              ? <><span className="spinner spinner-sm" aria-hidden="true" /> Fetching weather…</>
              : <><PhoneIcon /> Simulate Alert Call</>}
          </motion.button>
        </div>
      )}

      {/* ── Call overlay ── */}
      {(stage === 'calling' || stage === 'call-active') && (
        <div className="call-overlay">
          <div className="call-overlay-bg" />
          <div className="call-overlay-grid" />

          {/* Status bar */}
          <div className="call-statusbar">
            <span className="call-statusbar-time">{now}</span>
            <div className="call-statusbar-icons">
              <Signal /><Wifi />
              <span style={{ fontSize: 11, color: 'white', fontWeight: 700 }}>80%</span>
              <Battery />
            </div>
          </div>

          {/* Incoming label */}
          <div className="call-incoming-label">
            <span className="call-incoming-dot" />
            Incoming call…
          </div>

          {/* Name */}
          <div className="call-identity">
            <div className="call-name">Fasal Rakshak</div>
            <div className="call-subtitle">AI Farm Assistant</div>
          </div>

          {/* Avatar + waveform */}
          <div className="call-avatar-wrap">
            <Waveform side="left" active={speaking} />
            <div className={`call-avatar-ring ${speaking ? 'glow' : ''}`}>
              <CallerAvatar />
            </div>
            <Waveform side="right" active={speaking} />
          </div>

          {/* Message */}
          <div className="call-message-area">
            {stage === 'calling' ? (
              <>
                <p className="call-connected">
                  <span style={{ color: '#a8d95a', fontWeight: 700 }}>Fasal Rakshak</span> is connecting…
                </p>
                <p className="call-tagline">Generating your personalised<br />Hindi farm alert…</p>
              </>
            ) : (
              <>
                <p className="call-connected">
                  <span style={{ color: '#a8d95a', fontWeight: 700 }}>Fasal Rakshak</span> is speaking
                </p>
                <p className="call-msg-text">{message}</p>
              </>
            )}
          </div>

          {/* Controls */}
          <div className="call-btn-row">
            {[{ Icon: Mic, label: 'Mute' }, { Icon: Keypad, label: 'Keypad' }, { Icon: Speaker, label: 'Speaker' }].map(({ Icon, label }) => (
              <div key={label} className="call-btn-wrap">
                <button className="call-ctrl-btn" disabled aria-label={label}><Icon /></button>
                <span className="call-btn-label">{label}</span>
              </div>
            ))}
          </div>
          <div className="call-btn-row">
            <div className="call-btn-wrap">
              <button className="call-ctrl-btn" disabled aria-label="Add call"><Add /></button>
              <span className="call-btn-label">Add call</span>
            </div>
            <div className="call-btn-wrap">
              <button className="call-ctrl-btn call-end-btn" onClick={handleEndCall} aria-label="End call"><EndCall /></button>
              <span className="call-btn-label">End Call</span>
            </div>
            <div className="call-btn-wrap">
              <button className="call-ctrl-btn" disabled aria-label="Bluetooth"><Bluetooth /></button>
              <span className="call-btn-label">Bluetooth</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Post-call ── */}
      {(stage === 'sms' || stage === 'done') && (
        <motion.div
          className="post-call-content"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Success status */}
          <div className="post-call-header">
            <div className="post-call-check"><CheckCircle /></div>
            <div>
              <div className="post-call-status-title">Alert delivered successfully</div>
              <div className="post-call-status-sub">Voice played · SMS backup sent · Alert logged to Supabase</div>
            </div>
          </div>

          {/* SMS + Map tilted cards */}
          <div className="tilted-cards-row">
            <div className="tilted-card-slot">
              <TiltedCard
                containerWidth="100%" containerHeight="290px"
                imageWidth="250px" imageHeight="250px"
                scaleOnHover={1.08} rotateAmplitude={12}
                showMobileWarning={false} showTooltip={true}
                captionText="SMS Alert sent"
                displayOverlayContent={true}
                imageSrc="data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='250' height='250'%3E%3Crect width='250' height='250' rx='16' fill='%230d2818'/%3E%3Crect x='18' y='18' width='214' height='214' rx='12' fill='%23132a1a'/%3E%3Ccircle cx='125' cy='72' r='30' fill='%231e5c18'/%3E%3Crect x='38' y='118' width='174' height='12' rx='6' fill='%23234d28'/%3E%3Crect x='52' y='138' width='146' height='9' rx='4.5' fill='%231a3d1e'/%3E%3Crect x='64' y='155' width='122' height='9' rx='4.5' fill='%231a3d1e'/%3E%3Ctext x='125' y='215' text-anchor='middle' font-size='10' fill='%23a8d95a' font-family='sans-serif'%3ESMS Delivered%3C/text%3E%3C/svg%3E"
                altText="SMS Alert"
                overlayContent={
                  <div className="tc-sms-overlay">
                    <div className="tc-sms-header">
                      <span className="tc-app-icon-wrap"><Message /></span>
                      <span className="tc-app-name">Fasal-Rakshak</span>
                      <span className="tc-time">{now}</span>
                    </div>
                    <div className="tc-sms-bubble">
                      <p className="tc-sms-text">{message}</p>
                    </div>
                  </div>
                }
              />
              <p className="tilted-card-label">SMS Backup Sent</p>
            </div>

            <div className="tilted-card-slot">
              <TiltedCard
                containerWidth="100%" containerHeight="290px"
                imageWidth="250px" imageHeight="250px"
                scaleOnHover={1.08} rotateAmplitude={12}
                showMobileWarning={false} showTooltip={true}
                captionText="Nearby agri shops"
                displayOverlayContent={true}
                imageSrc="data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='250' height='250'%3E%3Crect width='250' height='250' rx='16' fill='%23e8f0d8'/%3E%3Crect width='250' height='250' rx='16' fill='%23d4e8b0' opacity='0.5'/%3E%3Cline x1='0' y1='125' x2='250' y2='125' stroke='%23c8b87a' strokeWidth='2'/%3E%3Cline x1='125' y1='0' x2='125' y2='250' stroke='%23c8b87a' strokeWidth='2'/%3E%3Ccircle cx='125' cy='125' r='7' fill='%231e7e34'/%3E%3Ccircle cx='120' cy='95' r='6' fill='%23e53935'/%3E%3Ccircle cx='155' cy='130' r='6' fill='%23e53935'/%3E%3Ccircle cx='88' cy='145' r='6' fill='%23e53935'/%3E%3C/svg%3E"
                altText="Nearby shops map"
                overlayContent={
                  <div className="tc-map-overlay">
                    <p className="tc-map-title">Nearby Agri Shops</p>
                    <ul className="tc-shop-list">
                      {SHOPS.map((s, i) => (
                        <li key={i}>
                          <span className="tc-shop-pin"><MapPin /></span>
                          <span>{s.name}</span>
                          <span className="tc-shop-dist">{s.dist}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                }
              />
              <p className="tilted-card-label">Nearby Fertilizer Shops</p>
            </div>
          </div>

          {/* GDD Chart */}
          {riskInfo?.dailyLog && <GddChart dailyLog={riskInfo.dailyLog} />}

          {/* Risk breakdown */}
          {riskInfo && (
            <div className="risk-debug">
              <h4>Risk Calculation — demo transparency</h4>
              <ul>
                <li>Accumulated GDD: <strong>{riskInfo.accumulatedGDD}</strong> / 504</li>
                <li>Risk level: <strong>{riskInfo.riskLevel}</strong></li>
                <li>Days until risk: <strong>{riskInfo.daysUntilRisk ?? 'threshold already reached'}</strong></li>
                <li>Spray cost: <strong>₹{riskInfo.actionCost}</strong></li>
                <li>Potential loss: <strong>₹{riskInfo.inactionCostLow} – ₹{riskInfo.inactionCostHigh}</strong></li>
              </ul>
            </div>
          )}

          {/* Run again */}
          <button className="recheck-link" onClick={() => {
            autoStarted.current = false
            setStage('idle'); setMessage(''); setRiskInfo(null)
          }}>
            <Refresh /> Run again
          </button>
        </motion.div>
      )}

    </div>
  )
}
