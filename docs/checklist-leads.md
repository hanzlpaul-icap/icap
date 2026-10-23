# Free-checklist leads

When someone downloads the free assessment checklist, the site asks for their
name, company and email (phone optional, plus a "send me updates" tick box).
The download starts the moment they submit. At the same time,
`api/checklist-lead.ts` does two things with their details:

1. **Saves them to the database.** Each download is a row in the
   `checklist_leads` table in ICAP's Supabase project. This is the permanent
   record: every lead, in one place, exportable to a spreadsheet.
2. **Emails them to ICAP**, so you hear about it straight away:

        Subject: Checklist download: Jane Smith, Acme Mining

        Name:      Jane Smith
        Company:   Acme Mining
        Email:     jane@acme.com.au
        Phone:     0400 000 000
        Updates:   Yes, ticked "send me updates"

        Received:  Saturday, 10 October 2026 at 10:59 am (Perth time)

   Reply-To is set to the visitor, so pressing Reply writes to them. The email
   is sent through ICAP's own Microsoft 365, from and to
   `phanzl@icapaustralia.com.au`.

The two are independent. If the email is not set up, or fails, the lead is
still saved, and the other way round. Visitors get the checklist either way.

No service other than Supabase and Microsoft 365 sees the details.

## Seeing your leads

supabase.com → the ICAP project → **Table Editor** → **checklist_leads**.

| Column | Holds |
|---|---|
| `created_at` | when they downloaded it (shown in UTC; Perth is UTC+8) |
| `name`, `company`, `email` | always filled in |
| `phone` | empty if they left it out |
| `wants_updates` | `true` if they ticked "send me updates" |

- **To get a spreadsheet:** Table Editor → **Export** → **Export to CSV**.
- **To list only people who may receive marketing:** add a filter
  `wants_updates` *equals* `true`.
- **If someone asks you to delete their details:** find their row, tick it,
  **Delete**. Also delete their notification email.

The same person downloading twice makes two rows. That is deliberate: each row
is one download.

## One-time setup: the database

About five minutes. Until both steps are done, leads are not saved (they are
still emailed, if that part is set up).

**1. Create the table**

- supabase.com → sign in → open the ICAP project.
- **SQL Editor** → **New query**.
- Paste in the whole of `supabase/migrations/20261023090000_checklist_leads.sql`
  from this repo and press **Run**. It should say *Success. No rows returned*.
- **Table Editor** now lists `checklist_leads`. It is safe to run the SQL again
  if you are unsure whether it worked.

The table is locked to the website: the public API key that Supabase hands out
cannot read or write it. Only the secret key in step 2 can.

**2. Give Vercel the database's address and secret key**

The easiest way, with nothing to copy and paste, is Supabase's Vercel
integration:

- Supabase → **Project Settings** → **Integrations** → **Vercel** → connect it,
  and pick the **icap** Vercel project.
- This adds `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (among others) to
  the Vercel project. The website uses those two.

Or add them by hand:

- Supabase → **Project Settings** → **API Keys** → **Secret keys**. Copy the
  secret key (it starts `sb_secret_`). Do **not** use the publishable key.
- vercel.com → the **icap** project → **Settings** → **Environment Variables**.
  Add these two, ticking both **Production** and **Preview**:

  | Name | Value |
  |---|---|
  | `SUPABASE_URL` | `https://qhoprfrnyjbiztdqomao.supabase.co` |
  | `SUPABASE_SECRET_KEY` | the secret key — mark it **Sensitive** |

Either way, then redeploy: **Deployments** → the latest one → **⋯** →
**Redeploy**. New variables only reach deployments made after they were added.

**3. Test it**

On the preview site, download the checklist using your own details. A row
should appear in **checklist_leads** within a few seconds (press **Refresh** in
the Table Editor).

## One-time setup: the email

About fifteen minutes, signed in as the Microsoft 365 admin. Until it is done
the form still works, visitors still get the checklist, and leads are still
saved to the database. You just are not emailed about them.

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
  expires, the emails stop. Leads are still saved and visitors still get the
  checklist, so nothing on the site will look wrong.

**4. Give the values to Vercel**

- vercel.com → the **icap** project → **Settings** → **Environment Variables**.
- Add these four, ticking both **Production** and **Preview**:

  | Name | Value |
  |---|---|
  | `M365_TENANT_ID` | Directory (tenant) ID from step 1 |
  | `M365_CLIENT_ID` | Application (client) ID from step 1 |
  | `M365_CLIENT_SECRET` | the secret Value from step 3 — mark it **Sensitive** |
  | `LEAD_MAILBOX` | `phanzl@icapaustralia.com.au` |

- Redeploy: **Deployments** → the latest one → **⋯** → **Redeploy**.

**5. Test it**

On the preview site, download the checklist using your own details. An email
headed "Checklist download: ..." should arrive within a minute.

## If leads stop arriving

Vercel → the icap project → **Logs**, and search for `checklist-lead`.

| Log says | Meaning |
|---|---|
| `not saved` … `not configured` | `SUPABASE_URL` or the secret key is missing from Vercel (database step 2) |
| `not saved` … `insert 404` | the table has not been created (database step 1) |
| `not saved` … `insert 401` | the secret key is wrong or was deleted in Supabase — copy it again |
| `not saved` … `insert 403` | the publishable key was used instead of the secret key |
| `not saved` … `insert 5xx` or `timeout` | the Supabase project is paused or down — see below |
| `not emailed` … `not configured` | one of the four M365/LEAD_MAILBOX variables is missing |
| `not emailed` … `token 401` or `token 400` | the Microsoft secret has expired or was copied wrong — make a new one (email step 3) |
| `not emailed` … `sendMail 403` | admin consent for Mail.Send is missing (email step 2) |
| `rejected (bot or incomplete)` | a bot filled in the hidden field, or a request arrived without a name, company or valid email. Not a fault. |

A lead that failed is printed in full on the same log line, so it can be
recovered by hand. Vercel only keeps these logs briefly on the Hobby plan, so
check soon after noticing.

## Worth knowing

- **Only send marketing to people who ticked the box** (`wants_updates` is
  `true`, or the email says `Updates: Yes`). The Spam Act 2003 requires consent
  for marketing email, and every marketing email needs a way to unsubscribe.
  Replying personally about the checklist they downloaded is a different thing
  from adding them to a mailing list.
- **Supabase pauses free-plan projects after about a week with no activity.**
  If nobody downloads the checklist for a while, the next lead may fail to save
  (it is still emailed, and logged). Supabase emails a warning first; restore
  the project from its dashboard. Upgrading the project to a paid plan stops
  this.
- **The checklist is still at a public address**
  (`/downloads/icap-assessment-checklist.pdf`). The form asks politely; it does
  not lock the file. Someone who already has the link can still use it.
- **Mail.Send lets the app send as any mailbox in the Microsoft 365 account.**
  With one mailbox that is only yours. If staff mailboxes are added later,
  restrict it to `phanzl@` with an Exchange application access policy.
