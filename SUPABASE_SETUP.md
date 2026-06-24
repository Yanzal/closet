# Supabase setup (invite-only auth + per-user sync)

This gives you: a public app gated by a login screen, **accounts you create yourself** (no public
sign-up), per-user data isolation (Row-Level Security), and image storage. Free tier is plenty for 2 users.

## 1. Create the project
1. Sign up at <https://supabase.com> → **New project** (no card needed). Pick a region near you.
2. **Project Settings → API** → copy the **Project URL** and the **anon public** key.
   Paste both to Claude (safe to share — they're public client keys; RLS protects the data).

## 2. Lock sign-ups to invite-only
**Authentication → Sign In / Providers** (or **Settings**) → turn **OFF** "Allow new users to sign up".
Now only you can create users.

## 3. Add your users
**Authentication → Users → Add user** → set email + password → give them to each person.
(Untick "send confirmation email" so the account is usable immediately.)

## 4. Create the schema
**SQL Editor → New query** → paste all of this → **Run**:

```sql
-- One row per signed-in user for profile + app settings.
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  name text default '',
  settings jsonb default '{}'::jsonb,
  updated_at timestamptz default now()
);

-- The wardrobe data. Each collection uses the app's string ids (e.g. it_..., out_...).
-- Per-row jsonb payload keeps it 1:1 with the app's TypeScript types — no migrations when the model grows.
create table public.items      (id text, user_id uuid not null default auth.uid() references auth.users on delete cascade, data jsonb not null, updated_at timestamptz default now(), primary key (user_id, id));
create table public.collections(id text, user_id uuid not null default auth.uid() references auth.users on delete cascade, data jsonb not null, updated_at timestamptz default now(), primary key (user_id, id));
create table public.outfits    (id text, user_id uuid not null default auth.uid() references auth.users on delete cascade, data jsonb not null, updated_at timestamptz default now(), primary key (user_id, id));
create table public.calendar   (id text, user_id uuid not null default auth.uid() references auth.users on delete cascade, data jsonb not null, updated_at timestamptz default now(), primary key (user_id, id));
create table public.trips      (id text, user_id uuid not null default auth.uid() references auth.users on delete cascade, data jsonb not null, updated_at timestamptz default now(), primary key (user_id, id));

-- Turn on Row-Level Security so users only ever see their own rows.
alter table public.profiles    enable row level security;
alter table public.items       enable row level security;
alter table public.collections enable row level security;
alter table public.outfits     enable row level security;
alter table public.calendar    enable row level security;
alter table public.trips       enable row level security;

-- Profiles: you can read/write only your own.
create policy "own profile" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);

-- Wardrobe tables: identical "owner only" policy on each.
create policy "own rows" on public.items       for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows" on public.collections for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows" on public.outfits     for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows" on public.calendar    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows" on public.trips       for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Auto-create a profile row the first time a user signs in.
create function public.handle_new_user() returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id) values (new.id) on conflict do nothing;
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();
```

## 5. Create the image bucket
**Storage → New bucket** → name `closet` → **Private**. Then **SQL Editor → Run**:

```sql
-- Each user can read/write only files under a folder named after their user id: closet/<uid>/...
create policy "own files read"   on storage.objects for select using (bucket_id = 'closet' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "own files write"  on storage.objects for insert with check (bucket_id = 'closet' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "own files update" on storage.objects for update using (bucket_id = 'closet' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "own files delete" on storage.objects for delete using (bucket_id = 'closet' and (storage.foldername(name))[1] = auth.uid()::text);
```

## 6. Hand the keys to Claude
Once you've pasted the **Project URL** + **anon key**, Claude wires the login screen, sync, and image
upload. For the GitHub Pages build, these get added as repo **Variables** (Settings → Secrets and
variables → Actions → Variables): `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
