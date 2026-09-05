const CREDENTIALS = [
  'S26 certified · Cert IV Assessor qualification',
  'Diploma of Surface Operations Management (RII50120)',
  'Background in mining and civil industry',
  'Strength in training, supervision and assessment systems',
]

const MISSION =
  'To raise the standard of competency, compliance and training quality across Australia.'

const TEAM = [
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
    role: 'Data & Analytics',
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
          {TEAM.map((member) => (
            <article className="member" key={member.name}>
              <div className="member__portrait">
                <img
                  src={member.portrait}
                  alt={`${member.name}, ${member.role}`}
                  width={800}
                  height={1000}
                  loading="lazy"
                />
              </div>
              <div className="member__body">
                <h3>{member.name}</h3>
                <p className="member__role">{member.role}</p>
                <p className="member__bio">{member.bio}</p>
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

        <p className="about-mission">
          <span className="about-mission__label">Our mission</span>
          <span className="about-mission__text">{MISSION}</span>
        </p>
      </div>
    </section>
  )
}
