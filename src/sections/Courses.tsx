import { useId, useState } from 'react'
import data from '../content/courses.json'

type Module = { label: string; soon?: boolean }
type Category = (typeof data.categories)[number]

function CourseCard({
  category,
  onExplore,
}: {
  category: Category
  onExplore: (slug: string) => void
}) {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const modules = category.modules as Module[]

  return (
    <article className="course-card">
      <p className="course-card__kicker">{category.kicker}</p>
      <h3>{category.title}</h3>
      <p className="course-card__blurb">{category.blurb}</p>
      <p className="course-card__meta">{category.format}</p>

      <div className="course-card__actions">
        <button
          className="pill"
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? 'Hide courses' : 'View courses'}
        </button>
        <span className="course-card__price">
          {category.price}
          <small>{category.priceNote}</small>
        </span>
      </div>

      <div
        className={`course-card__panel${open ? ' is-open' : ''}`}
        id={panelId}
        ref={(el) => {
          // Collapsed panels stay out of the tab order and the a11y tree.
          if (el) el.inert = !open
        }}
      >
        <div className="course-card__panel-inner">
          <p className="course-card__panel-label">What&rsquo;s covered</p>
          <ul className="checklist">
            {modules.map((module, index) => (
              <li
                key={module.label}
                className={module.soon ? 'is-soon' : ''}
                style={{ transitionDelay: open ? `${120 + index * 90}ms` : '0ms' }}
              >
                <span className="checklist__dot" aria-hidden="true" />
                {module.label}
                {module.soon && <span className="soon-pill">Coming soon</span>}
              </li>
            ))}
          </ul>
          <button
            className="course-card__more"
            type="button"
            onClick={() => onExplore(category.slug)}
          >
            Full details in the catalogue →
          </button>
        </div>
      </div>
    </article>
  )
}

export function Courses({ onExplore }: { onExplore: (slug: string) => void }) {
  return (
    <section className="section" id="courses">
      <div className="container">
        <span className="kicker">Courses &amp; services</span>
        <h2 className="section-title">What ICAP offers</h2>
        <p className="section-intro">
          From sharpening a single assessor to rebuilding how your whole site
          trains, assesses and leads — every program is built for mining,
          construction and civil environments.
        </p>

        <div className="course-grid">
          {data.categories.map((category) => (
            <CourseCard key={category.slug} category={category} onExplore={onExplore} />
          ))}
          <aside className="course-card course-card--cta">
            <h3>Not sure where to start?</h3>
            <p className="course-card__blurb">
              Browse the full catalogue by role — assessor, supervisor,
              whole crew — or talk it through with us.
            </p>
            <div className="course-card__cta-stack">
              <button className="pill pill--light" type="button" onClick={() => onExplore('')}>
                Browse full catalogue
              </button>
              <a className="pill pill--ghost-navy" href="#contact">
                Book a free consultation
              </a>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
