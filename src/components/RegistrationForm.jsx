import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { VIDARBHA_DISTRICT_COORDS } from '../lib/weatherClient'

const EMPTY = {
  farmerName: '', village: '', district: 'Yavatmal',
  acreage: '', phone: '', sowingDate: '', registeredBy: 'self',
}

export default function RegistrationForm({ onRegistered }) {
  const [form, setForm] = useState(EMPTY)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setSuccess(false)
    try {
      const coords = VIDARBHA_DISTRICT_COORDS[form.district]
      const { data, error } = await supabase.from('farmers').insert([{
        farmer_name:   form.farmerName,
        village:       form.village,
        district:      form.district,
        acreage:       Number(form.acreage),
        phone:         form.phone,
        sowing_date:   form.sowingDate,
        registered_by: form.registeredBy,
        lat:           coords.lat,
        lng:           coords.lng,
      }]).select().single()

      if (error) throw error

      setSuccess(true)
      setForm(EMPTY)
      setTimeout(() => onRegistered?.(data.id), 1200)
    } catch (err) {
      console.error('Registration failed:', err)
      alert('Something went wrong saving the farmer profile. Check console.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="register-page">
      <form onSubmit={handleSubmit} className="registration-form">
        <h2>Register a Farmer</h2>

        {success && (
          <div className="form-success" role="status">
            ✅ Farmer registered! Redirecting to dashboard…
          </div>
        )}

        <label htmlFor="farmerName">Farmer name</label>
        <input id="farmerName" name="farmerName" value={form.farmerName}
          onChange={handleChange} required autoComplete="name" />

        <label htmlFor="village">Village</label>
        <input id="village" name="village" value={form.village}
          onChange={handleChange} required />

        <label htmlFor="district">District</label>
        <select id="district" name="district" value={form.district} onChange={handleChange}>
          {Object.keys(VIDARBHA_DISTRICT_COORDS).map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        <label htmlFor="acreage">Land size (acres)</label>
        <input id="acreage" name="acreage" type="number" min="0.5" step="0.5"
          value={form.acreage} onChange={handleChange} required />

        <label htmlFor="phone">Phone number</label>
        <input id="phone" name="phone" type="tel" value={form.phone}
          onChange={handleChange} required />

        <label htmlFor="sowingDate">Sowing date</label>
        <input id="sowingDate" name="sowingDate" type="date" value={form.sowingDate}
          onChange={handleChange} required />

        <label htmlFor="registeredBy">Registered by</label>
        <select id="registeredBy" name="registeredBy" value={form.registeredBy} onChange={handleChange}>
          <option value="self">Farmer (self)</option>
          <option value="family">Family member</option>
          <option value="fpo">FPO / Cooperative coordinator</option>
        </select>

        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting
            ? <><span className="spinner spinner-sm" /> Saving…</>
            : 'Register Farmer'}
        </button>
      </form>
    </div>
  )
}
