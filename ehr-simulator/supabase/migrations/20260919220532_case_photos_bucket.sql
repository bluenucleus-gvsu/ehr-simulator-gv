-- Case profile photo uploads: bucket + RLS restricted to admin/faculty roles.
--
-- NOTE: this bucket is public=true, and the app reads photos via getPublicUrl(),
-- which is served through Storage's unauthenticated public endpoint. Anyone
-- with a photo's URL can view it without auth. This is fine because they belong 
-- to simulated patients.

-- URL of an uploaded case profile photo is stored on the case it belongs to
ALTER TABLE public.cases
  ADD COLUMN IF NOT EXISTS case_photo_url text;

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