import { useState } from 'react'
import { calculateAccumulatedRisk } from '../lib/gdd'
import { calculateCosts } from '../lib/costCalculator'
import { generateAlertMessage } from '../lib/geminiClient'
import { fetchDailyWeather } from '../lib/weatherClient'

export default function AlertSimulation({ farmer }) {
  const [stage, setStage] = useState('idle') // idle -> loading -> ringing -> answered
  const [message, setMessage] = useState('')
  const [riskInfo, setRiskInfo] = useState(null)

  const runSimulation = async () => {
    setStage('loading')
    try {
      const weather = await fetchDailyWeather(farmer.lat, farmer.lng, 30)
      const risk = calculateAccumulatedRisk(weather)
      const costs = calculateCosts(farmer.acreage)
      setRiskInfo({ ...risk, ...costs })

      const alertText = await generateAlertMessage({
        farmerName: farmer.farmerName,
        village: farmer.village,
        acreage: farmer.acreage,
        daysUntilRisk: risk.daysUntilRisk ?? 'a few',
        gddValue: risk.accumulatedGDD,
        language: 'Hindi',
        actionCost: costs.actionCost,
        inactionCostLow: costs.inactionCostLow,
        inactionCostHigh: costs.inactionCostHigh,
      })
      setMessage(alertText)
      setStage('ringing')

      // Simulate the "phone ringing then answered" delay for the demo
      setTimeout(() => setStage('answered'), 2000)
    } catch (err) {
      console.error('Simulation failed:', err)
      setStage('idle')
      alert('Simulation failed - check console (likely a missing API key in .env)')
    }
  }

  return (
    <div className="alert-simulation">
      <button onClick={runSimulation} disabled={stage !== 'idle' && stage !== 'answered'}>
        Run Risk Check + Simulate Alert Call
      </button>

      {stage === 'loading' && <p>Checking weather + calculating risk...</p>}

      {(stage === 'ringing' || stage === 'answered') && (
        <div className="phone-mockup">
          <div className="phone-header">📞 Incoming Call</div>
          <div className="phone-caller">Fasal-Rakshak Alert</div>
          {stage === 'ringing' && <p className="ringing-text">Ringing...</p>}
          {stage === 'answered' && (
            <>
              <p className="playing-text">🔊 Playing message:</p>
              <p className="alert-message">{message}</p>
            </>
          )}
        </div>
      )}

      {stage === 'answered' && (
        <div className="sms-mockup">
          <div className="phone-header">💬 SMS Fallback (if call unanswered)</div>
          <p className="sms-body">{message}</p>
        </div>
      )}

      {riskInfo && (
        <div className="risk-debug">
          <h4>Risk Calculation (for demo transparency)</h4>
          <ul>
            <li>Accumulated GDD: {riskInfo.accumulatedGDD} / 504</li>
            <li>Risk level: {riskInfo.riskLevel}</li>
            <li>Days until risk: {riskInfo.daysUntilRisk ?? 'threshold reached'}</li>
            <li>Action cost: Rs {riskInfo.actionCost}</li>
            <li>Inaction cost range: Rs {riskInfo.inactionCostLow} - Rs {riskInfo.inactionCostHigh}</li>
          </ul>
        </div>
      )}
    </div>
  )
}
