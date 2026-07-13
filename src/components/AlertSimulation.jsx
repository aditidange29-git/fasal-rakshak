import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabase'
import { calculateAccumulatedRisk, PBW_RISK_THRESHOLD_GDD } from '../lib/gdd'
import { calculateCosts } from '../lib/costCalculator'
import { generateAlertMessage } from '../lib/geminiClient'
import { fetchDailyWeather } from '../lib/weatherClient'
import GddChart from './GddChart'
import TiltedCard from './TiltedCard'

/* ── SVG Icons ── */
function IconMic() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
         strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
      <line x1="1" y1="1" x2="23" y2="23"/>
      <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/>
      <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/>
      <line x1="12" y1="19" x2="12" y2="23"/>
      <line x1="8" y1="23" x2="16" y2="23"/>
    </svg>
  )
}
function IconKeypad() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
      {[[3,2],[9,2],[15,2],[3,8],[9,8],[15,8],[3,14],[9,14],[15,14],[9,20]].map(([cx,cy],i) => (
        <circle key={i} cx={cx+3} cy={cy} r="1.8"/>
      ))}
    </svg>
  )
}
function IconSpeaker() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
         strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
    </svg>
  )
}
function IconAdd() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
         strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  )
}
function IconEndCall() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="26" height="26">
      <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C9.6 21 3 14.4 3 6c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"
            transform="rotate(135 12 12)"/>
    </svg>
  )
}
function IconBluetooth() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
         strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
      <polyline points="6.5 6.5 17.5 17.5 12 23 12 1 17.5 6.5 6.5 17.5"/>
    </svg>
  )
}
function IconPhone() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13">
      <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C9.6 21 3 14.4 3 6c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/>
    </svg>
  )
}

/* ── Waveform ── */
const LEFT_HEIGHTS  = [4, 6, 10, 14, 20, 26, 20, 14, 10, 7, 12, 18, 10, 6]
const RIGHT_HEIGHTS = [6, 10, 7, 12, 18, 24, 18, 12, 8, 14, 20, 14, 8, 5]
function Waveform({ side, active }) {
  const heights = side === 'left' ? LEFT_HEIGHTS : RIGHT_HEIGHTS
  return (
    <div className={`call-waveform call-waveform-${side}`}>
      {heights.map((h, i) => (
        <span key={i} className={`wave-bar ${active ? 'wave-active' : ''}`}
              style={{ height: `${h}px`, animationDelay: `${i * 0.07}s` }} />
      ))}
    </div>
  )
}

/* ── Plant avatar ── */
function PlantAvatar() {
  return (
    <svg viewBox="0 0 120 120" width="80" height="80" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="60" cy="95" rx="28" ry="9" fill="#6b3a1f"/>
      <rect x="32" y="88" width="56" height="14" rx="4" fill="#7a4422"/>
      <path d="M60 88 Q58 72 55 58 Q52 44 60 34" stroke="#4a9420" strokeWidth="4" fill="none" strokeLinecap="round"/>
      <path d="M57 62 Q38 48 34 30 Q48 32 57 50Z" fill="#3a8c18"/>
      <path d="M57 55 Q76 42 80 24 Q66 28 58 46Z" fill="#4aab20"/>
      <path d="M59 44 Q44 32 46 16 Q58 22 60 38Z" fill="#5cc42a"/>
      <path d="M60 40 Q75 28 73 12 Q61 18 59 34Z" fill="#6dd934"/>
      <path d="M60 36 Q56 20 60 8 Q64 20 60 36Z" fill="#7ae840"/>
    </svg>
  )
}

/* ── Main component ── */
const SHOPS = [
  { name: 'Kisaan Agro Store',      dist: '0.8 km' },
  { name: 'Shivaji Fertilizers',    dist: '1.2 km' },
  { name: 'Green Field Agro',       dist: '1.9 km' },
  { name: 'Vidarbha Krishi Kendra', dist: '2.3 km' },
  { name: 'Balaji Agri Centre',     dist: '2.7 km' },
]
// stage: idle → calling → call-active → sms → done
export default function AlertSimulation({ farmer }) {
  const [stage, setStage]       = useState('idle')
  const [message, setMessage]   = useState('')
  const [riskInfo, setRiskInfo] = useState(null)
  const [speaking, setSpeaking] = useState(false)
  const [loadingCall, setLoadingCall] = useState(false)
  const autoStarted = useRef(false)

  // Auto-start if GDD is at/above 60% of threshold when page loads
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

      // Store risk info for later use
      setRiskInfo({ ...risk, ...costs, weather })

      if (pct >= 60) {
        // Risk is significant — auto-launch the call UI
        await launchCall(risk, costs, weather)
      }
      // else: low risk, stay on idle with the button
    } catch (err) {
      console.error('Auto-check failed:', err)
    }
  }

  function speakMessage(text) {
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang   = 'hi-IN'
    utter.rate   = 0.9
    utter.volume = 1.0
    const voices = window.speechSynthesis.getVoices()
    const hindiVoice = voices.find(v => v.lang === 'hi-IN' || v.lang.startsWith('hi'))
    if (hindiVoice) utter.voice = hindiVoice
    utter.onend = () => setSpeaking(false)
    window.speechSynthesis.speak(utter)
  }

  async function launchCall(risk, costs, weather) {
    setStage('calling')
    setLoadingCall(false)

    const alertText = await generateAlertMessage({
      farmerName:       farmer.farmer_name,
      village:          farmer.village,
      acreage:          farmer.acreage,
      daysUntilRisk:    risk.daysUntilRisk ?? 'a few',
      gddValue:         risk.accumulatedGDD,
      language:         'Hindi',
      actionCost:       costs.actionCost,
      inactionCostLow:  costs.inactionCostLow,
      inactionCostHigh: costs.inactionCostHigh,
    })
    setMessage(alertText)
    setStage('call-active')
    setSpeaking(true)
    speakMessage(alertText)

    supabase.from('alerts').insert({
      farmer_id:          farmer.id,
      farmer_name:        farmer.farmer_name,
      accumulated_gdd:    risk.accumulatedGDD,
      risk_level:         risk.riskLevel,
      action_cost:        costs.actionCost,
      inaction_cost_low:  costs.inactionCostLow,
      inaction_cost_high: costs.inactionCostHigh,
      alert_message:      alertText,
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
      console.error('Call failed:', err)
      setLoadingCall(false)
      setStage('idle')
    }
  }

  function handleEndCall() {
    setSpeaking(false)
    if (window.speechSynthesis) window.speechSynthesis.cancel()
    setStage('sms')
  }

  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="alert-simulation">

      {/* ── Idle: manual trigger button ── */}
      {stage === 'idle' && (
        <div className="sim-idle">
          <button className="btn-primary" onClick={startCallManually} disabled={loadingCall}>
            {loadingCall
              ? <><span className="spinner spinner-sm" /> Fetching weather…</>
              : '📞 Simulate Alert Call'}
          </button>
        </div>
      )}

      {/* ── Full-screen call overlay ── */}
      {(stage === 'calling' || stage === 'call-active') && (
        <div className="call-overlay">
          {/* Status bar */}
          <div className="call-statusbar">
            <span className="call-statusbar-time">{now}</span>
            <div className="call-statusbar-icons">
              <svg viewBox="0 0 24 24" fill="white" width="14" height="14">
                <rect x="2" y="14" width="4" height="7" rx="1"/>
                <rect x="8" y="10" width="4" height="11" rx="1"/>
                <rect x="14" y="6" width="4" height="15" rx="1"/>
                <rect x="20" y="2" width="4" height="19" rx="1"/>
              </svg>
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" width="14" height="14">
                <path d="M5 12.55a11 11 0 0 1 14.08 0"/>
                <path d="M1.42 9a16 16 0 0 1 21.16 0"/>
                <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
                <circle cx="12" cy="20" r="1" fill="white"/>
              </svg>
              <span style={{ fontSize:'12px', color:'white', fontWeight:600 }}>80%</span>
              <svg viewBox="0 0 28 14" fill="none" width="22" height="12">
                <rect x="0.5" y="0.5" width="23" height="13" rx="2.5" stroke="white" strokeWidth="1.2"/>
                <rect x="2" y="2" width="18" height="10" rx="1.5" fill="white"/>
                <path d="M25 4.5v5a2 2 0 0 0 0-5z" fill="white"/>
              </svg>
            </div>
          </div>

          <div className="call-status">
            <IconPhone />
            <span className="call-status-label">CALLING…</span>
          </div>

          <div className="call-identity">
            <div className="call-name">Fasal Rakshak 🌿</div>
            <div className="call-subtitle">AI Farm Assistant</div>
          </div>

          <div className="call-avatar-wrap">
            <Waveform side="left" active={speaking} />
            <div className={`call-avatar-ring ${speaking ? 'glow' : ''}`}>
              <PlantAvatar />
            </div>
            <Waveform side="right" active={speaking} />
          </div>

          <div className="call-message-area">
            {stage === 'calling' ? (
              <>
                <p className="call-connected">
                  <span style={{ color:'#a8d95a', fontWeight:700 }}>Fasal Rakshak</span> is calling…
                </p>
                <p className="call-tagline">Your smart farming companion<br/>is here to help you!</p>
              </>
            ) : (
              <>
                <p className="call-connected">
                  <span style={{ color:'#a8d95a', fontWeight:700 }}>Fasal Rakshak</span> is calling…
                </p>
                <p className="call-msg-text">{message}</p>
              </>
            )}
          </div>

          <div className="call-btn-row">
            {[{ Icon: IconMic, label:'Mute' }, { Icon: IconKeypad, label:'Keypad' }, { Icon: IconSpeaker, label:'Speaker' }]
              .map(({ Icon, label }) => (
                <div key={label} className="call-btn-wrap">
                  <button className="call-ctrl-btn" disabled aria-label={label}><Icon /></button>
                  <span className="call-btn-label">{label}</span>
                </div>
              ))}
          </div>

          <div className="call-btn-row">
            <div className="call-btn-wrap">
              <button className="call-ctrl-btn" disabled><IconAdd /></button>
              <span className="call-btn-label">Add call</span>
            </div>
            <div className="call-btn-wrap">
              <button className="call-ctrl-btn call-end-btn" onClick={handleEndCall} aria-label="End call">
                <IconEndCall />
              </button>
              <span className="call-btn-label">End Call</span>
            </div>
            <div className="call-btn-wrap">
              <button className="call-ctrl-btn" disabled><IconBluetooth /></button>
              <span className="call-btn-label">Bluetooth</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Post-call view: two tilted cards + GDD chart ── */}
      {(stage === 'sms' || stage === 'done') && (
        <div className="post-call-content">

          {/* Two tilted cards side by side */}
          <div className="tilted-cards-row">

            {/* SMS card */}
            <div className="tilted-card-slot">
              <TiltedCard
                containerWidth="100%"
                containerHeight="300px"
                imageWidth="260px"
                imageHeight="260px"
                scaleOnHover={1.08}
                rotateAmplitude={12}
                showMobileWarning={false}
                showTooltip={true}
                captionText="SMS Alert sent"
                displayOverlayContent={true}
                imageSrc="data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='260' height='260'%3E%3Crect width='260' height='260' rx='15' fill='%230d2818'/%3E%3Crect x='20' y='20' width='220' height='220' rx='12' fill='%23132a1a'/%3E%3Ccircle cx='130' cy='75' r='32' fill='%231e5c18'/%3E%3Ctext x='130' y='84' text-anchor='middle' font-size='28' fill='%234aab20'%3E%F0%9F%8C%BF%3C/text%3E%3Crect x='40' y='125' width='180' height='14' rx='7' fill='%23234d28'/%3E%3Crect x='55' y='148' width='150' height='10' rx='5' fill='%231a3d1e'/%3E%3Crect x='65' y='166' width='130' height='10' rx='5' fill='%231a3d1e'/%3E%3Crect x='75' y='184' width='110' height='10' rx='5' fill='%231a3d1e'/%3E%3Ctext x='130' y='222' text-anchor='middle' font-size='11' fill='%23a8d95a' font-family='sans-serif'%3ESMS Alert Delivered%3C/text%3E%3C/svg%3E"
                altText="SMS Alert"
                overlayContent={
                  <div className="tc-sms-overlay">
                    <div className="tc-sms-header">
                      <span className="tc-app-icon">🌿</span>
                      <span className="tc-app-name">Fasal-Rakshak</span>
                      <span className="tc-time">{now}</span>
                    </div>
                    <div className="tc-sms-bubble">
                      <p className="tc-sms-text">{message}</p>
                    </div>
                  </div>
                }
              />
              <p className="tilted-card-label">💬 SMS Backup Sent</p>
            </div>

            {/* Map card */}
            <div className="tilted-card-slot">
              <TiltedCard
                containerWidth="100%"
                containerHeight="300px"
                imageWidth="260px"
                imageHeight="260px"
                scaleOnHover={1.08}
                rotateAmplitude={12}
                showMobileWarning={false}
                showTooltip={true}
                captionText="Nearby shops — Amravati"
                displayOverlayContent={true}
                imageSrc="data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='260' height='260'%3E%3Crect width='260' height='260' rx='15' fill='%23e8f0d8'/%3E%3Crect x='0' y='0' width='260' height='260' rx='15' fill='%23d4e8b0' opacity='0.5'/%3E%3Cline x1='0' y1='130' x2='260' y2='130' stroke='%23c8b87a' stroke-width='3'/%3E%3Cline x1='130' y1='0' x2='130' y2='260' stroke='%23c8b87a' stroke-width='3'/%3E%3Cline x1='0' y1='65' x2='260' y2='195' stroke='%23c8b87a' stroke-width='1.5' stroke-dasharray='5,5'/%3E%3Cline x1='0' y1='195' x2='260' y2='65' stroke='%23c8b87a' stroke-width='1.5' stroke-dasharray='5,5'/%3E%3Ccircle cx='130' cy='130' r='18' fill='none' stroke='%23a0c060' stroke-width='1.5'/%3E%3Ccircle cx='130' cy='130' r='8' fill='%231e7e34'/%3E%3Ccircle cx='125' cy='99' r='6' fill='%23e53935'/%3E%3Ccircle cx='161' cy='135' r='6' fill='%23e53935'/%3E%3Ccircle cx='91' cy='151' r='6' fill='%23e53935'/%3E%3Ccircle cx='187' cy='78' r='6' fill='%23e53935'/%3E%3Ccircle cx='143' cy='182' r='6' fill='%23e53935'/%3E%3Ctext x='130' y='128' text-anchor='middle' font-size='9' fill='white' font-weight='bold'%3EYou%3C/text%3E%3Ctext x='8' y='14' font-size='8' fill='%23555' font-family='sans-serif'%3EAmravati District%3C/text%3E%3C/svg%3E"
                altText="Nearby shops map"
                overlayContent={
                  <div className="tc-map-overlay">
                    <p className="tc-map-title">📍 Nearby Agri Shops</p>
                    <ul className="tc-shop-list">
                      {SHOPS.slice(0, 3).map((s, i) => (
                        <li key={i}><span className="tc-shop-dot" />
                          <span>{s.name}</span>
                          <span className="tc-shop-dist">{s.dist}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                }
              />
              <p className="tilted-card-label">🗺️ Nearby Fertilizer Shops</p>
            </div>
          </div>

          {/* GDD Chart */}
          {riskInfo?.dailyLog && (
            <GddChart dailyLog={riskInfo.dailyLog} />
          )}

          {/* Risk numbers */}
          {riskInfo && (
            <div className="risk-debug">
              <h4>Risk Calculation — demo transparency</h4>
              <ul>
                <li>Accumulated GDD: <strong>{riskInfo.accumulatedGDD}</strong> / 504</li>
                <li>Risk level: <strong>{riskInfo.riskLevel}</strong></li>
                <li>Days until risk: {riskInfo.daysUntilRisk ?? 'threshold already reached'}</li>
                <li>Action cost: ₹{riskInfo.actionCost}</li>
                <li>Inaction cost: ₹{riskInfo.inactionCostLow} to ₹{riskInfo.inactionCostHigh}</li>
              </ul>
            </div>
          )}

          <button className="recheck-link" onClick={() => {
            autoStarted.current = false
            setStage('idle')
            setMessage('')
            setRiskInfo(null)
          }}>
            ↻ Run again
          </button>

        </div>
      )}

    </div>
  )
}
