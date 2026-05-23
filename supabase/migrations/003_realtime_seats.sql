do $$
begin
  alter table public.seats replica identity full;
exception
  when others then
    null;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'seats'
  ) then
    alter publication supabase_realtime add table public.seats;
  end if;
exception
  when others then
    null;
end $$;
