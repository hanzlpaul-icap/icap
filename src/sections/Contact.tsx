import { useState } from 'react'

/**
 * Enquiry form. No backend is wired yet — submission composes an email in the
 * visitor's mail client. Swap ENQUIRY_EMAIL for the real inbox (and later a
 * form endpoint) before launch.
 */
const ENQUIRY_EMAIL = 'enquiries@icap.com.au'

/** A product the visitor asked to order, carried over from the template store. */
export type OrderRequest = {
  title: string
  price: string
}

export function Contact({
  order,
  onClearOrder,
}: {
  order?: OrderRequest | null
  onClearOrder?: () => void
}) {
  const [sent, setSent] = useState(false)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const subject = encodeURIComponent(
      order
        ? `Order request — ${order.title}`
        : `Consultation enquiry — ${form.get('name') ?? ''}`,
    )
    const body = encodeURIComponent(
      [
        // The product goes at the top of the email, not buried in the message,
        // so an order is obvious at a glance in the inbox.
        ...(order ? [`Ordering: ${order.title} — ${order.price}`, ''] : []),
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
          {order && (
            <div className="order-chip">
              <div className="order-chip__copy">
                <span className="order-chip__label">Order request</span>
                <span className="order-chip__title">{order.title}</span>
              </div>
              <span className="order-chip__price">{order.price}</span>
              {onClearOrder && (
                <button
                  className="order-chip__clear"
                  type="button"
                  onClick={onClearOrder}
                  aria-label={`Remove ${order.title} from this enquiry`}
                >
                  ×
                </button>
              )}
            </div>
          )}
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
            {order ? 'Anything we should know?' : 'What do you need?'}
            <textarea
              name="message"
              rows={4}
              placeholder={
                order
                  ? 'e.g. purchase order number, or the site the pack is for'
                  : 'e.g. assessor coaching for our training team, or supervisor development for a new crew'
              }
            />
          </label>
          <button className="pill pill--light" type="submit">
            {order ? 'Send order request' : 'Send enquiry'}
          </button>
          {order && (
            <p className="contact-form__terms">
              We&rsquo;ll email an invoice with our bank details. The files are
              sent as soon as payment clears.
            </p>
          )}
          {sent && (
            <p className="contact-form__sent" role="status">
              Your email client should have opened with the{' '}
              {order ? 'order request' : 'enquiry'} ready to send. If not, email
              us directly at {ENQUIRY_EMAIL}.
            </p>
          )}
        </form>
      </div>
    </section>
  )
}
