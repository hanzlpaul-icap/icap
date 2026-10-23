-- Everyone who downloads the free assessment checklist, one row per download.
--
-- Written only by api/checklist-lead.ts, using the secret key. Row level
-- security is on with no policies, and the public roles have no grants, so the
-- publishable/anon key can neither read nor write it.
--
-- Safe to run more than once.

create table if not exists public.checklist_leads (
  id            bigint generated always as identity primary key,
  created_at    timestamptz not null default now(),
  name          text not null check (char_length(name) between 1 and 100),
  company       text not null check (char_length(company) between 1 and 150),
  email         text not null check (char_length(email) between 3 and 254),
  phone         text check (char_length(phone) <= 40),
  wants_updates boolean not null default false
);

comment on table public.checklist_leads is
  'Free checklist downloads from the website. One row per download.';
comment on column public.checklist_leads.wants_updates is
  'Ticked "send me updates". Only these people may be sent marketing email (Spam Act 2003).';

alter table public.checklist_leads enable row level security;

revoke all on public.checklist_leads from anon, authenticated;
