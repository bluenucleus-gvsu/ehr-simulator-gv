-- Case profile photo uploads: bucket + RLS restricted to admin/faculty roles.

insert into storage.buckets (id, name, public)
values ('case-photos', 'case-photos', true)
on conflict (id) do nothing;

create policy "case-photos: admin/faculty can upload"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'case-photos'
  and exists (
    select 1 from public.users
    where id = auth.uid()
      and role in ('admin', 'faculty')
  )
);

create policy "case-photos: admin/faculty can update"
on storage.objects for update
to authenticated
using (
  bucket_id = 'case-photos'
  and exists (
    select 1 from public.users
    where id = auth.uid()
      and role in ('admin', 'faculty')
  )
)
with check (
  bucket_id = 'case-photos'
  and exists (
    select 1 from public.users
    where id = auth.uid()
      and role in ('admin', 'faculty')
  )
);

create policy "case-photos: admin/faculty can delete"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'case-photos'
  and exists (
    select 1 from public.users
    where id = auth.uid()
      and role in ('admin', 'faculty')
  )
);

create policy "case-photos: authenticated can read"
on storage.objects for select
to authenticated
using (bucket_id = 'case-photos');
