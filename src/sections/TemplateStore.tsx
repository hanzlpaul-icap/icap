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
      </div>
    </section>
  )
}
