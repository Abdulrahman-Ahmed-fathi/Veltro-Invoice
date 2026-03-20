import { createClient } from '@supabase/supabase-js'



/*
SQL SCHEMA (Run this in Supabase SQL Editor)

create extension if not exists pgcrypto;

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  company text,
  address text,
  total_invoiced numeric default 0,
  created_at timestamptz default now()
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('invoice', 'quotation')),
  number text not null,
  status text not null check (status in ('draft', 'sent', 'paid', 'accepted', 'declined')),
  issue_date date not null,
  due_date date not null,
  currency text not null,
  sender_name text not null,
  sender_email text not null,
  sender_phone text,
  sender_address text,
  sender_logo_url text,
  client_id uuid references public.clients(id) on delete set null,
  client_name text not null,
  client_email text,
  client_phone text,
  client_address text,
  line_items jsonb not null default '[]'::jsonb,
  subtotal numeric not null default 0,
  discount_type text not null default 'percent' check (discount_type in ('percent', 'fixed')),
  discount_value numeric not null default 0,
  tax_label text not null default 'Tax',
  tax_type text not null default 'percent' check (tax_type in ('percent', 'fixed')),
  tax_value numeric not null default 0,
  grand_total numeric not null default 0,
  notes text,
  terms text,
  payment_info text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_invoices_user_created on public.invoices(user_id, created_at desc);
create index if not exists idx_invoices_user_status on public.invoices(user_id, status);
create index if not exists idx_clients_user_name on public.clients(user_id, name);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_invoices_updated_at on public.invoices;
create trigger trg_invoices_updated_at
before update on public.invoices
for each row execute function public.set_updated_at();

alter table public.clients enable row level security;
alter table public.invoices enable row level security;

drop policy if exists clients_select on public.clients;
create policy clients_select on public.clients for select using (auth.uid() = user_id);
drop policy if exists clients_insert on public.clients;
create policy clients_insert on public.clients for insert with check (auth.uid() = user_id);
drop policy if exists clients_update on public.clients;
create policy clients_update on public.clients for update using (auth.uid() = user_id);
drop policy if exists clients_delete on public.clients;
create policy clients_delete on public.clients for delete using (auth.uid() = user_id);

drop policy if exists invoices_select on public.invoices;
create policy invoices_select on public.invoices for select using (auth.uid() = user_id);
drop policy if exists invoices_insert on public.invoices;
create policy invoices_insert on public.invoices for insert with check (auth.uid() = user_id);
drop policy if exists invoices_update on public.invoices;
create policy invoices_update on public.invoices for update using (auth.uid() = user_id);
drop policy if exists invoices_delete on public.invoices;
create policy invoices_delete on public.invoices for delete using (auth.uid() = user_id);
*/

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
