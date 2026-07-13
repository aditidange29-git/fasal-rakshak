export default function About() {
  return (
    <div className="about">

      {/* Mission */}
      <section className="about-section">
        <h2 className="about-heading">Our Mission</h2>
        <p>
          Fasal-Rakshak exists to close a single, costly gap: the window between when
          pink bollworm risk becomes predictable and when a smallholder farmer in
          Vidarbha actually finds out. By combining real weather data with published
          entomological thresholds, we deliver a spoken Hindi alert — directly to a
          basic phone — before the damage starts, not after.
        </p>
        <p>
          Our focus is narrow by design. One pest, one crop, one region, done well.
          The call before the damage.
        </p>
      </section>

      {/* GDD Science */}
      <section className="about-section">
        <h2 className="about-heading">The Science: Degree-Days</h2>
        <p>
          Insects don't develop on a calendar — they develop on accumulated heat.
          A <strong>degree-day (GDD)</strong> is the amount of heat available for
          insect development in a single day, calculated as:
        </p>
        <div className="about-formula">
          GDD = max(0, ((T<sub>max</sub> + T<sub>min</sub>) / 2) − T<sub>base</sub>)
        </div>
        <p>
          For pink bollworm (<em>Pectinophora gossypiella</em>), the published
          developmental base temperature is <strong>13.4 °C</strong>, with development
          stalling above <strong>35.5 °C</strong>. When accumulated GDD since sowing
          reaches <strong>504</strong>, the first-generation adult emergence peaks —
          the highest-risk window for crop infestation.
        </p>
        <p>
          Fasal-Rakshak fetches the past 30 days of real temperature data from{' '}
          <a href="https://open-meteo.com" target="_blank" rel="noreferrer">Open-Meteo</a>{' '}
          (free, no API key required), accumulates GDD from sowing date, and projects
          days-to-threshold using the recent daily average rate. The chart on each
          farmer's risk panel makes this accumulation visible.
        </p>
      </section>

      {/* How we're different */}
      <section className="about-section">
        <h2 className="about-heading">How We Fit the Existing Landscape</h2>
        <p>
          Several strong initiatives already serve Vidarbha cotton farmers, and we see
          ourselves as complementary to all of them:
        </p>
        <ul className="about-compare">
          <li>
            <strong>CottonAce (Mahindra)</strong> — a broad agronomy advisory platform
            covering irrigation, nutrition, and market linkages across multiple crops.
            Fasal-Rakshak is pest-specific and voice-first, targeting farmers who don't
            regularly open an app.
          </li>
          <li>
            <strong>CROPSAP (Maharashtra Government)</strong> — an excellent field-scouting
            network that generates district-level pest pressure reports from physical
            traps. Our model uses weather-driven GDD prediction rather than trap counts,
            giving a 2–5 day earlier signal before the trap numbers spike.
          </li>
          <li>
            <strong>Bharat-VISTAAR (ICAR)</strong> — a nationwide knowledge-delivery
            system focused on extension content and crop management advisories.
            Fasal-Rakshak's contribution is the automated, personalised, spoken alert
            tied to an individual farmer's sowing date and field location — not a
            broadcast advisory.
          </li>
        </ul>
        <p>
          None of these deliver a proactive, farm-specific spoken Hindi alert calibrated
          to a farmer's own sowing date. That is our narrow contribution.
        </p>
      </section>

      {/* Prototype disclaimer */}
      <section className="about-section about-disclaimer">
        <h2 className="about-heading">About This Prototype</h2>
        <p>
          <strong>Call and SMS delivery is simulated in this version.</strong> Real
          outbound telephony in India requires TRAI DLT (Distributed Ledger Technology)
          registration — a compliance process that involves a registered business entity,
          a template approval workflow, and a licensed telemarketing service provider
          (TSP) such as Exotel or Ozonetel. This is intentionally deferred: the
          simulation demonstrates the end-to-end product experience while DLT
          registration is completed in parallel.
        </p>
        <p>
          Weather data is live and real (Open-Meteo). GDD calculations are based on
          published entomological thresholds. The AI message phrasing uses
          Google Gemini 2.0 Flash (free tier via AI Studio). Farmer data is stored in
          Supabase (free tier). All core costs are zero.
        </p>
      </section>

      {/* Roadmap */}
      <section className="about-section about-roadmap">
        <h2 className="about-heading">
          Roadmap
          <span className="roadmap-badge">Future scope — not built yet</span>
        </h2>
        <ul className="roadmap-list">
          <li>
            <span className="roadmap-icon">🧪</span>
            <div>
              <strong>Multi-pest &amp; multi-crop expansion</strong>
              <p>Extend GDD models to whitefly, aphids, and helicoverpa for cotton; and to soybean and tur (pigeon pea) which are common Vidarbha rotational crops.</p>
            </div>
          </li>
          <li>
            <span className="roadmap-icon">💊</span>
            <div>
              <strong>Spray cost calculator &amp; product recommendation</strong>
              <p>Based on current risk level and acreage, suggest specific generic-brand pesticides with current market rates — reducing the dependency on dealer advice that often pushes expensive branded products.</p>
            </div>
          </li>
          <li>
            <span className="roadmap-icon">📒</span>
            <div>
              <strong>Season-level expense &amp; income tracking</strong>
              <p>Simple input-cost and harvest-income log per farmer per season. Designed for voice or basic-keyboard entry, not spreadsheets.</p>
            </div>
          </li>
          <li>
            <span className="roadmap-icon">🏢</span>
            <div>
              <strong>FPO bulk registration &amp; group alerts</strong>
              <p>Allow a Farmer Producer Organisation coordinator to register 50–500 members in bulk via CSV upload, and receive consolidated risk reports for their entire cluster.</p>
            </div>
          </li>
          <li>
            <span className="roadmap-icon">📞</span>
            <div>
              <strong>Live outbound call &amp; SMS delivery</strong>
              <p>TRAI DLT registration + Exotel/Ozonetel integration to replace the current simulated call with a real automated voice call to the farmer's registered phone number.</p>
            </div>
          </li>
        </ul>
      </section>

    </div>
  )
}
