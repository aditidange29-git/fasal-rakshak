// Degree-Day (GDD) calculator for Pink Bollworm risk prediction
// Based on published developmental thresholds: base temp 13.4C, peak emergence ~504 GDD

export const PBW_BASE_TEMP_C = 13.4
export const PBW_RISK_THRESHOLD_GDD = 504
export const PBW_UPPER_TEMP_C = 35.5 // development stalls above this

/**
 * Calculate degree-days for a single day.
 * @param {number} maxTempC - day's max temperature (Celsius)
 * @param {number} minTempC - day's min temperature (Celsius)
 * @param {number} baseTempC - developmental base temp (default: pink bollworm)
 * @returns {number} degree-days for that day (0 if below base temp)
 */
export function dailyDegreeDays(maxTempC, minTempC, baseTempC = PBW_BASE_TEMP_C) {
  // Cap max temp at upper threshold - development doesn't speed up further above it
  const cappedMax = Math.min(maxTempC, PBW_UPPER_TEMP_C)
  const avgTemp = (cappedMax + minTempC) / 2
  const dd = avgTemp - baseTempC
  return dd > 0 ? dd : 0
}

/**
 * Calculate accumulated GDD across a list of daily weather records,
 * and determine risk status.
 * @param {Array<{date: string, maxTemp: number, minTemp: number}>} dailyWeather
 * @param {number} sowingDateOffset - days since sowing to start counting from (usually 0, full array)
 * @returns {{ accumulatedGDD: number, riskLevel: string, daysUntilRisk: number|null, dailyLog: Array }}
 */
export function calculateAccumulatedRisk(dailyWeather) {
  let accumulated = 0
  const dailyLog = []

  for (const day of dailyWeather) {
    const dd = dailyDegreeDays(day.maxTemp, day.minTemp)
    accumulated += dd
    dailyLog.push({ date: day.date, degreeDays: dd, runningTotal: accumulated })
  }

  const percentToThreshold = (accumulated / PBW_RISK_THRESHOLD_GDD) * 100
  let riskLevel = 'low'
  if (percentToThreshold >= 100) riskLevel = 'critical'
  else if (percentToThreshold >= 85) riskLevel = 'high'
  else if (percentToThreshold >= 60) riskLevel = 'moderate'

  // Estimate days until threshold using the average daily GDD rate from recent days
  let daysUntilRisk = null
  if (riskLevel !== 'critical' && dailyLog.length >= 3) {
    const recentAvgDD =
      dailyLog.slice(-3).reduce((sum, d) => sum + d.degreeDays, 0) / 3
    const remaining = PBW_RISK_THRESHOLD_GDD - accumulated
    daysUntilRisk = recentAvgDD > 0 ? Math.ceil(remaining / recentAvgDD) : null
  }

  return { accumulatedGDD: Math.round(accumulated), riskLevel, daysUntilRisk, dailyLog }
}
