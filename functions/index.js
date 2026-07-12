// Optional: scheduled Cloud Function that runs the risk check automatically
// every day for all registered farmers, instead of the manual "Run Risk Check"
// button in the frontend demo. Deploy this only if you have time beyond the
// core manual-trigger demo - it's not required to show the mechanism working.

const { onSchedule } = require('firebase-functions/v2/scheduler')
const { initializeApp } = require('firebase-admin/app')
const { getFirestore } = require('firebase-admin/firestore')

initializeApp()
const db = getFirestore()

const PBW_BASE_TEMP_C = 13.4
const PBW_UPPER_TEMP_C = 35.5
const PBW_RISK_THRESHOLD_GDD = 504
const COST_PER_ACRE_CULTIVATION = 36000
const SPRAY_COST_PER_ACRE = 150

function dailyDegreeDays(maxTemp, minTemp) {
  const cappedMax = Math.min(maxTemp, PBW_UPPER_TEMP_C)
  const avg = (cappedMax + minTemp) / 2
  const dd = avg - PBW_BASE_TEMP_C
  return dd > 0 ? dd : 0
}

async function fetchWeather(lat, lng) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max,temperature_2m_min&past_days=30&forecast_days=1&timezone=auto`
  const res = await fetch(url)
  const data = await res.json()
  const { time, temperature_2m_max, temperature_2m_min } = data.daily
  return time.map((date, i) => ({
    date, maxTemp: temperature_2m_max[i], minTemp: temperature_2m_min[i],
  }))
}

exports.dailyRiskCheck = onSchedule('every day 06:00', async () => {
  const farmersSnap = await db.collection('farmers').get()

  for (const doc of farmersSnap.docs) {
    const farmer = doc.data()
    const weather = await fetchWeather(farmer.lat, farmer.lng)

    let accumulated = 0
    for (const day of weather) accumulated += dailyDegreeDays(day.maxTemp, day.minTemp)

    const percent = (accumulated / PBW_RISK_THRESHOLD_GDD) * 100
    if (percent >= 85) {
      // Risk threshold nearly/fully reached - log an alert record.
      // Actual call/SMS delivery is simulated in the frontend for this hackathon build;
      // wire in a telephony provider here once DLT/sender-ID registration is complete.
      const farmInvestment = farmer.acreage * COST_PER_ACRE_CULTIVATION
      await db.collection('alerts').add({
        farmerId: doc.id,
        farmerName: farmer.farmerName,
        accumulatedGDD: Math.round(accumulated),
        actionCost: Math.round(farmer.acreage * SPRAY_COST_PER_ACRE),
        inactionCostLow: Math.round(farmInvestment * 0.2),
        inactionCostHigh: Math.round(farmInvestment * 0.5),
        createdAt: new Date(),
      })
    }
  }
})
