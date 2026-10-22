import { useId, useState } from 'react'
import data from '../content/courses.json'
import { ChecklistDownload } from './ChecklistDownload'
import type { OrderRequest } from './Contact'

type OrderHandler = (order: OrderRequest) => void

/**
 * Sixteen machines would dominate a section whose job is to sell three packs,
 * so the list opens on demand — the same disclosure the course cards use.
 */
function SingleVoc({ onOrder }: { onOrder: OrderHandler }) {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const { price, packTitle, packPrice, individualTotal, machines, soon } =
    data.singleVoc

  return (
    <div className="single-voc">
      <div className="single-voc__head">
        <div className="single-voc__intro">
          <p className="single-voc__label">Only run a few machines?</p>
          <h3 className="single-voc__title">Buy a single VOC for {price}</h3>
        </div>
        <p className="single-voc__anchor">
          All sixteen bought separately come to <strong>{individualTotal}</strong>.
          The {packTitle} covers the lot for <strong>{packPrice}</strong>.
        </p>
      </div>

      <div className="single-voc__actions">
        <button
          className="pill pill--light"
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? 'Hide machines' : 'Choose your machine'}
        </button>
        <span className="single-voc__count">
          {machines.length} machines · {price} each
        </span>
      </div>

      <div
        className={`single-voc__panel${open ? ' is-open' : ''}`}
        id={panelId}
        ref={(el) => {
          // Collapsed panels stay out of the tab order and the a11y tree.
          if (el) el.inert = !open
        }}
      >
        <div className="single-voc__panel-inner">
          <ul className="voc-machines">
            {machines.map((machine, index) => {
              // The whole row is the target when ordering is open — sixteen
              // separate "Order" links beside the names would read as noise.
              const row = (
                <>
                  <span className="voc-machine__code">{machine.code}</span>
                  <span className="voc-machine__name">{machine.name}</span>
                  <span className="voc-machine__price">{price}</span>
                </>
              )
              return (
                <li
                  className="voc-machine"
                  key={machine.code}
                  style={{ transitionDelay: open ? `${100 + index * 35}ms` : '0ms' }}
                >
                  {soon ? (
                    row
                  ) : (
                    <button
                      className="voc-machine__order"
                      type="button"
                      onClick={() =>
                        onOrder({ title: `${machine.name} VOC`, price })
                      }
                    >
                      {row}
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
          <p className="single-voc__note">
            Every VOC is the complete form — pre-start, operating criteria,
            hazards, knowledge questions and the assessor declaration. The
            currency register and the pack guide come with the full pack only.
          </p>
        </div>
      </div>
    </div>
  )
}

type PackItem = { name: string; note?: string }
type PackGroup = { label: string; items?: PackItem[]; note?: string }
type Template = (typeof data.templates)[number]

/**
 * One pack. "View" opens the full document list in place, the same disclosure
 * the course cards use, so a buyer can see what they would get before the
 * pack is on sale as well as after.
 */
function PackCard({
  template,
  onOrder,
}: {
  template: Template
  onOrder: OrderHandler
}) {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const groups = template.contents as PackGroup[]

  return (
    <article className="store-card">
      <div className="store-card__head">
        <h3>{template.title}</h3>
        <span className="store-card__price">{template.price}</span>
      </div>
      <p>{template.blurb}</p>

      <div className="store-card__actions">
        {!template.soon && (
          /* "Order now" rather than "Purchase now": there is no checkout,
             and a button that promises one would surprise a first-time
             buyer at the worst moment. The store note below sets the
             expectation before anyone clicks. */
          <a
            className="pill pill--light"
            href="#contact"
            onClick={() =>
              onOrder({ title: template.title, price: template.price })
            }
          >
            Order now
          </a>
        )}
        <button
          className={`pill ${template.soon ? 'pill--light' : 'pill--ghost'}`}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? 'Hide' : 'View'}
        </button>
      </div>

      <div
        className={`store-card__panel${open ? ' is-open' : ''}`}
        id={panelId}
        ref={(el) => {
          // Collapsed panels stay out of the tab order and the a11y tree.
          if (el) el.inert = !open
        }}
      >
        <div className="store-card__panel-inner">
          <p className="store-card__summary">{template.summary}</p>
          {groups.map((group) => (
            <div className="pack-group" key={group.label}>
              <p className="pack-group__label">{group.label}</p>
              {group.items && (
                <ul className="pack-items">
                  {group.items.map((item) => (
                    <li className="pack-item" key={item.name}>
                      <span className="pack-item__name">{item.name}</span>
                      {item.note && (
                        <span className="pack-item__note">{item.note}</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
              {group.note && <p className="pack-group__note">{group.note}</p>}
            </div>
          ))}
        </div>
      </div>
    </article>
  )
}

export function TemplateStore({ onOrder }: { onOrder: OrderHandler }) {
  const anyOrderable =
    data.templates.some((t) => !t.soon) || !data.singleVoc.soon

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
            <PackCard key={template.title} template={template} onOrder={onOrder} />
          ))}
        </div>
        <p className="store-note">
          {anyOrderable ? (
            <>
              Orders are invoiced, not checked out. Tell us what you need, we
              send an invoice with our bank details, and the files come through
              as soon as payment clears.
            </>
          ) : (
            <>
              Each pack is written and in final preparation. Tell us which one
              you need — we&rsquo;ll let you know as soon as it&rsquo;s ready, and
              take your site&rsquo;s requirements into account while we finish it.
            </>
          )}
        </p>

        <SingleVoc onOrder={onOrder} />

        <ChecklistDownload />
      </div>
    </section>
  )
}
