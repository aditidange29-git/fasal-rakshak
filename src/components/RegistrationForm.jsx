import { useState } from 'react'
import { motion } from 'framer-motion'
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

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const coords = VIDARBHA_DISTRICT_COORDS[form.district]
      const { error } = await supabase.from('farmers').insert({
        farmer_name:    form.farmerName,
        village:        form.village,
        district:       form.district,
        acreage:        Number(form.acreage),
        phone:          form.phone,
        sowing_date:    form.sowingDate,
        registered_by:  form.registeredBy,
        lat:            coords.lat,
        lng:            coords.lng,
      })
      if (error) throw error
      onRegistered?.()
      setForm({ farmerName: '', village: '', district: 'Yavatmal', acreage: '', phone: '', sowingDate: '', registeredBy: 'self' })
    } catch (err) {
      console.error('Registration failed:', err)
      alert('Something went wrong saving the farmer profile. Check console.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="register-page">
      <motion.form
        onSubmit={handleSubmit}
        className="registration-form"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="form-header">
          <h2>Register a Farmer</h2>
          <p className="form-subhead">Add a new farmer profile to begin tracking pest risk.</p>
        </div>

        <div className="form-group">
          <label htmlFor="farmerName">Farmer name</label>
          <input id="farmerName" name="farmerName" value={form.farmerName}
            onChange={handleChange} placeholder="e.g. Ramesh Patil" required />
        </div>

        <div className="form-group">
          <label htmlFor="village">Village</label>
          <input id="village" name="village" value={form.village}
            onChange={handleChange} placeholder="e.g. Wani" required />
        </div>

        <div className="form-group">
          <label htmlFor="district">District</label>
          <select id="district" name="district" value={form.district} onChange={handleChange}>
            {Object.keys(VIDARBHA_DISTRICT_COORDS).map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="acreage">Land size (acres)</label>
            <input id="acreage" name="acreage" type="number" min="0.5" step="0.5"
              value={form.acreage} onChange={handleChange} placeholder="e.g. 2.5" required />
          </div>
          <div className="form-group">
            <label htmlFor="phone">Phone number</label>
            <input id="phone" name="phone" type="tel"
              value={form.phone} onChange={handleChange} placeholder="e.g. 9876543210" required />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="sowingDate">Sowing date</label>
          <input id="sowingDate" name="sowingDate" type="date"
            value={form.sowingDate} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label htmlFor="registeredBy">Registered by</label>
          <select id="registeredBy" name="registeredBy" value={form.registeredBy} onChange={handleChange}>
            <option value="self">Farmer (self)</option>
            <option value="family">Family member</option>
            <option value="fpo">FPO / Cooperative coordinator</option>
          </select>
        </div>

        <button type="submit" className="btn-primary btn-submit" disabled={submitting}>
          {submitting
            ? <><span className="spinner spinner-sm" aria-hidden="true" /> Saving…</>
            : 'Register Farmer'}
        </button>
      </motion.form>
    </div>
  )
}
