# Free-Tier Only Constraint

**All tools, APIs, and services used in this project must be free-tier only, with no billing or credit card requirements.**

## Currently approved services

| Service | Purpose | Cost |
|---|---|---|
| [Open-Meteo](https://open-meteo.com) | Daily weather (temperature max/min) | Free, no API key |
| [Gemini API](https://aistudio.google.com/apikey) — `gemini-2.0-flash` | AI phrasing of alert messages | Free tier via AI Studio |
| [Supabase](https://supabase.com/pricing) — Free plan | Farmer registration data, alert logs | Free plan (500 MB DB, 50k monthly active users) |
| Browser Web Speech API (`window.speechSynthesis`) | Text-to-speech voice playback | Built into browser, no key |

## Rules for adding new services

Before implementing any feature that introduces a new external tool, API, or service:

1. **Flag it first** — state the service name, what it costs, and whether it requires a credit card or billing setup.
2. **Do not silently add** anything that could incur a cost, even if it has a "free tier" with usage limits that could overflow.
3. **Suggest a free alternative** if the natural choice is paid.

## What counts as a violation

- Any service that requires entering a credit card to sign up, even if the initial tier is free.
- Any API with per-request pricing (e.g., Twilio SMS, Google Maps Platform, SendGrid, OpenAI).
- Firebase features that require upgrading from the Spark plan to Blaze (pay-as-you-go) — this includes Cloud Functions with outbound network calls, Firebase Hosting beyond the free limits, and any other Blaze-only feature.
- Any npm package that acts as a paid SDK or wrapper around a paid service.

## Telephony note

Real outbound call/SMS delivery in India requires TRAI DLT registration and a paid telephony provider (Exotel, Ozonetel, etc.). This is intentionally **simulated** in the UI. Do not replace the simulation with a real paid provider without explicit discussion and user approval.
