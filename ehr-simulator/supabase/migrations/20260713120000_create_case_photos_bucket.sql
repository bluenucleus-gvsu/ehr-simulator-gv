-- Case profile photo uploads: bucket + RLS restricted to admin/faculty roles.
--
-- NOTE: this bucket is public=true, and the app reads photos via getPublicUrl(),
-- which is served through Storage's unauthenticated public endpoint. That path
-- bypasses RLS on storage.objects entirely, so the "authenticated can read"
-- SELECT policy below does not gate photo viewing -- anyone with a photo's URL
-- can view it without auth. Upload paths use a random UUID (no original
-- filename), so URLs aren't guessable, but they are not access-controlled.
-- Accepted tradeoff for now since these are simulation case photos, not real
-- patient PHI. If that changes, switch the bucket to public=false and serve
-- reads via short-lived signed URLs (createSignedUrl) instead of getPublicUrl().

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'case-profile-photos',
  'case-profile-photos',
  true,
  5242880, -- 5 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

create policy "case-profile-photos: admin/faculty can upload"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'case-profile-photos'
  and exists (
    select 1 from public.users
    where id = auth.uid()
      and role in ('admin', 'faculty')
  )
);

create policy "case-profile-photos: admin/faculty can update"
on storage.objects for update
to authenticated
using (
  bucket_id = 'case-profile-photos'
  and exists (
    select 1 from public.users
    where id = auth.uid()
      and role in ('admin', 'faculty')
  )
)
with check (
  bucket_id = 'case-profile-photos'
  and exists (
    select 1 from public.users
    where id = auth.uid()
      and role in ('admin', 'faculty')
  )
);

create policy "case-profile-photos: admin/faculty can delete"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'case-profile-photos'
  and exists (
    select 1 from public.users
    where id = auth.uid()
      and role in ('admin', 'faculty')
  )
);

create policy "case-profile-photos: authenticated can read"
on storage.objects for select
to authenticated
using (bucket_id = 'case-profile-photos');

-- URL of the uploaded case profile photo (case-profile-photos bucket)
ALTER TABLE public.cases
  ADD COLUMN IF NOT EXISTS case_photo_url text;

-- Per-session override of cases.case_photo_url (case-profile-photos bucket).
-- Null means the session falls back to the case's default photo.
ALTER TABLE public.case_sessions
  ADD COLUMN IF NOT EXISTS case_photo_url text;
