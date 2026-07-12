# Fasal-Rakshak 🌾
### "The Call Before the Damage"

A zero-hardware, proactive pest-risk alert system for cotton farmers in Vidarbha, Maharashtra —
built for the AI for Bharat Hackathon.

## What this does

1. A farmer (or their family member) registers with village, district, acreage, and sowing date.
2. The system pulls daily weather for that location (Open-Meteo, free, no API key needed).
3. It calculates accumulated **degree-days (GDD)** — a published, scientifically validated method
   for predicting pink bollworm emergence risk — using pure arithmetic, not AI.
4. Once risk crosses threshold, it calculates the real ₹ cost of spraying now vs. the documented
   cost of ignoring it (based on cited Vidarbha cultivation cost and yield-loss data).
5. Gemini phrases this into a short, natural spoken alert in Hindi.
6. The alert is delivered as a simulated incoming call / SMS in the UI (see note on telephony below).

## Why call/SMS delivery is simulated, not real

Real outbound calling/SMS in India requires **TRAI DLT registration** for sender IDs and message
templates — a multi-day compliance process that can't be completed within a hackathon timeline.
The demo shows the full real pipeline (weather → GDD math → AI message → Hindi voice) and simulates
only the final physical delivery hop. This is intentional and should be explained honestly to judges,
not hidden — see `functions/index.js` for where a real telephony provider (Exotel/Ozonetel) would
plug in once compliance is complete.

## Setup

```bash
npm install
cp .env.example .env
# Fill in your Gemini API key and Firebase project config in .env
npm run dev
```

### Getting a Gemini API key
Go to https://aistudio.google.com/apikey — free tier is enough for a hackathon demo.

### Setting up Firebase
1. Create a project at https://console.firebase.google.com
2. Enable Firestore (in test mode is fine for a hackathon)
3. Copy your web app config into `.env`
4. (Optional) Deploy `functions/index.js` if you want the automated daily scheduled check
   instead of the manual "Run Risk Check" button — not required for the demo to work.

## Project structure

```
src/
  lib/
    gdd.js            - degree-day risk calculation (pure math, no AI)
    costCalculator.js - cost-of-action vs cost-of-inaction (cited figures)
    weatherClient.js   - Open-Meteo weather fetching
    geminiClient.js    - AI phrasing of the alert message (numbers pre-calculated)
  components/
    RegistrationForm.jsx - farmer/family registration
    Dashboard.jsx         - extension officer view of all registered farmers
    AlertSimulation.jsx   - runs the full pipeline + simulated call/SMS UI
functions/
  index.js - optional scheduled Cloud Function for automated daily checks
```

## Key sources behind the numbers used

- Cotton yield loss 20-50% in Maharashtra without pest management: ICAR-CICR
- Pink bollworm degree-day thresholds (13.4-35.5°C, ~504 GDD): published entomological research
- Cotton cultivation cost ~₹36,000/acre in Vidarbha districts (e.g. Yavatmal)
- Vidarbha + Marathwada ≈ 1/3rd of India's total cotton-growing area

## Honest limitations (know these before a judge asks)

- No field pilot has been run — this applies a validated model, but hasn't been tested against
  real farmer outcomes yet.
- Weather data is village/district-level, not hyperlocal to an individual field.
- Call/SMS delivery is simulated due to DLT compliance timelines, not yet live telephony.
