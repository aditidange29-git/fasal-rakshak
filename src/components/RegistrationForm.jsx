import { useState } from 'react'
import { supabase } from '../supabase'
import { VIDARBHA_DISTRICT_COORDS } from '../lib/weatherClient'

export default function RegistrationForm({ onRegistered }) {
  const [form, setForm] = useState({
    farmerName: '',
    village: '',
    district: 'Yavatmal',
    acreage: '',
    phone: '',
    sowingDate: '',
    registeredBy: 'self',
  })
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const coords = VIDARBHA_DISTRICT_COORDS[form.district]
      const { error } = await supabase.from('farmers').insert({
        farmer_name: form.farmerName,
        village: form.village,
        district: form.district,
        acreage: Number(form.acreage),
        phone: form.phone,
        sowing_date: form.sowingDate,
        registered_by: form.registeredBy,
        lat: coords.lat,
        lng: coords.lng,
      })
      if (error) throw error
      onRegistered?.()
      setForm({
        farmerName: '', village: '', district: 'Yavatmal', acreage: '',
        phone: '', sowingDate: '', registeredBy: 'self',
      })
    } catch (err) {
      console.error('Registration failed:', err)
      alert('Something went wrong saving the farmer profile. Check console.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="registration-form">
      <h2>Register a Farmer</h2>

      <label>Farmer name</label>
      <input name="farmerName" value={form.farmerName} onChange={handleChange} required />

      <label>Village</label>
      <input name="village" value={form.village} onChange={handleChange} required />

      <label>District</label>
      <select name="district" value={form.district} onChange={handleChange}>
        {Object.keys(VIDARBHA_DISTRICT_COORDS).map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>

      <label>Land size (acres)</label>
      <input name="acreage" type="number" min="0.5" step="0.5" value={form.acreage} onChange={handleChange} required />

      <label>Phone number</label>
      <input name="phone" type="tel" value={form.phone} onChange={handleChange} required />

      <label>Sowing date</label>
      <input name="sowingDate" type="date" value={form.sowingDate} onChange={handleChange} required />

      <label>Registered by</label>
      <select name="registeredBy" value={form.registeredBy} onChange={handleChange}>
        <option value="self">Farmer (self)</option>
        <option value="family">Family member</option>
        <option value="fpo">FPO / Cooperative coordinator</option>
      </select>

      <button type="submit" disabled={submitting}>
        {submitting ? 'Saving...' : 'Register Farmer'}
      </button>
    </form>
  )
}
