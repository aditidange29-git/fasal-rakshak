function BilingualSection({ heading, headingHi, en, hi, className = '' }) {
  return (
    <section className={`about-section about-bilingual ${className}`}>
      <div className="bilingual-col bilingual-en">
        {heading && <h2 className="about-heading">{heading}</h2>}
        {en}
      </div>
      <div className="bilingual-divider" aria-hidden="true" />
      <div className="bilingual-col bilingual-hi">
        {headingHi && <h2 className="about-heading">{headingHi}</h2>}
        {hi}
      </div>
    </section>
  )
}

function RoadmapIcon({ type }) {
  const props = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' }
  if (type === 'flask') return <svg {...props}><path d="M9 3h6M9 3v8l-4 9h14l-4-9V3"/></svg>
  if (type === 'pill') return <svg {...props}><path d="M10.5 2.343L2.343 10.5a4.95 4.95 0 0 0 7 7L21.5 5.657a4.95 4.95 0 0 0-7-7z"/><line x1="8.5" y1="15.5" x2="15.5" y2="8.5"/></svg>
  if (type === 'book') return <svg {...props}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
  if (type === 'building') return <svg {...props}><rect x="3" y="9" width="18" height="13" rx="1"/><path d="M8 22V9"/><path d="M16 22V9"/><path d="M3 9l9-7 9 7"/></svg>
  if (type === 'phone') return <svg {...props}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.9 1.27h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9a16 16 0 0 0 6.29 6.29l1.8-1.8a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
  return null
}

export default function About() {
  return (
    <div className="about">

      <div className="bilingual-labels">
        <span>English</span>
        <span>हिन्दी</span>
      </div>

      {/* Mission */}
      <BilingualSection
        heading="Our Mission"
        headingHi="हमारा उद्देश्य"
        en={
          <>
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
          </>
        }
        hi={
          <>
            <p>
              फ़सल-रक्षक एक महँगे अंतराल को पाटने के लिए बना है — वह खाई जो तब बनती है
              जब गुलाबी सूँडी का ख़तरा अनुमानित हो जाता है, पर विदर्भ का लघु-कृषक किसान
              उसे जान नहीं पाता। वास्तविक मौसम के आँकड़ों और प्रकाशित कीट-विज्ञान की
              सीमाओं को मिलाकर हम एक बोली जाने वाली हिंदी चेतावनी सीधे किसान के
              साधारण फ़ोन पर पहुँचाते हैं — नुकसान होने से पहले, बाद में नहीं।
            </p>
            <p>
              हमारा ध्यान जानबूझकर सीमित है। एक कीट, एक फ़सल, एक क्षेत्र — और वह भी
              भलीभाँति। नुकसान से पहले की वह पुकार।
            </p>
          </>
        }
      />

      {/* GDD Science */}
      <BilingualSection
        heading="The Science: Degree-Days"
        headingHi="विज्ञान: ताप-संचय दिवस (GDD)"
        en={
          <>
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
              days-to-threshold using the recent daily average rate.
            </p>
          </>
        }
        hi={
          <>
            <p>
              कीट पंचांग के अनुसार नहीं, बल्कि संचित उष्मा के आधार पर विकसित होते हैं।
              एक <strong>ताप-संचय दिवस (GDD)</strong> वह ऊष्मा-ऊर्जा है जो किसी कीट के
              विकास के लिए एक दिन में उपलब्ध होती है:
            </p>
            <div className="about-formula">
              GDD = max(0, ((T<sub>अधि॰</sub> + T<sub>न्यू॰</sub>) / 2) − T<sub>आधार</sub>)
            </div>
            <p>
              गुलाबी सूँडी (<em>Pectinophora gossypiella</em>) के लिए प्रकाशित आधार-तापमान
              <strong> 13.4 °C</strong> है और <strong>35.5 °C</strong> से ऊपर विकास
              थम जाता है। बुवाई के बाद जब संचित GDD <strong>504</strong> तक पहुँचता है,
              तो प्रथम पीढ़ी के वयस्क कीटों का प्रकटन चरम पर होता है।
            </p>
            <p>
              फ़सल-रक्षक{' '}
              <a href="https://open-meteo.com" target="_blank" rel="noreferrer">Open-Meteo</a>{' '}
              से पिछले ३० दिनों का वास्तविक तापमान डेटा प्राप्त करता है, बुवाई की तिथि
              से GDD संचय करता है और हालिया औसत दैनिया दर के आधार पर सीमा तक पहुँचने
              के दिनों का पूर्वानुमान लगाता है।
            </p>
          </>
        }
      />

      {/* How We Fit */}
      <BilingualSection
        heading="How We Fit the Existing Landscape"
        headingHi="मौजूदा परिदृश्य में हमारी भूमिका"
        en={
          <>
            <p>
              Several strong initiatives already serve Vidarbha cotton farmers.
              We see ourselves as complementary to all of them:
            </p>
            <ul className="about-compare">
              <li>
                <strong>CottonAce (Mahindra)</strong> — a broad agronomy advisory platform
                covering irrigation, nutrition, and market linkages. Fasal-Rakshak is
                pest-specific and voice-first, targeting farmers who don't regularly open an app.
              </li>
              <li>
                <strong>CROPSAP (Maharashtra Govt.)</strong> — field-scouting network
                generating district-level pest reports from physical traps. Our GDD model
                gives a 2–5 day earlier warning before trap numbers spike.
              </li>
              <li>
                <strong>Bharat-VISTAAR (ICAR)</strong> — a nationwide knowledge-delivery
                system for extension content. Fasal-Rakshak adds an automated, personalised,
                spoken alert tied to each farmer's sowing date — not a broadcast advisory.
              </li>
            </ul>
            <p>
              None of these deliver a proactive, farm-specific spoken Hindi alert calibrated
              to a farmer's own sowing date. That is our narrow contribution.
            </p>
          </>
        }
        hi={
          <>
            <p>
              विदर्भ के कपास किसानों की सेवा में पहले से अनेक सुदृढ़ पहलें कार्यरत हैं।
              हम उन सबके पूरक हैं, प्रतिस्पर्धी नहीं:
            </p>
            <ul className="about-compare">
              <li>
                <strong>CottonAce (महिन्द्रा)</strong> — सिंचाई, पोषण और बाज़ार-संपर्क
                को समेटने वाला एक व्यापक कृषि-परामर्श मंच।
              </li>
              <li>
                <strong>CROPSAP (महाराष्ट्र शासन)</strong> — भौतिक जालों से जिला-स्तरीय
                कीट-दबाव रिपोर्ट तैयार करने वाला खेत-निरीक्षण नेटवर्क।
              </li>
              <li>
                <strong>भारत-विस्तार (ICAR)</strong> — विस्तार-सामग्री के लिए देशव्यापी
                ज्ञान-प्रसार तंत्र।
              </li>
            </ul>
            <p>
              इनमें से कोई भी किसान की अपनी बुवाई-तिथि के अनुसार अंशांकित, खेत-विशिष्ट,
              हिंदी वाचिक चेतावनी सक्रिय रूप से नहीं देता।
            </p>
          </>
        }
      />

      {/* Prototype Disclaimer */}
      <BilingualSection
        heading="About This Prototype"
        headingHi="इस प्रारूप के बारे में"
        className="about-disclaimer"
        en={
          <>
            <p>
              <strong>Call and SMS delivery is simulated in this version.</strong> Real
              outbound telephony in India requires TRAI DLT registration — involving a
              registered business entity, template approval, and a licensed TSP such as
              Exotel or Ozonetel. This is intentionally deferred while DLT registration
              is completed in parallel.
            </p>
            <p>
              Weather data is live and real (Open-Meteo). GDD calculations use published
              entomological thresholds. AI message phrasing uses Google Gemini 2.0 Flash
              (free tier). Farmer data is stored in Supabase (free tier).
            </p>
          </>
        }
        hi={
          <>
            <p>
              <strong>इस संस्करण में कॉल और SMS प्रेषण अनुकरण मात्र है।</strong>{' '}
              भारत में वास्तविक आउटबाउंड दूरसंचार के लिए TRAI DLT पंजीकरण अनिवार्य है।
              DLT पंजीकरण पूर्ण होने तक यह जानबूझकर स्थगित है।
            </p>
            <p>
              मौसम डेटा वास्तविक और जीवंत है (Open-Meteo)। GDD गणना प्रकाशित
              कीट-विज्ञान सीमाओं पर आधारित है। AI संदेश निर्माण हेतु Google Gemini 2.0
              Flash (निःशुल्क स्तर) का उपयोग है।
            </p>
          </>
        }
      />

      {/* Roadmap */}
      <BilingualSection
        heading="Roadmap"
        headingHi="भावी कार्य-योजना"
        className="about-roadmap"
        en={
          <>
            <p className="roadmap-note">
              <span className="roadmap-badge">Future scope — not built yet</span>
            </p>
            <ul className="roadmap-list">
              {[
                { type: 'flask',    title: 'Multi-pest & multi-crop expansion',       body: 'Extend GDD models to whitefly, aphids, and helicoverpa for cotton; and to soybean and tur.' },
                { type: 'pill',     title: 'Spray cost calculator & recommendation',   body: 'Suggest generic-brand pesticides with current market rates based on risk level and acreage.' },
                { type: 'book',     title: 'Season-level expense & income tracking',   body: 'Simple input-cost and harvest-income log per farmer, designed for voice or basic-keyboard entry.' },
                { type: 'building', title: 'FPO bulk registration & group alerts',     body: 'Allow an FPO coordinator to register 50–500 members via CSV and receive consolidated risk reports.' },
                { type: 'phone',    title: 'Live outbound call & SMS delivery',        body: 'TRAI DLT registration + Exotel/Ozonetel to replace the simulated call with a real automated voice call.' },
              ].map(({ type, title, body }) => (
                <li key={type}>
                  <span className="roadmap-icon-wrap"><RoadmapIcon type={type} /></span>
                  <div>
                    <strong>{title}</strong>
                    <p>{body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </>
        }
        hi={
          <>
            <p className="roadmap-note">
              <span className="roadmap-badge">भावी विस्तार — अभी निर्मित नहीं</span>
            </p>
            <ul className="roadmap-list">
              {[
                { type: 'flask',    title: 'बहु-कीट एवं बहु-फ़सल विस्तार',             body: 'कपास के लिए श्वेत-मक्खी, माहू और हेलिकोवर्पा; तथा सोयाबीन एवं अरहर के लिए GDD मॉडल का विस्तार।' },
                { type: 'pill',     title: 'छिड़काव-लागत परिकलक एवं उत्पाद अनुशंसा',  body: 'जोखिम स्तर और भूमि-क्षेत्रफल के आधार पर चालू बाज़ार भावों सहित सामान्य कीटनाशकों का सुझाव।' },
                { type: 'book',     title: 'मौसमी व्यय एवं आय का अभिलेख',             body: 'प्रति किसान, प्रति मौसम — वाणी या साधारण कीपैड से दर्ज करने योग्य निवेश-लागत और उपज-आय का सरल लेखा।' },
                { type: 'building', title: 'FPO सामूहिक पंजीकरण एवं समूह चेतावनी',   body: 'FPO समन्वयक द्वारा CSV के माध्यम से ५०–५०० सदस्यों का एक साथ पंजीकरण।' },
                { type: 'phone',    title: 'वास्तविक आउटबाउंड कॉल एवं SMS प्रेषण',    body: 'TRAI DLT पंजीकरण + Exotel/Ozonetel एकीकरण से अनुकरण कॉल को वास्तविक कॉल से प्रतिस्थापित करना।' },
              ].map(({ type, title, body }) => (
                <li key={type}>
                  <span className="roadmap-icon-wrap"><RoadmapIcon type={type} /></span>
                  <div>
                    <strong>{title}</strong>
                    <p>{body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </>
        }
      />

    </div>
  )
}
