import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { calculateAccumulatedRisk } from '../lib/gdd'
import { calculateCosts } from '../lib/costCalculator'
import { generateAlertMessage } from '../lib/geminiClient'
import { fetchDailyWeather } from '../lib/weatherClient'
import { supabase } from '../supabaseClient'
import { revealVariants, hoverScale } from '../lib/animations'
import GddChart from './GddChart'
import AlertHistory from './AlertHistory'
import CountUp from './CountUp'

// ---------------------------------------------------------------------------
// Number → Hindi words converter
// Converts all digit sequences in a string so the TTS engine reads them
// in Hindi instead of English (e.g. "2" → "दो", "450" → "चार सौ पचास").
// ---------------------------------------------------------------------------
const ONES = ['', 'एक', 'दो', 'तीन', 'चार', 'पांच', 'छह', 'सात', 'आठ', 'नौ',
              'दस', 'ग्यारह', 'बारह', 'तेरह', 'चौदह', 'पंद्रह', 'सोलह', 'सत्रह',
              'अठारह', 'उन्नीस']
const TENS = ['', '', 'बीस', 'तीस', 'चालीस', 'पचास', 'साठ', 'सत्तर', 'अस्सी', 'नब्बे']

function numToHindi(n) {
  if (n === 0) return 'शून्य'
  if (n < 0) return 'माइनस ' + numToHindi(-n)

  let result = ''

  if (n >= 10000000) {
    result += numToHindi(Math.floor(n / 10000000)) + ' करोड़ '
    n %= 10000000
  }
  if (n >= 100000) {
    result += numToHindi(Math.floor(n / 100000)) + ' लाख '
    n %= 100000
  }
  if (n >= 1000) {
    result += numToHindi(Math.floor(n / 1000)) + ' हज़ार '
    n %= 1000
  }
  if (n >= 100) {
    result += ONES[Math.floor(n / 100)] + ' सौ '
    n %= 100
  }
  if (n > 0) {
    if (n < 20) {
      result += ONES[n]
    } else {
      result += TENS[Math.floor(n / 10)]
      if (n % 10 !== 0) result += ' ' + ONES[n % 10]
    }
  }

  return result.trim()
}

// Replace every standalone number in a string with its Hindi word equivalent.
// Also replaces "Rs" / "Rs." currency prefix with "रुपये" so TTS reads it correctly.
function replaceNumbersWithHindi(text) {
  return text
    .replace(/Rs\.?\s*/g, 'रुपये ')           // "Rs 450" → "रुपये ..."
    .replace(/\d+/g, (match) => numToHindi(parseInt(match, 10)))
}

// ---------------------------------------------------------------------------
// Speech helper — speaks text using the browser Web Speech API.
// Prefers a Hindi (hi-IN) voice; falls back to whatever default is available.
// Returns a cancel() function so the caller can stop playback early.
// ---------------------------------------------------------------------------
function speak(text, onStart, onEnd) {
  if (!window.speechSynthesis) {
    onEnd?.()
    return () => {}
  }

  // Cancel anything already playing
  window.speechSynthesis.cancel()

  // Convert digit sequences to Hindi words so TTS reads them correctly
  // e.g. "2 din" → "दो din", "450" → "चार सौ पचास"
  // The display text (message state) keeps the original digits — only speech is converted.
  const spokenText = replaceNumbersWithHindi(text)

  const utter = new SpeechSynthesisUtterance(spokenText)
  utter.lang = 'hi-IN'
  utter.rate = 0.9   // slightly slower — easier for rural listeners
  utter.pitch = 1.0

  // Pick a Hindi voice if one is installed on this system
  const voices = window.speechSynthesis.getVoices()
  const hindiVoice = voices.find(
    (v) => v.lang === 'hi-IN' || v.lang.startsWith('hi')
  )
  if (hindiVoice) utter.voice = hindiVoice

  utter.onstart = () => onStart?.()
  utter.onend = () => onEnd?.()
  utter.onerror = () => onEnd?.()

  window.speechSynthesis.speak(utter)

  return () => window.speechSynthesis.cancel()
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function AlertSimulation({ farmer }) {
  const [stage, setStage] = useState('idle') // idle | loading | ringing | answered
  const [message, setMessage] = useState('')
  const [riskInfo, setRiskInfo] = useState(null)
  const [dailyLog, setDailyLog] = useState([])
  const [isSpeaking, setIsSpeaking] = useState(false)
  const cancelSpeech = useRef(null)

  // When stage flips to 'answered' and we have a message, speak it.
  useEffect(() => {
    if (stage !== 'answered' || !message) return

    // Voices may not be loaded yet on first render — wait a tick if needed
    const triggerSpeak = () => {
      cancelSpeech.current = speak(
        message,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false)
      )
    }

    if (window.speechSynthesis.getVoices().length === 0) {
      // Some browsers fire 'voiceschanged' before voices are available
      window.speechSynthesis.addEventListener('voiceschanged', triggerSpeak, { once: true })
    } else {
      triggerSpeak()
    }

    // Clean up if component unmounts mid-speech
    return () => {
      cancelSpeech.current?.()
      setIsSpeaking(false)
    }
  }, [stage, message])

  const runSimulation = async () => {
    // Stop any speech from a previous run
    cancelSpeech.current?.()
    setIsSpeaking(false)
    setStage('loading')

    try {
      const weather = await fetchDailyWeather(farmer.lat, farmer.lng, 30)
      const risk = calculateAccumulatedRisk(weather)
      const costs = calculateCosts(farmer.acreage)
      setRiskInfo({ ...risk, ...costs })
      setDailyLog(risk.dailyLog)

      const alertText = await generateAlertMessage({
        farmerName: farmer.farmer_name,
        village: farmer.village,
        acreage: farmer.acreage,
        daysUntilRisk: risk.daysUntilRisk ?? 'a few',
        gddValue: risk.accumulatedGDD,
        language: 'Hindi',
        actionCost: costs.actionCost,
        inactionCostLow: costs.inactionCostLow,
        inactionCostHigh: costs.inactionCostHigh,
      })

      // Persist alert to Supabase — non-blocking, failure doesn't break the demo
      supabase.from('alerts').insert([{
        farmer_id:  farmer.id,
        risk_level: risk.riskLevel,
        gdd_value:  risk.accumulatedGDD,
        message:    alertText,
      }]).then(({ error }) => {
        if (error) console.warn('Alert history save failed:', error)
      })
      setMessage(alertText)
      setStage('ringing')

      // Simulate phone ringing before the call is "answered"
      setTimeout(() => setStage('answered'), 2000)
    } catch (err) {
      console.error('Simulation failed:', err)
      setStage('idle')
      alert('Simulation failed — check console (likely a missing API key in .env)')
    }
  }

  return (
    <div className="alert-simulation">
      <motion.button
        className="btn-primary"
        onClick={runSimulation}
        disabled={stage !== 'idle' && stage !== 'answered'}
        whileHover={stage === 'idle' || stage === 'answered' ? hoverScale : {}}
        whileTap={{ scale: 0.97 }}
      >
        {stage === 'loading'
          ? <><span className="spinner spinner-sm" /> Checking weather &amp; risk…</>
          : 'Run Risk Check + Simulate Alert Call'}
      </motion.button>

      <AnimatePresence>
        {stage === 'loading' && (
          <motion.div
            className="loading-steps"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          >
            <p>⛅ Fetching 30 days of weather from Open-Meteo…</p>
            <p>🧮 Calculating accumulated degree-days…</p>
            <p>🤖 Generating Hindi alert with Gemini…</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(stage === 'ringing' || stage === 'answered') && (
          <motion.div
            className="phone-mockup"
            variants={revealVariants} initial="hidden" animate="visible" exit="hidden"
          >
            <div className="phone-header">📞 Incoming Call</div>
            <div className="phone-caller">Fasal-Rakshak Alert</div>

            {stage === 'ringing' && <p className="ringing-text">Ringing...</p>}

            <AnimatePresence>
              {stage === 'answered' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                  <p className="playing-text">
                    <span className={isSpeaking ? 'speaker-icon speaking' : 'speaker-icon'}>🔊</span>
                    {isSpeaking ? ' Playing message…' : ' Message played'}
                  </p>
                  <p className="alert-message">{message}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {stage === 'answered' && (
          <motion.div
            className="sms-mockup"
            variants={revealVariants} initial="hidden" animate="visible" exit="hidden"
          >
            <div className="phone-header">💬 SMS Fallback (if call unanswered)</div>
            <p className="sms-body">{message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {riskInfo && (
          <motion.div
            className="risk-debug"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <h4>Risk Calculation (for demo transparency)</h4>
            <ul>
              <li>Accumulated GDD: <strong><CountUp target={riskInfo.accumulatedGDD} /></strong> / 504</li>
              <li>Risk level: {riskInfo.riskLevel}</li>
              <li>Days until risk: {riskInfo.daysUntilRisk ?? 'threshold reached'}</li>
              <li>Action cost: Rs <CountUp target={riskInfo.actionCost} /></li>
              <li>Inaction cost range: Rs <CountUp target={riskInfo.inactionCostLow} /> – Rs <CountUp target={riskInfo.inactionCostHigh} /></li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {dailyLog.length > 0 && <GddChart dailyLog={dailyLog} />}

      <AlertHistory farmerId={farmer.id} />
    </div>
  )
}
