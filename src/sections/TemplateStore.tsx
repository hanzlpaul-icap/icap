import { useId, useState } from 'react'
import data from '../content/courses.json'
import { ChecklistDownload } from './ChecklistDownload'
import { ENQUIRY_EMAIL } from './Contact'

/**
 * Nothing is sold through the site. A visitor emails Pavel for a copy and he
 * replies personally with the PDF. The item and price go in the subject so
 * each request is obvious in the inbox; the body leaves room for who is asking.
 */
function copyRequest(item: string, price: string): string {
  const subject = `Copy request: ${item} (PDF), ${price}`
  const body = [
    'Hi Pavel,',
    '',
    `Please send me a copy of the ${item} (PDF, ${price}).`,
    '',
    'Name:',
    'Company:',
    'Phone:',
  ].join('\n')
  return `mailto:${ENQUIRY_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

/**
 * Sixteen machines would dominate a section whose job is to sell three packs,
 * so the list opens on demand — the same disclosure the course cards use.
 */
function SingleVoc() {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const { price, packTitle, packPrice, individualTotal, machines } = data.singleVoc

  return (
    <div className="single-voc">
      <div className="single-voc__head">
        <div className="single-voc__intro">
          <p className="single-voc__label">Only run a few machines?</p>
          <h3 className="single-voc__title">Single VOCs, {price} each</h3>
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
          {open ? 'Hide machines' : 'View machines'}
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
          <p className="single-voc__hint">
            Select a machine to email Pavel for that VOC.
          </p>
          <ul className="voc-machines">
            {machines.map((machine, index) => (
              <li
                className="voc-machine"
                key={machine.code}
                style={{ transitionDelay: open ? `${100 + index * 35}ms` : '0ms' }}
              >
                {/* The whole row is the link — sixteen separate "Email" links
                    beside the names would read as noise. */}
                <a
                  className="voc-machine__email"
                  href={copyRequest(`${machine.name} VOC`, price)}
                  aria-label={`Email for a copy of the ${machine.name} VOC, ${price}`}
                >
                  <span className="voc-machine__code">{machine.code}</span>
                  <span className="voc-machine__name">{machine.name}</span>
                  <span className="voc-machine__price">{price}</span>
                </a>
              </li>
            ))}
          </ul>
          <p className="single-voc__note">
            Every VOC is the complete form — pre-start, operating criteria,
            hazards, knowledge questions and the assessor declaration. The
            currency register and the pack guide come with the full pack only.
            The free assessment checklist below follows the same layout, if you
            want to see the format first.
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
 * the course cards use, so a buyer can see what they would get before asking
 * for a copy.
 */
function PackCard({ template }: { template: Template }) {
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
        <a className="pill pill--light" href={copyRequest(template.title, template.price)}>
          Email for a copy
        </a>
        <button
          className="pill pill--ghost"
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

export function TemplateStore() {
  return (
    <section className="section store" id="templates">
      <div className="container">
        <span className="kicker kicker--light">Digital templates &amp; tools</span>
        <h2 className="section-title section-title--light">
          Tools built from the field
        </h2>
        <p className="section-intro section-intro--light">
          The same instruments ICAP uses on site, packaged ready to use on your
          own site and plant.
        </p>

        <div className="store-grid">
          {data.templates.map((template) => (
            <PackCard key={template.title} template={template} />
          ))}
        </div>
        <p className="store-note">
          Email Pavel for a copy of any pack or single VOC and he&rsquo;ll reply
          personally with the PDF and how to pay. If the button doesn&rsquo;t
          open your email, write to {ENQUIRY_EMAIL}.
        </p>

        <SingleVoc />

        <ChecklistDownload />
      </div>
    </section>
  )
}
