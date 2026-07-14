import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../supabase'
import CountUp from './CountUp'

/* ── Icons ────────────────────────────────────────────────────────── */
function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6M14 11v6"/>
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  )
}

function ActivityIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  )
}

function UsersIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  )
}

export default function Dashboard({ onSelectFarmer }) {
  const [farmers, setFarmers] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    fetchFarmers()
    const channel = supabase
      .channel('farmers-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'farmers' }, fetchFarmers)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  async function fetchFarmers() {
    const { data, error } = await supabase
      .from('farmers')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) setFarmers(data ?? [])
    setLoading(false)
  }

  async function deleteFarmer(id) {
    if (!window.confirm('Delete this farmer? This cannot be undone.')) return
    setDeletingId(id)
    const { error } = await supabase.from('farmers').delete().eq('id', id)
    if (error) {
      console.error('Delete failed:', error)
      alert('Could not delete farmer. Check console.')
      setDeletingId(null)
    } else {
      setFarmers((prev) => prev.filter((f) => f.id !== id))
      setDeletingId(null)
    }
  }

  return (
    <div className="dashboard">
      {/* Header row */}
      <div className="dashboard-top">
        <div>
          <h2 className="dashboard-title">Registered Farmers</h2>
        </div>
        {!loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="dashboard-count-badge"
          >
            <CountUp target={farmers.length} duration={600} />
            &nbsp;{farmers.length === 1 ? 'record' : 'records'}
          </motion.div>
        )}
      </div>

      {/* Table */}
      <div className="table-wrap">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Farmer</th>
                <th>Village</th>
                <th>District</th>
                <th>Acreage</th>
                <th>Registered By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr className="table-loading-row">
                  <td colSpan="6">
                    <span className="spinner spinner-light" style={{ marginRight: '0.5rem' }} />
                    Loading records…
                  </td>
                </tr>
              )}

              {!loading && farmers.map((f, i) => (
                <motion.tr
                  key={f.id}
                  className="dashboard-row"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.04 }}
                >
                  <td data-label="Farmer" className="td-name">{f.farmer_name}</td>
                  <td data-label="Village">{f.village}</td>
                  <td data-label="District" className="td-district">{f.district}</td>
                  <td data-label="Acreage">{f.acreage} ac</td>
                  <td data-label="Registered By" style={{ color: 'var(--stone-500)', fontSize: '0.85rem' }}>{f.registered_by}</td>
                  <td data-label="Actions">
                    <div className="table-actions">
                      <button className="btn-check-risk" onClick={() => onSelectFarmer(f)}>
                        <ActivityIcon /> Check Risk
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => deleteFarmer(f.id)}
                        disabled={deletingId === f.id}
                        title="Delete farmer"
                      >
                        <TrashIcon />
                        {deletingId === f.id ? 'Deleting…' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}

              {!loading && farmers.length === 0 && (
                <tr>
                  <td colSpan="6">
                    <div className="empty-state">
                      <div className="empty-state-icon"><UsersIcon /></div>
                      <p className="empty-state-title">No farmers registered yet</p>
                      <p className="empty-state-hint">Use the Register page to add the first farmer profile.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
