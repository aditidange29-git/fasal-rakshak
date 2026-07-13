import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../supabaseClient'
import { pageVariants, hoverScale } from '../lib/animations'
import CountUp from './CountUp'

// ── Savings stat cards ───────────────────────────────────────────────────
function SavingsCards({ farmers }) {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    const load = async () => {
      // Alert count
      const { count: alertCount } = await supabase
        .from('alerts')
        .select('*', { count: 'exact', head: true })

      // Conservative savings: sum acreage of all registered farmers × Rs 7200/acre
      // (20% yield loss on Rs 36,000/acre cultivation cost = Rs 7,200 low estimate)
      const totalSavings = farmers.reduce((sum, f) => sum + (f.acreage ?? 0) * 7200, 0)

      setStats({
        farmers: farmers.length,
        alerts:  alertCount ?? 0,
        savings: Math.round(totalSavings),
      })
    }
    load()
  }, [farmers])

  if (!stats) return <div className="savings-cards-placeholder" />

  const cards = [
    { label: 'Farmers Protected', value: stats.farmers, prefix: '',    suffix: '',   icon: '🌾' },
    { label: 'Alerts Delivered',  value: stats.alerts,  prefix: '',    suffix: '',   icon: '📞' },
    { label: 'Est. Savings',      value: stats.savings, prefix: 'Rs ', suffix: '',   icon: '💰' },
  ]

  return (
    <div className="savings-cards">
      {cards.map(({ label, value, prefix, suffix, icon }, i) => (
        <motion.div
          key={label}
          className="savings-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.35, ease: 'easeOut' }}
          whileHover={{ scale: 1.02, boxShadow: '0 6px 20px rgba(0,0,0,0.10)' }}
        >
          <span className="savings-card-icon">{icon}</span>
          <div className="savings-card-value">
            <CountUp target={value} prefix={prefix} suffix={suffix} duration={900} />
          </div>
          <div className="savings-card-label">{label}</div>
        </motion.div>
      ))}
    </div>
  )
}

// ── Main Dashboard component ─────────────────────────────────────────────
export default function Dashboard({ onSelectFarmer }) {
  const [farmers, setFarmers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFarmers = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('farmers')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) console.error('Failed to fetch farmers:', error)
      else setFarmers(data ?? [])
      setLoading(false)
    }

    fetchFarmers()

    const channel = supabase
      .channel('farmers-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'farmers' },
        () => fetchFarmers()
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  return (
    <motion.div
      className="dashboard"
      variants={pageVariants} initial="hidden" animate="visible"
    >
      {/* ── Savings summary — only render once farmers are loaded ── */}
      {!loading && <SavingsCards farmers={farmers} />}

      <div className="dashboard-header">
        <h2>Registered Farmers</h2>
      </div>

      {loading ? (
        <div className="spinner-row"><span className="spinner spinner-dark" /></div>
      ) : farmers.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">🌱</span>
          <p>No farmers registered yet.</p>
          <p className="empty-hint">Click <strong>Register Farmer</strong> in the nav to add your first one.</p>
        </div>
      ) : (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Village</th>
                <th>District</th>
                <th>Acres</th>
                <th>Registered By</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {farmers.map((f) => (
                <tr
                  key={f.id}
                  className="dashboard-row"
                  onClick={() => onSelectFarmer(f)}
                  style={{ cursor: 'pointer' }}
                >
                  <td data-label="Name">{f.farmer_name}</td>
                  <td data-label="Village">{f.village}</td>
                  <td data-label="District">{f.district}</td>
                  <td data-label="Acres">{f.acreage}</td>
                  <td data-label="Registered By">{f.registered_by}</td>
                  <td data-label="">
                    <motion.button
                      className="btn-check-risk"
                      whileHover={hoverScale}
                      whileTap={{ scale: 0.96 }}
                      onClick={(e) => { e.stopPropagation(); onSelectFarmer(f) }}
                    >
                      Check Risk
                    </motion.button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  )
}
