// Open-Meteo: free, no API key required. Good fit for a hackathon.
// Docs: https://open-meteo.com/en/docs

/**
 * Fetch the last N days of daily max/min temperature for a location.
 * @param {number} lat
 * @param {number} lng
 * @param {number} pastDays - how many past days to pull (max 92 on free tier)
 * @returns {Promise<Array<{date: string, maxTemp: number, minTemp: number}>>}
 */
export async function fetchDailyWeather(lat, lng, pastDays = 30) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max,temperature_2m_min&past_days=${pastDays}&forecast_days=1&timezone=auto`

  const response = await fetch(url)
  if (!response.ok) throw new Error('Weather fetch failed')
  const data = await response.json()

  const { time, temperature_2m_max, temperature_2m_min } = data.daily
  return time.map((date, i) => ({
    date,
    maxTemp: temperature_2m_max[i],
    minTemp: temperature_2m_min[i],
  }))
}

// Rough lat/lng lookup for common Vidarbha districts - extend as needed.
// For a real build, replace with a geocoding API call on the village name.
export const VIDARBHA_DISTRICT_COORDS = {
  Yavatmal: { lat: 20.3888, lng: 78.1204 },
  Amravati: { lat: 20.9374, lng: 77.7796 },
  Nagpur: { lat: 21.1458, lng: 79.0882 },
  Wardha: { lat: 20.7453, lng: 78.6022 },
  Akola: { lat: 20.7002, lng: 77.0082 },
}
