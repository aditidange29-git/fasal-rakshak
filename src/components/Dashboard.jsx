import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

export default function Dashboard({ onSelectFarmer }) {
  const [farmers, setFarmers] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    // Initial fetch
    fetchFarmers()

    // Real-time subscription — mirrors Firestore's onSnapshot behaviour
    const channel = supabase
      .channel('farmers-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'farmers' }, () => {
        fetchFarmers()
      })
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
      // Update local state immediately — don't wait for the realtime subscription
      setFarmers((prev) => prev.filter((f) => f.id !== id))
      setDeletingId(null)
    }
  }

  return (
    <div className="dashboard">
      <h2>Registered Farmers</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Village</th>
            <th>District</th>
            <th>Acreage</th>
            <th>Registered By</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr><td colSpan="6">Loading...</td></tr>
          )}
          {!loading && farmers.map((f) => (
            <tr key={f.id}>
              <td>{f.farmer_name}</td>
              <td>{f.village}</td>
              <td>{f.district}</td>
              <td>{f.acreage} acres</td>
              <td>{f.registered_by}</td>
              <td>
                <button className="btn-check-risk" onClick={() => onSelectFarmer(f)}>Check Risk</button>
                <button
                  className="btn-delete"
                  onClick={() => deleteFarmer(f.id)}
                  disabled={deletingId === f.id}
                  title="Delete farmer"
                >
                  {deletingId === f.id ? '…' : '🗑 Delete'}
                </button>
              </td>
            </tr>
          ))}
          {!loading && farmers.length === 0 && (
            <tr><td colSpan="6">No farmers registered yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
