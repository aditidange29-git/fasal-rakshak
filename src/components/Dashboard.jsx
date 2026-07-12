import { useEffect, useState } from 'react'
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'
import { db } from '../firebase'

export default function Dashboard({ onSelectFarmer }) {
  const [farmers, setFarmers] = useState([])

  useEffect(() => {
    const q = query(collection(db, 'farmers'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setFarmers(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
    })
    return unsubscribe
  }, [])

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
          {farmers.map((f) => (
            <tr key={f.id}>
              <td>{f.farmerName}</td>
              <td>{f.village}</td>
              <td>{f.district}</td>
              <td>{f.acreage} acres</td>
              <td>{f.registeredBy}</td>
              <td>
                <button onClick={() => onSelectFarmer(f)}>Check Risk</button>
              </td>
            </tr>
          ))}
          {farmers.length === 0 && (
            <tr><td colSpan="6">No farmers registered yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
