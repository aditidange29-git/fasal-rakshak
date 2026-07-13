import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

const RISK_COLOURS = {
  low:      { bg: '#e8f5e9', text: '#2e7d32' },
  moderate: { bg: '#fff8e1', text: '#f57f17' },
  high:     { bg: '#fff3e0', text: '#e65100' },
  critical: { bg: '#fde8e8', text: '#c62828' },
}

function fmtDate(iso) {
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function AlertHistory({ farmerId }) {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!farmerId) return

    const fetchAlerts = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('farmer_id', farmerId)
        .order('created_at', { ascending: false })
      if (!error) setAlerts(data ?? [])
      setLoading(false)
    }

    fetchAlerts()

    // Live updates — if a new alert is saved while this view is open, it appears
    const channel = supabase
      .channel(`alerts-${farmerId}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'alerts', filter: `farmer_id=eq.${farmerId}` },
        () => fetchAlerts()
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [farmerId])

  if (loading) {
    return (
      <div className="alert-history">
        <h3 className="history-heading">Past Alerts</h3>
        <div className="spinner-row"><span className="spinner spinner-dark" /></div>
      </div>
    )
  }

  return (
    <div className="alert-history">
      <h3 className="history-heading">Past Alerts</h3>

      {alerts.length === 0 ? (
        <p className="empty-state">No alerts run yet — hit "Run Risk Check" above to generate the first one.</p>
      ) : (
        <ul className="history-list">
          {alerts.map((a) => {
            const colours = RISK_COLOURS[a.risk_level] ?? RISK_COLOURS.low
            return (
              <li key={a.id} className="history-item">
                <div className="history-item-top">
                  <span
                    className="risk-badge"
                    style={{ background: colours.bg, color: colours.text }}
                  >
                    {a.risk_level.toUpperCase()}
                  </span>
                  <span className="history-date">{fmtDate(a.created_at)}</span>
                </div>
                <p className="history-gdd">Accumulated GDD: <strong>{a.gdd_value}</strong> / 504</p>
                <p className="history-message">{a.message}</p>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
