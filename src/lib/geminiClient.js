// Calls Gemini API to phrase the alert message naturally.
// IMPORTANT: All numbers (costs, days, GDD) are calculated in JS BEFORE this call.
// Gemini's only job is to phrase them naturally - never to calculate or invent numbers.

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`

function buildPrompt({ farmerName, village, acreage, daysUntilRisk, gddValue, language, actionCost, inactionCostLow, inactionCostHigh }) {
  return `You are generating a short, spoken voice alert for a cotton farmer in Vidarbha, Maharashtra, about pink bollworm pest risk. The farmer has a basic phone and limited literacy, so the message must be simple, spoken-language style - not written/formal.

STRICT RULES:
1. Output ONLY the spoken message text, nothing else (no labels, no explanation, no markdown).
2. Keep it under 15 seconds when spoken aloud (roughly 35-40 words).
3. Use simple, everyday ${language} - as if a helpful neighbor is speaking, not a formal announcement.
4. Always include, in this order: (a) the pest risk and days until it peaks, (b) one specific low-cost action, (c) the two cost numbers given below - state them simply, do NOT recalculate them.
5. Do NOT invent any numbers, statistics, or costs beyond what is given below.
6. Do NOT use complex agricultural terms - say "worm inside the cotton ball" not "bollworm larvae infestation".

FARMER & RISK DATA:
- Farmer name: ${farmerName}
- Village: ${village}
- Crop: Cotton, ${acreage} acres
- Days until risk peak: ${daysUntilRisk}
- Accumulated degree-days: ${gddValue} (threshold: 504)
- Recommended action: spray recommended pesticide
- Cost of taking action: Rs ${actionCost}
- Estimated cost of inaction: Rs ${inactionCostLow} to Rs ${inactionCostHigh}

Generate the voice message now.`
}

export async function generateAlertMessage(riskData) {
  const prompt = buildPrompt(riskData)

  try {
    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    })
    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
    if (!text) throw new Error('Empty response from Gemini')
    return text
  } catch (err) {
    console.error('Gemini alert generation failed:', err)
    // Fallback template if API fails during demo - always have this as backup
    return `${riskData.farmerName} ji, aapke khet mein ${riskData.daysUntilRisk} din mein bollworm ka khatra hai. Abhi Rs ${riskData.actionCost} ka spray karwa lein. Agar nahi kiya toh Rs ${riskData.inactionCostLow} se Rs ${riskData.inactionCostHigh} tak nuksaan ho sakta hai.`
  }
}
