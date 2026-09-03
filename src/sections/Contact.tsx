import { useState } from 'react'

/**
 * Enquiry form. No backend is wired yet — submission composes an email in the
 * visitor's mail client. Swap ENQUIRY_EMAIL for the real inbox (and later a
 * form endpoint) before launch.
 */
const ENQUIRY_EMAIL = 'enquiries@icap.com.au'

export function Contact() {
  const [sent, setSent] = useState(false)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const subject = encodeURIComponent(
      `Consultation enquiry — ${form.get('name') ?? ''}`,
    )
    const body = encodeURIComponent(
      [
        `Name: ${form.get('name') ?? ''}`,
        `Company: ${form.get('company') ?? ''}`,
        `Phone: ${form.get('phone') ?? ''}`,
        `Email: ${form.get('email') ?? ''}`,
        '',
        `${form.get('message') ?? ''}`,
      ].join('\n'),
    )
    window.location.href = `mailto:${ENQUIRY_EMAIL}?subject=${subject}&body=${body}`
    setSent(true)
  }

  return (
    <section className="section contact" id="contact">
      <div className="container contact-grid">
        <div>
          <span className="kicker kicker--light">Get started</span>
          <h2 className="section-title section-title--light">
            Book your free consultation
          </h2>
          <p className="section-intro section-intro--light">
            Tell us about your site and where competency is hurting — we&rsquo;ll
            come back with a straight answer on what would help, and what
            wouldn&rsquo;t.
          </p>
          <ul className="checklist checklist--light">
            <li>
              <span className="checklist__dot" aria-hidden="true" />
              Free, no-obligation consultation
            </li>
            <li>
              <span className="checklist__dot" aria-hidden="true" />
              Free assessment checklist with every enquiry
            </li>
            <li>
              <span className="checklist__dot" aria-hidden="true" />
              Servicing mining, construction &amp; civil Australia-wide
            </li>
          </ul>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          <label>
            Name
            <input name="name" type="text" autoComplete="name" required />
          </label>
          <label>
            Company
            <input name="company" type="text" autoComplete="organization" />
          </label>
          <div className="contact-form__row">
            <label>
              Email
              <input name="email" type="email" autoComplete="email" required />
            </label>
            <label>
              Phone
              <input name="phone" type="tel" autoComplete="tel" />
            </label>
          </div>
          <label>
            What do you need?
            <textarea
              name="message"
              rows={4}
              placeholder="e.g. assessor coaching for our training team, or supervisor development for a new crew"
            />
          </label>
          <button className="pill pill--light" type="submit">
            Send enquiry
          </button>
          {sent && (
            <p className="contact-form__sent" role="status">
              Your email client should have opened with the enquiry ready to
              send. If not, email us directly at {ENQUIRY_EMAIL}.
            </p>
          )}
        </form>
      </div>
    </section>
  )
}
