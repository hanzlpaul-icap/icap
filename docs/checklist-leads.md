# Free-checklist leads

When someone downloads the free assessment checklist, the site asks for their
name, company and email (phone optional, plus a "send me updates" tick box).
The download starts the moment they submit. At the same time,
`api/checklist-lead.ts` emails their details to ICAP:

    Subject: Checklist download: Jane Smith, Acme Mining

    Name:      Jane Smith
    Company:   Acme Mining
    Email:     jane@acme.com.au
    Phone:     0400 000 000
    Updates:   Yes, ticked "send me updates"

    Received:  Saturday, 10 October 2026 at 10:59 am (Perth time)

Reply-To is set to the visitor, so pressing Reply writes to them.

The email is sent through ICAP's own Microsoft 365, from and to
`phanzl@icapaustralia.com.au`. No other service sees the details.

## One-time setup

About fifteen minutes, signed in as the Microsoft 365 admin. Until it is done
the form still works and visitors still get the checklist — the details just
aren't delivered.

**1. Register the website as an app in Microsoft Entra**

- Go to **entra.microsoft.com** and open **App registrations** (type it into
  the search bar at the top if the menu looks different).
- **New registration**. Name: `ICAP website - checklist leads`. Account type:
  *this organisational directory only*. Leave the redirect URI empty.
  **Register**.
- On the overview page, copy the **Application (client) ID** and the
  **Directory (tenant) ID**.

**2. Allow it to send mail**

- **API permissions** → **Add a permission** → **Microsoft Graph** →
  **Application permissions** → tick **Mail.Send** → **Add permissions**.
- Click **Grant admin consent for ICAP Australia** → **Yes**. The status
  column should show a green tick.

**3. Create a secret**

- **Certificates & secrets** → **Client secrets** → **New client secret**.
  Description: `Vercel`. Expires: 24 months. **Add**.
- Copy the **Value** straight away — it is only shown once. (Not the
  "Secret ID" next to it.)
- Put the expiry date in your calendar, a few weeks early. When the secret
  expires, leads stop arriving. Visitors still get the checklist, so nothing
  on the site will look wrong.

**4. Give the values to Vercel**

- vercel.com → the **icap** project → **Settings** → **Environment Variables**.
- Add these four, ticking both **Production** and **Preview**:

  | Name | Value |
  |---|---|
  | `M365_TENANT_ID` | Directory (tenant) ID from step 1 |
  | `M365_CLIENT_ID` | Application (client) ID from step 1 |
  | `M365_CLIENT_SECRET` | the secret Value from step 3 — mark it **Sensitive** |
  | `LEAD_MAILBOX` | `phanzl@icapaustralia.com.au` |

- Redeploy: **Deployments** → the latest one → **⋯** → **Redeploy**. New
  variables only reach deployments made after they were added.

**5. Test it**

On the preview site, download the checklist using your own details. An email
headed "Checklist download: ..." should arrive within a minute.

## If leads stop arriving

Vercel → the icap project → **Logs**, and search for `checklist-lead`.

| Log says | Meaning |
|---|---|
| `not configured` | one of the four variables is missing |
| `token 401` or `token 400` | the secret has expired or was copied wrong — make a new one (step 3) |
| `sendMail 403` | admin consent for Mail.Send is missing (step 2) |
| `rejected (bot or incomplete)` | a bot filled in the hidden field, or a request arrived without a name, company or valid email. Not a fault. |

A lead that failed to send is printed in full on the same log line, so it can
be recovered by hand. Vercel only keeps these logs briefly on the Hobby plan,
so check soon after noticing.

## Worth knowing

- **Only send marketing to people who ticked the box.** Their email will say
  `Updates: Yes`. The Spam Act 2003 requires consent for marketing email, and
  every marketing email needs a way to unsubscribe. Replying personally about
  the checklist they downloaded is a different thing from adding them to a
  mailing list.
- **The checklist is still at a public address**
  (`/downloads/icap-assessment-checklist.pdf`). The form asks politely; it does
  not lock the file. Someone who already has the link can still use it.
- **Mail.Send lets the app send as any mailbox in the Microsoft 365 account.**
  With one mailbox that is only yours. If staff mailboxes are added later,
  restrict it to `phanzl@` with an Exchange application access policy.
