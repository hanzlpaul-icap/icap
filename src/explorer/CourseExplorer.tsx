import { useEffect, useMemo, useRef, useState } from 'react'
import data from '../content/courses.json'
import './explorer.css'

type Module = { label: string; soon?: boolean }
type Category = (typeof data.categories)[number]

const STAGE_BARS: Record<string, number> = {
  assessor: 38,
  supervisor: 50,
  crew: 62,
}

/**
 * Full-screen course catalogue: a capability pathway (stage filter) across the
 * top, category rail on the left, course prospectus on the right. Opens from
 * any "view courses" CTA; deep-linked via #catalogue/<slug>.
 */
export function CourseExplorer({
  initialSlug,
  onClose,
}: {
  initialSlug: string
  onClose: () => void
}) {
  const initial = data.categories.find((c) => c.slug === initialSlug)
  const [stage, setStage] = useState<string | null>(initial ? initial.stage : null)
  const [active, setActive] = useState<Category>(initial ?? data.categories[0])
  const dialogRef = useRef<HTMLDivElement | null>(null)

  const visible = useMemo(
    () => data.categories.filter((c) => stage === null || c.stage === stage),
    [stage],
  )

  useEffect(() => {
    if (!visible.some((c) => c.slug === active.slug) && visible.length > 0) {
      setActive(visible[0])
    }
  }, [visible, active.slug])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    dialogRef.current?.focus()
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Make the page behind the dialog inert (traps focus and hides it from
  // assistive tech), and restore focus to the trigger on close.
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null
    const root = document.getElementById('root')
    const dialogEl = dialogRef.current
    const siblings = root
      ? [...root.children].filter(
          (el): el is HTMLElement => el instanceof HTMLElement && !el.contains(dialogEl),
        )
      : []
    siblings.forEach((el) => {
      el.inert = true
    })
    return () => {
      siblings.forEach((el) => {
        el.inert = false
      })
      previouslyFocused?.focus?.()
    }
  }, [])

  const pickStage = (slug: string) => {
    setStage((current) => (current === slug ? null : slug))
  }

  const modules = active.modules as Module[]
  const stageName = data.stages.find((s) => s.slug === active.stage)?.name

  return (
    <div
      className="explorer"
      role="dialog"
      aria-modal="true"
      aria-label="ICAP course catalogue"
      ref={dialogRef}
      tabIndex={-1}
    >
      <div className="explorer__scrim" onClick={onClose} />
      <div className="explorer__panel">
        <header className="explorer__head">
          <div>
            <span className="kicker kicker--light">Course catalogue</span>
            <h2>Find the right program for every role</h2>
          </div>
          <button className="explorer__close" type="button" onClick={onClose} aria-label="Close catalogue">
            ×
          </button>
        </header>

        <div className="explorer__pathway" role="group" aria-label="Filter by role">
          {data.stages.map((s) => (
            <button
              key={s.slug}
              type="button"
              className={`explorer__stage${stage === s.slug ? ' is-on' : ''}`}
              aria-pressed={stage === s.slug}
              onClick={() => pickStage(s.slug)}
              title={s.blurb}
            >
              <span className="explorer__bars" aria-hidden="true">
                {[0.5, 0.75, 1].map((f, i) => (
                  <i key={i} style={{ height: `${((STAGE_BARS[s.slug] * f) / 62) * 100}%` }} />
                ))}
              </span>
              {s.name}
            </button>
          ))}
          {stage !== null && (
            <button type="button" className="explorer__clear" onClick={() => setStage(null)}>
              Show all
            </button>
          )}
        </div>

        <div className="explorer__body">
          <nav className="explorer__rail" aria-label="Courses">
            {visible.map((category) => (
              <button
                key={category.slug}
                type="button"
                className={`explorer__railitem${category.slug === active.slug ? ' is-on' : ''}`}
                aria-current={category.slug === active.slug}
                onClick={() => setActive(category)}
              >
                <span>{category.title}</span>
                <small>{category.price}</small>
              </button>
            ))}
          </nav>

          <article className="explorer__detail" key={active.slug}>
            <p className="explorer__kicker">
              {active.kicker}
              {stageName && <em> · {stageName}</em>}
            </p>
            <h3>{active.title}</h3>
            <p className="explorer__blurb">{active.blurb}</p>
            <p className="explorer__meta">{active.format}</p>

            <p className="explorer__label">What&rsquo;s covered</p>
            <ul className="checklist checklist--explorer">
              {modules.map((module, index) => (
                <li
                  key={module.label}
                  className={module.soon ? 'is-soon' : ''}
                  style={{ animationDelay: `${90 + index * 70}ms` }}
                >
                  <span className="checklist__dot" aria-hidden="true" />
                  {module.label}
                  {module.soon && <span className="soon-pill">Coming soon</span>}
                </li>
              ))}
            </ul>

            <div className="explorer__foot">
              <span className="explorer__price">
                {active.price}
                <small>{active.priceNote}</small>
              </span>
              <a className="pill" href="#contact" onClick={onClose}>
                Enquire about this program
              </a>
            </div>
          </article>
        </div>
      </div>
    </div>
  )
}
