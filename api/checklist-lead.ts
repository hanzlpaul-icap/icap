/**
 * Free-checklist leads. The site posts the visitor's details here as the
 * download starts. This saves them to the checklist_leads table in Supabase,
 * and emails them to ICAP through Microsoft 365 with Reply-To set to the
 * visitor so following up is one click. The two are independent: either one
 * failing does not stop the other.
 *
 * Environment variables in Vercel, for Preview and Production:
 *   SUPABASE_URL, SUPABASE_SECRET_KEY                     the database
 *   M365_TENANT_ID, M365_CLIENT_ID, M365_CLIENT_SECRET   the app registration
 *   LEAD_MAILBOX                                          phanzl@icapaustralia.com.au
 * SUPABASE_SERVICE_ROLE_KEY is accepted in place of SUPABASE_SECRET_KEY; the
 * Supabase integration for Vercel sets it. Setup is in docs/checklist-leads.md.
 *
 * The visitor already has the file by the time this runs, so no outcome here
 * may reach them: every request is answered 204, and failures go to the
 * function log instead.
 */

// Vercel's Node runtime provides process.env. Declared here rather than adding
// @types/node, which would also bring Node's globals into the browser code.
declare const process: { env: Record<string, string | undefined> }

type Lead = {
  name: string
  email: string
  company: string
  phone: string
  updates: boolean
}

const EMAIL = /^[^\s@<>()",;:]+@[^\s@<>()",;:]+\.[a-z]{2,}$/i

// One line, trimmed and bounded: these values land in an email subject.
const field = (value: string | null, max: number) =>
  (value ?? '').replace(/[\u0000-\u001f\u007f]+/g, ' ').trim().slice(0, max)

function parse(params: URLSearchParams): Lead | null {
  // A field people never see. Anything that fills it in is a bot.
  if (params.get('website')) return null
  const lead = {
    name: field(params.get('name'), 100),
    email: field(params.get('email'), 254),
    company: field(params.get('company'), 150),
    phone: field(params.get('phone'), 40),
    updates: params.get('updates') === 'yes',
  }
  if (!lead.name || !lead.company || !EMAIL.test(lead.email)) return null
  return lead
}

function compose(lead: Lead): string {
  const received = new Intl.DateTimeFormat('en-AU', {
    timeZone: 'Australia/Perth',
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(new Date())
  return [
    'Someone downloaded the free assessment checklist from the website.',
    '',
    `Name:      ${lead.name}`,
    `Company:   ${lead.company}`,
    `Email:     ${lead.email}`,
    `Phone:     ${lead.phone || 'not given'}`,
    `Updates:   ${
      lead.updates
        ? 'Yes, ticked "send me updates"'
        : 'No, did not tick "send me updates"'
    }`,
    '',
    `Received:  ${received} (Perth time)`,
    '',
    'Reply to this email to write to them directly.',
  ].join('\n')
}

async function store(lead: Lead): Promise<void> {
  const url = process.env.SUPABASE_URL
  const key =
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('not configured: SUPABASE_URL and SUPABASE_SECRET_KEY must both be set')
  }

  const saved = await fetch(`${url.replace(/\/+$/, '')}/rest/v1/checklist_leads`, {
    method: 'POST',
    headers: {
      apikey: key,
      // A legacy service_role key is a JWT and goes in Authorization too. The
      // newer sb_secret_ keys are not JWTs and go in apikey alone.
      ...(key.startsWith('sb_') ? {} : { Authorization: `Bearer ${key}` }),
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      name: lead.name,
      company: lead.company,
      email: lead.email,
      phone: lead.phone || null,
      wants_updates: lead.updates,
    }),
    signal: AbortSignal.timeout(8000),
  })
  if (saved.status !== 201) {
    throw new Error(`insert ${saved.status}: ${await saved.text()}`)
  }
}

async function notify(lead: Lead): Promise<void> {
  const {
    M365_TENANT_ID: tenant,
    M365_CLIENT_ID: clientId,
    M365_CLIENT_SECRET: secret,
    LEAD_MAILBOX: mailbox,
  } = process.env
  if (!tenant || !clientId || !secret || !mailbox) {
    throw new Error('not configured: M365_* and LEAD_MAILBOX must all be set')
  }

  const auth = await fetch(
    `https://login.microsoftonline.com/${encodeURIComponent(tenant)}/oauth2/v2.0/token`,
    {
      method: 'POST',
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: secret,
        scope: 'https://graph.microsoft.com/.default',
        grant_type: 'client_credentials',
      }),
      signal: AbortSignal.timeout(8000),
    },
  )
  if (!auth.ok) throw new Error(`token ${auth.status}: ${await auth.text()}`)
  const { access_token } = (await auth.json()) as { access_token: string }

  const sent = await fetch(
    `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(mailbox)}/sendMail`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: {
          subject: `Checklist download: ${lead.name}, ${lead.company}`,
          body: { contentType: 'Text', content: compose(lead) },
          toRecipients: [{ emailAddress: { address: mailbox } }],
          replyTo: [{ emailAddress: { address: lead.email, name: lead.name } }],
        },
        saveToSentItems: false,
      }),
      signal: AbortSignal.timeout(8000),
    },
  )
  if (sent.status !== 202) {
    throw new Error(`sendMail ${sent.status}: ${await sent.text()}`)
  }
}

export async function POST(request: Request): Promise<Response> {
  const lead = parse(new URLSearchParams(await request.text().catch(() => '')))
  if (!lead) {
    console.warn('checklist-lead: rejected (bot or incomplete)')
    return new Response(null, { status: 204 })
  }

  const [saved, emailed] = await Promise.allSettled([store(lead), notify(lead)])
  // The lead goes in the log with each failure, so it can still be recovered
  // by hand.
  if (saved.status === 'rejected') {
    console.error('checklist-lead: not saved', saved.reason, JSON.stringify(lead))
  }
  if (emailed.status === 'rejected') {
    console.error('checklist-lead: not emailed', emailed.reason, JSON.stringify(lead))
  }
  return new Response(null, { status: 204 })
}
