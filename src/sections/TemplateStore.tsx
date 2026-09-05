import data from '../content/courses.json'

export function TemplateStore() {
  return (
    <section className="section store" id="templates">
      <div className="container">
        <span className="kicker kicker--light">Digital templates &amp; tools</span>
        <h2 className="section-title section-title--light">
          Tools built from the field
        </h2>
        <p className="section-intro section-intro--light">
          The same instruments ICAP uses on site, packaged for you to adapt to
          your own standards and plant.
        </p>

        <div className="store-grid">
          {data.templates.map((template) => (
            <article className={`store-card${template.soon ? ' is-soon' : ''}`} key={template.title}>
              <div className="store-card__head">
                <h3>{template.title}</h3>
                <span className="store-card__price">{template.price}</span>
              </div>
              <p>{template.blurb}</p>
              {template.soon ? (
                <span className="soon-pill">Coming soon</span>
              ) : (
                <a className="pill pill--light" href="#contact">
                  Get the pack
                </a>
              )}
            </article>
          ))}
        </div>
        <p className="store-note">
          Each pack is written and in final preparation. Tell us which one you
          need — we&rsquo;ll let you know as soon as it&rsquo;s ready, and take your
          site&rsquo;s requirements into account while we finish it.
        </p>

        <div className="single-voc">
          <div className="single-voc__head">
            <div className="single-voc__intro">
              <p className="single-voc__label">Only run a few machines?</p>
              <h3 className="single-voc__title">
                Buy a single VOC for {data.singleVoc.price}
              </h3>
            </div>
            <p className="single-voc__anchor">
              All sixteen bought separately come to{' '}
              <strong>{data.singleVoc.individualTotal}</strong>. The{' '}
              {data.singleVoc.packTitle} covers the lot for{' '}
              <strong>{data.singleVoc.packPrice}</strong>.
            </p>
          </div>

          <ul className="voc-machines">
            {data.singleVoc.machines.map((machine) => (
              <li className="voc-machine" key={machine.code}>
                <span className="voc-machine__code">{machine.code}</span>
                <span className="voc-machine__name">{machine.name}</span>
                <span className="voc-machine__price">{data.singleVoc.price}</span>
              </li>
            ))}
          </ul>

          <p className="single-voc__note">
            Every VOC is the complete form — pre-start, operating criteria,
            hazards, knowledge questions and the assessor declaration. The
            currency register and the pack guide come with the full pack only.
          </p>
        </div>

        <div className="store-free">
          <div className="store-free__copy">
            <p className="store-free__label">Free download</p>
            <h3 className="store-free__title">Assessment checklist</h3>
            <p className="store-free__blurb">
              A complete verification of competency form covering the steps
              common to any mobile plant — free to use and adapt on your own
              site. No sign-up, no catch.
            </p>
          </div>
          <a
            className="pill pill--light store-free__cta"
            href="/downloads/icap-assessment-checklist.pdf"
            target="_blank"
            rel="noopener"
          >
            Download the checklist
          </a>
        </div>
      </div>
    </section>
  )
}
