const CREDENTIALS = [
  'S26 certified · Cert IV Assessor qualification',
  'Diploma of Surface Operations Management (RII50120)',
  'Background in mining and civil industry',
  'Strength in training, supervision and assessment systems',
]

const DIRECTORS = [
  {
    initials: 'PH',
    name: 'Pavel Hanzl',
    role: 'Director · Trainer & Assessor',
    portrait: '/images/team/pavel-portrait.jpg',
    bio: 'A qualified Trainer & Assessor with extensive experience across mining operations, supervision and workforce competency. Pavel builds the assessment systems and delivers the coaching that lifts crews from compliant to genuinely capable.',
  },
  {
    initials: 'JH',
    name: 'John Henry',
    role: 'Director · Data & Analytics',
    portrait: '/images/team/john-portrait.jpg',
    bio: 'A qualified data analyst with solid proficiency in business data collaboration — helping teams interpret insights, streamline workflows and improve operational decision-making, so training effort goes exactly where the data says it should.',
  },
]

export function About() {
  return (
    <section className="section about" id="about">
      <div className="container">
        <span className="kicker">About ICAP</span>
        <h2 className="section-title">
          Raising the standard of competency across Australia
        </h2>
        <p className="section-intro">
          Industry Compliance &amp; Proficiency Australia exists to lift the
          quality of competency, compliance and training everywhere crews do
          hard, high-consequence work.
        </p>

        <div className="about-grid">
          {DIRECTORS.map((director) => (
            <article className="director" key={director.name}>
              <div className="director__portrait">
                <img
                  src={director.portrait}
                  alt={`${director.name}, ${director.role}`}
                  width={800}
                  height={1000}
                  loading="lazy"
                />
              </div>
              <div className="director__body">
                <h3>{director.name}</h3>
                <p className="director__role">{director.role}</p>
                <p className="director__bio">{director.bio}</p>
              </div>
            </article>
          ))}

          <aside className="about-creds">
            <h3>Credentials</h3>
            <ul className="checklist checklist--static">
              {CREDENTIALS.map((credential) => (
                <li key={credential}>
                  <span className="checklist__dot" aria-hidden="true" />
                  {credential}
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </section>
  )
}
