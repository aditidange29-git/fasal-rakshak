# Fasal-Rakshak
### "The Call Before the Damage"

A zero-hardware, proactive pest-risk alert system for cotton farmers in Vidarbha, Maharashtra.  
Built for the **AI for Bharat Hackathon**.

---

## What it does

1. A farmer (or an FPO coordinator) registers with village, district, acreage, and sowing date.
2. The system pulls the last 30 days of real daily temperature data for that district from **Open-Meteo** (free, no API key).
3. It calculates accumulated **Degree-Days (GDD)** — a published, scientifically validated entomological method for predicting pink bollworm (*Pectinophora gossypiella*) emergence — using pure arithmetic, not AI.
4. Once GDD crosses 60 % of the 504-day threshold, it calculates the real ₹ cost of spraying now vs. documented crop-loss figures from ICAR-CICR.
5. **Google Gemini 2.0 Flash** phrases the risk into a short, natural spoken Hindi alert (under 35 words).
6. The alert plays as a browser voice call (Web Speech API) — simulating the outbound phone call that will reach a basic feature phone once TRAI DLT registration completes.

---

## Tech stack

| Layer | Tool | Cost |
|---|---|---|
| Frontend | React 18 + Vite | Free |
| Animations | Framer Motion + GSAP | Free |
| Database | Supabase (free plan) | Free |
| Weather | Open-Meteo API | Free, no key |
| AI phrasing | Gemini 2.0 Flash (AI Studio) | Free tier |
| Voice | Browser Web Speech API | Built-in |

> **All tools used are 100 % free-tier. No credit card is required to run this project.**

---

## Features

### Landing & Storytelling
- Full-screen aurora hero with animated gradient background and dot grid
- Animated stat counters (504 GDD threshold, 30-day lookback, 5 Vidarbha districts)
- 3-step scroll story: Weather → GDD accumulation → Hindi voice alert
- Live animated GDD meter and cost-comparison cards in the story sections

### Farmer Registration
- Register with name, village, district, acreage, phone, sowing date, and who is registering
- District coordinates auto-populated from `VIDARBHA_DISTRICT_COORDS` — no geocoding API needed
- Stored in Supabase `farmers` table with real-time sync

### Dashboard
- Lists all registered farmers with real-time Supabase subscription (updates live)
- Per-farmer "Check Risk" action opens the full alert simulation
- Delete farmer with confirmation
- Mobile-responsive card layout on small screens

### Alert Simulation (the core feature)
- Auto-triggers if GDD ≥ 60 % of threshold on page load; manual trigger otherwise
- Full-screen animated incoming call UI with:
  - Animated ring-pulse avatar
  - Voice waveform bars that animate while the AI message is spoken
  - Phone status bar (signal, wifi, battery)
  - Call control buttons (mute, keypad, speaker, end)
- After end call:
  - **SMS mockup** (tilted 3D card showing the message as an SMS notification)
  - **Nearby agri shop map mockup** (tilted 3D card)
  - **GDD accumulation chart** (Recharts area chart with threshold reference line)
  - Risk breakdown panel (GDD, risk level, spray cost vs. potential loss)
- Alert is logged to Supabase `alerts` table (farmer ID, GDD, risk level, message, costs)

### Alert History
- Per-farmer log of all past alert runs pulled from Supabase
- Real-time INSERT subscription — new alerts appear instantly
- Colour-coded risk badges (low / moderate / high / critical)

### About Page (bilingual)
- Full English / Hindi bilingual layout (side-by-side columns)
- Sections: Mission, GDD Science (with formula), Competitive Landscape, Prototype Disclaimer, Roadmap
- Roadmap items clearly marked as "future scope — not built yet"

---

## GDD Science

Insects develop on accumulated heat, not calendar days.

```
GDD per day = max(0, ((T_max + T_min) / 2) − T_base)
```

For pink bollworm:
- **Base temperature:** 13.4 °C
- **Upper threshold:** 35.5 °C (development stalls above this)
- **Emergence peak:** ~504 accumulated GDD from sowing date

Source: Published entomological research on *Pectinophora gossypiella* developmental thresholds.

---

## Cost data sources

| Figure | Source |
|---|---|
| Cotton cultivation cost ~₹36,000/acre in Vidarbha | State-level agri cost surveys |
| Yield loss 20–50 % without bollworm management | ICAR-CICR |
| Spray cost ~₹150/acre (generic pesticide) | Market rates |
| Vidarbha + Marathwada ≈ 1/3 of India's cotton area | Cotton Corp. of India |

---

## Setup

```bash
git clone https://github.com/aditidange29-git/fasal-rakshak
cd fasal-rakshak
npm install
cp .env.example .env
```

Fill in `.env`:

```env
VITE_GEMINI_API_KEY=your_key_from_aistudio.google.com
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

```bash
npm run dev
```

### Getting a Gemini API key
Go to [https://aistudio.google.com/apikey](https://aistudio.google.com/apikey) — free tier, no billing.

### Setting up Supabase
1. Create a project at [https://supabase.com](https://supabase.com) (free plan)
2. Create two tables:

**`farmers`**
```sql
id            uuid primary key default gen_random_uuid()
farmer_name   text
village       text
district      text
acreage       numeric
phone         text
sowing_date   date
registered_by text
lat           numeric
lng           numeric
created_at    timestamptz default now()
```

**`alerts`**
```sql
id                 uuid primary key default gen_random_uuid()
farmer_id          uuid references farmers(id)
farmer_name        text
accumulated_gdd    numeric
risk_level         text
action_cost        numeric
inaction_cost_low  numeric
inaction_cost_high numeric
alert_message      text
created_at         timestamptz default now()
```

3. Enable Realtime on both tables (Supabase Dashboard → Database → Replication)
4. Add Row Level Security policies so the anon key can read, write, and delete:

```sql
-- farmers table
CREATE POLICY "Allow public select on farmers"  ON public.farmers FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public insert on farmers"  ON public.farmers FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow public delete on farmers"  ON public.farmers FOR DELETE TO anon USING (true);

-- alerts table
CREATE POLICY "Allow public select on alerts"   ON public.alerts  FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public insert on alerts"   ON public.alerts  FOR INSERT TO anon WITH CHECK (true);
```

5. Copy your Project URL and anon key into `.env`

---

## Project structure

```
src/
  lib/
    gdd.js            — degree-day risk calculation (pure math, no AI)
    costCalculator.js — spray cost vs. crop-loss calculation (cited figures)
    weatherClient.js  — Open-Meteo free weather API wrapper + district coords
    geminiClient.js   — Gemini prompt builder + 8s timeout fallback
    animations.js     — shared Framer Motion variants
  components/
    NavBar.jsx          — glass sticky navbar with GSAP PillNav
    Dashboard.jsx       — real-time farmer list with risk check + delete
    RegistrationForm.jsx — farmer registration form
    AlertSimulation.jsx  — full call simulation + post-call UI
    AlertHistory.jsx     — per-farmer alert history from Supabase
    About.jsx            — bilingual mission + science + roadmap
    GddChart.jsx         — Recharts GDD accumulation chart
    TiltedCard.jsx       — 3D tilt card for SMS / map mockups
    PillNav.jsx          — GSAP animated pill navigation
    CountUp.jsx          — animated number counter
  App.jsx     — view routing, landing page storytelling sections
  styles.css  — full premium design system (dark theme, CSS tokens)
  supabase.js — Supabase client (primary)
  supabaseClient.js — Supabase client (alert history)
functions/
  index.js — optional Cloud Function scaffold for scheduled daily checks
             (not deployed — placeholder for post-DLT-registration automation)
```

---

## Why telephony is simulated

Real outbound calling and SMS in India requires **TRAI DLT (Distributed Ledger Technology) registration** — a multi-day compliance process involving a registered business entity, sender ID approval, and a licensed Telecom Service Provider (e.g. Exotel or Ozonetel).

This is intentionally deferred. The demo shows the complete real pipeline:

```
Live weather → GDD math → Gemini AI phrasing → Hindi voice → call UI
```

Only the final physical delivery hop (dialling a real number) is simulated. Once DLT registration completes, replacing the browser TTS with an Exotel outbound call is a single integration point in `geminiClient.js`.

---

## Competitive landscape

| Product | Gap Fasal-Rakshak fills |
|---|---|
| **CottonAce (Mahindra)** | Broad agronomy app — requires smartphone. FR is voice-first, no app needed. |
| **CROPSAP (Maharashtra Govt.)** | District-level trap-based reports. FR gives 2–5 day earlier warning from GDD model. |
| **Bharat-VISTAAR (ICAR)** | Broadcast advisory content. FR sends personalised farm-specific alerts tied to sowing date. |

None of these deliver a proactive, farm-specific, spoken Hindi alert calibrated to a farmer's own sowing date.

---

## Honest limitations

- No field pilot yet — the model is scientifically validated, but hasn't been tested against real farmer outcomes.
- Weather is district-level, not hyperlocal to an individual field.
- Telephony is simulated — call/SMS delivery pending DLT compliance.
- GDD model currently covers pink bollworm only (multi-pest expansion is on the roadmap).

---

## Roadmap (future scope — not built yet)

- Multi-pest expansion (whitefly, aphids, helicoverpa; soybean and tur)
- Spray cost calculator with generic-brand pesticide recommendations
- Season-level expense and income log per farmer (voice / keypad entry)
- FPO bulk registration via CSV (50–500 members at once)
- Live outbound call and SMS delivery (post-DLT registration, Exotel/Ozonetel)
