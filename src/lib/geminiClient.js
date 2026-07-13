// Calls Gemini API to phrase the alert message naturally.
// IMPORTANT: All numbers (costs, days, GDD) are calculated in JS BEFORE this call.
// Gemini's only job is to phrase them naturally - never to calculate or invent numbers.

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`

// Hard timeout — if Gemini doesn't respond in 8s, fall back to the template
const TIMEOUT_MS = 8000

function buildPrompt({ farmerName, village, acreage, daysUntilRisk, gddValue, language, actionCost, inactionCostLow, inactionCostHigh }) {
  return `Generate a short spoken voice alert for a cotton farmer. Output ONLY the message text, no labels or markdown.
Rules: under 35 words, simple everyday ${language}, mention pest risk in ${daysUntilRisk} days, spray action, cost Rs ${actionCost} vs loss Rs ${inactionCostLow} se Rs ${inactionCostHigh} tak. NEVER use a dash or hyphen between two numbers — always say "se ... tak".
Farmer: ${farmerName}, village ${village}, ${acreage} acres cotton.`
}

function fallback(riskData) {
  return `${riskData.farmerName} ji, aapke ${riskData.acreage} acre cotton mein ${riskData.daysUntilRisk} din mein bollworm ka khatra hai. Abhi Rs ${riskData.actionCost} ka spray karein, warna Rs ${riskData.inactionCostLow} se Rs ${riskData.inactionCostHigh} tak ka nuksan hoga.`
}

export async function generateAlertMessage(riskData) {
  const prompt = buildPrompt(riskData)

  try {
    const controller = new AbortController()
    const timeoutId  = setTimeout(() => controller.abort(), TIMEOUT_MS)

    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 80, temperature: 0.4 },
      }),
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
    if (!text) throw new Error('Empty response from Gemini')
    return text
  } catch (err) {
    if (err.name === 'AbortError') {
      console.warn('Gemini timed out after 8s — using fallback message')
    } else {
      console.error('Gemini failed:', err)
    }
    return fallback(riskData)
  }
}
