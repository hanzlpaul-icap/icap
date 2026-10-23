import { useEffect, useId, useRef, useState } from 'react'

const CHECKLIST_URL = '/downloads/icap-assessment-checklist.pdf'
const CHECKLIST_NAME = 'ICAP-Assessment-Checklist.pdf'
const LEAD_ENDPOINT = '/api/checklist-lead'

/**
 * The free checklist, in exchange for the visitor's details. The details go to
 * api/checklist-lead, which saves them to Supabase and emails them to ICAP.
 * The download never waits on that: a fault on our side must not cost the
 * visitor the file.
 */
export function ChecklistDownload() {
  const [open, setOpen] = useState(false)
  const [firstName, setFirstName] = useState<string | null>(null)
  const panelId = useId()
  const nameInput = useRef<HTMLInputElement>(null)
  const thanks = useRef<HTMLParagraphElement>(null)
  const file = useRef<HTMLAnchorElement>(null)

  // The button that opened the form goes away, so focus follows into the form
  // rather than falling back to the top of the page.
  useEffect(() => {
    if (open && !firstName) nameInput.current?.focus()
  }, [open, firstName])

  useEffect(() => {
    if (firstName) thanks.current?.focus()
  }, [firstName])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const body = new URLSearchParams()
    for (const [key, value] of form) {
      if (typeof value === 'string') body.append(key, value)
    }
    // A beacon needs no reply and survives the download starting. If the
    // browser will not queue one, a keepalive fetch does the same job.
    if (!navigator.sendBeacon(LEAD_ENDPOINT, body)) {
      fetch(LEAD_ENDPOINT, { method: 'POST', body, keepalive: true }).catch(
        () => {},
      )
    }
    // Still inside the visitor's click, so the browser treats the download as
    // theirs rather than as a page starting one on its own.
    file.current?.click()
    const name = String(form.get('name') ?? '').trim()
    setFirstName(name.split(/\s+/)[0] || 'there')
  }

  return (
    <div className="store-free">
      <div className="store-free__head">
        <div className="store-free__copy">
          <p className="store-free__label">Free download</p>
          <h3 className="store-free__title">Assessment checklist</h3>
          <p className="store-free__blurb">
            A complete verification of competency form covering the steps common
            to any mobile plant — free to use and adapt on your own site. Leave
            your details and the download starts straight away.
          </p>
        </div>
        {!open && (
          <button
            className="pill pill--light store-free__cta"
            type="button"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen(true)}
          >
            Download the checklist
          </button>
        )}
      </div>

      <div
        className={`store-free__panel${open ? ' is-open' : ''}`}
        id={panelId}
        ref={(el) => {
          // Collapsed panels stay out of the tab order and the a11y tree.
          if (el) el.inert = !open
        }}
      >
        <div className="store-free__panel-inner">
          {firstName ? (
            <p
              className="contact-form__sent store-free__thanks"
              role="status"
              tabIndex={-1}
              ref={thanks}
            >
              Thanks, {firstName}. The checklist is downloading. If it
              didn&rsquo;t start,{' '}
              <a href={CHECKLIST_URL} download={CHECKLIST_NAME}>
                download it here
              </a>
              .
            </p>
          ) : (
            <form className="contact-form store-free__form" onSubmit={handleSubmit}>
              <div className="contact-form__row">
                <label>
                  Name
                  <input
                    ref={nameInput}
                    name="name"
                    type="text"
                    autoComplete="name"
                    maxLength={100}
                    required
                  />
                </label>
                <label>
                  Company
                  <input
                    name="company"
                    type="text"
                    autoComplete="organization"
                    maxLength={150}
                    required
                  />
                </label>
              </div>
              <div className="contact-form__row">
                <label>
                  Email
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    maxLength={254}
                    required
                  />
                </label>
                <label>
                  Phone (optional)
                  <input name="phone" type="tel" autoComplete="tel" maxLength={40} />
                </label>
              </div>
              <label className="store-free__optin">
                <input name="updates" type="checkbox" value="yes" />
                Send me the occasional update when ICAP releases new tools
              </label>
              {/* Left empty by people, filled in by bots. Hidden from sight and
                  from screen readers alike. */}
              <div className="sr-only" aria-hidden="true">
                <label>
                  Website
                  <input name="website" type="text" tabIndex={-1} autoComplete="off" />
                </label>
              </div>
              <button className="pill pill--light" type="submit">
                Download the checklist
              </button>
              <p className="contact-form__terms">
                Your details come to ICAP only, so we know who&rsquo;s using the
                checklist and can follow up about it. We never share them.
              </p>
            </form>
          )}
        </div>
      </div>

      {/* Clicked on submit. Kept out of sight: the visible fallback link sits
          in the thank-you message. */}
      <a ref={file} href={CHECKLIST_URL} download={CHECKLIST_NAME} hidden tabIndex={-1} />
    </div>
  )
}
